import React from 'react';

export default class ImageGrid extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      embiggened: -1,
      ticks: 0,
      whichComments: -1
    };
    this.embiggen = this.embiggen.bind(this);
    this.tick = this.tick.bind(this);
    this.commentsShown = this.commentsShown.bind(this);
  }
  commentsShown(num)
  {
    this.setState({whichComments: num});
  }
  tick()
  {
    let newTicks = this.state.ticks + 1;
    this.setState({ticks: newTicks});
  }
  embiggen(num)
  {
    if(this.state.embiggened != num)
      this.setState({embiggened: num});
    else
      this.setState({embiggened: -1});
  }
  //below from https://codepen.io/Shorina/pen/ggYvPL
  componentDidMount()
  {    
    var grid=this.refs.grid;
    this.masonry = new Masonry(grid,{
      itemSelector: '.post-wrapper',
      columnWidth: 3
    });
    this.masonry.reloadItems();
    this.masonry.layout();
  }
  componentDidUpdate(prevProps)
  {
     if(this.props.images.length != prevProps.images.length){
      this.masonry.reloadItems();
      this.masonry.layout();
      this.setState({embiggened: -1});
    }
  //above from https://codepen.io/Shorina/pen/ggYvPL    
    if(this.state.embiggened != prevProps.embiggened)
    {
      this.masonry.reloadItems();
      this.masonry.layout();
    }
    if(this.state.ticks == this.props.images.length & this.state.ticks > prevProps.ticks )
      console.log("they all loaded!");
  }

  render()
  {
    return(
      <div ref="grid" className="board">
        {
        this.props.images.map((d,i)=>
        
          <WrappedImage key={JSON.stringify(d)} post={d} author_id={this.props.author_id} socket={this.props.socket}
            className={this.state.embiggened==i ? "front" : ""} 
            grayOut={this.props.grayOut}
            embiggen={()=>this.embiggen(i)}
            thisOne = {i}
            whichOne = {this.state.embiggened}
            tick={this.tick}
            showByTag={this.props.showByTag} 
            showById={this.props.showById}
            users={this.props.users}
            commenting={this.state.whichComments}
            showComments={()=>this.commentsShown(i)}/>
            
        )}
      </div>
    );
  }
}

class WrappedImage extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      options: false,
      delete: false,
      deleting: false,
      error: false,
      showComments: false,
    };
    this.doALike = this.doALike.bind(this);
    this.loadItUp = this.loadItUp.bind(this);
    this.showOptions = this.showOptions.bind(this);
    this.showDelete = this.showDelete.bind(this);
    this.deleteOne = this.deleteOne.bind(this);
    this.doAReblog = this.doAReblog.bind(this);
    this.sendError = this.sendError.bind(this);
    this.showComments = this.showComments.bind(this);
  }
  componentWillUpdate(prevProps)
  {
    if(this.props.whichOne != prevProps.whichOne)
    {
      this.setState({delete: false, deleting: false, showComments: false});
    }
    if(this.props.commenting != prevProps.commenting && prevProps.commenting != this.props.thisOne)
    {
      this.setState({delete: false, deleting: false, showComments: false});
      this.loadItUp();
    }
  }
  deleteOne(obj)
  {
    console.log("Deleting: " + JSON.stringify(obj));
    this.props.socket.emit("delete one", {_id: obj._id});
    this.setState({deleting: true});
  }
  showComments()
  {
    this.setState({showComments: !this.state.showComments});
    this.loadItUp();
    this.props.showComments();
  }
  sendError()
  {
    console.log("trying to make error");
    this.setState({error: true});
  }
  showDelete()
  {
    this.setState({delete: !this.state.delete, showComments: false}); 
  }
  showOptions()
  {
    let check = false;
    if(this.state.showComments==true)
      check = true;
    this.setState({options: !this.state.options, showComments: false});
    if(check)
      this.loadItUp();
  }
  loadItUp()
  {
    this.props.tick();
  }
  doALike()
  {
    if(this.props.post.author_id == this.props.author_id)
      return false;
    if(this.props.author_id == "12")
      return false;
    if(this.props.post.reactions.indexOf(this.props.author_id)==-1)
      this.props.socket.emit("do a like",{
         _id: this.props.post._id,
         whoLikedIt: this.props.author_id
      });
    else
      this.props.socket.emit("do a dislike",{
         _id: this.props.post._id,
         whoLikedIt: this.props.author_id
      });
  }
  doAReblog()
  {
    if(this.props.author_id == "12")
      return false;
    if(this.props.author_id == this.props.post.author_id)  
      return false;
    if(this.props.post.reblogs.indexOf(this.props.author_id)==-1)
      this.props.socket.emit("do a reblog",{
         _id: this.props.post._id,
         whoLikedIt: this.props.author_id
      });
    else
      this.props.socket.emit("undo a reblog",{
         _id: this.props.post._id,
         whoLikedIt: this.props.author_id
      });
  }
  render()
  {
    return(
      <div className={this.props.whichOne == this.props.thisOne ? "post-wrapper" : "post-wrapper max-250"}>
       <img src={this.state.error ? "https://hlfppt.org/wp-content/uploads/2017/04/placeholder.png" : this.props.post.link} 
            className={this.props.whichOne == this.props.thisOne ? "img-larg" : "img-smol"} 
            onClick={this.props.embiggen}
            onError={this.sendError}
            onLoad={this.loadItUp}/>
       {/*this.props.children*/}
        <div className="text-left posted-by">
          <span onClick={()=>this.props.showById(this.props.post.author_id)}>Posted by {this.props.post.author}</span>
        </div>  
        <div className="text-center container-fluid pad-top">
          <div className={!this.state.error ? "cursive wordwrap" : "error cursive wordwrap"}>
            {!this.state.error ? this.props.post.name : "Sorry, looks like this link is broken :("}
          </div>
          <div className={this.props.whichOne == this.props.thisOne ? "tags wordwrap" :"tags wordwrap"}>
             <i className="fa fa-tags" /> {this.props.post.tags.map((d,i)=>
             //change to replace all
               <span key={JSON.stringify(d)}
                     onClick={()=>this.props.showByTag(d)}>
                     #{d.replace(/_/g," ")}{i<this.props.post.tags.length-1? " " : ""}
               </span>            
             )}
          </div>
          {!this.state.options && !this.state.delete ?
          <div className="row">
              <div className={this.props.post.author_id==this.props.author_id ? "col-sm-3" : "col-sm-4"}>
                  <span className={      this.props.post.reactions.indexOf(this.props.author_id)==-1 
                                      && this.props.post.author_id != this.props.author_id 
                                       ? "heart" 
                                         : (  this.props.post.reactions.indexOf(this.props.author_id)!=-1
                                           && this.props.post.author_id != this.props.author_id 
                                           && this.props.post.reactions.length > 0)
                                       ||  (this.props.post.author_id == this.props.author_id && this.props.post.reactions.length > 0)
                                       ? "error"
                                       : ""}>
                      {this.props.post.reactions.length>0 ? this.props.post.reactions.length + " " : ""}<i className="fa fa-heart"/>
                  </span> 
              </div>
              <div className={this.props.post.author_id==this.props.author_id ? "col-sm-3" : "col-sm-4"}>
                 <span className={      this.props.post.reblogs.indexOf(this.props.author_id)==-1 
                                      && this.props.post.author_id != this.props.author_id 
                                       ? "reblog" 
                                         : (  this.props.post.reblogs.indexOf(this.props.author_id)!=-1
                                           && this.props.post.author_id != this.props.author_id 
                                           && this.props.post.reblogs.length > 0)
                                       ||  (this.props.post.author_id == this.props.author_id && this.props.post.reblogs.length > 0)
                                       ? "reblogged"
                                       : ""}>
                      {this.props.post.reblogs.length>0 ? this.props.post.reblogs.length + " " : ""}<i className="fa fa-exchange"
                                                                                                       onClick={this.doAReblog}/>
                  </span>
              </div>
              <div className={this.props.post.author_id==this.props.author_id ? "col-sm-3" : "col-sm-4"}>
                  <i className={this.state.showComments ? "fa fa-comments com-show": "fa fa-comments com-hov"}
                     onClick={this.showComments}/>
              </div>
              {this.props.post.author_id==this.props.author_id ?
              <div className="col-sm-3">
                  <i className="fa fa-gear" 
                     onClick={this.showOptions}/>
              </div> : ""}
          </div>
          
          
           : !this.state.delete   
           ?  <div className = "row">
             <div className="col-sm-4" onClick={this.showOptions}><i className="fa fa-arrow-left"/> Back</div>
             <div className="col-sm-4"><span onClick={()=>this.props.grayOut(false,this.props.post)}>
                 Edit <i className="fa fa-gears"/></span></div>
             <div className="col-sm-4 error"> <i className="fa fa-trash" 
                                                onClick={this.showDelete}/> </div>     
           
           </div>
           :!this.state.deleting ? <div className = "row">
           
               <div className="col-sm-4" onClick={this.showDelete} ><i className="fa fa-arrow-left"/> Back</div>
               <div className="col-sm-8 error bold" onClick={()=>this.deleteOne(this.props.post)}>Yes, Delete Forever</div>
               
             </div>
            
          : <div className="row">
               <div className="col-sm-12">
                  Goodbye! We'll Miss You! <i className="fa fa-spinner fa-spin" /> </div>
            </div>}
         </div>
         {this.state.showComments ?
         <div className="comments text-left padding-10">
           {   this.props.post.reactions.length == 0 && this.props.post.reblogs == 0
             ? "No reactions yet!"
             : <span>
                 {this.props.post.reactions.map((d,i)=>
                   this.props.users.map((u,ii) => 
                      u._id == d ? <div><i className="fa fa-heart error" /> {u.screen_name}</div> : ""
                   )
                 )}
                {this.props.post.reblogs.map((d,i)=>
                   this.props.users.map((u,ii) => 
                      u._id == d ? <div><i className="fa fa-exchange reblogged" /> {u.screen_name}</div> : ""
                   )
                 )}
               </span> 
               
           }
         </div> : ""}
      </div>  
    );
  }
}