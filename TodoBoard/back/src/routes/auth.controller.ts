import { Request, Response } from 'express';
import { ERROR_CODES } from '@/constants/errorCodes';

interface User {
  username: string;
  email: string;
  password: string;
}

const fakeDB = new Map<string, User>();

export const signup = (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  if (fakeDB.has(email)) {
    return res.status(200).json({ message: '이미 등록된 이메일입니다.' });
  }

  if (fakeDB.has(username)) {
    return res.status(200).json({ message: '이미 존재하는 사용자입니다.' });
  }

  const newUser: User = { username, email, password };
  fakeDB.set(email, newUser);

  return res.status(200).json({ message: '회원가입 성공', user: newUser });
}