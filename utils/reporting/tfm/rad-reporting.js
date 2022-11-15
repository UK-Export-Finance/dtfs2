const deals = [];
const header = [
  'UKEF Deal ID',
  'Deal status',
  'Deal type',
  'Submission type',
  'Destination country',
  'Exporter name',
  'Exporter URN',
  'Guarantor',
  'Exporter credit rating',
  'Maximum liability (GBP)',
  'Approval level name',
  'Date approved',
  'Submission date',
];
const rows = [header];
const currency = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

/**
   * Strips commas and return UKEF exposure
   * as number.
   * @param {String} string
   * @returns {Integer} Formatted value
   */
const formatValue = (string) => {
  if (string) {
    return Number(string.toString().replace(/,/g, ''));
  }
  return string;
};

/**
   * Returns deal's total maximum liability in GBP.
   * @param {Array} facilities Array of facilities
   * @returns {Integer} Total of deal's maximum liability in GBP
   */
const getMaximumLiability = (facilities) => {
  if (facilities) {
    return facilities
      .map((f) => formatValue(f.ukefExposure) ?? 0)
      .reduce((p, c) => p + c, 0);
  }

  return 0;
};

/**
   * Returns filtered task as per `taskName`
   * @param {Object} tfm Deal TFM Object
   * @param {String} taskName Interested task name from `Approvals` task group
   * @returns {Array} Filtered task
   */
const filterTask = (tfm, taskName) => {
  if (tfm && taskName) {
    return tfm.tasks
      .filter((t) => t.groupTitle === 'Approvals')
      .map(({ groupTasks }) => groupTasks.filter((t) => t.title === taskName))
      .map((t) => t[0])[0];
  }

  return '';
};

// Process deals
deals.map((deal) => {
  if (deal) {
    const { dealSnapshot, tfm } = deal;
    const ukefDealId = dealSnapshot.ukefDealId ?? dealSnapshot.details.ukefDealId;
    const submissionDate = dealSnapshot.submissionDate ?? dealSnapshot.details.submissionDate;
    const destinationCountry = dealSnapshot.submissionDetails
      ? dealSnapshot.submissionDetails.destinationOfGoodsAndServices.name
      : '';
    const exporterName = dealSnapshot.exporter.companyName
        ?? dealSnapshot.submissionDetails['supplier-name'];
    const exporterUrn = tfm.parties.exporter.partyUrn;
    const { exporterCreditRating } = tfm;
    // Amalgamation of all facilities `facility.ukefExposure`
    const maximumLiability = getMaximumLiability(dealSnapshot.facilities);
    // `Complete risk analysis (RAD)` task
    const radTask = filterTask(tfm, 'Complete risk analysis (RAD)');
    const approver = radTask.assignedTo.userFullName ?? '';
    const approveDate = radTask.dateCompleted
      ? new Date(Number(radTask.dateCompleted.$numberLong))
      : '';

    rows.push([
      ukefDealId,
      tfm.stage,
      dealSnapshot.dealType,
      dealSnapshot.submissionType,
      destinationCountry,
      exporterName,
      exporterUrn,
      '',
      exporterCreditRating || '',
      currency.format(maximumLiability),
      approver,
      approveDate,
      new Date(Number(submissionDate)),
    ]);
  }

  return null;
});

// Output deals as HTML table
document.write('<table>');
rows.map((row) => {
  document.write('<tr>');
  row.map((cell) => {
    document.write(`<td>${cell}</td>`);
    return null;
  });
  document.write('</tr>');
  return null;
});
document.write('</table>');
