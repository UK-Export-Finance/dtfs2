import { RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { isAxiosError, HttpStatusCode } from 'axios';
import api from '../../../../api';
import { TfmSessionUser } from '../../../../types/tfm-session-user';

/**
 * Retrieves the fee record correction transient form data for a given report,
 * fee record, and user. If the data does not exist, returns null.
 * @param reportId - The report id
 * @param feeRecordId - The fee record id
 * @param user - The session user
 * @param userToken - the user token
 * @returns A promise that resolves to the record correction form data if found, null if not found
 * @throws Will throw an error if the API request fails for any reason other than NotFound
 */
export const getFeeRecordCorrectionTransientFormDataIfExistsElseNull = async (
  reportId: string,
  feeRecordId: string,
  user: TfmSessionUser,
  userToken: string,
): Promise<RecordCorrectionTransientFormData | null> => {
  try {
    return await api.getFeeRecordCorrectionTransientFormData(reportId, feeRecordId, user, userToken);
  } catch (error) {
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    if (errorStatus === Number(HttpStatusCode.NotFound)) {
      return null;
    }

    console.error('Failed to get fee record correction transient form data', error);
    throw error;
  }
};
