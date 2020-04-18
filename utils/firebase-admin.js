var admin = require("firebase-admin");

var serviceAccount = require("./secret.json");

module.exports = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://spilpal.firebaseio.com"
});
