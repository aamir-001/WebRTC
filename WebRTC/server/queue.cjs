const Random = require("./random.cjs")
const io = require('./index.js');

class Queue{
    
    constructor(){

        this.roomCount = Random.getString();
        this.users = 0;
 
    }

    push(socket){

        socket.join("room" + this.roomCount);
        this.users++;
                
        if (this.users == 1) {
            this.users++;
            console.log("---+++++-" + Array.from(socket.rooms)[1])
            io.to(Array.from(socket.rooms)[1]).emit("becomeClient1");
        } else {
            this.users = 0;
            this.roomCount = Random.getString(); 
            socket.emit("becomeClient2");
            io.to(Array.from(socket.rooms)[1]).emit("notifyClient1");
        }

    }

}

module.exports = Queue;