const { supportingInfoStatus } = require('../../../../src/v1/gef/controllers/validation/supportingInfo');
const CONSTANTS = require('../../../../src/constants');

describe(`should return ${CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED} if no documents have been upload`, () => {
  const mockObject = {
    status: CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED,
    requiredFields: ['manualInclusion'],
  };

  it('should return all items that have true or false answers', () => {
    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED);
  });

  it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED} if all required documents (1 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion'];
    mockObject.manualInclusion = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
  });

  it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED} if all required documents (1 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion'];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
  });

  it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED} if all required documents (2 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'debtorAndCreditorReports'];
    mockObject.debtorAndCreditorReports = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
  });

  it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED} if all required documents (3 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'debtorAndCreditorReports', 'corporateStructure'];
    mockObject.corporateStructure = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
  });

  it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED} if all required documents (4 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'debtorAndCreditorReports', 'corporateStructure', 'financialInformationCommentary'];
    mockObject.financialInformationCommentary = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
  });

  it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED} if all required documents (5 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'debtorAndCreditorReports', 'corporateStructure', 'financialInformationCommentary', 'financialForecasts'];
    mockObject.financialForecasts = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
  });

  it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED} if all required documents (6 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'debtorAndCreditorReports', 'corporateStructure', 'financialInformationCommentary', 'financialForecasts', 'auditedFinancialStatements'];
    mockObject.auditedFinancialStatements = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
  });

  it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED} if all required documents (7 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'debtorAndCreditorReports', 'corporateStructure', 'financialInformationCommentary', 'financialForecasts', 'auditedFinancialStatements', 'yearToDateManagement'];
    mockObject.yearToDateManagement = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
  });
});
