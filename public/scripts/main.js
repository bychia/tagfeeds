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
var localStorage = window.localStorage;
var isOutdated = function(currentTimestamp){
  if(typeof(localStorage)!=="undefined"){
    alert("localstorage is present");
    var tfLastSaved = localStorage.getItem("tfLastSaved");
    if(tfLastSaved!=null){
      alert("tfLastSaved is present: Required updated?:" + (((currentTimestamp-tfLastSaved)/3600000)>1));
      return (((currentTimestamp-tfLastSaved)/3600000)>1); // is outdated after an hour
    }
    alert("tfLastSaved is absent");
  }
  alert("localstorage is absent");
  return true;
}
var preloadImage = function(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
    });
}
var backendURL = "http://chrischia.info:3000/newsBing";
var TableBox = React.createClass({
  getInitialState: function() {
    return {data:undefined};
  },
  fetchNewsFeeds: function(){
    this.serverRequest = $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: true,
      timeout: 5000,
      success: function(data) {
        alert("success");
        if(typeof(localStorage)!=="undefined"){
          alert("success: localStorage present");
          localStorage.setItem("tfData", JSON.stringify(data));
          localStorage.setItem("tfLastSaved", new Date().getTime());
        }
        this.setState({data:data});
      }.bind(this),
      error: function(xhr, status, err) {
        alert(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    var currentTimestamp = new Date().getTime();
    if(isOutdated(currentTimestamp)){
      alert(1);
      this.fetchNewsFeeds();
    }else{
      alert(2);
      var tfData = localStorage.getItem("tfData");
      if(tfData!=null){
        this.setState({data:JSON.parse(tfData)});
      }
    }
  },
  componentWillUnmount: function() {
    this.serverRequest.abort();
  },
  getNewsBoxData: function(){
    this.refs.newsBox.getData();
  },
  render: function() {
    if(this.state.data==undefined){
      return (
        <div>
        </div>
      );
    }else{
      return (
        <div>
          <div id="carousel-example-generic" className="carousel slide" data-ride="carousel"  data-interval="false">
            <ol className='carousel-indicators'>
              {
                this.state.data.map(function(news, index) {
                  var handleUpdate = this.getNewsBoxData.bind(this, index);
                  var carouselIndicatorsClassName = (index==0)? "active":" ";
                  var carouselIndicatorsKeyId = "carouselIndicatorsKeyId"+index;
                    return <li data-target="#carousel-example-generic" onClick={handleUpdate} data-slide-to={index} className={carouselIndicatorsClassName} key={carouselIndicatorsKeyId}/>
                },this)
              }
            </ol>
            <div className="carousel-inner" role="listbox">
              {
                this.state.data.map(function(news, index){
                  var carouselInnerDivClassName = (index==0)? "item active":"item";
                  var parentDivId = "carouselInnerParentDivId"+index;
                  var imageId = "carouselInnerImageId"+index;
                  var divId = "carouselInnerDivId"+index;
                  var newsBgId = "carouselInnerNewsBg"+index;
                  var blackOverlayId = "carouselInnerBlackOverlay"+index;
                  var newsBgStyle = {
                    background: 'url("'+this.state.data[index].image+'")'
                  };

                  return(<div className={carouselInnerDivClassName} key={parentDivId}>
                    <img src="images/spacer.png" height="100%" width="100%" key={imageId}/>
                    <div key={divId}>
                      <div id="newsBg" style={newsBgStyle} key={newsBgId}/>
                      <div id="blackOverlay" key={blackOverlayId}/>
                    </div>
                  </div>);
                },this)
              }
            </div>
          </div>
          <NewsBox ref="newsBox" data={this.state.data} />
        </div>
      )
    }
  }
});

var NewsBox = React.createClass({
  preloadData: function(items, index){
    var imageCount = items.length;
    if(imageCount>1){
      var previousIndex = (index-1<0)? imageCount-1: index-1;
      var previousImage = items[previousIndex].image;
      var nextIndex = (index+1 >= imageCount)? 0: index+1;
      var nextImage = items[nextIndex].image;
      preloadImage([previousImage, nextImage]);
    }
  },
  getData : function(){
    var nextIndex = $('.carousel').find(".active").index();
    this.preloadData(this.props.data, nextIndex);
    this.setState({index:nextIndex, currentData:this.props.data[nextIndex]});
  },
  getInitialState: function() {
    this.preloadData(this.props.data, 0);
    return {index:0, currentData:this.props.data[0]};
  },
  render: function() {
    return (
      <div>
      <div id="newsFg">
        <table id="news">
          <colgroup>
            <col className="table-col"/>
            <col/>
            <col className="table-col"/>
          </colgroup>
          <tbody>
            <tr>
              <td></td>
              <td id="logoRow">
                <img src="images/logoTfMed.png"/>
              </td>
              <td></td>
            </tr>
            <tr id="newsSection">
              <td>
                <span className="glyphicon glyphicon-chevron-left glyphicon-padding" aria-hidden="true"></span>
              </td>
              <td id="newsRow">
                <div>
                  <span id="newsTitle">
                    <a href={this.state.currentData.link} target="_blank">{this.state.currentData.title}</a>
                  </span>
                  <br/>
                  <span id="newsSrc">
                    {this.state.currentData.newsSrc}
                  </span>
                  <span id="newsDate" > - {dateCooked(this.state.currentData.pubDate)}
                  </span>
                  <br/>
                  <span id="newsBody">
                    {this.state.currentData.description}
                  </span>
                  <br/>
                  <span id="apiProvider"><img src="images/brandBing.png"/></span>
                </div>
              </td>
              <td>
                <span className="glyphicon glyphicon-chevron-right glyphicon-padding" aria-hidden="true"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <a className="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev" onClick={this.getData} />
      <a className="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next" onClick={this.getData} />
      </div>
    );
  }
});

ReactDOM.render(
  <TableBox url={backendURL}/>,
  document.getElementById('content')
);
