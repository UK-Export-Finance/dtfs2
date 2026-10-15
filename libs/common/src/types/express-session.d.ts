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

// TODO[DTFS2-8133] Add strict property types
/**
 * Extends the Express `Request` interface to include a custom `session` object.
 *
 * @property csrf - Optional CSRF token for request validation.
 * @property user - Optional user information stored in the session.
 * @property userToken - Optional user token for authentication.
 * @property loginStatus - Optional login status information.
 * @property removeFeesFromPaymentErrorKey - Optional error key for removing fees from payment.
 * @property editPaymentFormValues - Optional form values for editing payments.
 * @property loginData - Optional login data.
 * @property recordCorrectionRequestEmails - Optional list of emails for record correction requests.
 * @property generateKeyingDataErrorKey - Optional error key for generating keying data.
 * @property initiateRecordCorrectionRequestErrorKey - Optional error key for initiating record correction requests.
 * @property checkedCheckboxIds - Optional IDs of checked checkboxes.
 * @property addPaymentErrorKey - Optional error key for adding payments.
 */
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
