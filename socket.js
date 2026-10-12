let io;
let users;

export function initSocket(socketIO, userMap) {
    io = socketIO;
    users = userMap;
}

export function getIO() {
    return io;
}

export function getUsers() {
    return users;
}