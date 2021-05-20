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
        if (res.statusCode != 200) reject(new Error(`request failed with code ${res.statusCode}: ${body}`));
        
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
    const req = https.request({
      method: 'POST',
      href: url,
      headers
    }, (res) => {
      if (res.statusCode != 200) reject(new Error(`request failed with code ${res.statusCode}: ${body}`));

      res.on('data', body => {
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
  
    req.write(encodeURIComponent(JSON.stringify(body)));
  });
}

module.exports = { get, post };
