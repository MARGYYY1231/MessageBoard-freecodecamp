'use strict';

const { board } = require('../models');

const BoardModel = require('../models').Board;
const ThreadModel = require('../models').Thread;
const ReplyModel = require('../models').Reply;

async function newEmptyThread(txt, delete_pass) {
  return new ThreadModel({
    text: txt,
    delete_password: delete_pass,
    replies: [],
  });
}

async function createEmptyBoard(board) {
  return new BoardModel({
    name: board,
    threads: [],
  });
}

function saveBoard(board, newThread, res){
  board.threads.push(newThread);
  board.save((err, data) => {
    if(err || !data){res.send("There is an error saving in post.");}
    else{res.json(newThread);}
  });
}

function findBoard(board, newThread, res) {
  BoardModel.findOne({name: board}, async (err, Boardata) =>{
    if(!BoardData){
      const newBoard = await createEmptyBoard(board);
      console.log("newBoard", newBoard)

      saveBoard(newBoard, newThread, res);
    }else{

    }
  });
}

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .post(async (req, res) => {
    const { text, delete_password } = req.body;
    let board = req.body.board;
    if(!board){board = req.params.board;}
    console.log(req.body);

    //Creating a new thread
    const newThread = await newEmptyThread(text, delete_password);
    console.log("New Thread", newThread)

    findBoard(board, newThread, res);

  });
    
  app.route('/api/replies/:board');

};
