import React from 'react';
import EditReaction from './EditReaction.js';
import ImageGrid from './ImageGrid.js';
import Search from './Search.js';
import FacebookLogin from 'react-facebook-login';
import io from 'socket.io-client';
const socket=io();
export default class App extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      images: [],
      grayOut: false,
      isNew: false,
      toEdit: undefined,
      loggedIn: false,
      userData: undefined,
      showSpecial: false,
      special_images: [],
      special: undefined,
      searchId: undefined,
      users: [],
      search: false
    };
    this.grayOut = this.grayOut.bind(this);
    this.closeOut = this.closeOut.bind(this);
    this.responseFacebook = this.responseFacebook.bind(this);
    this.showById = this.showById.bind(this);
    this.showAll = this.showAll.bind(this);
    this.showLiked = this.showLiked.bind(this);
    this.showByTag = this.showByTag.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.showByArray = this.showByArray.bind(this);
  }
  componentWillMount()
  {
    if(this.state.images.length<1)
    {
      socket.emit("needs posts");
      socket.emit("needs users");
    }
    socket.on("datas",(data)=>{
      //console.log(JSON.stringify(data));
      let newData={user_id: data.results.user_id, screen_name: data.results.screen_name};
      socket.emit("get user data", newData);
    });
    socket.on("send users",(data)=>{
      console.log("getting user data for " +data.users.length + " users");
      this.setState({users: data.users});
    });
    socket.on("push user",(data)=>{
      let oldUsers = this.state.users;
      oldUsers.push(data.user);
      this.setState({users: oldUsers});
    });
    socket.on("force post update",()=>{
      socket.emit("needs posts");
    });
    socket.on("send user data",(data)=>{
      //console.log("received user data: " + JSON.stringify(data.data));
      //console.log("screen_name: " + data.data.screen_name);
      let userData = data.data;
      this.setState({loggedIn: true, userData: userData});
    });
    socket.on("send posts",(data)=>{
      //console.log("got some posts: " + data.posts.length);
      let sortedPosts  = data.posts.sort((a,b)=>{
        if(a._id > b._id)
         return -1;
        else
         return 1;
      });
      let newImages = [];
      let idCheck = false;
      if(this.state.special == "id")
      {
        console.log("checking id");
        idCheck = true;
        for(var i=0;i<sortedPosts.length;i++)
        {
          if(sortedPosts[i].author_id == this.state.searchId || sortedPosts[i].reblogs.indexOf(this.state.searchId) > -1)
            newImages.push(sortedPosts[i]);
        }
      }
      if(this.state.special == "tag")
      {
        idCheck = true;
        //console.log("checking tags");
        for(var j=0;j<sortedPosts.length;j++)
        {
          if(sortedPosts[j].tags.indexOf(this.state.searchId) > -1)
           newImages.push(sortedPosts[j]);
        }
      }
      if(newImages.length == 0 && !idCheck)
        this.setState({images: sortedPosts});
      else
        this.setState({images: sortedPosts, special_images: newImages});
    });
    socket.on("post like",(data)=>{
      let images = this.state.images;
      //console.log("Who liked it: " + data.whoLikedIt);
      for(var i=0;i<images.length;i++)
      {
        if(images[i]._id == data._id)
          images[i].reactions.push(data.whoLikedIt);
      }
      this.setState({images: images});
    });
    socket.on("post dislike",(data)=>{
      let images = this.state.images;
      for(var i=0;i<images.length;i++)
      {
        if(images[i]._id == data._id)
        {
          let reactions = [];
          for(var j=0;j<images[i].reactions.length;j++)
          {
            if(images[i].reactions[j] != data.whoLikedIt)
              reactions.push(images[i].reactions[j]);
          }
          images[i].reactions = reactions;
        }
      }
      let newImages = [];
      let special_images = this.state.special_images;
      let likeCheck = false;
      if(this.state.special == "liked")
      {
        likeCheck = true;
        for(var m=0;m<special_images.length;m++)
        {
          if(special_images[m].reactions.indexOf(this.state.userData._id)!=-1)
          {
            newImages.push(images[m]);
          }
        }
      }
      if(newImages.length == 0 && !likeCheck)
        this.setState({images: images});
      else
        this.setState({images: images, special_images: newImages});
    });
    socket.on("post reblog",(data)=>{
      let images = this.state.images;
      //console.log("Who liked it: " + data.whoLikedIt);
      for(var i=0;i<images.length;i++)
      {
        if(images[i]._id == data._id)
          images[i].reblogs.push(data.whoLikedIt);
      }
      this.setState({images: images});
    });
    socket.on("post undo reblog",(data)=>{
      let images = this.state.images;
      for(var i=0;i<images.length;i++)
      {
        if(images[i]._id == data._id)
        {
          let reblogs = [];
          for(var j=0;j<images[i].reblogs.length;j++)
          {
            if(images[i].reblogs[j] != data.whoLikedIt)
              reblogs.push(images[i].reblogs[j]);
          }
          images[i].reblogs = reblogs;
        }
      }
      let newImages = [];
      let special_images = this.state.special_images;
      let reblogCheck = false;
      if(this.state.special == "id")
      {
        reblogCheck = true;
        for(var m=0;m<special_images.length;m++)
        {
          if(special_images[m].reblogs.indexOf(this.state.searchId) != -1 || special_images[m].author_id == this.state.searchId)
           newImages.push(special_images[m]);
        }
      }
      if(newImages.length == 0 && !reblogCheck)
        this.setState({images: images});
      else 
        this.setState({images: images, special_images: newImages});
    });
    socket.on("get updated post",(data)=>{
      let images = this.state.images;
      let special_images = this.state.special_images;
      for(var i=0;i<images.length;i++)
      {
        if(images[i]._id == data._id)
        {
          images[i].name = data.name;
          images[i].tags = data.tags;
          
        }
      }
      for(var j=0;j<special_images.length;j++)
      {
        if(special_images[j]._id == data._id)
        {
          special_images[j].name = data.name;
          special_images[j].tags = data.tags;
        }
      }
      this.setState({images: images, special_images: special_images, grayOut: false, isNew: false, toEdit: undefined});
    });
  }
  closeOut()
  {
    this.setState({grayOut: false, isNew: false, toEdit: undefined});
  }
  grayOut(isNew, obj)
  {
    //console.log("user data" + JSON.stringify(this.state.userData));
    this.setState({grayOut: true, isNew: isNew, toEdit: obj});
  }
  responseFacebook(response)
  {
    socket.emit("get user data",
                {user_id: response.userID,
                 screen_name: response.name  
                });
    this.setState({loggedIn: true});
  }
  showById(id)
  {
    let special_images = [];
    for(var i=0;i<this.state.images.length;i++)
    {
      if(this.state.images[i].author_id == id || this.state.images[i].reblogs.indexOf(id) > -1)
       special_images.push(this.state.images[i]);
    }
    window.scrollTo(0,0);
    this.setState({showSpecial: true, special_images: special_images, special: "id", searchId: id});
  }
  showLiked()
  {
    let special_images = [];
    for(var i=0;i<this.state.images.length;i++)
    {
      if(this.state.images[i].reactions.indexOf(this.state.userData._id) > -1)
       special_images.push(this.state.images[i]);
    }
    window.scrollTo(0,0);
    this.setState({showSpecial: true, special_images: special_images, special: "liked"});
  }
  showByTag(tag)
  {
    let special_images = [];
    for(var i=0;i<this.state.images.length;i++)
    {
      if(this.state.images[i].tags.indexOf(tag) > -1)
       special_images.push(this.state.images[i]);
    }
    window.scrollTo(0,0);
    this.setState({showSpecial: true, special_images: special_images, special: "tag", searchId: tag}); 
  }
  showByArray(arr,name)
  {
    window.scrollTo(0,0);
    this.setState({showSpecial: true, special_images: arr, special: "other", searchId: name}); 
  }
  showAll()
  {
    window.scrollTo(0,0);
    this.setState({showSpecial: false, special: undefined, searchId: undefined});
  }
  toggleSearch()
  {
    this.setState({search: !this.state.search});
  }
  render()
  {
    return(
     <div className="padding-10"> 
        {this.state.grayOut ? 
           <div id="gray-out">
            <div className="text-center container-fluid">
              <EditReaction isNew={this.state.isNew} 
                            toEdit={this.state.toEdit}
                            closeOut={this.closeOut}
                            socket={socket}
                            author={this.state.userData.screen_name}
                            author_id={this.state.userData._id}/>
             </div>  
           </div>: ""}

              {/*<img className="banner" onClick={()=>window.open("https://github.com/jvallexm")} src="https://camo.githubusercontent.com/567c3a48d796e2fc06ea80409cc9dd82bf714434/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f6461726b626c75655f3132313632312e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_darkblue_121621.png" />*/}

        <center>

          <div className="head padding-10 max-500"> 
            <h1>React-terest</h1>
            <h4>A 'Pinterest-Style' Board of Reactions</h4>
          </div>  
        </center>  

        <div className="text-center container-fluid">
          <div className="row">  
            <div className="col-md-2 middle-text cursive" id={"nav-bar"}>
            {this.state.loggedIn && this.state.userData != undefined ? <div>Welcome Back {this.state.userData.screen_name}!</div> : ""}
            {this.state.loggedIn && this.state.userData != undefined
            ? <button className="btn well"
                      onClick={()=>this.grayOut(true,undefined)}>
                <i className="fa fa-plus"/> Add a New Reaction
              </button>  
            : ""
            }
            <button className="btn well"
                    onClick={this.showAll}>Show All Reactions <i className="fa fa-flash"/></button>
            {this.state.loggedIn    
            ? <button className="btn well"
                      onClick={this.state.userData != undefined ? 
                        ()=>this.showById(this.state.userData._id) : "" }>My Reactions <i className="fa fa-user"/></button> 
                          
            : <button className="btn well"
                      onClick={()=>window.open('/request-token')}>
                Login With Twitter <i className="fa fa-twitter" />
              </button>
            }
            {!this.state.loggedIn
            ? <FacebookLogin 
              cssClass="btn well"
              appId='262280620921299'
              autoLoad={true}
              fields="name,picture"
              callback={this.responseFacebook}
              onClick={console.log("trying to login with facebook")}/>
            :""}
            
            {this.state.loggedIn ? 
            <button className="btn well"
                    onClick={this.showLiked}>Favorites <i className="fa fa-heart"/></button> : "" }
            <button className="btn well" onClick={this.toggleSearch}>Search <i className="fa fa-search"/></button>
            {
              this.state.search ?
              <Search images={this.state.images}
                      users={this.state.users} 
                      showByTag={this.showByTag}
                      showByArray={this.showByArray}
                      showById={this.showById}/>
              : ""        
            }
            <span className="tags">Made in 2017 by Jennifer Valle!</span>
            </div>  
            <div className="col-md-10">
              {this.state.images==[] ? <h1>Loading... <i className="fa fa-spinner fa-spin"/> </h1> : "" }
              <ImageGrid images={this.state.showSpecial ? this.state.special_images : this.state.images}
                         grayOut={this.grayOut}
                         author_id={this.state.userData!=undefined ? this.state.userData._id : "12"}
                         socket={socket}
                         showByTag={this.showByTag}
                         showById={this.showById}
                         users={this.state.users}/>
            </div>  
          </div>  
        </div>  
     </div> 
    );
  }  
}

