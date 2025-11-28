"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Check } from "lucide-react";
import axios from "axios";

type PasswordResetFormData = {
  email: string;
};

export default function PasswordReset() {
  const t = useTranslations("register");
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const resetSchema = z.object({
    email: z.string().email(t("please enter a valid email address")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      await axios.post("/api/users/password-reset/request", {
        email: data.email,
      });
      setEmailSent(data.email);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send reset email");
    }
  };

  const handleResendEmail = async () => {
    if (!emailSent) return;

    setIsResending(true);
    try {
      await axios.post("/api/users/password-reset/request", {
        email: emailSent,
      });
      toast.success("Password reset email resent");
    } catch (error) {
      console.error("Resend email error:", error);
      toast.error("Failed to resend email");
    } finally {
      setIsResending(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-var(--navbar-height))] px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-8 w-full max-w-md p-10 rounded-xl dark:bg-muted-background shadow-card-1">
          <div className="text-center">
            <Image src="/logo.svg" alt="Logo" width={48} height={48} className="mx-auto mb-6" />

            <div className="inline-flex justify-center items-center w-16 h-16 mb-4 rounded-full bg-orange-100">
              <Check className="w-8 h-8 text-orange-600" />
            </div>

            <h2 className="font-bold text-foreground text-2xl">Reset Email Sent</h2>

            <p className="mt-3 text-gray-600 dark:text-gray-400">Check your email for the password reset link</p>

            <div className="mt-6 px-4 py-3 border border-orange-200 rounded-lg bg-orange-50 text-orange-700 text-sm">
              <span className="font-medium">Email sent to</span>
              <br />
              <span className="font-semibold text-orange-600">{emailSent}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full px-4 py-3 rounded-md bg-primary-500 hover:bg-primary-600 disabled:opacity-50 font-medium text-white transition disabled:cursor-not-allowed"
            >
              {isResending ? "Sending..." : "Resend Reset Link"}
            </button>

            <Link
              href="/auth/login"
              className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-muted font-medium text-gray-700 dark:text-gray-300 text-center transition"
            >
              {t("back to sign in")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-var(--navbar-height))] px-4 sm:px-6 lg:px-8 py-4">
      <div className="space-y-8 w-full max-w-md p-10 rounded-xl dark:bg-muted-background shadow-card-1">
        <div>
          <Image src="/logo.svg" alt="Logo" width={48} height={48} className="mx-auto text-primary-500" />
          <h2 className="mt-6 font-extrabold text-foreground text-3xl text-center">Reset Your Password</h2>
          <p className="mt-2 text-muted-foreground text-sm text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="space-y-6 mt-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="sr-only">
                {t("email address")}
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                className={`appearance-none relative block w-full px-3 py-3 border text-muted-foreground rounded-md focus:outline-none focus:z-10 sm:text-sm ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                }`}
                placeholder={t("email address")}
              />
              {errors.email && <p className="mt-1 text-red-600 text-sm">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex justify-center w-full px-4 py-3 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 font-medium text-white text-sm duration-150 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="font-medium text-primary-500 hover:text-primary-600 text-sm duration-150"
            >
              {t("back to sign in")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
