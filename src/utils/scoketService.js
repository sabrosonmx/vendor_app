import io from 'socket.io-client';

class WSService {
    initializeSocket = (socketUrl) => {
        try {
            this.socket = io(socketUrl, {
                transports: ['websocket'],
            });

            // Log the socket instance to verify initialization
            console.log('Socket initialized:', this.socket);

            if (this.socket) {
                this.socket.on('connect', (data) => {
                    console.log('===== Socket connected =====');
                    console.log(data);
                });

                this.socket.on('disconnect', () => {
                    console.log('Socket disconnected:', this.socket);
                });

                this.socket.on('destroy', () => {
                    console.log('Socket destroyed:', this.socket);
                });

                this.socket.on('socketError', (err) => {
                    console.log('Socket connection error: ', err);
                });

                this.socket.on("parameterError", (err) => {
                    console.log('Socket connection error: ', err);
                });

                this.socket.on('error', (error) => {
                    console.log('Socket error:', error);
                });
            } else {
                console.log('Socket is not initialized correctly.');
            }

        } catch (error) {
            console.log('Error initializing socket:', error);
        }
    };

    emit(event, data = {}) {
        if (this.socket) {
            this.socket.emit(event, data);
        } else {
            console.error('Cannot emit, socket is not initialized.');
        }
    }

    on(event, cb) {
        if (this.socket) {
            this.socket.on(event, cb);
        } else {
            console.error('Cannot attach listener, socket is not initialized.');
        }
    }

    removeListener(listenerName) {
        if (this.socket) {
            this.socket.removeListener(listenerName);
        } else {
            console.error('Cannot remove listener, socket is not initialized.');
        }
    }

    disconnectSocket() {
        if (this.socket) {
            this.socket.disconnect();
        } else {
            console.error('Cannot disconnect, socket is not initialized.');
        }
    }

    destroySocket() {
        if (this.socket) {
            this.socket.destroy();
        } else {
            console.error('Cannot destroy, socket is not initialized.');
        }
    }

    hasListeners() {
        if (this.socket) {
            return this.socket.hasListeners();
        } else {
            console.error('Cannot check listeners, socket is not initialized.');
            return false;
        }
    }
}

const socketServices = new WSService();

export default socketServices;
