const https = require('https');
const config = require('./config');
const path = require('path');
const fs = require('fs');

// https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
const TODAY = (() => {
  let date = new Date(),
      month = '' + (date.getMonth() + 1),
      day = '' + date.getDate(),
      year = date.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [day, month, year].join('-');
})();

const AVAILABLE_VACCINES = ['COVISHIELD', 'COVAXIN', 'SPUTNIK V'];
const ENDPOINT = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${config.pincode}&date=${TODAY}`;
const DB_PATH = path.join(__dirname, 'db.json');

function validateConfig() {
  if (!config.pincode) {
    console.error('no pincode was provided in the config');

    process.exit(1);
  }
  const ageFilters = config.minAge || [];

  for (const ageFilter of ageFilters) {
    if (isNaN(ageFilter)) {
      console.error(`invalid minAge ${ageFilter} in config`);

      process.exit(1);
    }
  }

  const vaccineFilters = config.vaccines || [];

  for (const vaccineFilter of vaccineFilters) {
    if (!AVAILABLE_VACCINES.includes(vaccineFilter.toUpperCase())) {
      console.error(`invalid vaccine ${vaccineFilter} in config`);

      process.exit(1);
    }
  }
}

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const dbSchema = {
      date: TODAY,
      notifiedSessions: []
    };

    fs.writeFileSync(DB_PATH, JSON.stringify(dbSchema, null, 2));
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

  return data;
}

function updateDB(session) {
  const data = readDB();

  if (data.date === TODAY) {
    data.notifiedSessions.push(session.session_id);
  } else {
    data.date = TODAY;
    data.notifiedSessions = [session.session_id];
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function findSessionInDB(session) {
  const data = readDB();

  if (data.date === TODAY) {
    return data.notifiedSessions.find(notifiedSession => notifiedSession === session.session_id);
  } else {
    return null;
  }
}

function getCalendar() {
  return new Promise((resolve, reject) => {
    https.get(ENDPOINT, res => {
      res.setEncoding("utf8");

      let body = "";

      res.on("data", data => {
        body += data;
      });

      res.on("end", () => {
        if (res.statusCode != 200) reject(new Error(`request failed with code ${res.statusCode}: ${body}`));
        
        try {
          body = JSON.parse(body);

          resolve(body);
        } catch {
          reject(new Error(`failed to parse response ${body} as JSON`));
        }
      });
    });
  });
}

function isSessionAvailable(session) {
  const minAgeFilters = config.minAge || [18, 45];
  const vaccineFilters = config.vaccines || AVAILABLE_VACCINES;

  const isAgeMatching = minAgeFilters.filter(minAgeFilter => minAgeFilter >= session.min_age_limit).length > 0;
  const isVaccineMatching = vaccineFilters.filter(vaccineFilter => vaccineFilter.toUpperCase() === session.vaccine).length > 0;
  const hasSlots = session.available_capacity > 0;
  const isSessionNotified = findSessionInDB(session);

  return isAgeMatching && isVaccineMatching && hasSlots && !isSessionNotified;
}
 
(async () => {
  validateConfig();

  try {
    const calendar = await getCalendar();

    for (const center of calendar.centers) {
      for (const session of center.sessions) {
        if (isSessionAvailable(session)) {
          console.log(session);

          updateDB(session);

          process.exit(0);
        } else {
          console.log(session);
        }
      }
    }
  }
  catch(err) {
    console.error(err);
  }
})();

