const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { findOneDeal, updateDeal } = require('./deal.controller');
const { userOwns } = require('../users/checks');
const validateNameChange = require('../validation/deal-name');

const updateName = async (dealId, to, user, auditDetails) => {
  const dealUpdate = {
    updatedAt: Date.now(),
    additionalRefName: to,
  };

  const updatedDeal = await updateDeal({ dealId, dealUpdate, user, auditDetails });

  return updatedDeal;
};

exports.update = (req, res) => {
  const {
    user,
    body: { additionalRefName },
    params: { id: dealId },
  } = req;

  const auditDetails = generatePortalAuditDetails(user._id);

  findOneDeal(dealId, async (deal) => {
    if (!deal) return res.status(404).send();
    if (!userOwns(user, deal)) return res.status(401).send();

    const validationErrors = validateNameChange(deal, additionalRefName);

    if (validationErrors) {
      return res.status(200).send({
        success: false,
        ...validationErrors,
      });
    }

    const dealAfterAllUpdates = await updateName(deal._id, additionalRefName, user, auditDetails);

    return res.status(200).send(dealAfterAllUpdates.additionalRefName);
  });
};
