import { add, format } from 'date-fns';
import { AnyObject, MAX_CHARACTER_COUNT, TEAM_IDS, TestApiError, TfmDealCancellationResponse, TfmFacility } from '@ukef/dtfs2-common';
import { ObjectId, UpdateResult } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { createApi } from '../../api';
import app from '../../../src/createApp';
import { initialiseTestUsers } from '../../api-test-users';
import { TestUser } from '../../types/test-user';
import { withTeamAuthorisationTests } from '../../common-tests/with-team-authorisation.api-tests';
import { PostSubmitDealCancellationPayload } from '../../../src/v1/middleware/validate-post-submit-deal-cancellation-payload';
import { CANCEL_DEAL_FUTURE_DATE, CANCEL_DEAL_PAST_DATE } from '../../../src/constants/email-template-ids';

const updateDealCancellationMock = jest.fn() as jest.Mock<Promise<UpdateResult>>;
const sendEmailMock = jest.fn() as jest.Mock<Promise<void>>;
const submitDealCancellationMock = jest.fn() as jest.Mock<Promise<TfmDealCancellationResponse>>;
const findFacilitiesByDealIdMock = jest.fn() as jest.Mock<Promise<TfmFacility[]>>;

const mockPimEmailAddress = 'pim@example.com';

jest.mock('../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../src/v1/api'),
  updateDealCancellation: () => updateDealCancellationMock(),
  sendEmail: (templateId: string, sendToEmailAddress: string, emailVariables: object) => sendEmailMock(templateId, sendToEmailAddress, emailVariables),
  findOneTeam: () => ({ email: mockPimEmailAddress }),
  submitDealCancellation: (params: AnyObject) => submitDealCancellationMock(params),
  findFacilitiesByDealId: () => findFacilitiesByDealIdMock(),
}));

const originalProcessEnv = { ...process.env };
const { as, post } = createApi(app);

const validId = new ObjectId().toString();

const getSubmitTfmDealCancellationUrl = ({ id }: { id: string }) => `/v1/deals/${id}/cancellation/submit`;

const aValidPayload = (): PostSubmitDealCancellationPayload => ({
  reason: 'x'.repeat(MAX_CHARACTER_COUNT),
  bankRequestDate: new Date().valueOf(),
  effectiveFrom: new Date().valueOf(),
});

const ukefDealId = 'ukefDealId';
const ukefFacilityIds = ['ukefFacilityId1', 'ukefFacilityId2'];

describe('POST /v1/deals/:id/cancellation/submit', () => {
  let testUsers: Awaited<ReturnType<typeof initialiseTestUsers>>;
  let aPimUser: TestUser;

  beforeAll(async () => {
    testUsers = await initialiseTestUsers(app);
    aPimUser = testUsers().withTeam(TEAM_IDS.PIM).one();
  });

  describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is disabled', () => {
    beforeEach(() => {
      process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'false';
    });

    afterAll(() => {
      process.env = originalProcessEnv;
    });

    it('returns a 404 response for an authenticated user with a valid id path', async () => {
      // Arrange
      const url = getSubmitTfmDealCancellationUrl({ id: validId });

      // Act
      const response = await as(aPimUser).post(aValidPayload()).to(url);

      // Assert
      expect(response.status).toEqual(404);
    });
  });

  describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is enabled', () => {
    beforeEach(() => {
      process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'true';
      jest.clearAllMocks();
    });

    beforeEach(() => {
      submitDealCancellationMock.mockResolvedValue({
        cancelledDealUkefId: ukefDealId,
        riskExpiredFacilityUkefIds: ukefFacilityIds,
      } as TfmDealCancellationResponse);
    });

    afterAll(() => {
      process.env = originalProcessEnv;
    });

    withTeamAuthorisationTests({
      allowedTeams: [TEAM_IDS.PIM],
      getUserWithTeam: (team) => testUsers().withTeam(team).one(),
      makeRequestAsUser: (user: TestUser) =>
        as(user)
          .post(aValidPayload())
          .to(getSubmitTfmDealCancellationUrl({ id: validId })),
      successStatusCode: 200,
    });

    it('returns a 401 response when user is not authenticated', async () => {
      // Arrange
      const url = getSubmitTfmDealCancellationUrl({ id: validId });

      // Act
      const response = await post(aValidPayload()).to(url);

      // Assert
      expect(response.status).toEqual(401);
    });

    it('returns a 400 response when the id path param is invalid', async () => {
      // Arrange
      const url = getSubmitTfmDealCancellationUrl({ id: 'invalid' });

      // Act
      const response = await as(aPimUser).post(aValidPayload()).to(url);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.BadRequest);
    });

    it('returns a 400 response when the payload is invalid', async () => {
      // Arrange
      const url = getSubmitTfmDealCancellationUrl({ id: validId });

      // Act
      const response = await as(aPimUser).post({}).to(url);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.BadRequest);
    });

    it('calls api.submitDealCancellation with the correct parameters', async () => {
      // Arrange
      const url = getSubmitTfmDealCancellationUrl({ id: validId });
      const cancellation = aValidPayload();

      // Act
      await as(aPimUser).post(cancellation).to(url);

      // Assert
      expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);
      expect(submitDealCancellationMock).toHaveBeenCalledWith({
        dealId: validId,
        cancellation,
        auditDetails: expect.any(Object) as object,
      });
    });

    it('returns 500 if an unknown error is thrown', async () => {
      // Arrange
      submitDealCancellationMock.mockRejectedValueOnce(new Error('An error occurred'));

      const url = getSubmitTfmDealCancellationUrl({ id: validId });

      // Act
      const response = await as(aPimUser).post(aValidPayload()).to(url);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.InternalServerError);
      expect(response.body).toEqual({ status: HttpStatusCode.InternalServerError, message: 'Failed to submit deal cancellation' });
    });

    it('returns correct status & message if an ApiError is thrown', async () => {
      // Arrange
      const errorStatus = HttpStatusCode.BadRequest;
      const errorMessage = 'An error occurred';
      submitDealCancellationMock.mockRejectedValueOnce(new TestApiError({ status: errorStatus, message: errorMessage }));

      const url = getSubmitTfmDealCancellationUrl({ id: validId });

      // Act
      const response = await as(aPimUser).post(aValidPayload()).to(url);

      // Assert
      expect(response.status).toEqual(errorStatus);
      expect(response.body).toEqual({ status: errorStatus, message: `Failed to submit deal cancellation: ${errorMessage}` });
    });

    describe('when the deal and facilities are fetched successfully', () => {
      it('sends correct email when effective date is today', async () => {
        // Arrange
        const url = getSubmitTfmDealCancellationUrl({ id: validId });

        const payload = { ...aValidPayload(), effectiveFrom: new Date().valueOf() };

        // Act
        await as(aPimUser).post(payload).to(url);

        // Assert
        expect(sendEmailMock).toHaveBeenCalledTimes(1);
        expect(sendEmailMock).toHaveBeenCalledWith(CANCEL_DEAL_PAST_DATE, mockPimEmailAddress, {
          bankRequestDate: format(payload.bankRequestDate, 'd MMMM yyyy'),
          effectiveFromDate: format(payload.effectiveFrom, 'd MMMM yyyy'),
          cancelReason: payload.reason,
          formattedFacilitiesList: ` 1. Facility ID ${ukefFacilityIds[0]}
 2. Facility ID ${ukefFacilityIds[1]}`,
          ukefDealId,
        });
      });

      it('sends correct email when effective date is in the future', async () => {
        // Arrange
        const url = getSubmitTfmDealCancellationUrl({ id: validId });

        const payload = { ...aValidPayload(), effectiveFrom: add(new Date(), { days: 2 }).valueOf() };

        // Act
        await as(aPimUser).post(payload).to(url);

        // Assert
        expect(sendEmailMock).toHaveBeenCalledTimes(1);
        expect(sendEmailMock).toHaveBeenCalledWith(CANCEL_DEAL_FUTURE_DATE, mockPimEmailAddress, {
          bankRequestDate: format(payload.bankRequestDate, 'd MMMM yyyy'),
          effectiveFromDate: format(payload.effectiveFrom, 'd MMMM yyyy'),
          cancelReason: payload.reason,
          formattedFacilitiesList: ` 1. Facility ID ${ukefFacilityIds[0]}
 2. Facility ID ${ukefFacilityIds[1]}`,
          ukefDealId,
        });
      });

      it('returns 200 for an authenticated user', async () => {
        // Arrange
        const url = getSubmitTfmDealCancellationUrl({ id: validId });

        // Act
        const response = await as(aPimUser).post(aValidPayload()).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
      });
    });
  });
});
