import { Response } from 'express';
import { getUtilisationReportDetailsById } from '../../../repositories/utilisation-reports-repo';
import { CustomExpressRequest } from '../../../types/custom-express-request';

type GetUtilisationReportByIdRequest = CustomExpressRequest<{
  params: {
    _id: string;
  };
}>;

export const getUtilisationReportById = async (req: GetUtilisationReportByIdRequest, res: Response) => {
  const { _id } = req.params;

  try {
    const utilisationReport = await getUtilisationReportDetailsById(_id);

    if (!utilisationReport) {
      return res.status(404).send();
    }

    return res.status(200).send(utilisationReport);
  } catch (error) {
    const errorMessage = `Failed to get utilisation report with _id '${_id}'`;
    console.error(errorMessage, error);
    return res.status(500).send(errorMessage);
  }
};
