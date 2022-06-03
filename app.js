(function () {
'use strict';
    
angular.module('battleships', [])

.controller("websocket", function($scope) {

    $scope.ws = new WebSocket("ws://localhost:8082");

    $scope.message = "Click to prepare";

    $scope.prepare = function() {
        if($scope.message == "Click to prepare"){
            $scope.message = "Waiting for other player!";
        } else {
            $scope.message = "Click to prepare";
        }
        $scope.ws.send("connect");
        $scope.toggleBoard();
    }

    $scope.toggleBoard = function(){
        var squares = document.getElementById("w1").getElementsByTagName("div");
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
        }
        return;
    }

    $scope.ws.addEventListener("open", () => {
        console.log("We are connected!");
    });

    $scope.ws.addEventListener("message", e => {
        switch(e.data){
            case "sendBoard":
                $scope.sendBoard();
                break;
            default:
                console.log(e.data);
                break;
        }
    });

    $scope.sendBoard = function() {
        var shipPlacementsInfo = ""
        var shipPlacements = document.getElementById("w1").getElementsByTagName("div");
        for(let i=0; i<shipPlacements.length; i++){
            if(shipPlacements[i].attributes.ship.nodeValue == "1"){
                shipPlacementsInfo += shipPlacements[i].id+"|";
            }
        }
        shipPlacementsInfo.slice(0, -1);
        console.log(shipPlacementsInfo);
        $scope.ws.send(shipPlacementsInfo);
        $scope.$broadCasr
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

