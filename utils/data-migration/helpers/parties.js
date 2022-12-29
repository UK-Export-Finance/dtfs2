/* eslint-disable no-restricted-syntax */
/**
 * Party helper functions are responsible for
 * fetching information from Workflow Deal and
 * facilities level parties.
 */

const CONSTANTS = require('../constant');
const { workflow } = require('./io');

/**
 * Returns party data filtered by UKEF deal ID
 * and type.
 * @param {String} id UKEF Deal ID
 * @param {String} type Party type: BANK | EXPORTER | BUYER
 * @param {Integer} data Data type to return: -1 = Party | 0 = Name | 1 = URN
 * @returns {String} Meta data
 */
const party = async (id, type, data = 0) => {
  if (id && type) {
    const parties = await workflow(CONSTANTS.WORKFLOW.FILES.DEAL_PARTIES);

    const deals = parties
      .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === id);

    for (const deal of deals) {
      const { DEAL } = deal;
      const { PARTY } = DEAL;

      if (PARTY.ROLE_TYPE === type) {
        switch (data) {
          case -1:
            return PARTY;
          case 1:
            return PARTY.URN;
          default:
            return PARTY.PARTY_NAME;
        }
      }
    }
  }

  return null;
};

/**
 * Returns country information
 * @param {String} Country Country name
 * @param {data} type Data type to return: 0 = ISO | 1 = ID
 */
const country = (Country, type = 0) => {
  if (Country) {
    return CONSTANTS.COUNTRIES
      .filter(({ name }) => name.trim().toLowerCase() === Country.trim().toLowerCase())
      .map((c) => {
        switch (type) {
          case 1:
            return c.id;
          default:
            return c.code;
        }
      })
      .join('');
  }

  return null;
};

module.exports = {
  party,
  country,
};
