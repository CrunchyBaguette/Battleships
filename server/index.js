const WebSocket = require("ws");

const wss = new WebSocket.Server({port:8082});

var playerIDs = Array.from({length: 2}, (_,i) => i+1).reverse();

wss.on("connection", ws => {
    console.log("New client connected!");

    if(playerIDs.length == 0){
        ws.terminate();
    } else {
        ws.id = playerIDs.pop();
        ws.ready = false;
        ws.send("My ID = "+ws.id.toString());

        ws.on("close", () => {
            console.log("Client has disconnected!");
            playerIDs.push(ws.id);
        });

        ws.addEventListener("message", e => {
            // console.log([...wss.clients].indexOf(ws));
            switch(e.data){
                case "connect":
                    if(ws.ready){
                        ws.ready = false;
                    } else {
                        ws.ready = true;
                    }
                    var count = 0;
                    for(let i=0; i<wss.clients.size; i++){
                        if([...wss.clients][i].ready){
                            count += 1;
                        }
                    }
        
                    if(count == 2){
                        console.log("Let's start!");
                        [...wss.clients][0].send("sendBoard");
                        [...wss.clients][1].send("sendBoard");
                    }
                    break;
                default:
                    console.log("ship info of player "+ws.id.toString());
                    console.log(e.data);
                    break;
            }
        });

        let notify = function(ws1, ws2) {
            
        }
    }
});