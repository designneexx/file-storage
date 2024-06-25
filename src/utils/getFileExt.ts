export function getFileExt(originalName: string) {
  return originalName
    .substring(originalName.lastIndexOf('.'), originalName.length)
    .replace(/\./, '');
}
