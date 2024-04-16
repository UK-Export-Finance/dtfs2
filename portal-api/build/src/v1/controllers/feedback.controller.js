"use strict";
const tslib_1 = require("tslib");
const assert = require('assert');
const { ObjectId } = require('mongodb');
const sanitizeHtml = require('sanitize-html');
const { format, getUnixTime, fromUnixTime } = require('date-fns');
const db = require('../../drivers/db-client');
const validateFeedback = require('../validation/feedback');
const sendEmail = require('../email');
const findFeedbacks = (callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('feedback');
    collection.find().toArray((error, result) => {
        assert.equal(error, null);
        callback(result);
    });
});
const findOneFeedback = (id, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!ObjectId.isValid(id)) {
        throw new Error('Invalid Feedback Id');
    }
    const collection = yield db.getCollection('feedback');
    collection.findOne({ _id: { $eq: ObjectId(id) } }, (error, result) => {
        assert.equal(error, null);
        callback(result);
    });
});
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const validationErrors = validateFeedback(req.body);
    if (validationErrors.count !== 0) {
        return res.status(400).send({
            feedback: sanitizeHtml(req.body),
            validationErrors,
        });
    }
    const { role, organisation, reasonForVisiting, reasonForVisitingOther, easyToUse, clearlyExplained, satisfied, howCanWeImprove, emailAddress, submittedBy } = req.body;
    const modifiedFeedback = {
        role,
        organisation,
        reasonForVisiting,
        reasonForVisitingOther,
        easyToUse,
        clearlyExplained,
        satisfied,
        howCanWeImprove,
        emailAddress,
        submittedBy,
        created: getUnixTime(new Date()),
    };
    const collection = yield db.getCollection('feedback');
    const createdFeedback = yield collection.insertOne(modifiedFeedback);
    // get formatted date from created timestamp, to display in email
    const formattedCreated = format(fromUnixTime(modifiedFeedback.created), 'dd/MM/yyyy HH:mm');
    if (!submittedBy.username) {
        submittedBy.username = 'N/A';
    }
    const emailVariables = {
        role,
        organisation,
        reasonForVisiting,
        reasonForVisitingOther,
        easyToUse,
        clearlyExplained,
        satisfied,
        howCanWeImprove,
        emailAddressForContact: emailAddress,
        created: formattedCreated,
        submittedBy: submittedBy.username,
    };
    const EMAIL_TEMPLATE_ID = '4214bdb8-b3f5-4081-a664-3bfcfe648b8d';
    const EMAIL_RECIPIENT = process.env.GOV_NOTIFY_EMAIL_RECIPIENT;
    yield sendEmail(EMAIL_TEMPLATE_ID, EMAIL_RECIPIENT, emailVariables);
    return res.status(200).send({ _id: createdFeedback.insertedId });
});
exports.findOne = (req, res) => (findOneFeedback(req.params.id, (feedback) => {
    if (!feedback) {
        res.status(404).send();
    }
    else {
        return res.status(200).send(feedback);
    }
    return res.status(404).send();
}));
exports.findAll = (req, res) => (findFeedbacks((feedbacks) => res.status(200).send(feedbacks)));
exports.delete = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid feedback id');
    }
    return findOneFeedback(id, (feedback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!feedback) {
            return res.status(404).send();
        }
        const collection = yield db.getCollection('feedback');
        const status = yield collection.deleteOne({ _id: { $eq: ObjectId(id) } });
        return res.status(200).send(status);
    }));
});
