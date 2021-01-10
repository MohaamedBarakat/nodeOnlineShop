const User = require('../models/user');
const bcrypt = require('bcryptjs');
const api_key = "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";
const sendgrid = require('@sendgrid/mail');
const crypto = require('crypto');
sendgrid.setApiKey(api_key);
exports.getLogin = (req, res, next) => {
    //const isLoggedIn = req.get('Cookie').split('=')[1].trim() === 'true';
    // console.log(req.session.isLoggedIn);
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message
    })
};
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        });
                    } else {
                        req.flash('error', 'Invalid email or password');
                        return res.redirect('/login');
                    }
                    r
                })
                .catch(err => {
                    res.redirect('/login');
                });;
        })
        .catch(err => console.log(err));


};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};
exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message
    });
};
exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'E-Mail exists already, please pick different one.');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        name: name,
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                    const message = {
                        to: email,
                        from: "muhammad.barakat70@gmail.com",
                        subject: "Signup succeeded!",
                        html: "<h1>You are successfully signed up</h1>"
                    };
                    sendgrid
                        .send(message)

                    .then(() => {
                        console.log('email sent');
                    });
                });
        })
        .catch(err => {
            console.log(err);
        });
};
exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    })
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No Account found with this email');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save()
                    .then(result => {
                        res.redirect('/');
                        const message = {
                            to: req.body.email,
                            from: "muhammad.barakat70@gmail.com",
                            subject: "Password reset",
                            html: `<p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/reset/${token}"> link</a> to set password</p>   `
                        };
                        sendgrid
                            .send(message)
                            .then(() => {
                                console.log('email sent');
                            });
                    });
            })

        .catch(err => {
            console.log(err);
        })


    });
};
exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                pageTitle: 'New Password',
                path: '/new-password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            })
        })
        .catch(err => {
            console.log(err);
        });
};
exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({ _id: userId, resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);

        })
        .then(hashedPassword => {
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            resetUser.password = hashedPassword;
            return resetUser.save();
        })
        .then(result => {
            console.log("Password Updated");
            res.redirect('/login');
        })
        .catch(err => { console.log(err); })

};