import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";
import { prisma } from "@/lib/prisma";
import { getCurrentTranslation } from "@/lib/products";
import { createShopifyClient } from "@/lib/shopify-client";
import { getMediaUrl } from "@/lib/utils";
import { CategoryTranslation } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const importProductSchema = z.object({
  shopifyStoreId: z.number().int().positive(),
});

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/products/[id]/import-to-shopify">
) {
  const params = await ctx.params;
  try {
    // Check authentication
    const user = await isAuthenticatedServerSide(["USER"], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // const body = await request.json();
    // const { shopifyStoreId } = importProductSchema.parse(body);

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
        productOptions: {
          orderBy: { position: "asc" },
        },
        productVariants: true,
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
      return NextResponse.json(
        { error: "Product already imported to this Shopify store" },
        { status: 409 }
      );
    }

    // Get Shopify store credentials
    const shopifyStore = await prisma.shopifyStore.findUnique({
      where: {
        id: shopifyStoreId,
        userId: user.id,
      },
    });

    if (!shopifyStore) {
      return NextResponse.json(
        { error: "Shopify store not found or access denied" },
        { status: 404 }
      );
    }

    const shopifyClient = createShopifyClient(
      shopifyStore.shop!,
      shopifyStore.accessToken!
    );

    const primaryTranslation = getCurrentTranslation(
      product.translations,
      "en"
    );

    const categoryTranslation = getCurrentTranslation(
      (product.category?.translations as CategoryTranslation[]) || [],
      "en"
    );

    if (!primaryTranslation) {
      return NextResponse.json(
        { error: "No product translations found" },
        { status: 400 }
      );
    }

    // Prepare images for media parameter
    const mediaInput = product.media
      .filter((media) => media.type === "IMAGE")
      .map((media) => ({
        originalSource: media.url?.startsWith("/")
          ? `${process.env.NEXTAUTH_URL}${getMediaUrl(media.url)}`
          : media.url,
        alt: media.alt || primaryTranslation.title,
        mediaContentType: "IMAGE" as const,
      }));

    // Prepare product options in the new format
    const productOptions = product.productOptions.map((option) => ({
      name: option.name,
      values: (option.values as string[]).map((value) => ({ name: value })),
    }));

    // Prepare product data for Shopify GraphQL
    const productData: any = {
      title: primaryTranslation.title,
      descriptionHtml: primaryTranslation.description,
      productType: categoryTranslation?.title,
      vendor: "Product Genius",
      status: product.isActive ? "ACTIVE" : "DRAFT",
      tags: [],
    };

    // Add product options to product data if they exist
    if (productOptions.length > 0) {
      productData.productOptions = productOptions;
    }

    // GraphQL mutation to create product using new 2025-10 API
    const mutation = `
      mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
        productCreate(product: $product, media: $media) {
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
          }
        }
      }
    `;

    const variables = {
      product: productData,
      media: mediaInput.length > 0 ? mediaInput : undefined,
    };

    // Execute GraphQL mutation
    const response = await shopifyClient.post("/graphql.json", {
      query: mutation,
      variables,
    });

    const { data, extensions } = response.data;

    console.log("-------------------- Shopify Extension --------------------");
    console.log(JSON.stringify(extensions, null, 2));
    console.log("-------------------- Shopify Response --------------------");
    console.log(JSON.stringify(data, null, 2));

    if (data.productCreate.userErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Failed to create product in Shopify",
          details: data.productCreate.userErrors,
        },
        { status: 400 }
      );
    }

    const shopifyProduct = data.productCreate.product;
    const shopifyProductId = shopifyProduct.id.replace(
      "gid://shopify/Product/",
      ""
    );

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
    if (shopifyProduct.variants.nodes.length > 0) {
      // Create mappings for all variants created by Shopify
      const variantMappings = [];

      for (const shopifyVariant of shopifyProduct.variants.nodes) {
        // Find matching local variant by comparing option values
        const matchingLocalVariant = product.productVariants.find(
          (localVariant) => {
            // If no options, match the first local variant
            if (product.productOptions.length === 0) {
              return true;
            }

            // Match by option values
            const shopifyOptions = shopifyVariant.selectedOptions;
            return shopifyOptions.every((shopifyOption: any) => {
              const optionName = shopifyOption.name;
              const optionValue = shopifyOption.value;

              // Check if local variant has matching option value
              if (optionName === product.productOptions[0]?.name) {
                return localVariant.option1 === optionValue;
              } else if (optionName === product.productOptions[1]?.name) {
                return localVariant.option2 === optionValue;
              } else if (optionName === product.productOptions[2]?.name) {
                return localVariant.option3 === optionValue;
              }
              return false;
            });
          }
        );

        if (matchingLocalVariant) {
          variantMappings.push({
            userId: user.id,
            variantId: matchingLocalVariant.id,
            productId: product.id,
            shopifyVariantId: shopifyVariant.id.replace(
              "gid://shopify/ProductVariant/",
              ""
            ),
            shopifyProductId,
            shop: shopifyStore.shop!,
            sku: shopifyVariant.sku,
          });
        }
      }

      // Create all variant mappings
      if (variantMappings.length > 0) {
        await prisma.variantMapping.createMany({
          data: variantMappings,
        });
      }

      console.log(
        `Created ${variantMappings.length} variant mappings for product ${product.id}`
      );
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
