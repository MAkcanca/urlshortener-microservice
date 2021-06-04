require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const Schema = mongoose.Schema;
const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;

// Object schemas
const shorturlSchema = new Schema({
  url: { type: String, required: true },
  creatorIp: String,
  createdDate: Date
});
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

// App

app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:id', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res, next) {
  createAndSaveURL(req, function (err, data) {
    if (err) return next(err);
    res.json({ original_url: data.url, short_url: data._id })
  })
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
