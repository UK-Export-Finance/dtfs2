const { validateAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./get-gef-deal.controller');
const { isNumber } = require('../../../../helpers');
const { updateDeal } = require('./update-deal');

exports.updateDealPut = async (req, res) => {
  const {
    params: { id: dealId },
    body: { dealUpdate, auditDetails },
  } = req;

  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  try {
    validateAuditDetails(auditDetails);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  try {
    return await findOneDeal(dealId, async (existingDeal) => {
      if (existingDeal) {
        const response = await updateDeal({ dealId, dealUpdate, auditDetails });
        const status = isNumber(response?.status, 3);
        const code = status ? response.status : 200;

        return res.status(code).json(response);
      }

      return res.status(404).send();
    });
  } catch (error) {
    console.error('Unable to update deal %o', error);
    return res.status(500).send({ status: 500, message: error });
  }
};
