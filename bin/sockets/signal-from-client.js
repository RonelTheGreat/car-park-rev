// listen for a signal from client
// if someone has reserved a slot
const signalFromClient = signal => {
    if (signal.reservation) {
        console.log('someone has reserved a slot');
        return io.sockets.emit('signalFromServer', {
            refresh: true,
            reserved: true,
            slot: signal.slot,
        });
    }
    io.sockets.emit('signalFromServer', { refresh: true });
};

module.exports = signalFromClient;
