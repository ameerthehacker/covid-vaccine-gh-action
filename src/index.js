const config = require('./config');
const db = require('./db');
const { getAvailableSessions } = require('./api');
const { validateConfig } = require('./validator');
 
(async () => {
  validateConfig(config);

  try {
    const availableSessions = await getAvailableSessions();

    db.update(availableSessions);

    for (const availableSession of availableSessions) {
      console.log(availableSession);
    }
  }
  catch(err) {
    console.error(err);
  }
})();
