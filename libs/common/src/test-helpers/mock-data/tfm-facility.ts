import { MOCK_FACILITY } from '.';
import { TfmFacility } from '../../types';
import { getEpochMs } from '../../helpers';

export const MOCK_TFM_FACILITY: TfmFacility = {
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
