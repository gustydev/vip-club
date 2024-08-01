const User = require('../models/user');
const Message = require('../models/message');
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs')
const passport = require("passport");

exports.index = asyncHandler(async function(req, res, next) {
    const messages = await Message.find().populate('author').exec();

    res.render('index', {title: 'VIP Club', user: req.user, messages: messages, user: req.user})
})

exports.messagePost = [
    body('text', 'Invalid message').trim().isLength({min: 1}).escape().unescape(),

    asyncHandler(async function(req, res, next) {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
            const message = new Message({
                author: req.user,
                text: req.body.text,
                posted: new Date()
            })
            await message.save();
            res.redirect('/')
        } else {
            const messages = await Message.find().populate('author').exec();
            res.render('index', {title: 'VIP Club', user: req.user, messages: messages, user: req.user, errors: errors.array()})
        }
    })
]

exports.messageDeletePost = asyncHandler(async function (req, res, next) {
    if (req.user.admin) {
        await Message.findByIdAndDelete(req.body.message).exec();
    }

    res.redirect('/')
})

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
    body('password').notEmpty().withMessage('Password is required').isLength({min: 4}).withMessage('Password has a min length of 4 characters').trim().escape(),
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
                    res.render('sign-up-success', {
                        title: 'Log in',
                        user: user
                    })
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
    res.render('login', {title: 'Log in', errors: req.session.messages})
}

exports.loginPost = [
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureMessage: true
    })
]

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
    if (req.body.password === process.env.VIP_PASS) {
        await User.findByIdAndUpdate(req.user._id, {vip: true});
        res.redirect('/')
    } else {
        res.render('vip-apply', {title: 'Apply for VIP', wrong: 'Wrong password!!'})
    }
})