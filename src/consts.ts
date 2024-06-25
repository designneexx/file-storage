import * as path from 'path';
import { fileURLToPath } from 'url';
import { MimeType } from '@adobe/pdfservices-node-sdk';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const PDF_FIELD_NAME = 'resume';
export const ALLOWED_MIME_TYPES: string[] = [MimeType.PDF];
export const ALLOWED_EXTENSIONS = ['pdf'];
export const IMAGES = ['png', 'jpg', 'jpeg'];
