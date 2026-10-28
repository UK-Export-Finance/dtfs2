import { TfmFacilityWithStringId } from '@ukef/types';
import { getEpochMs } from '@ukef/helpers';
import { MOCK_FACILITY } from '.';

export const MOCK_TFM_FACILITY: TfmFacilityWithStringId = {
  _id: '507f1f77bcf86cd799439013',
  facilitySnapshot: {
    ...MOCK_FACILITY,
  },
  tfm: {
    exchangeRate: 0.5,
    facilityValueInGBP: 10000,
    ukefExposure: 1000,
    ukefExposureCalculationTimestamp: getEpochMs().toString(),
  },
};
