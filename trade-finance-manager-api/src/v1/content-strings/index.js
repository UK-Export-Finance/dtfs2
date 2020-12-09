const DEAL = {
  ELIGIBILITY_CRITERIA: {
    11: {
      description: 'There are no agents involved in the supply contract.',
      descriptionList: [],
    },
    12: {
      description: 'The cover period is less than either:',
      descriptionList: [
        '5 years',
        'another period approved by UKEF',
      ],
    },
    13: {
      description: 'The UKEF exposure for this exporter, across all short term schemes, is less than either:',
      descriptionList: [
        '£2 million',
        'another limit approved by UKEF',
      ],
    },
    14: {
      description: 'None of the following apply:',
      descriptionList: [
        'a bond has already been issued',
        'if a bond is issued, this was no more than 3 months before the bank submitted their application to UKEF',
        'a loan has already been advanced',
      ],
    },
    15: {
      description: 'The cover start date the bank has requested is not more than 3 months after the date they submitted their application to UKEF.',
      descriptionList: [],
    },
    16: {
      description: 'The supply contract does not involve one of the following controlled sectors:',
      descriptionList: [
        'sharp arms defence',
        'nuclear',
        'radiological',
        'biological',
        'human cloning',
        'pornography',
        'tobacco or gambling',
      ],
    },
    17: {
      description: 'The bank has completed due diligence to its own satisfaction, without needing to escalate to a relevant person.',
      descriptionList: [],
    },
    18: {
      description: 'The fees or interest apply to the whole cover period and have  been set in line with:',
      descriptionList: [
        'the bank’s normal pricing policies',
        'minimum or overall pricing requirements set by UKEF(if any)',
      ],
    },
  },
};

module.exports = {
  DEAL,
};
