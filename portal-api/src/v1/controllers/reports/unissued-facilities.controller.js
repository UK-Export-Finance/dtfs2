const { format, add, differenceInCalendarDays } = require('date-fns');
const commaNumber = require('comma-number');
const db = require('../../../drivers/db-client');
const CONSTANTS = require('../../../constants');

// helper function to retrieve the unissued facilities for MIN/AIN deals
const getUnissuedFacilities = async (bankId) => {
  const facilitiesCollection = 'facilities';
  const queryDb = await db.getCollection(facilitiesCollection);

  // join `facilities` collection with `deals` and return an array of objects that has the following format
  //   [{
  //     "dealId": "12345678",
  //     "dealType": "GEF",
  //     "submissionType": "Automatic Inclusion Notice"
  //     "companyName": "Exporter Name",
  //     "bankInternalRefName": "HSBC 123",
  //     "ukefFacilityId": "12345",
  //     "value": 30000000,
  //     "currency": "JPY",
  //     "submissionDate": "1642429692665"
  // }]

  const facilities = await queryDb.aggregate([
    // retrieve only unissued facilities
    { $match: { hasBeenIssued: false } },
    {
      $lookup: {
        from: 'deals',
        localField: 'dealId',
        foreignField: '_id',
        as: 'dealsTable',
      },
    },
    { $unwind: '$dealsTable' },
    {
      $match: {
        // ensure that only records for the given bank are returned
        'dealsTable.bank.id': bankId,
        // ensure that the deal status is NOT `Abandoned`
        'dealsTable.status': { $ne: CONSTANTS.DEAL.DEAL_STATUS.ABANDONED },
      }
    },
    {
      $project: {
        _id: 0,
        dealId: '$dealsTable._id',
        dealType: '$dealsTable.dealType',
        submissionType: '$dealsTable.submissionType',
        companyName: '$dealsTable.exporter.companyName',
        bankInternalRefName: '$dealsTable.bankInternalRefName',
        ukefFacilityId: '$ukefFacilityId',
        value: '$value',
        currency: '$currency.id',
        manualInclusionNoticeSubmissionDate: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$dealsTable.dealType', 'GEF'] },
                then: '$dealsTable.manualInclusionNoticeSubmissionDate'
              },
              {
                case: { $eq: ['$dealsTable.dealType', 'BSS/EWCS'] },
                then: '$dealsTable.details.manualInclusionNoticeSubmissionDate'
              },
            ],
          },
        },
        submissionDate: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$dealsTable.dealType', 'GEF'] },
                then: '$dealsTable.submissionDate'
              },
              {
                case: { $eq: ['$dealsTable.dealType', 'BSS/EWCS'] },
                then: '$dealsTable.details.submissionDate'
              },
            ],
          },
        },
      },
    },
    {
      $match: {
        // show only facilities for AIN/MIN submissions
        submissionType: {
          $in: [CONSTANTS.DEAL.SUBMISSION_TYPE.AIN, CONSTANTS.DEAL.SUBMISSION_TYPE.MIN],
        },
        // ensure that the deal has been submitted
        submissionDate: { $exists: true, $ne: null },
        // ensure that the facility has an ID
        ukefFacilityId: { $exists: true, $ne: null }
      },
    },
    // sort based on the submissionDate in ASC order - most urgent item should be first
    { $sort: { submissionDate: 1 } },
  ]).toArray();

  return facilities;
};

// this function is used to build the "Unissued facilities" page for on Reports
exports.findUnissuedFacilitiesReports = async (req, res) => {
  try {
    const bankId = req.user.bank.id;
    const facilities = bankId ? await getUnissuedFacilities(bankId) : [];
    const unissuedFacilities = [];
    let defaultDate;

    if (facilities.length) {
      let facility = '';
      // loop through facilities
      facilities.forEach((item) => {
        facility = item;

        // check if it's a MIN deal - this is because we need to use the timestamp when a deal was submitted as a MIN, and NOT the submission date
        if (facility.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
          // check if the `manualInclusionNoticeSubmissionDate` is not null
          defaultDate = item.manualInclusionNoticeSubmissionDate || '';
        } else {
          // check if the `submissionDate` is not null
          defaultDate = item.submissionDate || '';
        }
        // ensure there is a default date (either submission date or MIN date)
        if (defaultDate) {
          const setDateToMidnight = (new Date(parseInt(defaultDate, 10))).setHours(2, 0, 1, 0);
          // add 3 months to the submission date - as per ticket
          const deadlineForIssuing = add(setDateToMidnight, { days: 90 });
          // format the date DD MMM YYYY (i.e. 18 April 2022)
          facility.deadlineForIssuing = facility.submissionDate ? format(deadlineForIssuing, 'dd LLL yyyy') : '';

          // get today's date
          const todaysDate = new Date();
          facility.daysLeftToIssue = defaultDate ? differenceInCalendarDays(todaysDate, deadlineForIssuing) * -1 + 0 : 0;

          facility.currencyAndValue = item.value ? `${item.currency} ${commaNumber(item.value)}` : '';
          unissuedFacilities.push(facility);
        }
      });
    }

    // sort the facilities based on `daysLeftToIssue` property with the most urgent item at the top
    unissuedFacilities.sort((a, b) => (a.daysLeftToIssue > b.daysLeftToIssue ? 1 : -1));
    res.status(200).send(unissuedFacilities);
  } catch (error) {
    console.error('Unable to retrieve unissued facilities', { error });
  }
};
