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

export type OrderStatus =
  | "DRAFT"
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELED"
  | "REFUNDED";

export type ShipmentStatus =
  | "PENDING"
  | "PICKED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED";

// Base model types (without relations)
export type TempAccount = {
  id: number;
  email: string;
  name?: string;
  passwordHash: string;
  token: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: number;
  email: string;
  name?: string;
  passwordHash?: string;
  role: Role;
  stripeCustomerId?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Plan = {
  id: number;
  name: string;
  description?: string;
  price: number;
  interval: string;
  stripePriceId?: string;
  active: boolean;
  features?: any; // JSON type
  createdAt: Date;
  updatedAt: Date;
};

export type Subscription = {
  id: number;
  userId: number;
  planId: number;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  startsAt?: Date;
  endsAt?: Date;
  trialEndsAt?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Payment = {
  id: number;
  userId: number;
  subscriptionId?: number;
  stripePaymentIntentId?: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: Date;
  metadata?: any; // JSON type
  createdAt: Date;
};

export type Category = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryTranslation = {
  id: number;
  categoryId: number;
  locale: string;
  title: string;
  description?: string;
};

export type Product = {
  id: number;
  sku?: string;
  suggestedPrice?: number;
  currency?: string;
  popularityScore: number;
  shopifyId?: string;
  shopifyImported: boolean;
  categoryId?: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  metadata?: any; // JSON type
  views: number;
  likes: number;
};

export type ProductTranslation = {
  id: number;
  productId: number;
  locale: string;
  title: string;
  description: string;
  slug?: string;
};

export type Media = {
  id: number;
  productId?: number;
  url: string;
  provider?: string;
  type: MediaType;
  alt?: string;
  sortOrder: number;
  metadata?: any; // JSON type
  createdAt: Date;
};

export type Supplier = {
  id: number;
  name: string;
  marketplace?: string;
  baseUrl?: string;
  contactInfo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductSupplier = {
  id: number;
  productId: number;
  supplierId: number;
  url: string;
  marketplace?: string;
  price?: number;
  currency?: string;
  isPrimary: boolean;
  notes?: string;
};

export type Order = {
  id: number;
  orderNumber: string;
  userId: number;
  agentId?: number;
  totalCents: number;
  currency: string;
  status: OrderStatus;
  metadata?: any; // JSON type
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  title: string;
  unitPriceCents: number;
  quantity: number;
  metadata?: any; // JSON type
};

export type Shipment = {
  id: number;
  orderId: number;
  methodId: number;
  trackingNumber?: string;
  status: ShipmentStatus;
  shippedAt?: Date;
  deliveredAt?: Date;
  costCents?: number;
  metadata?: any; // JSON type
  createdAt: Date;
  updatedAt: Date;
};

export type ShipmentMethod = {
  id: number;
  title: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  costCents: number;
  currency: string;
  provider?: string;
  active: boolean;
  agentProfileId?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AgentProfile = {
  id: number;
  userId: number;
  companyName?: string;
  contactNumber?: string;
  details?: any; // JSON type
  createdAt: Date;
  updatedAt: Date;
};

// Types with relations
export type UserWithRelations = User & {
  subscriptions?: Subscription[];
  payments?: Payment[];
  orders?: Order[];
  assignedOrders?: Order[];
  agentProfile?: AgentProfile;
};

export type PlanWithRelations = Plan & {
  subscriptions?: Subscription[];
};

export type SubscriptionWithRelations = Subscription & {
  user?: User;
  plan?: Plan;
  payments?: Payment[];
};

export type PaymentWithRelations = Payment & {
  user?: User;
  subscription?: Subscription;
};

export type CategoryWithRelations = Category & {
  translations?: CategoryTranslation[];
  products?: Product[];
};

export type CategoryTranslationWithRelations = CategoryTranslation & {
  category?: Category;
};

export type ProductWithRelations = Product & {
  category?: Category;
  translations?: ProductTranslation[];
  media?: Media[];
  suppliers?: ProductSupplier[];
  orderItems?: OrderItem[];
};

export type ProductTranslationWithRelations = ProductTranslation & {
  product?: Product;
};

export type MediaWithRelations = Media & {
  product?: Product;
};

export type SupplierWithRelations = Supplier & {
  productLinks?: ProductSupplier[];
};

export type ProductSupplierWithRelations = ProductSupplier & {
  product?: Product;
  supplier?: Supplier;
};

export type OrderWithRelations = Order & {
  user?: User;
  agent?: User;
  items?: OrderItem[];
  shipment?: Shipment;
};

export type OrderItemWithRelations = OrderItem & {
  order?: Order;
  product?: Product;
};

export type ShipmentWithRelations = Shipment & {
  order?: Order;
  method?: ShipmentMethod;
};

export type ShipmentMethodWithRelations = ShipmentMethod & {
  shipments?: Shipment[];
  agent?: AgentProfile;
};

export type AgentProfileWithRelations = AgentProfile & {
  user?: User;
  shipmentMethods?: ShipmentMethod[];
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

export type CreatePayment = Omit<Payment, "id" | "createdAt">;
export type UpdatePayment = Partial<Omit<Payment, "id" | "createdAt">>;

export type CreateCategory = Omit<Category, "id" | "createdAt" | "updatedAt">;
export type UpdateCategory = Partial<
  Omit<Category, "id" | "createdAt" | "updatedAt">
>;

export type CreateProduct = Omit<Product, "id" | "createdAt" | "updatedAt">;
export type UpdateProduct = Partial<
  Omit<Product, "id" | "createdAt" | "updatedAt">
>;

export type CreateOrder = Omit<Order, "id" | "createdAt" | "updatedAt">;
export type UpdateOrder = Partial<
  Omit<Order, "id" | "createdAt" | "updatedAt">
>;
