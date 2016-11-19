var restify = require('restify');
var botbuilder = require('botbuilder');

var Client = require('node-rest-client').Client;
var client = new Client();

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
dialog.matches('CurrentTime', [function(session, data, next){
    session.send(new Date().toTimeString());
}]);
dialog.matches('GetNewsWithId', [function(session, data, next){
    var id = botbuilder.EntityRecognizer.findEntity(data.entities, 'Id');
    console.log('requesting news with id ' + id.entity);
    client.get("http://localhost:3001/api/news/get/" + id.entity, {},
        function (data, response) {
            if (data == "ERROR"){
                session.send("We couldn't find a news with the id "+ id.entity);
                session.endDialog();
                return;
            }
            //session.send(JSON.stringify(data[0]));
            var reply = new botbuilder.Message(session).text(JSON.stringify(data[0])).addAttachment({contentType: 'image/jpeg', contentUrl: 'http://localhost:3001/Assets/images/news/' + data[0].img});
            botbuilder.Prompts.attachment(session, reply);
            session.endDialog();
        });
    
}]);
dialog.matches('UpdateNewsWithId', [function(session, data, next){
    var id = botbuilder.EntityRecognizer.findEntity(data.entities, 'Id');    
    client.get("http://localhost:3001/api/news/get/" + id.entity, {},
        function (data, response) {
            if (data == "ERROR"){
                session.send("We couldn't find a news with the id "+ id.entity);
                session.endDialog();
                return;                
            }
            //var reply = new botbuilder.Message(session).text("Here's the actual content. \n" + JSON.stringify(data[0])).addAttachment({contentType: 'image/jpeg', contentUrl: 'http://localhost:3001/Assets/images/news/' + data[0].img});
            //botbuilder.Prompts.attachment(session, reply);
            //botbuilder.Prompts.text(session, "What will be the new content of the news ?");
            session.send("Here's the actual content.");
            session.send(JSON.stringify(data[0]));
            session.send("What will be the new content of the news ?");
            session.dialogData.newsID = id.entity;
            
        });
    
}, function(session, data){
    var args = {
        data: { content:data.response },
        headers: { "Content-Type": "application/json" }
    };
    console.log('made it here');
    client.get("http://localhost:3001/api/news/update/" + session.dialogData.newsID, args,
        function (data, response) {
            if (data == "ERROR"){
                session.send("We couldn't find a news with the id "+ session.dialogData.newsID);
                session.endDialog();
                return;
            }
            // botbuilder.Prompts.text(session, JSON.stringify(data));    
            session.send(JSON.stringify(data));        
            session.endDialog();            
        });
}]);

dialog.onDefault(botbuilder.DialogAction.send('Wut? :thinking_face:'));

// Creating server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
    console.log('listening...');
});
server.post('/api/messages', connector.listen());