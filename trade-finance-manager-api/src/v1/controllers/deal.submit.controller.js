const {
  findOneTfmDeal,
  findOnePortalDeal,
  findOneGefDeal,
} = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const { createDealTasks } = require('./deal.tasks');
const { updateFacilities } = require('./update-facilities');
const { addDealProduct } = require('./deal.add-product');
const { addDealPricingAndRisk } = require('./deal.pricing-and-risk');
const { convertDealCurrencies } = require('./deal.convert-deal-currencies');
const { addDealStageAndHistory } = require('./deal.add-deal-stage-and-history');
const { addDealDateReceived } = require('./deal.add-date-received');
const { updatedIssuedFacilities } = require('./update-issued-facilities');
const { updatePortalDealStatus } = require('./update-portal-deal-status');
const CONSTANTS = require('../../constants');
const api = require('../api');
const { createEstoreFolders } = require('./estore.controller');
const acbsController = require('./acbs.controller');
const dealController = require('./deal.controller');
const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');
const { updatePortalDealFromMIAtoMIN } = require('./update-portal-deal-from-MIA-to-MIN');
const { sendDealSubmitEmails, sendAinMinIssuedFacilitiesAcknowledgementByDealId } = require('./send-deal-submit-emails');

const getDeal = async (dealId, dealType) => {
  let deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    deal = await findOneGefDeal(dealId);

    // temporarily return false for dev.
    return false;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    deal = await findOnePortalDeal(dealId);
  }

  return deal;
};

// const mapDeal = (deal) => {
//   let mappedDeal;

//   const { dealType } = deal.dealSnapshot;

//   if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
//     mappedDeal = mapGefDealSnapshot(deal);

//     // temporarily return false for dev.
//     return false;
//   }

//   if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
//     mappedDeal = mapDealSnapshot(deal);
//   }

//   return mappedDeal;
// };

const mapGefDeal = (deal) => {
  const { dealSnapshot, tfm } = deal;

  const mapped = {
    _id: dealSnapshot._id,
    dealType: dealSnapshot.dealType,
    bankSupplyContractID: dealSnapshot.bankInternalRefName,
    bankAdditionalReferenceName: dealSnapshot.additionalRefName,
    submissionCount: dealSnapshot.submissionCount,
    submissionType: dealSnapshot.submissionType,
    submissionDate: dealSnapshot.submissionDate,
    status: dealSnapshot.status,
    ukefDealId: dealSnapshot.ukefDealId,
    exporter: {
      companyName: dealSnapshot.exporter.companyName,
      companiesHouseRegistrationNumber: dealSnapshot.exporter.companiesHouseRegistrationNumber,
    },
    // dealCurrency
    // dealValue
    tfm,
  };

  return mapped;
};


const mapBssEwcsDeal = (deal) => {
  const { dealSnapshot, tfm } = deal;

  const mapped = {
    _id: dealSnapshot._id,
    dealType: dealSnapshot.dealType,
    bankReferenceNumber: dealSnapshot.details.bankSupplyContractID,
    bankAdditionalReferenceName: dealSnapshot.details.bankSupplyContractName,
    submissionCount: dealSnapshot.details.submissionCount,
    submissionType: dealSnapshot.details.submissionType,
    submissionDate: dealSnapshot.details.submissionDate,
    status: dealSnapshot.details.status,
    ukefDealId: dealSnapshot.details.ukefDealId,
    maker: dealSnapshot.details.maker,
    exporter: {
      companyName: dealSnapshot.submissionDetails['supplier-name'],
      companiesHouseRegistrationNumber: dealSnapshot.submissionDetails['supplier-companies-house-registration-number'],
    },
    buyer: {
      name: dealSnapshot.submissionDetails['buyer-name'],
      country: dealSnapshot.submissionDetails['buyer-address-country'],
    },
    indemnifier: {
      name: dealSnapshot.submissionDetails['indemnifier-name'],
    },
    dealCurrency: dealSnapshot.submissionDetails.supplyContractCurrency,
    dealValue: dealSnapshot.submissionDetails.supplyContractValue,
    destinationOfGoodsAndServices: dealSnapshot.submissionDetails.destinationOfGoodsAndServices,
    eligibility: dealSnapshot.eligibility,
    // TODO: align BSS/EWCS and GEF facilities.
    // update functions that consume this data
    facilities: [
      ...dealSnapshot.bondTransactions.items.map((facility) => ({
        _id: facility._id,
        ukefFacilityID: facility.ukefFacilityID,
        facilityType: facility.facilityType,
        coverStartDate: facility.requestedCoverStartDate,
        'coverEndDate-day': facility['coverEndDate-day'],
        'coverEndDate-month': facility['coverEndDate-month'],
        'coverEndDate-year': facility['coverEndDate-year'],
        ukefGuaranteeInMonths: facility.ukefGuaranteeInMonths,
        facilityStage: facility.facilityStage,
        currency: facility.currency,
        facilityValue: facility.facilityValue,
        coveredPercentage: facility.coveredPercentage,
        ukefExposure: facility.ukefExposure,
        disbursementAmount: facility.disbursementAmount,
        guaranteeFeePayableByBank: facility.guaranteeFeePayableByBank,
        dayCountBasis: facility.dayCountBasis,
        feeFrequency: facility.feeFrequency,
        feeType: facility.feeType,
        premiumType: facility.premiumType,
        premiumFrequency: facility.premiumFrequency,
        bankReferenceNumber: facility.bankReferenceNumber,
        uniqueIdentificationNumber: facility.uniqueIdentificationNumber,
        tfm: facility.tfm,
      })),
      ...dealSnapshot.loanTransactions.items.map((facility) => ({
        _id: facility._id,
        ukefFacilityID: facility.ukefFacilityID,
        facilityType: facility.facilityType,
        coverStartDate: facility.requestedCoverStartDate,
        'coverEndDate-day': facility['coverEndDate-day'],
        'coverEndDate-month': facility['coverEndDate-month'],
        'coverEndDate-year': facility['coverEndDate-year'],
        ukefGuaranteeInMonths: facility.ukefGuaranteeInMonths,
        facilityStage: facility.facilityStage,
        currency: facility.currency,
        facilityValue: facility.facilityValue,
        coveredPercentage: facility.coveredPercentage,
        ukefExposure: facility.ukefExposure,
        disbursementAmount: facility.disbursementAmount,
        guaranteeFeePayableByBank: facility.guaranteeFeePayableByBank,
        dayCountBasis: facility.dayCountBasis,
        feeFrequency: facility.feeFrequency,
        feeType: facility.feeType,
        premiumType: facility.premiumType,
        premiumFrequency: facility.premiumFrequency,
        bankReferenceNumber: facility.bankReferenceNumber,
        uniqueIdentificationNumber: facility.uniqueIdentificationNumber,
        tfm: facility.tfm,
      })),
    ],
    tfm,
  };

  return mapped;
};

const unifiedDealStructure = (deal) => {
  let mappedDeal;

  const { dealType } = deal.dealSnapshot;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    mappedDeal = mapGefDeal(deal);

    // temporarily return false for dev.
    return false;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    mappedDeal = mapBssEwcsDeal(deal);
  }

  return mappedDeal;
};

const submitDeal = async (dealId, dealType, checker) => {
  const deal = await getDeal(dealId, dealType);

  if (!deal) {
    return false;
  }


  // TODO:
  // 1) use mapDeal (and maybe dealReducer functionality??) to bring both deal types into nice data shape.
  // 2) update variable names in functions below. Simpler, cleaner. One step closer to unified structure.
  // 3) extract 'mappings' so it's outside of graphql as it won't be GQL specific

  const submittedDeal = await api.submitDeal(dealId);

  // const mappedDeal = mapDeal(submittedDeal);
  const mappedDeal = unifiedDealStructure(submittedDeal);

  const { submissionCount } = mappedDeal;

  const firstDealSubmission = submissionCount === 1;
  const dealHasBeenResubmit = submissionCount > 1;

  if (firstDealSubmission) {
    await updatePortalDealStatus(mappedDeal);

    const updatedDealWithPartyUrn = await addPartyUrns(mappedDeal);

    const updatedDealWithProduct = await addDealProduct(updatedDealWithPartyUrn);

    const updatedDealWithPricingAndRisk = await addDealPricingAndRisk(updatedDealWithProduct);

    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPricingAndRisk);

    const updatedDealWithTfmDealStage = await addDealStageAndHistory(updatedDealWithDealCurrencyConversions);

    const updatedDealWithTfmDateReceived = await addDealDateReceived(updatedDealWithTfmDealStage);

    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithTfmDateReceived);

    const updatedDealWithCreateEstore = await createEstoreFolders(updatedDealWithUpdatedFacilities);

    if (deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      const updatedDealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

      const updatedDeal = await api.updateDeal(dealId, updatedDealWithTasks);
      await sendDealSubmitEmails(dealId);

      return updatedDeal;
    }

    return api.updateDeal(dealId, updatedDealWithCreateEstore);
  }

  // TODO
  if (dealHasBeenResubmit) {
    const { tfm: tfmDeal } = await findOneTfmDeal(dealId);

    const updatedDeal = await updatedIssuedFacilities(submittedDeal);

    if (deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN
    ) {
      await acbsController.issueAcbsFacilities(updatedDeal);
    }

    if (shouldUpdateDealFromMIAtoMIN(deal, tfmDeal)) {
      const portalMINUpdate = await updatePortalDealFromMIAtoMIN(dealId, checker);

      const { dealSnapshot } = await api.updateDealSnapshot(dealId, portalMINUpdate);

      await dealController.submitACBSIfAllPartiesHaveUrn(dealId);

      // TODO
      await sendAinMinIssuedFacilitiesAcknowledgementByDealId(dealId);

      updatedDeal.dealSnapshot = dealSnapshot;
    }

    await updatePortalDealStatus(updatedDeal.dealSnapshot);

    return api.updateDeal(dealId, updatedDeal);
  }

  return api.updateDeal(dealId, submittedDeal);
};

exports.submitDeal = submitDeal;

const submitDealPUT = async (req, res) => {
  const {
    dealId,
    dealType,
    checker,
  } = req.body;

  const deal = await submitDeal(dealId, dealType, checker);

  if (!deal) {
    return res.status(404).send();
  }

  return res.status(200).send(deal);
};
exports.submitDealPUT = submitDealPUT;
