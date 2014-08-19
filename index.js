var Promise = require('bluebird'), 
  Trello = require("node-trello"),
  util = require('util'),
    _ = require('lodash');

var toGenerateKey = "https://trello.com/1/appKey/generate#";

var t = Promise.promisifyAll(new Trello("23dafa7e5a201bbdff1ec66915ec1e2f", "218821ed25792c18bd61b38416810af30e0a399993290f83a30480860c8a1721"));

function logPromiseResult (result) {
  result.then(function (result) {
    console.log(util.inspect(result, false, 7, true));
  }).catch(function (err) {
    console.log(util.inspect(err, false, 7, true));
  });
}

logPromiseResult(t.getAsync("/1/members/me", { cards: "open" }).then(function (result) {
  var cards = _.map(result.cards, function (card) { return _.pick(card, ['id', 'name', 'url', 'idBoard', 'idList'])});
  var boardIds = _.uniq(_.pluck(cards, 'idBoard'));
  var listIds = _.uniq(_.pluck(cards, 'idList'));

  return Promise.all([
      cards,
      Promise.all(boardIds).reduce(function (list, id) {
        return t.getAsync("/1/boards/" + id + "/name").then(function (result) {  list[id] = result._value; return list; });
      }, {}),
      Promise.all(listIds).reduce(function (list, id) {
        return t.getAsync("/1/lists/" + id + "/name").then(function (result) {  list[id] = result._value; return list; });
      }, {})
  ]);
}).spread(function (cards, boards, lists) {
  return _.map(cards, function (card) {
    card.board = boards[card.idBoard];
    card.list = lists[card.idList];
    return _.omit(card, ['idBoard', 'idList']);
  })
}).then(function (cards) {
  return _.omit(_.groupBy(cards, 'list'), [
    'Backlog',
    'Discussion',
    'Someday',
    'Released',
    'PASSED QA - VERIFIED!',
    'Design/Product signoff',
    'Design/Product Signoff'
  ]);
}));

