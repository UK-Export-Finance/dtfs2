import MOCKS from '../../../test-mocks/amendment-test-mocks';
import CONSTANTS from '../../../constants';
import { postAmendmentTask } from './amendmentTasks.controller';
import { mockRes } from '../../../test-mocks';
import api from '../../../api';

api.updateAmendment = jest.fn(() => {
  Promise.resolve(true);
});
console.error = jest.fn();

describe('await postAmendmentTask', () => {
  const mockRequest = {
    params: {
      _id: MOCKS.MOCK_DEAL._id,
      facilityId: MOCKS.MOCK_AMENDMENT.facilityId,
      amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
      groupId: '1',
      taskId: '1',
    },
    session: {
      user: MOCKS.MOCK_USER_PIM,
      userToken: '',
    },
    headers: {
      origin: '',
    },
    body: {
      assignedTo: '67448306ae1aa19ba14ee654',
      status: CONSTANTS.TASKS.UNASSIGNED,
    },
  };
  const mockResponse = mockRes();

  const mockAmendmentTaskUpdate = {
    taskUpdate: {
      id: mockRequest.params.taskId,
      groupId: Number(mockRequest.params.groupId),
      status: mockRequest.body.status,
      assignedTo: { userId: mockRequest.body.assignedTo },
      updatedBy: mockRequest.session.user._id,
      urlOrigin: mockRequest.headers.origin,
      updateTask: true,
    },
  };

  describe('should throw an error when one of the mandatory arguments are invalid', () => {
    it('when deal id is invalid', async () => {
      const modifiedRequest = {
        ...mockRequest,
        params: {
          facilityId: MOCKS.MOCK_AMENDMENT.facilityId,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
          groupId: '1',
          taskId: '1',
        },
      };

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('when facility id is invalid', async () => {
      const modifiedRequest = {
        ...mockRequest,
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
          groupId: '1',
          taskId: '1',
        },
      };

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('when amendment id is invalid', async () => {
      const modifiedRequest = {
        ...mockRequest,
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          facilityId: MOCKS.MOCK_AMENDMENT.facilityId,
          groupId: '1',
          taskId: '1',
        },
      };

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('when task group id is invalid', async () => {
      const modifiedRequest = {
        ...mockRequest,
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          facilityId: MOCKS.MOCK_AMENDMENT.facilityId,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
          taskId: '1',
        },
      };

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('when task id is invalid', async () => {
      const modifiedRequest = {
        ...mockRequest,
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          facilityId: MOCKS.MOCK_AMENDMENT.facilityId,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
          groupId: '1',
        },
      };

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('when task id is invalid', async () => {
      const modifiedRequest = {
        ...mockRequest,
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          facilityId: MOCKS.MOCK_AMENDMENT.facilityId,
          amendmentId: undefined,
          groupId: '',
          taskId: null,
        },
      };

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('should call update amendment API function when all mandatory arguments are valid', () => {
    it('should update the amendment and render the task page', async () => {
      await postAmendmentTask(mockRequest, mockResponse);

      expect(api.updateAmendment).toHaveBeenLastCalledWith(
        mockRequest.params.facilityId,
        mockRequest.params.amendmentId,
        mockAmendmentTaskUpdate,
        mockRequest.session.userToken,
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith(`/case/${mockRequest.params._id}/tasks`);
    });
  });
});
