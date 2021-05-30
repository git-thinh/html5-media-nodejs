const path = require('path');

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const DEFAULT_PORT = 5000;
const PATH_WWW = path.join(__dirname, "../public/");
console.log('PATH_WWW = ' + PATH_WWW);

app.use(express.static(PATH_WWW));
app.get("/", (req, res) => { res.sendFile(PATH_WWW + "index.html"); });
app.get("/speech2text", (req, res) => { res.sendFile(PATH_WWW + "speech2text.html"); });
app.get("/record", (req, res) => { res.sendFile(PATH_WWW + "record/index.html"); });

io.on("connection", socket => {
    console.log('a user connected');

    const existingSocket = this.activeSockets.find(
        existingSocket => existingSocket === socket.id
    );

    if (!existingSocket) {
        this.activeSockets.push(socket.id);

        socket.emit("update-user-list", {
            users: this.activeSockets.filter(
                existingSocket => existingSocket !== socket.id
            )
        });

        socket.broadcast.emit("update-user-list", {
            users: [socket.id]
        });
    }

    socket.on("call-user", (data) => {
        socket.to(data.to).emit("call-made", {
            offer: data.offer,
            socket: socket.id
        });
    });

    socket.on("make-answer", data => {
        socket.to(data.to).emit("answer-made", {
            socket: socket.id,
            answer: data.answer
        });
    });

    socket.on("reject-call", data => {
        socket.to(data.from).emit("call-rejected", {
            socket: socket.id
        });
    });

    socket.on("disconnect", () => {
        this.activeSockets = this.activeSockets.filter(
            existingSocket => existingSocket !== socket.id
        );
        socket.broadcast.emit("remove-user", {
            socketId: socket.id
        });
    });
});

server.listen(DEFAULT_PORT, () => {
    console.log('listening on *:' + DEFAULT_PORT);
    console.log('__dirname: ' + __dirname);
});
