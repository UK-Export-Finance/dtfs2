/**
 * @openapi
 * definitions:
 *   EstoreRequestBody:
 *     type: object
 *     properties:
 *       eStoreFolderInfo:
 *         type: object
 *         properties:
 *           exporterName:
 *             type: string
 *             example: An Exporter
 *           buyerName:
 *             type: string
 *             example: A Buyer
 *           dealIdentifier:
 *             type: string
 *             example: '0040000449'
 *           destinationMarket:
 *             type: string
 *             example: United Kingdom
 *           riskMarket:
 *             type: string
 *             example: United States
 *           facilityIdentifiers:
 *             type: array
 *             items:
 *               type: string
 *               example: '0040000450'
 *   EstoreResponseBody:
 *     type: object
 *     properties:
 *       siteName:
 *         type: string
 *         example: '00010100'
 *       buyerName:
 *         type: string
 *         example: Shanghai Ship and Shipping Research Institute
 *       folderName:
 *         type: string
 *         example: Folder Name
 *       facilities:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: D 0100000000
 *             contentType:
 *               type: string
 *               example: TFIS Case
 *             parentFolderName:
 *               type: string
 *               example: Shanghai Ship and Shipping Research Institute
 *             exporterName:
 *               type: string
 *               example: Kingspan
 *             destinationMarket:
 *               type: string
 *               example: United Kingdom
 *             riskMarket:
 *               type: string
 *               example: United States
 */
