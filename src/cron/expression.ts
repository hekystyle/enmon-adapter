import { CronExpression } from '@nestjs/schedule';

export const AppCronExpression = {
  ...CronExpression,
  EVERY_15_MINUTES: '0 */15 * * * *',
};
