import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { IndividualSessionsManager } from '@/components/admin-individual/IndividualSessionsManager';
import { ShortProgramsManager } from '@/components/admin-individual/ShortProgramsManager';
import { FinancialToolsManager } from '@/components/admin-individual/FinancialToolsManager';
import { Video, BookOpen, Settings, Users } from 'lucide-react';
import { ClientSessionsManager } from '@/components/admin-individual/ClientSessionsManager';

export default function AdminIndividual() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar userType="admin" />
        
        <SidebarInset>
          <header className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Individual Management</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Individual Management</h1>
        <p className="text-muted-foreground">Manage 1-on-1 sessions, short programs, and financial tools</p>
      </div>

      <Tabs defaultValue="one-on-one" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="one-on-one" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            1-on-1 Sessions
          </TabsTrigger>
          <TabsTrigger value="short-programs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Short Programs
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Financial Tools
          </TabsTrigger>
          <TabsTrigger value="client-sessions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Client Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="one-on-one">
          <Card>
            <CardHeader>
              <CardTitle>1-on-1 Sessions Management</CardTitle>
            </CardHeader>
            <CardContent>
              <IndividualSessionsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="short-programs">
          <Card>
            <CardHeader>
              <CardTitle>Short Programs Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ShortProgramsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Financial Tools Management</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialToolsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client-sessions">
          <Card>
            <CardHeader>
              <CardTitle>Client Sessions Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientSessionsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}