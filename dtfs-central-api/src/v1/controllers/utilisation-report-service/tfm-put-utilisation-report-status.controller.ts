import { Request, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import db from '../../../drivers/db-client';
import {
  ReportDetails,
  ReportFilter,
  ReportId,
  UtilisationReportReconciliationStatus,
  ReportWithStatus,
  UpdateUtilisationReportStatusInstructions,
} from '../../../types/utilisation-reports';
import { UploadedByUserDetails } from '../../../types/db-models/utilisation-reports';
import { TfmUser } from '../../../types/users';
import { updateManyUtilisationReportStatuses } from '../../../services/repositories/utilisation-reports-repo';

type RequestBody = {
  user: TfmUser;
  reportsWithStatus: ReportWithStatus[];
};

const getUpdateInstructionsWithReportDetails = (
  status: UtilisationReportReconciliationStatus,
  reportDetails: ReportDetails,
): UpdateUtilisationReportStatusInstructions => {
  const filter: ReportFilter = {
    month: reportDetails.month,
    year: reportDetails.year,
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

  const reportContainsReportId = 'id' in report;
  const reportContainsReportDetails = 'bankId' in report && 'month' in report && 'year' in report;
  if (!reportContainsReportId && !reportContainsReportDetails) {
    throw new Error('Request body supplied does not match required format');
  }

  if (reportContainsReportDetails) {
    return getUpdateInstructionsWithReportDetails(status, report);
  }
  return getUpdateInstructionsWithReportId(status, report);
};

export const putUtilisationReportStatus = async (req: Request<{}, {}, RequestBody>, res: Response) => {
  try {
    const { reportsWithStatus, user } = req.body;

    const uploadedByUserDetails: UploadedByUserDetails = {
      firstname: user.firstName,
      surname: user.lastName,
    };

    const updateInstructions = reportsWithStatus.map((reportWithStatus) => getUpdateInstructions(reportWithStatus));

    const client: MongoClient = await db.getClient();
    const session = client.startSession();
    await session.withTransaction(async () => {
      await updateManyUtilisationReportStatuses(updateInstructions, uploadedByUserDetails);
    });
    await session.endSession();

    return res.sendStatus(200);
  } catch (error) {
    console.error('Error updating utilisation report status:', error);
    return res.status(400).send({ error: 'Update utilisation report status request failed' });
  }
};
