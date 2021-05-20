function getTodayDate() {
  // https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
  let date = new Date(),
      month = '' + (date.getMonth() + 1),
      day = '' + date.getDate(),
      year = date.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [day, month, year].join('-');
}

module.exports = { getTodayDate };
