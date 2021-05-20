const path = require('path');
const fs = require('fs');
const { getTodayDate } = require('./utils');

const DB_PATH = path.join(__dirname, 'db.json');

function read() {
  if (!fs.existsSync(DB_PATH)) {
    const dbSchema = {
      date: getTodayDate(),
      notifiedSessions: []
    };

    fs.writeFileSync(DB_PATH, JSON.stringify(dbSchema, null, 2));
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

  return data;
}

function update(sessions) {
  const data = read();
  const today = getTodayDate();

  if (data.date === today) {
    data.notifiedSessions.push(...sessions.map(session => session.session_id));
  } else {
    data.date = today;
    data.notifiedSessions = sessions.map(session => session.session_id);
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function find(session) {
  const data = read();
  const today = getTodayDate();

  if (data.date === today) {
    return data.notifiedSessions.find(notifiedSession => notifiedSession === session.session_id);
  } else {
    return null;
  }
}

module.exports = {
  update,
  read,
  find
};
