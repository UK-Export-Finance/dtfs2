const log = require('../../helpers/logs');
const { getCountryById } = require('../helpers/countries');
const { getCurrencyById } = require('../helpers/currencies');
const { getIndustrySectorByCode, getIndustryClassByCode } = require('../helpers/industry-sectors');
const findPortalValue = require('./findPortalValue');

let hasError = false;
let portalId;

const logError = (error) => {
  hasError = true;
  log.addError(portalId, error);
};

const addressIsDifferent = (address1, address2) => {
  if (!address2.Line1) {
    return false;
  }

  return address1.Line1 !== address2.Line1
    || address1.Line2 !== address2.Line2
    || address1.Line3 !== address2.Line3
    || address1.PostalCode !== address2.PostalCode
    || address1.Country !== address2.Country;
};

const mapSubmissionsDetails = (portalDealId, v1Deal) => {
  portalId = portalDealId;

  const {
    Deal_information:
    {
      Exporter_and_indemnifier: exporterInfo,
      Buyer: buyer,
      Financial: financial,
    },
  } = v1Deal;

  const v1ExtraInfo = {
    exporterRegistrationSource: exporterInfo.Exporter_registration_source,
  };

  const supplierCorrespondenceAddressIsDifferent = addressIsDifferent(exporterInfo.Exporter_address, exporterInfo.Exporter_correspondence_address);
  const indemnifierLegallyDistinct = Boolean(exporterInfo.Indemnifier_name);

  const submissionDetails = {
    'supplier-type': findPortalValue(exporterInfo.Customer_type, 'Customer_type', 'DEAL', 'SUPPLIER_TYPE', logError),
    'supplier-companies-house-registration-number': exporterInfo.Exporter_co_hse_reg_number,
    'supplier-name': exporterInfo.Exporter_name,
    'supplier-address-country': getCountryById(exporterInfo.Exporter_address.Country),
    'supplier-address-line-1': exporterInfo.Exporter_address.Line1,
    'supplier-address-line-2': exporterInfo.Exporter_address.Line2,
    'supplier-address-line-3': exporterInfo.Exporter_address.Line3,
    'supplier-address-postcode': exporterInfo.Exporter_address.PostalCode,
    'supplier-address-town': exporterInfo.Exporter_address.Town,
    'supplier-correspondence-address-is-different': supplierCorrespondenceAddressIsDifferent.toString(),
    'sme-type': findPortalValue(exporterInfo.Sme_type, 'Sme_type', 'DEAL', 'SME_TYPE', logError),
    'supply-contract-description': exporterInfo.Description_of_export,
    legallyDistinct: indemnifierLegallyDistinct.toString(),
    'buyer-name': buyer.Buyer_name,
    'buyer-address-country': getCountryById(buyer.Buyer_country_code),
    destinationOfGoodsAndServices: getCountryById(buyer.Destination_country_code),
    supplyContractCurrency: getCurrencyById(financial.Deal_currency_code),
    supplyContractConversionRateToGBP: financial.Conversion_rate,
    supplyContractValue: financial.Contract_value,
    v1ExtraInfo,
  };

  if (exporterInfo.Industry_sector_code) {
    const industrySector = getIndustrySectorByCode(exporterInfo.Industry_sector_code, logError);

    if (industrySector) {
      submissionDetails['industry-sector'] = {
        code: industrySector.code,
        name: industrySector.name,
      };

      const industryClass = getIndustryClassByCode(industrySector.classes, exporterInfo.Industry_class_code, logError);

      if (industryClass) {
        submissionDetails['industry-class'] = {
          code: industryClass.code,
          name: industryClass.name,
        };
      }
    }
  }

  if (financial.Conversion_date) {
    // Conversion date in format dd-mm-yyyy
    submissionDetails.supplyContractConversionDate = financial.Conversion_date.replace(/-/g, '/');
    [
      submissionDetails['supplyContractConversionDate-day'],
      submissionDetails['supplyContractConversionDate-month'],
      submissionDetails['supplyContractConversionDate-year'],
    ] = financial.Conversion_date.split('-');
  }

  if (supplierCorrespondenceAddressIsDifferent) {
    submissionDetails['supplier-correspondence-address-country'] = getCountryById(exporterInfo.Exporter_correspondence_address.Country);
    submissionDetails['supplier-correspondence-address-line-1'] = exporterInfo.Exporter_correspondence_address.Line1;
    submissionDetails['supplier-correspondence-address-line-2'] = exporterInfo.Exporter_correspondence_address.Line2;
    submissionDetails['supplier-correspondence-address-line-3'] = exporterInfo.Exporter_correspondence_address.Line3;
    submissionDetails['supplier-correspondence-address-postcode'] = exporterInfo.Exporter_correspondence_address.PostalCode;
    submissionDetails['supplier-correspondence-address-town'] = exporterInfo.Exporter_correspondence_address.Town;
  }

  if (indemnifierLegallyDistinct) {
    submissionDetails['indemnifier-companies-house-registration-number'] = exporterInfo.Indemnifier_co_hse_reg_number;
    submissionDetails['indemnifier-name'] = exporterInfo.Indemnifier_name;
    submissionDetails['indemnifier-address-line-1'] = exporterInfo.Indemnifier_address.Line1;
    submissionDetails['indemnifier-address-line-2'] = exporterInfo.Indemnifier_address.Line2;
    submissionDetails['indemnifier-address-line-3'] = exporterInfo.Indemnifier_address.Line3;
    submissionDetails['indemnifier-address-town'] = exporterInfo.Indemnifier_address.Town;
    submissionDetails['indemnifier-address-postcode'] = exporterInfo.Indemnifier_address.PostalCode;
    submissionDetails['indemnifier-address-country'] = getCountryById(exporterInfo.Indemnifier_address.Country);

    const indemnifierCorrespondenceAddressDifferent = addressIsDifferent(exporterInfo.Indemnifier_address, exporterInfo.Indemnifier_correspondence_address);
    submissionDetails.indemnifierCorrespondenceAddressDifferent = indemnifierCorrespondenceAddressDifferent.toString();

    if (indemnifierCorrespondenceAddressDifferent) {
      submissionDetails['indemnifier-correspondence-address-line-1'] = exporterInfo.Indemnifier_correspondence_address.Line1;
      submissionDetails['indemnifier-correspondence-address-line-2'] = exporterInfo.Indemnifier_correspondence_address.Line2;
      submissionDetails['indemnifier-correspondence-address-line-3'] = exporterInfo.Indemnifier_correspondence_address.Line3;
      submissionDetails['indemnifier-correspondence-address-town'] = exporterInfo.Indemnifier_correspondence_address.Town;
      submissionDetails['indemnifier-correspondence-address-postcode'] = exporterInfo.Indemnifier_correspondence_address.PostalCode;
      submissionDetails['indemnifier-correspondence-address-country'] = getCountryById(exporterInfo.Indemnifier_correspondence_address.Country);
    }
  }

  return [
    submissionDetails,
    hasError,
  ];
};

module.exports = mapSubmissionsDetails;
