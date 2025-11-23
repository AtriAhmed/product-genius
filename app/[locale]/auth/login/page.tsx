"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
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
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const error = searchParams.get("error");
    const email = searchParams.get("email");

    if (verified === "true" && email) {
      setVerificationMessage(`Account verified successfully! You can now sign in with ${email}`);
    } else if (error === "verification_failed") {
      setVerificationMessage("Verification failed. Please try registering again.");
    }
  }, [searchParams]);

  // Zod schema for form validation with translations
  const signInSchema = z.object({
    email: z.email(t("please enter a valid email address")),
    password: z.string().min(1, t("password is required")).min(6, t("password must be at least 6 characters")),
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
        toast.error(t("no account found"));
      } else if (result.error === "WrongPassword") {
        toast.error(t("incorrect password"));
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-55px)] px-4 sm:px-6 lg:px-8 py-12 bg-background">
      <div className="space-y-8 w-full max-w-md p-10 rounded-xl dark:bg-muted-background shadow-card-1">
        <div>
          <Image src="/logo.svg" alt="Logo" width={48} height={48} className="mx-auto text-primary-500" />
          <h2 className="mt-6 font-extrabold text-foreground text-3xl text-center">{t("sign in to your account")}</h2>
          <p className="mt-2 text-muted-foreground text-sm text-center">
            {t("or")}{" "}
            <Link href="/auth/register" className="font-medium text-primary-500 hover:text-primary-600 duration-150">
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
              className={`text-sm ${verificationMessage.includes("successfully") ? "text-green-800" : "text-red-800"}`}
            >
              {verificationMessage}
            </p>
          </div>
        )}

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
                  className="right-0 z-10 absolute inset-y-0 flex items-center mr-3 focus:outline-none text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-red-600 text-sm">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input
                {...register("remember")}
                id="remember-me"
                type="checkbox"
                className="w-4 h-4 border-gray-300 rounded focus:ring-primary-400 text-primary-500"
              />
              <label htmlFor="remember-me" className="block ml-2 text-foreground text-sm">
                {t("remember me")}
              </label>
            </div>

            <div className="text-sm">
              <Link href="/auth/password-reset" className="font-medium text-primary-500 hover:text-primary-600">
                {t("forgot your password?")}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex justify-center w-full px-4 py-3 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 font-medium text-white text-sm duration-150 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("signing in;;;") : t("sign in")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
