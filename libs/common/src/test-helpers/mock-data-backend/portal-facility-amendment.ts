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
    criteria: [
      { id: 1, text: 'item 1', answer: true },
      { id: 2, text: 'item 2', answer: true },
      {
        id: 3,
        text: 'The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency) of the Facility is not more than the lesser of (i) the Available Master Guarantee Limit; and the Available Obligor(s) Limit',
        answer: false,
      },
      {
        id: 4,
        text: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate any issue raised during its Bank Due Diligence internally to any Relevant Person for approval as part of its usual Bank Due Diligence',
        answer: true,
      },
      { id: 5, text: 'The Bank is the sole and legal beneficial owner of, and has good title to, the Facility and any Utilisation thereunder', answer: true },
    ],
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
