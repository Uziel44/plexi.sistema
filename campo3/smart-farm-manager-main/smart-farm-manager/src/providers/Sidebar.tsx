"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/utils/routes";
import {
  Home,
  Users2,
  Grid2x2X,
  Wheat,
  Dog,
  Cog,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { text: "Home", icon: Home, href: ROUTES.HOME },
    { text: "Farmers", icon: Users2, href: ROUTES.FARMERS },
    { text: "Fields", icon: Grid2x2X, href: ROUTES.FIELDS },
    { text: "Crops", icon: Wheat, href: ROUTES.CROPS },
    { text: "Animals", icon: Dog, href: ROUTES.ANIMALS },
    { text: "Equipment", icon: Cog, href: ROUTES.EQUIPMENT },
    { text: "Transactions", icon: ArrowLeftRight, href: ROUTES.TRANSACTIONS },
  ];

  return (
    <div className="flex flex-col h-full py-4">
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.text}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {/* Hover effect background */}
              {!isActive && (
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              )}

              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full" />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200 relative z-10",
                  !isActive && "group-hover:scale-110"
                )}
              />
              <span className="relative z-10">{item.text}</span>

              {/* Subtle shine effect on hover */}
              {!isActive && (
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Optional: Bottom section for user profile or settings */}
      <div className="px-3 pt-4 border-t mt-auto">
        <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-xs">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">User Name</p>
            <p className="text-xs truncate">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
