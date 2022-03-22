const ELIGIBILITY_CRITERIA = [
  {
    version: 1,
    isInDraft: false,
    createdAt: '2021-01-02T00:00',
    terms: [{
      text: 'This one shouldn\'t show as it\'s an old version',
      errMsg: 'This one shouldn\'t show as it\'s an old version',
    }],
  },
  {
    version: 2,
    isInDraft: false,
    createdAt: '2022-03-22T00:00',
    terms: [
      {
        id: 12,
        name: 'coverStart',
        text: 'The period between the Cover Start Date and the Cover End Date does not exceed the Facility Maximum Cover Period.',
        errMsg: 'Select if the Maximum Cover period has been exceeded',
      },
      {
        id: 13,
        name: 'noticeDate',
        text: 'The period between the Inclusion Notice Date and the Requested Cover Start Date does not exceed 3 months (or such longer period as may be agreed by UK Export Finance).',
        errMsg: 'Select if the period between the Inclusion Notice Date and the Requested Cover Start Date exceeds 3 months (or any other period agreed by UK Export Finance)',
      },
      {
        id: 14,
        name: 'facilityLimit',
        text: 'The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency ) of the facility is not more than the lesser of:',
        textList: [
          'the Available Master Guarantee Limit; and',
          'the Available Obligor\'s limit',
        ],
        errMsg: 'Select if the Covered Facility Limit is not more than the lowest of either of the 2 options',
      },
      {
        id: 15,
        name: 'exporterDeclaration',
        text: 'The  Bank  has  received  an  Exporter  Declaration  which  confirms  that  the  Exporter  is  not involved  with  any  of  the  following  industry  sectors:  sharp  arms  defence,  nuclear radiological, biological, human cloning, pornography, gambling, tobacco, coal, oil, gas or fossil fuel energy and the Bank Team is not aware that any information contained in that Exporter Declaration is inaccurate in any material respect.',
        errMsg: 'Select if the Bank has received an Exporter Declaration and the Exporter is not involved in any of the listed sectors',
      },
      {
        id: 16,
        name: 'revenueThreshold',
        text: 'The Bank has received an Exporter Declaration which confirms that the Exporter\'s Revenue Threshold Test Percentage (as defined in the relevant Exporter Declaration) is below 5%.',
        errMsg: 'Select if the Bank has received an Exporter Declaration which confirms that the Exporter\'s Revenue Threshold Test Percentage (as defined in the relevant Exporter Declaration) is below 5%.',
      },
      {
        id: 17,
        name: 'dueDiligence',
        text: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate any issue raised during its Bank Due Diligence  internally  to  any  Relevant  Person  for  approval  as  part  of  its  usual  Bank  Due Diligence.',
        errMsg: 'Select if the Bank has completed its Due Diligence',
      },
      {
        id: 18,
        name: 'facilityLetter',
        text: 'Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee:',
        textList: [
          'has been set in accordance with the Bank\'s normal pricing policies consistently applied;',
          'has been set in accordance with the overall minimum pricing requirements, if any, most recently notified by UK Export Finance to the Bank;',
          '(where the Covered Facility Limit in relation to the Facility is more than the Available Obligor(s) Limit) has been set in accordance with the overall pricing requirements, if any, most recently notified by UK Export Finance to the Bank for the relevant Obligor(s); and',
          '(in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee cover the whole Cover Period of the Covered Facility',
        ],
        errMsg: 'Select if the Facility Letter satisfies the following conditions',
      },
      {
        id: 19,
        name: 'facilityBaseCurrency',
        text: 'Facility Base Currency satisfies the following conditions: is denominated in an Approved Payment Currency.',
        errMsg: 'Select if the Facility Base Currency satisfies the condition',
      },
      {
        id: 20,
        name: 'facilityPaymentCurrency',
        text: 'Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and (in the case of a Contingent Facility) any Risk Margin Fee, is denominated in an Approved Payment Currency.',
        errMsg: 'Select if the Facility Letter satisfies the condition',
      },
    ],
  },
  {
    version: 3,
    isInDraft: true,
    createdAt: '2021-01-02T00:00',
    terms: [
      {
        id: 12,
        text: 'This one shouldn\'t show as it\'s in draft',
        errMsg: 'This one shouldn\'t show as it\'s in draft',
      },
    ],
  },
];

module.exports = ELIGIBILITY_CRITERIA;
