const format = require('./format-time'),
    Log = require('../models/Log');

const createLog = ({ ...data }) => {
    const months = [
        'Jan.',
        'Feb.',
        'March',
        'April',
        'May',
        'June',
        'July',
        'Aug.',
        'Sept.',
        'Oct.',
        'Nov.',
        'Dec.',
    ];

    const date = new Date();
    const formattedDate = `${
        months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
    const formattedTime = format(date).time;

    let log = data;
    log.date = formattedDate;
    log.time = formattedTime;

    Log.create(log, err => `LOGGING ERROR: ${err}`);
};

module.exports = createLog;
