const moment = require('moment');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const externalApis = require('../../../src/v1/api');
const acbsController = require('../../../src/v1/controllers/acbs.controller');
const DEFAULTS = require('../../../src/v1/defaults');
const CONSTANTS = require('../../../src/constants');
const formattedTimestamp = require('../../../src/v1/formattedTimestamp');
const { generateTaskEmailVariables } = require('../../../src/v1/helpers/generate-task-email-variables');

const MOCK_DEAL_NO_COMPANIES_HOUSE = require('../../../src/v1/__mocks__/mock-deal-no-companies-house');
const MOCK_DEAL_MIN = require('../../../src/v1/__mocks__/mock-deal-MIN');
const MOCK_DEAL_MIA_SUBMITTED = require('../../../src/v1/__mocks__/mock-deal-MIA-submitted');

const MOCK_NOTIFY_EMAIL_RESPONSE = require('../../../src/v1/__mocks__/mock-notify-email-response');
const MOCK_TEAMS = require('../../../src/v1/__mocks__/mock-teams');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

jest.mock('../../../src/v1/controllers/acbs.controller', () => ({
  issueAcbsFacilities: jest.fn(),
}));

jest.mock('../../../src/v1/controllers/deal.controller', () => ({
  ...jest.requireActual('../../../src/v1/controllers/deal.controller'),
  submitACBSIfAllPartiesHaveUrn: jest.fn(),
}));

describe('/v1/deals', () => {
  beforeEach(() => {
    acbsController.issueAcbsFacilities.mockClear();
    externalApis.getFacilityExposurePeriod.mockClear();
    externalApis.getPremiumSchedule.mockClear();

    sendEmailApiSpy.mockClear();
    externalApis.sendEmail = sendEmailApiSpy;
  });

  describe('PUT /v1/deals/:dealId/submit', () => {
    describe('deal/case tasks', () => {
      describe('when deal is AIN', () => {
        it('adds default AIN tasks to the deal', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_NO_COMPANIES_HOUSE._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);
          expect(body.tfm.tasks).toEqual(DEFAULTS.TASKS.AIN);
        });

        it('should call externalApis.sendEmail  for first task email', async () => {
          const dealId = MOCK_DEAL_NO_COMPANIES_HOUSE._id;
          const { body } = await api.put({ dealId }).to('/v1/deals/submit');

          const firstTask = body.tfm.tasks[0].groupTasks[0];

          const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

          expect(sendEmailApiSpy).toBeCalledTimes(2);

          const expected = {
            templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
            sendToEmailAddress: expectedTeamEmailAddress,
            emailVariables: generateTaskEmailVariables(
              'mock-origin-url',
              firstTask,
              dealId,
              body.dealSnapshot.submissionDetails['supplier-name'],
              body.dealSnapshot.detailsukefDealId,
            ),
          };

          expect(sendEmailApiSpy.mock.calls[0][0]).toEqual(
            expected.templateId,
            expected.sendToEmailAddress,
            expected.emailVariables,
          );
        });
      });

      describe('when deal is MIA', () => {
        it('adds default MIA tasks to the deal', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_MIA_SUBMITTED._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);
          expect(body.tfm.tasks).toEqual(DEFAULTS.TASKS.MIA);
        });

        it('should call externalApis.sendEmail for first task email', async () => {
          const { body } = await api.put({ dealId: MOCK_DEAL_MIA_SUBMITTED._id }).to('/v1/deals/submit');

          const firstTask = body.tfm.tasks[0].groupTasks[0];

          const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

          const expected = {
            templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
            sendToEmailAddress: expectedTeamEmailAddress,
            emailVariables: generateTaskEmailVariables(
              'mock-origin-url',
              firstTask,
              body.dealSnapshot.submissionDetails['supplier-name'],
              body.dealSnapshot.details.submissionType,
              moment(formattedTimestamp(body.dealSnapshot.details.submissionDate)).format('Do MMMM YYYY'),
              body.dealSnapshot.details.owningBank.name,
            ),
          };

          expect(sendEmailApiSpy.mock.calls[0][0]).toEqual(
            expected.templateId,
            expected.sendToEmailAddress,
            expected.emailVariables,
          );
        });
      });

      describe('when deal is MIN', () => {
        it('adds NOT add tasks to the deal', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_MIN._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);
          expect(body.tfm.tasks).toBeUndefined();
        });

        it('should NOT call externalApis.sendEmail', async () => {
          await api.put({ dealId: MOCK_DEAL_MIN._id }).to('/v1/deals/submit');
          expect(sendEmailApiSpy).not.toHaveBeenCalled();
        });
      });
    });
  });
});
