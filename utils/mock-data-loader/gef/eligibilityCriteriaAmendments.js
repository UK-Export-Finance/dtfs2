const { FACILITY_TYPE } = require('@ukef/dtfs2-common');

const ELIGIBILITY_CRITERIA_AMENDMENTS = [
  {
    version: 1,
    isInDraft: false,
    facilityType: [FACILITY_TYPE.CASH, FACILITY_TYPE.CONTINGENT],
    createdAt: 1649876028968,
    criteria: [
      {
        id: 1,
        text: 'The Facility is not an Affected Facility',
      },
      {
        id: 2,
        text: 'Neither the Exporter, not its UK Parent Obligor is an Affected Person',
      },
      {
        id: 3,
        text: 'The Cover Period of the Facility is within the Facility Maximum Cover Period',
      },
      {
        id: 4,
        text: 'The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency) of the Facility is not more than the lesser of (i) the Available Master Guarantee Limit; and the Available Obligor(s) Limit',
      },
      {
        id: 5,
        text: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate any issue raised during its Bank Due Diligence internally to any Relevant Person for approval as part of its usual Bank Due Diligence',
      },
      {
        id: 6,
        text: 'The Bank is the sole and legal beneficial owner of, and has good title to, the Facility and any Utilisation thereunder.',
      },
      {
        id: 7,
        text: "The Bank's right, title and interest in and to the Facility and any Utilisation thereunder (including any indebtedness, obligation of liability of each Obligor) is free and clear of any Security or Quasi-Security (other than Permitted Security)",
      },
    ],
  },
];

module.exports = ELIGIBILITY_CRITERIA_AMENDMENTS;
