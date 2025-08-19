/**
 * Represents a party entity in Salesforce with relevant company details.
 *
 * @property companyRegNo - The registration number of the company.
 * @property companyName - The name of the company.
 * @property probabilityOfDefault - The probability that the company will default.
 * @property isUkEntity - Indicates if the company is a UK entity.
 * @property code - A numeric code associated with the party.
 */
export type SalesForceParty = {
  companyRegNo: string;
  companyName: string;
  probabilityOfDefault: number;
  isUkEntity: boolean;
  code: number;
};
