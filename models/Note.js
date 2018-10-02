var mongoose = require("mongoose");

// Reference for Schema constructor
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    text: String
});

// Creates model from above schema
var Note = mongoose.model("Note", NoteSchema);

// Exports Note model
module.exports = Note;