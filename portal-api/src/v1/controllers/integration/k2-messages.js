// NOTE: Workflow integration has been disabled and replaced with TFM integration.
// Leaving this code here just incase we need to re-enable.

// const libxml = require('libxmljs');
const libxml = { parseXml: () => {} };

const fs = require('fs');
const path = require('path');

const typeABuilder = require('./type-a-defs/type-a-builder');
const fileshare = require('../../../drivers/fileshare');
const banksController = require('../banks.controller');

const {
  eligibilityCriteriaHelper,
  convertCountryCodeToId,
  convertCurrencyCodeToId,
  convertCurrencyFormat,
  businessRules,
  k2Map,
  dateHelpers,
  getApplicationGroup,
  getActionCodeAndName,
  calculateExposurePeriod,
  calculateIssuedDate,
  calculateFacilityConversionRate,
  calculateFacilityConversionDate,
} = require('./helpers');

const generateTypeA = async (deal, fromStatus) => {
  const { actionCode, actionName } = getActionCodeAndName(deal, fromStatus);

  const dealCurrencyId = deal.submissionDetails.supplyContractCurrency
    && deal.submissionDetails.supplyContractCurrency.id;

  const bondCount = deal.bondTransactions && deal.bondTransactions.items
    ? deal.bondTransactions.items.length
    : 0;

  const loanCount = deal.loanTransactions && deal.loanTransactions.items
    ? deal.loanTransactions.items.length
    : 0;

  const dealConversionRate = dealCurrencyId === 'GBP'
    ? 1
    : deal.submissionDetails.supplyContractConversionRateToGBP;

  const dealConversionDate = dealCurrencyId === 'GBP'
    ? ''
    : dateHelpers.formatDate(
      deal.submissionDetails['supplyContractConversionDate-day'],
      deal.submissionDetails['supplyContractConversionDate-month'],
      deal.submissionDetails['supplyContractConversionDate-year'],
    );

  const bank = await banksController.findOneBank(deal.maker.bank.id);

  const builder = typeABuilder()
    .source('V2')
    .action_code(actionCode)
    .action_name(actionName)
    .application_group(getApplicationGroup(deal))
    .message_type('A')
    .revision_id(deal._id) // eslint-disable-line no-underscore-dangle
    .portal_deal_id(deal._id) // eslint-disable-line no-underscore-dangle
    .Deal_name(deal.additionalRefName)
    .Bank_deal_id(deal.bankInternalRefName)

    .Application_route(deal.eligibility)
    .Application_owner(`${deal.maker.firstname} ${deal.maker.surname}`)
    .Application_owner_email(deal.maker.email)
    .Application_bank(bank && bank.name)
    .Application_bank_co_hse_reg_number(bank && bank.companiesHouseNo)
    .UKEF_deal_id(deal.details.ukefDealId)

    .Customer_type(k2Map.DEAL.SUPPLIER_TYPE[deal.submissionDetails['supplier-type']])
    .Exporter_co_hse_reg_number(deal.submissionDetails['supplier-companies-house-registration-number'])
    .Exporter_registration_source('Companies House')
    .Exporter_name(deal.submissionDetails['supplier-name'])

    .Exporter_address_Line1(deal.submissionDetails['supplier-address-line-1'])
    .Exporter_address_Line2(deal.submissionDetails['supplier-address-line-2'])
    .Exporter_address_Line3(deal.submissionDetails['supplier-address-line-3'])
    .Exporter_address_Town(deal.submissionDetails['supplier-address-town'])
    .Exporter_address_PostalCode((deal.submissionDetails['supplier-address-postcode']))
    .Exporter_address_Country(await convertCountryCodeToId(deal.submissionDetails['supplier-address-country'].code))

    .Industry_sector_code(deal.submissionDetails['industry-sector'].code)
    .Industry_sector_name(deal.submissionDetails['industry-sector'].name)
    .Industry_class_code(deal.submissionDetails['industry-class'].code)
    .Industry_class_name(deal.submissionDetails['industry-class'].name)
    .Sme_type(k2Map.DEAL.SME_TYPE[deal.submissionDetails['sme-type'] || 'Not known'])
    .Description_of_export(deal.submissionDetails['supply-contract-description'])
    .Bank_security(deal.dealFiles && deal.dealFiles.security)

    .Buyer_name(deal.submissionDetails['buyer-name'])
    .Buyer_country_code(await convertCountryCodeToId(deal.submissionDetails['buyer-address-country'].code))
    .Destination_country_code(await convertCountryCodeToId(deal.submissionDetails.destinationOfGoodsAndServices.code))
    .Deal_currency_code(await convertCurrencyCodeToId(dealCurrencyId))
    .Conversion_rate(dealConversionRate)
    .Conversion_date(dealConversionDate)
    .Contract_value(convertCurrencyFormat(deal.submissionDetails.supplyContractValue))

    .Ec_agents_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 11))
    .Ec_agents_name(deal.eligibility.agentName)
    .Ec_agents_address_line_1(deal.eligibility.agentAddressLine1)
    .Ec_agents_address_line_2(deal.eligibility.agentAddressLine2)
    .Ec_agents_address_line_3(deal.eligibility.agentAddressLine3)
    .Ec_agents_address_town(deal.eligibility.agentAddressTown)
    .Ec_agents_address_postal_code(deal.eligibility.agentAddressPostcode)
    .Ec_agents_address_country(
      deal.eligibility.agentAddressCountry
      && await convertCountryCodeToId(deal.eligibility.agentAddressCountry.code),
    )

    .Ec_initial_term_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 12))
    .Ec_total_exposure_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 13))
    .Ec_bond_issuance_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 14))
    .Ec_industry_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 16))
    .Ec_internal_approval_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 17))
    .Ec_banks_normal_pricing_policies_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 18))
    .Ec_requested_cover_start_date_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 15));

  if (deal.submissionDetails['supplier-correspondence-address-is-different'] === 'true') {
    builder.Exporter_correspondence_address_Line1(deal.submissionDetails['supplier-correspondence-address-line-1'])
      .Exporter_correspondence_address_Line2(deal.submissionDetails['supplier-correspondence-address-line-2'])
      .Exporter_correspondence_address_Line3(deal.submissionDetails['supplier-correspondence-address-line-3'])
      .Exporter_correspondence_address_Town(deal.submissionDetails['supplier-correspondence-address-town'])
      .Exporter_correspondence_address_PostalCode(deal.submissionDetails['supplier-correspondence-address-postcode'])
      .Exporter_correspondence_address_Country(await convertCountryCodeToId((deal.submissionDetails['supplier-correspondence-address-country'].code)));
  }

  if (deal.submissionDetails.legallyDistinct === 'true') {
    builder.Indemnifier_co_hse_reg_number(deal.submissionDetails['indemnifier-companies-house-registration-number'])
      .Indemnifier_name(deal.submissionDetails['indemnifier-name'])
      .Indemnifier_address_Line1(deal.submissionDetails['indemnifier-address-line-1'])
      .Indemnifier_address_Line2(deal.submissionDetails['indemnifier-address-line-2'])
      .Indemnifier_address_Line3(deal.submissionDetails['indemnifier-address-line-3'])
      .Indemnifier_address_Town(deal.submissionDetails['indemnifier-address-town'])
      .Indemnifier_address_PostalCode(deal.submissionDetails['indemnifier-address-postcode'])
      .Indemnifier_address_Country(await convertCountryCodeToId(deal.submissionDetails['indemnifier-address-country'].code));

    if (deal.submissionDetails.indemnifierCorrespondenceAddressDifferent === 'true') {
      builder.Indemnifier_correspondence_address_Line1(deal.submissionDetails['indemnifier-correspondence-address-line-1'])
        .Indemnifier_correspondence_address_Line2(deal.submissionDetails['indemnifier-correspondence-address-line-2'])
        .Indemnifier_correspondence_address_Line3(deal.submissionDetails['indemnifier-correspondence-address-line-3'])
        .Indemnifier_correspondence_address_Town(deal.submissionDetails['indemnifier-correspondence-address-town'])
        .Indemnifier_correspondence_address_PostalCode(deal.submissionDetails['indemnifier-correspondence-address-postcode'])
        .Indemnifier_correspondence_address_Country(await convertCountryCodeToId(deal.submissionDetails['indemnifier-correspondence-address-country'].code));
    }
  }

  let totalBondValueContractCurrency = 0;
  let totalBondExposure = 0;
  let totalBondPremium = 0;

  if (deal.bondTransactions && deal.bondTransactions.items) {
    for (let i = 0; i < deal.bondTransactions.items.length; i += 1) {
      const bond = deal.bondTransactions.items[i];

      const bondCurrencyId = bond.currencySameAsSupplyContractCurrency === 'true'
        ? dealCurrencyId
        : bond.currency && bond.currency.id;

      const { guaranteeCommencementDate, coverExpiryDate } = calculateIssuedDate(bond, deal.details.submissionDate);

      const bondConversionRate = calculateFacilityConversionRate(bond, dealCurrencyId);
      const bondConversionDate = calculateFacilityConversionDate(bond, dealCurrencyId);

      let bondname;

      if (bond.name) {
        bondname = bond.name;
      }

      let bondUkefFacilityId;
      if (bond.ukefFacilityId) {
        bondUkefFacilityId = Array.isArray(bond.ukefFacilityId) ? bond.ukefFacilityId[0] : bond.ukefFacilityId;
      }

      const bss = builder.createBSS()
        .BSS_portal_facility_id(bond._id) // eslint-disable-line no-underscore-dangle
        .UKEF_BSS_facility_id(bondUkefFacilityId)
        .BSS_bank_id(bondname)
        .BSS_issuer(bond.bondIssuer)
        .BSS_type(k2Map.FACILITIES.TYPE[bond.bondType])
        .BSS_stage(k2Map.FACILITIES.STAGE_BOND[bond.facilityStage])
        .BSS_beneficiary(bond.bondBeneficiary)
        .BSS_value(convertCurrencyFormat(bond.value))
        .BSS_currency_code(
          await convertCurrencyCodeToId(bondCurrencyId), // eslint-disable-line no-await-in-loop
        )
        .BSS_conversion_rate_deal(bondConversionRate)
        .BSS_conversion_date_deal(bondConversionDate)
        .BSS_fee_rate(bond.riskMarginFee)
        .BSS_fee_perc(bond.guaranteeFeePayableByBank)
        .BSS_guarantee_perc(bond.coveredPercentage)
        .BSS_max_liability(convertCurrencyFormat(bond.ukefExposure))
        .BSS_min_quarterly_fee(Number(bond.minimumRiskMarginFee) ? Number(bond.minimumRiskMarginFee) : 0)
        .BSS_premium_type(k2Map.FACILITIES.FEE_TYPE[bond.feeType])
        .BSS_cover_start_date(guaranteeCommencementDate)
        .BSS_issue_date(dateHelpers.formatTimestamp(bond.issuedDate))
        .BSS_cover_end_date(coverExpiryDate)
        .BSS_cover_period(calculateExposurePeriod(bond))
        .BSS_day_basis(k2Map.FACILITIES.DAY_COUNT_BASIS[bond.dayCountBasis]);

      if (!businessRules.transactions.isPremiumTypeAtMaturity(bond.feeType)) {
        bss.BSS_premium_freq(k2Map.FACILITIES.FEE_FREQUENCY[bond.feeFrequency]);
      }

      builder.addBSS(bss);

      const conversionRate = bond.currencySameAsSupplyContractCurrency === 'true' ? 1 : bond.conversionRate;

      totalBondValueContractCurrency += convertCurrencyFormat(bond.value) / conversionRate;
      const bondExposure = convertCurrencyFormat(bond.ukefExposure) / conversionRate;
      totalBondExposure += bondExposure;
      totalBondPremium += bondExposure * (bond.coveredPercentage / 100);
    }

    let totalLoanValueContractCurrency = 0;
    let totalLoanExposure = 0;
    let totalLoanPremium = 0;

    if (deal.loanTransactions && deal.loanTransactions.items) {
      for (let i = 0; i < deal.loanTransactions.items.length; i += 1) {
        const loan = deal.loanTransactions.items[i];

        const loanCurrencyId = loan.currencySameAsSupplyContractCurrency === 'true'
          ? dealCurrencyId
          : loan.currency && loan.currency.id;

        const { guaranteeCommencementDate, coverExpiryDate } = calculateIssuedDate(loan, deal.details.submissionDate);

        const loanConversionRate = calculateFacilityConversionRate(loan, dealCurrencyId);
        const loanConversionDate = calculateFacilityConversionDate(loan, dealCurrencyId);

        let loanUkefFacilityId;
        if (loan.ukefFacilityId) {
          loanUkefFacilityId = Array.isArray(loan.ukefFacilityId) ? loan.ukefFacilityId[0] : loan.ukefFacilityId;
        }

        const ewcs = builder.createEWCS()
          .EWCS_portal_facility_id(loan._id)
          .UKEF_EWCS_facility_id(loanUkefFacilityId)
          .EWCS_bank_id(loan.bankReferenceNumber)
          .EWCS_stage(k2Map.FACILITIES.STAGE_LOAN[loan.facilityStage])
          .EWCS_value(convertCurrencyFormat(loan.value))
          .EWCS_currency_code(
            await convertCurrencyCodeToId(loanCurrencyId), // eslint-disable-line no-await-in-loop
          )
          .EWCS_conversion_rate_deal(loanConversionRate)
          .EWCS_conversion_date_deal(loanConversionDate)
          .EWCS_disbursement_amount(convertCurrencyFormat(loan.disbursementAmount))
          .EWCS_interest_rate(loan.interestMarginFee)
          .EWCS_fee_perc(loan.guaranteeFeePayableByBank)
          .EWCS_guarantee_perc(loan.coveredPercentage)
          .EWCS_max_liability(convertCurrencyFormat(loan.ukefExposure))
          .EWCS_min_quarterly_fee(Number(loan.minimumQuarterlyFee))
          .EWCS_premium_type(k2Map.FACILITIES.FEE_TYPE[loan.premiumType])
          .EWCS_cover_start_date(guaranteeCommencementDate)
          .EWCS_issue_date(dateHelpers.formatTimestamp(loan.issuedDate))
          .EWCS_cover_end_date(coverExpiryDate)
          .EWCS_cover_period(calculateExposurePeriod(loan))
          .EWCS_day_basis(k2Map.FACILITIES.DAY_COUNT_BASIS[loan.dayCountBasis]);

        // Conditional fields
        if (!businessRules.transactions.isPremiumTypeAtMaturity(loan.premiumType)) {
          ewcs.EWCS_premium_freq(k2Map.FACILITIES.FEE_FREQUENCY[loan.premiumFrequency]);
        }

        builder.addEWCS(ewcs);

        const conversionRate = loan.currencySameAsSupplyContractCurrency === 'true' ? 1 : loan.conversionRate;
        totalLoanValueContractCurrency += convertCurrencyFormat(loan.value) / conversionRate;

        const loanExposure = convertCurrencyFormat(loan.ukefExposure) / conversionRate;
        totalLoanExposure += loanExposure;
        totalLoanPremium += loanExposure * (loan.coveredPercentage / 100);
      }
    }

    // Summary data
    const gbpConversionRate = dealCurrencyId === 'GBP' ? 1 : deal.submissionDetails.supplyContractConversionRateToGBP;

    builder.Deal_no_facilities(bondCount + loanCount)
      .Deal_total_value_deal_cur(totalBondValueContractCurrency + totalLoanValueContractCurrency)
      .Deal_total_exposure_gbp((totalBondExposure + totalLoanExposure) / gbpConversionRate)
      .Deal_total_premium_gbp((totalBondPremium + totalLoanPremium) / gbpConversionRate)
      .Deal_total_exposure_deal_cur(totalBondExposure + totalLoanExposure)
      .Deal_total_premium_deal_cur(totalBondPremium + totalLoanPremium)

      .BSS_no_facilities(bondCount)
      .BSS_total_exposure_gbp(totalBondExposure / gbpConversionRate)
      .BSS_total_premium_gbp(totalBondPremium / gbpConversionRate)
      .BSS_total_exposure_deal_cur(totalBondExposure)
      .BSS_total_premium_deal_cur(totalBondPremium)

      .EWCS_no_facilities(loanCount)
      .EWCS_total_exposure_gbp(totalLoanExposure / gbpConversionRate)
      .EWCS_total_premium_gbp(totalLoanPremium / gbpConversionRate)
      .EWCS_total_exposure_deal_cur(totalLoanExposure)
      .EWCS_total_premium_deal_cur(totalLoanPremium);

    // Add Deal Files
    if (deal.dealFiles) {
      Object.entries(k2Map.DEAL.DEAL_FILES).forEach(([fieldname, xmlNodeName]) => {
        if (deal.dealFiles[fieldname]) {
          deal.dealFiles[fieldname].forEach(((df) => {
            builder.AddDealFile(xmlNodeName, df.type, df.filename);
          }));
        }
      });
    }
  }

  const typeAxmlStr = builder.build();

  // Validate XML against XSD schema
  const typeAxsd = fs.readFileSync(
    path.resolve(__dirname, './type-a-defs/type-a.xsd'),
    { encoding: 'utf8', flag: 'r' },
  );

  const parsedXml = libxml.parseXml(typeAxmlStr);
  const parsedXsd = libxml.parseXml(typeAxsd);

  if (parsedXml.errors.length) {
    return {
      typeAxmlStr,
      errorCount: parsedXml.errors.length,
    };
  }

  const ucActionName = actionName ? actionName.toUpperCase() : '';
  const filename = `${deal._id}_${ucActionName}`; // eslint-disable-line no-underscore-dangle

  const isValidXml = parsedXml.validate(parsedXsd);

  if (!isValidXml) {
    const errorList = parsedXml.validationErrors.map((ve) => ({ text: ve.message }));

    return {
      typeAxmlStr,
      filename,
      errorCount: parsedXml.validationErrors.length,
      errorList,
    };
  }

  return { typeAxmlStr, filename };
};

const createTypeA = async (deal, fromStatus) => {
  const {
    typeAxmlStr, filename, errorCount, errorList,
  } = await generateTypeA(deal, fromStatus);

  if (errorCount) {
    return {
      errorCount,
      errorList,
    };
  }

  const workflowConfig = fileshare.getConfig('workflow');
  const portalConfig = fileshare.getConfig('portal');

  const workflowFolder = `${workflowConfig.EXPORT_FOLDER}/${deal._id}`; // eslint-disable-line no-underscore-dangle
  const portalFolder = `${portalConfig.EXPORT_FOLDER}/${deal._id}`; // eslint-disable-line no-underscore-dangle

  const upload = {
    fileshare: 'workflow',
    folder: workflowFolder,
    filename: `${filename}.xml`,
    buffer: Buffer.from(typeAxmlStr, 'utf-8'),
  };

  const lockFile = {
    fileshare: 'workflow',
    folder: workflowFolder,
    filename: 'portal.lock',
    buffer: Buffer.from('', 'utf-8'),
  };

  await fileshare.uploadFile(lockFile);
  const dealUpload = await fileshare.uploadFile(upload);

  // Upload corresponding supporting docs
  const dealUploadPromises = [];
  if (deal.dealFiles) {
    Object.entries(deal.dealFiles).forEach(([field, fileList]) => {
      if (field === 'validationErrors' || field === 'security') { return; }

      fileList.forEach((file) => {
        dealUploadPromises.push(
          fileshare.copyFile({
            from: { fileshare: 'portal', folder: portalFolder, filename: file.filename }, // eslint-disable-line no-underscore-dangle
            to: { fileshare: 'workflow', folder: workflowFolder, filename: file.filename }, // eslint-disable-line no-underscore-dangle
          }),
        );
      });
    });
  }

  await Promise.all(dealUploadPromises);

  await fileshare.deleteFile('workflow', `${lockFile.folder}/${lockFile.filename}`);

  return dealUpload;
};

module.exports = { generateTypeA, createTypeA };
