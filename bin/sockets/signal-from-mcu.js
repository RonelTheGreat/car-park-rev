const createLog = require('../create-log'),
    Slot = require('../../models/Slot'),
    User = require('../../models/User');

const signalFromMCU = (socket, signal) => {
    if (signal.source === 'park') {
        let parkingSlot = signal.slot.toLowerCase();
        // find specific slot
        Slot.findOne({ slotLetter: parkingSlot }, (err, slot) => {
            if (err) return console.log('No such slot!');
            // update SLOT database, change state
            // check if the slot is reserved
            if (slot.state === 'reserved') {
                // change state and indicator
                slot.indicator = 'red';
                slot.state = 'occupied';
                slot.save();
                // create log
                createLog({ logName: 'occupant', slot: slot.slotLetter });
                // send update to all connected devices
                // socket.emit('signalForMCU', {fromServer: 'Hello NodeMCU'});
                io.sockets.emit('signalFromServer', { refresh: true });
            }
        });
    } else if (signal.source === 'depart') {
        // update SLOT database, change state
        let departedSlot = signal.slot.toLowerCase();
        // find specific slot
        Slot.findOne({ slotLetter: departedSlot })
            .populate('parokya')
            .exec((err, slot) => {
                if (err) return console.log('No such slot!');
                // check if the slot occupied
                if (slot.state === 'occupied') {
                    // change state and indicator
                    slot.indicator = 'green';
                    slot.state = 'vacant';
                    slot.parokya.reservation = {};
                    slot.save();
                    slot.parokya.save();
                    createLog({ logName: 'departure', slot: departedSlot });
                    // send update to all connected devices
                    io.sockets.emit('signalFromServer', { refresh: true });
                }
            });
    } else if (signal.source === 'entrance') {
        User.findOne({ rfid: signal.rfid }, (err, user) => {
            if (err) {
                return socket.emit('signalFromServer', {
                    access: 'denied',
                });
            }
            if (user === null || user.reservation.slot === undefined) {
                console.log('access denied');
                return socket.emit('signalFromServer', {
                    access: 'denied',
                });
            }
            if (user.reservation.slot !== undefined) {
                Slot.findOne(
                    { slotLetter: user.reservation.slot },
                    (err, slot) => {
                        if (slot.state === 'occupied') {
                            return socket.emit('signalFromServer', {
                                access: 'denied',
                            });
                        }
                        // create log
                        createLog({
                            logName: 'entrance',
                            rfid: user.rfid,
                            username: user.username,
                            fullname: `${user.fname} ${user.mi}. ${user.lname}`,
                            plateNumber: user.plateNumber,
                        });
                        return socket.emit('signalFromServer', {
                            access: 'granted',
                        });
                    },
                );
            }
        });
    } else if (signal.source === 'exit') {
        User.findOne({ rfid: signal.rfid }, (err, user) => {
            if (err) return console.log(`CANNOT FIND USER: ${err}`);
            createLog({
                logName: 'exit',
                rfid: user.rfid,
                username: user.username,
                fullname: `${user.fname} ${user.mi}. ${user.lname}`,
                plateNumber: user.plateNumber,
            });
        });
    }
};

module.exports = signalFromMCU;
