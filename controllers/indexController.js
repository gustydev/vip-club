const User = require('../models/user');
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = function(req, res, next) {
    res.render('index', {title: 'VIP Club'})
}

exports.signUpGet = function (req, res, next) {
    res.render('sign-up', {title: 'Sign up'});
}

exports.signUpPost = [
    // validate and sanitize inputs
    body('username', 'Username is required').isLength({min: 1}).trim().escape(),
    body('password', 'Password is required (minimum of 4 characters)').isLength({min: 4}).trim().escape(),
    body('passwordConfirm').custom((value, {req}) => {
        if (value === req.body.password) {
            return true
        } else {
            throw new Error('Passwords do not match!')
        }
    }),

    // then...
    asyncHandler(async function(req, res, next) {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
            try {
                const user = new User({
                  username: req.body.username,
                  password: req.body.password, // Encrypt this!!!11,
                  joined: new Date(),
                  vip: false,
                  admin: false
                })
                await user.save()
                res.redirect('/')
              } catch {
                return next(err)
              }
        } else {
            res.render('sign-up', {
                title: 'Sign up', 
                username: req.body.username,
                errors: errors.array()
            })
        }
    })
];