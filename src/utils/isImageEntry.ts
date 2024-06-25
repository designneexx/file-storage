import { ZipEntry } from 'node-stream-zip';
import { IMAGES } from '../consts.js';
import { getFileExt } from './getFileExt.js';

export function isImageEntry(entry: ZipEntry) {
  const { name } = entry;
  const ext = getFileExt(name);

  return IMAGES.includes(ext);
}
