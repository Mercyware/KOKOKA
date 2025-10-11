import Layout from '../../components/layout/Layout';
import { PageContainer, PageHeader, PageTitle, PageDescription, PageContent } from '@/components/ui/Page';
import VehiclesTab from './components/VehiclesTab';

export default function VehiclesPage() {
  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitle>Vehicles</PageTitle>
          <PageDescription>
            Manage school fleet and vehicle information
          </PageDescription>
        </PageHeader>
        <PageContent>
          <VehiclesTab />
        </PageContent>
      </PageContainer>
    </Layout>
  );
}
