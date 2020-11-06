import express from 'express';
import api from '../../api';
import buildReportFilters from '../buildReportFilters';
import { getRAGstatus } from '../expiryStatusUtils';

import {
  getApiData,
  requestParams,
} from '../../helpers';

const primaryNav = 'reports';
const router = express.Router();

router.get('/reports/countdown-indicator', async (req, res) => {
  // [dw] while mocking this report out, I don't think we really understand the data-model involved
  //  so I'm, just mocking this out the old way rather than trying to work out how to re-plumb the API.
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }


  // need to query mongo and filter on multiple fields:
  // I've filtered the deals (MIA/MIN) on the main record submission type
  // then filtered the array locally
  // - STATUS:submissionAcknowledged + TRANSACTION_STAGE:unissued_conditional
  // - SUBMISSION_TYPE:manualInclusionApplication + STATUS:approved + MIN not issued
  // - SUBMISSION_TYPE:manualInclusionApplication + STATUS:approvedWithConditions + MIN not submitted
  const stageFilters = { // TODO use CONSTANTS lowercase string
    facilityStage: 'unissued_conditional',
    filterByStatus: 'submissionAcknowledged',
  };
  const submissionFilters = {
    filterBySubmissionType: 'manualInclusionApplication',
  };

  const filters = buildReportFilters(stageFilters, req.session.user);
  const MIAfilters = buildReportFilters(submissionFilters, req.session.user);

  // get all transactions
  const { transactions } = await getApiData(
    api.transactions(0, 0, filters, userToken),
    res,
  );

  const applications = await getApiData(
    api.contracts(0, 0, MIAfilters, userToken),
    res,
  );

  // mock up by filtering here on conditional or unissued
  const incompleteFacilities = transactions;
  const miaWithConditions = applications.deals.filter((deal) => (deal.details.status === 'Accepted by UKEF (with conditions)'));
  const miaWithOutConditions = applications.deals.filter((deal) => (deal.details.status === 'Accepted by UKEF (without conditions)'));

  const status90Days = getRAGstatus(incompleteFacilities, 90, false);
  const status20Days = getRAGstatus(miaWithConditions, 28, true);
  const status10Days = getRAGstatus(miaWithOutConditions, 14, true);

  const issueOrMakeFirstAdvance = {
    caption: 'You have 3 months to issue or make first advance under a transaction.',
    firstCellIsHeader: true,
    head: [{ text: 'Days remaining' }, { text: 'Facilities' }],
    rows: [
      [{ text: '0 to 15' }, { html: `<strong class="govuk-tag govuk-tag--red">${status90Days.red}</strong> &nbsp; <a href="/reports/unissued-transactions/0?fromDays=0&toDays=15" >view</a>` }],
      [{ text: '16 to 45' }, { html: `<strong class="govuk-tag govuk-tag--orange">${status90Days.orange}</strong> &nbsp; <a href="/reports/unissued-transactions/0?fromDays=16&toDays=45" >view</a>` }],
      [{ text: '46 to 90' }, { html: `<strong class="govuk-tag govuk-tag--green">${status90Days.green}</strong> &nbsp; <a href="/reports/unissued-transactions/0?fromDays=46&toDays=90" >view</a>` }],
    ],
  };

  const manualInclusionsWithConditions = {
    caption: 'Manual Inclusion Applications accepted by UKEF (with conditions)',
    firstCellIsHeader: true,
    head: [{ text: 'Days remaining' }, { text: 'Supply Contracts' }, { text: '' }],
    rows: [
      [{ text: '0 to 6' }, { html: `<strong class="govuk-tag govuk-tag--red">${status20Days.red}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/with-conditions/0?fromDays=0&toDays=6" >view</a>` }],
      [{ text: '7 to 13' }, { html: `<strong class="govuk-tag govuk-tag--orange">${status20Days.orange}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/with-conditions/0?fromDays=7&toDays=13" >view</a>` }],
      [{ text: '14 to 20' }, { html: `<strong class="govuk-tag govuk-tag--green">${status20Days.green}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/with-conditions/0?fromDays=14&toDays=20" >view</a>` }],
    ],
  };
  /*
  if (status20Days.negative > 0) {
    const row = [{ text: 'OVERDUE' },
    { html: `<strong class="govuk-tag govuk-tag--red">${status20Days.negative}</strong>
    &nbsp; <a href="/reports/mia-to-be-submitted/with-conditions" >view</a>` }];
    manualInclusionsWithConditions.rows.unshift(row);
  } */
  if (status20Days.negative === 0
    && status20Days.red === 0
    && status20Days.orange === 0
    && status20Days.green === 0) {
    status20Days.message = 'No data found.';
  }

  const manualInclusionsWithoutConditions = {
    caption: 'Manual Inclusion Applications accepted by UKEF (without conditions)',
    firstCellIsHeader: true,
    head: [{ text: 'Days remaining' }, { text: 'Supply Contracts' }, { text: '' }],
    rows: [
      [{ text: '0 to 5' }, { html: `<strong class="govuk-tag govuk-tag--red">${status10Days.red}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/without-conditions/0?fromDays=0&toDays=5" >view</a>` }],
      [{ text: '6 to 7' }, { html: `<strong class="govuk-tag govuk-tag--orange">${status10Days.orange}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/without-conditions/0?fromDays=6&toDays=7" >view</a>` }],
      [{ text: '8 to 10' }, { html: `<strong class="govuk-tag govuk-tag--green">${status10Days.green}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/without-conditions/0?fromDays=8&toDays=10" >view</a>` }],
    ],
  };
  /*
  if (status10Days.negatives > 0) {
    const row = [{ text: 'OVERDUE' },
    { html: `<strong class="govuk-tag govuk-tag--red">${status10Days.negative}</strong>
    &nbsp; <a href="/reports/mia-to-be-submitted/without-conditions" >view</a>` }];
    manualInclusionsWithoutConditions.rows.unshift(row);
  }
  */
  if (status10Days.negative === 0
    && status10Days.red === 0
    && status10Days.orange === 0
    && status10Days.green === 0) {
    status10Days.message = 'No data found.';
  }

  const reportData = {
    issueOrMakeFirstAdvance,
    manualInclusionsWithConditions,
    manualInclusionsWithoutConditions,
  };

  return res.render('reports/countdown-indicator.njk', {
    reportData,
    status10Days,
    status20Days,
    status90Days,
    primaryNav,
    subNav: 'countdown-indicator',
    user: req.session.user,
  });
});

export default router;
