import { prisma } from "@/lib/prisma";
import { createShopifyClient } from "@/lib/shopify-client";
import { sendOptionsChangedNotification } from "@/lib/email";

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
          user: true,
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

        // First, fetch the existing Shopify product to get current options and variants
        const fetchQuery = `
          query getProduct($id: ID!) {
            product(id: $id) {
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
              variants(first: 250) {
                nodes {
                  id
                  sku
                  price
                  compareAtPrice
                  inventoryQuantity
                  position
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        `;

        const fetchResponse = await shopifyClient.post("/graphql.json", {
          query: fetchQuery,
          variables: {
            id: `gid://shopify/Product/${mapping.shopifyProductId}`,
          },
        });

        const existingShopifyProduct = fetchResponse.data.data?.product;

        if (!existingShopifyProduct) {
          results.push({
            success: false,
            shopifyStoreId: mapping.shopifyStoreId,
            shopifyProductId: mapping.shopifyProductId,
            shop: mapping.shop,
            error: "Shopify product not found",
          });
          return;
        }

        // Prepare product options - matching existing ones when possible
        const productOptions = product.options?.length
          ? product.options.map((option, index) => {
              const existingOption = existingShopifyProduct.options.find(
                (opt: any) => opt.name.toLowerCase() === option.name.toLowerCase()
              );

              const optionData: any = {
                name: option.name,
                position: index + 1,
                values: option.values.map((value) => ({ name: value.value })),
              };

              // If option exists, include its ID to update instead of creating new
              if (existingOption) {
                optionData.id = existingOption.id;
              }

              return optionData;
            })
          : [
              {
                name: "Title",
                position: 1,
                values: [{ name: "Default Title" }],
              },
            ];

        // Prepare variants data - matching existing ones when possible
        const variants = product.variants.map((variant, index) => {
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

          // Try to find matching Shopify variant
          const matchingShopifyVariant = existingShopifyProduct.variants.nodes.find((shopifyVariant: any) => {
            const shopifyOptions = shopifyVariant.selectedOptions;

            // Match by option values
            if (optionValues.length !== shopifyOptions.length) return false;

            return shopifyOptions.every((shopifyOption: any) =>
              optionValues.some(
                (localOption) =>
                  localOption.optionName.toLowerCase() === shopifyOption.name.toLowerCase() &&
                  localOption.name.toLowerCase() === shopifyOption.value.toLowerCase()
              )
            );
          });

          const variantData: any = {
            optionValues,
            // price: (variant?.sellingPrice ?? variant.price * 1.5)?.toString() || "0",
            price: matchingShopifyVariant?.price || (variant?.sellingPrice ?? variant.price * 1.5)?.toString() || "0",
            // sku: variant.sku,
          };

          // If variant exists, include its ID to update instead of creating new
          if (matchingShopifyVariant) {
            variantData.id = matchingShopifyVariant.id;
          }

          return variantData;
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

          console.log("-------------------- variantMappingsToUpdate --------------------");
          console.log(variantMappingsToUpdate);

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

        // Send email notification after successful sync
        try {
          if (mapping.user?.email) {
            const productTranslation = await prisma.productTranslation.findFirst({
              where: {
                productId,
                locale: "en",
              },
            });

            const productTitle = productTranslation?.title || `Product #${productId}`;

            await sendOptionsChangedNotification(mapping.user.email, {
              customerName: mapping.user.name || "Valued Customer",
              productTitle,
              stores: [mapping.shop],
              syncDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            });

            // Create notification in database
            await prisma.notification.create({
              data: {
                userId: mapping.userId,
                title: "Product Options Updated",
                message: `The options and variants for "${productTitle}" have been synchronized to ${mapping.shop}. Please review the changes.`,
                link: `/dashboard/products/${productId}`,
                type: "WARNING",
                event: "OPTIONS_CHANGED",
              },
            });
          }
        } catch (emailError) {
          console.error("Failed to send options changed notification:", emailError);
          // Don't fail the sync if email fails
        }
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
