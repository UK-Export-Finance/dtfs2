/* eslint-disable no-restricted-syntax */
const generateEligibilityCriteriaString = (criteria) => {
  let output = '';
  for (const criterion of criteria) {
    output += `${criterion.id}. ${criterion.text}\n\n`;
    if (criterion?.textList) {
      for (const child of criterion.textList) {
        output += `*${child}\n\n`;
      }
    }
    if (criterion.answer) {
      output += 'True\n\n';
    } else {
      output += 'False\n\n';
    }
    output += '\n\n';
  }

  return output;
};

module.exports = { generateEligibilityCriteriaString };
