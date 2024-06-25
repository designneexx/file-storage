import { ZipEntry } from 'node-stream-zip';
import { getFileExt } from './getFileExt.js';
import { IMAGES } from 'src/consts.js';

export function isImageEntry(entry: ZipEntry) {
  const { name } = entry;
  const ext = getFileExt(name);

  return IMAGES.includes(ext);
}
