type UserId = string;

export type DbRequestSource = { platform: 'PORTAL' | 'TFM'; userId: UserId } | { platform: 'SYSTEM' };

export type DbRequestSourceParam = {
  requestSource: DbRequestSource;
};
