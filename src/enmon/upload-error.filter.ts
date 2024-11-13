import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

@Injectable()
export class UploadErrorFilter {
  private readonly logger = new Logger(UploadErrorFilter.name);

  catch(e: unknown) {
    if (e instanceof AxiosError) {
      const { status, statusText } = e.response ?? {};
      this.logger.log({
        message: `upload reading failed: ${e.message}`,
        reason: e.message,
        error: e.toJSON(),
        status,
        statusText,
        data: e.response?.data as unknown,
      });
    }

    throw e;
  }
}
