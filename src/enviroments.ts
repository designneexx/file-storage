import 'dotenv/config';

const DEFAULT_PORT = 3002;

export const enviroments = {
  pdfServicesClientId: process.env.PDF_SERVICES_CLIENT_ID || '',
  pdfServicesClientSecret: process.env.PDF_SERVICES_CLIENT_SECRET || '',
  port: Number(process.env.PORT) || DEFAULT_PORT,
  yandexBucketName: process.env.YANDEX_BUCKET_NAME || '',
  yandexKeyId: process.env.YANDEX_KEY_ID || '',
  yandexKeySecret: process.env.YANDEX_KEY_SECRET || ''
};
