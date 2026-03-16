/**
 * @openapi
 * definitions:
 *   ObligationSubtype:
 *     type: object
 *     properties:
 *       type:
 *         type: string
 *         example: 'Obligation Sub-Type'
 *       typeCode:
 *         type: string
 *         example: 'obligationSubtype'
 *       code:
 *         type: string
 *         example: 'OST012'
 *       description:
 *         type: string
 *         example: 'BSS Advance Payment Guarantee'
 *       isActive:
 *         type: boolean
 *         example: true
 *     type: array
 *     items:
 *       $ref: '#/definitions/ObligationSubtype'
 */
