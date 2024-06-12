/**
 * @openapi
 * definitions:
 *   Company:
 *     type: object
 *     properties:
 *       companiesHouseRegistrationNumber:
 *         type: string
 *       companyName:
 *         type: string
 *       registeredAddress:
 *         type: object
 *         properties:
 *           addressLine1:
 *             type: string
 *           addressLine2:
 *             type: string
 *             nullable: true
 *           addressLine3:
 *             type: string
 *             nullable: true
 *           locality:
 *             type: string
 *           postalCode:
 *             type: string
 *           country:
 *             type: string
 *       industries:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             name:
 *               type: string
 *             class:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 name:
 *                   type: string
 */
