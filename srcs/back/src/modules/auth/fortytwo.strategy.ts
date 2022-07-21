import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';

/**
 *
 */
@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.fortytwo.id'),
      clientSecret: configService.get<string>('auth.fortytwo.secret'),
      callbackURL: configService.get<string>('auth.fortytwo.callback'),
    });
  }

  /**
   *
   * @param accessToken
   * @param refreshToken
   * @param profile
   * @param cb
   * @returns
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback,
  ): Promise<VerifyCallback> {
    const username = profile.username;
    const email = profile.emails[0].value;
    const photo = profile.photos[0].value;
    const user = {
      username,
      photo,
      email,
      accessToken,
      refreshToken,
    };
    return cb(null, user);
  }
}
