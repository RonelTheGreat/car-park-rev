const signalFromClient = require('./sockets/signal-from-client'),
    signalFromMCU = require('./sockets/signal-from-mcu'),
    activelyReserving = require('./sockets/actively-reserving');

// listen for socket connection
const socket = {
    listen: io => {
        io.on('connection', socket => {
            console.log(`a client has connected: ${socket.id}`);

            socket.on('disconnect', () =>
                console.log(`a client has disconnected: ${socket.id}`),
            );

            socket.on('signalFromClient', signal => {
                signalFromClient(signal);
            });

            socket.on('signalFromAdmin', signal => {
                signal.isLoaded &&
                    io.sockets.emit('signalFromServer', { refresh: true });
            });

            socket.on('signalFromMCU', signal => {
                signalFromMCU(socket, signal);
            });

            socket.on('activelyReserving', signal => {
                activelyReserving(socket, signal);
            });
        });
    },
};

module.exports = socket;
