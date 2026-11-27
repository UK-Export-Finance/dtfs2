import * as cron from 'node-cron';
import { spawnSync } from 'child_process';
import { initialiseCronJobScheduler } from './scheduler';

describe('initialiseCronJobScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(async () => {
    await Promise.all([...cron.getTasks().values()].map((task) => task.destroy()));
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('runs scheduled jobs with the execution time as a Date', async () => {
    const task = jest.fn();
    initialiseCronJobScheduler([{ cronExpression: '* * * * * *', description: 'test job', task }]);

    expect(task).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1000);

    expect(task).toHaveBeenCalledTimes(1);
    expect(task).toHaveBeenCalledWith(new Date('2026-01-01T00:00:01.000Z'));
  });

  it.each([
    ['0 2 * * *', new Date(2026, 0, 1, 1, 59, 59)],
    ['0 8 1 * *', new Date(2026, 0, 1, 7, 59, 59)],
    ['*/10 * * * *', new Date(2026, 0, 1, 0, 9, 59)],
    ['0 0 * * *', new Date(2026, 0, 1, 23, 59, 59)],
  ])('runs the configured expression %s at the expected time', async (cronExpression, beforeRun) => {
    jest.setSystemTime(beforeRun);
    const task = jest.fn();
    initialiseCronJobScheduler([{ cronExpression, description: 'test job', task }]);

    await jest.advanceTimersByTimeAsync(1000);

    expect(task).toHaveBeenCalledTimes(1);
    expect(task).toHaveBeenCalledWith(new Date(beforeRun.getTime() + 1000));
  });

  it('does not replay a missed execution after its matching second', async () => {
    jest.spyOn(console, 'warn').mockImplementation();
    const task = jest.fn();
    initialiseCronJobScheduler([{ cronExpression: '* * * * *', description: 'test job', task }]);

    jest.setSystemTime(new Date('2026-01-01T00:00:02.000Z'));
    await jest.advanceTimersByTimeAsync(60000);
    expect(task).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(58000);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('allows a new execution while the previous asynchronous job is still running', async () => {
    const finishTasks: (() => void)[] = [];
    const task = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finishTasks.push(resolve);
        }),
    );
    initialiseCronJobScheduler([{ cronExpression: '* * * * * *', description: 'test job', task }]);

    await jest.advanceTimersByTimeAsync(2000);

    expect(task).toHaveBeenCalledTimes(2);
    finishTasks.forEach((finishTask) => finishTask());
  });

  it('logs failed asynchronous jobs and leaves the rejection unhandled as before', () => {
    const script = `
      const { initialiseCronJobScheduler } = require('./src/cron-scheduler/scheduler.ts');
      initialiseCronJobScheduler([{
        cronExpression: '* * * * * *',
        description: 'test job',
        task: async () => { throw new Error('job failed'); },
      }]);
    `;
    const result = spawnSync(process.execPath, ['--unhandled-rejections=strict', '-r', 'ts-node/register/transpile-only', '-e', script], {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 10000,
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("An error occurred running job 'test job'");
    expect(result.stderr).toContain('job failed');
  });

  it('logs invalid expressions and does not schedule the job', () => {
    const task = jest.fn();
    initialiseCronJobScheduler([{ cronExpression: 'invalid', description: 'test job', task }]);

    expect(console.error).toHaveBeenCalledWith("Failed to add scheduled job '%s' due to invalid cron expression: '%s'", 'test job', 'invalid');
    expect(cron.getTasks().size).toBe(0);
    expect(task).not.toHaveBeenCalled();
  });
});
