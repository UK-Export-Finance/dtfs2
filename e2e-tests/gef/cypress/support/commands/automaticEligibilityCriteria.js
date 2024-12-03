/**
 * Set the application eligibility criteria to automatic.
 * Accepts all the ECs.
 */
import eligibility from '../../e2e/pages/automatic-cover';

const automaticEligibilityCriteria = () => {
  eligibility.trueRadioButton(12).click();
  eligibility.trueRadioButton(13).click();
  eligibility.trueRadioButton(14).click();
  eligibility.trueRadioButton(15).click();
  eligibility.trueRadioButton(16).click();
  eligibility.trueRadioButton(17).click();
  eligibility.trueRadioButton(18).click();
  eligibility.trueRadioButton(19).click();
  eligibility.trueRadioButton(20).click();
  eligibility.trueRadioButton(21).click();
};

export default automaticEligibilityCriteria;
