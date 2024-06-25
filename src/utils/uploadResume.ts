import fs from 'fs';
import { Request, Response } from 'express';
import multer from 'multer';
import { v4 } from 'uuid';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from '../consts.js';
import { getFileExt } from './getFileExt.js';

export function uploadResume(path: string) {
  const storage = multer.diskStorage({
    destination(_req, _file, cb) {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }

      cb(null, path);
    },
    filename(_req, file, cb) {
      const id = v4();
      const extname = getFileExt(file.originalname);
      const fileName = `${id}.${extname}`;

      cb(null, fileName);
    }
  });

  const uploadMulter = multer({
    fileFilter(_req, file, cb) {
      const extname = getFileExt(file.originalname);

      if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(extname)) {
        cb(null, true);
      } else {
        return cb(new Error('Неверный формат файла'));
      }
    },
    storage
  });

  return {
    storage,
    upload(req: Request, res: Response, field: string): Promise<Express.Multer.File> {
      const upload = uploadMulter.single(field);

      return new Promise((resolve, reject) => {
        upload(req, res, (err) => {
          if (err) {
            return reject(err);
          }

          if (!req.file) {
            return reject(new Error('Отсутствует файл резюме'));
          }

          resolve(req.file);
        });
      });
    },
    uploadMulter
  };
}
