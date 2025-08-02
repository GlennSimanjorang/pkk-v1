import React, { useState, useEffect } from "react";
import { Menu, Search, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  items?: MenuItem[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface Major {
  id: number;
  name: string;
  categories: Category[];
}

interface User {
  id: number;
  name: string;
  profile_picture: string | null;
}

interface NavbarProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
  };
}

const Navbar = ({
  logo = {
    url: "/",
    src: "https://preloved.com/logo.svg",
    alt: "TB Pedia",
  },
}: NavbarProps) => {
  const [majorsMenu, setMajorsMenu] = useState<MenuItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");

    // Ambil data user dari /v1/auth/self
    const fetchUser = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${baseUrl}/api/v1/auth/self`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setUser(response.data.content);
        }
      } catch (err) {
        console.error("Gagal ambil data user:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    // Ambil data majors
    const fetchMajors = async () => {
      if (!token) {
        setLoadingMenu(false);
        return;
      }
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${baseUrl}/api/v1/majors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          const majorsData: Major[] = response.data.content.data;
          const transformedMenu = majorsData.map((major) => ({
            title: major.name,
            url: `/majors/${major.id}`,
            items: major.categories.map((category) => ({
              title: category.name,
              url: `/category/${category.slug}`,
              description: category.description,
            })),
          }));
          setMajorsMenu(transformedMenu);
        }
      } catch (err) {
        console.error("Gagal ambil majors:", err);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchUser();
    fetchMajors();
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    setUser(null);
    window.location.href = "/login";
  };

  // Avatar dengan dropdown logout
  const AuthAvatar = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profile_picture || ""} alt={user?.name} />
            <AvatarFallback>
              {user?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleLogout} className="text-sm">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <header className="bg-white">
        <div className="container mx-auto">
          {/* Baris Pertama */}
          <div className="flex h-15 items-center justify-between pl-12 pr-5">
            {/* Logo */}
            <div className="flex items-center">
              <a href={logo.url} className="flex items-center">
                <img src={logo.src} className="h-8" alt={logo.alt} />
              </a>
            </div>

            {/* Search Bar Desktop */}
            <div className="hidden md:flex flex-1 justify-center max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="search"
                  placeholder="Cari Jersey..."
                  className="flex h-10 w-full rounded-md bg-background px-10 py-2 text-sm ring-2 ring-ring ring-offset-2 ring-offset-background placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            {/* Mobile Menu & Avatar */}
            <div className="flex items-center gap-4">
              {/* Search Mobile */}
              <div className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {/* Avatar (Desktop) */}
              <div className="hidden md:flex">
                {!loadingUser && user && <AuthAvatar />}
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>
                        <a href={logo.url}>
                          <img src={logo.src} className="h-8" alt={logo.alt} />
                        </a>
                      </SheetTitle>
                    </SheetHeader>

                    {/* Search Mobile */}
                    <div className="mt-4 flex items-center rounded-md border px-3">
                      <Search className="h-4 w-4 text-gray-500" />
                      <input
                        type="search"
                        placeholder="Cari Jersey..."
                        className="ml-2 flex-1 py-3 text-sm outline-none bg-transparent border-none"
                      />
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                      {loadingMenu && <p>Loading menu...</p>}

                      {!loadingMenu && (
                        <Accordion type="single" collapsible className="w-full">
                          {majorsMenu.map((item) => renderMobileMenuItem(item))}
                        </Accordion>
                      )}

                      {/* Hanya tampilkan Logout jika user login */}
                      {!loadingUser && user && (
                        <Button variant="outline" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Baris Kedua: Navigation Menu */}
          <div className="hidden md:flex items-center pl-12 pr-4">
            {!loadingMenu && (
              <NavigationMenu>
                <NavigationMenuList className="space-x-6">
                  {majorsMenu.map((item) => renderDesktopMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
        </div>
      </header>

      {/* Garis tipis di bawah navbar */}
      <hr className="border-t border-gray-200" />
    </>
  );
};

// Fungsi render menu (tetap sama)
const renderDesktopMenuItem = (item: MenuItem) => {
  if (item.items && item.items.length > 0) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent px-0 py-1 h-auto">
          <span className="font-normal text-sm text-gray-700 hover:text-gray-900 transition-colors">
            {item.title}
          </span>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
            {item.items.map((subItem) => (
              <ListItem
                key={subItem.title}
                href={subItem.url}
                title={subItem.title}
              >
                {subItem.description}
              </ListItem>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }
  return (
    <NavigationMenuItem key={item.title}>
      <a
        href={item.url}
        className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-normal"
      >
        {item.title}
      </a>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items && item.items.length > 0) {
    return (
      <AccordionItem value={item.title} key={item.title}>
        <AccordionTrigger className="py-3 hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent>
          <div className="ml-4 flex flex-col gap-2">
            {item.items.map((subItem) => (
              <a
                key={subItem.title}
                href={subItem.url}
                className="block rounded-md p-2 hover:bg-gray-100"
              >
                {subItem.title}
              </a>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }
  return (
    <a
      key={item.title}
      href={item.url}
      className="px-4 py-3 font-medium block hover:bg-gray-50 rounded-md"
    >
      {item.title}
    </a>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100"
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export { Navbar };
