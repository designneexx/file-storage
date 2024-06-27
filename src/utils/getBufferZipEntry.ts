import { IZipEntry } from 'adm-zip';

export function getBufferZipEntry(entry: IZipEntry) {
  return new Promise<{ buffer: Buffer; entry: IZipEntry }>((resolve, reject) =>
    entry.getDataAsync((buffer, error) => {
      if (error) {
        return reject(error);
      }

      resolve({ buffer, entry });
    })
  );
}
