import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(input: { username: string; email: string; password: string }) {
  const hashed = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      password: hashed,
    },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
    },
  });
  return user;
}

export async function loginUser(input: { username: string; password: string }) {
  const user = await prisma.user.findFirst({
    where: { username: input.username },
  });

  if (!user) return null;

  const isValid = await bcrypt.compare(input.password, user.password);
  if (!isValid) return null;

  const { id, username, email, createdAt } = user;

  return { id, username, email, createdAt };
}
