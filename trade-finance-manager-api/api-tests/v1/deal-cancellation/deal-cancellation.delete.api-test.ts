import { AnyObject, TEAM_IDS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { createApi } from '../../api';
import app from '../../../src/createApp';
import { initialiseTestUsers } from '../../api-test-users';
import { TestUser } from '../../types/test-user';
import { withTeamAuthorisationTests } from '../../common-tests/with-team-authorisation.api-tests';
import { getTfmDealCancellationUrl } from './get-cancellation-url';

const deleteDealCancellationMock = jest.fn() as jest.Mock<Promise<void>>;

jest.mock('../../../src/v1/api', () => ({
  ...jest.requireActual<AnyObject>('../../../src/v1/api'),
  deleteDealCancellation: () => deleteDealCancellationMock(),
}));

const originalProcessEnv = { ...process.env };
const { as, remove } = createApi(app);

const validId = new ObjectId().toString();

describe('/v1/deals/:id/cancellation', () => {
  let testUsers: Awaited<ReturnType<typeof initialiseTestUsers>>;
  let aPimUser: TestUser;

  beforeAll(async () => {
    testUsers = await initialiseTestUsers(app);
    aPimUser = testUsers().withTeam(TEAM_IDS.PIM).one();
  });

  describe('DELETE /v1/deals/:id/cancellation', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.mocked(deleteDealCancellationMock).mockResolvedValue(undefined);
    });

    afterAll(() => {
      jest.restoreAllMocks();
      process.env = originalProcessEnv;
    });

    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is disabled', () => {
      beforeEach(() => {
        process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'false';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('returns a 404 response for an authenticated user with a valid id path', async () => {
        // Arrange
        const url = getTfmDealCancellationUrl({ id: validId });

        // Act
        const response = await as(aPimUser).remove({}).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NotFound);
      });
    });

    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is enabled', () => {
      beforeEach(() => {
        process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'true';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      withTeamAuthorisationTests({
        allowedTeams: [TEAM_IDS.PIM],
        getUserWithTeam: (team) => testUsers().withTeam(team).one(),
        makeRequestAsUser: (user: TestUser) =>
          as(user)
            .remove({})
            .to(getTfmDealCancellationUrl({ id: validId })),
        successStatusCode: HttpStatusCode.NoContent,
      });

      it('returns a 401 response when user is not authenticated', async () => {
        // Arrange
        const url = getTfmDealCancellationUrl({ id: validId });

        // Act
        const response = await remove(url, {});

        // Assert
        expect(response.status).toEqual(401);
      });

      it('returns a 400 response when the id path param is invalid', async () => {
        // Arrange
        const url = getTfmDealCancellationUrl({ id: 'invalid' });

        // Act
        const response = await as(aPimUser).remove({}).to(url);

        // Assert
        expect(response.status).toEqual(400);
      });

      it('deletes the deal cancellation for an authenticated user', async () => {
        // Arrange
        const url = getTfmDealCancellationUrl({ id: validId });

        // Act
        const response = await as(aPimUser).remove({}).to(url);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NoContent);
      });
    });
  });
});
