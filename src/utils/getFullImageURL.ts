import { ZipEntry } from 'node-stream-zip';

export function getFullImageUrl(fullUrl: string, dirName: string) {
  return (acc: string[], item: PromiseSettledResult<ZipEntry>) => {
    if (item.status === 'fulfilled') {
      const filePath = item.value.name;
      const filePaths = filePath.split('/');
      const filename = filePaths.at(-1);

      const url = `${fullUrl}/download/${dirName}/${filename}`;

      return [...acc, url];
    }

    return acc;
  };
}
