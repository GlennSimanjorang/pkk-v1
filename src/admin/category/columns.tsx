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
  import React, { useState } from "react";
  import axios from "axios";
  import Cookies from "js-cookie";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";

  export interface Category {
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
  }

  interface ActionsCellProps {
    category: Category;
    refreshData: () => void;
    majors: { id: number; name: string }[];
  }

  // eslint-disable-next-line react-refresh/only-export-components
  const ActionsCell: React.FC<ActionsCellProps> = ({
    category,
    refreshData,
    majors,
  }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(category.name);
    const [description, setDescription] = useState(category.description);
    const [majorId, setMajorId] = useState(category.major_id.toString());

    const toggleVisibility = async () => {
      const token = Cookies.get("token");
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const endpoint = category.is_hidden
        ? `${baseUrl}/api/v1/categories/${category.slug}/unhide` :
          `${baseUrl}/api/v1/categories/${category.slug}/hide`;

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

    const updateCategory = async () => {
      const token = Cookies.get("token");
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      try {
        await axios.put(
          `${baseUrl}/api/v1/categories/${category.slug}`,
          {
            name,
            description,
            major_id: parseInt(majorId),
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
      } catch (error) {
        alert("Failed to update category.");
        console.error(error);
      }
    };

    const destroyCategory = async () => {
      const token = Cookies.get("token");
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      try {
        await axios.delete(`${baseUrl}/api/v1/categories/${category.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        refreshData();
      } catch (error) {
        alert("Failed to delete category.");
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
              Edit Category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleVisibility}>
              {category.is_hidden ? "Unhide" : "Hide"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={destroyCategory}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Category</SheetTitle>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-6 px-4 py-6">
              <div className="grid gap-3">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="edit-major">Major</Label>
                <Select
                  value={majorId}
                  onValueChange={(value) => setMajorId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a major" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((major) => (
                      <SelectItem key={major.id} value={major.id.toString()}>
                        {major.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={updateCategory}>Save Category</Button>
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

  export const columns = (
    refreshData: () => void,
    majors: { id: number; name: string }[]
  ): ColumnDef<Category>[] => [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "major.name",
      header: "Major",
      cell: ({ row }) => row.original.major?.name || "No Major",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.original.description}</div>
      ),
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
      accessorKey: "updated_at",
      header: "Updated At",
      cell: ({ row }) => new Date(row.original.updated_at).toLocaleString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionsCell
          category={row.original}
          refreshData={refreshData}
          majors={majors}
        />
      ),
    },
  ];
