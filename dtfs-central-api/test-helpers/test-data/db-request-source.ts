import { DbRequestSource, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';

export const aDbRequestSource = (): DbRequestSource => ({
  platform: REQUEST_PLATFORM_TYPE.TFM,
  userId: '123',
});
