const { mapUKEFDocumentsToEstore } = require('./map-ukef-documents-to-estore');
const CONSTANTS = require('../../constants');

const mockBssDeal = {
  validationErrors: {
    count: 0,
    errorList: { exporterQuestionnaire: {} },
  },
  securityDetails: { exporter: 'Test' },
  exporterQuestionnaire: [
    {
      parentId: '6221d67cff7e6100a511c9a9',
      type: 'general_correspondence',
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file2.png',
      filename: 'file2.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
  auditedFinancialStatements: [
    {
      parentId: '6221d67cff7e6100a511c9a9',
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file4.png',
      filename: 'file4.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
  yearToDateManagement: [
    {
      parentId: '6221d67cff7e6100a511c9a9',
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file7.png',
      filename: 'file7.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
  corporateStructure: [
    {
      parentId: '6221d67cff7e6100a511c9a9',
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file8.png',
      filename: 'file8.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
  financialInformationCommentary: [
    {
      parentId: '6221d67cff7e6100a511c9a9',
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file5.png',
      filename: 'file5.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
  financialForecasts: [
    {
      parentId: '6221d67cff7e6100a511c9a9',
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/cats8.png',
      filename: 'cats8.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
};

const mockGefDeal = {
  manualInclusion: [
    {
      _id: '621f4501827574001e0ebf6d',
      parentId: '6221d87ceee25648b62aa043',
      filename: 'file1.png',
      documentPath: 'manualInclusion',
    },
  ],
  yearToDateManagement: [
    {
      _id: '621f4506827574001e0ebf6e',
      parentId: '6221d87ceee25648b62aa043',
      filename: 'file2.png',
      documentPath: 'yearToDateManagement',
    },
  ],
  auditedFinancialStatements: [
    {
      _id: '621f450a827574001e0ebf6f',
      parentId: '6221d87ceee25648b62aa043',
      filename: 'file3.png',
      documentPath: 'auditedFinancialStatements',
    },
  ],
  financialForecasts: [
    {
      _id: '621f450e827574001e0ebf70',
      parentId: '6221d87ceee25648b62aa043',
      filename: 'file4.png',
      documentPath: 'financialForecasts',
    },
  ],
  financialInformationCommentary: [
    {
      _id: '621f4513827574001e0ebf71',
      parentId: '6221d87ceee25648b62aa043',
      filename: 'file5.png',
      documentPath: 'financialInformationCommentary',
    },
  ],
  corporateStructure: [
    {
      _id: '621f4518827574001e0ebf72',
      parentId: '6221d87ceee25648b62aa043',
      filename: 'file6.png',
      documentPath: 'corporateStructure',
    },
  ],
  debtorAndCreditorReports: [
    {
      _id: '621f452b827574001e0ebf75',
      parentId: '6221d87ceee25648b62aa043',
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
};

describe('mapUKEFDocumentsToEstore', () => {
  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return the mapped documents for BSS deals', () => {
      const result = mapUKEFDocumentsToEstore(mockBssDeal);
      const expected = [
        {
          parentId: '6221d67cff7e6100a511c9a9',
          documentType: 'Exporter_questionnaire',
          fileLocationPath: `files/${mockBssDeal.exporterQuestionnaire[0].folder}`,
          fileName: mockBssDeal.exporterQuestionnaire[0].filename,
        },
        {
          parentId: '6221d67cff7e6100a511c9a9',
          documentType: 'Audited_financial_statements',
          fileLocationPath: `files/${mockBssDeal.auditedFinancialStatements[0].folder}`,
          fileName: mockBssDeal.auditedFinancialStatements[0].filename,
        },
        {
          parentId: '6221d67cff7e6100a511c9a9',
          documentType: 'Year_to_date_management',
          fileLocationPath: `files/${mockBssDeal.yearToDateManagement[0].folder}`,
          fileName: mockBssDeal.yearToDateManagement[0].filename,
        },
        {
          parentId: '6221d67cff7e6100a511c9a9',
          documentType: 'Corporate_structure',
          fileLocationPath: `files/${mockBssDeal.corporateStructure[0].folder}`,
          fileName: mockBssDeal.corporateStructure[0].filename,
        },
        {
          parentId: '6221d67cff7e6100a511c9a9',
          documentType: 'Financial_information_commentary',
          fileLocationPath: `files/${mockBssDeal.financialInformationCommentary[0].folder}`,
          fileName: mockBssDeal.financialInformationCommentary[0].filename,
        },
        {
          parentId: '6221d67cff7e6100a511c9a9',
          documentType: 'Financial_forecasts',
          fileLocationPath: `files/${mockBssDeal.financialForecasts[0].folder}`,
          fileName: mockBssDeal.financialForecasts[0].filename,
        },
      ];
      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    it('should return the mapped documents for GEF deals', () => {
      const result = mapUKEFDocumentsToEstore(mockGefDeal);
      const expected = [
        {
          parentId: '6221d87ceee25648b62aa043',
          documentType: 'Exporter_questionnaire',
          fileLocationPath: `files/portal_storage/${mockGefDeal.manualInclusion[0].parentId}/${mockGefDeal.manualInclusion[0].documentPath}/`,
          fileName: mockGefDeal.manualInclusion[0].filename,
        },
        {
          parentId: '6221d87ceee25648b62aa043',
          documentType: 'Year_to_date_management',
          fileLocationPath: `files/portal_storage/${mockGefDeal.yearToDateManagement[0].parentId}/${mockGefDeal.yearToDateManagement[0].documentPath}/`,
          fileName: mockGefDeal.yearToDateManagement[0].filename,
        },
        {
          parentId: '6221d87ceee25648b62aa043',
          documentType: 'Audited_financial_statements',
          fileLocationPath: `files/portal_storage/${mockGefDeal.auditedFinancialStatements[0].parentId}/${mockGefDeal.auditedFinancialStatements[0].documentPath}/`,
          fileName: mockGefDeal.auditedFinancialStatements[0].filename,
        },
        {
          parentId: '6221d87ceee25648b62aa043',
          documentType: 'Financial_forecasts',
          fileLocationPath: `files/portal_storage/${mockGefDeal.financialForecasts[0].parentId}/${mockGefDeal.financialForecasts[0].documentPath}/`,
          fileName: mockGefDeal.financialForecasts[0].filename,
        },
        {
          parentId: '6221d87ceee25648b62aa043',
          documentType: 'Financial_information_commentary',
          fileLocationPath: `files/portal_storage/${mockGefDeal.financialInformationCommentary[0].parentId}/${mockGefDeal.financialInformationCommentary[0].documentPath}/`,
          fileName: mockGefDeal.financialInformationCommentary[0].filename,
        },
        {
          parentId: '6221d87ceee25648b62aa043',
          documentType: 'Corporate_structure',
          fileLocationPath: `files/portal_storage/${mockGefDeal.corporateStructure[0].parentId}/${mockGefDeal.corporateStructure[0].documentPath}/`,
          fileName: mockGefDeal.corporateStructure[0].filename,
        },
        {
          parentId: '6221d87ceee25648b62aa043',
          documentType: 'Audited_financial_statements',
          fileLocationPath: `files/portal_storage/${mockGefDeal.debtorAndCreditorReports[0].parentId}/${mockGefDeal.debtorAndCreditorReports[0].documentPath}/`,
          fileName: mockGefDeal.debtorAndCreditorReports[0].filename,
        },
      ];
      expect(result).toEqual(expected);
    });
  });
  describe('when mapped documents DO NOT exist', () => {
    it('should return an empty array when the document type is not supported', () => {
      const payload = {
        unknownField: [
          {
            filename: 'file1.png',
            documentPath: 'unknownPath',
          },
        ],
      };
      const result = mapUKEFDocumentsToEstore(payload);
      expect(result).toEqual([]);
    });
  });
});
