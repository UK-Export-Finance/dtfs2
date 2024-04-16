"use strict";
const companiesHouseError = (error) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    let errMsg;
    let errCode;
    let { status } = error.response;
    if (((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.data) === 'Invalid company registration number') {
        errMsg = 'Invalid Companies House registration number';
    }
    else {
        switch (((_e = (_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.errors) === null || _e === void 0 ? void 0 : _e.length) > 0 && ((_h = (_g = (_f = error.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.errors[0]) === null || _h === void 0 ? void 0 : _h.error)) {
            case 'company-profile-not-found':
                status = 422;
                errMsg = 'Invalid Companies House registration number';
                errCode = (_l = (_k = (_j = error.response) === null || _j === void 0 ? void 0 : _j.data) === null || _k === void 0 ? void 0 : _k.errors[0]) === null || _l === void 0 ? void 0 : _l.error;
                break;
            default:
                errMsg = 'There was a problem getting the Companies House registration number';
                errCode = (_p = (_o = (_m = error.response) === null || _m === void 0 ? void 0 : _m.data) === null || _o === void 0 ? void 0 : _o.errors[0]) === null || _p === void 0 ? void 0 : _p.error;
                break;
        }
    }
    return {
        status,
        response: [
            {
                status,
                errCode,
                errRef: 'regNumber',
                errMsg,
            },
        ],
    };
};
module.exports = {
    companiesHouseError,
};
