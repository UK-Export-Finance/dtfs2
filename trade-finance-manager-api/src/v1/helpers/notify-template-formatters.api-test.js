const {
  generateFacilitiesListHeading,
  generateFacilitiesReferenceListString,
  generateFacilitiesListString,
  generateBssFacilityLists,
  generateGefFacilityLists,
  generateFacilityLists,
} = require('./notify-template-formatters');
const { issuedFacilities } = require('./issued-facilities');
const { capitalizeFirstLetter } = require('../../utils/string');

const CONSTANTS = require('../../constants');

describe('notify-template-formatters', () => {
  describe('generateFacilitiesListHeading', () => {
    describe('when facilityType is loan', () => {
      it('should return loan product name', () => {
        const result = generateFacilitiesListHeading(CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

        expect(result).toEqual(`#${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN}\n\n`);
      });
    });

    describe('when facilityType is bond', () => {
      it('should return bond product name', () => {
        const result = generateFacilitiesListHeading(CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

        expect(result).toEqual(`#${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND}\n\n`);
      });
    });

    describe('when facilityType is cash', () => {
      it('should return cash product name', () => {
        const result = generateFacilitiesListHeading(CONSTANTS.FACILITIES.FACILITY_TYPE.CASH);

        expect(result).toEqual(`#${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CASH} facility\n\n`);
      });
    });

    describe('when facilityType is contingent', () => {
      it('should return contingent product name', () => {
        const result = generateFacilitiesListHeading(CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT);

        expect(result).toEqual(`#${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CONTINGENT} facility\n\n`);
      });
    });
  });

  describe('generateFacilitiesReferenceListString', () => {
    it('should return string list for all facilities', () => {
      const mockFacilities = [
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
          ukefFacilityID: '1',
          uniqueIdentificationNumber: '123',
        },
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
          ukefFacilityID: '2',
          uniqueIdentificationNumber: '456',
        },
      ];

      const result = generateFacilitiesReferenceListString(mockFacilities);

      const expectedString = (facility) => {
        const {
          facilityType,
          ukefFacilityID,
          uniqueIdentificationNumber,
        } = facility;

        const bankRefString = `with your reference ${uniqueIdentificationNumber} `;

        return `- ${capitalizeFirstLetter(facilityType)} facility ${bankRefString}has been given the UKEF reference: ${ukefFacilityID} \n`;
      };

      const firstString = expectedString(mockFacilities[0]);
      const secondString = expectedString(mockFacilities[1]);

      const expected = `${firstString}${secondString}`;
      expect(result).toEqual(expected);
    });

    describe('when a facility has no uniqueIdentificationNumber, but has bankReference', () => {
      it('should return string with bankReference', () => {
        const mockFacility = {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
          ukefFacilityID: '1',
          bankReferenceNumber: '100',
        };

        const result = generateFacilitiesReferenceListString([mockFacility]);

        const expectedString = (facility) => {
          const {
            facilityType,
            ukefFacilityID,
            bankReferenceNumber,
          } = facility;

          const bankRefString = `with your reference ${bankReferenceNumber} `;

          return `- ${capitalizeFirstLetter(facilityType)} facility ${bankRefString}has been given the UKEF reference: ${ukefFacilityID} \n`;
        };

        const expected = expectedString(mockFacility);
        expect(result).toEqual(expected);
      });
    });

    describe('when a facility does NOT have uniqueIdentificationNumber or bankReference', () => {
      it('should return string', () => {
        const mockFacility = {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
          ukefFacilityID: '1',
        };

        const result = generateFacilitiesReferenceListString([mockFacility]);

        const expectedString = (facility) => {
          const { facilityType, ukefFacilityID } = facility;

          return `- ${capitalizeFirstLetter(facilityType)} facility has been given the UKEF reference: ${ukefFacilityID} \n`;
        };

        const expected = expectedString(mockFacility);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('generateFacilitiesListString', () => {
    const expectedString = (facility, bankRefField) => {
      const { ukefFacilityID } = facility;

      let bankRefStr;
      if (bankRefField) {
        bankRefStr = `*Your bank ref: ${facility[bankRefField]}\n`;
      }

      const ukefIdString = `*UKEF facility ID: ${ukefFacilityID}\n\n`;

      return `${bankRefStr}${ukefIdString}`;
    };

    it('should return string list for all facilities with a single heading', () => {
      const mockFacilities = [
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
          ukefFacilityID: '1',
          uniqueIdentificationNumber: '123',
        },
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
          ukefFacilityID: '2',
          uniqueIdentificationNumber: '456',
        },
      ];

      const result = generateFacilitiesListString(mockFacilities);

      const heading = generateFacilitiesListHeading(mockFacilities[0].facilityType);

      const firstString = expectedString(mockFacilities[0], 'uniqueIdentificationNumber');
      const secondString = expectedString(mockFacilities[1], 'uniqueIdentificationNumber');
      const strings = `${firstString}${secondString}`;

      const expected = `${heading}${strings}`;

      expect(result).toEqual(expected);
    });

    describe('when a facility has no uniqueIdentificationNumber, but has bankReferenceNumber', () => {
      it('should return string with bankReferenceNumber', () => {
        const mockFacilities = [
          {
            facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
            ukefFacilityID: '1',
            bankReferenceNumber: '123',
          },
        ];

        const result = generateFacilitiesListString(mockFacilities);

        const heading = generateFacilitiesListHeading(mockFacilities[0].facilityType);

        const string = expectedString(mockFacilities[0], 'bankReferenceNumber');

        const expected = `${heading}${string}`;

        expect(result).toEqual(expected);
      });
    });

    describe('when a facility does NOT have uniqueIdentificationNumber or bankReferenceNumber', () => {
      it('should return string', () => {
        const mockFacilities = [
          {
            facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
            ukefFacilityID: '1',
          },
        ];

        const result = generateFacilitiesListString(mockFacilities);

        const heading = generateFacilitiesListHeading(mockFacilities[0].facilityType);

        const string = `*UKEF facility ID: ${mockFacilities[0].ukefFacilityID}\n\n`;

        const expected = `${heading}${string}`;

        expect(result).toEqual(expected);
      });
    });

    describe('when there are no facilities', () => {
      it('should return empty string', () => {
        const result = generateFacilitiesListString([]);

        expect(result).toEqual('');
      });
    });
  });

  describe('generateBssFacilityLists', () => {
    it('should return issued and unissued facilities list string', () => {
      const mockFacilities = [
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
          hasBeenIssued: true,
        },
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
          hasBeenIssued: false,
        },
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
          hasBeenIssued: true,
        },
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
          hasBeenIssued: false,
        },
      ];

      const result = generateBssFacilityLists(mockFacilities);

      const {
        issuedBonds, unissuedBonds, issuedLoans, unissuedLoans,
      } = issuedFacilities(mockFacilities);

      const issuedBondsList = generateFacilitiesListString(issuedBonds);
      const issuedLoansList = generateFacilitiesListString(issuedLoans);

      const unissuedBondsList = generateFacilitiesListString(unissuedBonds);
      const unissuedLoansList = generateFacilitiesListString(unissuedLoans);

      const expectedIssuedStr = `${issuedBondsList}\n${issuedLoansList}`;
      const expectedUnissuedStr = `${unissuedBondsList}\n${unissuedLoansList}`;

      const expected = {
        issued: expectedIssuedStr,
        unissued: expectedUnissuedStr,
      };

      expect(result).toEqual(expected);
    });

    describe('when tere are no unissued facilities', () => {
      it('should return unissued as empty string', () => {
        const mockFacilities = [
          {
            facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
            hasBeenIssued: true,
          },
        ];

        const result = generateBssFacilityLists(mockFacilities);

        expect(result.unissued).toEqual('');
      });
    });
  });

  describe('generateGefFacilityLists', () => {
    it('should return issued and unissued facilities list string', () => {
      const mockFacilities = [
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
          hasBeenIssued: true,
        },
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
          hasBeenIssued: false,
        },
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
          hasBeenIssued: true,
        },
        {
          facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
          hasBeenIssued: false,
        },
      ];

      const result = generateGefFacilityLists(mockFacilities);

      const {
        issuedCash, unissuedCash, issuedContingent, unissuedContingent,
      } = issuedFacilities(mockFacilities);

      const issuedCashList = generateFacilitiesListString(issuedCash);
      const issuedContingentList = generateFacilitiesListString(issuedContingent);

      const unissuedCashList = generateFacilitiesListString(unissuedCash);
      const unissuedContingentList = generateFacilitiesListString(unissuedContingent);

      const expectedIssuedStr = `${issuedCashList}\n${issuedContingentList}`;
      const expectedUnissuedStr = `${unissuedCashList}\n${unissuedContingentList}`;

      const expected = {
        issued: expectedIssuedStr,
        unissued: expectedUnissuedStr,
      };

      expect(result).toEqual(expected);
    });

    describe('when tere are no unissued facilities', () => {
      it('should return unissued as empty string', () => {
        const mockFacilities = [
          {
            facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
            hasBeenIssued: true,
          },
        ];

        const result = generateGefFacilityLists(mockFacilities);

        expect(result.unissued).toEqual('');
      });
    });
  });

  describe('generateFacilityLists', () => {
    describe('when dealType is BSS/EWCS', () => {
      it('should return result of generateBssFacilityLists', () => {
        const mockDealType = CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS;
        const mockFacilities = [];

        const result = generateFacilityLists(mockDealType, mockFacilities);
        const { issued, unissued } = generateBssFacilityLists(mockFacilities);

        const expected = { issued, unissued };

        expect(result).toEqual(expected);
      });
    });

    describe('when dealType is GEF', () => {
      it('should return result of generateGefFacilityLists', () => {
        const mockDealType = CONSTANTS.DEALS.DEAL_TYPE.GEF;
        const mockFacilities = [];

        const result = generateFacilityLists(mockDealType, mockFacilities);
        const { issued, unissued } = generateGefFacilityLists(mockFacilities);

        const expected = { issued, unissued };

        expect(result).toEqual(expected);
      });
    });
  });
});
