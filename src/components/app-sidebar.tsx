"use client"

import * as React from "react"
import {
  Command,
  LifeBuoy,
  Send,
  Settings2,
  Navigation,
  Key
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUser } from "@/hooks/firebase-hooks"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const data = {
    user: {
      name: user?.displayName ?? 'User',
      email: user?.email ?? 'user@gmail.com',
      avatar: user?.photoURL ?? '',
    },
    navMain: [
      {
        title: "Pages",
        url: "#",
        icon: Navigation,
        items: [
          {
            title: "Generate Interivew",
            url: "/dashboard/generate-question-page",
          },
          {
            title: "Interview Generated",
            url: "/dashboard/generate-question-page",
          },

        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "API Keys",
            url: "/dashboard/api-keys",
            icon: Key,
          },
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
          },
        ],
      }
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    GeneratedQuestion: [
      {
        name: "Travel",
        url: "#",
      },
    ],
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Interview Practice</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="flex flex-col items-center gap-2 p-2">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
