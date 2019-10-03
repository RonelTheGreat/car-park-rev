// DEPENDENCIES
const updateTime = require('./bin/update-time'),
    bodyParser = require('body-parser'),
    validator = require('express-validator'),
    createAdmin = require('./bin/create-admin'),
    createSlots = require('./bin/create-slots'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    socket = require('./bin/socket'),
    express = require('express'),
    format = require('./bin/format-time'),
    reset = require('./bin/reset-slots'),
    PORT = process.env.PORT || 3000,
    app = express();
(http = require('http').Server(app)), (io = require('socket.io')(http));

reset();

// update slot timer every 5 sec
let timer1 = setTimeout(function update() {
    updateTime();
    timer1 = setTimeout(update, 5000);
}, 5000);

setInterval(() => {
    const time = format(new Date()).time;
    io.sockets.emit('clock', { time });
}, 1000);

// MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(validator());
app.use(
    session({
        secret: 'th1s 1s @ r@nd0m s3cr3t k3y f0r mY w3b@pp',
        resave: false,
        saveUninitialized: true,
    }),
);

// MONGODB CONNECTION
const DB_URL =
    'mongodb+srv://admin123:admin123@cluster0-brxlt.mongodb.net/admin?retryWrites=true&w=majority';

// connect to database
mongoose.connect(DB_URL);

const db = mongoose.connection;
// if connection to database errors, flash a message on the console
db.on('error', console.error.bind(console, 'connection error:'));

// ADMIN ROUTES
app.use('/admin', require('./routes/admin/home'));
app.use('/admin', require('./routes/admin/load'));
app.use('/admin', require('./routes/admin/change_rate'));
app.use('/admin', require('./routes/admin/register'));
app.use('/admin', require('./routes/admin/delete'));
app.use('/admin', require('./routes/admin/edit'));
app.use('/admin', require('./routes/admin/logs'));

// USER ROUTE
app.use('/user', require('./routes/user/home'));

// COMMON ROUTES
app.use('/', require('./routes/common/landing'));
app.use('/login', require('./routes/common/login'));
app.use('/reserve', require('./routes/common/reserve'));
app.use('/logout', require('./routes/common/logout'));
app.use('/terms', require('./routes/common/terms'));
app.use('/contact', require('./routes/common/contact'));
app.use('/simulate', require('./routes/common/simulate'));

// SOCKET LISTENER
socket.listen(io);

// server listener
http.listen(PORT, () => {
    console.log('Listening to PORT: ' + PORT);
});
