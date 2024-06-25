import fs from 'fs';
import path from 'path';
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
import cors from 'cors';
import express from 'express';
import mime from 'mime';
import StreamZip, { ZipEntry } from 'node-stream-zip';
import { getTextExtractor } from 'office-text-extractor';
import { v4 } from 'uuid';
import { PDF_FIELD_NAME, __dirname } from './consts.js';
import { enviroments } from './enviroments.js';
import { getFullImageUrl } from './utils/getFullImageURL.js';
import { isImageEntry } from './utils/isImageEntry.js';
import { uploadResume } from './utils/uploadResume.js';

const BASE_PATH = `${__dirname}/uploads`;

const { pdfServicesClientId, pdfServicesClientSecret, port } = enviroments;

const app = express();

app.use(cors());

const extractor = getTextExtractor();

const credentials = new ServicePrincipalCredentials({
  clientId: pdfServicesClientId,
  clientSecret: pdfServicesClientSecret
});

app.get('/', (req, res) => {
  res.json({ data: 'hello!' });
});

app.get('/download/:dirPath/:filePath', async (req, res) => {
  const { dirPath, filePath } = req.params;

  const fullFilePath = path.join(BASE_PATH, dirPath, filePath);

  const filename = path.basename(fullFilePath);
  const mimetype = mime.getType(fullFilePath);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype);

  const filestream = fs.createReadStream(fullFilePath);

  filestream.pipe(res);
});

app.post('/upload', async (req, res) => {
  let readStream: fs.ReadStream | null = null;
  let writeStream: fs.WriteStream | null = null;

  try {
    const uuid = v4();

    if (!fs.existsSync(BASE_PATH)) {
      fs.mkdirSync(BASE_PATH);
    }

    const dir = path.join(BASE_PATH, uuid);
    const multerResume = uploadResume(dir);
    const file = await multerResume.upload(req, res, PDF_FIELD_NAME);
    const pdfPath = path.join(dir, file.filename);
    const fullUrl = `${req.protocol}://${req.headers.host}`;

    const pdfServices = new PDFServices({ credentials });

    readStream = fs.createReadStream(pdfPath);

    const inputAsset = await pdfServices.upload({
      mimeType: MimeType.PDF,
      readStream
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

    const outputFilePath = path.join(dir, 'extracted.zip');

    writeStream = fs.createWriteStream(outputFilePath);

    await new Promise<void>((resolve) => {
      streamAsset.readStream.pipe(writeStream);

      writeStream.on('finish', () => {
        resolve();
      });
    });

    const zip = new StreamZip.async({ file: outputFilePath });

    const entries = await zip.entries();

    const imageEntries: ZipEntry[] = Object.values(entries).filter(isImageEntry);
    const imagesPromise = imageEntries.map((entry) => zip.extract(entry, dir).then(() => entry));

    const imagesLoaded = await Promise.allSettled(imagesPromise);
    const imagesUrl = imagesLoaded.reduce(getFullImageUrl(fullUrl, uuid), []);

    const text = await extractor.extractText({
      input: file.path,
      type: 'file'
    });

    const resumePath = `${fullUrl}/download/${uuid}/${file.filename}`;

    res.json({ imagesUrl, resumePath, text });
  } catch (error) {
    console.log('error', error.message);
    res.status(400).json({ error: error.message });
  } finally {
    readStream?.destroy();
    writeStream?.destroy();
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
