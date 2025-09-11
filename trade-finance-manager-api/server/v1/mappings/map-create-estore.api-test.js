const { formatForSharePoint } = require('@ukef/dtfs2-common');
const mapCreateEstore = require('./map-create-estore');
const CONSTANTS = require('../../constants');

describe('mapCreateEstore', () => {
  const mockBssDeal = {
    _id: '6221ee3e14a7efbadb431798',
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
    buyer: {
      name: 'Test',
      country: {
        name: 'Belgium',
      },
    },
    destinationOfGoodsAndServices: {
      name: 'France',
    },
    exporter: {
      companyName: 'Testing',
    },
    ukefDealId: '0012345678',
    facilities: [{ ukefFacilityId: '0034566890' }, { ukefFacilityId: '0034577890' }],
    supportingInformation: {
      validationErrors: {
        count: 0,
        errorList: { exporterQuestionnaire: {} },
      },
      securityDetails: { exporter: 'Test' },
      exporterQuestionnaire: [
        {
          parentId: '6221ee3e14a7efbadb431798',
          fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file2.png',
          filename: 'file2.png',
          folder: 'portal_storage/621f41e23ce31d0012c36afe',
        },
      ],
      auditedFinancialStatements: [
        {
          parentId: '6221ee3e14a7efbadb431798',
          fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file4.png',
          filename: 'file4.png',
          folder: 'portal_storage/621f41e23ce31d0012c36afe',
        },
      ],
      yearToDateManagement: [
        {
          parentId: '6221ee3e14a7efbadb431798',
          fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file7.png',
          filename: 'file7.png',
          folder: 'portal_storage/621f41e23ce31d0012c36afe',
        },
      ],
      corporateStructure: [
        {
          parentId: '6221ee3e14a7efbadb431798',
          fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file8.png',
          filename: 'file8.png',
          folder: 'portal_storage/621f41e23ce31d0012c36afe',
        },
      ],
      financialInformationCommentary: [
        {
          parentId: '6221ee3e14a7efbadb431798',
          fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file5.png',
          filename: 'file5.png',
          folder: 'portal_storage/621f41e23ce31d0012c36afe',
        },
      ],
      financialForecasts: [
        {
          parentId: '6221ee3e14a7efbadb431798',
          fullPath: 'portal_storage/621f41e23ce31d0012c36afe/cats8.png',
          filename: 'cats8.png',
          folder: 'portal_storage/621f41e23ce31d0012c36afe',
        },
      ],
    },
  };

  const mockGefDeal = {
    _id: '6221edcff154ec00136fcfef',
    dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
    exporter: {
      companyName: 'Testing',
    },
    ukefDealId: '0013236798',
    facilities: [{ ukefFacilityId: '0034337890' }, { ukefFacilityId: '0034566890' }],
    supportingInformation: {
      manualInclusion: [
        {
          _id: '621f4501827574001e0ebf6d',
          parentId: '6221edcff154ec00136fcfef',
          filename: 'file1.png',
          documentPath: 'manualInclusion',
        },
      ],
      yearToDateManagement: [
        {
          _id: '621f4506827574001e0ebf6e',
          parentId: '6221edcff154ec00136fcfef',
          filename: 'file2.png',
          documentPath: 'yearToDateManagement',
        },
      ],
      auditedFinancialStatements: [
        {
          _id: '621f450a827574001e0ebf6f',
          parentId: '6221edcff154ec00136fcfef',
          filename: 'file3.png',
          documentPath: 'auditedFinancialStatements',
        },
      ],
      financialForecasts: [
        {
          _id: '621f450e827574001e0ebf70',
          parentId: '6221edcff154ec00136fcfef',
          filename: 'file4.png',
          documentPath: 'financialForecasts',
        },
      ],
      financialInformationCommentary: [
        {
          _id: '621f4513827574001e0ebf71',
          parentId: '6221edcff154ec00136fcfef',
          filename: 'file5.png',
          documentPath: 'financialInformationCommentary',
        },
      ],
      corporateStructure: [
        {
          _id: '621f4518827574001e0ebf72',
          parentId: '6221edcff154ec00136fcfef',
          filename: 'file6.png',
          documentPath: 'corporateStructure',
        },
      ],
      debtorAndCreditorReports: [
        {
          _id: '621f452b827574001e0ebf75',
          parentId: '6221edcff154ec00136fcfef',
          filename: 'file8.png',
          documentPath: 'debtorAndCreditorReports',
        },
      ],
      status: 'Completed',
      requiredFields: [
        'manualInclusion',
        'yearToDateManagement',
        'auditedFinancialStatements',
        'financialForecasts',
        'financialInformationCommentary',
        'corporateStructure',
        'debtorAndCreditorReports',
      ],
      securityDetails: {
        exporter: 'security text',
        facility: 'security text',
      },
    },
  };

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return mapped object', () => {
      const result = mapCreateEstore(mockBssDeal);

      const expected = {
        dealId: '6221ee3e14a7efbadb431798',
        exporterName: formatForSharePoint(mockBssDeal.exporter.companyName, ' '),
        buyerName: formatForSharePoint(mockBssDeal.buyer.name, ' '),
        dealIdentifier: mockBssDeal.ukefDealId,
        destinationMarket: mockBssDeal.destinationOfGoodsAndServices.name,
        riskMarket: mockBssDeal.buyer.country.name,
        facilityIdentifiers: [mockBssDeal.facilities[0].ukefFacilityId, mockBssDeal.facilities[1].ukefFacilityId],
        supportingInformation: [
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Exporter_questionnaire',
            fileLocationPath: mockBssDeal.supportingInformation.auditedFinancialStatements[0].parentId,
            fileName: mockBssDeal.supportingInformation.exporterQuestionnaire[0].filename,
          },
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Audited_financial_statements',
            fileLocationPath: mockBssDeal.supportingInformation.auditedFinancialStatements[0].parentId,
            fileName: mockBssDeal.supportingInformation.auditedFinancialStatements[0].filename,
          },
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Year_to_date_management',
            fileLocationPath: mockBssDeal.supportingInformation.auditedFinancialStatements[0].parentId,
            fileName: mockBssDeal.supportingInformation.yearToDateManagement[0].filename,
          },
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Corporate_structure',
            fileLocationPath: mockBssDeal.supportingInformation.auditedFinancialStatements[0].parentId,
            fileName: mockBssDeal.supportingInformation.corporateStructure[0].filename,
          },
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Financial_information_commentary',
            fileLocationPath: mockBssDeal.supportingInformation.auditedFinancialStatements[0].parentId,
            fileName: mockBssDeal.supportingInformation.financialInformationCommentary[0].filename,
          },
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Financial_forecasts',
            fileLocationPath: mockBssDeal.supportingInformation.auditedFinancialStatements[0].parentId,
            fileName: mockBssDeal.supportingInformation.financialForecasts[0].filename,
          },
        ],
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    it('should return mapped object with some default values', () => {
      const result = mapCreateEstore(mockGefDeal);

      const expected = {
        dealId: '6221edcff154ec00136fcfef',
        exporterName: formatForSharePoint(mockGefDeal.exporter.companyName, ' '),
        buyerName: CONSTANTS.DEALS.DEAL_TYPE.GEF,
        dealIdentifier: mockGefDeal.ukefDealId,
        destinationMarket: 'United Kingdom',
        riskMarket: 'United Kingdom',
        facilityIdentifiers: [mockGefDeal.facilities[0].ukefFacilityId, mockGefDeal.facilities[1].ukefFacilityId],
        supportingInformation: [
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Exporter_questionnaire',
            fileLocationPath: `${mockGefDeal.supportingInformation.manualInclusion[0].parentId}/${mockGefDeal.supportingInformation.manualInclusion[0].documentPath}`,
            fileName: mockGefDeal.supportingInformation.manualInclusion[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Year_to_date_management',
            fileLocationPath: `${mockGefDeal.supportingInformation.yearToDateManagement[0].parentId}/${mockGefDeal.supportingInformation.yearToDateManagement[0].documentPath}`,
            fileName: mockGefDeal.supportingInformation.yearToDateManagement[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Audited_financial_statements',
            fileLocationPath: `${mockGefDeal.supportingInformation.auditedFinancialStatements[0].parentId}/${mockGefDeal.supportingInformation.auditedFinancialStatements[0].documentPath}`,
            fileName: mockGefDeal.supportingInformation.auditedFinancialStatements[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Financial_forecasts',
            fileLocationPath: `${mockGefDeal.supportingInformation.financialForecasts[0].parentId}/${mockGefDeal.supportingInformation.financialForecasts[0].documentPath}`,
            fileName: mockGefDeal.supportingInformation.financialForecasts[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Financial_information_commentary',
            fileLocationPath: `${mockGefDeal.supportingInformation.financialInformationCommentary[0].parentId}/${mockGefDeal.supportingInformation.financialInformationCommentary[0].documentPath}`,
            fileName: mockGefDeal.supportingInformation.financialInformationCommentary[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Corporate_structure',
            fileLocationPath: `${mockGefDeal.supportingInformation.corporateStructure[0].parentId}/${mockGefDeal.supportingInformation.corporateStructure[0].documentPath}`,
            fileName: mockGefDeal.supportingInformation.corporateStructure[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Audited_financial_statements',
            fileLocationPath: `${mockGefDeal.supportingInformation.debtorAndCreditorReports[0].parentId}/${mockGefDeal.supportingInformation.debtorAndCreditorReports[0].documentPath}`,
            fileName: mockGefDeal.supportingInformation.debtorAndCreditorReports[0].filename,
          },
        ],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is no exporter', () => {
    it('should default exporterName to empty string', () => {
      const mockDeal = {
        ...mockGefDeal,
        exporter: null,
      };
      const result = mapCreateEstore(mockDeal);
      expect(result.exporterName).toEqual('');
    });
  });

  describe('when there is no exporter.companyName', () => {
    it('should default exporterName to empty string', () => {
      const mockDeal = {
        ...mockGefDeal,
        exporter: {
          // companyName: null,
        },
      };

      const result = mapCreateEstore(mockDeal);
      expect(result.exporterName).toEqual('');
    });
  });
});
