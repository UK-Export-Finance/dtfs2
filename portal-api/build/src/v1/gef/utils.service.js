"use strict";
exports.mongoStatus = (response) => {
    let status = 200;
    if (response.ok) {
        if (!response.value) {
            status = 204;
        }
    }
    else {
        status = 500;
    }
    return status;
};
const isSuperUser = (user) => user && user.bank && user.bank.id === '*';
exports.userHasAccess = (user, deal, roles = []) => {
    var _a, _b;
    // super-users can get at anything
    if (isSuperUser(user))
        return true;
    if (!((_a = user === null || user === void 0 ? void 0 : user.bank) === null || _a === void 0 ? void 0 : _a.id))
        return false;
    // if the deal has no bank ID for some reason
    if (!((_b = deal === null || deal === void 0 ? void 0 : deal.bank) === null || _b === void 0 ? void 0 : _b.id))
        return false;
    const hasRole = roles.some((role) => user.roles.includes(role));
    return user.bank.id === deal.bank.id && (!roles.length || hasRole);
};
