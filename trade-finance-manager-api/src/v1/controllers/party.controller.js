const { HttpStatusCode } = require('axios');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const api = require('../api');
const { createACBS } = require('./acbs.controller');
const canSubmitToACBS = require('../helpers/can-submit-to-acbs');

/**
 * Updates the parties in TFM associated with the deal.
 *
 * @param {object} req - The request object containing the parameters, body, and user information.
 * @param {object} res - The response object.
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
    const canSubmitDealToACBS = await canSubmitToACBS(tfmDeal);

    if (canSubmitDealToACBS) {
      await createACBS(dealId);
    }

    const response = res.status(HttpStatusCode.Ok).send({
      updateParty: {
        parties: tfmDeal.tfm.parties,
      },
    });

    return response;
  } catch (error) {
    console.error('Unable to update parties for deal %s %o', req.params.dealId, error);
    return res.status(HttpStatusCode.InternalServerError).send(error);
  }
};

module.exports = {
  updateParty,
};
