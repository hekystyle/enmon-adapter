import { CronExpression as ScheduleCronExpression } from '@nestjs/schedule';

export const CronExpression = {
  ...ScheduleCronExpression,
  Every15Minutes: '0 */15 * * * *',
};
