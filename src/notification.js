const request = require('./request');

function formatMessage(sessions) {
  const chunks = [];

  for (const session of sessions) {
    chunks.push(`!VACCINE SLOTS AVAILABLE!\nCenter: ${session.name}\nAddress: ${session.address}\nMin Age: ${session.min_age_limit} \nVaccine: ${session.vaccine}`);
  }

  return chunks.join('\n');
}

async function notify(sessions) {
  const twillioAccoutSID = process.env.TWILLIO_ACCOUNT_SID;
  const twillioAuthToken = process.env.TWILLIO_AUTH_TOKEN;

  if (!twillioAccoutSID || !twillioAuthToken) {
    console.error('ERROR: TWILLIO_ACCOUNT_SID or TWILLIO_AUTH_TOKEN environment variables are not set so not sending sms');

    process.exit(1);
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twillioAccoutSID}/Messages.json`;
  const content = formatMessage(sessions);
  const crendentials = Buffer.from(`${twillioAccoutSID}:${twillioAuthToken}`).toString('base64');

  console.log('Found vaccine slots, sending message...');
  console.log(content);

  if (!process.env.SEND_TO) {
    console.error('ERROR: SEND_TO evironment variale is not set set so not sending the sms');

    process.exit(1);
  }

  if (!process.env.FROM) {
    console.error('ERROR: FROM evironment variale is not set set so not sending the sms');

    process.exit(1);
  }

  const sendTo = process.env.SEND_TO.split(',').map(mobileNumber => `+91${mobileNumber}`);

  for (const mobileNumber of sendTo) {
    await request.post(url, {
      From: process.env.FROM,
      To: mobileNumber,
      Body: content
    }, {
      'Authorization': `Basic ${crendentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });
  }
}

module.exports = { notify };
