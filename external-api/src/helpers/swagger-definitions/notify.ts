/**
 * @openapi
 * definitions:
 *   NotifyResponseBody:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         example: bfb50d92-100d-4b8b-b559-14fa3b091cda
 *       reference:
 *         type: string
 *         example: null
 *       content:
 *         type: object
 *         properties:
 *           subject:
 *             type: string
 *             example: Licence renewal
 *           body:
 *             type: string
 *             example: Dear Bill your licence is due for renewal on 3 January 2016.
 *           from_email:
 *             type: string
 *             example: the_service@gov.uk
 *       uri:
 *         type: string
 *         example: https://api.notifications.service.gov.uk/v2/notifications/ceb50d92-100d-4b8b-b559-14fa3b091cd
 *       template:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             example: ceb50d92-100d-4b8b-b559-14fa3b091cda
 *           version:
 *             type: integer
 *             example: 1
 *           uri:
 *             type: string
 *             example: https://api.notifications.service.gov.uk/service/your_service_id/templates/bfb50d92-100d-4b8b-b559-14fa3b091cda
 */
