import { useParams } from 'react-router-dom';
import ServicePageLayout from '../layouts/ServicePageLayout';
import { SERVICES_DATA } from '../data/servicesData';

export default function ServicePage() {
  const { serviceId } = useParams();
  
  // Find the specific service data based on the URL parameter
  const serviceData = serviceId ? SERVICES_DATA[serviceId] : null;

  if (!serviceData) {
    return (
      <div style={{ padding: '8rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
        <h1>Service Not Found</h1>
        <p>The service you are looking for does not exist.</p>
      </div>
    );
  }

  return <ServicePageLayout serviceData={serviceData} />;
}
