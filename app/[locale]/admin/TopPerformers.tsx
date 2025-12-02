"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Eye, Heart, ShoppingCart, Package } from "lucide-react";

type Category = {
  id: number;
  name: string;
  productCount: number;
};

type Product = {
  id: number;
  name: string;
  views: number;
  likes: number;
  orders: number;
  popularityScore: number;
};

type TopPerformersProps = {
  categories: Category[];
  products: Product[];
};

export default function TopPerformers({ categories, products }: TopPerformersProps) {
  return (
    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Top Categories
            <span className="font-normal text-muted-foreground text-sm">By product count</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={80} className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => [`${value} products`, "Product Count"]}
                />
                <Bar dataKey="productCount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Products
            <span className="font-normal text-muted-foreground text-sm">By performance metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {products.slice(0, 10).map((product, index) => (
              <div key={product.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center w-8 h-8 rounded-full bg-muted font-medium text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm leading-tight">{product.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Eye className="w-3 h-3" />
                        {product.views}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Heart className="w-3 h-3" />
                        {product.likes}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <ShoppingCart className="w-3 h-3" />
                        {product.orders}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs">
                    Score: {product.popularityScore}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
