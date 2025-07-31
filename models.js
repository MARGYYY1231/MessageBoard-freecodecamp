const mongoose = require('mongoose');
const { Schema } = mongoose;

const date = new Date();

const ReplySchema = new Schema({
    text: { type: String },
    delete_password: { type: String },
    created_on: { type: Date, default: date },
    bumped_on: { type: Date, default: date },
    reported: { type: Boolean, default: false }
});

const Reply = mongoose.model("Reply", ReplySchema);