"use strict";
const tslib_1 = require("tslib");
const { findOneDeal, updateDeal } = require('./deal.controller');
const { userOwns } = require('../users/checks');
const validateNameChange = require('../validation/deal-name');
const updateName = (dealId, to, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const modifiedDeal = {
        updatedAt: Date.now(),
        additionalRefName: to,
    };
    const updatedDeal = yield updateDeal(dealId, modifiedDeal, user);
    return updatedDeal;
});
exports.update = (req, res) => {
    const { user } = req;
    const { additionalRefName } = req.body;
    findOneDeal(req.params.id, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!deal)
            return res.status(404).send();
        if (!userOwns(user, deal))
            return res.status(401).send();
        const validationErrors = validateNameChange(deal, additionalRefName);
        if (validationErrors) {
            return res.status(200).send(Object.assign({ success: false }, validationErrors));
        }
        const dealAfterAllUpdates = yield updateName(deal._id, additionalRefName, req.user);
        return res.status(200).send(dealAfterAllUpdates.additionalRefName);
    }));
};
