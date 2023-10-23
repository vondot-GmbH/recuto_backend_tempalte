import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'To check the connection to the server.',
  })
  @Get('check-connection')
  checkConnection(): string {
    return this.appService.checkConnection();
  }
}
