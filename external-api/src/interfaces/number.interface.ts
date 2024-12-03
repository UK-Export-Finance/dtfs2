import { IsoDateTimeStamp } from '@ukef/dtfs2-common';

/**
 * Defines the interfaces for the response of the number generator.
 *
 * @interface NumberGeneratorResponse
 * @property {number} status - The status code of the response.
 * @property {Array} data - An array of objects containing the generated numbers.
 * @property {number} data.id - The ID of the generated number.
 * @property {number} data.maskedId - The masked ID of the generated number.
 * @property {number} data.type - The type of the generated number.
 * @property {string} data.createdBy - The creator of the generated number.
 * @property {string} data.createdDatetime - The creation datetime of the generated number.
 * @property {string} data.requestingSystem - The system that requested the generation of the number.
 */
export interface NumberGeneratorResponse {
  readonly status: number;
  readonly data: Array<{
    id: number;
    maskedId: string;
    type: number;
    createdBy: string;
    createdDatetime: IsoDateTimeStamp;
    requestingSystem: string;
  }>;
}

/**
 * Defines the interfaces for the error response of the number generator.
 *
 * @interface NumberGeneratorErrorResponse
 * @property {number} status - The status code of the error response.
 * @property {Object} error - The error object containing details about the error.
 */
export interface NumberGeneratorErrorResponse {
  readonly status: number;
  readonly error: object;
}
