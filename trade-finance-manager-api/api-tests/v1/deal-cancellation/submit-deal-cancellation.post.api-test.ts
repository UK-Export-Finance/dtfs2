import { AnyObject, MAX_CHARACTER_COUNT, TEAM_IDS } from '@ukef/dtfs2-common';
import { ObjectId, UpdateResult } from 'mongodb';
import { createApi } from '../../api';
import app from '../../../src/createApp';
import { initialiseTestUsers } from '../../api-test-users';
import { TestUser } from '../../types/test-user';
import { withTeamAuthorisationTests } from '../../common-tests/with-team-authorisation.api-tests';
import { PostSubmitDealCancellationPayload } from '../../../src/v1/middleware/validate-post-submit-deal-cancellation-payload';

const updateDealCancellationMock = jest.fn() as jest.Mock<Promise<UpdateResult>>;

jest.mock('../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../src/v1/api'),
  updateDealCancellation: () => updateDealCancellationMock(),
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
      expect(response.status).toEqual(400);
    });

    it('returns a 400 response when the payload is invalid', async () => {
      // Arrange
      const url = getSubmitTfmDealCancellationUrl({ id: validId });

      // Act
      const response = await as(aPimUser).post({}).to(url);

      // Assert
      expect(response.status).toEqual(400);
    });

    it('returns 200 for an authenticated user', async () => {
      // Arrange
      const url = getSubmitTfmDealCancellationUrl({ id: validId });

      // Act
      const response = await as(aPimUser).post(aValidPayload()).to(url);

      // Assert
      expect(response.status).toEqual(200);
    });
  });
});
