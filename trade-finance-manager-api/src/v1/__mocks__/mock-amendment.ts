import { CURRENCY, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';

export const MOCK_AMENDMENT: TfmFacilityAmendment = {
  version: 1,
  amendmentId: new ObjectId(),
  facilityId: new ObjectId(),
  dealId: new ObjectId(),
  createdAt: 1723653619,
  updatedAt: 1723653634,
  status: 'Completed',
  tfm: {
    amendmentExposurePeriodInMonths: null,
    coverEndDate: 1794418807,
    exposure: {
      exposure: '0.50',
      timestamp: 1828546829000,
      ukefExposureValue: 0.5,
    },
    value: {
      currency: CURRENCY.GBP,
      value: 5,
    },
  },
};
