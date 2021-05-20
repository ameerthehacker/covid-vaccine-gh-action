const config = require('./config');
const db = require('./db');
const { getAvailableSessions } = require('./api');
const { validateConfig } = require('./validator');
const { notify } = require('./notification');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}
 
(async () => {
  validateConfig(config);

  try {
    console.log('Checking for vaccine slots availability');

    const availableSessions = await getAvailableSessions();

    await notify(availableSessions);

    db.update(availableSessions);

    if (availableSessions.length === 0) {
      console.log('No vaccine slots available!');
    }
  }
  catch(err) {
    console.error(err);
  }
})();
