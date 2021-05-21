const request = require('./request');
const { getTodayDate } = require('./utils');
const db = require('./db');
const config = require('./config');
const tr = require('tor-request');

function getCalendar() {
  const today = getTodayDate();
  const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${config.pincode}&date=${today}`;

  if (process.env.NODE_ENV === 'development') {
    return request.get(url);
  } else {
    return new Promise((resolve, reject) => {
      tr.request(url, function (err, res, body) {
        console.log(body);
        if (!err && res.statusCode == 200) {
          try {
            body = JSON.parse(body);

            resolve(body);
          } catch {
            reject(`Error: unable to parse body ${body} as JSON`);
          }
        } else {
          reject(err);
        }
      })
    });
  }
}

function isSessionAvailable(session) {
  const minAgeFilters = config.minAge || [18, 45];
  const vaccineFilters = config.vaccines || AVAILABLE_VACCINES;

  const isAgeMatching = minAgeFilters.filter(minAgeFilter => minAgeFilter >= session.min_age_limit).length > 0;
  const isVaccineMatching = vaccineFilters.filter(vaccineFilter => vaccineFilter.toUpperCase() === session.vaccine).length > 0;
  const hasSlots = session.available_capacity > 0;
  // in dev we want to ignore the db content for testing
  const isSessionNotified = db.find(session) && !process.env.NODE_ENV === 'development';

  return isAgeMatching && isVaccineMatching && hasSlots && !isSessionNotified;
}

async function getAvailableSessions() {
  const calendar = await getCalendar();
  const sessions = [];

  for (const center of calendar.centers) {
    for (const session of center.sessions) {
      if (isSessionAvailable(session)) {
        sessions.push({ ...session, address: `${center.address}, ${center.district_name}, ${center.state_name}`, name: center.name });
      }
    }
  }

  return sessions;
}

module.exports = { getAvailableSessions };
