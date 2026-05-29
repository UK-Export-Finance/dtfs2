const { createMocks } = require('node-mocks-http');
const { HttpStatusCode } = require('axios');
const { AMENDMENT_QUERY_STATUSES } = require('@ukef/dtfs2-common');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const api = require('../api');
const {
  amendmentEmailEligible,
  sendAutomaticAmendmentEmail,
  sendManualDecisionAmendmentEmail,
  sendManualBankDecisionEmail,
  sendFirstTaskEmail,
  addLatestAmendmentValue,
  addLatestAmendmentCoverEndDate,
  addLatestAmendmentFacilityEndDate,
} = require('../helpers/amendment.helpers');
const isGefFacility = require('../rest-mappings/helpers/isGefFacility');
const {
  createFacilityAmendment,
  getAmendmentById,
  getAmendmentByFacilityId,
  getAllAmendments,
  sendAmendmentEmail,
  updateTFMDealLastUpdated,
  createAmendmentTFMObject,
  sendFacilityAmendment,
} = require('./amendment.controller');
const { submitFacilityAmendmentsToApimGift } = require('../integrations/apim-gift/submit-facility-amendments-to-apim-gift');

const mockFacilityId = '66b1f2f6f4b5a8f3c7d9e011';
const mockAmendmentId = '66b1f2f6f4b5a8f3c7d9e012';

jest.mock('../api', () => ({
  createFacilityAmendment: jest.fn(),
  getAmendmentById: jest.fn(),
  getAmendmentInProgress: jest.fn(),
  getAmendmentByFacilityId: jest.fn(),
  getAllAmendmentsInProgress: jest.fn(),
  findOneDeal: jest.fn(),
  findPortalUserById: jest.fn(),
  updateDeal: jest.fn(),
  getLatestCompletedAmendmentValue: jest.fn(),
  getLatestCompletedAmendmentDate: jest.fn(),
  getLatestCompletedAmendmentFacilityEndDate: jest.fn(),
  findOneFacility: jest.fn(),
  updateFacilityAmendment: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common/change-stream', () => ({
  generateTfmAuditDetails: jest.fn(() => ({ id: 'mock-user-id', userType: 'tfm' })),
}));

jest.mock('../helpers/amendment.helpers', () => ({
  amendmentEmailEligible: jest.fn(),
  sendAutomaticAmendmentEmail: jest.fn(),
  sendManualDecisionAmendmentEmail: jest.fn(),
  sendManualBankDecisionEmail: jest.fn(),
  sendFirstTaskEmail: jest.fn(),
  internalAmendmentEmail: jest.fn(),
  calculateAcbsUkefExposure: jest.fn((payload) => payload),
  addLatestAmendmentValue: jest.fn(),
  addLatestAmendmentCoverEndDate: jest.fn(),
  addLatestAmendmentFacilityEndDate: jest.fn(),
}));

jest.mock('../rest-mappings/helpers/isGefFacility', () => jest.fn());

jest.mock('../integrations/apim-gift/submit-facility-amendments-to-apim-gift', () => ({
  submitFacilityAmendmentsToApimGift: jest.fn(),
}));

jest.mock('./amend-issued-facility', () => ({
  amendIssuedFacility: jest.fn(),
}));

jest.mock('../helpers/create-tasks-amendment.helper', () => ({
  createAmendmentTasks: jest.fn(),
  updateAmendmentTasks: jest.fn(),
  getTasksAssignedToUserByGroup: jest.fn(),
}));

jest.mock('../helpers/tasks', () => ({
  isRiskAnalysisCompleted: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  canSendToAcbs: jest.fn(() => false),
}));

describe('amendment.controller remaining exports', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    generateTfmAuditDetails.mockReturnValue({ id: 'mock-user-id', userType: 'tfm' });
    console.info = jest.fn();
    console.error = jest.fn();
  });

  describe('createFacilityAmendment', () => {
    it(`should return ${HttpStatusCode.Ok} with amendmentId when amendment is created`, async () => {
      // Arrange
      api.createFacilityAmendment.mockResolvedValue({ amendmentId: mockAmendmentId });

      const { req, res } = createMocks({ body: { facilityId: mockFacilityId } });
      req.user = { _id: 'user-1' };

      // Act
      await createFacilityAmendment(req, res);

      // Assert
      expect(api.createFacilityAmendment).toHaveBeenNthCalledWith(1, mockFacilityId, { id: 'mock-user-id', userType: 'tfm' });
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({ amendmentId: mockAmendmentId });
    });

    it(`should return ${HttpStatusCode.UnprocessableEntity} when amendment cannot be created`, async () => {
      // Arrange
      api.createFacilityAmendment.mockResolvedValue({});

      const { req, res } = createMocks({ body: { facilityId: mockFacilityId }, user: { _id: 'user-1' } });

      // Act
      await createFacilityAmendment(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.UnprocessableEntity);
      expect(res._getData()).toEqual({ data: 'Unable to create amendment' });
    });
  });

  describe('getAmendmentById', () => {
    it(`should return ${HttpStatusCode.Ok} when amendment exists`, async () => {
      // Arrange
      const amendment = { amendmentId: mockAmendmentId };
      api.getAmendmentById.mockResolvedValue(amendment);

      const { req, res } = createMocks({ params: { facilityId: mockFacilityId, amendmentId: mockAmendmentId } });

      // Act
      await getAmendmentById(req, res);

      // Assert
      expect(api.getAmendmentById).toHaveBeenNthCalledWith(1, mockFacilityId, mockAmendmentId);
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(amendment);
    });

    it(`should return ${HttpStatusCode.UnprocessableEntity} when amendment does not exist`, async () => {
      // Arrange
      api.getAmendmentById.mockResolvedValue(null);

      const { req, res } = createMocks({ params: { facilityId: mockFacilityId, amendmentId: mockAmendmentId } });

      // Act
      await getAmendmentById(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.UnprocessableEntity);
      expect(res._getData()).toEqual({ data: 'Unable to get the amendment by Id' });
    });
  });

  describe('getAmendmentByFacilityId', () => {
    it(`should return ${HttpStatusCode.Ok} for in-progress query`, async () => {
      // Arrange
      const inProgressAmendments = [{ amendmentId: mockAmendmentId }];
      api.getAmendmentInProgress.mockResolvedValue({ data: inProgressAmendments });

      const { req, res } = createMocks({ params: { facilityId: mockFacilityId, amendmentIdOrStatus: AMENDMENT_QUERY_STATUSES.IN_PROGRESS } });

      // Act
      await getAmendmentByFacilityId(req, res);

      // Assert
      expect(api.getAmendmentInProgress).toHaveBeenNthCalledWith(1, mockFacilityId);
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(inProgressAmendments);
    });

    it(`should return ${HttpStatusCode.UnprocessableEntity} when no amendment is found`, async () => {
      // Arrange
      api.getAmendmentByFacilityId.mockResolvedValue(null);

      const { req, res } = createMocks({ params: { facilityId: mockFacilityId } });

      // Act
      await getAmendmentByFacilityId(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.UnprocessableEntity);
      expect(res._getData()).toEqual({ data: 'Unable to get the amendment by facilityId' });
    });
  });

  describe('getAllAmendments', () => {
    it(`should return ${HttpStatusCode.Ok} for in-progress amendments`, async () => {
      // Arrange
      const amendments = [{ amendmentId: mockAmendmentId }];
      api.getAllAmendmentsInProgress.mockResolvedValue(amendments);

      const { req, res } = createMocks({ params: { status: AMENDMENT_QUERY_STATUSES.IN_PROGRESS } });

      // Act
      await getAllAmendments(req, res);

      // Assert
      expect(api.getAllAmendmentsInProgress).toHaveBeenCalledTimes(1);
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(amendments);
    });

    it(`should return ${HttpStatusCode.UnprocessableEntity} when status is unsupported`, async () => {
      // Arrange
      const { req, res } = createMocks({ params: { status: 'unsupported' } });

      // Act
      await getAllAmendments(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.UnprocessableEntity);
      expect(res._getData()).toEqual({ data: 'Unable to fetch amendments' });
    });
  });

  describe('sendAmendmentEmail', () => {
    it('should send all amendment emails when flags are eligible and unsent', async () => {
      // Arrange
      const amendment = {
        amendmentId: mockAmendmentId,
        dealId: 'd1',
        automaticApprovalEmail: true,
        automaticApprovalEmailSent: false,
        ukefDecision: {
          managersDecisionEmail: true,
          managersDecisionEmailSent: false,
        },
        bankDecision: {
          banksDecisionEmail: true,
          banksDecisionEmailSent: false,
        },
        sendFirstTaskEmail: true,
        firstTaskEmailSent: false,
      };

      api.getAmendmentById.mockResolvedValue(amendment);
      amendmentEmailEligible.mockReturnValue(true);
      api.findOneDeal.mockResolvedValue({ dealSnapshot: { maker: { _id: 'maker-1' } } });
      api.findPortalUserById.mockResolvedValue({ _id: 'maker-1', email: 'maker@example.com' });

      // Act
      await sendAmendmentEmail(mockAmendmentId, mockFacilityId, { id: 'u1', userType: 'tfm' });

      // Assert
      expect(sendAutomaticAmendmentEmail).toHaveBeenCalledTimes(1);
      expect(sendManualDecisionAmendmentEmail).toHaveBeenCalledTimes(1);
      expect(sendManualBankDecisionEmail).toHaveBeenCalledTimes(1);
      expect(sendFirstTaskEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateTFMDealLastUpdated', () => {
    it('should update deal when amendment has a dealId', async () => {
      // Arrange
      api.getAmendmentById.mockResolvedValue({ dealId: 'deal-1' });
      api.updateDeal.mockResolvedValue({ ok: true });

      // Act
      const result = await updateTFMDealLastUpdated(mockAmendmentId, mockFacilityId, { id: 'u1', userType: 'tfm' });

      // Assert
      expect(api.updateDeal).toHaveBeenCalledTimes(1);
      expect(api.updateDeal).toHaveBeenCalledWith({
        dealId: 'deal-1',
        dealUpdate: { tfm: { lastUpdated: expect.any(Number) } },
        auditDetails: { id: 'u1', userType: 'tfm' },
      });
      expect(result).toEqual({ ok: true });
    });

    it('should return null when amendment has no dealId', async () => {
      // Arrange
      api.getAmendmentById.mockResolvedValue({});

      // Act
      const result = await updateTFMDealLastUpdated(mockAmendmentId, mockFacilityId, { id: 'u1', userType: 'tfm' });

      // Assert
      expect(api.updateDeal).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('createAmendmentTFMObject', () => {
    it('should build tfm object and persist it for GEF facilities', async () => {
      // Arrange
      api.getLatestCompletedAmendmentValue.mockResolvedValue({ value: 1 });
      api.getLatestCompletedAmendmentDate.mockResolvedValue({ coverEndDate: 2 });
      api.findOneFacility.mockResolvedValue({ facilitySnapshot: { type: 'Cash' } });
      isGefFacility.mockReturnValue(true);
      api.getLatestCompletedAmendmentFacilityEndDate.mockResolvedValue({ facilityEndDate: 3 });

      addLatestAmendmentValue.mockResolvedValue({ fromValue: true });
      addLatestAmendmentCoverEndDate.mockResolvedValue({ fromValue: true, fromCoverEndDate: true });
      addLatestAmendmentFacilityEndDate.mockResolvedValue({ fromValue: true, fromCoverEndDate: true, fromFacilityEndDate: true });

      // Act
      const result = await createAmendmentTFMObject(mockAmendmentId, mockFacilityId, { id: 'u1', userType: 'tfm' });

      // Assert
      expect(api.updateFacilityAmendment).toHaveBeenCalledWith(
        mockFacilityId,
        mockAmendmentId,
        {
          tfm: { fromValue: true, fromCoverEndDate: true, fromFacilityEndDate: true },
        },
        { id: 'u1', userType: 'tfm' },
      );
      expect(result).toEqual({ fromValue: true, fromCoverEndDate: true, fromFacilityEndDate: true });
    });
  });

  describe('sendFacilityAmendment', () => {
    describe('when APIM GIFT does not accept the amendment submission', () => {
      it(`should return ${HttpStatusCode.BadGateway} and not continue to ACBS submission`, async () => {
        // Arrange
        const amendment = { amendmentId: mockAmendmentId, dealId: 'deal-1' };

        api.getAmendmentById.mockResolvedValue(amendment);
        api.findOneFacility.mockResolvedValue({ facilitySnapshot: { ukefFacilityId: '0030537688' } });
        submitFacilityAmendmentsToApimGift.mockResolvedValue(false);

        const { req, res } = createMocks({ params: { facilityId: mockFacilityId, amendmentId: mockAmendmentId } });

        // Act
        await sendFacilityAmendment(req, res);

        // Assert
        expect(submitFacilityAmendmentsToApimGift).toHaveBeenNthCalledWith(1, {
          amendment,
          ukefFacilityId: '0030537688',
        });
        expect(api.findOneDeal).not.toHaveBeenCalled();
        expect(res._getStatusCode()).toBe(HttpStatusCode.BadGateway);
        expect(res._getData()).toEqual({ data: 'Unable to send facility amendment to ACBS and APIM GIFT' });
      });
    });
  });
});
