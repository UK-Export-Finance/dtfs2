import { TfmSessionUser } from './tfm-session-user';
import { AddPaymentErrorKey, RemoveFeesFromPaymentErrorKey, GenerateKeyingDataErrorKey } from '../controllers/utilisation-reports/helpers';
import { EditPaymentFormValues } from './edit-payment-form-values';

type UserSessionLoginData = {
  authCodeUrlRequest: AuthorizationUrlRequest;
};

export type UserSessionData = {
  user: TfmSessionUser;
  userToken: string;
  loginData?: UserSessionLoginData;
};

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L199-L211
declare module 'express-session' {
  interface SessionData extends UserSessionData {
    addPaymentErrorKey: AddPaymentErrorKey;
    checkedCheckboxIds: Record<string, true | undefined>;
    generateKeyingDataErrorKey: GenerateKeyingDataErrorKey;
    removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey;
    editPaymentFormValues: EditPaymentFormValues;
  }
}
