var HTTPS = require('https');

var botID = process.env.BOT_ID,
botCommandRoll =  /^\/roll/;
botCommandSing =  /^\/sing/;

function respond() {
  var request = JSON.parse(this.req.chunks[0]);
  if(request.text && botCommandRoll.test(request.text)){
    rollHandler(this, request);
  } else if(request.text && botCommandSing.test(request.text)){
    singHandler(this, request);
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

/* 
This function handles dice rolls 
*/
function rollHandler(relThis, command){
  var rollCount = 0,
  rollMax = 0,
  rollSum = 0,
  rollMod = 0;
  rollString = "";
  console.log("Initiating dice roll");
  relThis.res.writeHead(200);
  relThis.res.end();
  if(!command.text.split(' ')[1]){
    postMessage("You have to tell me what to roll.", command.name, command.user_id);
	console.log("No dice specified.");
    relThis.res.writeHead(200);
    relThis.res.end();
	return;
  } else if(command.text.split(' ')[2]){
    postMessage("That doesnt make sense.", command.name, command.user_id);
	console.log("Invalid input.")
    relThis.res.writeHead(200);
    relThis.res.end();
  } else if(command.text.split(' ')[1] && command.text.split(' ')[1].split('d')[1]) {
    //dice setup 
    rollCount = parseInt(command.text.split(' ')[1].split('d')[0]);
    rollMax = parseInt(command.text.split(' ')[1].split('d')[1]);
	if (command.text.split(' ')[1].split('+')[1]){
      rollMod = parseInt(command.text.split(' ')[1].split('+')[1]);
    }
  console.log('Count: ' + rollCount + ", Max: " + rollMax + ", Modifier: " + rollMod);
  } else {
    rollCount = 0;
    rollMax = 0;
  }
  relThis.res.writeHead(200);

  if ([4,6,8,10,12,20].indexOf(rollMax) > -1){
  console.log("Rolling dice.")
  relThis.res.writeHead(200);
  relThis.res.end();
    for(i = 0; i < rollCount; i++){
    var rollTmp;
    rollTmp = roll(rollMax);
      rollSum += rollTmp;
      if (i < 1){
        rollString = rollString + " " + rollTmp ;
      } else {
        rollString = rollString + ", " + rollTmp ;
      }
	}

    if(!rollCount == 0 && !rollMax == 0) {

      var rollTest = Math.ceil(rollSum / (rollCount * rollMax) * 100);
      postMessage(("rolled: " + rollString + " [" + rollCount + "d" + rollMax + "] Total = " + (rollSum + rollMod)), command.name, command.user_id);
	  console.log("Dice roll completed.");
	  relThis.res.writeHead(200);
      relThis.res.end();
	  //Check for 1d20 Critical Rolls
	  if (rollCount == 1 && rollMax == 20 && (rollSum == 1 || rollSum == 20) ){
	    switch (true){
  	      case (rollSum == 1):
	        postMessage(("I hope that wasnt a DC save.  Critical Failure!"), command.name, command.user_id);
	        break;
	      case (rollSum == 20):
  	        postMessage(("Natural 20!"), command.name, command.user_id);
	  	    break;
          default:
	    }
	  } else {
	    //Check roll ranges
	    switch (true){
	      case (rollTest < 20):
		    postMessage(("That was an ugly roll..."), command.name, command.user_id);
	  	    break;
    	    case (rollTest < 80):
		    //nothing in here right now.  This is just a normal roll
		    break;
	      case (rollTest <= 100):
            postMessage(("Nice roll!"), command.name, command.user_id);
            break;
          default:
	    }
	  }
      relThis.res.end();
    } 
  }else {
    postMessage("That is not a valid die type", command.name, command.user_id);
	console.log("Invalid die type.");
    relThis.res.writeHead(200);
    relThis.res.end();
  }
}

/*
This function handles the sing comand
*/
function singHandler(relThis, command){
  postMessage("You dont want me to do that. Think cats. Digital cats... It's not a pretty picture.", command.name, command.user_id);
  relThis.res.writeHead(200);
  relThis.res.end();
}

function roll(sides){
  var result = Math.ceil(Math.random()*(sides));
  return result;
}

function postMessage(message, name, id) {
  var botResponse, options, body, botReq;
  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : "@" + name + " " + message,
    "attachments": [
      {
        "type": "mentions",
        "user_ids": [id],
        "loci": [ [0,name.length + 1] ]
      }
    ]
  };

  botReq = HTTPS.request(options, function(res) {
    if(res.statusCode == 202) {
      //neat
    } else {
      console.log('rejecting bad status code ' + res.statusCode);
    }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;
