var restify = require('restify');
var botbuilder = require('botbuilder');

// Creating bot
var connector = new botbuilder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new botbuilder.UniversalBot(connector);
var recognizer = new botbuilder.LuisRecognizer(process.env.LUIS);
var dialog = new botbuilder.IntentDialog({ recognizers: [recognizer] });

bot.dialog('/', dialog);
// bot.dialog('/', function(session) {
//     session.send("Hello world!");
// });

dialog.matches('ServerUp', [function(session, data, next){
    session.send("No");
}]);
dialog.onDefault(botbuilder.DialogAction.send('Wut? :thinking-face:'));

// Creating server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
    console.log('listening...');
});
server.post('/api/messages', connector.listen());