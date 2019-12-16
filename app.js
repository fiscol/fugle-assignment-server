var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var API_Router = require('./routes/api');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', API_Router);

module.exports = app;
