import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Amdox AI-Powered Cloud ERP API',
      version: '1.0.0',
      description: 'Comprehensive REST API documentation for the Enterprise ERP suite. All resource endpoints are isolated by Tenant boundary.',
      contact: {
        name: 'Technical Support',
        email: 'dev@amdox-erp.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token issued during login/registration.',
        },
        tenantIdHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'x-tenant-id',
          description: 'Unique database identifier or subdomain for the tenant scope.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        tenantIdHeader: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js', './dist/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
