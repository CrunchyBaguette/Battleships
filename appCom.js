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
                console.log(parentPos);
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
    
            parentPos = document.getElementById($element[0].id).parentElement.id;
            xPos = parseInt(parentPos.split(",")[0], 10);
            yPos = parseInt(parentPos.split(",")[1], 10);
    
            if($scope.c.split("-")[2] == "hor"){
                // for(let i=1; i<$scope.shipSize; i++){
                //     var newSpot = document.getElementById(xPos.toString()+","+(yPos-i).toString());
                //     if(newSpot == null || newSpot.className == "busy"){
                //         return false;
                //     }
                // }
                var newSpot = document.getElementById(xPos.toString()+","+(yPos-1).toString());
                var nextSpot = document.getElementById(xPos.toString()+","+(yPos-2).toString());
                if(newSpot == null || (nextSpot != null && nextSpot.className == "busy")){
                    console.log(xPos.toString()+","+yPos.toString());
                    console.log(newSpot);
                    console.log(nextSpot);
                    return false;
                }
                return true;
            } else {
                // for(let i=1; i<$scope.shipSize; i++){
                //     var newSpot = document.getElementById((xPos+i).toString()+","+yPos.toString());
                //     if(newSpot == null || newSpot.className == "busy"){
                //         return false;
                //     }
                // }
                var newSpot = document.getElementById((xPos+1).toString()+","+yPos.toString());
                var nextSpot = document.getElementById((xPos+2).toString()+","+yPos.toString());
                if(newSpot == null || (nextSpot != null && nextSpot.className == "busy")){
                    console.log(xPos.toString()+","+yPos.toString());
                    console.log(newSpot);
                    console.log(nextSpot);
                    return false;
                }
                return true;
            }
        }
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
        
        emptyPlace(shipClass, xPos, yPos);
    
        //loop and update board for all except this one
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
        console.log(xPos);
        console.log(yPos);
    
        var orientation = document.getElementById(data).className.split(" ")[1].split("-")[2];
    
        var shipClass = document.getElementById(data).className.split(" ")[1];
        
        // console.log(orientation);
        // console.log(shipType);
        // console.log(xPos);
        // console.log(yPos);
        // console.log(document.getElementById(ev.target.id).parentElement.id);
    
        if(isNaN(xPos) || ev.target.className == "busy"){
            var oldX = document.getElementById(data).attributes.pos.nodeValue.split(",")[0];
            var oldY = document.getElementById(data).attributes.pos.nodeValue.split(",")[1];
            takePlace(shipClass, oldX, oldY);
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
        }
        // takePlace(shipClass, xPos, yPos);
        // console.log("test");
        takePlace(shipClass, xPos, yPos);
        updateBattlefield();
    
    
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
    
    function updateBattlefield(){
        var divs = document.getElementById("wrapper").getElementsByTagName("div");
        
        for(let i=0; i<divs.length; i++){
            divs[i].className = "square";
        }
    
        var squares = document.getElementsByClassName("square");
        let shipClassList = [];
        let xPosList = [];
        let yPosList = [];
        // console.log(squares.length);
        for(let i=0; i<squares.length; i++){
            //console.log(i);
            // console.log(squares[i].firstChild);
            if(squares[i].hasChildNodes()){
                let shipClass = squares[i].childNodes[0].className.split(" ")[1];
                let xPos = parseInt(squares[i].id.split(",")[0]);
                let yPos = parseInt(squares[i].id.split(",")[1]);
                shipClassList.push(shipClass);
                xPosList.push(xPos);
                yPosList.push(yPos);
                // THIS IS HOW YOU GET OLD SHIP POSITION TO "DIFICULT" PLACES
                // BY USING CUSTOM ATTRUBUTE IN THE 'IMG' DOM IN HTML
                // console.log(taken[i].childNodes[0].attributes.pos.nodeValue);
                // takePlace(shipClass, xPos, yPos);
            }
        }
    
        // console.log(shipClassList.length);
        for(let i=0; i<shipClassList.length; i++){
            // console.log(shipClassList[i]);
            // console.log(xPosList[i]);
            // console.log(yPosList[i]);
            takePlace(shipClassList[i], xPosList[i], yPosList[i]);
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
    
    