import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getClient } from '../../../drivers/db-client';
import {
  ReportDetails,
  ReportFilter,
  ReportId,
  UtilisationReportReconciliationStatus,
  ReportWithStatus,
  UpdateUtilisationReportStatusInstructions,
} from '../../../types/utilisation-reports';
import { UploadedByUserDetails } from '../../../types/db-models/utilisation-reports';
import { TfmSessionUser } from '../../../types/tfm/tfm-session-user';
import { updateManyUtilisationReportStatuses } from '../../../repositories/utilisation-reports-repo';
import { InvalidPayloadError } from '../../../errors';

type RequestBody = {
  user: TfmSessionUser;
  reportsWithStatus: ReportWithStatus[];
};

const getUpdateInstructionsWithReportDetails = (
  status: UtilisationReportReconciliationStatus,
  reportDetails: ReportDetails,
): UpdateUtilisationReportStatusInstructions => {
  const filter: ReportFilter = {
    'reportPeriod.start.month': reportDetails.month,
    'reportPeriod.start.year': reportDetails.year,
    'bank.id': reportDetails.bankId,
  };
  return { status, filter };
};

const getUpdateInstructionsWithReportId = (status: UtilisationReportReconciliationStatus, reportId: ReportId): UpdateUtilisationReportStatusInstructions => {
  const filter: ReportFilter = {
    _id: new ObjectId(reportId.id),
  };
  return { status, filter };
};

const getUpdateInstructions = (reportWithStatus: ReportWithStatus): UpdateUtilisationReportStatusInstructions => {
  const { status, report } = reportWithStatus;

  if (!status || !report) {
    throw new InvalidPayloadError("Request body item 'reportsWithStatus' supplied does not match required format");
  }

  const reportContainsReportId = 'id' in report;
  const reportContainsReportDetails = 'bankId' in report && 'month' in report && 'year' in report;
  if (!reportContainsReportId && !reportContainsReportDetails) {
    throw new InvalidPayloadError("Request body item 'reportsWithStatus' supplied does not match required format");
  }

  if (reportContainsReportDetails) {
    return getUpdateInstructionsWithReportDetails(status, report);
  }
  return getUpdateInstructionsWithReportId(status, report);
};

export const putUtilisationReportStatus = async (req: Request<object, object, RequestBody>, res: Response) => {
  try {
    const { reportsWithStatus, user } = req.body;

    if (!user || !user._id || !user.firstName || !user.lastName) {
      throw new InvalidPayloadError("Request body item 'user' supplied does not match required format");
    }
    const uploadedByUserDetails: UploadedByUserDetails = {
      id: user._id.toString(),
      firstname: user.firstName,
      surname: user.lastName,
    };

    if (!reportsWithStatus) {
      throw new InvalidPayloadError("Request body item 'reportsWithStatus' supplied does not match required format");
    }
    const updateInstructions = reportsWithStatus.map((reportWithStatus) => getUpdateInstructions(reportWithStatus));

    const client = await getClient();
    const session = client.startSession();
    await session.withTransaction(async () => {
      await updateManyUtilisationReportStatuses(updateInstructions, uploadedByUserDetails);
    });
    await session.endSession();

    return res.sendStatus(200);
  } catch (error) {
    console.error('Error updating utilisation report status:', error);
    if (error instanceof InvalidPayloadError) {
      return res.status(error.status).send({ error: `Update utilisation report status request failed: ${error.message}` });
    }
    return res.status(500).send({ error: 'Update utilisation report status request failed' });
  }
};
