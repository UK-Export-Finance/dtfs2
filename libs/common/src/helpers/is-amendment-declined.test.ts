import { amendmentDeclined } from './is-amendment-declined';
import { AMENDMENT_TYPES, UNDERWRITER_MANAGER_DECISIONS } from '../constants';
import { TfmFacilityAmendmentWithUkefId } from '../types';

describe('amendmentDeclined', () => {
  const declined = [
    {
      changeFacilityValue: true,
      ukefDecision: {
        value: UNDERWRITER_MANAGER_DECISIONS.DECLINED,
      },
    },
    {
      changeCoverEndDate: true,
      ukefDecision: {
        coverEndDate: UNDERWRITER_MANAGER_DECISIONS.DECLINED,
      },
    },
    {
      changeFacilityValue: true,
      changeCoverEndDate: true,
      ukefDecision: {
        value: UNDERWRITER_MANAGER_DECISIONS.DECLINED,
        coverEndDate: UNDERWRITER_MANAGER_DECISIONS.DECLINED,
      },
    },
    {
      changeFacilityValue: false,
      changeCoverEndDate: true,
      ukefDecision: {
        value: UNDERWRITER_MANAGER_DECISIONS.DECLINED,
      },
    },
    {
      changeFacilityValue: true,
      changeCoverEndDate: false,
      ukefDecision: {
        coverEndDate: UNDERWRITER_MANAGER_DECISIONS.DECLINED,
      },
    },
  ];

  it.each(declined)('should return true if the UKEF decission is declined for when the UKEF decision is %s', (decision) => {
    // Arrange
    const mockAmendment = {
      amendmentId: '6597dffeb5ef5ff4267e5046',
      type: AMENDMENT_TYPES.PORTAL,
      ...decision,
    } as TfmFacilityAmendmentWithUkefId;

    // Act
    const respone = amendmentDeclined(mockAmendment);

    // Assert
    expect(respone).toBeTruthy();
  });

  const approved = [
    {
      changeCoverEndDate: true,
      ukefDecision: {
        coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
      },
    },
    {
      changeFacilityValue: true,
      ukefDecision: {
        value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
      },
    },
    {
      changeCoverEndDate: true,
      ukefDecision: {
        coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
      },
    },
    {
      changeFacilityValue: true,
      ukefDecision: {
        value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
      },
    },
    {
      changeFacilityValue: true,
      changeCoverEndDate: true,
      ukefDecision: {
        value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
        coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
      },
    },
    {
      changeFacilityValue: true,
      changeCoverEndDate: true,
      ukefDecision: {
        value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
        coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
      },
    },
    {
      changeFacilityValue: false,
      changeCoverEndDate: true,
      ukefDecision: {
        coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
      },
    },
    {
      changeFacilityValue: false,
      changeCoverEndDate: true,
      ukefDecision: {
        coverEndDate: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
      },
    },
    {
      changeFacilityValue: true,
      changeCoverEndDate: false,
      ukefDecision: {
        value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
      },
    },
    {
      changeFacilityValue: true,
      changeCoverEndDate: false,
      ukefDecision: {
        value: UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
      },
    },
  ];

  it.each(approved)('should return false if the UKEF decission is approved with or without conditions for when the UKEF decision is %s', (decision) => {
    // Arrange
    const mockAmendment = {
      amendmentId: '6597dffeb5ef5ff4267e5046',
      type: AMENDMENT_TYPES.PORTAL,
      ...decision,
    } as TfmFacilityAmendmentWithUkefId;

    // Act
    const respone = amendmentDeclined(mockAmendment);

    // Assert
    expect(respone).toBeFalsy();
  });
});
