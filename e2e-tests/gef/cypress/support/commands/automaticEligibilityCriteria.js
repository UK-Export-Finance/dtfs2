/**
 * Set the application eligibility criteria to automatic.
 * Accepts all the ECs.
 */
import { automaticCover } from '../../e2e/pages/automatic-cover';

export const automaticEligibilityCriteria = () => {
  automaticCover.trueRadioButton(12).click();
  automaticCover.trueRadioButton(13).click();
  automaticCover.trueRadioButton(14).click();
  automaticCover.trueRadioButton(15).click();
  automaticCover.trueRadioButton(16).click();
  automaticCover.trueRadioButton(17).click();
  automaticCover.trueRadioButton(18).click();
  automaticCover.trueRadioButton(19).click();
  automaticCover.trueRadioButton(20).click();
  automaticCover.trueRadioButton(21).click();
};
