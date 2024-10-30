import { AzureFileInfo, AzureFileInfoEntity, UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { GetUtilisationReportResponse } from '../types/utilisation-reports';
import { getUserById } from '../repositories/users-repo';

const mapAzureFileInfoEntityToAzureFileInfo = (fileInfoEntity: AzureFileInfoEntity): AzureFileInfo => ({
  filename: fileInfoEntity.filename,
  fullPath: fileInfoEntity.fullPath,
  folder: fileInfoEntity.folder,
  url: fileInfoEntity.url,
  mimetype: fileInfoEntity.mimetype,
});

function assertAllUploadFieldsArePopulated(uploadedReportEntity: UtilisationReportEntity): asserts uploadedReportEntity is UtilisationReportEntity & {
  dateUploaded: Date;
  azureFileInfo: AzureFileInfoEntity;
  uploadedByUserId: string;
} {
  const allUploadFieldsArePopulated: boolean =
    uploadedReportEntity.dateUploaded !== null && uploadedReportEntity.azureFileInfo !== undefined && uploadedReportEntity.uploadedByUserId !== null;
  if (!allUploadFieldsArePopulated) {
    throw new Error('Failed to map data - report seems to have been uploaded but is missing some required fields');
  }
}

export const mapUtilisationReportEntityToGetUtilisationReportResponse = async (
  reportEntity: UtilisationReportEntity,
): Promise<GetUtilisationReportResponse> => {
  const response: GetUtilisationReportResponse = {
    bankId: reportEntity.bankId,
    id: reportEntity.id,
    status: reportEntity.status,
    reportPeriod: reportEntity.reportPeriod,
    dateUploaded: null,
    uploadedByUser: null,
    azureFileInfo: null,
  };

  const isUploadedReport = reportEntity.status !== UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED && reportEntity.azureFileInfo;
  if (!isUploadedReport) {
    return response;
  }

  assertAllUploadFieldsArePopulated(reportEntity);

  const uploadedByUser = await getUserById(reportEntity.uploadedByUserId);
  const responseWithUploadDetails: GetUtilisationReportResponse = {
    ...response,
    dateUploaded: reportEntity.dateUploaded,
    azureFileInfo: mapAzureFileInfoEntityToAzureFileInfo(reportEntity.azureFileInfo),
    uploadedByUser: {
      id: uploadedByUser._id.toString(),
      firstname: uploadedByUser.firstname,
      surname: uploadedByUser.surname,
    },
  };
  return responseWithUploadDetails;
};
