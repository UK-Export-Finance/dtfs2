const { canSendToAcbs, DEAL_TYPE, SUBMISSION_TYPE } = require('@ukef/dtfs2-common');
const api = require('../api');
const acbs = require('./acbs.controller');
const { internalAmendmentEmail } = require('../helpers/amendment.helpers');
const { submitToAcbs } = require('./amendment.controller');

jest.mock('../api', () => ({
  findOneDeal: jest.fn(),
}));

jest.mock('./acbs.controller', () => ({
  amendAcbsFacility: jest.fn(),
}));

jest.mock('../helpers/amendment.helpers', () => ({
  internalAmendmentEmail: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  canSendToAcbs: jest.fn(),
}));

describe('submitToAcbs', () => {
  const ukefFacilityId = '0034818759';

  const amendment = {
    amendmentId: '1234',
    dealId: '00345678910',
    changeFacilityValue: true,
    tfm: {
      exposure: {
        ukefExposureValue: 2760,
      },
    },
  };

  const facility = {
    _id: 'mock-facility-id',
  };

  const tfmDeal = {
    tfm: {},
    dealSnapshot: {
      dealType: DEAL_TYPE.BSS_EWCS,
      submissionType: SUBMISSION_TYPE.AIN,
      submissionDate: 1779114849408,
      exporter: {
        companyName: 'Mock Exporter Ltd',
      },
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    console.info = jest.fn();
    console.error = jest.fn();
  });

  it('should send amendment to ACBS and return amendment enriched with ukefExposure', async () => {
    // Arrange
    api.findOneDeal.mockResolvedValue(tfmDeal);
    canSendToAcbs.mockReturnValue(true);

    // Act
    const result = await submitToAcbs(amendment, facility, ukefFacilityId);

    // Assert
    expect(console.info).toHaveBeenNthCalledWith(1, 'Sending facility amendment %s to ACBS for facility %s', amendment.amendmentId, ukefFacilityId);

    expect(api.findOneDeal).toHaveBeenNthCalledWith(1, amendment.dealId);

    expect(canSendToAcbs).toHaveBeenNthCalledWith(1, { amendment });

    expect(internalAmendmentEmail).toHaveBeenNthCalledWith(1, ukefFacilityId);

    expect(acbs.amendAcbsFacility).toHaveBeenNthCalledWith(1, amendment, facility, {
      dealSnapshot: {
        dealType: tfmDeal.dealSnapshot.dealType,
        submissionType: tfmDeal.dealSnapshot.submissionType,
        submissionDate: tfmDeal.dealSnapshot.submissionDate,
      },
      exporter: {
        companyName: tfmDeal.dealSnapshot.exporter.companyName,
      },
    });

    expect(result.ukefExposure).toEqual(amendment.tfm.exposure.ukefExposureValue);
  });

  describe('when amendment cannot be sent to ACBS', () => {
    it('should not call ACBS or email', async () => {
      // Arrange
      api.findOneDeal.mockResolvedValue(tfmDeal);
      canSendToAcbs.mockReturnValue(false);

      // Act
      const result = await submitToAcbs(amendment, facility, ukefFacilityId);

      // Assert
      expect(console.info).toHaveBeenNthCalledWith(1, 'Sending facility amendment %s to ACBS for facility %s', amendment.amendmentId, ukefFacilityId);

      expect(api.findOneDeal).toHaveBeenNthCalledWith(1, amendment.dealId);
      expect(canSendToAcbs).toHaveBeenNthCalledWith(1, { amendment });

      expect(internalAmendmentEmail).not.toHaveBeenCalled();
      expect(acbs.amendAcbsFacility).not.toHaveBeenCalled();

      expect(result.ukefExposure).toEqual(amendment.tfm.exposure.ukefExposureValue);
    });
  });

  describe('when submission orchestration fails', () => {
    it('should log error and throw standard error with identifiers', async () => {
      // Arrange
      api.findOneDeal.mockRejectedValue(new Error('Mock error'));

      // Act / Assert
      await expect(submitToAcbs(amendment, facility, ukefFacilityId)).rejects.toThrow(
        `Unable to send facility amendment ${amendment.amendmentId} to ACBS for facility ${ukefFacilityId}`,
      );

      expect(console.error).toHaveBeenNthCalledWith(
        1,
        'Unable to send facility amendment %s to ACBS for facility %s %o',
        amendment.amendmentId,
        ukefFacilityId,
        expect.any(Error),
      );
    });
  });
});
