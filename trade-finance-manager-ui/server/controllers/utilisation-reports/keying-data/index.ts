import { Request, Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import api from '../../../api';
import { asUserSession } from '../../../helpers/express-session';
import { getFeeRecordIdsForKeyingSheetRowsWithStatusFromObjectKeys } from './keying-sheet-checkbox-id-helpers';
import { KeyingSheetCheckboxId } from '../../../types/keying-sheet-checkbox-id';

export const postKeyingData = async (req: Request, res: Response) => {
  const { user, userToken } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    await api.generateKeyingData(reportId, user, userToken);

    return res.redirect(`/utilisation-reports/${reportId}#keying-sheet`);
  } catch (error) {
    console.error('Failed to add payment', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

export type PostKeyingDataMarkAsRequest = CustomExpressRequest<{
  reqBody: Record<KeyingSheetCheckboxId, 'on'>;
}>;

export const postKeyingDataMarkAsDone = async (req: PostKeyingDataMarkAsRequest, res: Response) => {
  const { user, userToken } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    const feeRecordsIdsToMarkAsDone = getFeeRecordIdsForKeyingSheetRowsWithStatusFromObjectKeys(req.body, 'TO_DO');

    if (feeRecordsIdsToMarkAsDone.length > 0) {
      await api.markKeyingDataAsDone(reportId, feeRecordsIdsToMarkAsDone, user, userToken);
    }

    return res.redirect(`/utilisation-reports/${reportId}#keying-sheet`);
  } catch (error) {
    console.error('Failed to mark keying data as done', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

export const postKeyingDataMarkAsToDo = async (req: PostKeyingDataMarkAsRequest, res: Response) => {
  const { user, userToken } = asUserSession(req.session);
  const { reportId } = req.params;

  try {
    const feeRecordsIdsToMarkAsToDo = getFeeRecordIdsForKeyingSheetRowsWithStatusFromObjectKeys(req.body, 'DONE');

    if (feeRecordsIdsToMarkAsToDo.length > 0) {
      await api.markKeyingDataAsToDo(reportId, feeRecordsIdsToMarkAsToDo, user, userToken);
    }

    return res.redirect(`/utilisation-reports/${reportId}#keying-sheet`);
  } catch (error) {
    console.error('Failed to mark keying data as to do', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
