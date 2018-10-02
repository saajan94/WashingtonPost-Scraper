// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Middleware
// Logs requests
app.use(logger("dev"));
// Body parser to handle form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Public folder as static directory
app.use(express.static("public"));

// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/WashingtonPostScraper"
mongoose.connect(MONGODB_URI);

// Routes
// GET route for scraping the Washington Post website
app.get("/scrape", function (req, res) {
    axios.get("https://www.washingtonpost.com").then(function (response) {
        var $ = cheerio.load(response.data);

        $(".flex-stack").each(function (i, element) {
            let result = {};

            result.title = $(this)
                .children(".headline")
                .children("a")
                .text()
                .trim();

            result.link = $(this)
                .children(".headline")
                .children("a")
                .attr("href");

            result.summary = $(this)
                .children(".blurb")
                .text()
                .trim();

            console.log(result)
            db.Article.findOne({ title: result.title }).then(response => {
                if (!response) {
                    db.Article.create(result)
                        .then(function (dbArticle) {
                            console.log(dbArticle);
                        })
                } else {
                    console.log("Already exists!")
                }
            });
        });
        res.redirect("/");
    });
});

app.get("/", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            let hbsObject;
            hbsObject = {
                articles: dbArticle
            };
            res.render("index", hbsObject);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route to get articles that the user saved
app.get("/saved", function (req, res) {
    db.Article.find({ saved: true })
        .then(function (retrievedArticles) {
            let hbsObject;
            hbsObject = {
                articles: retrievedArticles
            };
            res.render("saved", hbsObject);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route to grab all scrape articles
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route to save article
app.put("/save/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true })
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            res.json(err)
        });
});

// Route to remove article from saved
app.put("/remove/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false })
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            res.json(err)
        });
});

// Route to grab one article to populate its note
app.get("/articles/:id", function (req, res) {
    db.Article.find({ _id: req.params.id })
        .populate({
            path: "note",
            model: "Note"
        })
        .then(function (dbArticle) {
            console.log(dbArticle);
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err)
        });
});

app.post("/note/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate(
                {
                    _id: req.params.id
                },
                {
                    $push: {
                        note: dbNote._id
                    }
                },
                {
                    new: true
                });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err)
        });
});

app.delete("/note/:id", function (req, res) {
    db.Note.findByIdAndRemove({ _id: req.params.id })
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate(
                {
                    note: req.params.id
                },
                {
                    $pullAll: [
                        {
                            note: req.params.id
                        }
                    ]
                });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});


// Start server
app.listen(PORT, function () {
    console.log(`App running on port ${PORT}!`);
});