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
      type: 'general_correspondence',
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file2.png',
      filename: 'file2.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
  auditedFinancialStatements: [
    {
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file4.png',
      filename: 'file4.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
  yearToDateManagement: [
    {
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file7.png',
      filename: 'file7.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
  corporateStructure: [
    {
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file8.png',
      filename: 'file8.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
  financialInformationCommentary: [
    {
      fullPath: 'portal_storage/621f41e23ce31d0012c36afe/file5.png',
      filename: 'file5.png',
      folder: 'portal_storage/621f41e23ce31d0012c36afe',
    },
  ],
  financialForecasts: [
    {
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

      filename: 'file1.png',
      documentPath: 'manualInclusion',
    },
  ],
  yearToDateManagement: [
    {
      _id: '621f4506827574001e0ebf6e',
      filename: 'file2.png',
      documentPath: 'yearToDateManagement',
    },
  ],
  auditedFinancialStatements: [
    {
      _id: '621f450a827574001e0ebf6f',
      filename: 'file3.png',
      documentPath: 'auditedFinancialStatements',
    },
  ],
  financialForecasts: [
    {
      _id: '621f450e827574001e0ebf70',
      filename: 'file4.png',
      documentPath: 'financialForecasts',
    },
  ],
  financialInformationCommentary: [
    {
      _id: '621f4513827574001e0ebf71',
      filename: 'file5.png',
      documentPath: 'financialInformationCommentary',
    },
  ],
  corporateStructure: [
    {
      _id: '621f4518827574001e0ebf72',
      filename: 'file6.png',
      documentPath: 'corporateStructure',
    },
  ],
  debtorAndCreditorReports: [
    {
      _id: '621f452b827574001e0ebf75',
      filename: 'file8.png',
      documentPath: 'debtorAndCreditorReports',
    },
  ],
  exportLicence: [
    {
      _id: '621f4521827574001e0ebf74',
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
};

describe('mapUKEFDocumentsToEstore', () => {
  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return the mapped documents for BSS deals', () => {
      const result = mapUKEFDocumentsToEstore(mockBssDeal);
      const expected = [
        {
          documentType: 'Exporter_questionnaire',
          fileLocationPath: `files/${mockBssDeal.exporterQuestionnaire[0].folder}`,
          fileName: mockBssDeal.exporterQuestionnaire[0].filename,
        },
        {
          documentType: 'Audited_financial_statements',
          fileLocationPath: `files/${mockBssDeal.auditedFinancialStatements[0].folder}`,
          fileName: mockBssDeal.auditedFinancialStatements[0].filename,
        },
        {
          documentType: 'Year_to_date_management',
          fileLocationPath: `files/${mockBssDeal.yearToDateManagement[0].folder}`,
          fileName: mockBssDeal.yearToDateManagement[0].filename,
        },
        {
          documentType: 'Corporate_structure',
          fileLocationPath: `files/${mockBssDeal.corporateStructure[0].folder}`,
          fileName: mockBssDeal.corporateStructure[0].filename,
        },
        {
          documentType: 'Financial_information_commentary',
          fileLocationPath: `files/${mockBssDeal.financialInformationCommentary[0].folder}`,
          fileName: mockBssDeal.financialInformationCommentary[0].filename,
        },
        {
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
          documentType: 'Exporter_questionnaire',
          fileLocationPath: `files/portal_storage/${mockGefDeal.manualInclusion[0]._id}/${mockGefDeal.manualInclusion[0].documentPath}/`,
          fileName: mockGefDeal.manualInclusion[0].filename,
        },
        {
          documentType: 'Year_to_date_management',
          fileLocationPath: `files/portal_storage/${mockGefDeal.yearToDateManagement[0]._id}/${mockGefDeal.yearToDateManagement[0].documentPath}/`,
          fileName: mockGefDeal.yearToDateManagement[0].filename,
        },
        {
          documentType: 'Audited_financial_statements',
          fileLocationPath: `files/portal_storage/${mockGefDeal.auditedFinancialStatements[0]._id}/${mockGefDeal.auditedFinancialStatements[0].documentPath}/`,
          fileName: mockGefDeal.auditedFinancialStatements[0].filename,
        },
        {
          documentType: 'Financial_forecasts',
          fileLocationPath: `files/portal_storage/${mockGefDeal.financialForecasts[0]._id}/${mockGefDeal.financialForecasts[0].documentPath}/`,
          fileName: mockGefDeal.financialForecasts[0].filename,
        },
        {
          documentType: 'Financial_information_commentary',
          fileLocationPath: `files/portal_storage/${mockGefDeal.financialInformationCommentary[0]._id}/${mockGefDeal.financialInformationCommentary[0].documentPath}/`,
          fileName: mockGefDeal.financialInformationCommentary[0].filename,
        },
        {
          documentType: 'Corporate_structure',
          fileLocationPath: `files/portal_storage/${mockGefDeal.corporateStructure[0]._id}/${mockGefDeal.corporateStructure[0].documentPath}/`,
          fileName: mockGefDeal.corporateStructure[0].filename,
        },
        {
          documentType: 'Audited_financial_statements',
          fileLocationPath: `files/portal_storage/${mockGefDeal.debtorAndCreditorReports[0]._id}/${mockGefDeal.debtorAndCreditorReports[0].documentPath}/`,
          fileName: mockGefDeal.debtorAndCreditorReports[0].filename,
        },
        {
          documentType: 'Financial_information_commentary',
          fileLocationPath: `files/portal_storage/${mockGefDeal.exportLicence[0]._id}/${mockGefDeal.exportLicence[0].documentPath}/`,
          fileName: mockGefDeal.exportLicence[0].filename,
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
