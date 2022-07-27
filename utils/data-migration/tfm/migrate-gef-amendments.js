/**
 * DATA MIGRATION
 * **************
 * Purpose of this script is to migrate GEF deals to TFM.
 * Since GEF deals are not subjected to execution on Workflow.
 */

const { TFM_API } = process.env;
const axios = require('axios');
const { getUnixTime } = require('date-fns');
const { excelDateToISODateString } = require('../helpers/date');
const CONSTANTS = require('../constant');
const { open } = require('../helpers/actionsheets');

const createFacilityAmendment = async (facilityId) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${TFM_API}/v1/facility/${facilityId}/amendment`,
      headers: { 'Content-Type': 'application/json' },
      data: { facilityId },
    });

    return response.data;
  } catch (err) {
    console.error('Unable to create new amendment %O', { response: err?.response?.data });
    return err?.response?.data;
  }
};

const updateAmendment = async (facilityId, amendmentId, data) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${TFM_API}/v1/facility/${facilityId}/amendment/${amendmentId}`,
      headers: { 'Content-Type': 'application/json' },
      data,
    });

    return { status: 200, data: response.data };
  } catch (err) {
    console.error('Unable to create amendment request %O', { response: err?.response?.data });
    return { status: err?.response?.status, data: err?.response?.data };
  }
};

const migrateGefAmendments = async () => {
  const amendmentType = [
    'Decrease in Value',
    'Increase in Value',
    'Increase in value',
    'Extension',
    'Extension,Value Increase, UKEF ML % reduction',
    'Cover period increase',
    'GE Extension',
    'GE Extension, Increase in Value',
    'Increase in Value, Cover percentage increase',
    'ML Increase'
  ];
  const { MANUAL, AUTOMATIC } = CONSTANTS.AMENDMENT.AMENDMENT_TYPE;
  const { COMPLETED } = CONSTANTS.AMENDMENT.AMENDMENT_STATUS;
  const { PROCEED } = CONSTANTS.AMENDMENT.AMENDMENT_BANK_DECISION;
  const allGefAmendments = [];
  let amendments22To23 = await open('./gef-amendments/gef-amendments2.xlsx', 'Amendments Apr 22 to Apr 23');
  amendments22To23 = amendments22To23.filter((item) => item.Product === 'GEF' && amendmentType.includes(item['Type of amendment'].trim()) && item.Stage === COMPLETED);
  allGefAmendments.push(...amendments22To23);

  let amendments21To22 = await open('./gef-amendments/gef-amendments2.xlsx', 'Amendments Apr 21 to Apr 22');
  amendments21To22 = amendments21To22.filter((item) => item.Product === 'GEF' && amendmentType.includes(item['Type of amendment'].trim()) && item.Stage === COMPLETED);
  allGefAmendments.push(...amendments21To22);
  const json = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const amendment of allGefAmendments) {
    // eslint-disable-next-line no-await-in-loop
    const { amendmentId } = await createFacilityAmendment(amendment.facilityId);
    const { facilityId } = amendment;
    console.log(amendmentId, facilityId); // TODO: change to proper script print
    const output = {};
    output.requestDate = getUnixTime(new Date(excelDateToISODateString(amendment['Date received'])));
    output.exporter = amendment.Exporter.trim();
    output.ukefDealId = `00${amendment['UKEF Deal ID']}`;
    output.ukefFacilityId = `00${amendment['UKEF Facility ID']}`;
    output.status = amendment.Stage;
    output.submittedByPim = true;
    output.submittedAt = amendment.Moved ? getUnixTime(new Date(excelDateToISODateString(amendment.Moved))) : '';
    output.requireUkefApproval = amendment['Notification or Request'] === MANUAL;
    output.changeFacilityValue = amendment.changeFacilityValue;
    output.changeCoverEndDate = amendment.changeCoverEndDate;

    if (amendment.changeCoverEndDate) {
      output.currentCoverEndDate = getUnixTime(new Date(excelDateToISODateString(amendment.currentCoverEndDate)));
      output.coverEndDate = getUnixTime(new Date(excelDateToISODateString(amendment.coverEndDate)));
    }

    if (amendment.changeFacilityValue) {
      output.currentValue = amendment.currentValue;
      output.value = amendment.value;
      output.currency = amendment.currency;
    }

    if (amendment['Notification or Request'] === AUTOMATIC) {
      if (amendment.changeCoverEndDate) {
        output.effectiveDate = getUnixTime(new Date(excelDateToISODateString(amendment['When Finished'])));
      }
    }

    if (amendment['Notification or Request'] === MANUAL) {
      output.leadUnderwriterId = amendment.UnderwriterID;
      output.ukefDecision = {
        coverEndDate: amendment['CoverEndDate Decision'], // TODO: add UW Manager decision Approved with or without conditions
        value: amendment['Value Decision'], // TODO: add UW Manager decision Approved with or without conditions
        comments: amendment['PIM Comment/Status'],
        conditions: amendment.conditions ? amendment.conditions : null, // TODO: add any conditions, if applicable
        declined: amendment.declined ? amendment.declined : null, // TODO: add any reasons why it was declined. This is probably not applicable
        managersDecisionEmail: true,
        managersDecisionEmailSent: true,
        submitted: true,
        submittedAt: amendment['When Finished'] ? getUnixTime(new Date(excelDateToISODateString(amendment['When Finished']))) : '',
        submittedBy: {
          _id: amendment.UnderwriterID,
          name: amendment.UnderwriterName,
          email: amendment.UnderwriterEmail,
          username: amendment.UnderwriterUsername,
        },
      };
      output.bankDecision = {
        decision: PROCEED,
        banksDecisionEmail: true,
        banksDecisionEmailSent: true,
        submittedAt: amendment['When Finished'] ? getUnixTime(new Date(excelDateToISODateString(amendment['When Finished']))) : '',
        effectiveDate: amendment['When Finished'] ? getUnixTime(new Date(excelDateToISODateString(amendment['When Finished']))) : '', // TODO: confirm
        receivedDate: getUnixTime(new Date(excelDateToISODateString(amendment['Date received']))), // TODO: check for received date
        submitted: true,
        submittedBy: {
          _id: amendment.PIMId,
          name: amendment.PIMName,
          email: amendment.PIMEmail,
          username: amendment.PIMUsername,
        }
      };
    }

    // eslint-disable-next-line no-await-in-loop
    await updateAmendment(facilityId, amendmentId, output);
    const taskUpdate = {
      createTasks: true,
      submittedByPim: true,
      requireUkefApproval: output.requireUkefApproval
    };
    // eslint-disable-next-line no-await-in-loop
    await updateAmendment(facilityId, amendmentId, taskUpdate);

    json.push(output);
  }
};

migrateGefAmendments();
