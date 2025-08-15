const { isSalesforceCustomerCreationEnabled, isCountryUk } = require('@ukef/dtfs2-common');

const api = require('../api');

/**
 * Gets company information from Party URN
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<object>} Company information
 */
const getCompany = async (req, res) => {
  try {
    const { urn } = req.params;

    if (!urn) {
      return res.status(404).send(false);
    }

    const company = await api.getCompanyInfo(urn);

    if (!company) {
      console.error('Invalid company response received');
      return res.status(404).send(false);
    }

    return res.status(200).send(company);
  } catch (error) {
    console.error('Unable to get company from URN %o', error);
    return false;
  }
};

/**
 * Gets a PartyURN
 * @param {string} companyRegNo The company registration number
 * @param {string} companyName The company name
 * @param {string} probabilityOfDefault The probability of default
 * @param {boolean} isUkEntity Whether the party source country is UK or not
 * @param {number} code SIC industry sector code
 * @returns {Promise<string>} PartyURN or '' if there is an error
 */
const getPartyUrn = async ({ companyRegNo, companyName, probabilityOfDefault, isUkEntity, code }) => {
  let partyDbInfo = null;

  if (!companyRegNo) {
    console.error('An invalid company house registration number has been supplied');
    return '';
  }

  if (isSalesforceCustomerCreationEnabled()) {
    if (!companyName) {
      console.error('An invalid company name has been supplied');
      return '';
    }

    if (!probabilityOfDefault) {
      console.error('An invalid probability of default has been supplied');
      return '';
    }

    if (!code) {
      console.error('An invalid industry code has been supplied');
      return '';
    }

    partyDbInfo = await api.getOrCreatePartyDbInfo({ companyRegNo, companyName, probabilityOfDefault, isUkEntity, code });
  } else {
    partyDbInfo = await api.getPartyDbInfo({ companyRegNo });
  }

  if (!partyDbInfo) {
    console.error('No partyDbInfo returned');
    return '';
  }

  const partyUrn = partyDbInfo?.[0]?.partyUrn;

  if (partyUrn) {
    return partyUrn;
  }

  console.error('No PartyURN in response');
  return '';
};

const identifyDealParties = (deal) => ({
  hasExporter: Boolean(deal.exporter.companyName),
  hasBuyer: Boolean(deal.buyer && deal.buyer.name),
  hasIndemnifier: Boolean(deal.indemnifier && deal.indemnifier.name),
  hasAgent: Boolean(deal.eligibility && deal.eligibility.agentName),
});

/**
 * Adds party URNs to a deal's TFM parties object and updates the deal in the database.
 *
 * @async
 * @function addPartyUrns
 * @param {object} deal - The deal object to update.
 * @param {object} auditDetails - Details for auditing the update operation.
 * @returns {Promise<object|boolean>} The updated deal object with new TFM party URNs, or false if the deal is not provided.
 */
const addPartyUrns = async (deal, auditDetails) => {
  if (!deal?.exporter) {
    console.error('Adding party URN, invalid deal supplied');
    return false;
  }

  const { hasExporter, hasBuyer, hasIndemnifier, hasAgent } = identifyDealParties(deal);
  const {
    companiesHouseRegistrationNumber: companyRegNo,
    companyName,
    probabilityOfDefault,
    selectedIndustry: { code },
  } = deal.exporter;

  const isUkEntity = isCountryUk(deal.exporter.registeredAddress.country);

  const dealUpdate = {
    tfm: {
      ...deal.tfm,
      parties: {
        exporter: {
          partyUrn: await getPartyUrn({ companyRegNo, companyName, probabilityOfDefault, isUkEntity, code }),
          partyUrnRequired: hasExporter,
        },
        buyer: {
          partyUrn: '',
          partyUrnRequired: hasBuyer,
        },
        indemnifier: {
          partyUrn: '',
          partyUrnRequired: hasIndemnifier,
        },
        agent: {
          partyUrn: '',
          partyUrnRequired: hasAgent,
        },
      },
    },
  };

  const updatedDeal = await api.updateDeal({ dealId: deal._id, dealUpdate, auditDetails });

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};

module.exports = {
  getCompany,
  addPartyUrns,
  getPartyUrn,
  identifyDealParties,
};
