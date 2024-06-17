import { TfmSessionUser } from './tfm-session-user';
import { AddPaymentErrorKey, GenerateKeyingDataErrorKey } from '../controllers/utilisation-reports/helpers';

export type UserSessionData = {
  user: TfmSessionUser;
  userToken: string;
};

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L199-L211
declare module 'express-session' {
  interface SessionData extends UserSessionData {
    addPaymentErrorKey: AddPaymentErrorKey;
    checkedCheckboxIds: Record<string, true | undefined>;
    generateKeyingDataErrorKey: GenerateKeyingDataErrorKey;
  }
}
