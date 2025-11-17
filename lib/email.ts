import { readFileSync } from "fs";

import nodemailer from "nodemailer";
import { join } from "path";

// Email configuration interface
interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create reusable transporter object using SMTP transport
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Send an email using nodemailer
 * @param config Email configuration object
 * @returns Promise<boolean> indicating success/failure
 */
export async function sendEmail(config: EmailConfig): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Verify SMTP configuration
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "WinWaterfall"}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: config.to,
      subject: config.subject,
      text: config.text,
      html: config.html,
    });

    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Send verification email to user
 * @param email User's email address
 * @param token Verification token
 * @param emailTemplate HTML template for the email
 * @returns Promise<boolean> indicating success/failure
 */
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const templatePath = join(process.cwd(), "email-templates", "verification.html");
  const emailTemplate = readFileSync(templatePath, "utf-8");

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/users/temp/verify/${token}`;

  // Replace placeholder in template with actual verification URL
  const htmlContent = emailTemplate.replaceAll("{{VERIFICATION_URL}}", verificationUrl);

  return sendEmail({
    to: email,
    subject: "Verify Your Email Address - WinWaterfall",
    html: htmlContent,
    text: `Please verify your email address by clicking this link: ${verificationUrl}`,
  });
}

/**
 * Send order payment notification email to customer
 * @param email Customer's email address
 * @param orderData Order information
 * @returns Promise<boolean> indicating success/failure
 */
export async function sendOrderPaymentNotification(
  email: string,
  orderData: {
    customerName: string;
    orderNumber: string;
    orderDate: string;
    itemCount: number;
    totalAmount: string;
    paymentUrl: string;
  }
): Promise<boolean> {
  const templatePath = join(process.cwd(), "email-templates", "order-payment-notification.html");
  const emailTemplate = readFileSync(templatePath, "utf-8");

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  // Replace placeholders in template
  let htmlContent = emailTemplate
    .replaceAll("{{CUSTOMER_NAME}}", orderData.customerName)
    .replaceAll("{{ORDER_NUMBER}}", orderData.orderNumber)
    .replaceAll("{{ORDER_DATE}}", orderData.orderDate)
    .replaceAll("{{ITEM_COUNT}}", orderData.itemCount.toString())
    .replaceAll("{{TOTAL_AMOUNT}}", orderData.totalAmount)
    .replaceAll("{{PAYMENT_URL}}", orderData.paymentUrl)
    .replaceAll("{{DASHBOARD_URL}}", dashboardUrl)
    .replaceAll("{{APP_URL}}", appUrl);

  return sendEmail({
    to: email,
    subject: `Payment Required for Order ${orderData.orderNumber} - WinWaterfall`,
    html: htmlContent,
    text: `Your order ${orderData.orderNumber} requires payment. Please visit ${orderData.paymentUrl} to complete your payment.`,
  });
}

/**
 * Send product options changed notification email to user
 * @param email User's email address
 * @param productData Product information
 * @returns Promise<boolean> indicating success/failure
 */
export async function sendOptionsChangedNotification(
  email: string,
  productData: {
    customerName: string;
    productTitle: string;
    stores: string[];
    syncDate: string;
  }
): Promise<boolean> {
  const templatePath = join(process.cwd(), "email-templates", "options-changed-notification.html");
  const emailTemplate = readFileSync(templatePath, "utf-8");

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/products`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  // Generate store badges HTML
  const storeBadges = productData.stores.map((store) => `<span class="store-badge">${store}</span>`).join("");

  // Replace placeholders in template
  let htmlContent = emailTemplate
    .replaceAll("{{CUSTOMER_NAME}}", productData.customerName)
    .replaceAll("{{PRODUCT_TITLE}}", productData.productTitle)
    .replaceAll("{{STORE_BADGES}}", storeBadges)
    .replaceAll("{{SYNC_DATE}}", productData.syncDate)
    .replaceAll("{{DASHBOARD_URL}}", dashboardUrl)
    .replaceAll("{{APP_URL}}", appUrl);

  return sendEmail({
    to: email,
    subject: `Product Options Updated: ${productData.productTitle} - WinWaterfall`,
    html: htmlContent,
    text: `The options and variants for your product "${productData.productTitle}" have been updated in your Shopify store(s). Please review the changes in your dashboard: ${dashboardUrl}`,
  });
}
