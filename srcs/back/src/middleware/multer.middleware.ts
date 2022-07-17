import { diskStorage } from 'multer';
import { Profile } from 'passport-42';

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads');
    },
    filename: (req: Profile, file, cb) => {
      cb(null, `${req.user.username}.png`);
    },
  }),
};
