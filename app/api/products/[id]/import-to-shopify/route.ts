import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { prisma } from "@/lib/prisma";
import { getCurrentTranslation } from "@/lib/products";
import { createShopifyClient } from "@/lib/shopify-client";
import { getMediaUrl } from "@/lib/utils";
import { CategoryTranslation } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest, ctx: RouteContext<"/api/products/[id]/import-to-shopify">) {
  const params = await ctx.params;
  try {
    // Check authentication
    const user = await isAuthenticatedServerSide(["USER"], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const shopifyStoreId = user?.shopifyStores?.[0]?.id!;

    // Fetch the product with all necessary data
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        translations: true,
        media: {
          orderBy: { sortOrder: "asc" },
        },
        category: {
          include: {
            translations: true,
          },
        },
        options: {
          include: {
            values: {
              orderBy: { position: "asc" },
            },
          },
          orderBy: { position: "asc" },
        },
        variants: {
          include: {
            options: {
              include: {
                option: true,
                value: true,
              },
            },
          },
        },
        productMappings: {
          where: { shopifyStoreId },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is already imported to this store
    if (product.productMappings.length > 0) {
      return NextResponse.json({ error: "Product already imported to this Shopify store" }, { status: 409 });
    }

    // Get Shopify store credentials
    const shopifyStore = await prisma.shopifyStore.findUnique({
      where: {
        id: shopifyStoreId,
        userId: user.id,
      },
    });

    if (!shopifyStore) {
      return NextResponse.json({ error: "Shopify store not found or access denied" }, { status: 404 });
    }

    const shopifyClient = createShopifyClient(shopifyStore.shop!, shopifyStore.accessToken!);

    const primaryTranslation = getCurrentTranslation(product.translations, "en");

    const categoryTranslation = getCurrentTranslation(
      (product.category?.translations as CategoryTranslation[]) || [],
      "en"
    );

    if (!primaryTranslation) {
      return NextResponse.json({ error: "No product translations found" }, { status: 400 });
    }

    // Prepare product options in the new format
    const productOptions = product.options?.length
      ? product.options.map((option, index) => ({
          name: option.name,
          position: index + 1,
          values: option.values.map((value) => ({ name: value.value })),
        }))
      : [
          {
            name: "Title",
            position: 1,
            values: [{ name: "Default Title" }],
          },
        ];

    // Prepare variants data for productSet
    const variants = product.variants.map((variant) => {
      const optionValues = variant.options?.length
        ? variant.options.map((variantOption) => ({
            optionName: variantOption.option.name,
            name: variantOption.value.value,
          }))
        : [
            {
              optionName: "Title",
              name: "Default Title",
            },
          ];

      return {
        optionValues,
        price: (variant?.sellingPrice ?? variant.price * 1.5)?.toString() || "0",
        sku: variant.sku,
      };
    });

    // Prepare product data for productSet (works for both simple and complex products)
    const productSetInput: any = {
      title: primaryTranslation.title,
      descriptionHtml: primaryTranslation.description,
      productType: categoryTranslation?.title,
      vendor: "WinWaterfall",
      status: product.isActive ? "ACTIVE" : "DRAFT",
      tags: [],
    };

    // Add product options if they exist
    if (productOptions.length > 0) {
      productSetInput.productOptions = productOptions;
    }

    // Add variants if they exist
    if (variants.length > 0) {
      productSetInput.variants = variants;
    }

    // Prepare media files
    const filesInput = product.media
      .filter((media) => media?.type === "IMAGE")
      .map((media) => ({
        originalSource: media.url?.startsWith("/") ? `${process.env.NEXTAUTH_URL}${getMediaUrl(media.url)}` : media.url,
        alt: media.alt || primaryTranslation.title,
        contentType: media?.type,
      }));

    // Add media to productSet input if available
    if (filesInput.length > 0) {
      productSetInput.files = filesInput;
    }

    // Always use productSet mutation - it handles both simple and complex products
    const mutation = `
      mutation productSet($input: ProductSetInput!) {
        productSet(input: $input, synchronous: true) {
          product {
            id
            handle
            title
            options {
              id
              name
              position
              optionValues {
                id
                name
                hasVariants
              }
            }
            variants(first: 50) {
              nodes {
                id
                sku
                price
                compareAtPrice
                inventoryQuantity
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const variables = {
      input: productSetInput,
    };

    // Execute GraphQL mutation
    const response = await shopifyClient.post("/graphql.json", {
      query: mutation,
      variables,
    });

    const { data } = response.data;

    console.log("-------------------- Shopify Response --------------------");
    console.log(JSON.stringify(data, null, 2));

    // Handle response from productSet mutation
    const result = data?.productSet;

    if (result?.userErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Failed to create product in Shopify",
          details: result.userErrors,
        },
        { status: 400 }
      );
    }

    const shopifyProduct = result?.product;
    const shopifyProductId = shopifyProduct.id.replace("gid://shopify/Product/", "");

    // Create product mapping
    await prisma.productMapping.create({
      data: {
        userId: user.id,
        productId: product.id,
        shopifyProductId,
        shopifyStoreId,
        shop: shopifyStore.shop!,
      },
    });

    // Handle variant mapping
    if (shopifyProduct.variants.nodes.length > 0 && product.variants.length > 0) {
      // Create mappings for all variants created by Shopify
      const variantMappings = [];

      for (const shopifyVariant of shopifyProduct.variants.nodes) {
        // Find matching local variant by comparing option values
        const matchingLocalVariant = product.variants.find((localVariant) => {
          // If no options, match the first available local variant (default variant)
          if (product.options.length === 0 || localVariant.options.length === 0) {
            return true;
          }

          // Match by option values - ensure all shopify options match local variant options
          const shopifyOptions = shopifyVariant.selectedOptions;
          return (
            shopifyOptions.every((shopifyOption: any) => {
              const optionName = shopifyOption.name;
              const optionValue = shopifyOption.value;

              // Check if local variant has matching option value by looking at variant's options
              return localVariant.options.some((variantOption) => {
                return variantOption.option.name === optionName && variantOption.value.value === optionValue;
              });
            }) && shopifyOptions.length === localVariant.options.length
          );
        });

        if (matchingLocalVariant) {
          variantMappings.push({
            userId: user.id,
            variantId: matchingLocalVariant.id,
            productId: product.id,
            shopifyVariantId: shopifyVariant.id.replace("gid://shopify/ProductVariant/", ""),
            shopifyProductId,
            shopifyStoreId: shopifyStore.id,
            shop: shopifyStore.shop!,
            sku: matchingLocalVariant.sku || shopifyVariant.sku,
          });
        }
      }

      // Create all variant mappings
      if (variantMappings.length > 0) {
        await prisma.variantMapping.createMany({
          data: variantMappings,
        });
      }

      console.log(`Created ${variantMappings.length} variant mappings for product ${product.id}`);
    }

    return NextResponse.json({
      message: "Product successfully imported to Shopify",
      shopifyProduct: {
        id: shopifyProductId,
        handle: shopifyProduct.handle,
        title: shopifyProduct.title,
        url: `https://${shopifyStore.shop}/admin/products/${shopifyProductId}`,
      },
    });
  } catch (error) {
    console.error("Shopify import error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
