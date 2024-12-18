import { getUnixTime } from 'date-fns';
import { ObjectId } from 'mongodb';
import { AMENDMENT_STATUS, AMENDMENT_TYPES, CURRENCY } from '../../constants';
import { PortalFacilityAmendment } from '../../types';
import { PortalFacilityAmendmentUserValues } from '../../types/portal/amendment';

export const aPortalFacilityAmendmentUserValues = (): PortalFacilityAmendmentUserValues => ({
  changeCoverEndDate: true,
  coverEndDate: getUnixTime(new Date()),
  currentCoverEndDate: getUnixTime(new Date()),
  isUsingFacilityEndDate: true,
  facilityEndDate: new Date(),
  bankReviewDate: new Date(),
  changeFacilityValue: true,
  value: 1800,
  currentValue: 1500,
  currency: CURRENCY.GBP,
  ukefExposure: 10,
  coveredPercentage: 23,
});

export const aPortalFacilityAmendment = (): PortalFacilityAmendment => ({
  ...aPortalFacilityAmendmentUserValues(),
  type: AMENDMENT_TYPES.PORTAL,
  amendmentId: new ObjectId(),
  facilityId: new ObjectId(),
  dealId: new ObjectId(),
  createdAt: getUnixTime(new Date()),
  updatedAt: getUnixTime(new Date()),
  status: AMENDMENT_STATUS.IN_PROGRESS,
});
