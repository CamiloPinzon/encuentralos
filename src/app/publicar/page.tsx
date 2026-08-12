import { getDepartments } from '@/actions/location-actions';
import { PublicarClient } from '@/components/PublicarClient';

export default async function PublicarPage() {
  const departments = await getDepartments();

  return <PublicarClient departments={departments} />;
}
