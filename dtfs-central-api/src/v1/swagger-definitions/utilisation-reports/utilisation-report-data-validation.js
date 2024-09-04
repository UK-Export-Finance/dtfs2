/**
 * @openapi
 * definitions:
 *   RawReportDataWithCellLocations:
 *     type: array
 *     items:
 *       type: object
 *       additionalProperties:
 *         type: object
 *         properties:
 *           value:
 *             type: string
 *             nullable: true
 *           column:
 *             type: string
 *           row:
 *             oneOf:
 *               - type: string
 *               - type: number
 *   CsvValidationError:
 *     type: object
 *     properties:
 *       errorMessage:
 *         type: string
 *       column:
 *         type: string
 *         nullable: true
 *       row:
 *         nullable: true
 *         oneOf:
 *           - type: string
 *           - type: number;
 *       value:
 *         type: string
 *         nullable: true
 *       exporter:
 *         type: string
 *         nullable: true
 */
