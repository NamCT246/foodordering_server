var crypto = require('crypto');
var	mongoose = require('mongoose');
// var User = mongoose.model('User');
var	config = require('../config.js');
// var	phoneReg = require('../lib/phone_verification')(config.Authy_API_KEY);

// const Client = require('authy-client').Client;
// const authy = new Client({key: config.Authy_API_KEY});

// function hashPW(pwd) {
//     return crypto.createHash('sha256').update(pwd).digest('base64').toString();
// }

// exports.login = function (req, res){
// 	User.findOne({username: req.body.username})
//         .exec(function (err, user) {
//             if (!user) {
//                 err = 'Username Not Found';
//             } else if (('password' in req.body) && (user.hashed_password !==
//                 hashPW(req.body.password.toString()))) {
//                 err = 'Wrong Password';
//             } else {
//                 createSession(req, res, user);
//             }

//             if (err) {
//                 res.status(500).json(err);
//             }
//         });
// };

// exports.logout = function (req, res) {
//     req.session.destroy(function (err) {
//         if (err) {
//             console.log("Error Logging Out: ", err);
//             return next(err);
//         }
//         res.status(200).send();
//     });
// };

// exports.loggedIn = function (req, res) {
//     if (req.session.loggedIn && req.session.authy) {
//         res.status(200).json({url: "/protected"});
//     } else if (req.session.loggedIn && !req.session.authy) {
//         res.status(200).json({url: "/2fa"});
//     } else {
//         res.status(409).send();
//     }
// };

exports.signup = function (req, res) {

    var username = req.body.username;
    User.findOne({username: username}).exec(function (err, user) {
        if (err) {
            console.log(err);
            res.status(500).json({err: "Failed, try again"});
            return;
        }
        if (user) {
            res.status(409).json({err: "Username Already Registered"});
            return;
        }

        user = new User({username: req.body.username});

        user.set('hashed_password', hashPW(req.body.password));
        user.set('email', req.body.email);
        user.set('phone', req.body.phone);
        user.set('authyId', null);
        user.save(function (err) {
            if (err) {
                console.log('Error Creating User', err);
                res.status(500).json(err);
            } else {

                authy.registerUser({
                    countryCode: "+358",
                    email: req.body.email,
                    phone: req.body.phone_number
                }, function (err, regRes) {
                    if (err) {
                        console.log('Error Registering User with Authy');
                        res.status(500).json(err);
                        return;
                    }

                    user.set('authyId', regRes.user.id);

                    // Save the AuthyID into the database then request an SMS
                    user.save(function (err) {
                        if (err) {
                            console.log('error saving user in authyId registration ', err);
                            res.session.error = err;
                            res.status(500).json(err);
                        } else {
                            createSession(req, res, user);
                        }
                    });
                });
            }
        });
    });
};

// exports.sms = function (req, res) {
//     var username = req.session.username;
//     User.findOne({username: username}).exec(function (err, user) {
//         console.log("Send SMS");
//         if (err) {
//             console.log('SendSMS', err);
//             res.status(500).json(err);
//             return;
//         }
         
//         authy.requestSms({authyId: user.authyId}, {force: true}, function (err, smsRes) {
//             if (err) {
//                 console.log('ERROR requestSms', err);
//                 res.status(500).json(err);
//                 return;
//             }
//             console.log("requestSMS response: ", smsRes);
//             res.status(200).json(smsRes);
//         });

//     });
// };

// exports.verify = function (req, res) {
//     var username = req.session.username;
//     User.findOne({username: username}).exec(function (err, user) {
//         console.log("Verify Token");
//         if (err) {
//             console.error('Verify Token User Error: ', err);
//             res.status(500).json(err);
//         }
//         authy.verifyToken({authyId: user.authyId, token: req.body.token}, function (err, tokenRes) {
//             if (err) {
//                 console.log("Verify Token Error: ", err);
//                 res.status(500).json(err);
//                 return;
//             }
//             console.log("Verify Token Response: ", tokenRes);
//             if (tokenRes.success) {
//                 req.session.authy = true;
//             }
//             res.status(200).json(tokenRes);
//         });
//     });
// };

// exports.verifyPhoneToken = function (req, res) {
//     var country_code = req.body.country_code;
//     var phone_number = req.body.phone_number;
//     var token = req.body.token;
    
//     if (phone_number && country_code && token) {
//         phoneReg.verifyPhoneToken(phone_number, country_code, token, function (err, response) {
//             if (err) {
//                 console.log('error creating phone reg request', err);
//                 res.status(500).json(err);
//             } else {
//                 console.log('Confirm phone success confirming code: ', response);
//                 if (response.success) {
//                     req.session.ph_verified = true;
//                 }
//                 res.status(200).json(response);
//             }

//         });
//     } else {
//         console.log('Failed in Confirm Phone request body: ', req.body);
//         res.status(500).json({error: "Missing fields"});
//     }
// };

// function createSession(req, res, user) {
//     req.session.regenerate(function () {
//         req.session.loggedIn = true;
//         req.session.user = user.id;
//         req.session.username = user.username;
//         req.session.msg = 'Authenticated as: ' + user.username;
//         req.session.authy = false;
//         req.session.ph_verified = false;
//         res.status(200).json();
//     });
// }

