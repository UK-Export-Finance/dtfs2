import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { MAPPED_FACILITY_TYPE } from '@ukef/dtfs2-common';
import { getUnixTime } from 'date-fns';
import { postAmendmentAnswers } from './amendmentAnswers.controller';
import api from '../../../api';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';

jest.mock('../../../api', () => ({
  getAmendmentById: jest.fn(),
  getFacility: jest.fn(),
  getAcknowledgedCompletedAmendments: jest.fn(),
  updateAmendment: jest.fn(),
}));

const getAmendmentByIdMock = jest.fn();
const getFacilityMock = jest.fn();
const getAcknowledgedCompletedAmendmentsMock = jest.fn();
const updateAmendmentMock = jest.fn();

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';
const ukefFacilityId = '123987333';
const referenceNumber = `${ukefFacilityId}-001`;

const payload = {
  submittedByPim: true,
  submittedAt: getUnixTime(new Date()),
  value: 200000,
  ukefExposure: 456,
  coverEndDate: '1 Oct 2020',
  createTasks: true,
  requireUkefApproval: false,
  sendFirstTaskEmail: true,
  referenceNumber,
};

const mockFacility = {
  facilitySnapshot: { isGef: true, dates: { coverEndDate: '1 Oct 2020' }, type: MAPPED_FACILITY_TYPE.CASH, ukefFacilityId },
  tfm: {},
};
const userToken = 'abc123';

const getHttpMocks = () =>
  httpMocks.createMocks({
    params: {
      facilityId,
      amendmentId,
    },
    session: {
      user: aTfmSessionUser(),
      userToken,
    },
  });

describe('postAmendmentAnswers', () => {
  const amendment = { ...payload, dealId, facilityId, amendmentId };

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(console, 'error');
    jest.spyOn(api, 'getAmendmentById').mockImplementation(getAmendmentByIdMock);
    jest.spyOn(api, 'getFacility').mockImplementation(getFacilityMock);
    jest.spyOn(api, 'getAcknowledgedCompletedAmendments').mockImplementation(getAcknowledgedCompletedAmendmentsMock);
    jest.spyOn(api, 'updateAmendment').mockImplementation(updateAmendmentMock);

    getAmendmentByIdMock.mockResolvedValue({ status: 200, data: amendment });
    getFacilityMock.mockResolvedValue(mockFacility);
    getAcknowledgedCompletedAmendmentsMock.mockResolvedValue({ status: 200, response: { data: [amendment] } });

    updateAmendmentMock.mockResolvedValue({ status: 200, data: amendment });
  });

  describe('when an amendment has all types of amendments', () => {
    it('should call updateAmendment', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postAmendmentAnswers(req, res);

      // Assert
      expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
      expect(updateAmendmentMock).toHaveBeenCalledWith(
        facilityId,
        amendmentId,
        {
          ...payload,
          automaticApprovalEmail: true,
          bankReviewDate: null,
          coverEndDate: null,
          currency: null,
          currentCoverEndDate: null,
          currentValue: null,
          facilityEndDate: null,
          isUsingFacilityEndDate: null,
          referenceNumber: `${ukefFacilityId}-002`,
          status: 'Completed',
          submissionDate: getUnixTime(new Date()),
          ukefExposure: null,
          updateTfmLastUpdated: true,
          value: null,
        },
        userToken,
      );
    });

    it('should redirect to amendments page', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await postAmendmentAnswers(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/facility/${facilityId}#amendments`);
    });
  });

  it('should redirect to amendments page if updateAmendment throws an error', async () => {
    // Arrange
    const mockError = new Error('an error');
    updateAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postAmendmentAnswers(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/facility/${facilityId}#amendments`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('There was a problem creating the amendment approval %o', mockError);
  });
});
