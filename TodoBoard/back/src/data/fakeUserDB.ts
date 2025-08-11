export interface User {
  username: string;
  email: string;
  password: string;
}

export const userDB = new Map<string, User>();
