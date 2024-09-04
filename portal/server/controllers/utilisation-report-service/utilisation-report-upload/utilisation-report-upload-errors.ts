import { Request, Response } from 'express';
import { validateFilenameFormat } from './utilisation-report-filename-validator';
import { asLoggedInUserSession } from '../../../helpers/express-session';

/**
 * The request type we pass in here is a non-standard
 * express `Request` as the request object does not
 * normally contain the `file` property, hence
 * hand-rolling the following type definition
 */
export type GetUploadErrorsRequest = Request & {
  file?: {
    originalname: string;
  };
};

/**
 * The response type we pass in here is a non-standard
 * express `Response` as the response object does not
 * normally contain the `locals` property, hence
 * hand-rolling the following type definition
 */
export type GetUploadErrorsResponse = Response & {
  locals?: {
    fileUploadError?: {
      text: string;
    };
  };
};

type UploadErrors = {
  uploadErrorSummary: {
    text: string;
    href: string;
  }[];
  uploadValidationError: {
    text: string;
  };
};

/**
 * Gets the upload errors for the file
 * @param req - The request object
 * @param res - The response object
 * @returns An object containing the upload errors (returns `null` if there are no errors)
 */
export const getUploadErrors = (req: GetUploadErrorsRequest, res: GetUploadErrorsResponse): UploadErrors | null => {
  const href = '#utilisation-report-file-upload';

  if (res?.locals?.fileUploadError) {
    const uploadErrorSummary = [
      {
        text: res?.locals?.fileUploadError?.text,
        href,
      },
    ];
    const uploadValidationError = res?.locals?.fileUploadError;
    return { uploadErrorSummary, uploadValidationError };
  }

  if (!req?.file) {
    const text = 'Please select a file';
    const uploadErrorSummary = [{ text, href }];
    const uploadValidationError = { text };
    return { uploadErrorSummary, uploadValidationError };
  }

  if (res?.locals?.virusScanFailed) {
    const text = 'The selected file could not be uploaded - try again';
    const uploadErrorSummary = [{ text, href }];
    const uploadValidationError = { text };
    return { uploadErrorSummary, uploadValidationError };
  }

  const { reportPeriod } = asLoggedInUserSession(req.session).utilisationReport!;
  const filename = req.file.originalname;
  const { filenameError } = validateFilenameFormat(filename, reportPeriod);
  if (filenameError) {
    const uploadErrorSummary = [{ text: filenameError, href }];
    const uploadValidationError = { text: filenameError };
    return { uploadErrorSummary, uploadValidationError };
  }

  return null;
};
