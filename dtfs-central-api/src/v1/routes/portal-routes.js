const express = require('express');

const portalRouter = express.Router();
const createDealController = require('../controllers/portal/deal/create-deal.controller');
const getDealController = require('../controllers/portal/deal/get-deal.controller');
const updateDealController = require('../controllers/portal/deal/update-deal.controller');
const updateDealStatusController = require('../controllers/portal/deal/update-deal-status.controller');
const deleteDealController = require('../controllers/portal/deal/delete-deal.controller');
const addDealController = require('../controllers/portal/deal/add-deal-comment.controller');

const createFacilityController = require('../controllers/portal/facility/create-facility.controller');
const createMultipleFacilitiesController = require('../controllers/portal/facility/create-multiple-facilities.controller');
const getFacilityController = require('../controllers/portal/facility/get-facility.controller');
const getFacilitiesController = require('../controllers/portal/facility/get-facilities.controller');
const updateFacilityController = require('../controllers/portal/facility/update-facility.controller');
const deleteFacilityController = require('../controllers/portal/facility/delete-facility.controller');
const updateFacilityStatusController = require('../controllers/portal/facility/update-facility-status.controller');

const getBankController = require('../controllers/bank/get-bank.controller');
const createBankController = require('../controllers/bank/create-bank.controller');

const createGefDealController = require('../controllers/portal/gef-deal/create-gef-deal.controller');
const getGefDealController = require('../controllers/portal/gef-deal/get-gef-deal.controller');

const createGefExporterController = require('../controllers/portal/gef-exporter/create-gef-exporter.controller');
const getGefExporterController = require('../controllers/portal/gef-exporter/get-gef-exporter.controller');

const getGefFacilitiesController = require('../controllers/portal/gef-facility/get-facilities.controller');
const createGefFacilityController = require('../controllers/portal/gef-facility/create-gef-facility.controller');

const { PORTAL_ROUTE } = require('../../constants/routes');

portalRouter.use((req, res, next) => {
  req.routePath = PORTAL_ROUTE;
  next();
});

portalRouter.route('/banks')
  .post(
    createBankController.createBankPost,
  );

portalRouter.route('/banks/:id')
  .get(
    getBankController.findOneBankGet,
  );


// TODO: add these to definition
// summary
// comments
// editedBy
// bondTransactions
// loanTransactions

/**
 * @openapi
 * /portal/deals:
 *   get:
 *     summary: Get, filter and sort multiple deals in Portal deals collection
 *     tags: [Portal - BSS]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: array
 *                 items:
 *                   type: object
 *               sort:
 *                 type: object
 *               start:
 *                 type: integer
 *               pagesize:
 *                 type: integer
 *           example:
 *             sort: { lastUpdated: -1, status: 'Draft' }
 *             filters: { '$and': [ { userId: '123456' }, { bankId: '9' } ] }
 *             start: 0
 *             pagesize: 10
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/DealsBSS'
 *       500:
 *         description: Error querying deals
 */
portalRouter.route('/deals').get(
  getDealController.queryAllDeals,
);

/**
 * @openapi
 * /portal/deals:
 *   post:
 *     summary: Create a BSS deal in Portal deals collection
 *     tags: [Portal - BSS]
 *     description: Create a deal in Portal deals collection
 *     requestBody:
 *       description: Fields required to create a deal. Creates other default fields
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deal:
 *                 type: object
 *                 properties:
 *                   details:
 *                     type: object
 *           example:
 *             details:
 *               bankSupplyContractID: 'a1'
 *               bankSupplyContractName: 'test'
 *               maker: { _id: '123abc' }
 *               owningBank: { id: '9' }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               deal:
 *                 _id: '123456abc'
 *                 details: {}
 *                 facilities: []
 *               validationErrors:
 *                 count: 2
 *                 errorList:
 *                   bankSupplyContractID:
 *                     order: '1'
 *                     text: 'Enter the Bank deal ID'
 *                   bankSupplyContractName:
 *                     order: '2'
 *                     text: 'Enter the Bank deal name'
 */
portalRouter.route('/deals').post(
  createDealController.createDealPost,
);

/**
 * @openapi
 * /portal/deals/:id:
 *   get:
 *     summary: Get a Portal BSS deal
 *     tags: [Portal - BSS]
 *     description: Get a Portal BSS deal. Returns associated facilities in bondTransactions/loanTransactions structure
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/DealBSS'
 *                 - type: object
 *                   properties:
 *                     _id:
 *                       example: 123456abc
 *       404:
 *         description: Not found
 */
portalRouter.route('/deals/:id').get(
  getDealController.findOneDealGet,
);

/**
 * @openapi
 * /portal/deals/:id:
 *   put:
 *     summary: Update a Portal BSS deal
 *     tags: [Portal - BSS]
 *     description: Update a Portal BSS deal
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               user: { _id: '123456abc' }
 *               dealUpdate: { aNewField: true }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/DealBSS'
 *                 - type: object
 *                   properties:
 *                     aNewField:
 *                       example: true
 *       404:
 *         description: Not found
 */
portalRouter.route('/deals/:id').put(
  updateDealController.updateDealPut,
);

/**
 * @openapi
 * /portal/deals/:id:
 *   delete:
 *     summary: Delete a Portal BSS deal
 *     tags: [TFM]
 *     description: Delete a Portal BSS deal by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to delete
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               acknowledged: true
 *               deletedCount: 1
 */
portalRouter.route('/deals/:id').delete(
  deleteDealController.deleteDeal,
);

/**
 * @openapi
 * /portal/deals/:id/status:
 *   put:
 *     summary: Update a Portal BSS deal status
 *     tags: [Portal - BSS]
 *     description: Update a Portal BSS deal status
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               status: Acknowledged by UKEF
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/DealBSS'
 *                 - type: object
 *                   properties:
 *                     details:
 *                       properties:
 *                         previousStatus:
 *                           example: Submitted
 *                         status:
 *                           example: Acknowledged by UKEF
 *       404:
 *         description: Not found
 */
portalRouter.route('/deals/:id/status')
  .put(
    updateDealStatusController.updateDealStatusPut,
  );

portalRouter.route('/deals/:id/comment')
  .post(
    addDealController.addDealCommentPost,
  );

portalRouter.route('/deals/query')
  .post(
    getDealController.queryDealsPost,
  );

/**
* @openapi
* /portal/facilities:
*   get:
*     summary: Get all Portal BSS/EWCS facilities from Portal facilities collection
*     tags: [Portal - BSS]
*     description: Get all Portal BSS/EWCS facilities from Portal facilities collection
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/FacilitiesBSS'
*/
portalRouter.route('/facilities').get(
  getFacilitiesController.findAllGet,
);

/**
 * @openapi
 * /portal/facilities:
 *   post:
 *     summary: Create a BSS/EWCS facility in Portal facilities collection
 *     tags: [Portal - BSS]
 *     description: Create a BSS/EWCS facility in Portal facilities collection
 *     requestBody:
 *       description: Fields required to create a facility.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facilityType:
 *                 type: string
 *               associatedDealId:
 *                 type: string
 *           example:
 *             facilityType: 'bond'
 *             associatedDealId: '123abc'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               validationErrors:
 *                 count: 2
 *                 errorList:
 *                   facilityType:
 *                     order: '1'
 *                     text: 'Facility type must be bond or loan'
 *                   associatedDealId:
 *                     order: '2'
 *                     text: 'Enter the Associated deal id'
 */
portalRouter.route('/facilities').post(
  createFacilityController.createFacilityPost,
);

portalRouter.route('/multiple-facilities')
  .post(
    createMultipleFacilitiesController.createMultipleFacilitiesPost,
  );

/**
* @openapi
* /portal/facilities/:id:
*   get:
*     summary: Get a Portal BSS/EWCS facility
*     tags: [Portal - BSS]
*     description: Get a Portal BSS/EWCS facility
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: Facility ID to get
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/FacilityBSS'
*       404:
*         description: Not found
*/
portalRouter.route('/facilities/:id').get(
  getFacilityController.findOneFacilityGet,
);

/**
 * @openapi
 * /portal/facilities/:id:
 *   put:
 *     summary: Update a Portal BSS/EWCS facility
 *     tags: [Portal - BSS]
 *     description: Update a Portal BSS/EWCS facility
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: { aNewField: true }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/FacilityBSS'
 *                 - type: object
 *                   properties:
 *                     aNewField:
 *                       example: true
 *       404:
 *         description: Not found
 */
portalRouter.route('/facilities/:id').put(
  updateFacilityController.updateFacilityPut,
);

/**
 * @openapi
 * /portal/facilities/:id:
 *   delete:
 *     summary: Delete a Portal BSS/EWCS facility
 *     tags: [TFM]
 *     description: Delete a Portal BSS/EWCS facility by ID. Also updates the facilities array in the associated deal.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID to delete
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               acknowledged: true
 *               deletedCount: 1
 *       404:
 *         description: Not found
 */
portalRouter.route('/facilities/:id').delete(
  deleteFacilityController.deleteFacility,
);

/**
 * @openapi
 * /portal/facilities/:id/status:
 *   put:
 *     summary: Update a Portal BSS/EWCS facility status
 *     tags: [Portal - BSS]
 *     description: Update a Portal BSS/EWCS facility status
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: { status: Ready for Checker's approval }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/FacilityBSS'
 *                 - type: object
 *                   properties:
 *                     status:
 *                       example: Ready for Checker's approval
 *                     previousStatus:
 *                       example: Draft
 *       404:
 *         description: Not found
 */
portalRouter.route('/facilities/:id/status')
  .put(
    updateFacilityStatusController.updateFacilityStatusPut,
  );

/**
 * @openapi
 * /gef/deals:
 *   post:
 *     summary: Create a GEF deal in Portal gef-applications collection
 *     tags: [Portal - GEF]
 *     description: Create a deal in Portal gef-applications collection
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 */
portalRouter.route('/gef/deals')
  .post(
    createGefDealController.createDealPost,
  );

/**
* @openapi
* /gef/deals/:id:
*   get:
*     summary: Get a GEF deal
*     tags: [Portal - GEF]
*     description: Get a GEF deal
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: Deal ID to get
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/DealGEF'
*       404:
*         description: Not found
*/
portalRouter.route('/gef/deals/:id')
  .get(
    getGefDealController.findOneDealGet,
  );

/**
* @openapi
* /gef/exporter:
*   post:
*     summary: Create a GEF exporter in Portal gef-exporter collection
*     tags: [Portal - GEF]
*     description: Create a exporter in Portal gef-exporter collection
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             example:
*               _id: '123456abc'
*/
portalRouter.route('/gef/exporter')
  .post(
    createGefExporterController.createExporterPost,
  );

/**
* @openapi
* /gef/exporter/:id:
*   get:
*     summary: Get a GEF exporter
*     tags: [Portal - GEF]
*     description: Get a GEF exporter
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: Exporter ID to get
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/GEFExporter'
*       404:
*         description: Not found
*/
portalRouter.route('/gef/exporter/:id')
  .get(
    getGefExporterController.findOneExporterGet,
  );

/**
* @openapi
* /gef/deals/:id/facilites:
*   get:
*     summary: Get all Cash/Contingent facilities associated with a deal
*     tags: [Portal - GEF]
*     description: Get all facilities associated with a deal by deal ID
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: Deal ID to get facilities for
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/FacilitiesGEF'
*/
portalRouter.route('/gef/deals/:id/facilities')
  .get(
    getGefFacilitiesController.findAllGet,
  );

/**
* @openapi
* /gef/facilities:
*   post:
*     summary: Create a Cash/Contingent facility in Portal gef-facilities collection
*     tags: [Portal - GEF]
*     description: Create a facility in Portal gef-facilities collection
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             example:
*               _id: '123456abc'
*       404:
*         description: Deal not found
*/
portalRouter.route('/gef/facilities')
  .post(
    createGefFacilityController.createFacilityPost,
  );

module.exports = portalRouter;
