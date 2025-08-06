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
  BoardModel.findOne({name: board}, async (err, Boarddata) =>{
    if(!Boarddata){
      const newBoard = await createEmptyBoard(board);
      console.log("newBoard", newBoard)

      saveBoard(newBoard, newThread, res);
    }else{
      saveBoard(Boarddata, newThread, res);
    }
  });
}

function saveNewReportedThread(boardData, report_id, res){
  const date = new Date();
  let reportedThread = boardData.threads.id(report_id);
  reportedThread.reported = true;
  reportedThread.bumped_on = date;
  boardData.save((err, updatedData) => {
    res.send("Success!");
  });
}

function reportThread(report_id, board, res){
  BoardModel.findOne({ name: board }, (err, boardData) => {
      if(!boardData){
        res.json({ error: "Board Not found." });
      }else{
        saveNewReportedThread(boardData, report_id, res);
      }
    });
}

async function mapThread(data){
  return data.threads.map((thread) => {
    const{
      _id,
      text,
      created_on,
      bumped_on,
      reported,
      delete_password,
      replies,
    } = thread;

    return {
      _id,
      text,
      created_on,
      bumped_on,
      reported,
      delete_password,
      replies,
      replycount: thread.replies.length,
    };
  });
}

function deleteThread(thread_id, delete_password, board, res){
  BoardModel.findOne({ name: board }, (err, boardData) =>{
    if(!boardData){
      res.json({error: "Board not found."});
    }else{
      let threadToDelete = boardData.threads.id(thread_id);
      if(threadToDelete.delete_password === delete_password){threadToDelete.remove();}
      else{res.send("Incorrect Password"); return;}

      boardData.save((err, updatedData) => {
        res.send("Success!");
      });
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

  })
  .get((req, res) => {
    const board = req.params.board;
    BoardModel.findOne({ name: board }, async (err, data) => {
      if(!data){
        console.log("No Board with this name.");
        res.json({ error: "No Board with this name."});
      } else{
        console.log("data", data);
        const threads = await mapThread(data);
        res.json(threads);
      }
    });
  })
  .put((req, res) => {
    console.log("put", req.body);
    const { report_id } = req.body;
    const board = req.params.board;

    reportThread(report_id, board, res);
  })
  .delete((req, res) => {
    console.log("delete", req.body);
    const { thread_id, delete_password } = req.body;
    const board = req.params.board;

    deleteThread(thread_id, delete_password, board, res);
  });
    
  app.route('/api/replies/:board');
};
