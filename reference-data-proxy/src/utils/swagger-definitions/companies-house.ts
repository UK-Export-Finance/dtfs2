/**
 * @openapi
 * definitions:
 *   CompaniesHouseResponseBody:
 *     type: object
 *     properties:
 *       company_name:
 *         type: string
 *       company_number:
 *         type: string
 *       registered_office_address:
 *         type: object
 *         properties:
 *           address_line_1:
 *             type: string
 *           address_line_2:
 *             type: string
 *           care_of:
 *             type: string
 *           country:
 *             type: string
 *           locality:
 *             type: string
 *           po_box:
 *             type: string
 *           postal_code:
 *             type: string
 *           premises:
 *             type: string
 *           region:
 *             type: string
 *       sic_codes:
 *         type: array
 *         items:
 *           type: string
 */
