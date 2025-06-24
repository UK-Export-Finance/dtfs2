import { createAmendmentFacilityExposure, formattedNumber, MOCK_TFM_FACILITY } from '@ukef/dtfs2-common';
import { addExposureValuesToAmendment } from './add-exposure-values-to-amendment';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { mockFacility } from '../../../utils/mocks/mock-facility';
import api from '../../../services/api';

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';
const userToken = 'userToken';

const { details: facility } = mockFacility(facilityId, dealId);

const getTfmFacilityMock = jest.fn();
console.error = jest.fn();

describe('addExposureValuesToAmendment', () => {
  const amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
    .withDealId(dealId)
    .withFacilityId(facilityId)
    .withAmendmentId(amendmentId)
    .withChangeFacilityValue(true)
    .withFacilityValue(10000)
    .withEffectiveDate(1700000000000)
    .withCurrency('JPY')
    .build();

  beforeEach(() => {
    jest.spyOn(api, 'getTfmFacility').mockImplementation(getTfmFacilityMock);
    jest.spyOn(console, 'error');

    getTfmFacilityMock.mockResolvedValue(MOCK_TFM_FACILITY);
  });

  describe('when coverPercentage is undefined', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const facilityWithoutCoverPercentage = {
      ...facility,
      coverPercentage: undefined,
    };

    it('should return error as true', async () => {
      const result = await addExposureValuesToAmendment(amendment, facilityWithoutCoverPercentage, facilityId, userToken);

      expect(result).toEqual({ error: true });
    });

    it('should not call api.getTfmFacility', async () => {
      await addExposureValuesToAmendment(amendment, facilityWithoutCoverPercentage, facilityId, userToken);

      expect(getTfmFacilityMock).toHaveBeenCalledTimes(0);
    });

    it('should call console.error', async () => {
      await addExposureValuesToAmendment(amendment, facilityWithoutCoverPercentage, facilityId, userToken);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error with cover percentage');
    });
  });

  describe('when coverPercentage is not a number', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const facilityWithCoverPercentageString = {
      ...facility,
      coverPercentage: 'abc',
    };

    it('should return error as true', async () => {
      // @ts-ignore - testing with a string instead of a number
      const result = await addExposureValuesToAmendment(amendment, facilityWithCoverPercentageString, facilityId, userToken);

      expect(result).toEqual({ error: true });
    });

    it('should not call api.getTfmFacility', async () => {
      // @ts-ignore - testing with a string instead of a number
      await addExposureValuesToAmendment(amendment, facilityWithCoverPercentageString, facilityId, userToken);

      expect(getTfmFacilityMock).toHaveBeenCalledTimes(0);
    });

    it('should call console.error', async () => {
      // @ts-ignore - testing with a string instead of a number
      await addExposureValuesToAmendment(amendment, facilityWithCoverPercentageString, facilityId, userToken);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error with cover percentage');
    });
  });

  describe('when effective date is undefined', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const amendmentWithoutCoverPercentage = {
      ...amendment,
      effectiveDate: undefined,
    };

    it('should return error as true', async () => {
      const result = await addExposureValuesToAmendment(amendmentWithoutCoverPercentage, facility, facilityId, userToken);

      expect(result).toEqual({ error: true });
    });

    it('should not call api.getTfmFacility', async () => {
      await addExposureValuesToAmendment(amendmentWithoutCoverPercentage, facility, facilityId, userToken);

      expect(getTfmFacilityMock).toHaveBeenCalledTimes(0);
    });

    it('should call console.error', async () => {
      await addExposureValuesToAmendment(amendmentWithoutCoverPercentage, facility, facilityId, userToken);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error with effective date');
    });
  });

  describe('when effective date is not a number', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const amendmentWithCoverPercentageString = {
      ...amendment,
      effectiveDate: 'abc',
    };

    it('should return error as true', async () => {
      // @ts-ignore - testing with a string instead of a number
      const result = await addExposureValuesToAmendment(amendmentWithCoverPercentageString, facility, facilityId, userToken);

      expect(result).toEqual({ error: true });
    });

    it('should not call api.getTfmFacility', async () => {
      // @ts-ignore - testing with a string instead of a number
      await addExposureValuesToAmendment(amendmentWithCoverPercentageString, facility, facilityId, userToken);

      expect(getTfmFacilityMock).toHaveBeenCalledTimes(0);
    });

    it('should call console.error', async () => {
      // @ts-ignore - testing with a string instead of a number
      await addExposureValuesToAmendment(amendmentWithCoverPercentageString, facility, facilityId, userToken);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error with effective date');
    });
  });

  describe('when getTfmFacility errors', () => {
    const mockError = new Error('an error');

    beforeEach(() => {
      jest.clearAllMocks();
      getTfmFacilityMock.mockRejectedValue(mockError);
    });

    it('should return error as true', async () => {
      const result = await addExposureValuesToAmendment(amendment, facility, facilityId, userToken);

      expect(result).toEqual({ error: true });
    });

    it('should call console.error', async () => {
      await addExposureValuesToAmendment(amendment, facility, facilityId, userToken);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error getting TFM facility %o', mockError);
    });
  });

  describe('when createAmendmentFacilityExposure does not return anything', () => {
    const amendmentWithoutValue = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeCoverEndDate(true)
      .withEffectiveDate(1700000000000)
      .build();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return error as true', async () => {
      jest.restoreAllMocks();

      const result = await addExposureValuesToAmendment(amendmentWithoutValue, facility, facilityId, userToken);

      expect(result).toEqual({ error: true });
    });

    it('should call console.error', async () => {
      await addExposureValuesToAmendment(amendmentWithoutValue, facility, facilityId, userToken);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error creating exposure for the amendment');
    });
  });

  describe('when all values are valid', () => {
    const tfmFacility = {
      ...MOCK_TFM_FACILITY,
      tfm: {
        ...MOCK_TFM_FACILITY.tfm,
        exchangeRate: 0.5,
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      getTfmFacilityMock.mockResolvedValue(tfmFacility);
    });

    it('should return tfmUpdate with exposure values', async () => {
      const result = await addExposureValuesToAmendment(amendment, facility, facilityId, userToken);

      const { exposure, timestamp, ukefExposureValue } = createAmendmentFacilityExposure(
        tfmFacility.tfm.exchangeRate,
        facility.coverPercentage,
        amendment,
        amendment.effectiveDate!,
      );

      const expected = {
        tfmUpdate: {
          ...amendment.tfm,
          exposure: {
            exposure,
            timestamp,
            ukefExposureValue,
          },
        },
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when exchange rate is missing', () => {
    const tfmFacility = {
      ...MOCK_TFM_FACILITY,
      tfm: {
        ...MOCK_TFM_FACILITY.tfm,
        exchangeRate: undefined,
      },
    };

    const facilityCoverPercentageFull = {
      ...facility,
      coverPercentage: 100,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      getTfmFacilityMock.mockResolvedValue(tfmFacility);
    });

    it('should return tfmUpdate with amendment values as exchange rate will be set to 1', async () => {
      const result = await addExposureValuesToAmendment(amendment, facilityCoverPercentageFull, facilityId, userToken);

      const expected = {
        tfmUpdate: {
          ...amendment.tfm,
          exposure: {
            exposure: formattedNumber(amendment.value!),
            timestamp: new Date(amendment.effectiveDate! * 1000).valueOf(),
            ukefExposureValue: amendment.value,
          },
        },
      };

      expect(result).toEqual(expected);
    });
  });
});
