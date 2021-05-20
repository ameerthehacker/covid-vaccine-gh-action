const request = require('./request');
const { getTodayDate } = require('../utils');
const db = require('./db');
const config = require('./config');

function getCalendar() {
  const today = getTodayDate();
  const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${config.pincode}&date=${today}`;

  return request.get(url);
}

function isSessionAvailable(session) {
  const minAgeFilters = config.minAge || [18, 45];
  const vaccineFilters = config.vaccines || AVAILABLE_VACCINES;

  const isAgeMatching = minAgeFilters.filter(minAgeFilter => minAgeFilter >= session.min_age_limit).length > 0;
  const isVaccineMatching = vaccineFilters.filter(vaccineFilter => vaccineFilter.toUpperCase() === session.vaccine).length > 0;
  const hasSlots = session.available_capacity > 0;
  const isSessionNotified = db.find(session);

  return isAgeMatching && isVaccineMatching && hasSlots && !isSessionNotified;
}

async function getAvailableSessions() {
  const calendar = await getCalendar();
  const sessions = [];

  for (const center of calendar.centers) {
    for (const session of center.sessions) {
      if (isSessionAvailable(session)) {
        sessions.push(session);
      }
    }
  }

  return sessions;
}

module.exports = { getAvailableSessions };
