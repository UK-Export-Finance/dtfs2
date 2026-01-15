export type GeneratedOTP = {
  securityCode: string;
  salt: string;
  hash: string;
  expiry: number;
};
