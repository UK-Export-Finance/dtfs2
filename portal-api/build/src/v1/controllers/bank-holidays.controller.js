"use strict";
const tslib_1 = require("tslib");
const externalApi = require('../../external-api/api');
const getBankHolidays = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const bankHolidays = yield externalApi.bankHolidays.getBankHolidays();
        res.status(200).send(bankHolidays);
    }
    catch (error) {
        console.error('Unable to get UK bank holidays %o', error);
        res.status(500).send({ status: 500, message: 'Failed to get UK bank holidays' });
    }
});
module.exports = {
    getBankHolidays,
};
