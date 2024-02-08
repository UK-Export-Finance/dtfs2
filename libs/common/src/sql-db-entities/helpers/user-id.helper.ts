type RequestSource = { platform: 'PORTAL' | 'TFM'; userId: string } | { platform: 'SYSTEM' };

export type DbRequestSourceParam = {
  requestSource: RequestSource;
};

export const getDbUpdatedByUserId = (requestSource: RequestSource) =>
  requestSource.platform === 'SYSTEM' ? requestSource.platform : `${requestSource.platform}-${requestSource.userId}`;
