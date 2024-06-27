import EasyYandexS3 from 'easy-yandex-s3';

type UploadedTypes = Awaited<ReturnType<EasyYandexS3.default['Upload']>>;
type UploadedType = Exclude<UploadedTypes, Array<unknown> | false>;

export function getImageLocation(acc: string[], item: PromiseSettledResult<UploadedType>) {
  if (item.status === 'fulfilled') {
    const { value } = item;

    return [...acc, value.Location];
  }

  return acc;
}
