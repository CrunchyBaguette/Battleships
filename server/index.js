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
                    for(let i=0; i<[...wss.clients].length; i++){
                        sendRoomsUpdate([...wss.clients][i]);
                    }
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

                            var startingPlayer = Math.floor(Math.random() * (Math.floor(2) - Math.ceil(1) + 1)) + Math.ceil(1);

                            if(startingPlayer == 1){
                                rooms[i].player1.send("turn/true");
                                rooms[i].player2.send("turn/false");
                            } else {
                                rooms[i].player2.send("turn/true");
                                rooms[i].player1.send("turn/false");
                            }

                            for(let j=0; j<[...wss.clients].length; j++){
                                sendRoomsUpdate([...wss.clients][j]);
                            }

                            break;

                        }
                    }
                    break;
                case "strike":
                    var strikePos = e.data.split("/")[1];
                    for(let i=0; i<rooms.length; i++){
                        if(rooms[i].player1 == ws){
                            if(rooms[i].player2 != null){
                                var didHit = false;
                                var didSink = false;
                                var won = false;
                                var sunkPositions = [];
                                for(let j=0; j<rooms[i].player2.shipPositions.length; j++){
                                    var shipPos = rooms[i].player2.shipPositions[j];
                                    if(rooms[i].player2.shipPositions[j].includes(strikePos)){
                                        didHit = true;
                                        rooms[i].player2.shipPositions[j][shipPos.length-1] -= 1;
                                        if(rooms[i].player2.shipPositions[j][shipPos.length-1] == 0){
                                            for(let k=0; k<rooms[i].player2.shipPositions.length; k++){
                                                won = true;
                                                if(rooms[i].player2.shipPositions[k][rooms[i].player2.shipPositions[k].length-1] != 0){
                                                    won = false;
                                                    break;
                                                }
                                            }
                                            didSink = true;
                                            sunkPositions = rooms[i].player2.shipPositions[j].slice(0,-1);
                                        }
                                        break;
                                    }
                                }

                                if(didHit){
                                    if(didSink){
                                        var coordinates = "";
                                        for(let i=0; i<sunkPositions.length; i++){
                                            coordinates += sunkPositions[i] + "|";
                                        }
                                        rooms[i].player2.send("hitSink/"+coordinates);
                                        rooms[i].player1.send("hitSinkEnemy/"+coordinates);
                                        if(won){
                                            rooms[i].player2.send("lost/");
                                            rooms[i].player1.send("win/");
                                        }
                                    } else {
                                        rooms[i].player2.send("hit/"+strikePos);
                                        rooms[i].player1.send("hitEnemy/"+strikePos);
                                    }
                                } else{
                                    rooms[i].player2.send("miss/"+strikePos);
                                    rooms[i].player1.send("missEnemy/"+strikePos);
                                }
                            }
                            break;
                        } else if(rooms[i].player2 == ws){
                            var didHit = false;
                            var didSink = false;
                            var won = true;
                            var sunkPositions = [];
                            for(let j=0; j<rooms[i].player1.shipPositions.length; j++){
                                var shipPos = rooms[i].player1.shipPositions[j];
                                if(rooms[i].player1.shipPositions[j].includes(strikePos)){
                                    didHit = true;
                                    rooms[i].player1.shipPositions[j][shipPos.length-1] -= 1;
                                    if(rooms[i].player1.shipPositions[j][shipPos.length-1] == 0){
                                        for(let k=0; k<rooms[i].player1.shipPositions.length; k++){
                                            won = true;
                                            if(rooms[i].player1.shipPositions[k][rooms[i].player1.shipPositions[k].length-1] != 0){
                                                won = false;
                                                break;
                                            }
                                        }
                                        didSink = true;
                                        sunkPositions = rooms[i].player1.shipPositions[j].slice(0,-1);
                                    }
                                    break;
                                }
                            }
                            if(didHit){
                                if(didSink){
                                    var coordinates = "";
                                    for(let i=0; i<sunkPositions.length; i++){
                                        coordinates += sunkPositions[i] + "|";
                                    }
                                    rooms[i].player1.send("hitSink/"+coordinates);
                                    rooms[i].player2.send("hitSinkEnemy/"+coordinates);
                                    if(won){
                                        rooms[i].player1.send("lost/");
                                        rooms[i].player2.send("win/");
                                    }
                                } else {
                                    rooms[i].player1.send("hit/"+strikePos);
                                    rooms[i].player2.send("hitEnemy/"+strikePos);
                                }
                            } else {
                                rooms[i].player1.send("miss/"+strikePos);
                                rooms[i].player2.send("missEnemy/"+strikePos);
                            }
                            break;
                        }
                    }
                    break;
                default:
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
                        shipsPositions[i].push(shipsPositions[i].length);
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
                        rooms[i].player2.send("opponentLeft");
                        rooms[i].player1 = rooms[i].player2;
                        rooms[i].player2 = null;
                        rooms[i].id = rooms[i].player1.id;
                        rooms[i].status = "Waiting";
                    }
                    else {
                        rooms.splice(i, 1);
                    }
                    break;
                } else if(rooms[i].player2 == ws) {
                    rooms[i].player1.send("opponentLeft");
                    rooms[i].player2 = null;
                    rooms[i].status = "Waiting";
                    break;
                }
            }
        }
    }
});