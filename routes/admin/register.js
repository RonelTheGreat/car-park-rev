const createLog = require('../../bin/create-log'),
    express = require('express'),
    router = express.Router(),
    bcrypt = require('bcrypt'),
    User = require('../../models/User');

// REGISTER USER
router.get('/register', (req, res) => {
    req.session.loginErrors = null;
    req.session.success = null;
    req.session.username = null;

    // if not admin redirect to login page
    if (!req.session.isAdmin) return res.redirect('/login');

    // if nothing fails, render registration page
    res.render('admin/register', {
        errors: req.session.regErrors,
        inputValues: req.session.inputValues,
    });
});

router.post('/register', (req, res) => {
    const {
        fname,
        lname,
        mi,
        username,
        password,
        cpassword,
        contact,
        plateNumber,
        rfid,
        balance,
    } = req.body;

    // check for empty fields before saving to db
    req.checkBody('fname', 'first name is required').notEmpty();
    req.checkBody('lname', 'last name is required').notEmpty();
    req.checkBody('mi', 'middle initial is required').notEmpty();
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'please provide a password').notEmpty();
    req.checkBody('balance', 'please provide initial balance').notEmpty();
    req.checkBody('contact', 'contact number is required').notEmpty();
    req.checkBody('plateNumber', 'plate number is required').notEmpty();

    // store errors in the session
    let errors = req.validationErrors();

    // store input fields
    req.session.inputValues = [
        {
            username,
            fname,
            lname,
            mi,
            password,
            rfid,
            balance,
            contact,
            plateNumber,
        },
    ];

    // check for errors
    if (errors) {
        req.session.regErrors = errors;
        res.redirect('/admin/register');
        return;
    }

    // check if passwords match
    if (password != cpassword) {
        req.session.regErrors = [{ msg: 'Password do not match!' }];
        res.redirect('/admin/register');
        return;
    }

    // if no errors, hash the pw and save to DB
    // and create new user
    bcrypt.hash(password, 10, (err, hashedPW) => {
        let newUser = {
            fname,
            lname,
            mi,
            username,
            password: hashedPW,
            rfid,
            balance,
            contact,
            plateNumber,
        };

        if (err) return console.log('Error hashing the password');

        User.create(newUser, (err, newUser) => {
            if (err)
                return console.log(
                    `MESSAGE: Error in creating a new user ERROR: ${err}`,
                );

            // add to logs
            createLog({
                logName: 'registration',
                rfid: newUser.rfid,
                username: newUser.username,
                fullname: `${fname} ${mi}. ${lname}`,
                contact: newUser.contact,
                plateNumber: newUser.plateNumber,
                initialLoad: balance,
            });

            req.session.success = 'successfully added new user !';
            req.session.inputValues = null;
            req.session.regErrors = null;
            res.redirect('/admin/home');
        });
    });
});

module.exports = router;
