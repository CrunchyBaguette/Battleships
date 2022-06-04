(function () {
'use strict';
    
angular.module('battleships', [])

.controller("containerController", function($scope) {

    $scope.ws = new WebSocket("ws://localhost:8082");

    $scope.rooms = [];
    $scope.battle = false;
    $scope.lobby = true;

    $scope.gameMessage = "Loading...";
    $scope.turn = false;

    $scope.createRoom = function() {
        $scope.battle = true;
        $scope.lobby = false;
        $scope.toggleBoard();
        document.getElementById("left").id = "None";
        document.getElementById("right").id = "left";
        document.getElementById("enemy").id = "right";
        
        $scope.ws.send("createRoom");
    }

    $scope.leaveRoom = function() {
        $scope.battle = false;
        $scope.lobby = true;
        $scope.toggleBoard();
        document.getElementById("right").id = "enemy";
        document.getElementById("left").id = "right";
        document.getElementById("None").id = "left";

        $scope.turn = false;
        $scope.ws.send("leaveRoom");
    }

    $scope.enterRoom = function($event){
        var enemyID = $event.target.parentElement.parentElement.getElementsByTagName("td")[0].firstChild.data;
        var status = $event.target.parentElement.parentElement.getElementsByTagName("td")[1].firstChild.data;
        if(status != "Playing"){
            $scope.battle = true;
            $scope.lobby = false;
            $scope.toggleBoard();
            document.getElementById("left").id = "None";
            document.getElementById("right").id = "left";
            document.getElementById("enemy").id = "right";

            $scope.ws.send("enterRoom/"+enemyID.toString());
        }
    }

    $scope.opponentLeft = function(){
        var squares = document.getElementById("w1").getElementsByTagName("div");
        var enemySquares = document.getElementById("w2").getElementsByTagName("div");

        for(let i=0; i<squares.length; i++){
            if(squares[i].attributes.ship.nodeValue == 1){
                squares[i].className = "taken";
            } else {
                squares[i].className = "square";
            }
        }

        for(let i=0; i<enemySquares.length; i++){
            enemySquares[i].className = "square";
        }
    }

    $scope.toggleBoard = function(){
        var squares = document.getElementById("w1").getElementsByTagName("div");
        var enemySquares = document.getElementById("w2").getElementsByTagName("div");
        for(let i=0; i<squares.length; i++){
            if(squares[i].hasChildNodes()){
                if(squares[i].firstChild.attributes.draggable != null){
                    var canDrag = squares[i].firstChild.attributes.draggable.nodeValue;
                    if(canDrag == "true"){
                        squares[i].firstChild.attributes.draggable.nodeValue = "false";
                    } else{
                        squares[i].firstChild.attributes.draggable.nodeValue = "true";
                    }
                }
                if(squares[i].firstChild.attributes.disabled != null){
                    var isDisabled = squares[i].firstChild.attributes.disabled.nodeValue;
                    if(isDisabled == "true"){
                        squares[i].firstChild.attributes.disabled.nodeValue = "false";
                    } else{
                        squares[i].firstChild.attributes.disabled.nodeValue = "true";
                    }
                }
            }
            if(squares[i].attributes.ship.nodeValue == 1){
                if($scope.battle){
                    squares[i].className = "taken";
                } else {
                    squares[i].className = "busy";
                }
            } else {
                squares[i].className = "square";
            }
        }
        for(let i=0; i<enemySquares.length; i++){
            enemySquares[i].className = "square";
        }
    }

    $scope.refreshRooms = function(){
        $scope.ws.send("getRooms");
    }

    $scope.ws.addEventListener("open", () => {
        console.log("We are connected!");
        $scope.ws.send("getRooms");
    });

    $scope.ws.addEventListener("message", e => {
        var code = e.data.split("/")[0];
        switch(code){
            case "sendBoard":
                $scope.sendBoard();
                break;
            case "updateRooms":
                if(e.data.split("/")[1] == "empty"){
                    $scope.rooms = [];
                    $scope.$apply();
                    break;
                }
                var newRooms = [];
                var roomsInfo = e.data.split("/")[1].slice(0, -1);
                roomsInfo = roomsInfo.split("|");
                for(let i=0; i<roomsInfo.length; i++){
                    var dict = {};
                    dict["id"] = parseInt(roomsInfo[i].split(",")[0], 10);
                    dict["status"] = roomsInfo[i].split(",")[1];
                    console.log(dict);
                    newRooms.push(dict);
                }
                $scope.rooms = newRooms;
                $scope.$apply();
                break;
            case "hit":
                var strikePos = e.data.split("/")[1];
                var positions = document.getElementById("w1").getElementsByTagName("div");
                for(let i=0; i<positions.length; i++){
                    if(positions[i].id == strikePos){
                        positions[i].className = "hit";
                    }
                }
                $scope.gameMessage = "Enemy hit your ship! They move again";
                $scope.$apply();
                break;
            case "hitEnemy":
                var strikePos = e.data.split("/")[1];
                var positions = document.getElementById("w2").getElementsByTagName("div");
                for(let i=0; i<positions.length; i++){
                    if(positions[i].id == strikePos){
                        positions[i].className = "hit";
                    }
                }
                $scope.gameMessage = "You hit the enemy ship! Your turn again";
                $scope.$apply();
                break;
            case "miss":
                var strikePos = e.data.split("/")[1];
                var positions = document.getElementById("w1").getElementsByTagName("div");
                for(let i=0; i<positions.length; i++){
                    if(positions[i].id == strikePos){
                        positions[i].className = "miss";
                    }
                }
                $scope.gameMessage = "Enemy missed! Your turn";
                $scope.turn = true;
                $scope.$apply();
                break;
            case "missEnemy":
                var strikePos = e.data.split("/")[1];
                var positions = document.getElementById("w2").getElementsByTagName("div");
                for(let i=0; i<positions.length; i++){
                    if(positions[i].id == strikePos){
                        positions[i].className = "miss";
                    }
                }
                $scope.gameMessage = "You missed! Enemy turn";
                $scope.turn = false;
                $scope.$apply();
                break;
            case "hitSink":
                var sunkenPositions = e.data.split("/")[1].split("|");
                console.log(sunkenPositions);
                var positions = document.getElementById("w1").getElementsByTagName("div");
                for(let i=0; i<positions.length; i++){
                    if(sunkenPositions.includes(positions[i].id)){
                        positions[i].className = "hitSink";
                    }
                }
                $scope.gameMessage = "Enemy sunk your ship! Enemy turn again";
                $scope.$apply();
                break;
            case "hitSinkEnemy":
                var sunkenPositions = e.data.split("/")[1].split("|");
                var positions = document.getElementById("w2").getElementsByTagName("div");
                for(let i=0; i<positions.length; i++){
                    if(sunkenPositions.includes(positions[i].id)){
                        positions[i].className = "hitSink";
                    }
                }
                $scope.gameMessage = "You sunk enemy ship! Your turn again";
                $scope.$apply();
                break;
            case "win":
                $scope.turn = false;
                $scope.gameMessage = "You win!";
                $scope.$apply();
                break;
            case "lost":
                $scope.turn = false;
                $scope.gameMessage = "You lost!";
                $scope.$apply();
                break;
            case "opponentLeft":
                console.log("wot?");
                $scope.opponentLeft();
                $scope.gameMessage = "Opponent left the game. Waiting for another player";
                $scope.turn = false;
                $scope.$apply();
                break;
            case "turn":
                if(e.data.split("/")[1] == "true"){
                    $scope.turn = true;
                    $scope.gameMessage = "Your turn";
                } else {
                    $scope.turn = false;
                    $scope.gameMessage = "Enemy turn";
                }
                $scope.$apply();
                break;
            default:
                if(e.data.includes("|")){
                    // $scope.enableOpponentBoard(e.data.split("|"));
                } else {
                    console.log("Player ID:");
                    console.log(e.data);
                }
                break;
        }
    });

    $scope.sendBoard = function() {
        var shipPlacementsInfo = [[],[],[],[],[],[],[],[],[],[]];
        var shipPlacements = document.getElementById("w1").getElementsByTagName("div");

        for(let i=0; i<shipPlacements.length; i++){
            if(shipPlacements[i].attributes.ship.nodeValue == "1" && shipPlacements[i].hasChildNodes()){
                var orientation = shipPlacements[i].firstChild.className.split(" ")[1].split("-")[2];
                var xPos = parseInt(shipPlacements[i].id.split(",")[0], 10);
                var yPos = parseInt(shipPlacements[i].id.split(",")[1], 10);
                switch(shipPlacements[i].firstChild.id){
                    case "ship1,1":
                        shipPlacementsInfo[0].push(shipPlacements[i].id+"|");
                        break;
                    case "ship1,2":
                        shipPlacementsInfo[1].push(shipPlacements[i].id+"|");
                        break;
                    case "ship1,3":
                        shipPlacementsInfo[2].push(shipPlacements[i].id+"|");
                        break;
                    case "ship1,4":
                        shipPlacementsInfo[3].push(shipPlacements[i].id+"|");
                        break;
                    case "ship2,1":
                        if(orientation == "hor"){
                            for(let i=0; i<2; i++){
                                shipPlacementsInfo[4].push((xPos+i).toString()+","+yPos.toString()+"|");
                            }
                        } else {
                            for(let i=0; i<2; i++){
                                shipPlacementsInfo[4].push(xPos.toString()+","+(yPos-i).toString()+"|");
                            }
                        }
                        break;
                    case "ship2,2":
                        if(orientation == "hor"){
                            for(let i=0; i<2; i++){
                                shipPlacementsInfo[5].push((xPos+i).toString()+","+yPos.toString()+"|");
                            }
                        } else {
                            for(let i=0; i<2; i++){
                                shipPlacementsInfo[5].push(xPos.toString()+","+(yPos-i).toString()+"|");
                            }
                        }
                        break;
                    case "ship2,3":
                        if(orientation == "hor"){
                            for(let i=0; i<2; i++){
                                shipPlacementsInfo[6].push((xPos+i).toString()+","+yPos.toString()+"|");
                            }
                        } else {
                            for(let i=0; i<2; i++){
                                shipPlacementsInfo[6].push(xPos.toString()+","+(yPos-i).toString()+"|");
                            }
                        }
                        break;
                    case "ship3,1":
                        if(orientation == "hor"){
                            for(let i=0; i<3; i++){
                                shipPlacementsInfo[7].push((xPos+i).toString()+","+yPos.toString()+"|");
                            }
                        } else {
                            for(let i=0; i<3; i++){
                                shipPlacementsInfo[7].push(xPos.toString()+","+(yPos-i).toString()+"|");
                            }
                        }
                        break;
                    case "ship3,2":
                        if(orientation == "hor"){
                            for(let i=0; i<3; i++){
                                shipPlacementsInfo[8].push((xPos+i).toString()+","+yPos.toString()+"|");
                            }
                        } else {
                            for(let i=0; i<3; i++){
                                shipPlacementsInfo[8].push(xPos.toString()+","+(yPos-i).toString()+"|");
                            }
                        }
                        break;
                    case "ship4,1":
                        if(orientation == "hor"){
                            for(let i=0; i<4; i++){
                                shipPlacementsInfo[9].push((xPos+i).toString()+","+yPos.toString()+"|");
                            }
                        } else {
                            for(let i=0; i<4; i++){
                                shipPlacementsInfo[9].push(xPos.toString()+","+(yPos-i).toString()+"|");
                            }
                        }
                        break;
                }
            }
        }
        var shipPlacementsString = "";
        for(let i=0; i<shipPlacementsInfo.length; i++){
            shipPlacementsString += shipPlacementsInfo[i].toString()+"-";
        }
        $scope.ws.send(shipPlacementsString);

        // var shipPlacementsInfo = "";
        // var shipPlacements = document.getElementById("w1").getElementsByTagName("div");
        // for(let i=0; i<shipPlacements.length; i++){
        //     if(shipPlacements[i].attributes.ship.nodeValue == "1"){
        //         shipPlacements[i].id
        //         shipPlacementsInfo += shipPlacements[i].id+"|";
        //     }
        // }
        // shipPlacementsInfo.slice(0, -1);
        // console.log(shipPlacementsInfo);
        // $scope.ws.send(shipPlacementsInfo);
    }

    // $scope.enableOpponentBoard = function(positions){
    //     var divs = document.getElementById("w2").getElementsByTagName("div");
    //     console.log(document.getElementById("w2").getElementsByTagName("div"));
    //     for(let i=0; i<divs.length; i++){
    //         divs[i].innerHTML = "";
    //         divs[i].outerHTML = divs[i].outerHTML.slice(0,-7)+" on-Click='strike($event)'></div>";
    //         console.log(divs[i].outerHTML);
    //         // if(positions.includes(divs[i].id)){
    //         //     divs[i].attributes.ship.nodeValue = "1";
    //         // }
    //     }
    // }

    $scope.strike = function($event){
        console.log($event.target);
        if($scope.turn && $event.target.className == "square"){
            $scope.ws.send("strike/"+$event.target.id);
        }
    }
})

.controller("ship1Controller", function($scope, $element) {
    $scope.c = "ship-1-hor";

    var parentPos = document.getElementById($element[0].id).parentElement.id;
    var xPos = parseInt(parentPos.split(",")[0], 10);
    var yPos = parseInt(parentPos.split(",")[1], 10);

    takePlace($scope.c, xPos, yPos);
})
    
.controller("shipController", function($scope, $element) {

    var shipName = $element[0].id.split(",")[0];
    var shipSize = parseInt(shipName.charAt(shipName.length-1), 10);

    if(shipSize == 2){
        $scope.c = "ship-2-hor";
    } else if(shipSize == 3){
        $scope.c = "ship-3-hor";
    } else{
        $scope.c = "ship-4-hor";
    }

    // console.log($element[0].id.split(",")[0].charAt($element[0].id.split(",")[0].length-1));
    var parentPos = document.getElementById($element[0].id).parentElement.id;
    var xPos = parseInt(parentPos.split(",")[0], 10);
    var yPos = parseInt(parentPos.split(",")[1], 10);

    takePlace($scope.c, xPos, yPos);

    $scope.myFunc = function() {
        return $scope.c;
    }
    $scope.change = function() {
        if($scope.canRotate()){
            parentPos = document.getElementById($element[0].id).parentElement.id;
            xPos = parseInt(parentPos.split(",")[0], 10);
            yPos = parseInt(parentPos.split(",")[1], 10);

            var shipOrientation = $scope.c.split("-")[2];

            emptyPlace($scope.c, xPos, yPos);
            if(shipOrientation == "hor"){
                if(yPos != shipSize-1){
                    $scope.c = $scope.c.replace("hor", "ver");
                }
            }
            else {
                if(xPos != 10-(shipSize-2)){
                    $scope.c = $scope.c.replace("ver", "hor");
                }
            }
            takePlace($scope.c, xPos, yPos);
        }
    }
    $scope.canRotate = function() {
        if(document.getElementById($element[0].id).attributes.disabled.nodeValue == "true"){
            return false;
        }

        parentPos = document.getElementById($element[0].id).parentElement.id;
        xPos = parseInt(parentPos.split(",")[0], 10);
        yPos = parseInt(parentPos.split(",")[1], 10);

        if($scope.c.split("-")[2] == "hor"){
            for(let i=1; i<shipSize; i++){
                var newSpot = document.getElementById(xPos.toString()+","+(yPos-i).toString());
                if(newSpot == null){
                    return false;
                } else {
                    if((yPos-i) < (yPos-1) && newSpot.className == "busy"){
                        return false;
                    }
                }
            }

            for(let i=-1; i<2; i++){
                var nextSpot = document.getElementById((xPos+i).toString()+","+(yPos-shipSize).toString());
                if(nextSpot != null && nextSpot.attributes.ship.nodeValue == "1"){
                    return false;
                }
            }

            return true;
        } else {
            for(let i=1; i<shipSize; i++){
                var newSpot = document.getElementById((xPos+i).toString()+","+yPos.toString());
                if(newSpot == null){
                    return false;
                } else {
                    if((xPos+i) > (xPos+1) && newSpot.className == "busy"){
                        return false;
                    }
                }
            }

            for(let i=-1; i<2; i++){
                var nextSpot = document.getElementById((xPos+shipSize).toString()+","+(yPos-i).toString());
                if(nextSpot != null && nextSpot.attributes.ship.nodeValue == "1"){
                    return false;
                }
            }

            return true;
        }
    }
})

.controller("enemyBoard", function($scope) {

});
    
})();


function allowDrop(ev) {
    ev.preventDefault();
};
  
function drag(ev) {
    var position = document.getElementById(ev.target.id).parentElement.id;
    var xPos = parseInt(position.split(",")[0], 10);
    var yPos = parseInt(position.split(",")[1], 10);
    var shipClass = ev.target.className.split(" ")[1];
    
    updateBattlefield();
    emptyPlace(shipClass, xPos, yPos);

    var ships = document.getElementsByClassName("busy");
    for(let i=0; i<ships.length; i++){
        if(ships[i].hasChildNodes()){
            var c = ships[i].childNodes[0].className.split(" ")[1];
            var x = parseInt(ships[i].id.split(",")[0]);
            var y = parseInt(ships[i].id.split(",")[1]);

            if(!(x == xPos && y == yPos)){
                takePlace(c, x, y);
            }

        }
    }

    ev.dataTransfer.setData("text", ev.target.id);
};
  
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var shipType = data.split(",")[0];
    var positions = ev.target.id.split(",");
    var xPos = parseInt(positions[0], 10);
    var yPos = parseInt(positions[1], 10);

    var orientation = document.getElementById(data).className.split(" ")[1].split("-")[2];

    var size = parseInt(document.getElementById(data).className.split(" ")[1].split("-")[1], 10);

    var shipClass = document.getElementById(data).className.split(" ")[1];

    if(isNaN(xPos) || ev.target.className == "busy"){
        if(document.getElementById(data).attributes.pos.nodeValue != ""){
            var oldX = document.getElementById(data).attributes.pos.nodeValue.split(",")[0];
            var oldY = document.getElementById(data).attributes.pos.nodeValue.split(",")[1];
            takePlace(shipClass, oldX, oldY);
            return;
        }
    }

    if(orientation == "hor"){
        for(let i=0; i<size; i++){
            if(document.getElementById((xPos+i).toString()+","+yPos.toString()).className == "busy"){
                var oldX = document.getElementById(data).attributes.pos.nodeValue.split(",")[0];
                var oldY = document.getElementById(data).attributes.pos.nodeValue.split(",")[1];
                takePlace(shipClass, oldX, oldY);
                return;
            }
        }
    } else{
        for(let i=0; i<size; i++){
            if(document.getElementById(xPos.toString()+","+(yPos-i).toString()).className == "busy"){
                var oldX = document.getElementById(data).attributes.pos.nodeValue.split(",")[0];
                var oldY = document.getElementById(data).attributes.pos.nodeValue.split(",")[1];
                takePlace(shipClass, oldX, oldY);
                return;
            }
        }
    }

    if(shipType == "ship2"){
        if(orientation == "hor"){
            if(xPos != 10){
                try {
                    document.getElementById(data).attributes.pos.nodeValue = xPos.toString()+","+yPos.toString();
                    ev.target.appendChild(document.getElementById(data));
                }
                catch(e){
                    console.log(e);
                }
            }
        } else {
            if(yPos != 1){
                try {
                    document.getElementById(data).attributes.pos.nodeValue = xPos.toString()+","+yPos.toString();
                    ev.target.appendChild(document.getElementById(data));
                }
                catch(e){
                    console.log(e);
                }
            }
        }
    } else {
        try {
            document.getElementById(data).attributes.pos.nodeValue = xPos.toString()+","+yPos.toString();
            ev.target.appendChild(document.getElementById(data));
        }
        catch(e){
            console.log(e);
        }
    }

    takePlace(shipClass, xPos, yPos);
    updateBattlefield();
};

function updateBattlefield(){
    var divs = document.getElementById("w1").getElementsByTagName("div");
    
    for(let i=0; i<divs.length; i++){
        divs[i].className = "square";
    }

    var squares = document.getElementsByClassName("square");
    let shipClassList = [];
    let xPosList = [];
    let yPosList = [];
    for(let i=0; i<squares.length; i++){
        if(squares[i].hasChildNodes()){
            let shipClass = squares[i].childNodes[0].className.split(" ")[1];
            let xPos = parseInt(squares[i].id.split(",")[0]);
            let yPos = parseInt(squares[i].id.split(",")[1]);
            shipClassList.push(shipClass);
            xPosList.push(xPos);
            yPosList.push(yPos);
        }
    }

    for(let i=0; i<shipClassList.length; i++){
        takePlace(shipClassList[i], xPosList[i], yPosList[i]);
    }
}

function takePlace(shipClass, xPos, yPos){
    var orientation = shipClass.split("-")[2];
    var size = parseInt(shipClass.split("-")[1], 10);
    xPos = parseInt(xPos, 10);
    yPos = parseInt(yPos, 10);

    if(orientation == "hor"){
        var tempX = xPos-1;
        for(let i=0; i<size+2; i++){
            var tempY = yPos-1;
            for(let j=0; j<3; j++){
                if(document.getElementById(tempX.toString()+","+tempY.toString()) != null){
                    document.getElementById(tempX.toString()+","+tempY.toString()).className = "busy";
                }
                tempY += 1;
            }
            tempX += 1;
        }

        for(let i=0; i<size; i++){
            document.getElementById((xPos+i).toString()+","+yPos.toString()).attributes.ship.nodeValue = "1";
        }

    } else {
        var tempX = xPos-1;
        for(let i=0; i<3; i++){
            var tempY = yPos+1;
            for(let j=0; j<size+2; j++){
                if(document.getElementById(tempX.toString()+","+tempY.toString()) != null){
                    document.getElementById(tempX.toString()+","+tempY.toString()).className = "busy";
                }
                tempY -= 1;
            }
            tempX += 1;
        }

        for(let i=0; i<size; i++){
            document.getElementById(xPos.toString()+","+(yPos-i).toString()).attributes.ship.nodeValue = "1";
        }
    }
};

function emptyPlace(shipClass, xPos, yPos){
    var orientation = shipClass.split("-")[2];
    var size = parseInt(shipClass.split("-")[1], 10);

    if(orientation == "hor"){
        var tempX = xPos-1;
        for(let i=0; i<size+2; i++){
            var tempY = yPos-1;
            for(let j=0; j<3; j++){
                if(document.getElementById(tempX.toString()+","+tempY.toString()) != null){
                    document.getElementById(tempX.toString()+","+tempY.toString()).className = "square";
                    document.getElementById(tempX.toString()+","+tempY.toString()).attributes.ship.nodeValue = "0";
                }
                tempY += 1;
            }
            tempX += 1;
        }
    } else {
        var tempX = xPos-1;
        for(let i=0; i<3; i++){
            var tempY = yPos+1;
            for(let j=0; j<size+2; j++){
                if(document.getElementById(tempX.toString()+","+tempY.toString()) != null){
                    document.getElementById(tempX.toString()+","+tempY.toString()).className = "square";
                    document.getElementById(tempX.toString()+","+tempY.toString()).attributes.ship.nodeValue = "0";
                }
                tempY -= 1;
            }
            tempX += 1;
        }
    }
};
    
    