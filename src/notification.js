const request = require('./request');

function formatMessage(sessions) {
  const chunks = [];

  for (const session of sessions) {
    chunks.push(`!VACCINE SLOTS AVAILABLE!\nCenter: ${session.name}\nAddress: ${session.address}\nMin Age: ${session.min_age_limit} \nVaccine: ${session.vaccine}`);
  }

  return chunks.join('\n');
}

async function notify(sendTo, sessions) {
  sendTo = Array.isArray(sendTo)? sendTo: [sendTo];

  for (const mobileNumber of sendTo) {
    
  }
}

module.exports = { formatMessage };
