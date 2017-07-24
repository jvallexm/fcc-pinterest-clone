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

const io = require('socket.io')(server);

app.set('socketio', io);

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
    
    socket.on("needs users", ()=>{
         console.log("Gettings users..");
       MongoClient.connect(url, (err,db)=>{
          if(err)
           console.log(err);
          else
          {
             var posts = db.collection('users');
             var getAll = ()=>{
               posts.find({},{})
                    .toArray((err,data)=>{
                        if(err)
                         console.log(err);
                        else
                        { 
                          console.log("Sending " + data.length + " users");
                          socket.emit("send users", {users: data});
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
                      io.sockets.emit("push users",{user: newUser})
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
      console.log("doing a like");
      socket.emit("post like", {
         _id: data._id,
         whoLikedIt: data.whoLikedIt
      }); 
      MongoClient.connect(url,(err,db)=>{
        if(err)
         console.log(err);
        else
        {
           console.log("posting a like to database");
           var posts = db.collection('posts');
           var doLike = ()=>{
               posts.update({_id: data._id},{$push: {reactions: data.whoLikedIt}});
           }
           doLike(db,()=>{db.close();});
        }
      });
   });
   
   socket.on("do a dislike",(data)=>{
      console.log("doing a dislike");
      socket.emit("post dislike", {
         _id: data._id,
         whoLikedIt: data.whoLikedIt
      }); 
      MongoClient.connect(url,(err,db)=>{
        if(err)
         console.log(err);
        else
        {
           var posts = db.collection('posts');
           var doLike = ()=>{
               posts.update({_id: data._id},{$pull: {reactions: data.whoLikedIt}});
           }
           doLike(db,()=>{db.close();});
        }
      });
   });
   
   socket.on("delete one",(data)=>{
      console.log("Deleting a post");
            MongoClient.connect(url,(err,db)=>{
        if(err)
         console.log(err);
        else
        {
           var posts = db.collection('posts');
           var doDelete = ()=>{
               posts.remove({_id: data._id});
               io.sockets.emit("force post update",{force: "post"});
           }
           doDelete(db,()=>{db.close();});
        }
      });
   });
   
   socket.on("do a reblog",(data)=>{
      console.log("doing a reblog");
      io.sockets.emit("post reblog", {
         _id: data._id,
         whoLikedIt: data.whoLikedIt
      }); 
      MongoClient.connect(url,(err,db)=>{
        if(err)
         console.log(err);
        else
        {
           console.log("posting a reblog to database");
           var posts = db.collection('posts');
           var doLike = ()=>{
               posts.update({_id: data._id},{$push: {reblogs: data.whoLikedIt}});
           };
           doLike(db,()=>{db.close();});
        }
      });
   });
   
   socket.on("undo a reblog",(data)=>{
      console.log("undoing a reblog");
      io.sockets.emit("post undo reblog", {
         _id: data._id,
         whoLikedIt: data.whoLikedIt
      }); 
      MongoClient.connect(url,(err,db)=>{
        if(err)
         console.log(err);
        else
        {
           console.log("pulling a reblog to database");
           var posts = db.collection('posts');
           var doLike = ()=>{
               posts.update({_id: data._id},{$pull: {reblogs: data.whoLikedIt}});
           };
           doLike(db,()=>{db.close();});
        }
      });
   });   
   
   socket.on("update post",(data)=>{
       console.log("updating a post");
       io.sockets.emit("get updated post",{
          _id: data.post_id,
          name: data.name,
          tags: data.tags
       });
       MongoClient.connect(url,(err,db)=>{
          if(err)
           console.log("err");
          else
          {
              console.log("updating a post to database");
              var posts = db.collection("posts");
              var doUpdate = ()=>{
                  posts.update({_id: data.post_id},{
                      $set: {
                         name: data.name,
                         tags: data.tags
                      }
                  });
              };
              doUpdate(db,()=>{db.close();});
          }
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
      //var thisSocket = req.params.socket.substr(1,req.params.socket.length-1);
      socket.emit("datas",{results: theseResults});
      res.redirect('./close.html');
    });

    
});