import { WithId } from 'mongodb';
import { UtilisationReportReconciliationStatus } from '../utilisation-reports';

export type AzureFileInfo = {
  folder: string;
  fullPath: string;
  filename: string;
  url: string;
  mimetype: string;
};

export type UploadedByUserDetails = {
  id: string;
  firstname: string;
  surname: string;
};

export type UtilisationReport = WithId<{
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  totalFacilitiesReported?: number;
  facilitiesLeftToReconcile?: number;
  month: number;
  year: number;
  azureFileInfo: AzureFileInfo | null;
  dateUploaded: Date;
  uploadedBy: UploadedByUserDetails;
}>;
