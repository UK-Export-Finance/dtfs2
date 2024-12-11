import { AuthorizationUrlRequest } from '@azure/msal-node';
import { TfmSessionUser } from '@ukef/dtfs2-common';
import { RemoveFeesFromPaymentErrorKey } from '../controllers/utilisation-reports/helpers';
import { EditPaymentFormValues } from './edit-payment-form-values';
import { AddPaymentErrorKey, InitiateRecordCorrectionRequestErrorKey, GenerateKeyingDataErrorKey } from './premium-payments-tab-error-keys';

/**
 * A wrapper for a partially logged in users session data
 */
type PartiallyLoggedInUserSessionLoginData = {
  authCodeUrlRequest: AuthorizationUrlRequest;
};

/**
 * We keep the partially logged in user session data on a
 * separate isolated parameter to allow for easy management
 */
export type PartiallyLoggedInUserSessionData = {
  loginData: PartiallyLoggedInUserSessionLoginData;
};

export type UserSessionData = {
  user: TfmSessionUser;
  userToken: string;
};

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L199-L211
declare module 'express-session' {
  interface SessionData extends UserSessionData, PartiallyLoggedInUserSessionData {
    addPaymentErrorKey: AddPaymentErrorKey;
    initiateRecordCorrectionRequestErrorKey: InitiateRecordCorrectionRequestErrorKey;
    checkedCheckboxIds: Record<string, true | undefined>;
    generateKeyingDataErrorKey: GenerateKeyingDataErrorKey;
    removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey;
    editPaymentFormValues: EditPaymentFormValues;
  }
}
