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
import { Badge } from "@/components/ui/badge";

export interface Order {
  id: number;
  code: string;
  status: "pending" | "onprogress" | "finished";
  total_amount: number;
  buyer_id: number;
  created_at: string;
  updated_at: string;
  buyer: {
    id: number;
    name: string;
    phone_number: string | null;
    store_name: string | null;
  };
  order_items: {
    id: number;
    quantity: number;
    subtotal: number;
    product: {
      id: number;
      name: string;
      price: number;
      images: string;
    };
  }[];
}

interface ActionsCellProps {
  order: Order;
  onStatusChange: (
    orderId: number,
    status: "pending" | "onprogress" | "finished"
  ) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
const ActionsCell: React.FC<ActionsCellProps> = ({ order, onStatusChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onStatusChange(order.id, "pending")}
          disabled={order.status === "pending"}
        >
          Set as Pending
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusChange(order.id, "onprogress")}
          disabled={order.status === "onprogress"}
        >
          Set as On Progress
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusChange(order.id, "finished")}
          disabled={order.status === "finished"}
        >
          Set as Finished
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns = (
  onStatusChange: (
    orderId: number,
    status: "pending" | "onprogress" | "finished"
  ) => void
): ColumnDef<Order>[] => [
  {
    accessorKey: "code",
    header: "Order Code",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | null
        | undefined = "secondary";

      switch (status) {
        case "pending":
          variant = "destructive";
          break;
        case "onprogress":
          variant = "secondary";
          break;
        case "finished":
          variant = "default";
          break;
        default:
          variant = "secondary";
      }

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "buyer.name",
    header: "Customer",
    cell: ({ row }) => row.original.buyer?.name || "N/A",
  },
  {
    accessorKey: "total_amount",
    header: "Total Amount",
    cell: ({ row }) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(row.original.total_amount),
  },
  {
    accessorKey: "created_at",
    header: "Order Date",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString("id-ID"),
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => (
      <div className="max-w-xs">
        {row.original.order_items.map((item) => (
          <div key={item.id} className="flex items-center py-1">
            <div className="mr-2 h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
              {item.product.images ? (
                <img
                  src={item.product.images}
                  alt={item.product.name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-full w-full h-full" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{item.product.name}</p>
              <p className="text-xs text-gray-500">
                {item.quantity} ×{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(item.product.price)}
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell order={row.original} onStatusChange={onStatusChange} />
    ),
  },
];
