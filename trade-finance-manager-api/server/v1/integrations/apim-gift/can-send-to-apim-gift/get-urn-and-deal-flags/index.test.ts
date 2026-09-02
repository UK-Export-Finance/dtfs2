import { DEAL_SUBMISSION_TYPE, DEAL_TYPE, TfmDeal } from '@ukef/dtfs2-common';
import { getUrnAndDealFlags } from '.';
import { mockTfmDeal } from '../../test-mocks';

describe('getUrnAndDealFlags', () => {
  describe.each([
    {
      dealType: DEAL_TYPE.BSS_EWCS,
      submissionType: DEAL_SUBMISSION_TYPE.AIN,
      isBssEwcsDeal: true,
      isGefDeal: false,
    },
    {
      dealType: DEAL_TYPE.BSS_EWCS,
      submissionType: DEAL_SUBMISSION_TYPE.MIN,
      isBssEwcsDeal: true,
      isGefDeal: false,
    },
    {
      dealType: DEAL_TYPE.GEF,
      submissionType: DEAL_SUBMISSION_TYPE.AIN,
      isBssEwcsDeal: false,
      isGefDeal: true,
    },
    {
      dealType: DEAL_TYPE.GEF,
      submissionType: DEAL_SUBMISSION_TYPE.MIN,
      isBssEwcsDeal: false,
      isGefDeal: true,
    },
  ])('when the deal is $dealType, submission type is $submissionType', ({ dealType, submissionType, isBssEwcsDeal, isGefDeal }) => {
    describe('when all URNs are present and exporter credit rating is present', () => {
      it('should return correct flags', () => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType,
            submissionType,
            bank: {
              partyUrn: 'bank-urn',
            },
          },
          tfm: {
            ...mockTfmDeal.tfm,
            exporterCreditRating: 'Acceptable (B+)',
            parties: {
              buyer: {
                partyUrn: isBssEwcsDeal ? 'buyer-urn' : '',
              },
              exporter: {
                partyUrn: isGefDeal ? 'exporter-urn' : '',
              },
            },
          },
        } as TfmDeal;

        // Act
        const result = getUrnAndDealFlags(mockDeal);

        // Assert
        const expected = {
          hasExporterCreditRating: true,
          isBssEwcsDeal,
          isGefDeal,
          isValidBssEwcsDeal: isBssEwcsDeal,
          isValidGefDeal: isGefDeal,
          validDealType: true,
          validSubmissionType: true,
        };

        expect(result).toEqual(expected);
      });
    });

    describe('when no URNs are present', () => {
      it('should return isValidBssEwcsDeal and isValidGefDeal as false', () => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType,
            submissionType,
            bank: {
              partyUrn: '',
            },
          },
          tfm: {
            ...mockTfmDeal.tfm,
            exporterCreditRating: 'Acceptable (B+)',
            parties: {
              buyer: {
                partyUrn: '',
              },
              exporter: {
                partyUrn: '',
              },
            },
          },
        } as TfmDeal;

        // Act
        const result = getUrnAndDealFlags(mockDeal);

        // Assert
        expect(result.isValidBssEwcsDeal).toEqual(false);
        expect(result.isValidGefDeal).toEqual(false);
      });
    });
  });

  describe.each([
    {
      dealType: DEAL_TYPE.BSS_EWCS,
      submissionType: DEAL_SUBMISSION_TYPE.MIA,
    },
    {
      dealType: DEAL_TYPE.GEF,
      submissionType: DEAL_SUBMISSION_TYPE.MIA,
    },
  ])('when the deal is $dealType, submission type is $submissionType (invalid submission type)', ({ dealType, submissionType }) => {
    it('should return validSubmissionType as false', () => {
      // Arrange
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType,
          submissionType,
          bank: {
            partyUrn: 'bank-urn',
          },
        },
        tfm: {
          ...mockTfmDeal.tfm,
          exporterCreditRating: 'Acceptable (B+)',
          parties: {
            buyer: {
              partyUrn: 'buyer-urn',
            },
            exporter: {
              partyUrn: 'exporter-urn',
            },
          },
        },
      } as TfmDeal;

      // Act
      const result = getUrnAndDealFlags(mockDeal);

      // Assert
      expect(result.validSubmissionType).toEqual(false);
    });
  });

  describe.each([{ exporterCreditRating: undefined }, { exporterCreditRating: null }, { exporterCreditRating: '' }, { exporterCreditRating: '   ' }])(
    'when exporter credit rating is $exporterCreditRating',
    ({ exporterCreditRating }: { exporterCreditRating: string | null | undefined }) => {
      it('should return hasExporterCreditRating as false', () => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
            bank: {
              partyUrn: 'bank-urn',
            },
          },
          tfm: {
            ...mockTfmDeal.tfm,
            exporterCreditRating,
            parties: {
              buyer: {
                partyUrn: 'buyer-urn',
              },
              exporter: {
                partyUrn: 'exporter-urn',
              },
            },
          },
        } as TfmDeal;

        // Act
        const result = getUrnAndDealFlags(mockDeal);

        // Assert
        expect(result.hasExporterCreditRating).toEqual(false);
      });
    },
  );

  describe('when exporter credit rating is present', () => {
    it('should return hasExporterCreditRating as true', () => {
      // Arrange
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType: DEAL_TYPE.GEF,
          submissionType: DEAL_SUBMISSION_TYPE.AIN,
          bank: {
            partyUrn: 'bank-urn',
          },
        },
        tfm: {
          ...mockTfmDeal.tfm,
          exporterCreditRating: 'Acceptable (B+)',
          parties: {
            buyer: {
              partyUrn: 'buyer-urn',
            },
            exporter: {
              partyUrn: 'exporter-urn',
            },
          },
        },
      } as TfmDeal;

      // Act
      const result = getUrnAndDealFlags(mockDeal);

      // Assert
      expect(result.hasExporterCreditRating).toEqual(true);
    });
  });

  describe(`when deal type is not ${DEAL_TYPE.BSS_EWCS} or ${DEAL_TYPE.GEF}`, () => {
    it('should return validDealType as false', () => {
      // Arrange
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType: null,
          submissionType: DEAL_SUBMISSION_TYPE.AIN,
          bank: {
            partyUrn: 'bank-urn',
          },
        },
        tfm: {
          ...mockTfmDeal.tfm,
          exporterCreditRating: 'Acceptable (B+)',
          parties: {
            buyer: {
              partyUrn: 'buyer-urn',
            },
            exporter: {
              partyUrn: 'exporter-urn',
            },
          },
        },
      } as unknown as TfmDeal;

      // Act
      const result = getUrnAndDealFlags(mockDeal);

      // Assert
      expect(result.validDealType).toEqual(false);
      expect(result.isBssEwcsDeal).toEqual(false);
      expect(result.isGefDeal).toEqual(false);
    });
  });

  describe(`when deal type is ${DEAL_TYPE.BSS_EWCS} but buyer URN is missing`, () => {
    it('should return isValidBssEwcsDeal as false', () => {
      // Arrange
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType: DEAL_TYPE.BSS_EWCS,
          submissionType: DEAL_SUBMISSION_TYPE.AIN,
          bank: {
            partyUrn: 'bank-urn',
          },
        },
        tfm: {
          ...mockTfmDeal.tfm,
          exporterCreditRating: 'Acceptable (B+)',
          parties: {
            buyer: {
              partyUrn: '',
            },
            exporter: {
              partyUrn: 'exporter-urn',
            },
          },
        },
      } as TfmDeal;

      // Act
      const result = getUrnAndDealFlags(mockDeal);

      // Assert
      expect(result.isValidBssEwcsDeal).toEqual(false);
    });
  });

  describe(`when deal type is ${DEAL_TYPE.GEF} but exporter URN is missing`, () => {
    it('should return isValidGefDeal as false', () => {
      // Arrange
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType: DEAL_TYPE.GEF,
          submissionType: DEAL_SUBMISSION_TYPE.AIN,
          bank: {
            partyUrn: 'bank-urn',
          },
        },
        tfm: {
          ...mockTfmDeal.tfm,
          exporterCreditRating: 'Acceptable (B+)',
          parties: {
            buyer: {
              partyUrn: 'buyer-urn',
            },
            exporter: {
              partyUrn: '',
            },
          },
        },
      } as TfmDeal;

      // Act
      const result = getUrnAndDealFlags(mockDeal);

      // Assert
      expect(result.isValidGefDeal).toEqual(false);
    });
  });

  describe('when both buyer and exporter URNs are present', () => {
    it(`should return isValidBssEwcsDeal as true for ${DEAL_TYPE.BSS_EWCS} deal`, () => {
      // Arrange
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType: DEAL_TYPE.BSS_EWCS,
          submissionType: DEAL_SUBMISSION_TYPE.AIN,
          bank: {
            partyUrn: 'bank-urn',
          },
        },
        tfm: {
          ...mockTfmDeal.tfm,
          exporterCreditRating: 'Acceptable (B+)',
          parties: {
            buyer: {
              partyUrn: 'buyer-urn',
            },
            exporter: {
              partyUrn: 'exporter-urn',
            },
          },
        },
      } as TfmDeal;

      // Act
      const result = getUrnAndDealFlags(mockDeal);

      // Assert
      expect(result.isValidBssEwcsDeal).toEqual(true);
      expect(result.isValidGefDeal).toEqual(false);
    });

    it(`should return isValidGefDeal as true for ${DEAL_TYPE.GEF} deal`, () => {
      // Arrange
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType: DEAL_TYPE.GEF,
          submissionType: DEAL_SUBMISSION_TYPE.AIN,
          bank: {
            partyUrn: 'bank-urn',
          },
        },
        tfm: {
          ...mockTfmDeal.tfm,
          exporterCreditRating: 'Acceptable (B+)',
          parties: {
            buyer: {
              partyUrn: 'buyer-urn',
            },
            exporter: {
              partyUrn: 'exporter-urn',
            },
          },
        },
      } as TfmDeal;

      // Act
      const result = getUrnAndDealFlags(mockDeal);

      // Assert
      expect(result.isValidBssEwcsDeal).toEqual(false);
      expect(result.isValidGefDeal).toEqual(true);
    });
  });

  describe('return shape consistency', () => {
    it('should always return all required properties', () => {
      // Arrange
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType: DEAL_TYPE.BSS_EWCS,
          submissionType: DEAL_SUBMISSION_TYPE.AIN,
          bank: {
            partyUrn: 'bank-urn',
          },
        },
        tfm: {
          ...mockTfmDeal.tfm,
          exporterCreditRating: 'Acceptable (B+)',
          parties: {
            buyer: {
              partyUrn: 'buyer-urn',
            },
            exporter: {
              partyUrn: 'exporter-urn',
            },
          },
        },
      } as TfmDeal;

      // Act
      const result = getUrnAndDealFlags(mockDeal);

      // Assert
      expect(result).toHaveProperty('hasExporterCreditRating');
      expect(result).toHaveProperty('isBssEwcsDeal');
      expect(result).toHaveProperty('isGefDeal');
      expect(result).toHaveProperty('isValidBssEwcsDeal');
      expect(result).toHaveProperty('isValidGefDeal');
      expect(result).toHaveProperty('validDealType');
      expect(result).toHaveProperty('validSubmissionType');
    });

    it('should return boolean values for all properties', () => {
      // Arrange
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType: DEAL_TYPE.GEF,
          submissionType: DEAL_SUBMISSION_TYPE.MIN,
          bank: {
            partyUrn: 'bank-urn',
          },
        },
        tfm: {
          ...mockTfmDeal.tfm,
          exporterCreditRating: 'Acceptable (B+)',
          parties: {
            buyer: {
              partyUrn: 'buyer-urn',
            },
            exporter: {
              partyUrn: 'exporter-urn',
            },
          },
        },
      } as TfmDeal;

      // Act
      const result = getUrnAndDealFlags(mockDeal);

      // Assert
      Object.values(result).forEach((value) => {
        expect(typeof value).toBe('boolean');
      });
    });
  });
});
