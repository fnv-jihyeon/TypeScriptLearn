interface ScheduleItem {
  id: number;
  user: string; // 세션 사용자명 기준으로 구분
  title: string;
  start: string;
  end: string;
  color: string;
}

export const scheduleDB: ScheduleItem[] = [];
