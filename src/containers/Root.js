import React from 'react';
import EditReaction from './EditReaction.js';
import ImageGrid from './ImageGrid.js';
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
      special_images: []
    };
    this.grayOut = this.grayOut.bind(this);
    this.closeOut = this.closeOut.bind(this);
    this.responseFacebook = this.responseFacebook.bind(this);
    this.showById = this.showById.bind(this);
    this.showAll = this.showAll.bind(this);
  }
  componentWillMount()
  {
    if(this.state.images.length<1)
    {
      socket.emit("needs posts");
    }
    socket.on("datas",(data)=>{
      //console.log(JSON.stringify(data));
      let newData={user_id: data.results.user_id, screen_name: data.results.screen_name};
      socket.emit("get user data", newData);
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
      console.log("got some posts: " + data.posts.length);
      let sortedPosts  = data.posts.sort((a,b)=>{
        if(a._id > b._id)
         return -1;
        else
         return 1;
      });
      this.setState({images: sortedPosts});
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
      if(this.state.images[i].author_id == id)
       special_images.push(this.state.images[i]);
    }
    this.setState({showSpecial: true, special_images: special_images});
  }
  showAll()
  {
    this.setState({showSpecial: false});
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
           
        <center>
          <div className="head padding-10 max-500"> 
            <h1>React Board</h1>
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
            <button className="btn well"
                    onClick={this.showAll}>What's New? <i className="fa fa-flash"/></button>
            {this.state.loggedIn ? 
            <button className="btn well">Favorites <i className="fa fa-heart"/></button> : "" }
              <button className="btn well">Search <i className="fa fa-search"/></button>
            </div>  
            <div className="col-md-10">
              <ImageGrid images={this.state.showSpecial ? this.state.special_images : this.state.images}
                         grayOut={this.grayOut}
                         author_id={this.state.userData!=undefined ? this.state.userData._id : "12"}/>
            </div>  
          </div>  
        </div>  
     </div> 
    )
  }  
}

