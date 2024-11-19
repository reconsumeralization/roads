'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  HardHat,
  Truck,
  AlertTriangle,
  Calendar,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'

const navigationItems = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    url: '/projects',
    icon: HardHat,
  },
  {
    name: 'Equipment',
    url: '/equipment',
    icon: Truck,
  },
  {
    name: 'Safety Reports',
    url: '/safety',
    icon: AlertTriangle,
  },
  {
    name: 'Schedule',
    url: '/schedule',
    icon: Calendar,
  },
  {
    name: 'Settings',
    url: '/settings',
    icon: Settings,
  },
]

export function ProjectSidebar() {
  const [open, setOpen] = useState(true)

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between px-4">
          <Button
            onClick={() => setOpen((open) => !open)}
            size="sm"
            variant="ghost"
          >
            {open ? <PanelLeftClose /> : <PanelLeftOpen />}
            <span className="ml-2">{open ? 'Close' : 'Open'} Sidebar</span>
          </Button>
        </header>
      </SidebarInset>
    </SidebarProvider>
  )
}
