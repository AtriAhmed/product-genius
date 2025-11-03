// Types (kept optionality exactly as in your original file; added new models introduced in Prisma without making fields required)

// String literal types (instead of enums)
export type Role = "OWNER" | "ADMIN" | "EDITOR" | "AGENT" | "USER";

export type MediaType = "IMAGE" | "VIDEO";

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "UNPAID";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "unknown";

export type OrderStatus =
  | "DRAFT"
  | "UNPAID"
  | "PAID"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELED"
  | "REFUNDED";

export type PlanInterval = "DAY" | "WEEK" | "MONTH" | "YEAR";

export type InvoiceType = "PLAN" | "ORDER";

export const MARKETPLACES = ["AMAZON", "ALIEXPRESS"] as const;

export type Marketplace = (typeof MARKETPLACES)[number];

// Cart types
export type CartItem = {
  productId: number;
  quantity: number;
};

// Base model types (without relations)
export type TempAccount = {
  id: number;
  email?: string;
  name?: string;
  passwordHash?: string;
  token?: string;
  expiresAt?: Date;
  attempts?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type User = {
  id: number;
  email?: string;
  name?: string;
  passwordHash?: string;
  role?: Role;
  stripeCustomerId?: string;
  currentSubscriptionId?: number;
  currentSubscription?: Subscription;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  subscriptions?: Subscription[];
  orders?: Order[];
  assignedOrders?: Order[];
  agentProfile?: AgentProfile;
  invoices?: Invoice[];
  shopifyStores?: ShopifyStore[];
};

export type PlanFeature = {
  key: string;
  value?: string;
  description?: string;
  included: boolean;
  note?: string;
};

export type Plan = {
  id: number;
  name?: string;
  description?: string;
  oldPrice?: number;
  price?: number;
  interval?: PlanInterval;
  stripeProductId?: string;
  stripePriceId?: string;
  active?: boolean;
  features?: PlanFeature[] | any;
  mostPopular?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  subscriptions?: Subscription[];
};

export type Subscription = {
  id: number;
  userId?: number;
  planId?: number;
  stripeSubscriptionId?: string;
  status?: SubscriptionStatus;
  startsAt?: Date;
  endsAt?: Date;
  trialEndsAt?: Date;
  cancelAtPeriodEnd?: boolean;
  usage?: any; // JSON type
  latestStripeInvoiceId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  user?: User;
  plan?: Plan;
  users?: User[]; // CurrentSubscription relation
};

export type Invoice = {
  id: number;
  stripeInvoiceId?: string;
  userId?: number;
  stripeSubscriptionId?: string;
  amountCents?: number;
  taxCents?: number;
  currency?: string;
  status?: string;
  pdfUrl?: string;
  hostedUrl?: string;
  paidAt?: Date;
  type?: InvoiceType;
  periodStart?: Date;
  periodEnd?: Date;
  createdAt?: Date;
  // Relations
  user?: User;
  orders?: Order[]; // Invoice has relation to Order[] in schema
};

export type Category = {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  translations?: CategoryTranslation[];
  products?: Product[];
};

export type CategoryTranslation = {
  id: number;
  categoryId?: number;
  locale?: string;
  title?: string;
  description?: string;
  // Relations
  category?: Category;
};

export type Product = {
  id: number;
  sku?: string;
  sellingPrice?: number;
  price?: number;
  compareAtPrice?: number;
  currency?: string;
  popularityScore?: number;
  shopifyId?: string;
  shopifyImported?: boolean;
  categoryId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  views?: number;
  likes?: number;
  // Relations
  category?: Category;
  translations?: ProductTranslation[];
  media?: Media[];
  suppliers?: Supplier[];
  orderItems?: OrderItem[];
  productOptions?: ProductOption[]; // new
  productVariants?: ProductVariant[]; // new
  productMappings?: ProductMapping[]; // matches schema name
  variantMappings?: VariantMapping[]; // new
};

export type ProductOption = {
  id: number;
  productId?: number;
  name?: string; // "Color", "Size", "Material"
  position?: number; // 1,2,3
  values?: any; // Json, e.g., ["Red","Blue"] or ["S","M","L"]
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  product?: Product;
};

export type ProductVariant = {
  id: number;
  productId?: number;
  option1?: string;
  option2?: string;
  option3?: string;
  price?: string;
  compareAtPrice?: string;
  costPrice?: string;
  sku?: string;
  inventory?: number;
  trackInventory?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  product?: Product;
  variantMappings?: VariantMapping[];
  orderItems?: OrderItem[];
};

export type VariantMapping = {
  id: number;
  variantId?: number;
  productId?: number;
  shopifyVariantId?: string;
  shopifyProductId?: string;
  shop?: string;
  sku?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  variant?: ProductVariant;
  product?: Product;
};

export type ProductMapping = {
  id: number;
  productId?: number;
  shopifyProductId?: string;
  shopifyStoreId?: number;
  shop?: string;
  createdAt?: Date;
  // Relations
  product?: Product;
  shopifyStore?: ShopifyStore;
};

export type ProductTranslation = {
  id?: number;
  productId?: number;
  locale?: string;
  title?: string;
  description?: string;
  // Relations
  product?: Product;
};

export type Media = {
  id: number;
  productId?: number;
  url?: string;
  poster?: string;
  provider?: string;
  type?: MediaType;
  alt?: string;
  sortOrder?: number;
  createdAt?: Date;
  // Relations
  product?: Product;
};

export type Supplier = {
  id: number;
  productId?: number;
  url?: string;
  marketplace?: Marketplace | string;
  price?: number;
  currency?: string;
  isInternal?: boolean;
  notes?: string;
  // Relations
  product?: Product;
};

export type Order = {
  id: number;
  orderNumber?: string;
  shopifyOrderId?: string;
  userId?: number;
  agentId?: number;
  totalCents?: number;
  currency?: string;
  status?: OrderStatus;
  deliveryName?: string;
  deliveryPhone?: string;
  deliveryEmail?: string;
  deliveryAddress1?: string;
  deliveryAddress2?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  deliveryCountry?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  user?: User;
  agent?: User;
  items?: OrderItem[];
  shopifyStore?: ShopifyStore;
  invoice?: Invoice;
};

export type OrderItem = {
  id: number;
  orderId?: number;
  productId?: number;
  title?: string;
  unitPriceCents?: number;
  quantity?: number;
  productVariantId?: number; // new
  productVariant?: ProductVariant; // new
  // Relations
  order?: Order;
  product?: Product;
};

export type AgentProfile = {
  id: number;
  userId?: number;
  companyName?: string;
  contactNumber?: string;
  details?: any; // JSON type
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  user?: User;
};

export type ShopifyStore = {
  id: number;
  userId?: number;
  shop?: string;
  name?: string;
  accessToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Relations
  user?: User;
  productMappings?: ProductMapping[];
  orders?: Order[];
};

// Utility types for creating/updating records
export type CreateTempAccount = Omit<
  TempAccount,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateTempAccount = Partial<
  Omit<TempAccount, "id" | "createdAt" | "updatedAt">
>;

export type CreateUser = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUser = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;

export type CreatePlan = Omit<Plan, "id" | "createdAt" | "updatedAt">;
export type UpdatePlan = Partial<Omit<Plan, "id" | "createdAt" | "updatedAt">>;

export type CreateSubscription = Omit<
  Subscription,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateSubscription = Partial<
  Omit<Subscription, "id" | "createdAt" | "updatedAt">
>;

export type CreateInvoice = Omit<Invoice, "id" | "createdAt">;
export type UpdateInvoice = Partial<Omit<Invoice, "id" | "createdAt">>;

export type CreateCategory = Omit<Category, "id" | "createdAt" | "updatedAt">;
export type UpdateCategory = Partial<
  Omit<Category, "id" | "createdAt" | "updatedAt">
>;

export type CreateProduct = Omit<Product, "id" | "createdAt" | "updatedAt">;
export type UpdateProduct = Partial<
  Omit<Product, "id" | "createdAt" | "updatedAt">
>;

export type CreateSupplier = Omit<Supplier, "id">;
export type UpdateSupplier = Partial<Omit<Supplier, "id">>;

export type CreateOrder = Omit<Order, "id" | "createdAt" | "updatedAt">;
export type UpdateOrder = Partial<
  Omit<Order, "id" | "createdAt" | "updatedAt">
>;

export type CreateOrderItem = Omit<OrderItem, "id">;
export type UpdateOrderItem = Partial<Omit<OrderItem, "id">>;

// Order API Types
export type CreateOrderRequest = {
  items: {
    productId: number;
    quantity: number;
    productVariantId?: number;
  }[];
  currency?: string;
};

export type CreateOrderResponse = {
  order: Order & {
    items: (OrderItem & { product: Product })[];
    user: Pick<User, "id" | "name" | "email">;
  };
};

export type PayOrderRequest = {
  paymentMethodId: string;
};

export type PayOrderResponse = {
  success: boolean;
  clientSecret?: string;
  invoiceId?: string;
  error?: string;
};

// Payment method types for Stripe
export type PaymentMethod = {
  id: string;
  type: string;
  card?: {
    brand: CardBrand;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault?: boolean;
};

// Subscription API Types
export type CreateSubscriptionRequest = {
  planId: number;
  paymentMethodId: string;
};

export type CreateSubscriptionResponse = {
  subscription: Subscription & {
    plan: Plan;
    user: Pick<User, "id" | "name" | "email">;
  };
  clientSecret?: string;
  subscriptionId: string;
};

export type UpdateSubscriptionRequest = {
  planId?: number;
  cancelAtPeriodEnd?: boolean;
};

export type SubscriptionWithDetails = Subscription & {
  plan: Plan;
  user: Pick<User, "id" | "name" | "email">;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

// Stripe Webhook Types
export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: any;
  };
};

export type StripeSubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";

// Delivery Information Types
export type DeliveryInfo = {
  deliveryName: string;
  deliveryPhone: string;
  deliveryEmail: string;
  deliveryAddress1: string;
  deliveryAddress2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryCountry: string;
};

export type Translation = ProductTranslation | CategoryTranslation;
