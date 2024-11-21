import { addDays, isWeekend } from 'date-fns';

export function getDefaultDeliveryDate(): string {
  let date = new Date();
  let daysToAdd = 4;
  
  while (daysToAdd > 0) {
    date = addDays(date, 1);
    if (!isWeekend(date)) {
      daysToAdd--;
    }
  }

  return date.toISOString().split('T')[0];
}