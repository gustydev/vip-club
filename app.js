const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const compression = require('compression');

const User = require('./models/user');

require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
});
app.use(limiter);

main().catch(err => console.log(err))
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(compression());
app.use(helmet());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
app.use(passport.session());

// passport functions
// NEED TO BE CALLED BEFORE THE ROUTES!
passport.use(
  new LocalStrategy({passReqToCallback: true}, async (req, username, password, done) => {
    try {
      req.session.messages = []; // Clear messages to avoid duplication
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
