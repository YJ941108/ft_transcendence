import * as bcrypt from 'bcryptjs';

export async function hashFunction([password]: string) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}
