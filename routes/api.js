'use strict';
const BoardModel = require('../models').Board;
const ThreadModel = require('../models').Thread;
const ReplyModel = require('../models').Reply;

module.exports = function (app) {
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};
