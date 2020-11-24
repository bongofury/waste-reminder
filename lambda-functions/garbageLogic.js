const calendar = require('./garbage-data/calendar.json');

const getGarbageDateYYYYMMDD = () => {
  // garbage date is tomorrow from today's 12:00am
  const garbageDate = new Date(Date.now() + (12 * 60 * 60 * 1000));
  const garbageDateYYYY = garbageDate.getFullYear();
  const garbageDateMM = `${garbageDate.getMonth() + 1}`.padStart(2, '0');
  const garbageDateDD = `${garbageDate.getDate()}`.padStart(2, '0');
  return `${garbageDateYYYY}${garbageDateMM}${garbageDateDD}`;
};

const getGarbageResponse = () => {
  const date = getGarbageDateYYYYMMDD();
  return {
    date,
    items: calendar[date] || [],
  };
};

module.exports = getGarbageResponse;
