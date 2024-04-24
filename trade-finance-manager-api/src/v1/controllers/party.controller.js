const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-details');

const api = require('../api');
const submitDealToACBS = require('../helpers/submit-deal-acbs');

const updateParty = async (req, res) => {
  const { dealId } = req.params;
  const dealUpdate = {
    tfm: {
      parties: req.body,
    },
  };

  try {
    const auditDetails = generateTfmAuditDetails(req.user._id);
    const tfmDeal = await api.updateDeal({ dealId, dealUpdate, auditDetails });

    console.log('====5', tfmDeal);

    if (tfmDeal) {
      await submitDealToACBS(tfmDeal);
    }

    return res.status(200).send({
      updateParty: {
        parties: tfmDeal.tfm.parties,
      },
    });
  } catch (error) {
    console.error('Unable to update parties for deal %s %o', dealId, error);
    return res.status(500).send(error.message);
  }
};

module.exports = {
  updateParty
};
