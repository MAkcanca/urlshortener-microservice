require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;
const app = express();

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// Basic Configuration
const port = process.env.PORT || 3000;

// Object schemas
const shorturlSchema = new Schema({
  url: { type: String, required: true },
  creatorIp: String,
  createdDate: Date
});
// Makes url_id field autoincrement id integer
shorturlSchema.plugin(AutoIncrement, { inc_field: 'url_id' });

const ShortURL = mongoose.model("ShortURL", shorturlSchema);

// DB operations
const createAndSaveURL = (req, done) => {
  const shorturl = new ShortURL({
    url: req.body.url,
    creatorIp: req.ip,
    createdDate: new Date()
  }
  );
  shorturl.save(function (err, data) {
    if (err) return console.error(err);
    done(null, data);
  });
};

const findURLByUrlId = (url_id, done) => {
  ShortURL.find({ url_id: url_id }, function (err, data) {
    if (err) return done(err);
    done(null, data);
  })
};

// App

app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/is-mongoose-ok", function (req, res) {
  if (mongoose) {
    res.json({ isMongooseOk: !!mongoose.connection.readyState });
  } else {
    res.json({ isMongooseOk: false });
  }
});

// Your first API endpoint
app.get('/api/shorturl/:id', function (req, res, next) {
  var url_id = req.query.id
  if (!url_id) return res.json({ "error": "Wrong format" })
  findURLByUrlId(url_id, function (err, data) {
    if (!data) return next({ "error": "No short URL found for the given input" })
    res.redirect(data.original_url)
  });
});

app.post('/api/shorturl', function (req, res, next) {
  createAndSaveURL(req, function (err, data) {
    if (err) return next(err);
    res.json({ original_url: data.url, short_url: data.url_id })
  })
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
