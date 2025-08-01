import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  seller_id: number;
  category_id: number;
  stock: number;
  is_hidden: boolean;
  description: string;
  images: string[];
  created_at: string;
  updated_at: string;
  category: {
    name: string;
  } | null;
  seller: {
    name: string;
  } | null;
}

type CategoryOption = { id: number; name: string };
type SellerOption = { id: number; name: string };

interface ActionsCellProps {
  product: Product;
  refreshData: () => void;
  categories: CategoryOption[]; // Terima categories dari props
  sellers: SellerOption[]; // Terima sellers dari props
}

// eslint-disable-next-line react-refresh/only-export-components
const ActionsCell: React.FC<ActionsCellProps> = ({
  product,
  refreshData,
  categories, 
  sellers, 
}) => {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(product.name);
  const [price, setPrice] = React.useState(product.price);
  const [sellerId, setSellerId] = React.useState(product.seller_id.toString());
  const [categoryId, setCategoryId] = React.useState(
    product.category_id.toString()
  );
  const [stock, setStock] = React.useState(product.stock);
  const [description, setDescription] = React.useState(product.description);
  const [images, setImages] = React.useState(product.images.join(", "));
  const [error, setError] = React.useState<string | null>(null);


  const toggleVisibility = async () => {
    const token = Cookies.get("token");
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const endpoint = product.is_hidden
      ? `${baseUrl}/api/v1/products/${product.slug}/unhide`
      : `${baseUrl}/api/v1/products/${product.slug}/hide`;

    try {
      await axios.patch(
        endpoint,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      refreshData();
    } catch (error) {
      alert("Failed to toggle visibility");
      console.error(error);
    }
  };
  

  const updateProduct = async () => {
    const token = Cookies.get("token");
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    try {
      // Convert images string to array
      const imagesArray = images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

      await axios.put(
        `${baseUrl}/api/v1/products/${product.slug}`,
        {
          name,
          price,
          seller_id: parseInt(sellerId),
          category_id: parseInt(categoryId),
          stock,
          description,
          images: imagesArray[0] || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOpen(false);
      refreshData();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "Failed to update product");
      } else {
        setError("Failed to update product.");
      }
      console.error(error);
    }
  };

  const destroyProduct = async () => {
    const token = Cookies.get("token");
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    try {
      await axios.delete(`${baseUrl}/api/v1/products/${product.slug}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      refreshData();
    } catch (error) {
      alert("Failed to delete product.");
      console.error(error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Edit Product
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleVisibility}>
            {product.is_hidden ? "Unhide" : "Hide"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={destroyProduct}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Edit Product</SheetTitle>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4 py-6">
            {error && (
              <p className="text-red-500 text-sm col-span-4 text-center">
                {error}
              </p>
            )}

            <div className="grid gap-3">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="edit-category">seller</Label>
              <Select
                value={sellerId}
                onValueChange={(value) => setSellerId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a seller" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem
                      key={seller.id}
                      value={seller.id.toString()}
                    >
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={categoryId}
                onValueChange={(value) => setCategoryId(value)}
              >
                <SelectTrigger>
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

            <div className="grid gap-3">
              <Label htmlFor="edit-stock">Stock</Label>
              <Input
                id="edit-stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="edit-images">Image URLs</Label>
              <Textarea
                id="edit-images"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                placeholder="Enter image URLs separated by commas (first image will be used)"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={updateProduct}>Save Product</Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

// Revisi: tambahkan parameter categories dan sellers
export const columns = (
  refreshData: () => void,
  categories: CategoryOption[],
  sellers: SellerOption[]
): ColumnDef<Product>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `Rp ${row.original.price.toLocaleString()}`,
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => row.original.category?.name || "No Category",
  },
  {
    accessorKey: "seller.name",
    header: "Seller",
    cell: ({ row }) => row.original.seller?.name || "No Seller",
  },
  {
    accessorKey: "is_hidden",
    header: "Hidden",
    cell: ({ row }) => (row.original.is_hidden ? "Yes" : "No"),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        product={row.original}
        refreshData={refreshData}
        categories={categories}
        sellers={sellers}
      />
    ),
  },
];
