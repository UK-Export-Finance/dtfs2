import { getUnixTime } from 'date-fns';
import { ObjectId } from 'mongodb';
import { AMENDMENT_TYPES, CURRENCY, PORTAL_AMENDMENT_STATUS } from '../../constants';
import { PortalAmendmentStatus, PortalFacilityAmendment } from '../../types';
import { PortalFacilityAmendmentUserValues } from '../../types/portal/amendment';
import { nowZeroSeconds } from '../../helpers';

export const aPortalFacilityAmendmentUserValues = (): PortalFacilityAmendmentUserValues => ({
  changeCoverEndDate: true,
  coverEndDate: nowZeroSeconds(),
  isUsingFacilityEndDate: true,
  facilityEndDate: new Date(),
  bankReviewDate: null,
  changeFacilityValue: true,
  value: 1800,
  currency: CURRENCY.GBP,
  effectiveDate: getUnixTime(new Date()),
});

export const aPortalFacilityAmendment = ({
  status = PORTAL_AMENDMENT_STATUS.DRAFT,
  referenceNumber,
}: { status?: PortalAmendmentStatus; referenceNumber?: string } = {}): PortalFacilityAmendment => ({
  ...aPortalFacilityAmendmentUserValues(),
  type: AMENDMENT_TYPES.PORTAL,
  amendmentId: new ObjectId(),
  facilityId: new ObjectId(),
  dealId: new ObjectId(),
  createdAt: getUnixTime(new Date()),
  updatedAt: getUnixTime(new Date()),
  status,
  referenceNumber: referenceNumber || null,
  eligibilityCriteria: {
    criteria: [{ id: 1, text: 'item 1', answer: null }],
    version: 1,
  },
  tfm: {
    value: {
      value: undefined,
      currency: undefined,
    },
    exposure: {
      exposure: undefined,
      timestamp: undefined,
      ukefExposureValue: undefined,
    },
    amendmentExposurePeriodInMonths: undefined,
    coverEndDate: undefined,
    facilityEndDate: undefined,
    bankReviewDate: undefined,
    isUsingFacilityEndDate: undefined,
  },
});

export const aCompletedPortalFacilityAmendment = (): PortalFacilityAmendment => ({
  ...aPortalFacilityAmendment(),
  eligibilityCriteria: {
    criteria: [{ id: 1, text: 'item 1', answer: true }],
    version: 1,
  },
});
