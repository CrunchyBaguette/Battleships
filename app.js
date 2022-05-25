(function () {
'use strict';
    
    
angular.module('battleships', [])

.controller("gameController", function($scope) {

    $scope.board = [["","","","","","","","","",""],
                    ["","","","","","","","","",""],
                    ["","","","","","","","","",""],
                    ["","","","","","","","","",""],
                    ["","","","","","","","","",""],
                    ["","","","","","","","","",""],
                    ["","","","","","","ship-2-hor","","",""],
                    ["","","","","","","","","",""],
                    ["","","","","","","","","",""],
                    ["","","ship-2-hor","","","","","","",""]];

})
    
.controller("shipController", function($scope) {
    $scope.c = "ship-2-hor";
    $scope.myFunc = function() {
        return $scope.c;
    }
    $scope.change = function() {
        if($scope.c == "ship-2-hor"){
            $scope.c = "ship-2-ver";
        }
        else {
            $scope.c = "ship-2-hor";
        }
    }
});
    
})();

function allowDrop(ev) {
    ev.preventDefault();
};
  
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
};
  
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    // console.log(ev.target.id);
    // if(ev.target.id != "1"){
    //     ev.target.appendChild(document.getElementById(data));
    // }
    ev.target.appendChild(document.getElementById(data));
};