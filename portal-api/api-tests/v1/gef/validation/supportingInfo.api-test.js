const { STATUS } = require('../../../../src/v1/gef/enums');
const { supportingInfoStatus } = require('../../../../src/v1/gef/controllers/validation/supportingInfo');

describe(`should return ${STATUS.NOT_STARTED} if no documents have been upload`, () => {
  const mockObject = {
    status: 'NOT_STARTED',
    requiredFields: ['manualInclusion'],
  };
  it('should return all items that have true or false answers', () => {
    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(STATUS.NOT_STARTED);
  });

  it(`should return ${STATUS.IN_PROGRESS} if 2 documents are required and only one is uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'exporterLicence'];
    mockObject.manualInclusion = [{}];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(STATUS.IN_PROGRESS);
  });

  it(`should return ${STATUS.COMPLETED} if all required documents (1 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion'];
    mockObject.manualInclusion = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(STATUS.COMPLETED);
  });

  it(`should return ${STATUS.COMPLETED} if all required documents (2 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'exporterLicence'];
    mockObject.exporterLicence = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(STATUS.COMPLETED);
  });

  it(`should return ${STATUS.COMPLETED} if all required documents (3 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'exporterLicence', 'debtorAndCreditorReports'];
    mockObject.debtorAndCreditorReports = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(STATUS.COMPLETED);
  });

  it(`should return ${STATUS.COMPLETED} if all required documents (4 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'exporterLicence', 'debtorAndCreditorReports', 'corporateStructure'];
    mockObject.corporateStructure = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(STATUS.COMPLETED);
  });

  it(`should return ${STATUS.COMPLETED} if all required documents (5 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'exporterLicence', 'debtorAndCreditorReports', 'corporateStructure', 'financialCommentary'];
    mockObject.financialCommentary = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(STATUS.COMPLETED);
  });

  it(`should return ${STATUS.COMPLETED} if all required documents (6 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'exporterLicence', 'debtorAndCreditorReports', 'corporateStructure', 'financialCommentary', 'financialForecasts'];
    mockObject.financialForecasts = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(STATUS.COMPLETED);
  });

  it(`should return ${STATUS.COMPLETED} if all required documents (7 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'exporterLicence', 'debtorAndCreditorReports', 'corporateStructure', 'financialCommentary', 'financialForecasts', 'financialStatements'];
    mockObject.financialStatements = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(STATUS.COMPLETED);
  });

  it(`should return ${STATUS.COMPLETED} if all required documents (8 in total) have been uploaded`, () => {
    mockObject.requiredFields = ['manualInclusion', 'exporterLicence', 'debtorAndCreditorReports', 'corporateStructure', 'financialCommentary', 'financialForecasts', 'financialStatements', 'managementAccounts'];
    mockObject.managementAccounts = [{ }];

    const result = supportingInfoStatus(mockObject);
    expect(result).toEqual(STATUS.COMPLETED);
  });
});
