import 'dotenv/config';

const DEFAULT_PORT = 3002;

export const enviroments = {
  pdfServicesClientId: process.env.PDF_SERVICES_CLIENT_ID || '',
  pdfServicesClientSecret: process.env.PDF_SERVICES_CLIENT_SECRET || '',
  port: process.env.PORT || DEFAULT_PORT
};
