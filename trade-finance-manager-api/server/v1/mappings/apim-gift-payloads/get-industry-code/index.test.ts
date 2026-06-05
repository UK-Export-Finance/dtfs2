import { DEAL_TYPE, TfmDeal } from '@ukef/dtfs2-common';
import { getIndustryCode } from '.';

describe('getIndustryCode', () => {
  describe(`when the dealType is ${DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return the industry code from the deal snapshot', () => {
      // Arrange
      const expectedIndustryCode = '12345';

      const mockDeal = {
        dealSnapshot: {
          dealType: DEAL_TYPE.BSS_EWCS,
          submissionDetails: {
            'industry-class': {
              code: expectedIndustryCode,
            },
          },
        },
      } as TfmDeal;

      // Act
      const result = getIndustryCode(mockDeal);

      // Assert
      expect(result).toEqual(expectedIndustryCode);
    });

    describe('when no industry code is available in the deal snapshot', () => {
      it('should return an empty string', () => {
        // Arrange
        const mockDeal = {
          dealSnapshot: {
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionDetails: {
              'industry-class': {},
            },
          },
        } as TfmDeal;

        // Act
        const result = getIndustryCode(mockDeal);

        // Assert
        expect(result).toEqual('');
      });
    });
  });

  describe(`when the dealType is ${DEAL_TYPE.GEF}`, () => {
    it('should return the industry code from the deal snapshot', () => {
      // Arrange
      const expectedIndustryCode = '12345';

      const mockDeal = {
        dealSnapshot: {
          dealType: DEAL_TYPE.GEF,
          exporter: {
            industries: [
              {
                class: {
                  code: expectedIndustryCode,
                },
              },
            ],
          },
        },
      } as TfmDeal;

      // Act
      const result = getIndustryCode(mockDeal);

      // Assert
      expect(result).toEqual(expectedIndustryCode);
    });
  });

  describe('when no industry code is available in the deal snapshot', () => {
    it('should return an empty string', () => {
      // Arrange
      const mockDeal = {
        dealSnapshot: {
          dealType: DEAL_TYPE.GEF,
          exporter: {
            industries: [
              {
                class: {},
              },
            ],
          },
        },
      } as TfmDeal;

      // Act
      const result = getIndustryCode(mockDeal);

      // Assert
      expect(result).toEqual('');
    });
  });

  describe('when the dealType is not recognised', () => {
    it('should return an empty string', () => {
      // Arrange
      const mockDeal = {
        dealSnapshot: {
          dealType: 'MOCK_DEAL_TYPE',
        },
      } as unknown as TfmDeal;

      // Act
      const result = getIndustryCode(mockDeal);

      // Assert
      expect(result).toEqual('');
    });
  });
});
