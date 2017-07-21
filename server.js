var path = require('path');
var express = require('express');
var app = express(); 
var env = require('dotenv').config();
var Twitter = require("node-twitter-api");
var router = express.Router();
const server = app
  .use(express.static(__dirname))
  .listen(process.env.PORT, () => console.log(`Listening on ${ process.env.PORT }`));

app.set('socketio', io);

const io = require('socket.io')(server);

var currentUsers = [];

io.on('connection', (socket) => {
    
    console.log("new connection: " + socket.id);
    
    socket.on("get user data", (data)=>{
        console.log(data.results);
        socket.emit("send user data", {data: "ding"});
    }); 
   
//below from https://www.codementor.io/chrisharrington/how-to-implement-twitter-sign-expressjs-oauth-du107vbhy
    var twitter = new Twitter({
        consumerKey: process.env.CONSUMER_KEY,
    	consumerSecret: process.env.CONSUMER_SECRET,
    	callback: 'https://fcc-pinterest-clone-phoenixfarce.c9users.io/callback'
    });

    var _requestSecret;
    var _requestToken;
    var requestSocket = socket.id;
    var results;
    
    app.get("/request-token", function(req, res) {
            twitter.getRequestToken(function(err, requestToken, requestSecret) {
                if (err)
                  res.send(err);
                else {
                    _requestSecret = requestSecret;
                    _requestToken = requestToken;
                    res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
                }
            });
        });
//above from https://www.codementor.io/chrisharrington/how-to-implement-twitter-sign-expressjs-oauth-du107vbhy    

    app.get("/callback?",(req,res)=>{
            console.log(req.originalUrl);
            var split=req.originalUrl.split('?');
            var oauthStuff = split[1].split("&");
            var token = oauthStuff[0].split('=');
            var verifier = oauthStuff[1].split('=');
            twitter.getAccessToken(_requestToken, _requestSecret, verifier[1], function(error, accessToken, accessTokenSecret, results) {
            if (error) {
                console.log(error);
            } else {
             results = results;
             res.redirect('/loggedin:'+ requestSocket);
            }
        });
    });    

    app.get("/loggedin:socket", (req,res)=>
    {
      var thisSocket = req.params.socket.substr(1,req.params.socket.length-1);
      socket.emit("datas",{results: results});
      res.redirect('./close.html');
    });

});