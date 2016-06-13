var backendURL = "http://chrischia.info:3000/newsBing";

var dateCooked = function(pubDateStr){
  var pubDate = new Date(pubDateStr);
  var currentDate = new Date();
  var differenceDateMS = currentDate-pubDate;
  if(differenceDateMS < 3600000 ){   //less than an hour
    return Math.round(differenceDateMS/60000) + " minutes ago";
  }else if(differenceDateMS < 86400000 ){   //less than a day
    return Math.round(differenceDateMS/3600000) + " hours ago";
  }else if(differenceDateMS < 604800000){   //less than a week
    return Math.round(differenceDateMS/86400000) + " days ago";
  }else{
    return pubDate.toLocaleDateString();
  }
}

var TableBox = React.createClass({
  getInitialState: function() {
    return {data:undefined};
  },
  componentDidMount: function() {
    this.serverRequest = $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: true,
      timeout: 5000,
      success: function(data) {
        var news = data[0];
        this.setState({data:news});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentWillUnmount: function() {
    this.serverRequest.abort();
  },
  render: function() {
    if(this.state.data==undefined){
      return (
        <div>
          <div id="newsBg"></div>
        </div>
      );
    }else{
      var imageUrl = this.state.data.image;
      var newsBgStyle = {
        background: 'url("'+imageUrl+'")'
      };
      return (
        <div>
          <div id="newsBg" style={newsBgStyle}></div>
          <div id="blackOverlay"></div>
          <NewsBox data={this.state.data} />
        </div>
      );
    }
  }
});

var NewsBox = React.createClass({
  getInitialState: function() {
    return {date:dateCooked(this.props.data.pubDate)};
  },
  render: function() {
    return (
      <div id="newsFg">
        <table id="news">
          <tbody>
            <tr>
              <td id="logoRow">
                <img src="images/logoTfMed.png"/>
              </td>
            </tr>
            <tr id="newsSection">
              <td id="newsRow">
                <div>
                  <span id="newsTitle">
                    {this.props.data.title}
                  </span>
                  <br/>
                  <span id="newsSrc">
                    {this.props.data.newsSrc}
                  </span>
                  <span id="newsDate" > - {this.state.date}
                  </span>
                  <br/>
                  <span id="newsBody">
                    {this.props.data.description}
                  </span>
                  <br/>
                  <span id="apiProvider"><img src="images/brandBing.png"/></span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
});

ReactDOM.render(
  <TableBox url={backendURL}/>,
  document.getElementById('content')
);
