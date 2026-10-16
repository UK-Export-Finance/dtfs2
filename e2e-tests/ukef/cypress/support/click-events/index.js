import { clickSubmitButton } from '../../../../tfm/cypress/support/click-events/click-submit-button';
import { clickContinueButton } from '../../../../tfm/cypress/support/click-events/click-continue-button';
import { clickBackLink } from '../../../../tfm/cypress/support/click-events/click-back-link';
import { clickCancelLink } from '../../../../tfm/cypress/support/click-events/click-cancel-link';
import { clickReturnToMakerButton } from '../../../../tfm/cypress/support/click-events/click-return-to-maker-button';

Cypress.Commands.add('clickSubmitButton', clickSubmitButton);
Cypress.Commands.add('clickContinueButton', clickContinueButton);
Cypress.Commands.add('clickBackLink', clickBackLink);
Cypress.Commands.add('clickCancelLink', clickCancelLink);
Cypress.Commands.add('clickReturnToMakerButton', clickReturnToMakerButton);
