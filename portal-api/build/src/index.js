"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const dtfs2_common_1 = require("@ukef/dtfs2-common");
const cron_scheduler_jobs_1 = require("./cron-scheduler-jobs");
dotenv_1.default.config();
(0, dtfs2_common_1.initialiseCronJobScheduler)(cron_scheduler_jobs_1.cronSchedulerJobs);
// eslint-disable-next-line import/first
const createApp_1 = tslib_1.__importDefault(require("./createApp"));
const PORT = process.env.PORT || 5000;
createApp_1.default.listen(PORT, () => console.info('✅ Portal API micro-service initialised on %s', PORT));
