import z from 'zod';
import { AuditDetails, FacilityAmendment, Prettify } from '..';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES, PORTAL_FACILITY_AMENDMENT_WITH_UKEF_ID, TFM_FACILITY_AMENDMENT_WITH_UKEF_ID } from '../../schemas';

export type PortalFacilityAmendmentUserValues = z.infer<typeof PORTAL_FACILITY_AMENDMENT_USER_VALUES>;

export type PortalFacilityAmendmentWithUkefId = z.infer<typeof PORTAL_FACILITY_AMENDMENT_WITH_UKEF_ID>;

export type TfmFacilityAmendmentWithUkefId = z.infer<typeof TFM_FACILITY_AMENDMENT_WITH_UKEF_ID>;

export type FacilityAllTypeAmendmentWithUkefId = PortalFacilityAmendmentWithUkefId | TfmFacilityAmendmentWithUkefId;

export type FacilityAmendmentWithUkefId = Prettify<FacilityAmendment & { ukefFacilityId: string | null }>;

export type PortalAmendmentAbandonEmailVariables = {
  exporterName: string;
  bankInternalRefName: string;
  ukefDealId: string;
  ukefFacilityId: string;
  makersName: string;
  checkersName: string;
  checkersEmail?: string;
  dateEffectiveFrom: string;
  newCoverEndDate: string;
  newFacilityEndDate: string;
  newFacilityValue: string;
};

export type PortalAmendmentReturnToMakerEmailVariables = {
  exporterName: string;
  bankInternalRefName: string;
  ukefDealId: string;
  ukefFacilityId: string;
  makersName: string;
  checkersName: string;
  checkersEmail?: string;
  dateEffectiveFrom: string;
  newCoverEndDate: string;
  newFacilityEndDate: string;
  newFacilityValue: string;
};

export type PortalAmendmentSubmittedToCheckerEmailVariables = {
  exporterName: string;
  bankInternalRefName: string;
  ukefDealId: string;
  ukefFacilityId: string;
  makersName: string;
  checkersName: string;
  dateEffectiveFrom: string;
  newCoverEndDate: string;
  newFacilityEndDate: string;
  newFacilityValue: string;
  dateSubmittedByMaker?: string;
  portalUrl?: string;
  makersEmail?: string;
};

export type AmendmentUpdateStatus = {
  facilityId: string;
  amendmentId: string;
  newStatus: string;
  userToken?: string;
  makersEmail?: string;
  checkersEmail?: string;
  emailVariables?: PortalAmendmentSubmittedToCheckerEmailVariables | PortalAmendmentReturnToMakerEmailVariables;
  auditDetails?: AuditDetails;
};

export type PortalAmendmentSubmittedToUkefEmailVariables = {
  exporterName: string;
  bankInternalRefName: string;
  ukefDealId: string;
  ukefFacilityId: string;
  makersName: string;
  makersEmail: string;
  checkersName: string;
  bankName: string;
  dateEffectiveFrom: string;
  newCoverEndDate: string;
  newFacilityEndDate: string;
  newFacilityValue: string;
  eligibilityCriteria: string;
  referenceNumber: string;
};

export type LatestAmendmentValueAndCoverEndDate = {
  value: string | null;
  coverEndDate: string | null;
};
