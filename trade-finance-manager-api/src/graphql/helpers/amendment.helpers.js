const { format, fromUnixTime } = require('date-fns');
const { formattedNumber } = require('../../utils/number');
const { decimalsCount, roundNumber } = require('../../v1/helpers/number');
const { CURRENCY } = require('../../constants/currency');
const api = require('../../v1/api');
const { DEALS } = require('../../constants');

// returns the formatted amendment value and currency (without conversion)
const amendmentChangeValueExportCurrency = (amendment) => {
  const { currency, value: amendmentValue } = amendment;

  if (currency && amendmentValue) {
    return `${currency} ${formattedNumber(amendmentValue)}`;
  }

  return null;
};

// calculates new facility value in GBP
const calculateNewFacilityValue = (exchangeRate, amendment) => {
  const { currency, value: amendmentValue } = amendment;
  let newValue;

  if (currency && amendmentValue) {
    // if already in GBP, just take the value
    if (currency === CURRENCY.GBP) {
      newValue = amendmentValue;
    } else {
      // if no exchange rate return null
      if (!exchangeRate) {
        return null;
      }
      const valueInGBP = amendmentValue * exchangeRate;
      const totalDecimals = decimalsCount(valueInGBP);
      // rounds value to 2dp
      if (totalDecimals > 2) {
        newValue = roundNumber(valueInGBP, 2);
      } else {
        newValue = valueInGBP;
      }
    }

    return newValue;
  }

  return null;
};

// calculates new ukef exposure from amendment value
const calculateUkefExposure = (facilityValueInGBP, coverPercentage) => {
  let ukefExposure;

  if (facilityValueInGBP && coverPercentage) {
    // parse float as can have 2dp in facility value
    const calculation = parseFloat(facilityValueInGBP, 10) * (coverPercentage / 100);
    const totalDecimals = decimalsCount(calculation);

    if (totalDecimals > 2) {
      ukefExposure = roundNumber(calculation, 2);
    } else {
      ukefExposure = calculation;
    }

    return ukefExposure;
  }

  return null;
};

// checks for coverStartDate and returns based on deal-type as stored differently
const dealTypeCoverStartDate = (facilitySnapshot) => {
  const { coverStartDate } = facilitySnapshot;

  // if exists - gef
  if (coverStartDate) {
    return coverStartDate;
  }

  let dateConstructed;

  if (facilitySnapshot['requestedCoverStartDate-year'] && facilitySnapshot['requestedCoverStartDate-month'] && facilitySnapshot['requestedCoverStartDate-day']) {
  // BSS stored as seperate year month day values
    dateConstructed = new Date(
      facilitySnapshot['requestedCoverStartDate-year'],
      facilitySnapshot['requestedCoverStartDate-month'] - 1,
      facilitySnapshot['requestedCoverStartDate-day'],
    );
  } else {
    dateConstructed = new Date(parseInt(facilitySnapshot.requestedCoverStartDate, 10));
  }

  return dateConstructed;
};

// calculates new tenor from amendment coverEndDate and facility coverStartDate.  Requires external api call to calculate tenor
const calculateAmendmentTenor = async (facilitySnapshot, amendment) => {
  if (facilitySnapshot && facilitySnapshot?.ukefFacilityType && (facilitySnapshot?.coverStartDate || facilitySnapshot?.requestedCoverStartDate)
    && amendment && amendment?.coverEndDate) {
    const { coverEndDate } = amendment;
    const { ukefFacilityType } = facilitySnapshot;

    // returns coverStartDate from either gef or bss format
    const coverStartDate = dealTypeCoverStartDate(facilitySnapshot);
    // formatting for external api call
    const coverStartDateFormatted = format(new Date(coverStartDate), 'yyyy-MM-dd');
    const coverEndDateFormatted = format(fromUnixTime(coverEndDate), 'yyyy-MM-dd');

    const updatedTenor = await api.getFacilityExposurePeriod(coverStartDateFormatted, coverEndDateFormatted, ukefFacilityType);

    return updatedTenor.exposurePeriodInMonths;
  }

  return null;
};

// checking if amendment completed and if value change accepted fully
const latestAmendmentValueAccepted = (amendment) => {
  const { ukefDecision, bankDecision, value, requireUkefApproval } = amendment;
  const { APPROVED_WITH_CONDITIONS } = DEALS.AMENDMENT_UW_DECISION;
  const { APPROVED_WITHOUT_CONDITIONS } = DEALS.AMENDMENT_UW_DECISION;
  const { PROCEED } = DEALS.AMENDMENT_BANK_DECISION;

  const ukefDecisionApproved = ukefDecision?.value === APPROVED_WITH_CONDITIONS || ukefDecision?.value === APPROVED_WITHOUT_CONDITIONS;
  const bankProceed = bankDecision?.decision === PROCEED;

  if (!requireUkefApproval && value) {
    return true;
  }

  if (value && ukefDecisionApproved && bankProceed) {
    return true;
  }

  return false;
};

// checking if amendment completed and if coverEndDate change accepted fully
const latestAmendmentCoverEndDateAccepted = (amendment) => {
  const { ukefDecision, bankDecision, coverEndDate, requireUkefApproval } = amendment;
  const { APPROVED_WITH_CONDITIONS } = DEALS.AMENDMENT_UW_DECISION;
  const { APPROVED_WITHOUT_CONDITIONS } = DEALS.AMENDMENT_UW_DECISION;
  const { PROCEED } = DEALS.AMENDMENT_BANK_DECISION;

  const ukefDecisionApproved = ukefDecision?.coverEndDate === APPROVED_WITH_CONDITIONS || ukefDecision?.coverEndDate === APPROVED_WITHOUT_CONDITIONS;
  const bankProceed = bankDecision?.decision === PROCEED;

  if (!requireUkefApproval && coverEndDate) {
    return true;
  }

  if (coverEndDate && ukefDecisionApproved && bankProceed) {
    return true;
  }

  return false;
};

// calculates the value for total exposure to return for a single amendment
const calculateAmendmentTotalExposure = async (facility) => {
  const { _id, tfm, facilitySnapshot } = facility;
  const { exchangeRate } = tfm;

  const latestCompletedAmendment = await api.getLatestCompletedAmendment(_id);

  if (latestCompletedAmendment?.amendmentId && latestCompletedAmendment?.value && latestAmendmentValueAccepted(latestCompletedAmendment)) {
    const { coverPercentage, coveredPercentage } = facilitySnapshot;

    // BSS is coveredPercentage while GEF is coverPercentage
    const coverPercentageValue = coverPercentage || coveredPercentage;

    const valueInGBP = calculateNewFacilityValue(exchangeRate, latestCompletedAmendment);
    const ukefExposureValue = calculateUkefExposure(valueInGBP, coverPercentageValue);

    // sets new exposure value based on amendment value
    return ukefExposureValue;
  }

  return null;
};

module.exports = {
  amendmentChangeValueExportCurrency,
  calculateNewFacilityValue,
  calculateUkefExposure,
  calculateAmendmentTenor,
  latestAmendmentValueAccepted,
  latestAmendmentCoverEndDateAccepted,
  calculateAmendmentTotalExposure,
};
