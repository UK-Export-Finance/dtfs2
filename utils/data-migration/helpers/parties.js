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
 * @param {Integer} data Data type to return: 0 = Name | 1 = URN
 * @returns {String} Meta data
 */
const party = async (id, type, data = 0) => {
  if (id && type) {
    const parties = await workflow(CONSTANTS.WORKFLOW.FILES.DEAL_PARTIES);

    return parties
      .filter(({ DEAL }) => DEAL['UKEF DEAL ID'] === id)
      .map(({ DEAL }) => {
        const { PARTY } = DEAL;

        if (PARTY.ROLE_TYPE === type) {
          switch (data) {
            case 1:
              return PARTY.URN;

            default:
              return PARTY.PARTY_NAME;
          }
        }

        return null;
      })
      .join('');
  }

  return '-';
};

module.exports = {
  party
};
