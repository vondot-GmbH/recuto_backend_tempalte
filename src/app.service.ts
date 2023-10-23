import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  checkConnection(): string {
    return 'connection successfully';
  }
}
