/**
 * Finds missing mandatory fields in the provided data object.
 *
 * @param {Object} data - The data object to check for missing fields.
 * @param {Array<string>} mandatoryFields - An array of field names that are mandatory.
 * @returns {Array<string>} - An array of missing mandatory field names. If all mandatory fields are present, returns an empty array.
 */

const findMissingMandatory = (data, mandatoryFields) => mandatoryFields.map((field) => (data[field] ? false : field)).filter((field) => field);

module.exports = {
  findMissingMandatory,
};
