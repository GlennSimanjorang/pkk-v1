import * as React from "react";
import {
  Bot,
  SquareTerminal,
  ShoppingBag,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/seller/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Products",
      url: "/seller/products",
      icon: Bot,
    },
    {
      title: "Orders",
      url: "/seller/orders",
      icon: ShoppingBag,
    },
  ],
};

export function SellerSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const [userData, setUserData] = React.useState<{
    name: string;
    role: string;
    avatar: string;
  } | null>(null);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;

        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        const response = await axios.get(`${baseUrl}/api/v1/auth/self`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const user = response.data.content;
          setUserData({
            name: user.name,
            role: `Role: ${user.role}`,
            avatar: user.profile_picture || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {state !== "collapsed" && (
          <div className="px-4 py-3 text-lg font-semibold">TB Pedia</div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {userData ? (
          <NavUser user={userData} />
        ) : (
          <div className="flex items-center gap-3 p-2">
            <div className="bg-muted h-10 w-10 animate-pulse rounded-lg" />
            <div className="grid gap-1.5">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
