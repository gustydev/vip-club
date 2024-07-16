const User = require('../models/user');
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs')
const passport = require("passport");

exports.index = function(req, res, next) {
    res.render('index', {title: 'VIP Club', user: req.user})
}

exports.signUpGet = function (req, res, next) {
    res.render('sign-up', {title: 'Sign up'});
}

exports.signUpPost = [
    // validate and sanitize inputs
    body('username', 'Username is required').isLength({min: 1}).custom(async (value) => {
        const user = await User.findOne({username: value})
        if (user) {
            throw new Error(`Username '${value}' already in use. Please try a different one.`)
        }
    }).trim().escape(),
    body('password', 'Password is required (minimum of 4 characters)').isLength({min: 4}).trim().escape(),
    body('passwordConfirm').custom((value, {req}) => {
        if (value === req.body.password) {
            return true
        } else {
            throw new Error('Passwords do not match!')
        }
    }),

    asyncHandler(async function(req, res, next) {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
            try {
                bcrypt.hash(req.body.password, 10, async(err, hashedPass) => {
                    if (err) {
                        return next(err)
                    }

                    const user = new User({
                        username: req.body.username,
                        password: hashedPass,
                        joined: new Date(),
                        vip: false,
                        admin: false
                      })
                    await user.save()
                    res.redirect('/')
                })
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

exports.loginGet = function(req, res, next) {
    res.render('login', {title: 'Log in'})
}

exports.loginPost = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
})

exports.logout = function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err) }
        res.redirect('/')
    })
}

exports.vipApplyGet = function(req,res,next) {
    if (req.user && !req.user.vip) {
        res.render('vip-apply', {title: 'Apply for VIP'})
    } else {
        res.redirect('/')
    }
}

exports.vipApplyPost = asyncHandler(async function(req, res, next) {
    const user = await User.findById(req.user._id);
    if (req.body.password === process.env.VIP_PASS) {
        await User.findByIdAndUpdate(req.user._id, {vip: true});
        res.redirect('/')
    } else {
        res.render('vip-apply', {title: 'Apply for VIP', wrong: 'Wrong password!!'})
    }
})