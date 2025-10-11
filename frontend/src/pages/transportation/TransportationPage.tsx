import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { PageContainer, PageHeader, PageTitle, PageDescription, PageContent } from '@/components/ui/Page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Bus, Car, Users, Wrench } from 'lucide-react';
import RoutesTab from './components/RoutesTab';
import VehiclesTab from './components/VehiclesTab';
import AssignmentsTab from './components/AssignmentsTab';

export default function TransportationPage() {
  const [activeTab, setActiveTab] = useState('routes');

  return (
    <Layout>
      <PageContainer>
      <PageHeader>
        <PageTitle>Transportation Management</PageTitle>
        <PageDescription>
          Manage routes, vehicles, and student transport assignments
        </PageDescription>
      </PageHeader>

      <PageContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="routes" className="flex items-center gap-2">
              <Bus className="h-4 w-4" />
              Routes
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Student Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="space-y-4">
            <RoutesTab />
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <VehiclesTab />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <AssignmentsTab />
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageContainer>
    </Layout>
  );
}
