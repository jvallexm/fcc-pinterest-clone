import React from 'react';

export default class Search extends React.Component{
    constructor(props)
    {
        super(props);
        this.state = {
            search: "",
            searchType: null,
            message: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(e)
    {
        if(e.target.name == "type")
            this.setState({searchType: e.target.value, search: "", message: ""});
        else    
        {
          if(this.state.searchType=="tag")
          {
             if(!/^[a-zA-Z0-9].*/.test(e.target.value) && e.target.value.length > 0)
             {
                 this.setState({message: "Sorry, tags must start with a letter."});
                 return false;
             }
             if(/[^a-zA-z0-9_-]/g.test(e.target.value))
                {
              this.setState({message: "Sorry, letters, numbers, _'s , and -'s only!"});
              return false;
            }
            if(e.target.value.length > 25)
            {
                this.setState({message: "Sorry, tags can only be 25 characters long"});
                return false;            }
                                            
          }
          this.setState({search: e.target.value, message: ""});
        }    
    }
    handleSubmit()
    {
        if(this.state.searchType == "-" || this.state.searchType==null)
            return false;
        if(this.state.search < 3)
        {
            this.setState({message: "Searches must be at least 3 characters long"});
            return false;
        }
        let results=[];
        if(this.state.searchType!="user")
        {
            for(var i=0;i<this.props.images.length;i++)
            {
                if(this.state.searchType=="tag" && this.props.images[i].tags.indexOf(this.state.search.toLowerCase()) > -1)
                  results.push(this.state.search.toLowerCase());
                else if(this.props.images[i].name.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1)
                  results.push(this.props.images[i]);
            }
        }
        else
        {
            for(var j=0;j<this.props.users.length;j++)
            {
                //console.log(this.props.users[j].screen_name);
                if(this.props.users[j].screen_name.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1)
                  results.push(this.props.users[j]._id);
            }
        }
        if(results.length > 0)
        {
            if(this.state.searchType == "tag")
                this.props.showByTag(this.state.search.toLowerCase());
            if(this.state.searchType == "title") 
                this.props.showByArray(results,this.state.search);
            if(this.state.searchType == "user")
                this.props.showById(results[0]);
        }
        else
           this.setState({message: "Sorry, couldn't find that one!"});
    }
    render()
    {
        return(
          <div className="post-wrapper">
              Search By..
              <div>
              <select name="type" onChange={this.handleChange}>
                <option value={null}> - </option>
                <option value={"tag"}>Tag</option>
                <option value={"title"}>Title</option>
                <option value={"user"}>User Name</option>
              </select>
              </div>
              <div className="error wordwrap">{this.state.message}</div>
              {this.state.searchType!=null && this.state.searchType!="-" ? "Search" : "" }
              {this.state.searchType!=null && this.state.searchType!="-"? <input name="search" value={this.state.search} onChange={this.handleChange}/> : ""}
              <button className="btn well" onClick={this.handleSubmit}>Submit</button>
            </div>   
        );
    }
    
}