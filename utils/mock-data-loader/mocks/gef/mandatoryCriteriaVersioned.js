const escape = require('escape-html');

const MANDATORY_CRITERIA_VERSIONED = [
  {
    version: 1.0,
    createdAt: new Date('2021-01-01T00:00'),
    updatedAt: null,
    isInDraft: false,
    title: 'test 1',
    htmlText: escape('<p class="govuk-body">Test is a mock test</p>'),
  },
  {
    version: 1.1,
    createdAt: new Date('2021-01-02T00:00'),
    updatedAt: null,
    isInDraft: false,
    title: 'test 2',
    htmlText: escape('<p class="govuk-body">Test is a mock test</p>'),
  },
  {
    version: 2,
    createdAt: new Date('2021-01-03T00:00'),
    updatedAt: null,
    isInDraft: false,
    title: 'Confirm eligiblity (mandatory criteria)',
    htmlText: escape(`<p class="govuk-body">You must confirm that all the following will be true for this application on the date that cover starts.</p>
    <p class="govuk-body">1. Your bank has received an exporter declaration and the bank team is not aware that any information contained in that exporter declaration is inaccurate in any material respect.</p>
    <p class="govuk-body">2. Your bank has complied with its policies and procedures in relation to the Facility.</p>
    <p class="govuk-body">3.  The exporter and its parent obligor (if any) is an eligible person.</p>
    <p class="govuk-body">4. Neither the exporter nor its UK parent obligor (if any) is an affected person.</p>
    <p class="govuk-body">5. The facility letter  is governed by laws of England and Wales, Scotland or Northern Ireland.</p>
    <p class="govuk-body">6. Your bank is the sole and legal beneficial owner of, and has good title to, the facility and any utilisations made thereunder.</p>
    <p class="govuk-body">7.a The bank has not made any disposals (other than a permitted disposal)  of its right, title and interest in the facility or any utilisation thereunder;</p>
    <p class="govuk-body">7b. The bank has not made any risk ransfer (other than a permitted risk transfer) to any person in relation to the facility or any utilisation thereunder.</p>
    <p class="govuk-body">8. The bank's right, title and interest in and to the facility, and any utilisation thereunder (including any indebtedness, obligation or liability of each obligor) is both:
      <ul>
        <li>free and clear of any security or quasi-security (other than permitted security)</li>
        <li>freely assignable by the bank without the need to obtain the consent of any obligor or other person</li>
      </ul>
    </p>
    <p class="govuk-body">9. Your bank is entitled to provide information and copies of records and documents to UK Export Finance including pursuant to clauses 13.2(d) (Information about Covered Facilities) and 13.3  (Inspection) and in particular it is not prevented or restricted in doing so by the terms of any agreement entered into with any Obligor.</p>
    <p class="govuk-body">10. The exporter is the only borrower under the relevant facility Letter.</p>
    <p class="govuk-body">11. The facility ketter satisfies either of  the following conditions:
      <ul>
        <li>utilisations under the facility Letter are payable on demand</li>
        <li>it provides that your bank has the right to accelerate the facility if any of the circumstances set out in paragraph 9.4 of the exporter declaration occur</li>
      </ul>
    </p>`),
  },
  {
    version: 0.1,
    createdAt: new Date('2021-01-04T00:00'),
    updatedAt: null,
    isInDraft: false,
    title: 'test 4 (old version)',
    htmlText: escape('<p class="govuk-body">Test is a mock test</p>'),
  },
  {
    version: 3.4,
    createdAt: new Date('2021-01-04T00:00'),
    updatedAt: null,
    isInDraft: true,
    title: 'test 5 (draft)',
    htmlText: escape('<p class="govuk-body">Test is a mock test</p>'),
  },
];

module.exports = MANDATORY_CRITERIA_VERSIONED;
