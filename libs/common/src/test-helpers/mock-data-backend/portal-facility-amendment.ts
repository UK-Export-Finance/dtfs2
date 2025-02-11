import { getUnixTime } from 'date-fns';
import { ObjectId } from 'mongodb';
import { AMENDMENT_TYPES, CURRENCY, PORTAL_AMENDMENT_STATUS } from '../../constants';
import { PortalAmendmentStatus, PortalFacilityAmendment } from '../../types';
import { PortalFacilityAmendmentUserValues } from '../../types/portal/amendment';
import { getEpochMs } from '../../helpers';

export const aPortalFacilityAmendmentUserValues = (): PortalFacilityAmendmentUserValues => ({
  changeCoverEndDate: true,
  coverEndDate: getEpochMs(),
  isUsingFacilityEndDate: true,
  facilityEndDate: new Date(),
  bankReviewDate: null,
  changeFacilityValue: true,
  value: 1800,
  currency: CURRENCY.GBP,
  effectiveDate: getUnixTime(new Date()),
});

export const aPortalFacilityAmendment = ({ status = PORTAL_AMENDMENT_STATUS.DRAFT }: { status?: PortalAmendmentStatus } = {}): PortalFacilityAmendment => ({
  ...aPortalFacilityAmendmentUserValues(),
  type: AMENDMENT_TYPES.PORTAL,
  amendmentId: new ObjectId(),
  facilityId: new ObjectId(),
  dealId: new ObjectId(),
  createdAt: getUnixTime(new Date()),
  updatedAt: getUnixTime(new Date()),
  status,
  eligibilityCriteria: {
    criteria: [{ id: 1, text: 'item 1', answer: null }],
    version: 1,
  },
});

export const aCompletedPortalFacilityAmendment = (): PortalFacilityAmendment => ({
  ...aPortalFacilityAmendment(),
  eligibilityCriteria: {
    criteria: [{ id: 1, text: 'item 1', answer: true }],
    version: 1,
  },
});
