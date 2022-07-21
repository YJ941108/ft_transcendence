import { Controller, Get } from '@nestjs/common';

/**
 * 서버 상태 확인
 */
@Controller('health')
export class HealthController {
  @Get()
  async healthCheck() {
    return 'Hello World';
  }
}
