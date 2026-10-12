"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import dayjs from "dayjs";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/routes";

export default function LayoutProvider({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const currentDate = dayjs().format("YYYY-MM-DD");

  let title = "";
  switch (pathname) {
    case ROUTES.HOME:
      title = "Dashboard";
      break;
    case ROUTES.FARMERS:
      title = "Farmers Management";
      break;
    case ROUTES.FIELDS:
      title = "Fields Management";
      break;
    case ROUTES.CROPS:
      title = "Crops Management";
      break;
    case ROUTES.ANIMALS:
      title = "Animals Management";
      break;
    case ROUTES.EQUIPMENT:
      title = "Equipment Management";
      break;
    case ROUTES.TRANSACTIONS:
      title = "Transactions Management";
      break;
    default:
      title = "";
      break;
  }

  return (
    <div
      className={cn(
        "h-screen bg-background text-foreground transition-colors overflow-hidden"
      )}
    >
      <header
        className={cn(
          "fixed top-0 left-0 right-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20 border-border"
        )}
      >
        <div className="mx-auto w-full max-w-[70%] flex justify-between items-center py-3 px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="App Logo"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground/60">{currentDate}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>
      <aside className="fixed left-0 top-[57px] bottom-0 w-60 border-r border-border bg-secondary-background/50 backdrop-blur overflow-y-auto">
        <Sidebar />
      </aside>
      <main className="ml-60 mt-[57px] p-6 h-[calc(100vh-57px)] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
