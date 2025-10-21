"use client";

import { useState, useEffect } from "react";
import { User, Role } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { USER_ROLES } from "@/types/constants";
import { useSession } from "next-auth/react";

const editUserSchema = z.object({
  //   name: z.string().min(1, "Name is required").optional(),
  //   email: z.email("Invalid email").optional(),
  role: z.enum(["OWNER", "ADMIN", "EDITOR", "AGENT", "USER"]).optional(),
  //   password: z
  //     .string()
  //     .min(6, "Password must be at least 6 characters")
  //     .optional()
  //     .or(z.literal("")),
});

type EditUserForm = z.infer<typeof editUserSchema>;

type EditUserDialogProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
};

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: EditUserDialogProps) {
  const t = useTranslations("users");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const currentUser = session?.user;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      role: user?.role || "USER",
    },
  });

  const selectedRole = watch("role");

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        role: user.role || "USER",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: EditUserForm) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData: any = {};

      if (data.role && data.role !== user.role) {
        updateData.role = data.role;
      }

      await axios.put(`/api/users/${user.id}`, updateData);

      toast.success(t("user updated successfully"));
      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.error || t("failed to update user"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("edit user")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input value={user.email} placeholder="Enter user email" disabled />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">{t("role")}</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: Role) => setValue("role", value)}
              disabled={
                USER_ROLES[currentUser?.role as Role].access <=
                USER_ROLES[user.role as Role].access
              }
            >
              <SelectTrigger className="w-full capitalize">
                {USER_ROLES[selectedRole as Role]?.label?.toLowerCase() ||
                  "Select role"}
              </SelectTrigger>
              <SelectContent>
                {Object.entries(USER_ROLES).map(
                  ([key, role]) =>
                    USER_ROLES[currentUser?.role as Role]?.access >
                      role.access && (
                      <SelectItem key={key} value={key} className="capitalize">
                        {role.label?.toLowerCase()}
                      </SelectItem>
                    )
                )}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-destructive text-sm">{errors.role.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : t("update")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
