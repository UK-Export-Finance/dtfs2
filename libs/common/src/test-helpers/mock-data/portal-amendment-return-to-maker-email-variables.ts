const makersEmail = 'maker1@ukexportfinance.gov.uk';
const checkersEmail = 'checker1@ukexportfinance.gov.uk';

export const portalAmendmentReturnToMakerEmailVariables = () => ({
  makersEmail,
  checkersEmail,
  emailVariables: {
    exporterName: 'mock name',
    bankInternalRefName: 'mock internal bank ref',
    ukefDealId: '0000001',
    ukefFacilityId: '0000002',
    dateEffectiveFrom: '1st January 2025',
    newCoverEndDate: '2nd February 2025',
    newFacilityEndDate: '3rd March 2025',
    newFacilityValue: '£100000',
    checkersName: 'mock checker',
    dateSubmittedByMaker: '4th April 2025',
    checkersEmail,
  },
});
