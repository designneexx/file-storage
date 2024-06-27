import { IZipEntry } from 'adm-zip';
import { IMAGES } from '../consts.js';
import { getFileExt } from './getFileExt.js';

export function isImageEntry(entry: IZipEntry) {
  const { name } = entry;
  const ext = getFileExt(name);

  return IMAGES.includes(ext);
}
