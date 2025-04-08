import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { swaggerConfig } from '../swagger/swagger.config';

export const loader = async () => {
  return json({ swaggerConfig });
};

export default function ApiDocs() {
  const { swaggerConfig } = useLoaderData<typeof loader>();

  return (
    <div style={{ height: '100vh' }}>
      <SwaggerUI spec={swaggerConfig} />
    </div>
  );
}

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/swagger-ui-react/swagger-ui.css',
    },
  ];
} 