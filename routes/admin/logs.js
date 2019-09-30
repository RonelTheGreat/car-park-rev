const express = require('express'),
    router = express.Router(),
    Log = require('../../models/Log');

router.get('/logs', (req, res) => {
    // if not admin, redirect to login page
    if (!req.session.isAdmin) return res.redirect('/login');

    const months = [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december',
    ];

    res.render('admin/logs', {
        months,
        date: new Date(),
        admin: req.session.admin,
    });
});

router.get('/logs/:logName/:filter/:date', (req, res) => {
    const { logName, filter, date } = req.params;

    const selectedDate = new Date(date);

    if (logName === 'income') {
        Log.find({ logName: { $in: ['load', 'registration'] } })
            .sort({ timeStamp: 'descending' })
            .exec((err, logs) => {
                if (err || logs.length <= 0)
                    return res.json({
                        error: true,
                        msg: `no ${logName} logs found`,
                    });

                const incomeLogs = logs.map(log => {
                    log.logName === 'load'
                        ? (log.amount = log.amount)
                        : (log.amount = log.initialLoad);
                    log.source = log.logName;
                    log.logName = 'income';

                    return log;
                });

                let filteredIncomeLogs = [];
                switch (filter) {
                    case 'month':
                        filteredIncomeLogs = incomeLogs.filter(
                            log =>
                                log.timeStamp.getMonth() ===
                                selectedDate.getMonth(),
                        );
                        break;

                    case 'date':
                        filteredIncomeLogs = incomeLogs.filter(
                            log =>
                                log.timeStamp.getDate() ===
                                    selectedDate.getDate() &&
                                log.timeStamp.getMonth() ===
                                    selectedDate.getMonth() &&
                                log.timeStamp.getFullYear() ===
                                    selectedDate.getFullYear(),
                        );
                        break;

                    case 'year':
                        filteredIncomeLogs = incomeLogs.filter(
                            log =>
                                log.timeStamp.getFullYear() ===
                                selectedDate.getFullYear(),
                        );
                        break;
                }

                if (filteredIncomeLogs.length > 0) {
                    let totalIncome = 0;
                    filteredIncomeLogs.map(log => (totalIncome += log.amount));
                    res.json({
                        error: false,
                        totalIncome,
                        logs: filteredIncomeLogs,
                    });
                }

                filteredIncomeLogs.length <= 0 &&
                    res.json({
                        error: true,
                        msg: `no ${req.params.logName} logs found`,
                    });
            });
        return;
    }

    Log.find({ logName: req.params.logName })
        .sort({ timeStamp: 'descending' })
        .exec((err, logs) => {
            if (err || logs.length <= 0)
                return res.json({
                    error: true,
                    msg: `no ${req.params.logName} logs found`,
                });

            let filteredLogs = [];
            switch (filter) {
                case 'month':
                    filteredLogs = logs.filter(
                        log =>
                            log.timeStamp.getMonth() ===
                            selectedDate.getMonth(),
                    );
                    break;

                case 'date':
                    filteredLogs = logs.filter(
                        log =>
                            log.timeStamp.getDate() ===
                                selectedDate.getDate() &&
                            log.timeStamp.getMonth() ===
                                selectedDate.getMonth() &&
                            log.timeStamp.getFullYear() ===
                                selectedDate.getFullYear(),
                    );
                    break;

                case 'year':
                    filteredLogs = logs.filter(
                        log =>
                            log.timeStamp.getFullYear() ===
                            selectedDate.getFullYear(),
                    );
                    break;
            }

            filteredLogs.length > 0 &&
                res.json({ error: false, logs: filteredLogs });
            filteredLogs.length <= 0 &&
                res.json({
                    error: true,
                    msg: `no ${req.params.logName} logs found`,
                });
        });
});
module.exports = router;
