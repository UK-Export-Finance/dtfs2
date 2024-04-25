const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-details');
const { HttpStatusCode } = require('axios');

const api = require('../api');
const submitDealToACBS = require('../helpers/submit-deal-acbs');

/**
 * Updates the parties in TFM associated with the deal.
 *
 * @param {Object} req - The request object containing the parameters, body, and user information.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with the updated parties data.
 */
const updateParty = async (req, res) => {
  try {
    const { dealId } = req.params;
    const dealUpdate = {
      tfm: {
        parties: req.body,
      },
    };

    const auditDetails = generateTfmAuditDetails(req.user._id);
    const tfmDeal = await api.updateDeal({ dealId, dealUpdate, auditDetails });

    if (tfmDeal) {
      await submitDealToACBS(tfmDeal);
    }

    return res.status(HttpStatusCode.Ok).send({
      updateParty: {
        parties: tfmDeal.tfm.parties,
      },
    });
  } catch (error) {
    console.error('Unable to update parties for deal %s %o', req.params.dealId, error);
    return res.status(HttpStatusCode.InternalServerError).send(error);
  }
};

module.exports = {
  updateParty,
};
