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
import { DataTable } from "./data-table";
import axios from "axios";
import Cookies from "js-cookie";
import type { PaginationState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { columns } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Order = {
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
};

async function getOrders(
  page: number,
  pageSize: number,
  status?: string
): Promise<{
  data: Order[];
  from: number;
  to: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
}> {
  const token = Cookies.get("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  try {
    let url = `${baseUrl}/api/v1/orders?page=${page}&per_page=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }

    const res = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: res.data.content.data,
      from: res.data.content.from,
      to: res.data.content.to,
      hasNext: !!res.data.content.next_page_url,
      hasPrev: !!res.data.content.prev_page_url,
      total: res.data.content.total,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
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

async function updateOrderStatus(
  orderId: number,
  status: "pending" | "onprogress" | "finished"
) {
  const token = Cookies.get("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  try {
    await axios.patch(
      `${baseUrl}/api/v1/orders/${orderId}/update?status=${status}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

export default function OrdersPage() {
  const [data, setData] = React.useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("");
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

  const refreshData = React.useCallback(async () => {
    try {
      const page = pagination.pageIndex + 1;
      const pageSize = pagination.pageSize;

      const ordersResult = await getOrders(page, pageSize, statusFilter);

      setData(ordersResult.data);
      setPaginationMeta({
        from: ordersResult.from,
        to: ordersResult.to,
        hasNext: ordersResult.hasNext,
        hasPrev: ordersResult.hasPrev,
        total: ordersResult.total,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [pagination, statusFilter]);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleStatusChange = async (
    orderId: number,
    newStatus: "pending" | "onprogress" | "finished"
  ) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      refreshData();
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
                  <BreadcrumbPage>Orders</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Label htmlFor="status-filter" className="mr-2">
                Status:
              </Label>
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="onprogress">On Progress</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6">
          <div className="container mx-auto">
            <DataTable
              columns={columns(handleStatusChange)}
              data={data}
              pagination={pagination}
              onPaginationChange={setPagination}
              from={paginationMeta.from}
              to={paginationMeta.to}
              hasNext={paginationMeta.hasNext}
              hasPrev={paginationMeta.hasPrev}
              total={paginationMeta.total}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
