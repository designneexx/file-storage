import fs from 'fs';
import {
  ExtractElementType,
  ExtractPDFJob,
  ExtractPDFParams,
  ExtractPDFResult,
  ExtractRenditionsElementType,
  MimeType,
  PDFServices,
  ServicePrincipalCredentials
} from '@adobe/pdfservices-node-sdk';
import AdmZip, { IZipEntry } from 'adm-zip';
import cors from 'cors';
import EasyYandexS3 from 'easy-yandex-s3';
import express from 'express';
import { getTextExtractor } from 'office-text-extractor';
import { PDF_FIELD_NAME } from './consts.js';
import { enviroments } from './enviroments.js';
import { createFileUploader } from './utils/createFileUploader.js';
import { getBufferFromStrem } from './utils/getBufferFromStream.js';
import { getBufferZipEntry } from './utils/getBufferZipEntry.js';
import { getImageLocation } from './utils/getImageLocation.js';
import { getReadableBuffer } from './utils/getReadableBuffer.js';
import { isImageEntry } from './utils/isImageEntry.js';
import { uploadImageBuffer } from './utils/uploadImageBuffer.js';
import { uploadResume } from './utils/uploadResume.js';

const {
  pdfServicesClientId,
  pdfServicesClientSecret,
  port,
  yandexBucketName,
  yandexKeyId,
  yandexKeySecret
} = enviroments;

const app = express();

app.use(cors());

const extractor = getTextExtractor();

const credentials = new ServicePrincipalCredentials({
  clientId: pdfServicesClientId,
  clientSecret: pdfServicesClientSecret
});

// Инициализация
const s3 = new EasyYandexS3.default({
  auth: {
    accessKeyId: yandexKeyId,
    secretAccessKey: yandexKeySecret
  },
  Bucket: yandexBucketName,
  debug: true // Дебаг в консоли, потом можете удалить в релизе
});

app.get('/', (_req, res) => {
  res.json({ data: 'hello!' });
});

app.post('/upload', async (req, res) => {
  try {
    const multerResume = uploadResume();
    const file = await multerResume.upload(req, res, PDF_FIELD_NAME);
    const uploadFile = createFileUploader(s3);
    const uploadedFile = await uploadFile(file, '/images/');
    const resumeUrl = uploadedFile.Location;

    const pdfServices = new PDFServices({ credentials });

    const readable = getReadableBuffer(file.buffer);

    const inputAsset = await pdfServices.upload({
      mimeType: MimeType.PDF,
      readStream: readable
    });

    const params = new ExtractPDFParams({
      elementsToExtract: [ExtractElementType.TEXT],
      elementsToExtractRenditions: [ExtractRenditionsElementType.FIGURES]
    });

    const job = new ExtractPDFJob({ inputAsset, params });

    const pollingURL = await pdfServices.submit({ job });

    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: ExtractPDFResult
    });

    const resultAsset = pdfServicesResponse.result.resource;

    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    const zipBuffer = await getBufferFromStrem(streamAsset.readStream);

    const zip = new AdmZip(zipBuffer);

    const zipEntries = zip.getEntries();

    const imageEntries: IZipEntry[] = Object.values(zipEntries).filter(isImageEntry);

    const imagesPromise = imageEntries.map(getBufferZipEntry);

    const imagesBuffer = await Promise.allSettled(imagesPromise);

    const imagesQueue = imagesBuffer.reduce(uploadImageBuffer(uploadFile, '/images/'), []);

    const imagesLoaded = await Promise.allSettled(imagesQueue);

    const imagesList = imagesLoaded.reduce(getImageLocation, []);

    const text = await extractor.extractText({
      input: file.buffer,
      type: 'buffer'
    });

    res.json({ imagesList, resumeUrl, text });
  } catch (error) {
    console.log('error', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
