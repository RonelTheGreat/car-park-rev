const Slot = require('../../models/Slot');

const activelyReserving = (socket, signal) => {
    // listen for a signal when someone is actively reserving
    // actively reserving
    if (signal.isReserving) {
        Slot.findOne({ slotLetter: signal.slot }, (err, slot) => {
            let user = slot.currentUsers.filter(
                user => user === signal.username,
            )[0];

            if (signal.username !== '' && signal.username !== user) {
                slot.currentUsers.push(signal.username);
                slot.save();

                socket.broadcast.emit('activelyReserving', {
                    isReserving: true,
                    slot: signal.slot,
                });
            }
        });

        return;
    }

    // if cancelled reservation
    Slot.findOne({ slotLetter: signal.slot }, (err, slot) => {
        const remainingUsers = slot.currentUsers.filter(
            user => user !== signal.username,
        );
        slot.currentUsers = remainingUsers;

        slot.save();
        socket.broadcast.emit('activelyReserving', {
            isReserving: false,
            slot: signal.slot,
        });
    });
};

module.exports = activelyReserving;
