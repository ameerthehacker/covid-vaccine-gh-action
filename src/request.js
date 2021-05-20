const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      res.setEncoding("utf8");

      let body = "";

      res.on("data", data => {
        body += data;
      });

      res.on("end", () => {
        if (res.statusCode >= 300 || res.statusCode < 200) reject(new Error(`request failed with code ${res.statusCode}: ${body}`));
        
        try {
          body = JSON.parse(body);

          resolve(body);
        } catch {
          reject(new Error(`failed to parse body ${body} as JSON`));
        }
      });
    });
  });
}

function post(url, body = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const req = https.request({
      method: 'POST',
      host: urlObj.hostname,
      path: urlObj.pathname,
      port: urlObj.port,
      headers
    }, (res) => {
      res.on('data', body => {
        if (res.statusCode >= 300 || res.statusCode < 200) reject(new Error(`request failed with code ${res.statusCode}: ${body}`));

        try {
          body = JSON.parse(body);

          resolve(body);
        } catch {
          reject(new Error(`failed to parse body ${body} as JSON`));
        }
      })
    });

    req.on('error', error => {
      reject(error);
    })
    req.write(new URLSearchParams(Object.entries(body)).toString());
    req.end();
  });
}

module.exports = { get, post };
