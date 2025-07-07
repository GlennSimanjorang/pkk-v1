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

const majorSchema = z.object({
  name: z.string().min(4, "Name is required"),
  description: z.string().optional(),
});

export type Major = {
  id: number;
  name: string;
  is_hidden: boolean;
  description: string;
  created_at: string;
  updated_at: string;
};

async function getMajors(): Promise<Major[]> {
  const token = Cookies.get("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  try {
    const res = await axios.get(`${baseUrl}/api/v1/majors`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    
    return res.data.content.data.map((major: any) => ({
      ...major,
      is_hidden: Boolean(major.is_hidden),
    }));
  } catch (error) {
    console.error("Error fetching majors:", error);
    return [];
  }
}

const createMajor = async (name: string) => {
  const token = Cookies.get("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  try {
    await axios.post(
      `${baseUrl}/api/v1/majors`,
      { name },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error creating major:", error);
    throw error;
  }
};

export default function MajorsPage() {
  const [data, setData] = React.useState<Major[]>([]);
  const [majorName, setMajorName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refreshData = () => {
    getMajors().then(setData).catch(console.error);
  };

  React.useEffect(() => {
    refreshData();
  }, []);

  const columns = rawColumns(refreshData);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = majorSchema.safeParse({ name: majorName });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      await createMajor(majorName);
      setIsDialogOpen(false);
      setMajorName("");
      setError(null);
      refreshData();
    } catch (error) {
      setError("Failed to add major, try again.");
      console.error(error);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between px-4 ">
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
                  <BreadcrumbPage>Majors</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Major +</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Major</DialogTitle>
                  <DialogDescription>
                    Add a new major to organize your content
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={majorName}
                      onChange={(e) => setMajorName(e.target.value)}
                      className="col-span-3"
                      placeholder="Enter major name"
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

        {/* Konten utama - Data Table */}
        <div className="flex-1 p-6">
          <div className="container mx-auto">
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
