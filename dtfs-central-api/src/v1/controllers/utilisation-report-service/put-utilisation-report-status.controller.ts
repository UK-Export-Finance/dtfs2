import { Response } from 'express';
import { getClient } from '../../../drivers/db-client';
import { ReportWithStatus } from '../../../types/utilisation-reports';
import { UploadedByUserDetails } from '../../../types/db-models/utilisation-reports';
import { TfmSessionUser } from '../../../types/tfm/tfm-session-user';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { updateManyUtilisationReportStatuses } from '../../../services/repositories/utilisation-reports-repo';
import { InvalidPayloadError } from '../../../errors';

type PutUtilisationReportStatusRequest = CustomExpressRequest<{
  reqBody: {
    user: TfmSessionUser;
    reportsWithStatus: ReportWithStatus[];
  };
}>;

export const putUtilisationReportStatus = async (req: PutUtilisationReportStatusRequest, res: Response) => {
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

    const client = await getClient();
    const session = client.startSession();
    await session.withTransaction(async () => {
      await updateManyUtilisationReportStatuses(reportsWithStatus, uploadedByUserDetails);
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
