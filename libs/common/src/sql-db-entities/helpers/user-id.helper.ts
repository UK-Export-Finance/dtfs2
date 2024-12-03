import { REQUEST_PLATFORM_TYPE } from '../../constants/request-platform-type';

type UserId = string;

type UserRequestPlatformType = typeof REQUEST_PLATFORM_TYPE.PORTAL | typeof REQUEST_PLATFORM_TYPE.TFM;
type SystemRequestPlatformType = typeof REQUEST_PLATFORM_TYPE.SYSTEM;

export type DbRequestSource = { platform: UserRequestPlatformType; userId: UserId } | { platform: SystemRequestPlatformType };
export type DbRequestSourceParam = {
  requestSource: DbRequestSource;
};
