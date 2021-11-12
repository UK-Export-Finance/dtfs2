import getStatusLabel from './filter-getStatusLabel';

describe('getStatusLabel filter', () => {
  it('returns label for DRAFT', () => {
    expect(getStatusLabel('DRAFT')).toEqual('Draft');
  });

  it('returns label for BANK_CHECK', () => {
    expect(getStatusLabel('BANK_CHECK')).toEqual('Ready for Checker\'s approval');
  });

  it('returns label for CHANGES_REQUIRED', () => {
    expect(getStatusLabel('CHANGES_REQUIRED')).toEqual('Further Maker\'s input required');
  });

  it('returns label for ABANDONED', () => {
    expect(getStatusLabel('ABANDONED')).toEqual('Abandoned');
  });

  it('returns label for SUBMITTED_TO_UKEF', () => {
    expect(getStatusLabel('SUBMITTED_TO_UKEF')).toEqual('Submitted');
  });

  it('returns label for UKEF_ACKNOWLEDGED', () => {
    expect(getStatusLabel('UKEF_ACKNOWLEDGED')).toEqual('Acknowledged by UKEF');
  });

  it('returns label for UKEF_IN_PROGRESS', () => {
    expect(getStatusLabel('UKEF_IN_PROGRESS')).toEqual('In progress by UKEF');
  });

  it('returns label for UKEF_ACCEPTED_CONDITIONAL', () => {
    expect(getStatusLabel('UKEF_ACCEPTED_CONDITIONAL')).toEqual('Accepted by UKEF (with conditions)');
  });

  it('returns label for UKEF_ACCEPTED_UNCONDITIONAL', () => {
    expect(getStatusLabel('UKEF_ACCEPTED_UNCONDITIONAL')).toEqual('Accepted by UKEF (without conditions)');
  });

  it('returns label for UKEF_REFUSED', () => {
    expect(getStatusLabel('UKEF_REFUSED')).toEqual('Rejected by UKEF');
  });

  it('returns label for EXPIRED', () => {
    expect(getStatusLabel('EXPIRED')).toEqual('Expired');
  });

  it('returns label for WITHDRAWN', () => {
    expect(getStatusLabel('WITHDRAWN')).toEqual('Withdrawn');
  });

  it('returns the status passed if no matching status is found', () => {
    expect(getStatusLabel('NOSTATUS')).toEqual('NOSTATUS');
    expect(getStatusLabel()).toEqual(undefined);
  });
});
