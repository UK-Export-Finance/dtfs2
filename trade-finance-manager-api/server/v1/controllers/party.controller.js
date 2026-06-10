const { HttpStatusCode } = require('axios');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { canSendToApimGift, sendFacilitiesToApimGift } = require('../integrations/apim-gift');
const api = require('../api');
const { createACBS } = require('./acbs.controller');
const canSubmitToACBS = require('../helpers/can-submit-to-acbs');

/**
 * 1) Update the parties in TFM associated with the deal.
 * 2) If the deal's facilities can be submitted to APIM/GIFT, submit to APIM/GIFT.
 * 3) If the deal can be submitted to ACBS, submit to ACBS.
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

    // Send facilities to APIM/GIFT
    const { canSendFacilitiesToApimGift, issuedFacilities, isBssEwcsDeal, isGefDeal } = await canSendToApimGift(tfmDeal);

    if (canSendFacilitiesToApimGift) {
      console.info('TFM deal %s updateParty - calling sendFacilitiesToApimGift', dealId);

      try {
        await sendFacilitiesToApimGift({
          deal: tfmDeal,
          facilities: issuedFacilities,
          isBssEwcsDeal,
          isGefDeal,
        });
      } catch (error) {
        console.error('TFM deal %s updateParty - sendFacilitiesToApimGift failed %o', dealId, error);

        throw error;
      }
    }

    // Submit to ACBS
    const canSubmitDealToACBS = await canSubmitToACBS({ deal: tfmDeal });

    if (canSubmitDealToACBS) {
      console.info('TFM deal %s updateParty - calling createACBS', dealId);

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
