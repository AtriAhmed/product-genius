"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Edit Product #{productId}
          </h1>
        </div>

        <div className="text-center py-16">
          <h2 className="text-xl font-medium mb-4">Product Edit Form</h2>
          <p className="text-muted-foreground mb-6">
            The edit functionality is not yet implemented. You can use this page
            to create an edit form similar to the create product form, but
            pre-populated with existing data.
          </p>
          <div className="space-x-4">
            <Button onClick={() => router.push(`/admin/products/${productId}`)}>
              View Product
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/products")}
            >
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
