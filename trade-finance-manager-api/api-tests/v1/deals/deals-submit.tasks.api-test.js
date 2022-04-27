const moment = require('moment');
const externalApis = require('../../../src/v1/api');
const acbsController = require('../../../src/v1/controllers/acbs.controller');
const CONSTANTS = require('../../../src/constants');
const formattedTimestamp = require('../../../src/v1/formattedTimestamp');
const { createDealTasks } = require('../../../src/v1/controllers/deal.tasks');
const { generateTaskEmailVariables } = require('../../../src/v1/helpers/generate-task-email-variables');
const submitDeal = require('../utils/submitDeal');

const MOCK_DEAL_AIN_NO_COMPANIES_HOUSE = require('../../../src/v1/__mocks__/mock-deal-no-companies-house');
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

const createSubmitBody = (mockDeal) => ({
  dealId: mockDeal._id,
  dealType: 'BSS/EWCS',
});

const findBankByIdSpy = jest.fn(() => Promise.resolve({ emails: [] }));
const findOneTeamSpy = jest.fn(() => Promise.resolve({ email: [] }));

describe('/v1/deals', () => {
  beforeEach(() => {
    acbsController.issueAcbsFacilities.mockClear();
    externalApis.getFacilityExposurePeriod.mockClear();
    externalApis.getPremiumSchedule.mockClear();

    sendEmailApiSpy.mockClear();
    externalApis.sendEmail = sendEmailApiSpy;

    externalApis.updatePortalBssDealStatus = jest.fn();

    findBankByIdSpy.mockClear();
    externalApis.findBankById = findBankByIdSpy;

    findOneTeamSpy.mockClear();
    externalApis.findOneTeam = findOneTeamSpy;
  });

  describe('PUT /v1/deals/:dealId/submit', () => {
    describe('deal/case tasks', () => {
      describe('when deal is AIN', () => {
        it('adds AIN tasks to the deal with emailSent flag added to the first task', async () => {
          const { status, body: submittedDeal } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_NO_COMPANIES_HOUSE));

          expect(status).toEqual(200);

          const taskCreation = await createDealTasks(submittedDeal);

          const expected = taskCreation.tfm.tasks;
          expected[0].groupTasks[0].emailSent = true;

          expect(submittedDeal.tfm.tasks).toEqual(expected);
        });

        it('should call externalApis.sendEmail for first task email', async () => {
          const dealId = MOCK_DEAL_AIN_NO_COMPANIES_HOUSE._id;

          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_NO_COMPANIES_HOUSE));

          const firstTask = body.tfm.tasks[0].groupTasks[0];

          const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

          expect(sendEmailApiSpy).toBeCalledTimes(3);

          const expected = {
            templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
            sendToEmailAddress: expectedTeamEmailAddress,
            emailVariables: generateTaskEmailVariables(
              'mock-origin-url',
              firstTask,
              dealId,
              body.dealSnapshot.exporter.companyName,
              body.dealSnapshot.details.ukefDealId,
            ),
          };

          const firstSendEmailCall = sendEmailApiSpy.mock.calls[0][0];

          expect(firstSendEmailCall).toEqual(
            expected.templateId,
            expected.sendToEmailAddress,
            expected.emailVariables,
          );
        });
      });

      describe('when deal is MIA', () => {
        it('adds MIA tasks to the deal with emailSent flag added to the first task', async () => {
          const { status, body: submittedDeal } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SUBMITTED));

          expect(status).toEqual(200);

          const taskCreation = await createDealTasks(submittedDeal);

          const expected = taskCreation.tfm.tasks;
          expected[0].groupTasks[0].emailSent = true;

          expect(submittedDeal.tfm.tasks).toEqual(expected);
        });

        it('should call externalApis.sendEmail for first task email', async () => {
          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SUBMITTED));

          const firstTask = body.tfm.tasks[0].groupTasks[0];

          const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

          const expected = {
            templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
            sendToEmailAddress: expectedTeamEmailAddress,
            emailVariables: generateTaskEmailVariables(
              'mock-origin-url',
              firstTask,
              body.dealSnapshot.exporter.companyName,
              body.dealSnapshot.details.submissionType,
              moment(formattedTimestamp(body.dealSnapshot.details.submissionDate)).format('Do MMMM YYYY'),
              body.dealSnapshot.bank.name,
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
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIN));

          expect(status).toEqual(200);
          expect(body.tfm.tasks).toBeUndefined();
        });

        it('should NOT call externalApis.sendEmail', async () => {
          await submitDeal(createSubmitBody(MOCK_DEAL_MIN));
          expect(sendEmailApiSpy).not.toHaveBeenCalled();
        });
      });
    });
  });
});
