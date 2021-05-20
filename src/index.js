const config = require('./config');
const db = require('./db');
const { getAvailableSessions } = require('./api');
const { validateConfig } = require('./validator');
const { formatMessage } = require('./notification');
 
(async () => {
  validateConfig(config);

  try {
    const availableSessions = await getAvailableSessions();

    console.log(formatMessage(availableSessions));

    db.update(availableSessions);
  }
  catch(err) {
    console.error(err);
  }
})();
