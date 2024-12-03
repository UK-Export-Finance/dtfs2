import { Request, Response } from 'express';
import stream from 'stream';
import { AxiosError } from 'axios';
import api from '../../api';
import fileshare from '../../../drivers/fileshare';
import { FILESHARES } from '../../../constants/fileshares';

type FileMetadata = {
  folder: string;
  filename: string;
  mimetype: string;
};

const getUtilisationReportFileMetadata = async (id: string): Promise<FileMetadata> => {
  const { azureFileInfo } = await api.getUtilisationReportById(id);

  if (!azureFileInfo?.folder) {
    throw new Error(`Failed to get folder for utilisation report with id '${id}'`);
  }

  if (!azureFileInfo?.filename) {
    throw new Error(`Failed to get filename for utilisation report with id '${id}'`);
  }

  if (!azureFileInfo?.mimetype) {
    throw new Error(`Failed to get mimetype for utilisation report with id '${id}'`);
  }

  const { folder, filename, mimetype } = azureFileInfo;
  return { folder, filename, mimetype };
};

export const getUtilisationReportDownload = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { folder, filename, mimetype } = await getUtilisationReportFileMetadata(id);

    const bufferedFile = await fileshare.readFile({
      fileshare: FILESHARES.UTILISATION_REPORTS,
      folder,
      filename,
    });

    const readStream = new stream.PassThrough();
    readStream.end(bufferedFile);

    res.set('content-disposition', `attachment; filename=${filename}`);
    res.set('content-type', mimetype);

    return readStream.pipe(res);
  } catch (error) {
    const errorMessage = `Failed to get utilisation report for download with id '${id}'`;
    console.error(errorMessage, error);
    return res.status((error as AxiosError).response?.status ?? 500).send({ message: errorMessage });
  }
};
