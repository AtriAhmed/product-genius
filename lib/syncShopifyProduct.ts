import { prisma } from "@/lib/prisma";
import { createShopifyClient } from "@/lib/shopify-client";

type SyncResult = {
  success: boolean;
  shopifyStoreId: number;
  shopifyProductId: string;
  shop: string;
  error?: string;
};

type SyncProductResult = {
  productId: number;
  results: SyncResult[];
  totalSynced: number;
  totalFailed: number;
};

export async function syncProductToShopify(productId: number): Promise<SyncProductResult> {
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
        include: {
          shopifyStore: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  const results: SyncResult[] = [];

  await Promise.all([
    product.productMappings.map(async (mapping) => {
      try {
        const shopifyStore = mapping.shopifyStore;

        if (!shopifyStore?.shop || !shopifyStore?.accessToken) {
          results.push({
            success: false,
            shopifyStoreId: mapping.shopifyStoreId,
            shopifyProductId: mapping.shopifyProductId,
            shop: mapping.shop,
            error: "Shopify store credentials not found",
          });
          return;
        }

        const shopifyClient = createShopifyClient(shopifyStore.shop, shopifyStore.accessToken);

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

        // Prepare product data for productSet - only updating options and variants
        const productSetInput: any = {
          id: `gid://shopify/Product/${mapping.shopifyProductId}`,
        };

        // Add product options if they exist
        if (productOptions.length > 0) {
          productSetInput.productOptions = productOptions;
        }

        // Add variants if they exist
        if (variants.length > 0) {
          productSetInput.variants = variants;
        }

        // Use productSet mutation to update the product
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

        // Handle response from productSet mutation
        const result = data?.productSet;

        if (result?.userErrors?.length > 0) {
          results.push({
            success: false,
            shopifyStoreId: mapping.shopifyStoreId,
            shopifyProductId: mapping.shopifyProductId,
            shop: mapping.shop,
            error: `Shopify errors: ${result.userErrors.map((e: any) => e.message).join(", ")}`,
          });
          return;
        }

        const shopifyProduct = result?.product;

        // Update variant mappings if necessary
        if (shopifyProduct?.variants?.nodes?.length > 0 && product.variants.length > 0) {
          // Get existing variant mappings for this product and store
          const existingVariantMappings = await prisma.variantMapping.findMany({
            where: {
              productId: product.id,
              shopifyStoreId: mapping.shopifyStoreId,
            },
          });

          const variantMappingsToCreate = [];
          const variantMappingsToUpdate = [];

          for (const shopifyVariant of shopifyProduct.variants.nodes) {
            const shopifyVariantId = shopifyVariant.id.replace("gid://shopify/ProductVariant/", "");

            // Find matching local variant by comparing option values
            const matchingLocalVariant = product.variants.find((localVariant) => {
              // If no options, match the first available local variant (default variant)
              if (product.options.length === 0 || localVariant.options.length === 0) {
                return true;
              }

              // Match by option values
              const shopifyOptions = shopifyVariant.selectedOptions;
              return (
                shopifyOptions.every((shopifyOption: any) => {
                  const optionName = shopifyOption.name;
                  const optionValue = shopifyOption.value;

                  return localVariant.options.some((variantOption) => {
                    return variantOption.option.name === optionName && variantOption.value.value === optionValue;
                  });
                }) && shopifyOptions.length === localVariant.options.length
              );
            });

            if (matchingLocalVariant) {
              const existingMapping = existingVariantMappings.find((vm) => vm.variantId === matchingLocalVariant.id);

              if (existingMapping) {
                // Update existing mapping
                variantMappingsToUpdate.push({
                  id: existingMapping.id,
                  shopifyVariantId,
                  sku: matchingLocalVariant.sku || shopifyVariant.sku,
                });
              } else {
                // Create new mapping
                variantMappingsToCreate.push({
                  userId: mapping.userId,
                  variantId: matchingLocalVariant.id,
                  productId: product.id,
                  shopifyVariantId,
                  shopifyProductId: mapping.shopifyProductId,
                  shopifyStoreId: mapping.shopifyStoreId,
                  shop: mapping.shop,
                  sku: matchingLocalVariant.sku || shopifyVariant.sku,
                });
              }
            }
          }

          // Create new variant mappings
          if (variantMappingsToCreate.length > 0) {
            await prisma.variantMapping.createMany({
              data: variantMappingsToCreate,
            });
          }

          // Update existing variant mappings
          for (const mapping of variantMappingsToUpdate) {
            await prisma.variantMapping.update({
              where: { id: mapping.id },
              data: {
                shopifyVariantId: mapping.shopifyVariantId,
                sku: mapping.sku,
              },
            });
          }
        }

        results.push({
          success: true,
          shopifyStoreId: mapping.shopifyStoreId,
          shopifyProductId: mapping.shopifyProductId,
          shop: mapping.shop,
        });
      } catch (error) {
        console.error(`Error syncing product ${productId} to shop ${mapping.shop}:`, error);
        results.push({
          success: false,
          shopifyStoreId: mapping.shopifyStoreId,
          shopifyProductId: mapping.shopifyProductId,
          shop: mapping.shop,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),
  ]);

  const totalSynced = results.filter((r) => r.success).length;
  const totalFailed = results.filter((r) => !r.success).length;

  return {
    productId,
    results,
    totalSynced,
    totalFailed,
  };
}
