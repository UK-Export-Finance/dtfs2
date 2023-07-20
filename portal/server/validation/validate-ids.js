const validator = require('validator');
const joi = require('joi');

/**
 * isValidMongoId
 * validates that a passed mongoId is a valid one
 * returns true if so, false if not valid
 * @param {String} mongoId
 * @returns {Boolean} Ascertain whether MongoID is valid or not.
 */
const isValidMongoId = (mongoId) => (mongoId ? validator.isMongoId(String(mongoId)) : false);

/**
 * isNotValidCompaniesHouseNumber
 * checks if companiesHouseNumber conforms to schema
 * returns true if validation error or false if not
 * @param {String} companiesHouseNumber
 * @returns {Boolean} Ascertain whether companiesHouseNumber is valid or not.
 */
const isNotValidCompaniesHouseNumber = (companiesHouseNumber) => {
  const schema = joi.string().alphanum().min(6).max(8)
    .required();

  const validation = schema.validate(companiesHouseNumber);

  return Boolean(validation.error);
};

module.exports = {
  isValidMongoId,
  isNotValidCompaniesHouseNumber,
};
