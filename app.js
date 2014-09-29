var co = require('co');
var thunkify = require('thunkify');
var requestapi = require('request');
var question = require('co-prompt');
var fs = require('co-fs');

var util = require('./util');

var password = question.password;
var request = thunkify(requestapi);
var post = thunkify(requestapi.post);
var getFullBackup = thunkify(require("./dashlane").getFullBackup);

var getToken = function *(email) {
  var resp = yield post('https://ws1.dashlane.com/6/authentication/sendtoken', {
    form: {
      login: email,
    }
  });
  return yield question("What is your token ? ");
}

co(function *() {
  var config = {};
  if (yield fs.exists('config.json')) {
    config = JSON.parse(yield fs.readFile('config.json'));
  }
  var opts = {};
  opts.login = yield question("What is your email ? ");
  if (config[opts.login] && config[opts.login].uki)
    opts.uki = config[opts.login].uki;
  else
    opts.token = yield getToken(email);
  opts.password = yield password("What is your password ? ");
  console.log((yield getFullBackup(opts)).toString());
})();
