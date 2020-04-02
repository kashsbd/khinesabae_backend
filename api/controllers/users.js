const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const sharp = require('sharp');
const _ = require('lodash');
const readFilePromise = require('fs-readfile-promise');
const nodemailer = require('nodemailer');

const { JWT_KEY, PROPIC_URL } = require('../config/config');

const User = require("../models/user");
const Media = require("../models/media");

exports.test = (req, res, next) => {
    res.status(200).json({
        message: 'Hello World!'
    });
}

exports.user_signup = async (req, res, next) => {

    const email = req.body.email;
    const name = req.body.username;
    const password = req.body.password;

    const users = await User.find({ email: email }).exec();

    if (users && users.length >= 1) {
        return res.status(409).json({
            message: "Mail exists"
        });
    } else {
        // init user model 
        const user = new User(
            {
                _id: new mongoose.Types.ObjectId(),
                email: email,
                password: password,
                name: name
            }
        );

        try {
            const result = await user.save();
            //generate token for new user
            const token = jwt.sign(
                {
                    email: result.email,
                    role: result.role,
                    userId: result._id,
                    username : result.name
                },
                JWT_KEY
            );

            return res.status(201).json({
                token: token,
                userId: result._id
            });
        } catch (err) {
            return res.status(500).json({
                error: err
            })
        }
    }
}

exports.user_login = async (req, res, next) => {

    try {
        let users = await User.find({ email: req.body.email, password: req.body.password }).exec();

        if (users && users.length < 1) {
            return res.status(401).json({
                message: "Auth failed"
            });
        }

        // generate token for logged user
        const token = jwt.sign(
            {
                email: users[0].email,
                role: users[0].role,
                userId: users[0]._id,
                username: users[0].name,
            },
            JWT_KEY
        );

        return res.status(200).json(
            {
                token: token,
                userName: users[0].name,
                userId: users[0]._id
            }
        );

    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
}

exports.get_all_users = async (req, res, next) => {
    let users = await User.find({}).exec();
    if (users) {
        if (users.length >= 1) {
            return res.status(200).send(users);
        } else {
            return res.status(200).send([]);
        }
    }
    return res.status(500).json({ message: "Internal Server Error" });
}

exports.delete_user = async (req, res, next) => {

    const _id = req.body._id;
    const deletedBy = req.body.deletedBy;

    let admin = await User.findById({ _id: deletedBy }).exec();

    if (admin) {
        let user = await User.findOneAndDelete({ _id }).exec();

        if (user) {
            return res.status(200).json({ message: "User Deleted" });
        }

        return res.status(404).json({ message: "User Not Found" });
    }

    return res.status(401).json({ message: "Can't Delete User. Permission Denied" });
}

exports.update_user = async (req, res, next) => {

    const _id = req.body._id;

    let user = await User.find({ _id }).exec();

    if (user) {

        if (req.body.username) {
            user[0].name = req.body.username;
        }

        if (req.body.email) {
            user[0].email = req.body.email;
        }

        if (req.body.password) {
            user[0].password = req.body.password;
        }

        try {
            await user[0].save();
            return res.status(200).json({ message: "User Updated" });

        } catch (e) {
            return res.status(500).json({ error: e });
        }
    }

    return res.status(404).json({ message: "User Not Found" });
}

exports.send_mail = async (req, res, next) => {

    const {
        name,
        email,
        subject,
        message
    } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'khinesabaejewellery@gmail.com',
            pass: 'W@keupkhinesabae!123'
        }
    });

    let mailOptions = {
        from: email,
        to: 'khinesabaejewellery@gmail.com',
        subject: subject,
        text: 'Feedback from ' + name + '\n' + message
    };

    try {
        let mail_sender = await transporter.sendMail(mailOptions);
        return res.status(200).json({
            msg: 'OK'
        });
    } catch (error) {
        return res.status(500).json(
            {
                error: error
            }
        )
    }
}


