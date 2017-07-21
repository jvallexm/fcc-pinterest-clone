import React from 'react';

export default class ImageGrid extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      embiggened: -1,
      ticks: 0
    }
    this.embiggen = this.embiggen.bind(this);
    this.tick = this.tick.bind(this);
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
            showById={this.props.showById}/>
            
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
    this.doALike = this.doALike.bind(this);
    this.loadItUp = this.loadItUp.bind(this);
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
  render()
  {
    return(
      <div className="post-wrapper">
       <img src={this.props.post.link} 
            className={this.props.whichOne == this.props.thisOne ? "img-larg" : "img-smol"} 
            onClick={this.props.embiggen}
            onLoad={this.loadItUp}/>
       {/*this.props.children*/}
        <div className="text-left posted-by">
          <span onClick={()=>this.props.showById(this.props.post.author_id)}>Posted by {this.props.post.author}</span>
        </div>  
        <div className="text-center container-fluid pad-top">
          <div className={this.props.whichOne == this.props.thisOne ? "cursive wordwrap" :"cursive wordwrap max-250"}>
            {this.props.post.name}
          </div>
          <div className={this.props.whichOne == this.props.thisOne ? "tags wordwrap" :"tags wordwrap max-250"}>
             {this.props.post.tags.map((d,i)=>
             //change to replace all
               <span key={JSON.stringify(d)}
                     onClick={()=>this.props.showByTag(d)}>#{d.replace(/_/g," ")}{i<this.props.post.tags.length-1? " " : ""}</span>            
             )}
          </div> 
           <div className="row">
          <div className= {    this.props.post.reactions.indexOf(this.props.author_id)==-1 
                            && this.props.post.author_id != this.props.author_id 
                            ? "col-sm-6 heart" :
                          (this.props.post.reactions.indexOf(this.props.author_id)!=-1 
                          && this.props.post.author_id != this.props.author_id 
                          && this.props.post.reactions.length > 0)
                          || (this.props.post.author_id == this.props.author_id && this.props.post.reactions.length > 0) ? "col-sm-6 error" : "col-sm-6"}
                onClick={this.doALike}>          
                          {this.props.post.reactions.length>0 ? this.props.post.reactions.length + " " : ""}
                          <i className="fa fa-heart"/></div>
            { this.props.author_id!=this.props.post.author_id ?
            
              <div className="col-sm-6"><i className="fa fa-exchange" /></div>
 
            :
 
              <div className="col-sm-6"><i className="fa fa-gear" 
                       onClick={()=>this.props.grayOut(false,this.props.post)}/></div>
            
           }         
           </div>
         </div>  
      </div>  
    );
  }
}