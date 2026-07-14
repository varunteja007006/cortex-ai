"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/api/auth/query"
import { SparklesIcon, MessageSquareIcon, FileTextIcon, FolderOpenIcon, Settings2Icon, ScrollTextIcon, BookOpenIcon, FilesIcon } from "lucide-react"

const teams = [
  {
    name: "Cortex",
    logo: <SparklesIcon />,
    plan: "Pro",
  },
]

const navMain = [
  {
    title: "Chat",
    url: "/dashboard",
    icon: <MessageSquareIcon />,
    isActive: true,
    items: [
      { title: "New Chat", url: "/dashboard" },
      { title: "History", url: "#" },
    ],
  },
  {
    title: "Documents",
    url: "#",
    icon: <FileTextIcon />,
    items: [
      { title: "All Documents", url: "#" },
      { title: "Scan Docs", url: "/dashboard" },
      { title: "Upload", url: "#" },
    ],
  },
  {
    title: "Collections",
    url: "#",
    icon: <FolderOpenIcon />,
    items: [
      { title: "Research Papers", url: "#" },
      { title: "Technical Docs", url: "#" },
      { title: "Meeting Notes", url: "#" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: <Settings2Icon />,
    items: [
      { title: "General", url: "#" },
      { title: "API Keys", url: "#" },
      { title: "Billing", url: "#" },
    ],
  },
]

const projects = [
  { name: "Research Papers", url: "#", icon: <ScrollTextIcon /> },
  { name: "Technical Docs", url: "#", icon: <BookOpenIcon /> },
  { name: "Meeting Transcripts", url: "#", icon: <FilesIcon /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isLoading } = useSession()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <div className="flex items-center gap-2 px-2 py-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="grid flex-1 gap-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
        ) : session?.user ? (
          <NavUser user={session.user} />
        ) : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
