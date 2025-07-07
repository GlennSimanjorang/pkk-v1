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
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export interface Major {
  id: number;
  name: string;
  is_hidden: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ActionsCellProps {
  major: Major;
  refreshData: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
const ActionsCell: React.FC<ActionsCellProps> = ({ major, refreshData }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(major.name);
  const [description, setDescription] = useState(major.description);

  const toggleVisibility = async () => {
    const token = Cookies.get("token");
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const endpoint = major.is_hidden ? 
      `${baseUrl}/api/v1/majors/${major.name}/unhide` :
      `${baseUrl}/api/v1/majors/${major.name}/hide`;

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

  const updateMajor = async () => {
    const token = Cookies.get("token");
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    try {
      await axios.put(
        `${baseUrl}/api/v1/majors/${major.id}`,
        { name, description },
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
      alert("Failed to update major.");
      console.error(error);
    }
  };

  const destroyMajor = async () => {
    const token = Cookies.get("token");
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    try {
      await axios.delete(`${baseUrl}/api/v1/majors/${major.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      refreshData();
    } catch (error) {
      alert("Failed to delete major.");
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
            Edit Major
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleVisibility}>
            {major.is_hidden ? "Unhide" : "Hide"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={destroyMajor}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Major</SheetTitle>
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
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={updateMajor}>Save Major</Button>
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

export const columns = (refreshData: () => void): ColumnDef<Major>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "is_hidden",
    header: "Hidden",
    cell: ({ row }) => (row.original.is_hidden ? "Yes" : "No"),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.original.description}</div>
    ),
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
      <ActionsCell major={row.original} refreshData={refreshData} />
    ),
  },
];