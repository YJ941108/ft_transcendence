import { diskStorage } from 'multer';
import { Profile } from 'passport-42';

/**
 *  프로필 이미지 저장
 */
export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads');
    },
    filename: (req: Profile, file, cb) => {
      cb(null, `${Date()}${req.user.email}.png`);
    },
  }),
};
