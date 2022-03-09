import Application from './application';
import api from '../services/api';
import CONSTANTS from '../constants';

jest.mock('../services/api');

const MockEligibilityCriteria = () => ({
  criteria: [
    { id: 12, name: 'coverStart', answer: true },
    { id: 13, name: 'noticeDate', answer: true },
    { id: 14, name: 'facilityLimit', answer: true },
    { id: 15, name: 'exporterDeclaration', answer: true },
    { id: 16, name: 'dueDiligence', answer: true },
    { id: 17, name: 'facilityLetter', answer: true },
    { id: 18, name: 'facilityBaseCurrency', answer: true },
    { id: 19, name: 'facilityPaymentCurrency', answer: true },
  ],
});

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporter = {};
  res.bank = { id: 'BANKID' };
  res.bankInternalRefName = 'My test';
  res.status = CONSTANTS.DEAL_STATUS.DRAFT;
  res.userId = 'mock-user';
  res.supportingInformation = {};
  res.eligibility = MockEligibilityCriteria();

  return res;
};

const MockUserResponse = () => ({
  username: 'maker',
  bank: { id: 'BANKID' },
});

const MockFacilityResponse = () => {
  const res = {};
  res.status = CONSTANTS.DEAL_STATUS.IN_PROGRESS;
  res.data = [];
  res.items = [{
    details: { type: CONSTANTS.FACILITY_TYPE.CASH },
    validation: { required: [] },
    createdAt: 20,
  }];
  return res;
};

describe('models/application', () => {
  describe('findById()', () => {
    let mockApplicationResponse;
    let mockFacilityResponse;

    beforeEach(() => {
      mockApplicationResponse = MockApplicationResponse();
      mockFacilityResponse = MockFacilityResponse();

      api.getApplication.mockResolvedValue(mockApplicationResponse);
      api.getFacilities.mockResolvedValue(mockFacilityResponse);
      api.getUserDetails.mockResolvedValue(MockUserResponse());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('returns model with expected supporting information fields for EC12', () => {
      beforeEach(() => {
        mockApplicationResponse.eligibility = MockEligibilityCriteria();
        mockApplicationResponse.eligibility.criteria[0].answer = false;
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(CONSTANTS.DEAL_STATUS.NOT_STARTED);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion', 'yearToDateManagement', 'auditedFinancialStatements', 'financialForecasts', 'financialInformationCommentary', 'corporateStructure', 'debtorAndCreditorReports']);
      });
    });

    describe('returns model with expected supporting information fields for EC14', () => {
      beforeEach(() => {
        mockApplicationResponse.eligibility = MockEligibilityCriteria();
        mockApplicationResponse.eligibility.criteria[2].answer = false;
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(CONSTANTS.DEAL_STATUS.NOT_STARTED);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion', 'yearToDateManagement', 'auditedFinancialStatements', 'financialForecasts', 'financialInformationCommentary', 'corporateStructure', 'debtorAndCreditorReports']);
      });
    });

    describe('returns model with expected supporting information fields for EC15', () => {
      beforeEach(() => {
        mockApplicationResponse.eligibility = MockEligibilityCriteria();

        mockApplicationResponse.eligibility.criteria[3].answer = false;
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(CONSTANTS.DEAL_STATUS.NOT_STARTED);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion', 'exportLicence']);
      });
    });

    describe('returns model with expected supporting information fields for all other Cover terms', () => {
      beforeEach(() => {
        mockApplicationResponse.eligibility = MockEligibilityCriteria();
        mockApplicationResponse.eligibility.criteria[1].answer = false;
        mockApplicationResponse.eligibility.criteria[4].answer = false;
        mockApplicationResponse.eligibility.criteria[5].answer = false;
        mockApplicationResponse.eligibility.criteria[6].answer = false;
        mockApplicationResponse.eligibility.criteria[7].answer = false;
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(CONSTANTS.DEAL_STATUS.NOT_STARTED);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion']);
      });
    });

    describe('returns model with expected supporting information fields when some documents are set', () => {
      beforeEach(() => {
        mockApplicationResponse.supportingInformation.manualInclusion = ['path'];

        mockApplicationResponse.eligibility = MockEligibilityCriteria();
        mockApplicationResponse.eligibility.criteria[3].answer = false;
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(CONSTANTS.DEAL_STATUS.IN_PROGRESS);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion', 'exportLicence']);
      });
    });

    describe('returns model with expected supporting information fields when all documents are set', () => {
      beforeEach(() => {
        mockApplicationResponse.supportingInformation.securityDetails = { exporter: 'a', application: 'b' };
        mockApplicationResponse.supportingInformation.manualInclusion = ['path'];
        mockApplicationResponse.supportingInformation.exportLicence = ['path'];

        mockApplicationResponse.eligibility = MockEligibilityCriteria();
        mockApplicationResponse.eligibility.criteria[3].answer = false;
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(CONSTANTS.DEAL_STATUS.COMPLETED);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion', 'exportLicence']);
      });
    });
  });
});
