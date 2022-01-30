const { format, differenceInBusinessDays, addBusinessDays } = require('date-fns');
const db = require('../../../drivers/db-client');
const CONSTANTS = require('../../../constants');

// helper function to retrieve the unissued facilities for MIN/AIN deals
const getUkefDecision = async (decision, bankId) => {
  const dealsCollection = 'deals';
  const queryDb = await db.getCollection(dealsCollection);

  // return an array of objects that has the following format
  // [{
  //    dealId: '12345678'
  //    bankInternalRefName: "HSBC 123"
  //    companyName: "Exporter Name"
  //    dateCreatedEpoch: 1642762583805
  //    dateOfApprovalEpoch: 1642753187
  //    dealType: "GEF"
  //    submissionDateEpoch: "1642762644833"
  // }]
  const deals = await queryDb.aggregate([
    { $unwind: '$ukefDecision' },
    { $match: { 'ukefDecision.decision': decision, 'bank.id': bankId } },
    {
      $project: {
        _id: 0,
        dealId: '$_id',
        bankInternalRefName: '$bankInternalRefName',
        dealType: '$dealType',
        companyName: '$exporter.companyName',
        dateCreatedEpoch: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$dealType', 'GEF'] },
                then: '$createdAt'
              },
              {
                case: { $eq: ['$dealType', 'BSS/EWCS'] },
                then: '$details.created'
              },
            ],
          },
        },
        dateOfApprovalEpoch: '$ukefDecision.timestamp',
        submissionDateEpoch: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$dealType', 'GEF'] },
                then: '$submissionDate'
              },
              {
                case: { $eq: ['$dealType', 'BSS/EWCS'] },
                then: '$details.submissionDate'
              },
            ],
          },
        },
      }
    },
    { $sort: { dateOfApprovalEpoch: 1 } }
  ]).toArray();
  return deals;
};

// this function is used to retrieve the ukefDecision reports
// for Deals approved with or without conditions
exports.reviewUkefDecisionReports = async (req, res) => {
  try {
    // get the bankId to ensure that reports are specific for a specific bank
    const bankId = req.user.bank.id;

    // get the decision - this can be either approved with or without conditions
    const ukefDecision = req.body.ukefDecision || req.query.ukefDecision || '';
    const ukefDecisions = [];

    if (ukefDecision === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS
     || ukefDecision === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS) {
      // ensure that the API call is performed only if a bankId is provided
      const deals = bankId ? await getUkefDecision(ukefDecision, bankId) : [];
      // check to see if there are any decisions waiting to be reviewed
      if (deals.length) {
        let deal;
        let setDateToMidnight;
        let dateOfApproval;
        let defaultDate;
        const todaysDate = new Date();
        // loop through deals
        deals.forEach((item) => {
          deal = item;

          // check if the date created is not null
          defaultDate = item.dateCreatedEpoch || '';
          setDateToMidnight = (new Date(parseInt(defaultDate, 10))).setHours(0, 0, 1, 0);
          // format the date DD LLL YYYY (i.e. 18 April 2022)
          deal.dateCreated = deal.dateCreatedEpoch ? format(setDateToMidnight, 'dd LLL yyyy') : '';

          // check if the submission date is not null
          defaultDate = item.submissionDateEpoch || '';
          setDateToMidnight = (new Date(parseInt(defaultDate, 10))).setHours(0, 0, 1, 0);
          // format the date DD LLL YYYY (i.e. 18 April 2022)
          deal.submissionDate = deal.submissionDateEpoch ? format(setDateToMidnight, 'dd LLL yyyy') : '';

          // check if the date of approval is not null
          defaultDate = item.dateOfApprovalEpoch || '';
          setDateToMidnight = (new Date(parseInt(defaultDate, 10))).setHours(0, 0, 1, 0);
          // format the date DD LLL YYYY (i.e. 18 April 2022)
          deal.dateOfApproval = deal.dateOfApprovalEpoch ? format(setDateToMidnight, 'dd LLL yyyy') : '';

          if (ukefDecision === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS) {
          // add `10 business days` to the date of approval if the deal is approved without conditions - as per ticket
            dateOfApproval = addBusinessDays(setDateToMidnight, 10);
          } else if (ukefDecision === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS) {
          // add `20 business days` to the date of approval if the deal is approved with conditions - as per ticket
            dateOfApproval = addBusinessDays(setDateToMidnight, 20);
          }

          deal.daysToReview = defaultDate ? (differenceInBusinessDays(todaysDate, dateOfApproval) * -1) : 0;

          ukefDecisions.push(deal);
          setDateToMidnight = '';
        });
      }
    }

    res.status(200).send(ukefDecisions);
  } catch (error) {
    console.error('Unable to retrieve ukef\'s decision', { error });
  }
  res.status(200).send();
};
