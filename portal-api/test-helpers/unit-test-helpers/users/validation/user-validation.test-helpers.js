const { produce } = require('immer');

const createTestCasesFromRules = ({ allRules }) =>
  produce({}, (draft) => {
    Object.keys(allRules).forEach((ruleType) => {
      const testCaseName = `${ruleType}TestCases`;
      draft[testCaseName] = Object.entries(allRules[ruleType]).map(([description, rule]) => ({
        description,
        rule,
      }));
    });
  });

const getAllRulesFromAllRulesTestCases = ({ allRulesTestCases }) => [
  ...allRulesTestCases.expectedRulesTestCases.map((testCase) => testCase.rule),
  ...allRulesTestCases.otherRulesTestCases.map((testCase) => testCase.rule),
];

const mockRulesToNotReturnAnErrorSynchronously = ({ rules }) => {
  rules.forEach((rule) => {
    rule.mockReturnValue([]);
  });
};

const mockRulesToNotReturnAnErrorAsynchronously = ({ rules }) => {
  rules.forEach((rule) => {
    rule.mockResolvedValue([]);
  });
};

module.exports = {
  createTestCasesFromRules,
  getAllRulesFromAllRulesTestCases,
  mockRulesToNotReturnAnErrorSynchronously,
  mockRulesToNotReturnAnErrorAsynchronously,
};
