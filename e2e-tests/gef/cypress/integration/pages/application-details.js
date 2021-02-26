
/* eslint-disable no-undef */
import relative from '../relativeURL';
import nameApplication from './name-application';

const ineligible = {
  nameApplicationSubmission: () => {
    cy.visit(relative('/gef/name-application'));
    nameApplication.internalRef().type('NEW_REF_NAME');
    nameApplication.form().submit();
  },
  applicationDetailsPage: () => cy.get('[data-cy="application-details-page"]'),
  captionHeading: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
};

export default ineligible;
