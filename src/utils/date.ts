import dayjs from 'dayjs';

export const now = (): Date => new Date();

export const addMinutes = (date: Date, minutes: number): Date =>
  dayjs(date).add(minutes, 'minute').toDate();

export const addDays = (date: Date, days: number): Date =>
  dayjs(date).add(days, 'day').toDate();

export const addSeconds = (date: Date, seconds: number): Date =>
  dayjs(date).add(seconds, 'second').toDate();

export const isExpired = (date: Date): boolean =>
  dayjs().isAfter(dayjs(date));

export const formatISO = (date: Date): string => date.toISOString();
