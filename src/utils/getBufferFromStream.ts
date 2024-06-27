export function getBufferFromStrem(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const buffs: Uint8Array[] = [];

  return new Promise<Buffer>((resolve) => {
    stream.on('data', (value) => {
      buffs.push(value);
    });

    stream.on('end', () => {
      const buffer = Buffer.concat(buffs);

      resolve(buffer);
    });
  });
}
