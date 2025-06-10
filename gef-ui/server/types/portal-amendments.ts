import { Prettify, ValuesOf, PortalAmendmentStatus } from '@ukef/dtfs2-common';
import { PORTAL_AMENDMENT_PAGES } from '../constants/amendments';
import { FacilityParams } from './facility';

export type PortalAmendmentPage = Prettify<ValuesOf<typeof PORTAL_AMENDMENT_PAGES>>;

export type AmendmentInProgressParams = {
  amendmentId: string;
  facilityId: string;
  status: PortalAmendmentStatus;
};

export interface FacilityWithAmendment extends FacilityParams {
  isFacilityWithAmendmentInProgress: AmendmentInProgressParams;
  amendmentDetailsUrl: string;
}

export type AmendmentDetailsUrlAndText = {
  text: string;
  amendmentDetailsUrl: string;
};

export type AddAmendmentToFacilityParams = {
  facility: FacilityParams;
  dealId: string;
  userRoles: string[];
  isFacilityWithAmendmentInProgress: AmendmentInProgressParams;
  readyForCheckerAmendmentDetailsUrlAndText: AmendmentDetailsUrlAndText[];
  furtherMakersInputAmendmentDetailsUrlAndText: AmendmentDetailsUrlAndText[];
  hasReadyForCheckerAmendments?: boolean;
  hasFurtherMakersInputAmendments?: boolean;
};

export type FacilityWithAmendmentFields = {
  mappedFacility: FacilityWithAmendment;
  readyForCheckerAmendmentDetailsUrlAndText: AmendmentDetailsUrlAndText[];
  furtherMakersInputAmendmentDetailsUrlAndText: AmendmentDetailsUrlAndText[];
  hasReadyForCheckerAmendments: boolean;
  hasFurtherMakersInputAmendments: boolean;
};
