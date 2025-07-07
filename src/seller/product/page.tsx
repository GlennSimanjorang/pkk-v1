import * as React from "react";
import { SellerSidebar } from "@/components/seller-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { columns as rawColumns } from "./columns";
import { DataTable } from "./data-table";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import type { PaginationState } from "@tanstack/react-table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Schema untuk validasi form produk
const productSchema = z.object({
  name: z.string().min(4, "Name is required"),
  price: z.number().min(0, "Price must be at least 0"),
  category_id: z.number().min(1, "Category is required"),
  stock: z.number().min(0, "Stock must be at least 0"),
  description: z.string().min(10, "Description is required"),
  images: z.string().url("Valid image URL is required"),
});

// Tipe produk
export type SellerProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  category_id: number;
  stock: number;
  is_hidden: boolean;
  description: string;
  images: string;
  created_at: string;
  updated_at: string;
  category: { name: string } | null;
};

type CategoryOption = { id: number; name: string };

// API calls
async function getProducts(page: number, pageSize: number) {
  const token = Cookies.get("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  try {
    const res = await axios.get(
      `${baseUrl}/api/v1/products?page=${page}&per_page=${pageSize}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const productsData = res.data.content.data;

    return {
      data: productsData,
      from: res.data.content.from,
      to: res.data.content.to,
      hasNext: !!res.data.content.next_page_url,
      hasPrev: !!res.data.content.prev_page_url,
      total: res.data.content.total || res.data.content.to,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      data: [],
      from: 0,
      to: 0,
      hasNext: false,
      hasPrev: false,
      total: 0,
    };
  }
}

async function getAllPaginatedData(endpoint: string): Promise<any[]> {
  const token = Cookies.get("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  let allData: any[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  try {
    while (hasMorePages) {
      const separator = endpoint.includes("?") ? "&" : "?";
      const res = await axios.get(
        `${baseUrl}${endpoint}${separator}page=${currentPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Tambahkan data dari halaman saat ini
      allData = [...allData, ...res.data.content.data];

      // Cek apakah masih ada halaman berikutnya
      hasMorePages = res.data.content.next_page_url !== null;
      currentPage++;
    }

    return allData;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    return [];
  }
}

// Revisi fungsi getCategories
async function getCategories(): Promise<CategoryOption[]> {
  const categories = await getAllPaginatedData("/api/v1/categories");
  return categories.map((category: any) => ({
    id: category.id,
    name: category.name,
  }));
}

const createProduct = async (data: {
  name: string;
  price: number;
  category_id: number;
  stock: number;
  description: string;
  images: string;
}) => {
  const token = Cookies.get("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  try {
    await axios.post(`${baseUrl}/api/v1/products`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export default function SellerProductsPage() {
  const [data, setData] = React.useState<SellerProduct[]>([]);
  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [formData, setFormData] = React.useState({
    name: "",
    price: 0,
    category_id: 0,
    stock: 0,
    description: "",
    images: "",
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [paginationMeta, setPaginationMeta] = React.useState({
    from: 0,
    to: 0,
    hasNext: false,
    hasPrev: false,
    total: 0,
  });
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch product list saat pagination berubah
  const refreshData = async () => {
    try {
      const page = pagination.pageIndex + 1;
      const pageSize = pagination.pageSize;

      const productsResult = await getProducts(page, pageSize);

      setData(productsResult.data);
      setPaginationMeta({
        from: productsResult.from,
        to: productsResult.to,
        hasNext: productsResult.hasNext,
        hasPrev: productsResult.hasPrev,
        total: productsResult.total,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch categories hanya sekali
  React.useEffect(() => {
    const fetchInitialOptions = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchInitialOptions();
  }, []);

  React.useEffect(() => {
    refreshData();
  }, [pagination]);

  const columns = rawColumns(refreshData, categories);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = productSchema.safeParse({
      ...formData,
      images: formData.images,
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      const success = await createProduct({
        name: formData.name,
        price: formData.price,
        category_id: formData.category_id,
        stock: formData.stock,
        description: formData.description,
        images: formData.images,
      });

      if (success) {
        setIsDialogOpen(false);
        setFormData({
          name: "",
          price: 0,
          category_id: 0,
          stock: 0,
          description: "",
          images: "",
        });
        setError(null);
        refreshData();
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "Failed to add product");
      } else {
        setError("Failed to add product, try again.");
      }
      console.error(error);
    }
  };

  return (
    <SidebarProvider>
      <SellerSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/seller">Seller</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Products</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Product +</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                  <DialogDescription>
                    Add a new product to your store
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Product Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="col-span-3"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Price
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      className="col-span-3"
                      placeholder="Enter price"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          category_id: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stock */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">
                      Stock
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: Number(e.target.value),
                        })
                      }
                      className="col-span-3"
                      placeholder="Enter stock quantity"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Enter product description"
                      required
                    />
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="images" className="text-right">
                      Image URL
                    </Label>
                    <Input
                      id="images"
                      value={formData.images}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          images: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Enter image URL"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm col-span-4 text-center">
                      {error}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="flex-1 p-6">
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={data}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
