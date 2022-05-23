const { showAmendmentButton } = require('./amendments.helper');
const { generateHeadingText } = require('./generateHeadingText.helper');
const { mapDecisionObject, mapDecisionValue } = require('./mapDecisionObject.helper');
const { getGroup, getTask } = require('./tasks.helper');

module.exports = { showAmendmentButton, generateHeadingText, mapDecisionObject, mapDecisionValue, getGroup, getTask };
