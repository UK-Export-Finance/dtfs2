export type Team = { email: string } & (
  | {
      id: 'UNDERWRITER_SUPPORT';
      name: 'Underwriter support';
    }
  | {
      id: 'UNDERWRITER_MANAGERS';
      name: 'Underwriter managers';
    }
  | {
      id: 'UNDERWRITERS';
      name: 'Underwriters';
    }
  | {
      id: 'RISK_MANAGERS';
      name: 'Risk managers';
    }
  | {
      id: 'BUSINESS_SUPPORT';
      name: 'Business support';
    }
  | {
      id: 'PIM';
      name: 'Post issue management';
    }
  | {
      id: 'PDC_READ';
      name: 'PDC read';
    }
  | {
      id: 'PDC_RECONCILE';
      name: 'PDC reconcile';
    }
);
