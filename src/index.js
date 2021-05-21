const config = require('./config');
const db = require('./db');
const { getAvailableSessions } = require('./api');
const { validateConfig } = require('./validator');
const { notify } = require('./notification');
const tr = require('tor-request');

// cowin api has geofencing hence using the open tor networkg
tr.request('https://api.ipify.org', function (err, res, body) {
  if (!err && res.statusCode == 200) {
    console.log("Your public (through Tor) IP is: " + body);
  }
});

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

    process.exit(1);
  }
})();
