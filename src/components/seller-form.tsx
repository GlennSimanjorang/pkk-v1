import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import image from "@/assets/image.png"; 
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { z } from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(5, "Nama dibutuhkan"),
  phone_number: z.string().min(8, "Nomor telepon minimal 8 karakter"),
  store_name: z.string().min(2, "Nama Toko minimal 3 karakter"),
  password: z.string().min(5, "Password minimal 5 karakter"),
});

type FormValues = z.infer<typeof schema>;

export function SellerForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone_number: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await axios.post(
        `${baseUrl}/api/v1/auth/signup?type=seller`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("register seller success");
    } catch (error) {
      console.error("Login error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Terjadi kesalahan saat login";

        setApiError(errorMessage);
      } else {
        setApiError("Terjadi kesalahan tak terduga");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form 
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Selamat Datang</h1>
                <p className="text-muted-foreground text-balance">
                  Daftar Ke Akun TB Pedia Anda
                </p>
              </div>
              {apiError && (
                <div className="bg-destructive/15 p-3 rounded-md text-destructive text-center text-sm">
                  {apiError}
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="name"
                  placeholder="starbhak"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-destructive text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="number">Number</Label>
                </div>
                <Input
                  id="number"
                  type="number"
                  {...register("phone_number")}
                />
                {errors.phone_number && (
                  <p className="text-destructive text-sm">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="name">Nama Toko</Label>
                </div>
                <Input id="name" type="name" {...register("store_name")} />
                {errors.store_name && (
                  <p className="text-destructive text-sm">
                    {errors.store_name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Mendaftar..." : "Daftar"}
              </Button>
              <div className="text-center text-sm">
                Sudah punya akun?{" "}
                <Link to="/" className="underline underline-offset-4">
                  Masuk
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src={image}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
