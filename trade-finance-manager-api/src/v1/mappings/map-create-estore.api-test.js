const mapCreateEstore = require('./map-create-estore');
const formatNameForSharepoint = require('../helpers/formatNameForSharepoint');
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
    ukefDealId: '123456',
    facilities: [
      { ukefFacilityId: '1' },
      { ukefFacilityId: '2' },
    ],
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
    ukefDealId: '123456',
    facilities: [
      { ukefFacilityId: '1' },
      { ukefFacilityId: '2' },
    ],
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
      exportLicence: [
        {
          _id: '621f4521827574001e0ebf74',
          parentId: '6221edcff154ec00136fcfef',
          filename: 'file7.png',
          documentPath: 'exportLicence',
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
        'exportLicence',
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
        exporterName: formatNameForSharepoint(mockBssDeal.exporter.companyName),
        buyerName: formatNameForSharepoint(mockBssDeal.buyer.name),
        dealIdentifier: mockBssDeal.ukefDealId,
        destinationMarket: mockBssDeal.destinationOfGoodsAndServices.name,
        riskMarket: mockBssDeal.buyer.country.name,
        facilityIdentifiers: ['1', '2'],
        dealType: mockBssDeal.dealType,
        supportingInformation: [
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Exporter_questionnaire',
            fileLocationPath: `files/${mockBssDeal.supportingInformation.exporterQuestionnaire[0].folder}`,
            fileName: mockBssDeal.supportingInformation.exporterQuestionnaire[0].filename,
          },
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Audited_financial_statements',
            fileLocationPath: `files/${mockBssDeal.supportingInformation.auditedFinancialStatements[0].folder}`,
            fileName: mockBssDeal.supportingInformation.auditedFinancialStatements[0].filename,
          },
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Year_to_date_management',
            fileLocationPath: `files/${mockBssDeal.supportingInformation.yearToDateManagement[0].folder}`,
            fileName: mockBssDeal.supportingInformation.yearToDateManagement[0].filename,
          },
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Corporate_structure',
            fileLocationPath: `files/${mockBssDeal.supportingInformation.corporateStructure[0].folder}`,
            fileName: mockBssDeal.supportingInformation.corporateStructure[0].filename,
          },
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Financial_information_commentary',
            fileLocationPath: `files/${mockBssDeal.supportingInformation.financialInformationCommentary[0].folder}`,
            fileName: mockBssDeal.supportingInformation.financialInformationCommentary[0].filename,
          },
          {
            parentId: '6221ee3e14a7efbadb431798',
            documentType: 'Financial_forecasts',
            fileLocationPath: `files/${mockBssDeal.supportingInformation.financialForecasts[0].folder}`,
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
        exporterName: formatNameForSharepoint(mockGefDeal.exporter.companyName),
        buyerName: CONSTANTS.DEALS.DEAL_TYPE.GEF,
        dealIdentifier: mockGefDeal.ukefDealId,
        destinationMarket: 'United Kingdom',
        riskMarket: 'United Kingdom',
        facilityIdentifiers: ['1', '2'],
        dealType: mockGefDeal.dealType,
        supportingInformation: [
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Exporter_questionnaire',
            fileLocationPath: `files/portal_storage/${mockGefDeal.supportingInformation.manualInclusion[0]._id}/${mockGefDeal.supportingInformation.manualInclusion[0].documentPath}/`,
            fileName: mockGefDeal.supportingInformation.manualInclusion[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Year_to_date_management',
            fileLocationPath: `files/portal_storage/${mockGefDeal.supportingInformation.yearToDateManagement[0]._id}/${mockGefDeal.supportingInformation.yearToDateManagement[0].documentPath}/`,
            fileName: mockGefDeal.supportingInformation.yearToDateManagement[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Audited_financial_statements',
            fileLocationPath: `files/portal_storage/${mockGefDeal.supportingInformation.auditedFinancialStatements[0]._id}/${mockGefDeal.supportingInformation.auditedFinancialStatements[0].documentPath}/`,
            fileName: mockGefDeal.supportingInformation.auditedFinancialStatements[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Financial_forecasts',
            fileLocationPath: `files/portal_storage/${mockGefDeal.supportingInformation.financialForecasts[0]._id}/${mockGefDeal.supportingInformation.financialForecasts[0].documentPath}/`,
            fileName: mockGefDeal.supportingInformation.financialForecasts[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Financial_information_commentary',
            fileLocationPath: `files/portal_storage/${mockGefDeal.supportingInformation.financialInformationCommentary[0]._id}/${mockGefDeal.supportingInformation.financialInformationCommentary[0].documentPath}/`,
            fileName: mockGefDeal.supportingInformation.financialInformationCommentary[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Corporate_structure',
            fileLocationPath: `files/portal_storage/${mockGefDeal.supportingInformation.corporateStructure[0]._id}/${mockGefDeal.supportingInformation.corporateStructure[0].documentPath}/`,
            fileName: mockGefDeal.supportingInformation.corporateStructure[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Audited_financial_statements',
            fileLocationPath: `files/portal_storage/${mockGefDeal.supportingInformation.debtorAndCreditorReports[0]._id}/${mockGefDeal.supportingInformation.debtorAndCreditorReports[0].documentPath}/`,
            fileName: mockGefDeal.supportingInformation.debtorAndCreditorReports[0].filename,
          },
          {
            parentId: '6221edcff154ec00136fcfef',
            documentType: 'Financial_information_commentary',
            fileLocationPath: `files/portal_storage/${mockGefDeal.supportingInformation.exportLicence[0]._id}/${mockGefDeal.supportingInformation.exportLicence[0].documentPath}/`,
            fileName: mockGefDeal.supportingInformation.exportLicence[0].filename,
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
