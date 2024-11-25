const { createMocks } = require('node-mocks-http');
const { HttpStatusCode } = require('axios');
const api = require('../api');
const amendmentController = require('./amendment.controller');
const { MOCK_AMENDMENT, MOCK_AMENDMENT_WITH_UKEF_DECISION } = require('../__mocks__/mock-amendment');

const { TEAMS } = require('../../constants');

const createTasksAmendmentHelper = require('../helpers/create-tasks-amendment.helper');
const { mockFindUserById } = require('../__mocks__/common-api-mocks');

jest.mock('../api');
jest.mock('../helpers/create-tasks-amendment.helper');
jest.mock('./amendment.controller', () => ({
  ...jest.requireActual('./amendment.controller'),
  sendAmendmentEmail: jest.fn().mockResolvedValue(true),
}));

const {
  MOCK_USERS_FOR_TASKS,
  TASKS_ASSIGNED_TO_UNDERWRITER,
  MOCK_TASKS_CHANGE_TIME,
  TASKS_ASSIGNED_TO_UNDERWRITER_MANAGER,
} = require('../__mocks__/mock-amendment-tasks-assign-by-team');
const { MOCK_FACILITIES } = require('../__mocks__/mock-facilities');
const MOCK_DEAL = require('../__mocks__/mock-deal');
const MOCK_USERS = require('../__mocks__/mock-users');

const { underwriter, underwriterManager } = MOCK_USERS_FOR_TASKS;

const requestBody = {
  leadUnderwriter: {
    _id: underwriter._id,
    firstName: underwriter.firstName,
    lastName: underwriter.lastName,
  },
};

const { amendmentId, facilityId } = MOCK_AMENDMENT;

const facility = {
  _id: facilityId,
  facilitySnapshot: { ...MOCK_FACILITIES[0], _id: facilityId },
  tfm: {},
};
const deal = {
  dealSnapshot: MOCK_DEAL,
};

describe('updated facility amendment API call', () => {
  let getTasksAssignedToUserByGroupMock;

  describe('getTasksAssignedToUserByGroup', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      api.findUserById.mockReset();
      mockFindUserById();

      jest.useFakeTimers();
      jest.setSystemTime(MOCK_TASKS_CHANGE_TIME * 1000); // Tuesday, December 23, 2008 2:40:00 AM GMT

      // Mock setup is minimal, just to reach function getTasksAssignedToUserByGroup.
      api.getAmendmentById = jest.fn().mockResolvedValue(MOCK_AMENDMENT);
      api.updateFacilityAmendment = jest.fn(() => Promise.resolve(MOCK_AMENDMENT));
      api.findOneFacility = jest.fn().mockResolvedValue(facility);
      api.findOneDeal = jest.fn().mockResolvedValue(deal);
    });

    it('should call getTasksAssignedToUserByGroup if request contains leadUnderwriter', async () => {
      // Arrange
      const { req, res } = createMocks({ params: { amendmentId, facilityId }, user: underwriter, body: requestBody });

      // Act
      await amendmentController.updateFacilityAmendment(req, res);

      // Assert
      expect(createTasksAmendmentHelper.getTasksAssignedToUserByGroup).toHaveBeenCalledTimes(1);
      expect(createTasksAmendmentHelper.getTasksAssignedToUserByGroup).toHaveBeenCalledWith(
        MOCK_AMENDMENT.tasks,
        TEAMS.UNDERWRITERS.id,
        requestBody.leadUnderwriter._id,
      );
    });

    it("should not call getTasksAssignedToUserByGroup if request doesn't contains leadUnderwriter", async () => {
      // Arrange
      const { req, res } = createMocks({ params: { amendmentId, facilityId }, user: underwriter, body: {} });

      // Act
      await amendmentController.updateFacilityAmendment(req, res);

      // Assert
      expect(createTasksAmendmentHelper.getTasksAssignedToUserByGroup).not.toHaveBeenCalled();
    });

    it('should call api.updateFacilityAmendment with tasks returned by getTasksAssignedToUserByGroup for Underwriter', async () => {
      // Arrange
      const { req, res } = createMocks({ params: { amendmentId, facilityId }, user: underwriter, body: requestBody });

      getTasksAssignedToUserByGroupMock = jest.spyOn(createTasksAmendmentHelper, 'getTasksAssignedToUserByGroup');
      getTasksAssignedToUserByGroupMock.mockResolvedValue(TASKS_ASSIGNED_TO_UNDERWRITER);

      const auditDetails = { id: underwriter._id, userType: 'tfm' };

      // Act
      await amendmentController.updateFacilityAmendment(req, res);

      // Assert
      expect(api.updateFacilityAmendment).toHaveBeenCalledTimes(1);
      expect(api.updateFacilityAmendment).toHaveBeenCalledWith(facilityId, amendmentId, { ...requestBody, tasks: TASKS_ASSIGNED_TO_UNDERWRITER }, auditDetails);
    });

    it('should call api.updateFacilityAmendment with tasks returned by getTasksAssignedToUserByGroup for Underwriter manager', async () => {
      // Arrange
      const requestBodyWithUnderwriterManager = {
        leadUnderwriter: {
          _id: underwriterManager._id,
          firstName: underwriterManager.firstName,
          lastName: underwriterManager.lastName,
        },
      };
      const { req, res } = createMocks({
        params: { amendmentId, facilityId },
        user: underwriterManager,
        body: requestBodyWithUnderwriterManager,
      });

      getTasksAssignedToUserByGroupMock = jest.spyOn(createTasksAmendmentHelper, 'getTasksAssignedToUserByGroup');
      getTasksAssignedToUserByGroupMock.mockResolvedValue(TASKS_ASSIGNED_TO_UNDERWRITER_MANAGER);

      const auditDetails = { id: underwriterManager._id, userType: 'tfm' };

      // Act
      await amendmentController.updateFacilityAmendment(req, res);

      // Assert
      expect(api.updateFacilityAmendment).toHaveBeenCalledTimes(1);
      expect(api.updateFacilityAmendment).toHaveBeenCalledWith(
        facilityId,
        amendmentId,
        { ...requestBodyWithUnderwriterManager, tasks: TASKS_ASSIGNED_TO_UNDERWRITER_MANAGER },
        auditDetails,
      );
    });
  });

  describe('updateFacilityAmendment', () => {
    const mockRequest = {
      params: {
        _id: MOCK_DEAL._id,
        facilityId: MOCK_AMENDMENT_WITH_UKEF_DECISION.facilityId,
        amendmentId: MOCK_AMENDMENT_WITH_UKEF_DECISION.amendmentId,
        groupId: '1',
        taskId: '1',
      },
      user: MOCK_USERS,
      session: {
        user: MOCK_USERS_FOR_TASKS,
        userToken: '',
      },
      headers: {
        origin: '',
      },
      body: {
        assignedTo: '67448306ae1aa19ba14ee654',
        status: 'Done',
      },
    };

    const { res } = createMocks({ params: { amendmentId, facilityId }, user: underwriter, body: requestBody });

    beforeEach(() => {
      mockFindUserById();

      // Mock setup is minimal, just to reach function getTasksAssignedToUserByGroup.
      api.getAmendmentById = jest.fn().mockResolvedValue(MOCK_AMENDMENT_WITH_UKEF_DECISION);
      api.updateFacilityAmendment = jest.fn(() => Promise.resolve(MOCK_AMENDMENT_WITH_UKEF_DECISION));
      api.findOneFacility = jest.fn().mockResolvedValue(facility);
      api.findOneDeal = jest.fn().mockResolvedValue(deal);
      api.findPortalUserById = jest.fn().mockRejectedValue(MOCK_USERS_FOR_TASKS.underwriter._id);
    });

    it('should not update UKEF decision object if present', async () => {
      // Act
      await amendmentController.updateFacilityAmendment(mockRequest, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData().ukefDecision).toEqual(MOCK_AMENDMENT_WITH_UKEF_DECISION.ukefDecision);
    });
  });
});
