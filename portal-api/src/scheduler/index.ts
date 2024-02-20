import { initialiseCronScheduler } from '@ukef/dtfs2-common';
import { jobs } from './jobs';

export const initialiseScheduler = () => initialiseCronScheduler(jobs);
