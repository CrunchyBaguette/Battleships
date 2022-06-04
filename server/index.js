const WebSocket = require("ws");

const wss = new WebSocket.Server({port:8082});

var playerIDs = Array.from({length: 10}, (_,i) => i+1).reverse();
var rooms = []

wss.on("connection", ws => {
    console.log("New client connected!");

    if(playerIDs.length == 0){
        ws.terminate();
    } else {
        ws.id = playerIDs.pop();
        ws.opponent = null;
        ws.ready = false;
        ws.send("default/My ID = "+ws.id.toString());

        ws.on("close", () => {
            leaveRoom(ws);
            console.log("Client has disconnected!");
            if(ws.opponent != null){
                ws.opponent.opponent = null;
                ws.opponent = null;
            }
            playerIDs.push(ws.id);
        });

        ws.addEventListener("message", e => {
            // console.log([...wss.clients].indexOf(ws));
            var code = e.data.split("/")[0];
            switch(code){
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
                        [...wss.clients][0].opponent = [...wss.clients][1];
                        [...wss.clients][1].opponent = [...wss.clients][0];
                        [...wss.clients][0].send("sendBoard");
                        [...wss.clients][1].send("sendBoard");
                    }
                    break;
                case "createRoom":
                    var roomInfo = {};
                    roomInfo["id"] = ws.id;
                    roomInfo["player1"] = ws;
                    roomInfo["player2"] = null;
                    roomInfo["status"] = "Waiting";
                    rooms.push(roomInfo);
                    console.log(rooms);
                    break;
                case "leaveRoom":
                    leaveRoom(ws);
                    sendRoomsUpdate(ws);
                    break;
                case "getRooms":
                    sendRoomsUpdate(ws);
                    break;
                case "enterRoom":
                    var opponentID = e.data.split("/")[1];
                    for(let i=0; i<rooms.length; i++){
                        if(rooms[i].id == opponentID){
                            rooms[i].status = "Playing";
                            rooms[i].player2 = ws;
                            rooms[i].player1.send("sendBoard");
                            rooms[i].player2.send("sendBoard");
                        }
                    }
                    break;
                default:
                    console.log("ship info of player "+ws.id.toString());
                    console.log(e.data);

                    var shipsPositionsStrings = e.data.split("-");
                    var shipsPositions = [];

                    for(let i=0; i<shipsPositionsStrings.length-1; i++){
                        var arr = shipsPositionsStrings[i].split("|");
                        for(let j=0; j<arr.length; j++){
                            if(arr[j].length != 0 && arr[j].charAt(0) == ','){
                                arr[j] = arr[j].slice(1);
                            }
                        }
                        shipsPositions.push(arr);
                        shipsPositions[i].pop();
                    }

                    ws.shipPositions = shipsPositions;
                    break;
            }
        });

        let sendRoomsUpdate = function(ws) {
            var message = "";
            for(let i=0; i<rooms.length; i++){
                message += rooms[i].id+","+rooms[i].status+"|";
            }
            if(message == ""){
                ws.send("updateRooms/empty");
            } else {
                ws.send("updateRooms/"+message);
            }
        }

        let leaveRoom = function(ws) {
            for(let i=0; i<rooms.length; i++){
                if(rooms[i].player1 == ws){
                    rooms[i].player1 = null;
                    if(rooms[i].player2 != null){
                        rooms[i].player1 = rooms[i].player2;
                        rooms[i].player2 = null;
                        rooms[i].status = "Waiting";
                    }
                    else {
                        rooms.splice(i, 1);
                    }
                    break;
                } else if(rooms[i].player2 == ws) {
                    rooms[i].player2 = null;
                    rooms[i].status = "Waiting";
                    break;
                }
            }
            console.log(rooms);
        }
    }
});