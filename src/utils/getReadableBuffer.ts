import { Buffer } from 'node:buffer';
import { Readable } from 'stream';

export function getReadableBuffer(buffer: Buffer) {
  const readable = new Readable();

  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);

  return readable;
}
