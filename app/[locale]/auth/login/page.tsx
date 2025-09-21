"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

type SignInFormData = {
  email: string;
  password: string;
  remember?: boolean;
};

export default function SignIn() {
  const t = useTranslations("login");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const error = searchParams.get("error");
    const email = searchParams.get("email");

    if (verified === "true" && email) {
      setVerificationMessage(
        `Account verified successfully! You can now sign in with ${email}`
      );
    } else if (error === "verification_failed") {
      setVerificationMessage(
        "Verification failed. Please try registering again."
      );
    }
  }, [searchParams]);

  // Zod schema for form validation with translations
  const signInSchema = z.object({
    email: z.email(t("please enter a valid email address")),
    password: z
      .string()
      .min(1, t("password is required"))
      .min(6, t("password must be at least 6 characters")),
    remember: z.boolean().default(false),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "UserNotFound") {
        toast.error("No account found with this email address.");
      } else if (result.error === "WrongPassword") {
        toast.error("Incorrect password.");
      } else {
        toast.error(result.error);
      }
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[calc(100vh-55px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
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
            {t("sign in to your account")}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("or")}{" "}
            <Link
              href="/auth/register"
              className="font-medium text-primary-500 hover:text-primary-600 duration-150"
            >
              {t("start your 7-day free trial")}
            </Link>
          </p>
        </div>

        {verificationMessage && (
          <div
            className={`p-4 rounded-md ${
              verificationMessage.includes("successfully")
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-sm ${
                verificationMessage.includes("successfully")
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {verificationMessage}
            </p>
          </div>
        )}

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
                className={`appearance-none relative block w-full px-3 py-3 border text-muted-foreground rounded-md focus:outline-none focus:z-10 sm:text-sm ${
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
                  autoComplete="current-password"
                  className={`appearance-none relative block w-full px-3 py-3 pr-10 border text-muted-foreground rounded-md focus:outline-none focus:z-10 sm:text-sm ${
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...register("remember")}
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-foreground"
              >
                {t("remember me")}
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                {t("forgot your password?")}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed duration-150"
            >
              {isSubmitting ? t("signing in;;;") : t("sign in")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
