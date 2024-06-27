import EasyYandexS3 from 'easy-yandex-s3';

type Upload = EasyYandexS3.default['Upload'];
type UploadParams = Parameters<Upload>;

export function createFileUploader(s3: EasyYandexS3.default) {
  return async (...params: UploadParams) => {
    const data = await s3.Upload(...params);

    if (!data) {
      throw new Error(`Can't upload file`);
    }

    const value = Array.isArray(data) ? data[0] : data;

    return value;
  };
}
