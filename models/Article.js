var mongoose = require("mongoose");

// Reference for Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },

    // References Note model
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

// Creates model from above schema
var Article = mongoose.model("Article", ArticleSchema);

// Exports Note model
module.exports = Article;