const SUPPORTING_DOCUMENTATION = [
  {
    fieldName: 'manualInclusionQuestionnaire',
    title: 'Manual Inclusion Questionnaire',
    description: 'Please upload a completed Manual Inclusion Questionnaire. You can download the template here: <a href="#" class="govuk-link">Manual Inclusion Questionnaire</a>',
    inputType: 'file'
  },
  {
    fieldName: 'auditedFinancialStatements',
    title: 'Financial statements for the past 3 years',
    description: 'Financial statements (audited if available) for the past 3 years, including a Profit & Loss, Balance Sheet and Cash Flow Statement, (with notes, if applicable). If the company is part of a larger group, separate accounts should be provided for the company and group.',
    inputType: 'file'
  },
  {
    fieldName: 'yearToDateManagement',
    title: 'Year to date management accounts',
    description: 'Including Profit & Loss, Balance Sheet and Cash Flow where available.',
    inputType: 'file'
  },
  {
    fieldName: 'financialForecasts',
    title: 'Financial forecasts for the next 3 years',
    description: 'Including monthly cash-flow projections for the business as a whole. If unavailable provide for at least the projected facility/guarantee term. If there are any cash flow shortfalls, explain how these will be filled.',
    inputType: 'file'
  },
  {
    fieldName: 'financialInformation',
    title: 'Brief commentary on the financial information',
    description: 'A brief commentary on the financial information in 2-4, with particular focus on turnover, gross and net profit, dividends (if any), debt profile including bank borrowing and net worth, and any other information with explains any exceptions, anomalies or volatility. If the company has experienced any unusual or off-trend financial performance in the last 3 years please also explain this.',
    inputType: 'file'
  },
  {
    fieldName: 'corporateStructureDiagram',
    title: 'Corporate structure diagram',
    description: 'Showing corporate structure including parent, subsidiary and associated companies.',
    inputType: 'file'
  },
  {
    fieldName: 'security',
    title: 'Security',
    description: 'Details of the overarching general facility taken by the bank in relation to the exporter, for example debenture, fixed and floating charge, but not including any security that is specific to the Transaction.',
    inputType: 'textarea'
  }
];

module.exports = SUPPORTING_DOCUMENTATION;
