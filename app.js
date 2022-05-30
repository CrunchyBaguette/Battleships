(function () {
'use strict';
    
    
angular.module('battleships', [])

// .controller("battlefield", function($scope, $element) {
//     var divsEmpty = document.getElementsByClassName("square");
//     var divsTaken = document.getElementsByClassName("busy");
    
//     $scope.updateBattlefield = function() {
//         for(var i = 0; i < divsEmpty.length; i++){
//             if(divsEmpty[i].hasChildNodes()){
//                 divsEmpty[i].className = "busy";
//             }
//         }
    
//         for(var i = 0; i < divsTaken.length; i++){
//             if(!divsTaken[i].hasChildNodes()){
//                 divsTaken[i].className = "square";
//             }
//         }
//     }

//     $scope.field = function($element){
//         console.log($element.id);
//         for(var i = 0; i < divsEmpty.length; i++){
//             if(divsEmpty[i].id == id){
//                 if(divsEmpty[i].hasChildNodes()){
//                     divsEmpty[i].className = "busy";
//                 }
//                 return divsEmpty[i].className;
//             }
//         }
    
//         for(var i = 0; i < divsTaken.length; i++){
//             if(divsTaken[i].id == id){
//                 if(!divsTaken[i].hasChildNodes()){
//                     divsTaken[i].className = "square";
//                 }
//                 return divsTaken[i].className;
//             }
//         }
//     }
// })
    
.controller("ship2Controller", function($scope, $element) {
    $scope.c = "ship-2-hor";

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

            $scope.shipSize = parseInt($scope.c.split("-")[1], 10);
            $scope.shipOrientation = $scope.c.split("-")[2];

            emptyPlace($scope.c, xPos, yPos);
            if($scope.c == "ship-2-hor"){
                if(yPos != 1){
                    $scope.c = "ship-2-ver";
                }
            }
            else {
                if(xPos != 10){
                    $scope.c = "ship-2-hor";
                }
            }
            takePlace($scope.c, xPos, yPos);
        }
    }
    $scope.canRotate = function() {
        if($scope.shipOrientation == "hor"){
            for(let i=1; i<$scope.shipSize; i++){
                var newSpot = document.getElementById(xPos.toString()+","+(yPos-i).toString());
                if(newSpot == null || newSpot.className == "busy"){
                    return false;
                }
            }
            return true;
        } else {
            for(let i=1; i<$scope.shipSize; i++){
                var newSpot = document.getElementById((xPos+i).toString()+","+yPos.toString());
                if(newSpot == null || newSpot.className == "busy"){
                    return false;
                }
            }
            return true;
        }
    }
});
    
})();


function allowDrop(ev) {
    if(ev.target.className != "busy"){
        ev.preventDefault();
    }
};
  
function drag(ev) {
    var position = document.getElementById(ev.target.id).parentElement.id;
    var xPos = parseInt(position.split(",")[0], 10);
    var yPos = parseInt(position.split(",")[1], 10);
    var shipClass = ev.target.className.split(" ")[1];
    
    emptyPlace(shipClass, xPos, yPos);

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

    var shipClass = document.getElementById(data).className.split(" ")[1];
    
    console.log(orientation);
    console.log(shipType);
    console.log(xPos);
    console.log(yPos);
    // console.log(document.getElementById(ev.target.id).parentElement.id);

    if(isNaN(xPos)){
        return;
    }

    // if(shipType == "ship2"){
    //     if(orientation == "hor"){
    //         var tempX = xPos;
    //         for(let i=0; i<2; i++){
    //             document.getElementById(tempX.toString()+","+yPos.toString()).className = "square";
    //             tempX = parseInt(tempX, 10) + 1;
    //         }
    //     } else {
    //         var tempY = yPos;
    //         for(let i=0; i<2; i++){
    //             document.getElementById(xPos.toString()+","+tempY.toString()).className = "square";
    //             tempY = parseInt(tempY, 10) + 1;
    //         }
    //     }
    // }

    if(shipType == "ship2"){
        if(orientation == "hor"){
            if(xPos != 10){
                try {
                    ev.target.appendChild(document.getElementById(data));
                }
                catch(e){
                    console.log(e);
                }
            }
        } else {
            if(yPos != 1){
                try {
                    ev.target.appendChild(document.getElementById(data));
                }
                catch(e){
                    console.log(e);
                }
            }
        }
    }
    takePlace(shipClass, xPos, yPos);
    updateBatlefield();


    // if(shipType == "ship2"){
    //     if(orientation == "hor"){
    //         var tempX = xPos;
    //         for(let i=0; i<2; i++){
    //             document.getElementById(tempX.toString()+","+yPos.toString()).className = "busy";
    //             tempX = parseInt(tempX, 10) + 1;
    //         }
    //     } else {
    //         var tempY = yPos;
    //         for(let i=0; i<2; i++){
    //             document.getElementById(xPos.toString()+","+tempY.toString()).className = "busy";
    //             tempY = parseInt(tempY, 10) + 1;
    //         }
    //     }
    // }
};

function updateBatlefield(){
    var taken = document.getElementsByClassName("busy");
    for(let i=0; i<taken.length; i++){
        if(taken[i].hasChildNodes()){
            var shipClass = taken[i].childNodes[0].className.split(" ")[1];
            var xPos = parseInt(taken[i].id.split(",")[0]);
            var yPos = parseInt(taken[i].id.split(",")[1]);
            // THIS IS HOW YOU GET OLD SHIP POSITION TO "DIFICULT" PLACES
            // BY USING CUSTOM ATTRUBUTE IN THE 'IMG' DOM IN HTML
            console.log(taken[i].childNodes[0].attributes.pos.nodeValue);
            takePlace(shipClass, xPos, yPos);
        }
    }
}

function takePlace(shipClass, xPos, yPos){
    var orientation = shipClass.split("-")[2];
    var size = parseInt(shipClass.split("-")[1], 10);

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
                }
                tempY -= 1;
            }
            tempX += 1;
        }
    }
};

