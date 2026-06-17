const { HttpStatusCode } = require('axios');
const { canSendToApimGift, sendFacilitiesToApimGift } = require('../integrations/apim-gift');

/**
 * Temporary local testing endpoint.
 * Intentionally exposed on openRouter (API key only) so JWT auth can be bypassed locally.
 */
const sendFacilitiesToApimGiftTemp = async (req, res) => {
  try {
    const { deal, facility, newPartyUrnCreated = false } = req.body || {};

    if (!deal || !facility) {
      return res.status(HttpStatusCode.BadRequest).send({ data: 'Request body must include deal and facility' });
    }

    const { canSendFacilitiesToApimGift, isBssEwcsDeal, isGefDeal } = await canSendToApimGift(deal);

    if (!canSendFacilitiesToApimGift) {
      return res.status(HttpStatusCode.Ok).send({
        canSendFacilitiesToApimGift: false,
        sentToApimGift: false,
        facilitiesSent: 0,
      });
    }

    const sendResult = await sendFacilitiesToApimGift({
      deal,
      facilities: [facility],
      isBssEwcsDeal,
      isGefDeal,
      newPartyUrnCreated,
    });

    // eslint-disable-next-line no-nested-ternary
    const facilitiesSent = Array.isArray(sendResult) ? sendResult.length : sendResult ? 1 : 0;

    return res.status(HttpStatusCode.Ok).send({
      canSendFacilitiesToApimGift: true,
      sentToApimGift: facilitiesSent > 0,
      facilitiesSent,
      sendResult,
    });
  } catch (error) {
    console.error('Temporary APIM GIFT send endpoint failed for deal %s %o', req.body?.deal?._id, error);

    return res.status(HttpStatusCode.InternalServerError).send({ data: 'Unable to send facilities to APIM GIFT' });
  }
};

module.exports = {
  sendFacilitiesToApimGiftTemp,
};
