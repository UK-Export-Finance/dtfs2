import { clickBackLink } from './click-back-link';
import { clickCancelLink } from './click-cancel-link';
import { clickCancelButton } from './click-cancel-button';
import { clickContinueButton } from './click-continue-button';
import { clickSubmitButton } from './click-submit-button';

Cypress.Commands.add('clickBackLink', clickBackLink);
Cypress.Commands.add('clickCancelLink', clickCancelLink);
Cypress.Commands.add('clickCancelButton', clickCancelButton);
Cypress.Commands.add('clickContinueButton', clickContinueButton);
Cypress.Commands.add('clickSubmitButton', clickSubmitButton);
