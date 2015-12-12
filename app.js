var express = require('express');
var config = require('./config.js');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var csrf = require('csurf');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('./models/user.js');

var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })

var app = express();

var connStr = config.dev.db;
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log("Successfully connected to MongoDB");
});

/* View Engine. */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(csrfProtection)

/* Routes. */
app.get('/', function(req, res) {
  res.render('index', { title: 'punchTime Auth - Login', csrfToken: req.csrfToken()});
});

app.get('/registration', function(req, res) {
  res.render('register', { title: 'punchTime Auth - Registration', csrfToken: req.csrfToken()});
});

app.post('/auth',parseForm, function(req, res){

    //authenticate user
    var username = req.body.u;
    var password = req.body.p;
    var ieq = req.body.eq.split(",").map(Number);

    if(username && password){
        punchTimeAuth(username, password, ieq, function(isUser){
            res.send(isUser);
        });
    }
    else res.send('false');
});

app.post('/register',parseForm, function(req, res){
    var username = req.body.u,
        password = req.body.p,
        email = req.body.e,
        fit = req.body.fit;

    //register user
    var newUser = new User({
        username:username,
        password:password,
        email:email,
        equation: fit
    });

    newUser.save(function(err){
        if(err) res.send("false");
        else res.send("true");
    });

});

function punchTimeAuth(username, password, ieq, cb){
    var isUser= false;

    User.findOne({username:username}, function(err, user){
        if(user){
            user.comparePassword(ieq, password, function(err, isMatch){
                cb(isMatch);
            });
        }
        else cb(isUser);
    });
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
