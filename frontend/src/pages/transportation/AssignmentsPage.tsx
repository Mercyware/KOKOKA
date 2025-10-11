import Layout from '../../components/layout/Layout';
import { PageContainer, PageHeader, PageTitle, PageDescription, PageContent } from '@/components/ui/Page';
import AssignmentsTab from './components/AssignmentsTab';

export default function AssignmentsPage() {
  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitle>Student Transport Assignments</PageTitle>
          <PageDescription>
            Manage student assignments to routes and vehicles
          </PageDescription>
        </PageHeader>
        <PageContent>
          <AssignmentsTab />
        </PageContent>
      </PageContainer>
    </Layout>
  );
}
