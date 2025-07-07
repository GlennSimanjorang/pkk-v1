import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categorySchema = z.object({
  name: z.string().min(4, "Name is required"),
  major_id: z.number().min(1, "Major is required"),
  description: z.string().min(10, "Description is required"),
});

export type Category = {
  id: number;
  name: string;
  slug: string;
  major_id: number;
  description: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  major: {
    id: number;
    name: string;
  } | null;
};

type MajorOption = {
  id: number;
  name: string;
};

async function getCategories(page = 1): Promise<{
  data: Category[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}> {
  const token = Cookies.get("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const res = await axios.get(`${baseUrl}/api/v1/categories?page=${page}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    data: res.data.content.data.map((category: any) => ({
      ...category,
      is_hidden: Boolean(category.is_hidden),
    })),
    meta: {
      current_page: res.data.content.current_page,
      last_page: Math.ceil(res.data.content.total / res.data.content.per_page),
      total: res.data.content.total,
      per_page: res.data.content.per_page,
    },
  };
}

async function getMajors(): Promise<MajorOption[]> {
  const token = Cookies.get("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const res = await axios.get(`${baseUrl}/api/v1/majors`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.content.data.map((major: any) => ({
    id: major.id,
    name: major.name,
  }));
}

const createCategory = async (data: {
  name: string;
  major_id: number;
  description: string;
}) => {
  const token = Cookies.get("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  try {
    await axios.post(`${baseUrl}/api/v1/categories`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export default function CategoriesPage() {
  const [data, setData] = React.useState<Category[]>([]);
  const [majors, setMajors] = React.useState<MajorOption[]>([]);
  const [formData, setFormData] = React.useState({
    name: "",
    major_id: 0,
    description: "",
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });

  const fetchData = async (page = 1) => {
    try {
      const [{ data, meta }, majors] = await Promise.all([
        getCategories(page),
        getMajors(),
      ]);
      setData(data);
      setMeta(meta);
      setMajors(majors);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const columns = rawColumns(() => fetchData(meta.current_page), majors);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = categorySchema.safeParse({
      name: formData.name,
      major_id: formData.major_id,
      description: formData.description,
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      await createCategory({
        name: formData.name,
        major_id: formData.major_id,
        description: formData.description,
      });
      setIsDialogOpen(false);
      setFormData({ name: "", major_id: 0, description: "" });
      setError(null);
      fetchData(meta.current_page);
    } catch (error) {
      setError("Failed to add category, try again.");
      console.error(error);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
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
                  <BreadcrumbPage>Categories</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Category +</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                  <DialogDescription>
                    Add a new category to organize your content
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                      placeholder="Enter category name"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="major" className="text-right">
                      Major
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          major_id: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a major" />
                      </SelectTrigger>
                      <SelectContent>
                        {majors.map((major) => (
                          <SelectItem
                            key={major.id}
                            value={major.id.toString()}
                          >
                            {major.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="Enter description"
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
              meta={meta}
              onPageChange={(page) => fetchData(page)}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
