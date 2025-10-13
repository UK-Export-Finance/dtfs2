import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { MAPPED_FACILITY_TYPE, isPortalFacilityAmendmentsFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { getUnixTime } from 'date-fns';
import { postAmendmentAnswers } from './amendmentAnswers.controller';
import api from '../../../api';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';

jest.mock('../../../api', () => ({
  getAmendmentById: jest.fn(),
  getFacility: jest.fn(),
  getApprovedAmendments: jest.fn(),
  updateAmendment: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

const getAmendmentByIdMock = jest.fn();
const getFacilityMock = jest.fn();
const getApprovedAmendmentsMock = jest.fn();
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
    jest.spyOn(api, 'getApprovedAmendments').mockImplementation(getApprovedAmendmentsMock);
    jest.spyOn(api, 'updateAmendment').mockImplementation(updateAmendmentMock);

    getAmendmentByIdMock.mockResolvedValue({ status: HttpStatusCode.Ok, data: amendment });
    getFacilityMock.mockResolvedValue(mockFacility);
    getApprovedAmendmentsMock.mockResolvedValue({ status: HttpStatusCode.Ok, response: { data: [amendment] } });

    updateAmendmentMock.mockResolvedValue({ status: HttpStatusCode.Ok, data: amendment });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is not enabled', () => {
    beforeEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(false);
    });
    describe('when an amendment has all types of amendments', () => {
      it('should call updateAmendment with referenceNumber as an empty string', async () => {
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
            referenceNumber: '',
            status: 'Completed',
            submissionDate: getUnixTime(new Date()),
            ukefExposure: null,
            updateTfmLastUpdated: true,
            value: null,
          },
          userToken,
        );
      });
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled', () => {
    beforeEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(true);
    });
    describe('when an amendment has all types of amendments', () => {
      it('should call updateAmendment with a referenceNumber', async () => {
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
    });
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
