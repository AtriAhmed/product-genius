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

type RegisterFormData = {
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
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedEmail = watch("email");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch("/api/users/temp/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setEmailSent(data.email);
      } else {
        // Handle error - you might want to show a toast or error message
        console.error("Registration error:", result.error);
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  const handleResendEmail = async () => {
    if (!emailSent) return;

    setIsResending(true);
    try {
      const response = await fetch("/api/users/temp/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailSent,
          password: watchedEmail, // Note: This won't work as password is not available
        }),
      });

      if (response.ok) {
        toast.success("Verification email resent successfully!");
      } else {
        toast.error("Failed to resend email. Please try again.");
      }
    } catch (error) {
      console.error("Resend email error:", error);
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Show success message if email was sent
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-[0_0_5px_rgba(0,0,0,0.2)] dark:bg-muted-background">
          <div className="text-center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={48}
              height={48}
              className="mx-auto text-primary-500"
            />
            <div className="mt-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-foreground">
                {t("verification email sent")}
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {t("check your email")}
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{t("email sent to")}</span>
                  <br />
                  <span className="text-primary-600">{emailSent}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t("didn't receive email?")}
              </p>
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="mt-2 font-medium text-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Sending..." : t("resend verification")}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-8 p-10 rounded-xl shadow-[0_0_5px_rgba(0,0,0,0.2)] dark:bg-muted-background">
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
              href="/login"
              className="font-medium text-primary-500 hover:text-primary-600 duration-150"
            >
              {t("already have an account?")} {t("sign in here")}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md space-y-4">
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
