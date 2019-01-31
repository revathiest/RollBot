var HTTPS = require('https');

var botID = process.env.BOT_ID,
botCommandRoll =  /^\/roll/;
botCommandSing =  /^\/sing/;


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
	var rollCount = 0,
	rollMax = 0;
	rollSum = 0;
	rollTmp
	var rollString = "";

	if(!command.text.split(' ')[1]){
		//Need more info
		postMessage("You have to tell me what to roll.", command.name, command.user_id);
		relThis.res.writeHead(200);
		relThis.res.end();
	} else if(command.text.split(' ')[2]){
		postMessage("That doesnt make sense.", command.name, command.user_id);
		relThis.res.writeHead(200);
		relThis.res.end();
	} else if(command.text.split(' ')[1] && command.text.split(' ')[1].split('d')[1]) {
		//dice setup 
		rollCount = parseInt(command.text.split(' ')[1].split('d')[0]);
		rollMax = parseInt(command.text.split(' ')[1].split('d')[1]);
	} else {
		rollCount = 0;
		rollMax = 0;
	}
	console.log('Count: ' + rollCount + ", Max: " + rollMax);
	relThis.res.writeHead(200);

	for(i = 0; i < rollCount; i++){
		rollTmp = roll(rollMax),
		rollSum += rollTmp;
		if (i < 1){
			rollString = rollString + " " + rollTmp;
		} else {
			rollString = rollString + ", " + rollTmp;
		}
	}

	if(!rollCount == 0) {
		postMessage(("rolled: " + rollString + " [" + rollCount + "d" + rollMax + "] Total = " + rollSum), command.name, command.user_id);
		switch(Math.floor(rollSum / (rollCount * rollMax) * 100)){
		case 1-5:
			postMessage(("Oooh... tough break."), command.name, command.user_id);
			break;
		case 95-99:
			postMessage(("Nice roll!"), command.name, command.user_id);
			break;
		default:
		}
	relThis.res.end();
	}
}

function roll(max){
	var result = Math.ceil(Math.random()*(max));
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
		"attachments": [{
			"type": "mentions",
			"user_ids": [id],
			"loci": [[0,name.length + 1]]
		}]
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
