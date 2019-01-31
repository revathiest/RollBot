var HTTPS = require('https');

var botID = process.env.BOT_ID,
botCommandRoll =  /^\/roll/;
botCommandSing =  /^\/sing/;
//roll
//d4, d6, d8, d10, d20
//min max
// @User rolled: val


function respond() {
  var request = JSON.parse(this.req.chunks[0]);
  if(request.text && botCommandRoll.test(request.text)){
      commandHandler(this, request);
  } else if(request.text && botCommandSing.test(request.text)){
      postMessage("Looks like it works.", request.name, request.user_id);
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function commandHandler(relThis, command){
  var rollCount = 0, //command.text.split(' ')[1] ? command.text.split(' ')[1] : 1,
      rollMin = 0,
      rollMax = 0;
      rollSum = 0;
  var rollString = "";
/*
Default vals
      rollCount = 1; //command.text.split(' ')[1] ? command.text.split(' ')[1] : 1,
      rollMin = 1;
      rollMax = 100;
*/
if(!command.text.split(' ')[1]){
//Pure Roll
  rollCount = 1;
  rollMin = 1;
  rollMax = 100;
} else if(command.text.split(' ')[1] && command.text.split(' ')[1].split('d')[1]){
//dice setup 
  rollCount = parseInt(command.text.split(' ')[1].split('d')[0]);
  rollMin = 1;
  rollMax = parseInt(command.text.split(' ')[1].split('d')[1]);
} else if(command.text.split(' ')[1] && command.text.split(' ')[2]){
//min max
  rollCount = 1;
  rollMin = parseInt(command.text.split(' ')[1]);
  rollMax = parseInt(command.text.split(' ')[2]);
} else {
  rollCount = 1;
  rollMin = 0;
  rollMax = 0;
}
  console.log('Count: ' + rollCount + ", Min: " + rollMin + ", Max: " + rollMax);
  relThis.res.writeHead(200);
  
  // Original code
  //postMessage(("@" + command.name + " rolled: " + roll(rollCount, rollMin, rollMax) + " [" + rollMin + "-" + rollMax + "]"), command.name, command.user_id);

  //This is the junk I've written
  for(i = 0; i < rollCount; i++){
  var rollTmp = roll(1, rollMin, rollMax) 
  rollSum += rollTmp
    if (i < 1){
      rollString = rollString + " " + rollTmp 
    } else {
      rollString = rollString + ", " + rollTmp 
    }
  } 
  postMessage(("@" + command.name + " rolled: " + rollString + " [" + rollCount + "d" + rollMax + "] Total = " + rollSum), command.name, command.user_id);
  
  relThis.res.end();
}

function roll(count, min, max){
  var result = 0;
  if(count === 1){
    result = min + Math.floor(Math.random()*(max-min+1));
  } else {
    for(i = 0; i < count; i++){
      result = result + (min + Math.floor(Math.random()*(max-min+1)));
    }
  }
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
    "text" : message,
    "attachments": [
    {
      "type": "mentions",
      "user_ids": [id],
      "loci": [
        [0,name.length + 1]
      ]

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
