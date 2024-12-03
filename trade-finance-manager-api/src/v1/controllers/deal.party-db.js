const { isAutomaticSalesforceCustomerCreationFeatureFlagEnabled } = require('@ukef/dtfs2-common');

const api = require('../api');

/**
 * Gets company information from Party URN
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Object>} Company information
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
 * @returns {Promise<string>} PartyURN or '' if there is an error
 */
const getPartyUrn = async ({ companyRegNo, companyName }) => {
  if (!companyRegNo) {
    return '';
  }

  let partyDbInfo = null;
  if (isAutomaticSalesforceCustomerCreationFeatureFlagEnabled()) {
    if (!companyName) {
      return '';
    }

    partyDbInfo = await api.getOrCreatePartyDbInfo({ companyRegNo, companyName });
  } else {
    partyDbInfo = await api.getPartyDbInfo({ companyRegNo });
  }
  if (!partyDbInfo) {
    return '';
  }

  return partyDbInfo?.[0]?.partyUrn || '';
};

const identifyDealParties = (deal) => ({
  hasExporter: Boolean(deal.exporter.companyName),
  hasBuyer: Boolean(deal.buyer && deal.buyer.name),
  hasIndemnifier: Boolean(deal.indemnifier && deal.indemnifier.name),
  hasAgent: Boolean(deal.eligibility && deal.eligibility.agentName),
});

const addPartyUrns = async (deal, auditDetails) => {
  if (!deal) {
    return false;
  }

  const { hasExporter, hasIndemnifier, hasAgent, hasBuyer } = identifyDealParties(deal);

  const dealUpdate = {
    tfm: {
      ...deal.tfm,
      parties: {
        exporter: {
          partyUrn: await getPartyUrn({ companyRegNo: deal.exporter.companiesHouseRegistrationNumber, companyName: deal.exporter.companyName }),
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
};
