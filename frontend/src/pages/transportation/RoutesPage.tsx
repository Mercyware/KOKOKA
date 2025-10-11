import Layout from '../../components/layout/Layout';
import { PageContainer, PageHeader, PageTitle, PageDescription, PageContent } from '@/components/ui/Page';
import RoutesTab from './components/RoutesTab';

export default function RoutesPage() {
  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitle>Transport Routes</PageTitle>
          <PageDescription>
            Manage school bus routes and schedules
          </PageDescription>
        </PageHeader>
        <PageContent>
          <RoutesTab />
        </PageContent>
      </PageContainer>
    </Layout>
  );
}
