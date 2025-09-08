import { CURRENCY, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';

export const MOCK_AMENDMENT: TfmFacilityAmendment = {
  version: 1,
  facilityId: new ObjectId('6745bd3719238444fa59f308'),
  amendmentId: new ObjectId('6745bd3719238444fa59f307'),
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

export const MOCK_AMENDMENT_WITH_UKEF_DECISION: TfmFacilityAmendment = {
  ...MOCK_AMENDMENT,
  ukefDecision: {
    coverEndDate: 'Approved with conditions',
    comments: 'Test',
    conditions: 'Test',
    declined: null,
    managersDecisionEmail: true,
    submitted: true,
    submittedAt: 1732275114,
    submittedBy: {
      _id: new ObjectId('67404a1fb4c008fea72323a8'),
      email: 'test@testing.com',
      name: 'Benjamin Jones',
      username: 'UNDERWRITER_MANAGER_1',
    },
    managersDecisionEmailSent: true,
  },
};
