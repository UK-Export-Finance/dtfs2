import { AmendmentsEligibilityCriterionWithAnswer, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { validationErrorHandler } from '../../../server/utils/helpers';
import pageRenderer from '../../pageRenderer';
import { EligibilityViewModel } from '../../../server/types/view-models/amendments/eligibility-view-model.ts';

const page = 'partials/amendments/eligibility.njk';
const render = pageRenderer(page);

describe(page, () => {
  const previousPage = 'previousPage';
  const cancelUrl = 'cancelUrl';
  const criteria: AmendmentsEligibilityCriterionWithAnswer[] = [
    { id: 1, text: 'Test first criteria', textList: ['criterion 1 bullet point 1', 'criterion 1 bullet point 2'], answer: null },
    { id: 2, text: 'Test second criteria', answer: null },
    { id: 3, text: 'Test third criteria', textList: ['criterion 3 bullet point 1', 'criterion 3 bullet point 2', 'criterion 3 bullet point 3'], answer: null },
  ];
  const exporterName = 'exporterName';
  const facilityType = FACILITY_TYPE.CASH;
  const canMakerCancelAmendment = true;

  const params: EligibilityViewModel = {
    previousPage,
    cancelUrl,
    criteria,
    exporterName,
    facilityType,
    canMakerCancelAmendment,
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toContain('Eligibility');
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it(`should render the continue button`, () => {
    const wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="continue-button"]').toLinkTo(undefined, 'Continue');
  });

  it(`should render the cancel link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(cancelUrl, 'Cancel');
  });

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });

  it('should render the `Help with declarations` accordion', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="help-with-declarations"]').toContain('Help with declarations');
    wrapper
      .expectText('[data-cy="help-with-declarations"]')
      .toContain('Read the Master Guarantee Agreement (MGA) definitions and interpretation document for terminology used in the declarations.');
  });

  it('should render all the criteria descriptions', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="radio-wrapper-1"]').toContain('1. Test first criteria');
    wrapper.expectText('[data-cy="radio-wrapper-2"]').toContain('2. Test second criteria');
    wrapper.expectText('[data-cy="radio-wrapper-3"]').toContain('3. Test third criteria');
  });

  it('should render the textList as bullet points for each criterion if it exists', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="radio-wrapper-1"]').toContain('criterion 1 bullet point 1');
    wrapper.expectText('[data-cy="radio-wrapper-1"]').toContain('criterion 1 bullet point 2');

    wrapper.expectText('[data-cy="radio-wrapper-3"]').toContain('criterion 3 bullet point 1');
    wrapper.expectText('[data-cy="radio-wrapper-3"]').toContain('criterion 3 bullet point 2');
    wrapper.expectText('[data-cy="radio-wrapper-3"]').toContain('criterion 3 bullet point 3');
  });

  it('should render all the radio boxes unchecked', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="radios-criterion-1"]').toContain('True');
    wrapper.expectInput('[data-cy="true-radio-criterion-1"]').toNotBeChecked();

    wrapper.expectText('[data-cy="radios-criterion-1"]').toContain('False');
    wrapper.expectInput('[data-cy="false-radio-criterion-1"]').toNotBeChecked();

    wrapper.expectText('[data-cy="radios-criterion-2"]').toContain('True');
    wrapper.expectInput('[data-cy="true-radio-criterion-2"]').toNotBeChecked();

    wrapper.expectText('[data-cy="radios-criterion-2"]').toContain('False');
    wrapper.expectInput('[data-cy="false-radio-criterion-2"]').toNotBeChecked();

    wrapper.expectText('[data-cy="radios-criterion-3"]').toContain('True');
    wrapper.expectInput('[data-cy="true-radio-criterion-3"]').toNotBeChecked();

    wrapper.expectText('[data-cy="radios-criterion-3"]').toContain('False');
    wrapper.expectInput('[data-cy="false-radio-criterion-3"]').toNotBeChecked();
  });

  it('should render the radio boxes checked as per the passed in answers', () => {
    const criteriaWithAnswers: AmendmentsEligibilityCriterionWithAnswer[] = [
      { id: 1, text: 'Test first criteria', answer: true },
      { id: 2, text: 'Test second criteria', answer: false },
      { id: 3, text: 'Test third criteria', answer: null },
    ];

    const wrapper = render({ ...params, criteria: criteriaWithAnswers });

    wrapper.expectText('[data-cy="radios-criterion-1"]').toContain('True');
    wrapper.expectInput('[data-cy="true-radio-criterion-1"]').toBeChecked();

    wrapper.expectText('[data-cy="radios-criterion-1"]').toContain('False');
    wrapper.expectInput('[data-cy="false-radio-criterion-1"]').toNotBeChecked();

    wrapper.expectText('[data-cy="radios-criterion-2"]').toContain('True');
    wrapper.expectInput('[data-cy="true-radio-criterion-2"]').toNotBeChecked();

    wrapper.expectText('[data-cy="radios-criterion-2"]').toContain('False');
    wrapper.expectInput('[data-cy="false-radio-criterion-2"]').toBeChecked();

    wrapper.expectText('[data-cy="radios-criterion-3"]').toContain('True');
    wrapper.expectInput('[data-cy="true-radio-criterion-3"]').toNotBeChecked();

    wrapper.expectText('[data-cy="radios-criterion-3"]').toContain('False');
    wrapper.expectInput('[data-cy="false-radio-criterion-3"]').toNotBeChecked();
  });

  it('should not render the error summary if there is no error', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="error-summary"]').notToExist();
  });

  it('should not render any in-line errors if there are no errors', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="inline-error-criterion-1"]').notToExist();
    wrapper.expectElement('[data-cy="inline-error-criterion-2"]').notToExist();
    wrapper.expectElement('[data-cy="inline-error-criterion-3"]').notToExist();
  });

  it('should render the error summary if there is a single error', () => {
    const errMsg = 'error 2';
    const paramsWithError = {
      ...params,
      errors: validationErrorHandler([{ errRef: '2', errMsg }]),
    };

    const wrapper = render(paramsWithError);

    wrapper.expectText('[data-cy="error-summary"]').toContain(errMsg);
  });

  it('should render the error summary if there is more than one error', () => {
    const errMsgCriterion1 = 'error 1';
    const errMsgCriterion3 = 'error 3';
    const paramsWithError = {
      ...params,
      errors: validationErrorHandler([
        { errRef: '1', errMsg: errMsgCriterion1 },
        { errRef: '3', errMsg: errMsgCriterion3 },
      ]),
    };

    const wrapper = render(paramsWithError);

    wrapper.expectText('[data-cy="error-summary"]').toContain(errMsgCriterion1);
    wrapper.expectText('[data-cy="error-summary"]').toContain(errMsgCriterion3);
  });

  it('should render a single inline error if there is one field error', () => {
    const errMsgCriterion2 = 'error 2';
    const paramsWithError = {
      ...params,
      errors: validationErrorHandler([{ errRef: '2', errMsg: errMsgCriterion2 }]),
    };

    const wrapper = render(paramsWithError);

    wrapper.expectElement('[data-cy="inline-error-criterion-1"]').notToExist();
    wrapper.expectText('[data-cy="inline-error-criterion-2"]').toContain(errMsgCriterion2);
    wrapper.expectElement('[data-cy="inline-error-criterion-3"]').notToExist();
  });

  it('should render a multiple inline errors if there is more than one field error', () => {
    const errMsgCriterion1 = 'error 1';
    const errMsgCriterion3 = 'error 3';

    const paramsWithError = {
      ...params,
      errors: validationErrorHandler([
        { errRef: '1', errMsg: errMsgCriterion1 },
        { errRef: '3', errMsg: errMsgCriterion3 },
      ]),
    };

    const wrapper = render(paramsWithError);

    wrapper.expectText('[data-cy="inline-error-criterion-1"]').toContain(errMsgCriterion1);
    wrapper.expectElement('[data-cy="inline-error-criterion-2"]').notToExist();
    wrapper.expectText('[data-cy="inline-error-criterion-3"]').toContain(errMsgCriterion3);
  });
});
