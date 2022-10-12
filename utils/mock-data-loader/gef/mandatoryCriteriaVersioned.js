const MANDATORY_CRITERIA_VERSIONED = [
  {
    version: 33,
    dealType: 'GEF',
    createdAt: new Date('2021-01-03T00:00'),
    updatedAt: null,
    isInDraft: false,
    title: 'Confirm eligibility (mandatory criteria)',
    introText: 'You must confirm that all the following will be true for this application on the date that cover starts.',
    criteria: [
      {
        id: '1',
        body: 'Your bank has received an exporter declaration and the bank team is not aware that any information contained in that exporter declaration is inaccurate in any material respect.',
      },
      {
        id: '2',
        body: 'Your bank has complied with its policies and procedures in relation to the Facility.',
      },
      {
        id: '3',
        body: 'The exporter and its parent obligor(if any) is an eligible person.',
      },
      {
        id: '4',
        body: 'Neither the exporter nor its UK parent obligor(if any) is an affected person.',
      },
      {
        id: '5',
        body: 'The facility letter is governed by laws of England and Wales, Scotland or Northern Ireland.',
      },
      {
        id: '6',
        body: 'Your bank is the sole and legal beneficial owner of, and has good title to, the facility and any utilisations made thereunder.',
      },
      {
        id: '7.a',
        body: 'The bank has not made any disposals(other than a permitted disposal)  of its right, title and interest in the facility or any utilisation thereunder;',
      },
      {
        id: '7.b',
        body: 'The bank has not made any risk transfer(other than a permitted risk transfer) to any person in relation to the facility or any utilisation thereunder.',
      },
      {
        id: '8',
        body: 'The bank\'s right, title and interest in and to the facility, and any utilisation thereunder(including any indebtedness, obligation or liability of each obligor) is both:',
        childList: [
          'free and clear of any security or quasi-security (other than permitted security)',
          'freely assignable by the bank without the need to obtain the consent of any obligor or other person',
        ]
      },
      {
        id: '9',
        body: 'Your bank is entitled to provide information and copies of records and documents to UK Export Finance including pursuant to clauses 13.2(d) (Information about Covered Facilities) and 13.3  (Inspection) and in particular it is not prevented or restricted in doing so by the terms of any agreement entered into with any Obligor.',
      },
      {
        id: '10',
        body: 'The exporter is the only borrower under the relevant facility Letter.',
      },
      {
        id: '11',
        body: 'The facility better satisfies either of  the following conditions:',
        childList: [
          'utilisations under the facility Letter are payable on demand',
          'it provides that your bank has the right to accelerate the facility if any of the circumstances set out in paragraph 9.4 of the exporter declaration occur',
        ],
      },
    ],
  }
];

module.exports = MANDATORY_CRITERIA_VERSIONED;
