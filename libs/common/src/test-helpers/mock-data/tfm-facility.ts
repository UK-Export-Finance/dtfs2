import { MOCK_FACILITY } from '.';
import { generateObjectIdId } from '../../utils';
import { getEpochMs } from '../../helpers';

export const MOCK_TFM_FACILITY = {
  _id: generateObjectIdId(),
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
