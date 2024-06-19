const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cluster = require('node:cluster');
const numCPUs = require('node:os').availableParallelism();
const process = require('node:process');
const io = new Server(server);

module.exports = io;
const Queue = require('./queue.cjs'); 
var queueMap = {}
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../client")));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/client1.html'));
});


const general_queue = new Queue();

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("addTag",(tag)=>{

    console.log("tag>>>>>" + tag)

    if(tag == ""){

      general_queue.push(socket);

    }
    if(tag in queueMap){
      queueMap[tag].push(socket)
    }else{
      queueMap[tag] = new Queue();
      queueMap[tag].push(socket)

    }

  })

  socket.on("client1offer", (client1offer) => {
    socket.broadcast.to(Array.from(socket.rooms)[1]).emit("client1offer", client1offer);
  });

  socket.on("client1IceCandidates", (client1iceCandidate) => {
    socket.broadcast.to(Array.from(socket.rooms)[1]).emit("client1IceCandidates", client1iceCandidate);
  });

  socket.on("client2answer", answer => {
    socket.broadcast.to(Array.from(socket.rooms)[1]).emit("client2answer", answer);
  });

  socket.on("disconnect", () => {
      // close
  });

});



// server.listen(8082, () => {
//   console.log('listening on *:8082');
// });

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {

  server.listen(8082, () => {
    console.log('listening on *:8082');
  });

  console.log(`Worker ${process.pid} started`);
}