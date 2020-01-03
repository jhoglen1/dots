'use strict';

var counterTotalValidMoves = 0;
var currentSelection = new Object();
var existingPoints = [];
var moveSuccessfullyCompleted = null;
var node = document.getElementById('app');
var nodeFirstMove = new Object();
var nodeLastMove = new Object();
var nodeOrigination = "";
var proposedIntermediatePoints = [];
var turn = 1;

const app = Elm.Main.embed(node, {
    api: 'Client',
    hostname: '',
});

app.ports.startTimer.subscribe((int) => {
    setTimeout(() => {
        app.ports.timeout.send(int);
    }, 10000);
});

function processInitialize() {

    var outgoing = new Object();

    outgoing.msg = "INITIALIZE";
    outgoing.body = new Object();
    
    outgoing.body.newLine = null;
    outgoing.body.heading = "Player 1";
    outgoing.body.message = null;

    currentSelection = null;
    turn = 1;
    console.log(outgoing);

    return outgoing;

};



function getLine(start, end) {

    var newLine = new Object();
    newLine.start = start;
    newLine.end = end;

    console.log(newLine);
    return newLine;
};

function containsPoint(toCheck) {

  
    for (var x = 0; x < existingPoints.length; x++) {
        
        var p = existingPoints[x];
        var checkThisPoint = "Checking " + p.x + "," + p.y;
        checkThisPoint += " -> " + toCheck.x + "," + toCheck.y;

     

        if (p.x == toCheck.x && p.y == toCheck.y) {
            return true;
        }

    }
    return false;

}

function isValidMovementChecksInitial(startPoint, endPoint) {
    var diffX = Math.abs(startPoint.x - endPoint.x);
    var diffY = Math.abs(startPoint.y - endPoint.y);

    if (containsPoint(endPoint)) {

        return false;
    }

  
    if (diffX / diffY !== 0 && diffX / diffY !== 1 && diffX / diffY !== Infinity) {

        return false;
    }

  
    return true;

}

function processNodeClicked(incomingBody) {
  
    var outgoing = new Object();

    outgoing.body = new Object();



    if (currentSelection == null) {
        if (counterTotalValidMoves < 1) {
            
         
            outgoing.msg = "VALID_START_NODE";

            outgoing.body.newLine = null;
            outgoing.body.heading = "Player " + turn;
            outgoing.body.message = null;
          
            currentSelection = incomingBody;
        } else if ((incomingBody.x == nodeFirstMove.x) && (incomingBody.y == nodeFirstMove.y) || (incomingBody.x == nodeLastMove.x) && (incomingBody.y == nodeLastMove.y)) {

            nodeOrigination = (incomingBody.x == nodeFirstMove.x) && (incomingBody.y == nodeFirstMove.y) ? "nodeEndpointA" : "nodeEndpointB";
            
          
            outgoing.msg = "VALID_START_NODE";

            outgoing.body.newLine = null;
            outgoing.body.heading = "Player " + turn;
            outgoing.body.message = null;
          
            currentSelection = incomingBody;
        } else {

            outgoing.msg = "INVALID_START_NODE";

            outgoing.body.newLine = null;
            outgoing.body.heading = "Player " + turn;
            outgoing.body.message = "You must start on either end of the path!";


            currentSelection = null;

        }

    }


   
    else if (incomingBody.x == currentSelection.x && incomingBody.y == currentSelection.y) {
       
      
        outgoing.msg = "INVALID_START_NODE";

        outgoing.body.newLine = null;
        outgoing.body.heading = "Player " + turn;
        outgoing.body.message = "";

        currentSelection = null;

    }


    else if (isValidMovementChecksInitial(currentSelection, incomingBody)) {
        var xValues = [];
        var yValues = [];
        var xLow;
        var xHigh;
        var yLow;
        var yHigh;
        var differenceX;
        var differenceY;
        var differenceValues = [];
        var differenceHighest;
        var numberOfIntermediatePoints;

          
        if (existingPoints.length == 0) {
            existingPoints.push(currentSelection);
        }


        xValues.push(currentSelection.x, incomingBody.x)
        yValues.push(currentSelection.y, incomingBody.y)
        xValues.sort(function (a, b) { return a - b });
        yValues.sort(function (a, b) { return a - b });
        xLow = xValues[0];
        xHigh = xValues[1];
        yLow = yValues[0];
        yHigh = yValues[1];
        differenceX = xHigh - xLow;
        differenceY = yHigh - yLow;

        differenceValues.push(differenceX, differenceY)
        differenceValues.sort(function (a, b) { return a - b });
        differenceHighest = differenceValues[1];
        numberOfIntermediatePoints = differenceHighest * 2 - 1;
       

      
        for (var z = .5; z <= numberOfIntermediatePoints / 2; z += .5) {
            var intermediatePointX;
            var intermediatePointY;

            if (xLow == xHigh) {
                intermediatePointX = xLow;
                intermediatePointY = yLow + z
            } else {
                intermediatePointX = xLow + z
            }

           
            if (yLow == yHigh) {
                intermediatePointY = yLow;
            }

            if (yLow !== yHigh && currentSelection.y > incomingBody.y && currentSelection.x < incomingBody.x) {
                intermediatePointY = yHigh - z
            }

         
            if (yLow !== yHigh && currentSelection.y < incomingBody.y && currentSelection.x < incomingBody.x) {
                intermediatePointY = yLow + z
            }

 
            if (yLow !== yHigh && currentSelection.y < incomingBody.y && currentSelection.x > incomingBody.x) {
                intermediatePointY = yHigh - z
            }

          
            if (yLow !== yHigh && currentSelection.y > incomingBody.y && currentSelection.x > incomingBody.x) {
                intermediatePointY = yLow + z
            }


  

            proposedIntermediatePoints.push(
                {
                    x: intermediatePointX,
                    y: intermediatePointY
                }
            );
        }

        function isValidMovementChecksFinal() {
            for (var z = 0; z < proposedIntermediatePoints.length; z++) {
             
                if (containsPoint(proposedIntermediatePoints[z])) {
                    console.log("we have a problem" + proposedIntermediatePoints[z].x + " " + proposedIntermediatePoints[z].y)

                    return false;
                } else {
                
                }
            }
            return true;
        }
        if (isValidMovementChecksFinal()) {
            counterTotalValidMoves++;
          
            if (counterTotalValidMoves == 1) {

                nodeFirstMove = currentSelection;
            }

            if (nodeOrigination === "nodeEndpointA") {
                nodeFirstMove = incomingBody;
            } else if (nodeOrigination === "nodeEndpointA") {
           
                nodeLastMove = incomingBody;
            } else {
       
                nodeLastMove = incomingBody;
            }

            for (var z = 0; z < proposedIntermediatePoints.length; z++) {
                existingPoints.push(
                    {
                        x: proposedIntermediatePoints[z].x,
                        y: proposedIntermediatePoints[z].y
                    }
                );
            }
          
            proposedIntermediatePoints.length = 0;

            
            existingPoints.push(incomingBody);

          
            outgoing.msg = "VALID_END_NODE";

                  
            turn = (turn % 2) + 1;

            outgoing.body.newLine = getLine(currentSelection, incomingBody);
            outgoing.body.heading = "Player " + turn;
            outgoing.body.message = null;
            currentSelection = null;

            moveSuccessfullyCompleted = true;
        } else {
            outgoing.msg = "INVALID_END_NODE";
            outgoing.body.newLine = null;
            outgoing.body.heading = "Player " + turn;
            outgoing.body.message = "Invalid move. Try Again.";
            currentSelection = null;

        
            proposedIntermediatePoints.length = 0;
        }

    }

    else {

        outgoing.msg = "INVALID_END_NODE";

        outgoing.body.newLine = null;
        outgoing.body.heading = "Player " + turn;
        outgoing.body.message = "Invalid move. Try Again";
        currentSelection = null;

    }

    return outgoing;

}

function processIncomingMessage(message) {

    var incomingMessage = message.msg;
    var incomingBody = message.body;

    if (incomingMessage == "INITIALIZE") {

        return processInitialize();
    }

    else if (incomingMessage == "NODE_CLICKED") {
        
        return processNodeClicked(incomingBody);
    }

    else {

        throw new Exception("Unknown message: " + incomingMessage);

    }

}

app.ports.request.subscribe((message) => {

  
    message = JSON.parse(message);

    var responseObj = processIncomingMessage(message);

   
    app.ports.response.send(responseObj);
});
