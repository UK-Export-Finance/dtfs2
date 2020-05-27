const libxml = require('libxmljs');
const fs = require('fs');
const path = require('path');

const typeABuilder = require('./type-a-defs/type-a-builder');

const {
  eligibilityCriteriaHelper, convertCountryCodeToId, convertCurrencyCodeToId, businessRules, k2Map, dateHelpers,
} = require('./helpers');

module.exports.generateTypeA = async (deal) => {
  const builder = typeABuilder()
    .action_code('//TODO')
    .action_name('//TODO')
    .application_group('//TODO')
    .message_type('A')
    .revision_id('//TODO')
    .portal_deal_id(deal._id) // eslint-disable-line no-underscore-dangle
    .Deal_name(deal.details.bankSupplyContractName)
    .Bank_deal_id(deal.details.bankSupplyContractID)

    .Application_route(deal.eligibility)
    .Application_owner(deal.details.maker.username)
    .Application_owner_email('//TODO')
    .Application_bank('//TODO')
    .Application_bank_co_hse_reg_number('//TODO')

    .Customer_type(k2Map.ABOUT_DEAL.SUPPLIER_TYPE[deal.submissionDetails['supplier-type']])
    .Exporter_co_hse_reg_number(deal.submissionDetails['supplier-companies-house-registration-number'])
    .Exporter_registration_source('Companies House')
    .Exporter_name(deal.submissionDetails['supplier-name'])

    .Exporter_address_Line1(deal.submissionDetails['supplier-address-line-1'])
    .Exporter_address_Line2(deal.submissionDetails['supplier-address-line-2'])
    .Exporter_address_Line3(deal.submissionDetails['supplier-address-line-3'])
    .Exporter_address_Town(deal.submissionDetails['supplier-address-town'])
    .Exporter_address_PostalCode((deal.submissionDetails['supplier-address-postcode']))
    .Exporter_address_Country(await convertCountryCodeToId(deal.submissionDetails['supplier-address-country']))

    .Exporter_correspondence_address_Line1(deal.submissionDetails['supplier-correspondence-address-line-1'])
    .Exporter_correspondence_address_Line2(deal.submissionDetails['supplier-correspondence-address-line-2'])
    .Exporter_correspondence_address_Line3(deal.submissionDetails['supplier-correspondence-address-line-3'])
    .Exporter_correspondence_address_Town(deal.submissionDetails['supplier-correspondence-address-town'])
    .Exporter_correspondence_address_PostalCode(deal.submissionDetails['supplier-correspondence-address-postcode'])
    .Exporter_correspondence_address_Country(await convertCountryCodeToId((deal.submissionDetails['supplier-correspondence-address-country'])))

    .Industry_sector_code(deal.submissionDetails['industy-sector'] && deal.submissionDetails['industy-sector'].code)
    .Industry_sector_name(deal.submissionDetails['industy-sector'] && deal.submissionDetails['industy-sector'].name)
  // TODO confirm Industry_class_code & Industry_class_name correct fields - Drupal sets both to same value
    .Industry_class_code(deal.submissionDetails['industy-sector'] && deal.submissionDetails['industy-sector'].class && deal.submissionDetails['industy-sector'].class.code)
    .Industry_class_name(deal.submissionDetails['industy-sector'] && deal.submissionDetails['industy-sector'].class && deal.submissionDetails['industy-sector'].class.name)
    .Sme_type(k2Map.ABOUT_DEAL.SME_TYPE[deal.submissionDetails['sme-type'] || 'Not known'])
    .Description_of_export(deal.submissionDetails['supply-contract-description'])
    .Bank_security('//TODO')

    .Indemnifier_co_hse_reg_number(deal.submissionDetails['indemnifier-companies-house-registration-number'])
    .Indemnifier_name(deal.submissionDetails['indemnifier-name'])
    .Indemnifier_address_Line1(deal.submissionDetails['indemnifier-address-line-1'])
    .Indemnifier_address_Line2(deal.submissionDetails['indemnifier-address-line-2'])
    .Indemnifier_address_Line3(deal.submissionDetails['indemnifier-address-line-3'])
    .Indemnifier_address_Town(deal.submissionDetails['indemnifier-address-town'])
    .Indemnifier_address_PostalCode(deal.submissionDetails['indemnifier-address-country'])
    .Indemnifier_address_Country(await convertCountryCodeToId(deal.submissionDetails['indemnifier-companies-house-registration-number']))

    .Indemnifier_correspondence_address_Line1(deal.submissionDetails['indemnifier-correspondence-address-line-1'])
    .Indemnifier_correspondence_address_Line2(deal.submissionDetails['indemnifier-correspondence-address-line-2'])
    .Indemnifier_correspondence_address_Line3(deal.submissionDetails['indemnifier-correspondence-address-line-3'])
    .Indemnifier_correspondence_address_Town(deal.submissionDetails['indemnifier-correspondence-address-town'])
    .Indemnifier_correspondence_address_PostalCode(deal.submissionDetails['indemnifier-correspondence-address-postcode'])
    .Indemnifier_correspondence_address_Country(await convertCountryCodeToId(deal.submissionDetails['indemnifier-correspondence-address-country']))

    .Buyer_name('//TODO')
    .Buyer_country_code('//TODO')
    .Destination_country_code('//TODO')
    .Deal_currency_code('//TODO')
    .Conversion_rate('//TODO')
    .Conversion_date('//TODO')
    .Contract_value('//TODO')

    .Ec_agents_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 11))
    .Ec_agents_name(deal.eligibility.agentName)
    .Ec_agents_address_line_1(deal.eligibility.agentAddress1)
    .Ec_agents_address_line_2(deal.eligibility.agentAddress2)
    .Ec_agents_address_line_3(deal.eligibility.agentAddress3)
    .Ec_agents_address_town(deal.eligibility.agentTown)
    .Ec_agents_address_postal_code(deal.eligibility.agentPostcode)
    .Ec_agents_address_country(await convertCountryCodeToId(deal.eligibility.agentCountry))

    .Ec_initial_term_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 12))
    .Ec_total_exposure_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 13))
    .Ec_bond_issuance_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 14))
    .Ec_industry_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 16))
    .Ec_internal_approval_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 17))
    .Ec_banks_normal_pricing_policies_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 18))
    .Ec_requested_cover_start_date_check(eligibilityCriteriaHelper.isCriteriaSet(deal.eligibility, 15))

    .Deal_no_facilities('//TODO') // TODO
    .Deal_total_value_deal_cur('//TODO') // TODO
    .Deal_total_exposure_gbp('//TODO') // TODO
    .Deal_total_premium_gbp('//TODO') // TODO
    .Deal_total_exposure_deal_cur('//TODO') // TODO
    .Deal_total_premium_deal_cur('//TODO') // TODO

    .BSS_no_facilities('//TODO')
    .BSS_total_exposure_gbp('//TODO')
    .BSS_total_premium_gbp('//TODO')
    .BSS_total_exposure_deal_cur('//TODO')
    .BSS_total_premium_deal_cur('//TODO')

    .EWCS_no_facilities('//TODO')
    .EWCS_total_exposure_gbp('//TODO')
    .EWCS_total_premium_gbp('//TODO')
    .EWCS_total_exposure_deal_cur('//TODO')
    .EWCS_total_premium_deal_cur('//TODO');

  if (deal.bondTransactions && deal.bondTransactions.items) {
    for (let i = 0; i < deal.bondTransactions.items.length; i += 1) {
      const bond = deal.bondTransactions.items[i];
      const bss = builder.createBSS()
        .UKEF_BSS_facility_id('//TODO Drupal field: bss_ukef_facility_id')
        .BSS_portal_facility_id(bond._id) // eslint-disable-line no-underscore-dangle
        .BSS_issuer(bond.bondIssuer)
        .BSS_type(k2Map.TRANSACTIONS.TYPE[bond.bondType])
        .BSS_stage(k2Map.TRANSACTIONS.STAGE[bond.bondStage])
        .BSS_beneficiary(bond.bondBeneficiary)
        .BSS_value(bond.bondValue)
        .BSS_currency_code(
          await convertCurrencyCodeToId(bond.currency && bond.currency.id), // eslint-disable-line no-await-in-loop
        )
        .BSS_conversion_rate_deal('//TODO')
        .BSS_conversion_date_deal('//TODO')
        .BSS_fee_rate(bond.riskMarginFee)
        .BSS_fee_perc('// TODO - drupal field: guarantee_fee_')
        .BSS_guarantee_perc(bond.coveredPercentage)
        .BSS_max_liability('// TODO - drupal field: maximum_liability')
        .BSS_min_quarterly_fee(bond.minimumRiskMarginFee)
        .BSS_premium_type(k2Map.TRANSACTIONS.FEE_TYPE[bond.feeType])
        .BSS_cover_start_date(dateHelpers.formatDate(bond['requestedCoverStartDate-day'], bond['requestedCoverStartDate-month'], bond['requestedCoverStartDate-year']))
        .BSS_issue_date('//TODO - drupal field: issue_date')
        .BSS_cover_end_date(dateHelpers.formatDate(bond['coverEndDate-day'], bond['coverEndDate-month'], bond['coverEndDate-year']))
        .BSS_cover_period(bond.ukefGuaranteeInMonths)
        .BSS_day_basis(k2Map.TRANSACTIONS.DAY_COUNT_BASIS[bond.dayCountBasis]);

      // Conditional fields
      if (!businessRules.transactions.isPremiumTypeAtMaturity(bond.feeType)) {
        bss.BSS_premium_freq(k2Map.TRANSACTIONS.FEE_FREQUENCY[bond.feeFrequency]);
      }

      builder.addBSS(bss);
    }

    // TODO - Add Loans
  }

  const typeAxml = builder.build();

  // Validate XML against XSD schema
  const typeAxsd = fs.readFileSync(path.resolve(__dirname, './type-a-defs/type-a.xsd'),
    { encoding: 'utf8', flag: 'r' });

  const parsedXml = libxml.parseXml(typeAxml);
  const parsedXsd = libxml.parseXml(typeAxsd);

  if (parsedXml.errors.length) {
    return {
      ...typeAxml,
      errorCount: parsedXml.errors.length,
    };
  }

  const isValidXml = parsedXml.validate(parsedXsd);

  if (!isValidXml) {
    console.log(parsedXml.validationErrors);
    return {
      ...typeAxml,
      errorCount: parsedXml.validationErrors.length,
    };
  }

  return typeAxml;
};
