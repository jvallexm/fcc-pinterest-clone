import React from 'react';

export default class ImageGrid extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      embiggened: -1
    }
    this.embiggen = this.embiggen.bind(this);
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
  }

  render()
  {
    return(
      <div ref="grid" className="board">
        {this.props.images.map((d,i)=>
          <WrappedImage post={d}
            className={this.state.embiggened==i ? "front" : ""} 
            grayOut={this.props.grayOut}>
            <img className={this.state.embiggened==i ? "img-larg" : "img-smol"}
                 onClick={()=>this.embiggen(i)}
                 src={d.link}
                 />
          </WrappedImage>                       
        )}
      </div>
    )
  }
}

class WrappedImage extends React.Component
{
  constructor(props)
  {
    super(props);
  }
  render()
  {
    return(
      <div className="post-wrapper">
       {this.props.children}
        <div className="text-left posted-by">
        Posted by Whoever
        </div>  
        <div className="text-center container-fluid">
          <div className="pad-top cursive wordwrap">
            {this.props.post.name}
          </div>
          <div className="tags wordwrap">
             {this.props.post.tags.map((d,i)=>
               <span>#{d.replace("_"," ")}{i<this.props.post.tags.length-1? " " : ""}</span>            
             )}
          </div> 
          <div className="row">
            <div className="col-sm-4"><i className="fa fa-heart"/></div>
            <div className="col-sm-4"><i className="fa fa-exchange" /></div>
            <div className="col-sm-4"><i className="fa fa-gear" 
                     onClick={()=>this.props.grayOut(true,this.props.post)}                    /></div>
          </div>
        </div>  
      </div>  
    );
  }
}