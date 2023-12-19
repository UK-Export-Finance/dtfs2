import { Request, Response } from 'express';
import stream from 'stream';
import { AxiosError } from 'axios';
import api from '../../api';
import fileshare from '../../../drivers/fileshare';
import { FILESHARES } from '../../../constants/fileshares';

type FileMetadata = {
  filename: string;
  mimetype: string;
};

const getUtilisationReportFileMetadata = async (_id: string): Promise<FileMetadata> => {
  const { azureFileInfo } = await api.getUtilisationReportById(_id);

  if (!azureFileInfo?.filename) {
    throw new Error(`Failed to get filename for utilisation report with _id '${_id}'`);
  }

  if (!azureFileInfo?.mimetype) {
    throw new Error(`Failed to get mimetype for utilisation report with _id '${_id}'`);
  }

  const { filename, mimetype } = azureFileInfo;
  return { filename, mimetype };
};

export const getUtilisationReportDownload = async (req: Request, res: Response) => {
  const { bankId, _id } = req.params;

  try {
    const { filename, mimetype } = await getUtilisationReportFileMetadata(_id);

    const bufferedFile = await fileshare.readFile({
      fileshare: FILESHARES.UTILISATION_REPORTS,
      folder: bankId,
      filename,
    });

    const readStream = new stream.PassThrough();
    readStream.end(bufferedFile);

    res.set('content-disposition', `attachment; filename=${filename}`);
    res.set('content-type', mimetype);

    return readStream.pipe(res);
  } catch (error) {
    const errorMessage = `Failed to get utilisation report for download with _id '${_id}'`;
    console.error(errorMessage, error);
    return res.status((error as AxiosError).response?.status ?? 500).send({ message: errorMessage });
  }
};
