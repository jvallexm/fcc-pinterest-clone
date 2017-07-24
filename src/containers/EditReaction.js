import React from 'react';

export default class EditReaction extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      messages: [],
      url: "",
      tags: "",
      title: "",
      _id: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillMount()
  {
    if(this.props.toEdit!=undefined)
    {
      this.setState({title: this.props.toEdit.name,
                     url: this.props.toEdit.link,
                     tags: this.props.toEdit.tags.join(","),
                     _id: this.props.toEdit._id
      });
    }
  }
  handleChange(e)
  {
    if(e.target.name == "title")
    { 
      if(this.state.title.length>50)
      {
        this.setState({messages: "Titles can only be 50 characters."});
        return false;
      }  
      this.setState({title: e.target.value});
    }  
    if(e.target.name == "url")
    {  
      this.setState({url: e.target.value});
    }  
    if(e.target.name == "tags")
    {
      let tags = e.target.value.split(",");
      for(var k=0;k<tags.length;k++)
      {
        if(!/^[a-zA-Z0-9].*/.test(tags[k]) && tags[k].length> 1 )
        {
          this.setState({messages:["Tags must start with a letter"]});
          return false;
        }
        if(/[^a-zA-z0-9_-]/g.test(tags[k]))
        {
          this.setState({messages:["Sorry, letters, numbers, _'s , and -'s only!"]});
          return false;
        }
      }
      if(tags.length > 1)
      {
        for(var j=0;j<tags.length-1;j++)
        {
          if(tags[j].length < 3)
          {
            this.setState({messages: ["Tags must be at least 3 characters long"]});
            return false;
          } 
        }
      }
      if(tags.length > 3)
      {
        this.setState({messages: ["Sorry, you can only add 3 tags."]});
        return false;
      }  
      for(var i=0;i<tags.length;i++)
      {
        if(tags[i].length > 25)
        {
          this.setState({messages: ["Tags can't be more than 25 characters long"]});
          return false;
        }
      }  
      this.setState({tags: e.target.value, messages: []});
    }  
  }
  handleSubmit()
  {
    let newMessages = [];
      //expression from https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
   if(!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(this.state.url))
    newMessages.push("Please enter a valid URL");
   let splitTags = this.state.tags.split(",");
   if(splitTags[splitTags.length-1].length < 3 && this.state.tags.length > 0) 
     newMessages.push("Tags must be at least 3 characters long");
   if(this.state.title.length < 3)
     newMessages.push("Title must be at least 3 characters");
   if(newMessages.length>0)
     this.setState({messages: newMessages});
   else
   {
     if(this.props.isNew)
     {
       let today = new Date();
       let newPost = {
         _id: Math.floor(today.getTime()/1000),
         link: this.state.url,
         name: this.state.title,
         tags: this.state.tags.toLowerCase().split(","),
         author: this.props.author,
         reactions: [],
         author_id: this.props.author_id,
         reblogs: []
       };
       console.log("Sending new post: " + JSON.stringify(newPost));
       this.props.socket.emit("new post", {post: newPost, push_to: this.props.author_id});
       this.props.closeOut();
     }
     else
     {
       this.props.socket.emit("update post",{
         post_id: this.state._id,
         name: this.state.title,
         tags: this.state.tags.toLowerCase().split(",")
       });
       this.setState({messages: ["Updating..."]});
     }
   }   
  }
  render()
  {
    return(
      <div className="post-wrapper cursive text-center container-fluid" id={"edit"}>
        <div className="head padding-10">
        <h2>{this.props.toEdit == undefined ? "Add a New Reaction!" : "Edit Your Reaction!"}</h2></div>
       <div className="padding-10"> 
        <div className="padding-bottom">
          {this.state.messages.map((d,i)=>
             <div className="error" key={d}>{d}</div>                      
          )}
        </div> 
        <div className="row">
          <div className="col-sm-2">URL: </div>
          <div className="col-sm-10"><input disabled={this.props.toEdit!=undefined?"disabled":""}
                                            value={this.state.url}
                                            name={"url"}
                                            placeholder={"http://www.url.org/img.png"}
                                            onChange={this.handleChange}/>              </div>
        </div>
        <div className="row">
          <div className="col-sm-2">Title: </div>
          <div className="col-sm-10"><input value={this.state.title}
                                            name={"title"}
                                            placeholder={"My Awesome Image"}
                                            onChange={this.handleChange}/>              </div>
        </div>  
        <div className="row">
          <div className="col-sm-2">Tags:</div>
          <div className="col-sm-10"><input value={this.state.tags}
                                            name={"tags"}
                                            placeholder={"tags,separated,by_commas (optional)"}
                                            onChange={this.handleChange}/></div>
        </div> 
         </div>  
        <div>
            <button className="btn btn-regular"
                    onClick={this.handleSubmit}>Submit</button>
             <button className="btn btn-danger btn-regular"
                     onClick={this.props.closeOut}
                    >Cancel</button>
        </div>
      </div>);
  }  
}