"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PieChart,
  BookOpen,
  BarChart3,
  History,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    icon: PieChart,
  },
  {
    title: "Journal",
    href: "/journal",
    icon: BookOpen,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "History",
    href: "/history",
    icon: History,
  },
];

const bottomNavItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-screen flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 ease-out",
          sidebarCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="relative flex h-16 items-center border-b border-border/50 px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-primary/20">
              <Image
                src="/deriverse_logo.jpeg"
                alt="Deriverse Logo"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Deriverse
                </span>
                <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
                  Insight
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return sidebarCollapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex h-11 w-full items-center justify-center rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex h-11 items-center gap-3 rounded-xl px-3 transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                <span className="text-sm font-medium">{item.title}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Bottom Navigation */}
        <div className="relative p-3 space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return sidebarCollapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-full items-center justify-center rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-xl px-3 transition-all duration-200",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Visit Deriverse Button */}
        <div className="relative p-3">
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://www.deriverse.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-600/20 border border-primary/30 text-primary hover:from-violet-500/30 hover:to-purple-600/30 transition-all duration-200"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Visit Deriverse
              </TooltipContent>
            </Tooltip>
          ) : (
            <a
              href="https://www.deriverse.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-600/20 border border-primary/30 text-primary hover:from-violet-500/30 hover:to-purple-600/30 transition-all duration-200 text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Visit Deriverse
            </a>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="relative border-t border-border/50 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "w-full h-10 rounded-xl hover:bg-muted",
              sidebarCollapsed ? "justify-center" : "justify-start px-3"
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
