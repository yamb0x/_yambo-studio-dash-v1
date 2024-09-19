import moment from 'moment';

export function adjustDateForDisplay(date, projectStartDate) {
  const start = moment(projectStartDate).startOf('day');
  const current = moment(date).startOf('day');
  const totalDays = current.diff(start, 'days');
  const weeks = Math.floor(totalDays / 7);
  
  // Subtract 2 days for each week, but not for the first week
  const daysToSubtract = weeks > 0 ? (weeks * 2) : 0;
  
  const adjustedDate = current.subtract(daysToSubtract, 'days');
  
  console.log(`Original date: ${date}, Adjusted date: ${adjustedDate.format('YYYY-MM-DD')}, Weeks: ${weeks}, Days subtracted: ${daysToSubtract}`);
  
  return adjustedDate;
}

export function getBusinessDaysBetweenDates(startDate, endDate) {
  let start = moment(startDate).startOf('day');
  const end = moment(endDate).startOf('day');
  let businessDays = 0;

  while (start.isSameOrBefore(end)) {
    if (start.day() !== 0 && start.day() !== 6) {
      businessDays++;
    }
    start.add(1, 'days');
  }

  return businessDays;
}

export function offsetDateForStorage(date, projectStartDate) {
  const start = moment(projectStartDate);
  const current = moment(date);
  const daysSinceStart = current.diff(start, 'days');
  const weeksElapsed = Math.floor(daysSinceStart / 5);
  const daysInCurrentWeek = daysSinceStart % 5;
  
  return start.clone()
    .add(weeksElapsed * 7, 'days')
    .add(daysInCurrentWeek, 'days')
    .format('YYYY-MM-DD');
}

export function reverseOffsetForDisplay(date, projectStartDate) {
  const start = moment(projectStartDate);
  const current = moment(date);
  const totalDays = current.diff(start, 'days');
  const weeksElapsed = Math.floor(totalDays / 7);
  const daysInCurrentWeek = Math.min(totalDays % 7, 5);
  
  return start.clone()
    .add(weeksElapsed * 5, 'days')
    .add(daysInCurrentWeek, 'days')
    .format('YYYY-MM-DD');
}
