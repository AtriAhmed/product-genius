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
import { useRouter, useParams } from "next/navigation";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const t = useTranslations("register");
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetSchema = z
    .object({
      password: z.string().min(1, t("password is required")).min(8, "Password must be at least 8 characters"),
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
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await axios.post(`/api/users/password-reset/verify/${token}`, {
        password: data.password,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to reset password");
    }
  };

  if (isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-55px)] px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-8 w-full max-w-md p-10 rounded-xl dark:bg-muted-background shadow-card-1">
          <div className="text-center">
            <Image src="/logo.svg" alt="Logo" width={48} height={48} className="mx-auto mb-6" />

            <div className="inline-flex justify-center items-center w-16 h-16 mb-4 rounded-full bg-green-100">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="font-bold text-foreground text-2xl">Password Reset Successful</h2>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Your password has been reset successfully. You will be redirected to the login page shortly.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="block w-full px-4 py-3 rounded-md bg-primary-500 hover:bg-primary-600 font-medium text-white text-center transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-55px)] px-4 sm:px-6 lg:px-8 py-4">
      <div className="space-y-8 w-full max-w-md p-10 rounded-xl dark:bg-muted-background shadow-card-1">
        <div>
          <Image src="/logo.svg" alt="Logo" width={48} height={48} className="mx-auto text-primary-500" />
          <h2 className="mt-6 font-extrabold text-foreground text-3xl text-center">Set New Password</h2>
          <p className="mt-2 text-muted-foreground text-sm text-center">
            Enter your new password below to reset your account password.
          </p>
        </div>

        <form className="space-y-6 mt-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md">
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
                  className={`appearance-none relative block w-full px-3 py-3 pr-10 border text-muted-foreground rounded-md focus:outline-none focus:z-10 sm:text-sm ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  }`}
                  placeholder={t("password")}
                />
                <button
                  type="button"
                  className="right-0 z-10 absolute inset-y-0 flex items-center mr-3 focus:outline-none text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-red-600 text-sm">{errors.password.message}</p>}
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
                className={`appearance-none relative block w-full px-3 py-3 border text-muted-foreground rounded-md focus:outline-none focus:z-10 sm:text-sm ${
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                }`}
                placeholder={t("confirm password")}
              />
              {errors.confirmPassword && <p className="mt-1 text-red-600 text-sm">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex justify-center w-full px-4 py-3 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 font-medium text-white text-sm duration-150 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
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
