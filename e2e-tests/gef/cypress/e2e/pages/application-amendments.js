const cyGetAmendmentsSummaryList = (summaryIndex) => cy.get('[data-cy="submitted-amendment-summary-list"]').eq(summaryIndex - 1);

const cyGetAmendmentsSummaryListRowByKey = (summaryIndex, keyText) =>
  cyGetAmendmentsSummaryList(summaryIndex).contains('.govuk-summary-list__key', keyText).parent();

const cyGetAmendmentsSummaryListValueByKey = (summaryIndex, keyText) =>
  cyGetAmendmentsSummaryListRowByKey(summaryIndex, keyText).find('.govuk-summary-list__value');

const applicationAmendments = {
  subNavigationBarAmendments: () => cy.get('[data-cy="application-amendments-link"]'),
  tabHeading: () => cy.get('[data-cy="tab-heading"]'),
  amendmentDetailsLink: () => cy.get('[data-cy="amendment-details-link"]'),

  summaryList: (index) => ({
    facilityIdRow: () => cyGetAmendmentsSummaryListRowByKey(index, 'Facility ID').find('.govuk-summary-list__key'),
    facilityIdValue: () => cyGetAmendmentsSummaryListValueByKey(index, 'Facility ID'),

    facilityTypeRow: () => cyGetAmendmentsSummaryListRowByKey(index, 'Facility type').find('.govuk-summary-list__key'),
    facilityTypeValue: () => cyGetAmendmentsSummaryListValueByKey(index, 'Facility type'),

    statusRow: () => cyGetAmendmentsSummaryListRowByKey(index, 'Status').find('.govuk-summary-list__key'),
    statusValue: () => cyGetAmendmentsSummaryListValueByKey(index, 'Status'),

    newCoverEndDateRow: () => cyGetAmendmentsSummaryListRowByKey(index, 'New cover end date').find('.govuk-summary-list__key'),
    newCoverEndDateValue: () => cyGetAmendmentsSummaryListValueByKey(index, 'New cover end date'),

    newFacilityEndDateRow: () => cyGetAmendmentsSummaryListRowByKey(index, 'New facility end date').find('.govuk-summary-list__key'),
    newFacilityEndDateValue: () => cyGetAmendmentsSummaryListValueByKey(index, 'New facility end date'),

    newFacilityValueRow: () => cyGetAmendmentsSummaryListRowByKey(index, 'New facility value').find('.govuk-summary-list__key'),
    newFacilityValueValue: () => cyGetAmendmentsSummaryListValueByKey(index, 'New facility value'),

    effectiveFromRow: () => cyGetAmendmentsSummaryListRowByKey(index, 'Date effective from').find('.govuk-summary-list__key'),
    effectiveFromValue: () => cyGetAmendmentsSummaryListValueByKey(index, 'Date effective from'),

    createdByRow: () => cyGetAmendmentsSummaryListRowByKey(index, 'Amendment created by').find('.govuk-summary-list__key'),
    createdByValue: () => cyGetAmendmentsSummaryListValueByKey(index, 'Amendment created by'),
  }),
};

module.exports = applicationAmendments;
