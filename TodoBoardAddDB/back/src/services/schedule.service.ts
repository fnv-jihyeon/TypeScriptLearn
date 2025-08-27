import { prisma } from "@/lib/prisma";

function parseHHMM(hhmm: string): number {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) throw new Error("INVALID_TIME_FORMAT");
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) throw new Error("INVALID_TIME_RANGE");
  return h * 60 + mm;
}

async function hasOverlap(userId: string, startMin: number, endMin: number, excludeId?: string) {
  const where: any = {
    userId,
    startMin: { lt: endMin },
    endMin: { gt: startMin },
  };

  if (excludeId) where.id = { not: excludeId };

  const count = await prisma.schedule.count({ where });
  return count > 0;
}

export async function createSchedule(userId: string, input: { title: string; start: string; end: string; color: string }) {
  const startMin = parseHHMM(input.start);
  const endMin = parseHHMM(input.end);

  if (startMin >= endMin) throw new Error("INVALID_TIME_ORDER");
  if (await hasOverlap(userId, startMin, endMin)) throw new Error("TIME_OVERLAP");

  return prisma.schedule.create({
    data: { title: input.title, color: input.color, startMin, endMin, userId },
    select: { id: true, title: true, startMin: true, endMin: true, color: true, createdAt: true, updatedAt: true },
  });
}

export async function listMySchedules(userId: string) {
  return prisma.schedule.findMany({
    where: { userId },
    orderBy: { startMin: "asc" },
    select: { id: true, title: true, startMin: true, endMin: true, color: true, createdAt: true, updatedAt: true },
  });
}

export async function updateSchedule(userId: string, scheduleId: string, data: Partial<{ title: string; start: string; end: string; color: string }>) {
  const found = await prisma.schedule.findUnique({ where: { id: scheduleId }, select: { userId: true } });
  if (!found || found.userId !== userId) return null;

  const patch: any = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.color !== undefined) patch.color = data.color;

  let startMin: number | undefined;
  let endMin: number | undefined;

  if (data.start !== undefined) startMin == parseHHMM(data.start);
  if (data.end !== undefined) endMin == parseHHMM(data.end);

  const current = await prisma.schedule.findUnique({ where: { id: scheduleId } });
  const newStart = startMin ?? current!.startMin;
  const newEnd = endMin ?? current!.endMin;

  if (newStart >= newEnd) throw new Error("INVALID_TIME_ORDER");
  if (await hasOverlap(userId, newStart, newEnd, scheduleId)) throw new Error("TIME_OVERLAP");

  patch.startMin = newStart;
  patch.endMin = newEnd;

  return prisma.schedule.update({
    where: { id: scheduleId },
    data: patch,
    select: { id: true, title: true, startMin: true, endMin: true, color: true, createdAt: true, updatedAt: true },
  });
}

export async function deleteSchedule(userId: string, scheduleId: string) {
  const found = await prisma.schedule.findUnique({ where: { id: scheduleId }, select: { userId: true } });
  if (!found || found.userId !== userId) return false;

  await prisma.schedule.delete({ where: { id: scheduleId } });

  return true;
}
