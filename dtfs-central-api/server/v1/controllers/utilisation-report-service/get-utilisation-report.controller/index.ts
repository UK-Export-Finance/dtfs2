import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { mapUtilisationReportEntityToGetUtilisationReportResponse } from '../../../../mapping/mapUtilisationReport';

export type GetUtilisationReportByIdRequest = CustomExpressRequest<{
  params: {
    id: string;
  };
}>;

export const getUtilisationReportById = async (req: GetUtilisationReportByIdRequest, res: Response) => {
  const { id } = req.params;

  try {
    const utilisationReport = await UtilisationReportRepo.findOneBy({ id: Number(id) });

    if (!utilisationReport) {
      return res.status(404).send();
    }

    const mappedUtilisationReport = await mapUtilisationReportEntityToGetUtilisationReportResponse(utilisationReport);
    return res.status(200).send(mappedUtilisationReport);
  } catch (error) {
    const errorMessage = `Failed to get utilisation report with id '${id}'`;
    console.error('%s %o', errorMessage, error);
    return res.status(500).send(errorMessage);
  }
};
