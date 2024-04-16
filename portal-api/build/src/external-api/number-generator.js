"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNumber = void 0;
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const axios_1 = tslib_1.__importStar(require("axios"));
dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;
const headers = {
    'Content-Type': 'application/json',
    'x-api-key': String(EXTERNAL_API_KEY),
};
/**
 * Makes a POST request to an external-api microservice
 * to get a number from APIM MDM.
 * @param entityType - The type of entity.
 * @param dealId - The ID of the deal.
 * @returns A Promise that resolves to an AxiosResponse object.
 */
const getNumber = (entityType, dealId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!entityType || !dealId) {
            console.error('❌ Invalid argument provided %s %s', entityType, dealId);
            throw new Error(`Invalid argument provided for ${dealId}`);
        }
        const response = yield axios_1.default.post(`${EXTERNAL_API_URL}/number-generator`, {
            entityType,
            dealId,
        }, {
            headers,
        });
        if (!response.data) {
            console.error('❌ Invalid number generator response received from external-api for deal %s %o', dealId, response);
            throw new Error(`Invalid number generator response received from external-api for deal ${dealId}`, { cause: 'Invalid response from external-api' });
        }
        return response;
    }
    catch (error) {
        console.error('❌ Error sending payload to external-api microservice %o', error);
        return {
            status: axios_1.HttpStatusCode.InternalServerError,
            error,
        };
    }
});
exports.getNumber = getNumber;
