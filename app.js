var restify = require('restify');
var botbuilder = require('botbuilder');

// Creating bot
var connector = new botbuilder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new botbuilder.UniversalBot(connector);

bot.dialog('/', function(session) {
    session.send("Hello world!");
});

// Creating server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
    console.log('listening...');
});
server.post('/api/messages', connector.listen());