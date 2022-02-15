/**
 * Generates an object from given field name and keyword value
 *
 * @param {string} fieldName
 * @param {string} keyword value
 * @example ( 'submissionType', 'Automatic' )
 * @returns { dealType: { $regex: 'Automatic', $options: 'i' } }
 */
const generateObject = (fieldName, keywordValue) => ({
  [fieldName]: {
    $regex: keywordValue, $options: 'i',
  },
});

/**
 * Generates an array of objects from given field names and keyword value
 *
 * @param {array} fields
 * @param {string} keyword value
 * @example ( ['dealType', 'submissionType' ], 'Automatic' )
 * @returns [ { dealType: { $regex: 'Automatic', $options: 'i' } }, { submissionType: { $regex: 'Automatic', $options: 'i' } } ]
 */
const generateKeywordQuery = (fields, keywordValue) =>
  fields.map((fieldName) =>
    generateObject(fieldName, keywordValue));

module.exports = {
  generateObject,
  generateKeywordQuery,
};
