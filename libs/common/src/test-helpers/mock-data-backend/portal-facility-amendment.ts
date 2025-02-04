import { getUnixTime } from 'date-fns';
import { ObjectId } from 'mongodb';
import { AMENDMENT_TYPES, CURRENCY, PORTAL_AMENDMENT_STATUS } from '../../constants';
import { PortalFacilityAmendment } from '../../types';
import { PortalFacilityAmendmentUserValues } from '../../types/portal/amendment';
import { getEpochMs } from '../../helpers';

export const aPortalFacilityAmendmentUserValues = (): PortalFacilityAmendmentUserValues => ({
  changeCoverEndDate: true,
  coverEndDate: getEpochMs(),
  isUsingFacilityEndDate: true,
  facilityEndDate: new Date(),
  bankReviewDate: new Date(),
  changeFacilityValue: true,
  value: 1800,
  currency: CURRENCY.GBP,
});

export const aPortalFacilityAmendment = (): PortalFacilityAmendment => ({
  ...aPortalFacilityAmendmentUserValues(),
  type: AMENDMENT_TYPES.PORTAL,
  amendmentId: new ObjectId(),
  facilityId: new ObjectId(),
  dealId: new ObjectId(),
  createdAt: getUnixTime(new Date()),
  updatedAt: getUnixTime(new Date()),
  status: PORTAL_AMENDMENT_STATUS.DRAFT,
  eligibilityCriteria: {
    criteria: [{ id: 1, text: 'item 1', answer: null }],
    version: 1,
  },
});
