export type TfmParties = {
  exporter: {
    partyUrn: string;
    partyUrnRequired?: boolean;
  };
  buyer?: {
    partyUrn: string;
    partyUrnRequired?: boolean;
  };
  agent?: {
    partyUrn: string;
    partyUrnRequired?: boolean;
  };
  indemnifier?: {
    partyUrn: string;
    partyUrnRequired?: boolean;
  };
};
