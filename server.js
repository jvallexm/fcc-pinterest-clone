var path = require('path');
var express = require('express');
var app = express(); 
var env = require('dotenv').config();
var Twitter = require("node-twitter-api");
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

const server = app
  .use(express.static(__dirname))
  .listen(process.env.PORT, () => console.log(`Listening on ${ process.env.PORT }`));
var url = process.env.MONGO_URL;

app.set('socketio', io);

const io = require('socket.io')(server);

var currentUsers = [];

io.on('connection', (socket) => {
    
    console.log("new connection: " + socket.id);
    
    socket.on("needs posts", ()=>{
       console.log("Gettings posts..");
       MongoClient.connect(url, (err,db)=>{
          if(err)
           console.log(err);
          else
          {
             var posts = db.collection('posts');
             var getAll = ()=>{
               posts.find({},{})
                    .toArray((err,data)=>{
                        if(err)
                         console.log(err);
                        else
                        { 
                          console.log("Sending " + data.length + " posts");
                          socket.emit("send posts", {posts: data});
                          db.close();
                        }  
                    });
             };
             getAll(db);
          }
       });
    });
    
    socket.on("get user data", (data)=>{
        console.log("getting user data");
        MongoClient.connect(url,(err,db)=>{
           if(err)
            console.log(err);
           var users = db.collection('users'); 
           var getUser = ()=>{
              console.log("trying to find users"); 
              users.findOne({_id: data.user_id},(err,result)=>{
                  if(err)
                    throw err;
                  console.log("connected to database");    
                  if(result)
                  {
                      console.log("found");
                      socket.emit("send user data", {data: result});
                  }
                  else
                  {
                      var newUser = {
                        _id: data.user_id,
                        screen_name: data.screen_name,
                        posts: [],
                        likes: []
                      };
                      socket.emit("send user data", {data: newUser});
                      users.insert(newUser);
                  }
              })
           };
           getUser(db,()=>{db.close();});
        });
    }); 
   
   socket.on("new post",(data)=>{
      console.log("New post: " + JSON.stringify(data.post));
      console.log("Posted by: " + data.push_to);
      MongoClient.connect(url, (err,db)=>{
         if(err)
          console.log(err)
         else
         {
            var posts = db.collection('posts'); 
            var users = db.collection('users');
            var postOne = ()=>{
                posts.insert(data.post);
                pushTo();
            };
            var pushTo = ()=>
            {
               users.update({_id: data.push_to},{$push: {posts: data.post._id}});
               io.sockets.emit("force post update", {force: "posts"});
               db.close();
            }
            postOne(db);
         }
      });
   });
   
   socket.on("do a like",(data)=>{
      socket.emit("post like", {
         _id: data._id,
         whoLikedIt: data.whoLikedIt
      }); 
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
    var theseResults;
    
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
            console.log("callback from twitter...");
            var split=req.originalUrl.split('?');
            var oauthStuff = split[1].split("&");
            var token = oauthStuff[0].split('=');
            var verifier = oauthStuff[1].split('=');
            twitter.getAccessToken(_requestToken, _requestSecret, verifier[1], function(error, accessToken, accessTokenSecret, results) {
            if (error) {
                console.log(error);
            } else {
             theseResults = results;
             res.redirect('/loggedin:'+ requestSocket);
            }
        });
    });    

    app.get("/loggedin:socket", (req,res)=>
    {
      console.log("logged in redirecting");
      var thisSocket = req.params.socket.substr(1,req.params.socket.length-1);
      socket.emit("datas",{results: theseResults});
      res.redirect('./close.html');
    });

});