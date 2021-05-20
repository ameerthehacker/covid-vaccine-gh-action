const request = require('./request');

function formatMessage(sessions) {
  const chunks = [];

  for (const session of sessions) {
    chunks.push(`!VACCINE SLOTS AVAILABLE!\nCenter: ${session.name}\nAddress: ${session.address}\nMin Age: ${session.min_age_limit} \nVaccine: ${session.vaccine}`);
  }

  return chunks.join('\n');
}

async function notify(sendTo, sessions) {
  const twillioAccoutSID = process.env.TWILLIO_ACCOUNT_SID;
  const twillioAuthToken = process.env.TWILLIO_AUTH_TOKEN;

  if (!twillioAccoutSID || !twillioAuthToken) {
    console.log('ERROR: TWILLIO_ACCOUNT_SID or TWILLIO_AUTH_TOKEN is not set in the environment variable so not sending sms');

    process.exit(1);
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twillioAccoutSID}/Messages.json`;
  const content = formatMessage(sessions);
  const crendentials = Buffer.from(`${twillioAccoutSID}:${twillioAuthToken}`).toString('base64');

  console.log('Found vaccine slots, sending message...');
  console.log(content);

  sendTo = Array.isArray(sendTo)? sendTo: [sendTo];

  for (const mobileNumber of sendTo) {
    await request.post(url, {
      From: '+14243544121',
      To: mobileNumber,
      Body: content
    }, {
      'Authorization': `Basic ${crendentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });
  }
}

module.exports = { notify };
