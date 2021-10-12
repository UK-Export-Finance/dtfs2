import Application from './application';
import api from '../services/api';

jest.mock('../services/api');

const { PROGRESS } = require('../../constants');

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporterId = '123';
  res.coverTermsId = '123';
  res.bankId = 'BANKID';
  res.bankInternalRefName = 'My test';
  res.status = 'DRAFT';
  res.userId = 'mock-user';
  res.supportingInformation = {};

  return res;
};

const MockUserResponse = () => ({
  username: 'maker',
  bank: { id: 'BANKID' },
});

const MockExporterResponse = () => {
  const res = {};
  res.details = {};
  res.status = 'IN_PROGRESS';
  res.validation = {};
  res.details.companiesHouseRegistrationNumber = 'tedsi';
  res.validation.required = [];
  return res;
};

const MockCoverTermsResponse = () => {
  const res = {};
  res.status = 'COMPLETED';
  res.details = {
    _id: 'id',
    coverStart: 'true',
    noticeDate: 'true',
    facilityLimit: 'true',
    exporterDeclaration: 'true',
    dueDiligence: 'true',
    facilityLetter: 'true',
    facilityBaseCurrency: 'true',
    facilityPaymentCurrency: 'true',
    createdAt: 1633607084970,
    updatedAt: 1633960035008,
  };
  res.validation = {};
  res.validation.required = [];
  res.data = [];

  return res;
};

const MockEligibilityCriteriaResponse = () => ({
  terms: [
    {
      id: 'coverStart',
      htmlText: '<p>Some eligibility criteria</p>',
      errMsg: '12. Select some eligibilty',
    },
  ],
});

const MockFacilityResponse = () => {
  const res = {};
  res.status = 'IN_PROGRESS';
  res.data = [];
  res.items = [{
    details: { type: 'CASH' },
    validation: { required: [] },
    createdAt: 20,
  }];
  return res;
};

describe('models/application', () => {
  describe('findById()', () => {
    let mockApplicationResponse;
    let mockExporterResponse;
    let mockFacilityResponse;
    let mockCoverTermsResponse;

    beforeEach(() => {
      mockApplicationResponse = MockApplicationResponse();
      mockExporterResponse = MockExporterResponse();
      mockFacilityResponse = MockFacilityResponse();
      mockCoverTermsResponse = MockCoverTermsResponse();

      api.getApplication.mockResolvedValue(mockApplicationResponse);
      api.getExporter.mockResolvedValue(mockExporterResponse);
      api.getCoverTerms.mockResolvedValue(mockCoverTermsResponse);
      api.getFacilities.mockResolvedValue(mockFacilityResponse);
      api.getEligibilityCriteria.mockResolvedValue(MockEligibilityCriteriaResponse());
      api.getUserDetails.mockResolvedValue(MockUserResponse());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
    describe('returns model with expected supporting information fields for EC12', () => {
      beforeEach(() => {
        mockCoverTermsResponse.details.coverStart = 'false';
        api.getCoverTerms.mockResolvedValueOnce(mockCoverTermsResponse);
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(PROGRESS.NOT_STARTED);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion', 'managementAccounts', 'financialStatements', 'financialForecasts', 'financialCommentary', 'corporateStructure', 'debtorAndCreditorReports']);
      });
    });

    describe('returns model with expected supporting information fields for EC14', () => {
      beforeEach(() => {
        mockCoverTermsResponse.details.facilityLimit = 'false';
        api.getCoverTerms.mockResolvedValueOnce(mockCoverTermsResponse);
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(PROGRESS.NOT_STARTED);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion', 'managementAccounts', 'financialStatements', 'financialForecasts', 'financialCommentary', 'corporateStructure', 'debtorAndCreditorReports']);
      });
    });

    describe('returns model with expected supporting information fields for EC15', () => {
      beforeEach(() => {
        mockCoverTermsResponse.details.exporterDeclaration = 'false';
        api.getCoverTerms.mockResolvedValueOnce(mockCoverTermsResponse);
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(PROGRESS.NOT_STARTED);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion', 'exportLicence']);
      });
    });

    describe('returns model with expected supporting information fields for all other Cover terms', () => {
      beforeEach(() => {
        mockCoverTermsResponse.details.noticeDate = 'false';
        mockCoverTermsResponse.details.dueDiligence = 'false';
        mockCoverTermsResponse.details.facilityLetter = 'false';
        mockCoverTermsResponse.details.facilityBaseCurrency = 'false';
        mockCoverTermsResponse.details.facilityPaymentCurrency = 'false';
        api.getCoverTerms.mockResolvedValueOnce(mockCoverTermsResponse);
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(PROGRESS.NOT_STARTED);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion']);
      });
    });

    describe('returns model with expected supporting information fields when some documents are set', () => {
      beforeEach(() => {
        mockApplicationResponse.supportingInformation.manualInclusion = ['path'];
        mockCoverTermsResponse.details.exporterDeclaration = 'false';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);
        api.getCoverTerms.mockResolvedValueOnce(mockCoverTermsResponse);
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(PROGRESS.IN_PROGRESS);
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
        mockCoverTermsResponse.details.exporterDeclaration = 'false';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);
        api.getCoverTerms.mockResolvedValueOnce(mockCoverTermsResponse);
      });

      it('sets supportingInfoStatus as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInfoStatus.code).toEqual(PROGRESS.COMPLETED);
      });

      it('sets the requiredSupportingDocuments as expected', async () => {
        const application = await Application.findById('', MockUserResponse(), '');

        expect(application.supportingInformation.requiredFields).toEqual(['manualInclusion', 'exportLicence']);
      });
    });
  });
});
