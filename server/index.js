const WebSocket = require("ws");

const wss = new WebSocket.Server({port:8082});

var playerIDs = Array.from({length: 2}, (_,i) => i+1).reverse();

wss.on("connection", ws => {
    console.log("New client connected!");

    if(playerIDs.length == 0){
        ws.terminate();
    } else {
        ws.id = playerIDs.pop();
        ws.send("My ID = "+ws.id.toString());

        ws.on("close", () => {
            console.log("Client has disconnected!");
            playerIDs.push(ws.id);
        })
    }
});