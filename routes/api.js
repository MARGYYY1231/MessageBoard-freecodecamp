'use strict';

const { board } = require('../models');

const BoardModel = require('../models').Board;
const ThreadModel = require('../models').Thread;
const ReplyModel = require('../models').Reply;

/**
 * Creates a new empty thread.
 * @param {*} txt 
 * @param {*} delete_pass 
 * @returns 
 */
async function newEmptyThread(txt, delete_pass) {
  return new ThreadModel({
    text: txt,
    created_on: new Date(),
    bumped_on: new Date(),
    delete_password: delete_pass,
    replies: [],
    reported: false,
  });
}

/**
 * Creates a new Board given the board name.
 * @param {*} board 
 * @returns 
 */
async function createEmptyBoard(board) {
  return new BoardModel({
    name: board,
    threads: [],
  });
}

/**
 * Saves the board with the new Thread.
 * @param {*} board 
 * @param {*} newThread 
 * @param {*} res 
 */
function saveBoard(board, newThread, res){
  board.threads.push(newThread);
  board.save((err, data) => {
    if(err || !data){res.send("There is an error saving in post.");}
    else{
      if (process.env.NODE_ENV === 'test') {res.json(newThread)}
      else{res.redirect(`/b/${board.name}/${newThread._id}`);}
    }
  });
}

/**
 * Checks if the board exists.
 * @param {*} board 
 * @param {*} newThread 
 * @param {*} res 
 */
function findBoard(board, newThread, res) {
  BoardModel.findOne({name: board}, async (err, Boarddata) =>{
    if(!Boarddata){
      const newBoard = await createEmptyBoard(board);
      await newBoard.save();
      console.log("newBoard", newBoard)

      saveBoard(newBoard, newThread, res);
    }else{
      saveBoard(Boarddata, newThread, res);
    }
  });
}

/**
 * Saves the reported thread.
 * @param {*} boardData 
 * @param {*} report_id 
 * @param {*} res 
 */
function saveNewReportedThread(boardData, report_id, res){
  const date = new Date();
  let reportedThread = boardData.threads.id(report_id);
  reportedThread.reported = true;
  reportedThread.bumped_on = date;
  boardData.save((err, updatedData) => {
    res.send("Successfully Reported Thread!");
  });
}

/**
 * Reports a thread.
 * @param {*} report_id 
 * @param {*} board 
 * @param {*} res 
 */
function reportThread(report_id, board, res){
  BoardModel.findOne({ name: board }, (err, boardData) => {
      if(!boardData){
        res.json({ error: "Board Not found." });
      }else{
        saveNewReportedThread(boardData, report_id, res);
      }
    });
}

/**
 * Adds Extra property (replt_count) to thread.
 * Reply count is used to count the number of replies in a thread.
 * @param {*} data 
 * @returns New Thread with reply_count proprty.
 */
async function mapThread(data){
  return data.threads
  .sort((a, b) => new Date(b.bumped_on) - new Date(a.bumped_on)) // most recent first
  .slice(0,10)
  .map((thread) => {
    const{
      _id,
      text,
      created_on,
      bumped_on,
      replies,
    } = thread;

    return {
      _id,
      text,
      created_on: new Date(created_on),
      bumped_on: new Date(bumped_on),
      replies: replies
        .slice(-3) // only the most recent 3 replies
        .map((reply) => ({
          _id: reply._id,
          text: reply.text,
          created_on: new Date(reply.created_on)
        })),
      replycount: thread.replies.length,
    };
  });
}

/**
 * Views Threads on a board.
 * @param {*} board 
 * @param {*} res 
 */
function viewThreads(board, res){
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
}

/**
 * Deletes a thread if it has the correct password.
 * @param {*} thread_id 
 * @param {*} delete_password 
 * @param {*} board 
 * @param {*} res 
 */
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

/**
 * Returns a new Reply Object.
 * @param {*} text 
 * @param {*} delete_password 
 * @returns 
 */
async function createReply(text, delete_password) {
  return new ReplyModel({
    text: text,
    delete_password: delete_password,
    bumped_on: new Date(),
    created_on: new Date(),
    reported: false,
  });
}

/**
 * Adds Reply to a thread
 * @param {*} thread_id 
 * @param {*} board 
 * @param {*} newReply 
 * @param {*} res 
 */
function addReply(thread_id, board, newReply, res){
  BoardModel.findOne({ name: board }, (err, data) => {
    if(!data){res.json({ error: "Board Not Found."});}
    else{
      console.log("thread is being updated.")
;      updateThread(thread_id, newReply, data, res);
    }
  });
}

/**
 * Updates the thread to add the reply.
 * @param {*} thread_id 
 * @param {*} newReply 
 * @param {*} data 
 * @param {*} res 
 */
function updateThread(thread_id, newReply, data, res){
  const date = new Date();
  let threadToReply = data.threads.id(thread_id);
  threadToReply.bumped_on = date;
  threadToReply.replies.push(newReply);
  console.log("thread is going to be saved.");
  data.save((err, updatedData) => {
    if (process.env.NODE_ENV === 'test') {
      // Send JSON when testing
      //res.json(newReply);
      res.json(updatedData);
    } else {
      // Redirect in normal usage
      res.redirect(`/b/${board}/${thread_id}#${newReply._id}`);
    }
  });
}

/**
 * Shows the Reply.
 * @param {*} board 
 * @param {*} req 
 * @param {*} res 
 */
function viewReply(board, req, res) {
  const threadId = req.query.thread_id;

  BoardModel.findOne({ name: board }, (err, data) => {
    if (err || !data) {
      console.log("No Board found with this name.");
      return res.json({ error: "Board Not Found :(" });
    }

    const thread = data.threads.id(threadId);
    if (!thread) {
      return res.json({ error: "Thread Not Found." });
    }

    // Prepare cleaned response
    const cleanedThread = {
      _id: thread._id,
      text: thread.text,
      created_on: thread.created_on,
      bumped_on: thread.bumped_on,
      replies: thread.replies.map(reply => ({
        _id: reply._id,
        text: reply.text,
        created_on: reply.created_on
      }))
    };

    res.json(cleanedThread);
  });
}


/**
 * Reports Reply.
 * @param {*} thread_id 
 * @param {*} reply_id 
 * @param {*} board 
 * @param {*} res 
 */
function reportReply(thread_id, reply_id, board, res){
  BoardModel.findOne({ name: board }, (err, data) => {
    if(!data){res.json({error: "Board Not Found."});}
    else{
      console.log("data", data);
      let reportedThread = data.threads.id(thread_id);
      let reportedReply = reportedThread.replies.id(reply_id);
      const date = new Date();
      reportedReply.bumped_on = date;
      reportedReply.reported = true;

      data.save((err, updatedData) => {
        if(!err) {res.send("Sucessfully reported a reply!");}
      });
    }
  });
}

/**
 * Deletes Reply.
 * @param {*} board 
 * @param {*} thread_id 
 * @param {*} reply_id 
 * @param {*} delete_password 
 * @param {*} res 
 */
function deleteReply(board, thread_id, reply_id, delete_password, res){
  BoardModel.findOne({ name: board },  (err, data) => {
    if(!data){res.json({error: "Board with that name not found!"});}
    else{
      console.log("data", data);
      let thread = data.threads.id(thread_id);
      let reply = thread.replies.id(reply_id);
      if(reply.delete_password === delete_password){
        reply.remove();
      }else{
        res.send("Incorrect Password. Reply not removed.");
        return;
      }
      data.save((err, updatedData) => {
        if(!err){res.send("Suceesfully deleted reply.");}
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

    viewThreads(board, res);
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
    
  app.route('/api/replies/:board')
  .post(async (req, res) => {
    const { thread_id, text, delete_password } = req.body;
    let board = req.params.board;
    console.log("Create new reply");
    const newReply = await createReply(text, delete_password);

    addReply(thread_id, board, newReply, res);
  })
  .get((req, res) => {
    const board = req.params.board;

    console.log("View new reply");
    viewReply(board, req, res);
  })
  .put((req, res) => {
    const { thread_id, reply_id } = req.body;
    const board = req.params.board;
    reportReply(thread_id, reply_id, board, res);
  })
  .delete((req, res) => {
    const { thread_id, reply_id, delete_password } = req.body;
    const board = req.params.board;
    deleteReply(board, thread_id, reply_id, delete_password, res);
  });
};
