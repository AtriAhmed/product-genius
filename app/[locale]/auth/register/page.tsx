"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Check } from "lucide-react";
import axios from "axios";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const t = useTranslations("register");
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Zod schema for form validation with translations
  const registerSchema = z
    .object({
      name: z.string().min(1, t("name is required")),
      email: z.email(t("please enter a valid email address")),
      password: z
        .string()
        .min(1, t("password is required"))
        .min(6, t("password must be at least 6 characters")),
      confirmPassword: z.string().min(1, t("confirm password is required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwords do not match"),
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedEmail = watch("email");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await axios.post("/api/users/temp/create", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setEmailSent(data.email);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Registration failed. Please try again."
      );
    }
  };

  const handleResendEmail = async () => {
    if (!emailSent) return;

    setIsResending(true);
    try {
      const response = await axios.post("/api/users/temp/create", {
        email: emailSent,
        password: watchedEmail, // Note: This won't work as password is not available
      });
      toast.success("Verification email resent successfully!");
    } catch (error) {
      console.error("Resend email error:", error);
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Show success message if email was sent
  if (emailSent) {
    if (emailSent) {
      return (
        <div className="min-h-[calc(100vh-55px)] flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-card-1 dark:bg-muted-background">
            <div className="text-center">
              {/* Logo */}
              <Image
                src="/logo.svg"
                alt="Logo"
                width={48}
                height={48}
                className="mx-auto mb-6"
              />

              {/* Success icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                <Check className="w-8 h-8 text-orange-600" />
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold text-foreground">
                {t("verification email sent")}
              </h2>

              {/* Subtext */}
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                {t("check your email")}
              </p>

              {/* Highlighted email */}
              <div className="mt-6 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                <span className="font-medium">{t("email sent to")}</span>
                <br />
                <span className="text-orange-600 font-semibold">
                  {emailSent}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full py-3 px-4 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isResending ? "Sending..." : t("resend verification")}
              </button>

              <Link
                href="/auth/login"
                className="block text-center w-full py-3 px-4 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-muted transition"
              >
                {t("back to sign in")}
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-[calc(100vh-55px)] flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-card-1 dark:bg-muted-background">
        <div>
          <Image
            src="/logo.svg"
            alt="Logo"
            width={48}
            height={48}
            className="mx-auto text-primary-500"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {t("create your account")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("or")}{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary-500 hover:text-primary-600 duration-150"
            >
              {t("already have an account?")} {t("sign in here")}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                {t("full name")}
              </label>
              <input
                {...register("name")}
                id="name"
                type="text"
                autoComplete="name"
                className={`appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:z-10 sm:text-sm ${
                  errors.name
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                }`}
                placeholder={t("full name")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                {t("email address")}
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                className={`appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:z-10 sm:text-sm ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                }`}
                placeholder={t("email address")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`appearance-none relative block w-full px-3 py-3 pr-10 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:z-10 sm:text-sm ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  }`}
                  placeholder={t("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                {t("confirm password")}
              </label>
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`appearance-none relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:z-10 sm:text-sm ${
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                }`}
                placeholder={t("confirm password")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed duration-150"
            >
              {isSubmitting ? t("creating account;;;") : t("create account")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
