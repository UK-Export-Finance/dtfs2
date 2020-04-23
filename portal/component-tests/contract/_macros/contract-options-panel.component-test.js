const component = require('../../component');
const componentLocation = 'contract/_macros/contract-options-panel.njk';

const render = component(componentLocation).render;

describe(componentLocation, () => {
  let $;
  let user, deal;

  describe('viewed by a maker', () => {
    beforeAll( () => {
      user = {roles: ['maker']};
    })

    describe("viewing a deal in status=Draft", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Draft"}};
        $ = render(deal, user);
      });

      it('Text is displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').text() ).toEqual('You may now proceed to submit an Automatic Inclusion Notice.');
      });

      it('Proceed to Review button is enabled', () => {
        expect( $('[data-cy="ProceedToReview"]').attr('href') ).toEqual('/contract/1/ready-for-review');
        expect( $('[data-cy="ProceedToReview"]').prop('disabled') ).toEqual(false);
      });

      it('Abandon button is enabled', () => {
        expect( $('[data-cy="Abandon"]').attr('href') ).toEqual('/contract/1/delete');
        expect( $('[data-cy="Abandon"]').prop('disabled') ).toEqual(false);
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Further Maker's input required", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Further Maker's input required"}};
        $ = render(deal, user);
      });

      it('Text is displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').text() ).toEqual('You may now proceed to submit an Automatic Inclusion Notice.');
      });

      it('Proceed to Review button is enabled', () => {
        expect( $('[data-cy="ProceedToReview"]').attr('href') ).toEqual('/contract/1/ready-for-review');
        expect( $('[data-cy="ProceedToReview"]').prop('disabled') ).toEqual(false);
      });

      it('Abandon button is enabled', () => {
        expect( $('[data-cy="Abandon"]').attr('href') ).toEqual('/contract/1/delete');
        expect( $('[data-cy="Abandon"]').prop('disabled') ).toEqual(false);
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Abandoned Deal", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Abandoned Deal"}};
        $ = render(deal, user);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Abandon button is disabled', () => {
        expect( $('[data-cy="Abandon"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="Abandon"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Review button is disabled', () => {
        expect( $('[data-cy="ProceedToReview"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ProceedToReview"]').prop('disabled') ).toEqual(true);
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Acknowledged by UKEF", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Acknowledged by UKEF"}};
        $ = render(deal, user);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Abandon button is disabled', () => {
        expect( $('[data-cy="Abandon"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="Abandon"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Review button is disabled', () => {
        expect( $('[data-cy="ProceedToReview"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ProceedToReview"]').prop('disabled') ).toEqual(true);
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Accepted by UKEF (without conditions)", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Accepted by UKEF (without conditions)"}};
        $ = render(deal, user);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Abandon button is disabled', () => {
        expect( $('[data-cy="Abandon"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="Abandon"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Review button is enabled', () => {
        expect( $('[data-cy="ProceedToReview"]').attr('href') ).toEqual('/contract/1/ready-for-review');
        expect( $('[data-cy="ProceedToReview"]').prop('disabled') ).toEqual(false);
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Accepted by UKEF (with conditions)", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Accepted by UKEF (with conditions)"}};
        $ = render(deal, user);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Abandon button is disabled', () => {
        expect( $('[data-cy="Abandon"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="Abandon"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Review button is enabled', () => {
        expect( $('[data-cy="ProceedToReview"]').attr('href') ).toEqual('/contract/1/ready-for-review');
        expect( $('[data-cy="ProceedToReview"]').prop('disabled') ).toEqual(false);
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Ready for Checker's approval", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Ready for Checker's approval"}};
        $ = render(deal, user);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Abandon button is disabled', () => {
        expect( $('[data-cy="Abandon"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="Abandon"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Review button is disabled', () => {
        expect( $('[data-cy="ProceedToReview"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ProceedToReview"]').prop('disabled') ).toEqual(true);
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Submitted", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Submitted"}};
        $ = render(deal, user);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Rejected by UKEF", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Rejected by UKEF"}};
        $ = render(deal, user);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });
    });


  });

  describe('viewed by a checker', () => {
    beforeAll( () => {
      user = {roles: ['checker']};
    })

    describe("viewing a deal in status=Draft", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Draft"}};
        $ = render(deal, user);
      });

      it('Return To Maker should be disabled', () => {
        expect( $('[data-cy="ReturnToMaker"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ReturnToMaker"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Submit should be disabled', () => {
        expect( $('[data-cy="ProceedToSubmit"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ProceedToSubmit"]').prop('disabled') ).toEqual(true);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });

    });

    describe("viewing a deal in status=Further Maker's input required", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Further Maker's input required"}};
        $ = render(deal, user);
      });

      it('Return To Maker should be disabled', () => {
        expect( $('[data-cy="ReturnToMaker"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ReturnToMaker"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Submit should be disabled', () => {
        expect( $('[data-cy="ProceedToSubmit"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ProceedToSubmit"]').prop('disabled') ).toEqual(true);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Abandoned Deal", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Abandoned Deal"}};
        $ = render(deal, user);
      });

      it('Return To Maker should be disabled', () => {
        expect( $('[data-cy="ReturnToMaker"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ReturnToMaker"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Submit should be disabled', () => {
        expect( $('[data-cy="ProceedToSubmit"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ProceedToSubmit"]').prop('disabled') ).toEqual(true);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Acknowledged by UKEF", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Acknowledged by UKEF"}};
        $ = render(deal, user);
      });

      it('Return To Maker should be disabled', () => {
        expect( $('[data-cy="ReturnToMaker"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ReturnToMaker"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Submit should be disabled', () => {
        expect( $('[data-cy="ProceedToSubmit"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ProceedToSubmit"]').prop('disabled') ).toEqual(true);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Accepted by UKEF (without conditions)", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Accepted by UKEF (without conditions)"}};
        $ = render(deal, user);
      });

      it('Return To Maker should be disabled', () => {
        expect( $('[data-cy="ReturnToMaker"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ReturnToMaker"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Submit should be disabled', () => {
        expect( $('[data-cy="ProceedToSubmit"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ProceedToSubmit"]').prop('disabled') ).toEqual(true);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Accepted by UKEF (with conditions)", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Accepted by UKEF (with conditions)"}};
        $ = render(deal, user);
      });

      it('Return To Maker should be disabled', () => {
        expect( $('[data-cy="ReturnToMaker"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ReturnToMaker"]').prop('disabled') ).toEqual(true);
      });

      it('Proceed to Submit should be disabled', () => {
        expect( $('[data-cy="ProceedToSubmit"]').attr('href') ).toBeUndefined();
        expect( $('[data-cy="ProceedToSubmit"]').prop('disabled') ).toEqual(true);
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Ready for Checker's approval", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Ready for Checker's approval"}};
        $ = render(deal, user);
      });

      it('Text is displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').text() ).toEqual("You may now proceed to submit an Automatic Inclusion Notice.");
      });

      it('User is prompted to review eligibility criteria', () => {
        expect( $('[data-cy="reviewEligibilityChecklistForm"]').attr('href') ).toEqual('/contract/1/eligibility/supporting-documentation');
      });

      it('Return To Maker should be enabled', () => {
        expect( $('[data-cy="ReturnToMaker"]').attr('href') ).toEqual('/contract/1/return-to-maker');
        expect( $('[data-cy="ReturnToMaker"]').prop('disabled') ).toEqual(false);
      });

      it('Proceed to Submit should be enabled', () => {
        expect( $('[data-cy="ProceedToSubmit"]').attr('href') ).toEqual('/contract/1/confirm-submission');
        expect( $('[data-cy="ProceedToSubmit"]').prop('disabled') ).toEqual(false);
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Submitted", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Submitted"}};
        $ = render(deal, user);
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });
    });

    describe("viewing a deal in status=Rejected by UKEF", () => {
      beforeAll( () => {
        deal = {_id:1, details:{status:"Rejected by UKEF"}};
        $ = render(deal, user);
      });

      it('Return To Maker should not be displayed', () => {
        expect( $('[data-cy="ReturnToMaker"]').html() ).toBeNull();
      });

      it('Proceed to Submit should not be displayed', () => {
        expect( $('[data-cy="ProceedToSubmit"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user can proceed', () => {
        expect( $('[data-cy="canProceed"]').html() ).toBeNull();
      });

      it('Text is not displayed saying the user cannot proceed', () => {
        expect( $('[data-cy="cannotProceed"]').html() ).toBeNull();
      });

      it('Proceed to Review button should not be displayed', () => {
        expect( $('[data-cy="ProceedToReview"]').html() ).toBeNull();
      });

      it('Abandon button should not be displayed', () => {
        expect( $('[data-cy="Abandon"]').html() ).toBeNull();
      });
    });

  });

})
