import { Session } from 'express-session';

/**
 * Module augmentation
 * Extends the `SessionData` interface from the `express-session` module
 * to optionally include a `csrf` property for storing a CSRF token.
 *
 * @property csrf - An optional string representing the CSRF token associated with the session.
 */

declare module 'express-session' {
  interface SessionData {
    csrf?: string;
  }
}

// TODO: Add types to below properties
declare module 'express' {
  interface Request {
    session: Session & {
      csrf?: string;
      user?: any;
      userToken?: string | undefined;
      loginStatus?: any;
      removeFeesFromPaymentErrorKey?: any;
      editPaymentFormValues?: any;
      loginData?: any;
      recordCorrectionRequestEmails?: Array<string>;
      generateKeyingDataErrorKey?: any;
      initiateRecordCorrectionRequestErrorKey?: any;
      checkedCheckboxIds?: any;
      addPaymentErrorKey?: any;
    };
  }
}
