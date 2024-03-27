const { getOrCreate } = require('./get-or-create-tfm-user');
const existingTfmUser = require('./get-and-map-existing-tfm-user');
const tfmUser = require('./tfm-user');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');
const MOCK_TFM_USERS = require('../../../__mocks__/mock-users');

const MOCK_TFM_USER = MOCK_TFM_USERS[0];

const MOCK_TFM_USER_SCENARIOS = {
  CAN_PROCEED: {
    ...MOCK_TFM_USER,
    found: true,
    canProceed: true,
  },
  CANNOT_PROCEED: {
    ...MOCK_TFM_USER,
    found: true,
    canProceed: false,
  },
  NOT_FOUND: {
    found: false,
  },
};

const setupStubs = () => {
  jest.resetAllMocks();
  tfmUser.create = jest.fn().mockResolvedValue(MOCK_TFM_USER);
  tfmUser.update = jest.fn().mockResolvedValue(MOCK_TFM_USER);
};

describe('auth-service/get-or-create-tfm-user', () => {
  describe('when a TFM user is found and the user can proceed', () => {
    let result;

    beforeAll(async () => {
      setupStubs();

      existingTfmUser.getAndMap = jest.fn().mockResolvedValue(MOCK_TFM_USER_SCENARIOS.CAN_PROCEED);
      result = await getOrCreate(MOCK_ENTRA_USER);
    });

    it('should call tfmUser.update', () => {
      expect(tfmUser.update).toHaveBeenCalledTimes(1);
      expect(tfmUser.update).toHaveBeenCalledWith(MOCK_TFM_USER._id, MOCK_ENTRA_USER);
    });

    it('should NOT call tfmUser.create', () => {
      expect(tfmUser.create).not.toHaveBeenCalled();
    });

    it('should return the result of existingTfmUser.getAndMap', () => {
      expect(result).toEqual(MOCK_TFM_USER_SCENARIOS.CAN_PROCEED);
    });
  });

  describe('when a TFM user is found, but the user cannot proceed', () => {
    let result;
    beforeAll( async() => {
      setupStubs();

      existingTfmUser.getAndMap = jest.fn().mockResolvedValue(MOCK_TFM_USER_SCENARIOS.CANNOT_PROCEED);
      try {
        result = await getOrCreate(MOCK_ENTRA_USER);
      } catch(error) {
        // continue tests
      }
    });

    it('should NOT call tfmUser.update', () => {
      expect(tfmUser.update).not.toHaveBeenCalled();
    });

    it('should NOT call tfmUser.create', () => {
      expect(tfmUser.create).not.toHaveBeenCalled();
    });

    it('should Not return anything because exception is thrown', () => {
      expect(result).toBeUndefined();
    });

    it('should throw an error', async () => {
      try {
        await getOrCreate(MOCK_ENTRA_USER)
      } catch (error) {
        const expectedError = 'TFM auth service - Getting or creating a TFM user';

        expect(String(error).includes(expectedError)).toEqual(true);
      }
    });
  });

  describe('when a TFM user is NOT found', () => {
    let result;

    beforeAll(async () => {
      setupStubs();
      existingTfmUser.getAndMap = jest.fn().mockResolvedValue(MOCK_TFM_USER_SCENARIOS.NOT_FOUND);

      result = await getOrCreate(MOCK_ENTRA_USER);
    });

    it('should NOT call tfmUser.update', () => {
      expect(tfmUser.update).not.toHaveBeenCalled();
    });

    it('should call tfmUser.create', () => {
      expect(tfmUser.create).toHaveBeenCalledTimes(1);
      expect(tfmUser.create).toHaveBeenCalledWith(MOCK_ENTRA_USER);
    });

    it('should return the created TFM user', () => {
      expect(result).toEqual(MOCK_TFM_USER);
    });
  });
});
