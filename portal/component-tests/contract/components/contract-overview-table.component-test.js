const { formatInTimeZone } = require('date-fns-tz');
const {
  DATE: { LONDON_TIMEZONE, FULL_DATE, FULL_DATE_AND_TIME },
} = require('../../../server/constants');
const { getNowAsEpoch } = require('../../../server/helpers');
const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/contract-overview-table.njk';
const render = componentRenderer(component);
describe(component, () => {
  const deal = {
    updatedAt: Date.now(),
    bankInternalRefName: 'bankInternalRefName',
    status: 'status',
    previousStatus: 'previousStatus',
    maker: {
      firstname: 'Robert',
      surname: 'Bruce',
    },
    details: {
      ukefDealId: 'ukefDealId',
      checker: {
        firstname: 'First',
        surname: 'Last',
      },
      submissionDate: getNowAsEpoch(),
    },
  };

  const dealWithManualInclusionApplicationSubmissionDate = {
    ...deal,
    submissionType: 'Manual Inclusion Notice',
    details: {
      ...deal.details,
      manualInclusionApplicationSubmissionDate: getNowAsEpoch(),
    },
  };

  describe('renders all the details of a deal', () => {
    let wrapper;

    beforeAll(() => {
      const user = { timezone: LONDON_TIMEZONE };
      wrapper = render({ deal, user });
    });

    it('displays deal.bankInternalRefName', () => wrapper.expectText('[data-cy="bankInternalRefName"]').toRead(deal.bankInternalRefName));

    it('displays deal.details.ukefDealId', () => wrapper.expectText('[data-cy="ukefDealId"]').toRead(deal.details.ukefDealId));

    it('displays deal.status', () => wrapper.expectText('[data-cy="status"]').toRead(deal.status));

    it('displays deal.previousStatus', () => wrapper.expectText('[data-cy="previousStatus"]').toRead(deal.previousStatus));

    it('displays deal.maker name', () => wrapper.expectText('[data-cy="maker"]').toRead(`${deal.maker.firstname} ${deal.maker.surname}`));

    it('displays deal.details.checker', () =>
      wrapper.expectText('[data-cy="checker"]').toRead(`${deal.details.checker.firstname} ${deal.details.checker.surname}`));

    it('displays deal.details.submissionDate', () =>
      wrapper.expectText('[data-cy="submissionDate"]').toRead(formatInTimeZone(new Date(deal.details.submissionDate), LONDON_TIMEZONE, FULL_DATE)));

    it('displays deal.updatedAt', () =>
      wrapper.expectText('[data-cy="updatedAt"]').toRead(formatInTimeZone(new Date(deal.updatedAt), LONDON_TIMEZONE, FULL_DATE_AND_TIME)));
  });

  describe('when deal has manualInclusionApplicationSubmissionDate', () => {
    let wrapper;
    const user = { timezone: LONDON_TIMEZONE };

    beforeAll(() => {
      wrapper = render({ deal: dealWithManualInclusionApplicationSubmissionDate, user });
    });

    it('displays MIA submission date table header', () => wrapper.expectText('[data-cy="submissionDateHeader"]').toRead('MIA Submission date'));

    it('displays deal.details.manualInclusionApplicationSubmissionDate', () =>
      wrapper
        .expectText('[data-cy="submissionDate"]')
        .toRead(
          formatInTimeZone(
            new Date(dealWithManualInclusionApplicationSubmissionDate.details.manualInclusionApplicationSubmissionDate),
            LONDON_TIMEZONE,
            FULL_DATE,
          ),
        ));
  });

  describe('renders - for any blank fields', () => {
    let wrapper;

    const mockDeal = {
      updatedAt: null,
      status: '',
      maker: {},
      details: {
        bankInternalRefName: '',
        ukefDealId: ' ',
        previousStatus: '',
        checker: {},
        submissionDate: '',
      },
    };

    beforeAll(() => {
      const user = { timezone: LONDON_TIMEZONE };
      wrapper = render({ mockDeal, user });
    });

    it('displays deal.bankInternalRefName', () => wrapper.expectText('[data-cy="bankInternalRefName"]').toRead('-'));

    it('displays deal.details.ukefDealId', () => wrapper.expectText('[data-cy="ukefDealId"]').toRead('-'));

    it('displays deal.status', () => wrapper.expectText('[data-cy="status"]').toRead('-'));

    it('displays deal.previousStatus', () => wrapper.expectText('[data-cy="previousStatus"]').toRead('-'));

    it('displays deal.details.submissionDate', () => wrapper.expectText('[data-cy="submissionDate"]').toRead('-'));

    it('displays deal.updatedAt', () => wrapper.expectText('[data-cy="updatedAt"]').toRead('-'));
  });
});
