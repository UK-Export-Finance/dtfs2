/**
 * Generates an object from given field name and keyword value
 *
 * @param {string} fieldName
 * @param {string} keyword value
 * @example ( 'submissionType', 'Automatic' )
 * @returns { dealType: { REGEX: 'Automatic', $options: 'mock' } }
 */
const generateObject = (fieldName, keywordValue) => ({
  [fieldName]: {
    REGEX: keywordValue, $options: 'mock',
  },
});

/**
 * Generates an array of objects from given field names and keyword value
 *
 * @param {array} fields
 * @param {string} keyword value
 * @example ( ['dealType', 'submissionType' ], 'Automatic' )
 * @returns [ { dealType: { REGEX: 'Automatic', $options: 'mock' } }, { submissionType: { REGEX: 'Automatic', $options: 'mock' } } ]
 */
const generateKeywordQuery = (fields, keywordValue) =>
  fields.map((fieldName) =>
    generateObject(fieldName, keywordValue));

module.exports = {
  generateObject,
  generateKeywordQuery,
};
