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
import { SparklesIcon, MessageSquareIcon, FileTextIcon, FolderOpenIcon, Settings2Icon, ScrollTextIcon, BookOpenIcon, FilesIcon } from "lucide-react"

const data = {
  user: {
    name: "Admin",
    email: "admin@cortex.app",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Cortex",
      logo: (
        <SparklesIcon
        />
      ),
      plan: "Pro",
    },
  ],
  navMain: [
    {
      title: "Chat",
      url: "/dashboard",
      icon: (
        <MessageSquareIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "New Chat",
          url: "/dashboard",
        },
        {
          title: "History",
          url: "#",
        },
      ],
    },
    {
      title: "Documents",
      url: "#",
      icon: (
        <FileTextIcon
        />
      ),
      items: [
        {
          title: "All Documents",
          url: "#",
        },
        {
          title: "Scan Docs",
          url: "/dashboard",
        },
        {
          title: "Upload",
          url: "#",
        },
      ],
    },
    {
      title: "Collections",
      url: "#",
      icon: (
        <FolderOpenIcon
        />
      ),
      items: [
        {
          title: "Research Papers",
          url: "#",
        },
        {
          title: "Technical Docs",
          url: "#",
        },
        {
          title: "Meeting Notes",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "API Keys",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Research Papers",
      url: "#",
      icon: (
        <ScrollTextIcon
        />
      ),
    },
    {
      name: "Technical Docs",
      url: "#",
      icon: (
        <BookOpenIcon
        />
      ),
    },
    {
      name: "Meeting Transcripts",
      url: "#",
      icon: (
        <FilesIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
