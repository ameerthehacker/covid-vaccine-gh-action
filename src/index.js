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
    const availableSessions = await getAvailableSessions();

    await notify('+919566602688', availableSessions);

    db.update(availableSessions);
  }
  catch(err) {
    console.error(err);
  }
})();
