/* eslint-disable no-restricted-syntax */
const api = require('../api');

const generateMandatoryCriteriaString = async (mandatoryVersionId) => {
  const { criteria } = await api.getGefMandatoryCriteriaByVersion(mandatoryVersionId);
  let output = '';
  if (criteria) {
    for (const criterion of criteria) {
      output += ` ${criterion.id.replaceAll('.', ' ')} ${criterion.body}\n\n`;
      if (criterion?.childList) {
        for (const text of criterion.childList) {
          output += `*${text}\n\n`;
          output += '\n\n';
        }
      }
    }
    output += '^True\n\n';
    output += '\n\n';
  }

  return output;
};

module.exports = { generateMandatoryCriteriaString };
