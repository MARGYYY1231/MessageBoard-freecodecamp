const mongoose = require('mongoose');
const { Schema } = mongoose;

const date = new Date();

//Reply Schema
const ReplySchema = new Schema({
    text: { type: String },
    delete_password: { type: String },
    created_on: { type: Date, default: date },
    bumped_on: { type: Date, default: date },
    reported: { type: Boolean, default: false },
});

const Reply = mongoose.model("Reply", ReplySchema);


//Thread Schema
const ThreadSchema = new Schema({
    text: { type: String },
    delete_password: { type: String },
    created_on: { type: Date, default: date },
    bumped_on: { type: Date, default: date },
    reported: { type: Boolean, default: false },
    replies: { type: [ReplySchema] },
});

const Thread = mongoose.model("Thread", ThreadSchema);

//Board Schema
const BoardSchema = new Schema({
    name: { type: String},
    threads: { type: [ThreadSchema] },
});

const Board = mongoose.model("Board", BoardSchema);

exports.Board = Board;
exports.Thread = Thread;
exports.Reply = Reply;