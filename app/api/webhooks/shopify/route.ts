import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import { prisma } from "@/lib/prisma";
import { createAndPayInvoice, getCustomerDefaultPaymentMethod } from "@/lib/stripe";
import { sendOrderPaymentNotification } from "@/lib/email";

interface ShopifyOrderItem {
  variant_id: number;
  product_id: number;
  title: string;
  quantity: number;
  price: string;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  email: string;
  created_at: string;
  currency: string;
  total_price: string;
  line_items: ShopifyOrderItem[];
  customer?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone?: string;
  };
  shipping_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    country_code?: string;
    phone?: string;
  };
}

type StripeItem = {
  type: "PRODUCT" | "SHIPPING";
  productId?: number;
  quantity: number;
  unitPriceCents?: number;
  totalCents?: number;
  title: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const hmac = request.headers.get("X-Shopify-Hmac-Sha256");
    const topic = request.headers.get("X-Shopify-Topic");
    const shop = request.headers.get("X-Shopify-Shop-Domain");

    console.log("Shopify webhook received:", { shop, topic });

    // Verify webhook is from Shopify
    const isValid = await shopify.webhooks.validate({
      rawBody: body,
      rawRequest: hmac,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
    }

    // Only process order creation webhooks
    if (topic !== "orders/create") {
      console.log("Ignoring webhook topic:", topic);
      return NextResponse.json({ success: true });
    }

    const shopifyOrder: ShopifyOrder = JSON.parse(body);
    console.log("Processing Shopify order:", shopifyOrder.order_number, shopifyOrder.id);

    console.log("-------------------- JSON.stringify(shopifyOrder, null, 2) --------------------");
    console.log(JSON.stringify(shopifyOrder, null, 2));

    // Find the Shopify store owner
    const shopifyStore = await prisma.shopifyStore.findUnique({
      where: { shop: shop || "" },
      include: { user: true },
    });

    if (!shopifyStore) {
      console.error("Shopify store not found:", shop);
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Check if order already exists (prevent duplicates)
    const existingOrder = await prisma.order.findUnique({
      where: {
        shopifyOrderId: shopifyOrder.id.toString(),
      },
    });

    if (existingOrder) {
      console.log("Order already exists:", shopifyOrder.id);
      return NextResponse.json({ success: true });
    }

    // Get shipping country from shipping address
    const shippingCountryCode = shopifyOrder.shipping_address?.country_code?.toLocaleLowerCase();
    console.log("Shipping country:", shippingCountryCode);

    // If no shipping address is provided, we'll skip shipping validation
    if (!shippingCountryCode) {
      console.log("No shipping address provided - skipping shipping cost calculation");
    }

    // Process line items and check for WinWaterfall mappings
    const validOrderItems = [];
    const stripeItems: StripeItem[] = []; // Combined array for product and shipping items
    let totalCents = 0;
    let hasUnsupportedShipping = false;

    for (const lineItem of shopifyOrder.line_items) {
      // Check if this Shopify variant is mapped to our products
      const variantMapping = await prisma.variantMapping.findFirst({
        where: {
          shopifyVariantId: lineItem.variant_id.toString(),
          userId: shopifyStore.userId,
        },
        include: {
          variant: {
            include: {
              product: {
                include: {
                  translations: {
                    where: { locale: "en" },
                    select: { title: true, description: true },
                  },
                  media: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                  },
                  productShippingZones: {
                    include: {
                      zone: {
                        include: {
                          countries: true,
                        },
                      },
                      productShippingRules: {
                        orderBy: { minQuantity: "asc" },
                      },
                    },
                  },
                },
              },
              options: {
                include: {
                  option: true,
                  value: true,
                },
              },
            },
          },
          product: {
            include: {
              translations: {
                where: { locale: "en" },
                select: { title: true, description: true },
              },
              media: {
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
              productShippingZones: {
                include: {
                  zone: {
                    include: {
                      countries: true,
                    },
                  },
                  productShippingRules: {
                    orderBy: { minQuantity: "asc" },
                  },
                },
              },
            },
          },
        },
      });

      if (variantMapping) {
        const price = variantMapping.variant?.price || 0;
        const unitPriceCents = Math.round(price * 100);
        const itemTotal = unitPriceCents * lineItem.quantity;
        totalCents += itemTotal;

        // Use product data from mapping
        const productTranslation = variantMapping.product.translations[0];
        const productTitle = productTranslation?.title || lineItem.title;
        const productDescription = productTranslation?.description || null;
        const productSku = variantMapping.variant?.sku || variantMapping.product.sku || null;

        // Get variant options
        const variantOptions: Record<string, string> = {};
        if (variantMapping.variant?.options) {
          variantMapping.variant.options.forEach((optionValue) => {
            variantOptions[optionValue.option.name] = optionValue.value.value;
          });
        }

        // Get product for shipping calculation
        const product = variantMapping.variant?.product || variantMapping.product;
        let shippingCents = 0;
        let shippingSupported = false;

        // Check if shipping to destination country is supported
        if (shippingCountryCode && product.productShippingZones && product.productShippingZones.length > 0) {
          for (const productShippingZone of product.productShippingZones) {
            // Check if this shipping zone supports the destination country
            const countrySupported = productShippingZone.zone.countries.some(
              (country) => country.countryCode === shippingCountryCode
            );

            if (countrySupported) {
              shippingSupported = true;

              // Find applicable shipping rule based on quantity
              const applicableRule = productShippingZone.productShippingRules.find(
                (rule) =>
                  (!rule.minQuantity || lineItem.quantity >= rule.minQuantity) &&
                  (!rule.maxQuantity || lineItem.quantity <= rule.maxQuantity)
              );

              if (applicableRule) {
                shippingCents = applicableRule.price * 100;
                console.log(`Shipping cost for ${productTitle}: ${shippingCents} cents (total shipping cost)`);

                // Shipping info will be added to stripeItems after the product item

                totalCents += shippingCents;
              } else {
                console.log(`No shipping rule found for quantity ${lineItem.quantity} for product: ${productTitle}`);
              }
              break;
            }
          }

          // If shipping country is provided but not supported, mark as unsupported
          if (!shippingSupported) {
            console.log(`Shipping to ${shippingCountryCode} not supported for product: ${productTitle}`);
            hasUnsupportedShipping = true;
          }
        } else if (
          shippingCountryCode &&
          (!product.productShippingZones || product.productShippingZones.length === 0)
        ) {
          // Product has no shipping zones configured - allow order but with warning
          console.log(`Product ${productTitle} has no shipping zones configured - proceeding with zero shipping cost`);
          shippingSupported = true; // Don't mark as unsupported if no zones are configured
        }

        // Get image data
        const firstMedia = variantMapping.product.media[0];
        const imageUrl = firstMedia?.type === "IMAGE" ? firstMedia?.url : firstMedia?.poster || null;
        const imageAlt = firstMedia?.alt || null;

        const orderItem = {
          productId: variantMapping.productId,
          variantId: variantMapping.variantId,
          quantity: lineItem.quantity,
          unitPriceCents,
          shippingCents,
          title: lineItem.title,
          productTitle,
          productDescription,
          productSku,
          variantOptions: Object.keys(variantOptions).length > 0 ? variantOptions : null,
          imageUrl,
          imageAlt,
          shopifyVariantId: lineItem.variant_id.toString(),
          shopifyProductId: lineItem.product_id.toString(),
        };

        validOrderItems.push(orderItem);

        // Add product item to stripe items
        stripeItems.push({
          type: "PRODUCT",
          productId: variantMapping.productId,
          quantity: lineItem.quantity,
          unitPriceCents,
          title: lineItem.title,
        });

        // Add shipping item right after the product item if shipping applies
        if (shippingCents > 0) {
          stripeItems.push({
            type: "SHIPPING",
            quantity: 1,
            unitPriceCents: shippingCents,
            totalCents: shippingCents,
            title: `Shipping - ${productTitle}`,
          });
        }
      }
    }

    // If no valid items found, skip order creation
    if (validOrderItems.length === 0) {
      console.log("No WinWaterfall items found in Shopify order");
      return NextResponse.json({ success: true });
    }

    // Determine order status based on shipping support
    const orderStatus = hasUnsupportedShipping ? "INVALID" : "UNPAID";

    // Prepare delivery information
    const shippingAddress = shopifyOrder.shipping_address;

    // Create order in our system
    const order = await prisma.order.create({
      data: {
        orderNumber: shopifyOrder.order_number?.toString(),
        userId: shopifyStore.userId,
        shopifyStoreId: shopifyStore.id,
        totalCents,
        currency: shopifyOrder.currency || "USD",
        status: orderStatus,
        shopifyOrderId: shopifyOrder.id.toString(),
        deliveryName: [shippingAddress?.first_name, shippingAddress?.last_name].filter(Boolean).join(" ") || null,
        deliveryPhone: shippingAddress?.phone || shopifyOrder?.customer?.phone,
        deliveryEmail: shopifyOrder.email,
        deliveryAddress1: shippingAddress?.address1,
        deliveryAddress2: shippingAddress?.address2,
        deliveryCity: shippingAddress?.city,
        deliveryState: shippingAddress?.province,
        deliveryZip: shippingAddress?.zip,
        deliveryCountry: shippingAddress?.country,
        items: {
          create: validOrderItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            shippingCents: item.shippingCents,
            title: item.title,
            productTitle: item.productTitle,
            productDescription: item.productDescription,
            productSku: item.productSku,
            variantOptions: item.variantOptions as any,
            imageUrl: item.imageUrl,
            imageAlt: item.imageAlt,
          })),
        },
      },
      include: {
        items: true,
        user: true,
      },
    });

    console.log("Order created:", order.orderNumber, "Status:", orderStatus);

    // Skip payment processing for invalid orders
    if (hasUnsupportedShipping) {
      console.log("Order marked as INVALID due to unsupported shipping destination");
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        status: "INVALID",
        message: "Order created but shipping to destination country is not supported",
      });
    }

    // Ensure user has Stripe customer ID
    if (!order.user.stripeCustomerId) {
      console.error("User does not have Stripe customer ID");
      // Keep order as PENDING, user will need to set up payment method
      return NextResponse.json({
        success: true,
        message: "Order created but user needs to set up payment method",
      });
    }

    // Get customer's default payment method
    const defaultPaymentMethod = await getCustomerDefaultPaymentMethod(order.user.stripeCustomerId);

    // Create and attempt to pay invoice
    const invoiceResult = await createAndPayInvoice(
      {
        id: order.id,
        shopifyOrderId: shopifyOrder.id.toString(),
        totalCents: order.totalCents,
        currency: order.currency,
        userId: order.userId,
        stripeItems: stripeItems,
      },
      order.user.stripeCustomerId,
      defaultPaymentMethod
    );

    if (invoiceResult.success) {
      console.log("Order invoice created and paid:", order.orderNumber);
    } else {
      console.log("Order invoice created but payment failed:", order.orderNumber);

      // Send payment notification email for failed payments
      const customerName =
        order.user.name ||
        (shopifyOrder.customer
          ? `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`.trim()
          : "Customer");

      const totalAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: order.currency,
      }).format(order.totalCents / 100);

      const paymentUrl =
        invoiceResult.invoice?.hosted_invoice_url || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`;

      await sendOrderPaymentNotification(order.deliveryEmail || order.user.email, {
        customerName,
        orderNumber: order.orderNumber,
        orderDate: new Date(shopifyOrder.created_at).toLocaleDateString(),
        itemCount: validOrderItems.length,
        totalAmount,
        paymentUrl,
      });

      console.log("Payment notification email sent for order:", order.orderNumber);
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      itemsProcessed: validOrderItems.length,
    });
  } catch (error) {
    console.error("Error processing Shopify order webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
