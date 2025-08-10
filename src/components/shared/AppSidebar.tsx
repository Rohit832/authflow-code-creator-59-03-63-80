
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  User,
  MessageSquare, 
  FileText, 
  BarChart3, 
  CreditCard, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Coins,
  HelpCircle,
  UserCheck
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  userType: 'admin' | 'client';
}

const adminMenuItems = [
  { title: 'Home', url: '/admin-dashboard', icon: Home },
  { title: 'Client Registration', url: '/admin-client-registration', icon: Users },
  { title: 'Availability', url: '/admin-availability', icon: Calendar },
  { title: 'Consult Slot', url: '/admin-sessions', icon: Calendar },
  { title: 'Clients', url: '/admin-clients', icon: Users },
  { title: 'Coaches', url: '/admin-coaches', icon: UserCheck },
  { title: 'Individual', url: '/admin-individual', icon: User },
  { title: 'Chat with Individual', url: '/admin-individual-chat', icon: MessageSquare },
  { title: 'Messages', url: '/admin-messages', icon: MessageSquare },
  { title: 'Inquiry', url: '/admin-inquire', icon: HelpCircle },
  { title: 'Assignments', url: '/admin-assignments', icon: FileText },
  { title: 'Insights', url: '/admin-insights', icon: BarChart3 },
  { title: 'Credits', url: '/admin-credits', icon: Coins },
  { title: 'Billing Information', url: '/admin-billing', icon: CreditCard },
  { title: 'Settings', url: '/admin-settings', icon: Settings },
];

const clientMenuItems = [
  { title: 'Home', url: '/client/dashboard', icon: Home },
  { title: 'Content library', url: '/client/content', icon: FileText },
];

export function AppSidebar({ userType }: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const menuItems = userType === 'admin' ? adminMenuItems : clientMenuItems;
  const isCollapsed = state === 'collapsed';
  
  const isActive = (path: string) => currentPath === path;
  
  return (
    <Sidebar className="border-r-0 bg-white shadow-sm" style={{ width: isCollapsed ? '70px' : '240px' }}>
      <SidebarContent className="bg-white">
        {/* Simple Header */}
        <div className="p-4 border-b border-gray-100">
          {!isCollapsed ? (
            <div className="text-lg font-bold text-gray-900">
              finsage
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">F</span>
            </div>
          )}
        </div>
        
        {/* Clean Navigation */}
        <SidebarGroup className="flex-1 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-3">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <SidebarMenuButton asChild>
                     <NavLink 
                      to={item.url} 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200 rounded-lg",
                        "hover:bg-gray-100",
                        isActive(item.url)
                          ? "text-white bg-primary font-medium" 
                          : "text-gray-700 hover:text-gray-900"
                      )}
                      title={item.title}
                    >
                      <item.icon className={cn(
                        "h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                        isActive(item.url) ? "text-white" : ""
                      )} />
                      {!isCollapsed && (
                        <span className="transition-all duration-300 group-hover:font-medium">
                          {item.title}
                        </span>
                      )}
                      {isActive(item.url) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full transition-all duration-300"></div>
                      )}
                      {isCollapsed && (
                        <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none transform translate-x-2 group-hover:translate-x-0">
                          {item.title}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Simple Resources */}
        {!isCollapsed && userType === 'admin' && (
          <div className="p-4 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-2">RESOURCES</div>
            <div className="space-y-1 text-xs">
              <div className="text-gray-500 hover:text-gray-700 cursor-pointer py-1">
                Provider FAQ
              </div>
              <div className="text-gray-500 hover:text-gray-700 cursor-pointer py-1">
                Provider Handbook
              </div>
            </div>
          </div>
        )}
        
        {/* Toggle Button */}
        <div className="p-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
