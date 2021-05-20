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

module.exports = { get };
