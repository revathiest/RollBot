var HTTPS = require('https');

var botID = process.env.BOT_ID,
botCommand =  /^\/roll/;
//roll
//d4, d6, d8, d10, d20
//min max
// @User rolled: val


function respond() {
  var request = JSON.parse(this.req.chunks[0]);
  if(request.text && botCommand.test(request.text)){
      commandHandler(this, request);
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function commandHandler(relThis, command){
  var rollCount = 1 //command.text.split(' ')[1] ? command.text.split(' ')[1] : 1,
      rollMin = 1,
      rollMax = 100;
  relThis.res.writeHead(200);
  postMessage(("@" + command.name + " rolled: " + roll(rollCount, rollMin, rollMax)), command.name, command.user_id);
  relThis.res.end();
}

function roll(count, min, max){
  var result = 0;
  if(count === 1){
    result = Math.floor(Math.random()*max+min);
  } else {
    for(i = 0; i < count; i++){
      result = 0;
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

if(arg){
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
}


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