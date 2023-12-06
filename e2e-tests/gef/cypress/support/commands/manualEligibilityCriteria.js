/**
 * Set the application eligibility criteria to manual.
 * Accepts all the EC apart from `21`.
 */
import eligibility from '../../e2e/pages/automatic-cover';

const manualEligibilityCriteria = () => {
  eligibility.trueRadioButton(12).click();
  eligibility.trueRadioButton(13).click();
  eligibility.trueRadioButton(14).click();
  eligibility.trueRadioButton(15).click();
  eligibility.trueRadioButton(16).click();
  eligibility.trueRadioButton(17).click();
  eligibility.trueRadioButton(18).click();
  eligibility.trueRadioButton(19).click();
  eligibility.trueRadioButton(20).click();

  // Select `False`
  eligibility.falseRadioButton(21).click();
};

export default manualEligibilityCriteria;
