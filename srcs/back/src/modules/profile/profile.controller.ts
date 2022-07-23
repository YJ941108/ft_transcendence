import { Controller, Get, Logger, Param, Req, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('profile')
export class ProfileController {
  private logger = new Logger('ProfileController');

  /**
   * 프로필 사진 불러오기
   * @param filename
   * @param res
   */
  @Get('/:filename')
  getProfileImage(@Param('filename') filename: string, @Res() res: Response) {
    this.logger.log(`getProfileImage: ${filename}`);
    res.sendFile(filename, { root: './uploads' });
  }
}
