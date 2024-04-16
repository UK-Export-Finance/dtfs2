"use strict";
const tslib_1 = require("tslib");
const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { validateApplicationReferences, validatorStatusCheckEnums } = require('./validation/application');
const { exporterStatus } = require('./validation/exporter');
const { supportingInfoStatus } = require('./validation/supportingInfo');
const { eligibilityCriteriaStatus } = require('./validation/eligibilityCriteria');
const { isSuperUser } = require('../../users/checks');
const { getLatestEligibilityCriteria } = require('./eligibilityCriteria.controller');
const { Application } = require('../models/application');
const { addSubmissionData } = require('./application-submit');
const api = require('../../api');
const { sendEmail } = require('../../../external-api/api');
const { EMAIL_TEMPLATE_IDS, DEAL: { DEAL_STATUS, DEAL_TYPE }, } = require('../../../constants');
const dealsCollection = 'deals';
const facilitiesCollection = 'facilities';
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const newDeal = Object.assign(Object.assign({}, req.body), { maker: Object.assign(Object.assign({}, req.user), { _id: String(req.user._id) }) });
        const applicationCollection = yield db.getCollection(dealsCollection);
        const validateErrs = validateApplicationReferences(newDeal);
        if (validateErrs) {
            return res.status(422).send(validateErrs);
        }
        const eligibility = yield getLatestEligibilityCriteria();
        if (newDeal.exporter) {
            newDeal.exporter.status = exporterStatus(newDeal.exporter);
            newDeal.exporter.updatedAt = Date.now();
        }
        const response = yield api.findLatestGefMandatoryCriteria();
        if ((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.version) {
            newDeal.mandatoryVersionId = response.data.version;
        }
        const createdApplication = yield applicationCollection.insertOne(new Application(newDeal, eligibility));
        const insertedId = String(createdApplication.insertedId);
        if (!ObjectId.isValid(insertedId)) {
            return res.status(400).send({ status: 400, message: 'Invalid Inserted Id' });
        }
        const application = yield applicationCollection.findOne({
            _id: { $eq: ObjectId(insertedId) },
        });
        return res.status(201).json(application);
    }
    catch (error) {
        console.error('Unable to create an application %o', error);
        return res.status(500).send({ status: 500, message: 'Unable to create an application' });
    }
});
exports.getAll = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection(dealsCollection);
    const doc = yield collection.find({ dealType: { $eq: DEAL_TYPE.GEF } }).toArray();
    if (doc.length && doc.supportingInformation) {
        doc.supportingInformation.status = supportingInfoStatus(doc.supportingInformation);
    }
    return res.status(200).send({
        items: doc,
    });
});
exports.getById = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const _id = req.params.id;
    if (!ObjectId.isValid(_id)) {
        return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }
    const collection = yield db.getCollection(dealsCollection);
    const doc = yield collection.findOne({ _id: { $eq: ObjectId(_id) } });
    if (doc) {
        if (doc.supportingInformation) {
            doc.supportingInformation.status = supportingInfoStatus(doc.supportingInformation);
        }
        if (doc.eligibility) {
            doc.eligibility.status = eligibilityCriteriaStatus(doc.eligibility.criteria);
        }
        return res.status(200).send(doc);
    }
    return res.status(204).send();
});
exports.getStatus = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const _id = req.params.id;
    if (!ObjectId.isValid(_id)) {
        return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }
    const collection = yield db.getCollection(dealsCollection);
    const doc = yield collection.findOne({
        _id: { $eq: ObjectId(_id) },
    });
    if (doc) {
        return res.status(200).send({ status: doc.status });
    }
    return res.status(204).send();
});
exports.update = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }
    const collection = yield db.getCollection(dealsCollection);
    const update = new Application(req.body);
    const validateErrs = validateApplicationReferences(update);
    if (validateErrs) {
        return res.status(422).send(validateErrs);
    }
    // TODO: DTFS2-4987 Write unit tests for editorId
    const updateAction = {};
    if (update.editorId) {
        updateAction.$addToSet = { editedBy: update.editorId };
        delete update.editorId;
    }
    if (update.exporter) {
        update.exporter.status = exporterStatus(update.exporter);
        update.exporter.updatedAt = Date.now();
    }
    updateAction.$set = update;
    const result = yield collection.findOneAndUpdate({ _id: { $eq: ObjectId(id) } }, updateAction, { returnNewDocument: true, returnDocument: 'after' });
    let response;
    if (result.value) {
        response = result.value;
    }
    return res.status(utils.mongoStatus(result)).send(response);
});
exports.updateSupportingInformation = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id: dealId } = req.params;
    if (!ObjectId.isValid(dealId)) {
        return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }
    const { application, field, user } = req.body;
    const { _id: editorId } = user;
    const collection = yield db.getCollection(dealsCollection);
    const result = yield collection.findOneAndUpdate({ _id: { $eq: ObjectId(dealId) } }, {
        $addToSet: { editedBy: editorId },
        // set the updatedAt property to the current time in EPOCH format
        $set: { updatedAt: Date.now() },
        // insert new documents into the supportingInformation object -> array. i.e. supportingInformation.manualInclusion
        $push: { [`supportingInformation.${field}`]: application },
    });
    let response;
    if (result.value) {
        response = result.value;
    }
    return res.status(utils.mongoStatus(result)).send(response);
});
const sendStatusUpdateEmail = (user, existingApplication, status) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { maker, status: previousStatus, bankInternalRefName, exporter } = existingApplication;
    // get maker user details
    const { firstname: firstName = '', surname = '' } = maker;
    // get exporter name
    const { companyName = '' } = exporter;
    user.bank.emails.forEach((email) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield sendEmail(EMAIL_TEMPLATE_IDS.UPDATE_STATUS, email, {
            firstName,
            surname,
            submissionType: existingApplication.submissionType || '',
            supplierName: companyName,
            bankInternalRefName,
            currentStatus: status,
            previousStatus,
            updatedByName: `${user.firstname} ${user.surname}`,
            updatedByEmail: user.email,
        });
    }));
});
exports.changeStatus = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const dealId = req.params.id;
    if (!ObjectId.isValid(dealId)) {
        return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }
    const enumValidationErr = validatorStatusCheckEnums(req.body);
    if (enumValidationErr) {
        return res.status(422).send(enumValidationErr);
    }
    const collection = yield db.getCollection(dealsCollection);
    const existingApplication = yield collection.findOne({ _id: { $eq: ObjectId(dealId) } });
    if (!existingApplication) {
        return res.status(404).send();
    }
    const { status } = req.body;
    let applicationUpdate = Object.assign({ status }, { updatedAt: Date.now() });
    if (status === DEAL_STATUS.SUBMITTED_TO_UKEF) {
        const submissionData = yield addSubmissionData(dealId, existingApplication);
        applicationUpdate = Object.assign(Object.assign({}, applicationUpdate), submissionData);
    }
    const updatedDocument = yield collection.findOneAndUpdate({ _id: { $eq: ObjectId(dealId) } }, { $set: applicationUpdate }, { returnNewDocument: true, returnDocument: 'after' });
    let response;
    if (updatedDocument.value) {
        response = updatedDocument.value;
        if (status === DEAL_STATUS.SUBMITTED_TO_UKEF) {
            yield api.tfmDealSubmit(dealId, existingApplication.dealType, req.user);
        }
    }
    // If status of correct type, send update email
    if ([DEAL_STATUS.READY_FOR_APPROVAL, DEAL_STATUS.CHANGES_REQUIRED, DEAL_STATUS.SUBMITTED_TO_UKEF].includes(status)) {
        const { user } = req;
        yield sendStatusUpdateEmail(user, existingApplication, status);
    }
    return res.status(utils.mongoStatus(updatedDocument)).send(response);
});
exports.delete = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id: dealId } = req.params;
    if (!ObjectId.isValid(dealId)) {
        return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }
    const applicationCollection = yield db.getCollection(dealsCollection);
    const applicationResponse = yield applicationCollection.findOneAndDelete({
        _id: { $eq: ObjectId(dealId) },
    });
    if (applicationResponse.value) {
        // remove facility information related to the application
        const query = yield db.getCollection(facilitiesCollection);
        yield query.deleteMany({ dealId: { $eq: ObjectId(dealId) } });
    }
    return res.status(utils.mongoStatus(applicationResponse)).send(applicationResponse.value ? applicationResponse.value : null);
});
const dealsFilters = (user, filters = []) => {
    const amendedFilters = [...filters];
    // add the bank clause if we're not a superuser
    if (!isSuperUser(user)) {
        amendedFilters.push({ 'bank.id': { $eq: user.bank.id } });
    }
    let result = {};
    if (amendedFilters.length === 1) {
        [result] = amendedFilters;
    }
    else if (amendedFilters.length > 1) {
        result = {
            $and: amendedFilters,
        };
    }
    return result;
};
exports.findDeals = (requestingUser_1, filters_1, ...args_1) => tslib_1.__awaiter(void 0, [requestingUser_1, filters_1, ...args_1], void 0, function* (requestingUser, filters, start = 0, pagesize = 0) {
    const sanitisedFilters = dealsFilters(requestingUser, filters);
    const collection = yield db.getCollection(dealsCollection);
    const doc = yield collection
        .aggregate([
        { $match: { $eq: sanitisedFilters } },
        {
            $sort: {
                updatedAt: -1,
                createdAt: -1,
            },
        },
        {
            $facet: {
                count: [{ $count: 'total' }],
                deals: [{ $skip: start }, ...(pagesize ? [{ $limit: pagesize }] : [])],
            },
        },
        { $unwind: '$count' },
        {
            $project: {
                count: '$count.total',
                deals: true,
            },
        },
    ])
        .toArray();
    return doc;
});
