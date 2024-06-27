import EasyYandexS3 from 'easy-yandex-s3';
import { v4 } from 'uuid';
import { getFileExt } from './getFileExt.js';

export function uploadImageBuffer<T>(
  uploadFile: (...params: Parameters<EasyYandexS3.default['Upload']>) => T,
  folder: string
) {
  return (acc: T[], item) => {
    if (item.status === 'fulfilled') {
      const { buffer, entry } = item.value;
      const ext = getFileExt(entry.name);

      return [
        ...acc,
        uploadFile(
          { buffer, name: `${entry.name.replace(new RegExp(`.${ext}$`, 'i'), '')}_${v4()}.${ext}` },
          folder
        )
      ];
    }

    return acc;
  };
}
