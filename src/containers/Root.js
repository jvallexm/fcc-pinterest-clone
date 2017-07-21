import React from 'react';
import EditReaction from './EditReaction.js';
import ImageGrid from './ImageGrid.js';
import io from 'socket.io-client';
const socket=io();
export default class App extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      images: [
{link: "http://s2.quickmeme.com/img/ab/ab173014ae70275ae3c255fbdf4bda6d1aef488183fd62f6add879451773be41.jpg", name: "Scruffy Second", reactions: [],tags:["futurama","second","ironically_first"]},{link: "http://s2.quickmeme.com/img/ab/ab173014ae70275ae3c255fbdf4bda6d1aef488183fd62f6add879451773be41.jpg", name: "Scruffy Second", reactions: [],tags:["futurama","second","ironically_first"]},{link: "http://s2.quickmeme.com/img/ab/ab173014ae70275ae3c255fbdf4bda6d1aef488183fd62f6add879451773be41.jpg", name: "Scruffy Second", reactions: [],tags:["futurama","second","ironically_first"]},{link: "http://s2.quickmeme.com/img/ab/ab173014ae70275ae3c255fbdf4bda6d1aef488183fd62f6add879451773be41.jpg", name: "Scruffy Second", reactions: [],tags:["futurama","second","ironically_first"]},
{link: "https://media.tenor.com/images/1e88d8430b51b56de7c910f7aa2ce212/tenor.gif", name: "Boo, you whore!", reactions: [],tags:["boo","mean_girls","regina_george"]},
{link: "https://i.ytimg.com/vi/BlqvscF99_Y/maxresdefault.jpg", name: "[Screaming Internally]", reactions: [], tags:["screaming","muppets","kermit"]},
{link: "http://68.media.tumblr.com/263db78aa4ceb54584d3d54cd2fb5f52/tumblr_osnfs25eOC1qgxab9o1_1280.png", name: "Wolverine", reactions: [],tags:["yay","x-men"]},
{link: "http://68.media.tumblr.com/c14971de151e3dc8c08468e3d157cad2/tumblr_opfv8wAzl01qgxab9o10_400.png", name: "I can't even", reactions: [],tags:["kitty_pryde","x-men"]},
{link: "http://68.media.tumblr.com/97665feefb37e2ca245cc924e5f10429/tumblr_opfv8wAzl01qgxab9o7_1280.jpg", name: "Magnets, how do they work?", reactions: [],tags:["magnets","x-men"]}],
      images2: [],
      count: 0,
      grayOut: false,
      isNew: false,
      toEdit: undefined,
      loggedIn: false,
      userData: undefined
    }
    this.grayOut = this.grayOut.bind(this);
    this.closeOut = this.closeOut.bind(this);
  }
  componentWillMount()
  {
    socket.on("datas",(data)=>{
      socket.emit("get user data", data);
    });
    socket.on("send user data",(data)=>{
      this.setState({loggedIn: true});
    });
  }
  closeOut()
  {
    this.setState({grayOut: false, isNew: false, toEdit: undefined});
  }
  grayOut(isNew, obj)
  {
    this.setState({grayOut: true, isNew: isNew, toEdit: obj});
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
                            closeOut={this.closeOut}/>
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
            <div className="col-md-2 middle-text cursive text-right" id={"nav-bar"}>
            {this.state.loggedIn
            ? <button className="btn well"
                      onClick={()=>this.grayOut(false,undefined)}>
                <i className="fa fa-plus"/> Add a New Reaction
              </button>  
            : ""
            }
            {this.state.loggedIn    
            ? <button className="btn well">My Reactions <i className="fa fa-user"/></button> 
                          
            : <button className="btn well"
                      onClick={()=>window.open('/request-token')}>
                Login With Twitter <i className="fa fa-twitter" />
              </button>
            }  
              <button className="btn well">What's New? <i className="fa fa-flash"/></button>
              <button className="btn well">Favorites <i className="fa fa-heart"/></button>
              <button className="btn well">Search <i className="fa fa-search"/></button>
            </div>  
            <div className="col-md-10">
              <ImageGrid images={this.state.images}
                         grayOut={this.grayOut}/>
            </div>  
          </div>  
        </div>  
     </div> 
    )
  }  
}

