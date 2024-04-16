"use strict";
const tslib_1 = require("tslib");
const utils = require('../../utils/array');
const externalApi = require('../../external-api/api');
const findOneCurrency = (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return externalApi.currencies.getCurrency(id); });
exports.findOneCurrency = findOneCurrency;
exports.findAll = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const currencies = yield externalApi.currencies.getCurrencies();
    res.status(200).send({
        count: currencies.length,
        currencies: utils.sortArrayAlphabetically(currencies, 'id'),
    });
});
exports.findOne = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const response = yield findOneCurrency(req.params.id);
    const { status, data } = response;
    if (data) {
        return res.status(status).send(data);
    }
    return res.status(status).send({});
});
