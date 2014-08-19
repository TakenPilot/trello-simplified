var Promise = require('bluebird'), 
  Trello = require("node-trello"),
  util = require('util');

var toGenerateKey = "https://trello.com/1/appKey/generate#";

var t = Promise.promisifyAll(new Trello("23dafa7e5a201bbdff1ec66915ec1e2f", "48606d67a456aa111a0fe7aa2acbd7f675854543428d55d17567a89258eba2da"));

function logPromiseResult (result) {
  result.then(function (result) {
    console.log(util.inspect(result, false, 7, true));
  }).catch(function (err) {
    console.log(util.inspect(err, false, 7, true));
  });
}

logPromiseResult(t.getAsync("/1/boards/jEwkydqO/lists"));

logPromiseResult(t.getAsync("/1/members/me", { cards: "open" }));