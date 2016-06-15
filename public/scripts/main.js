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
    var tfLastSaved = localStorage.getItem("tfLastSaved");
    if(tfLastSaved!=null){
      return (((tfLastSaved-currentTimestamp)/3600000)>1); // is outdated after an hour
    }
  }
  return true;
}
var preload = function(arrayOfImages) {
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
        if(typeof(localStorage)!=="undefined"){
          localStorage.setItem("tfData", JSON.stringify(data));
          localStorage.setItem("tfLastSaved", new Date().getTime());
        }
        this.setState({data:data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    var currentTimestamp = new Date();
    if(isOutdated(currentTimestamp)){
      this.fetchNewsFeeds();
    }else{
      var tfData = localStorage.getItem("tfData");
      if(tfData!=null){
        this.setState({data:JSON.parse(tfData)});
      }else{
        this.fetchNewsFeeds();
      }
    }
  },
  componentWillUnmount: function() {
    this.serverRequest.abort();
  },
  render: function() {
    if(this.state.data==undefined){
      return (
        <div>
        </div>
      );
    }else{
      var dataCount = this.state.data.length;
      var carouselIndicators = [];
      for (var i=0; i <dataCount; i++) {
        var carouselIndicatorsClassName = (i==0)? "active":"";
        var carouselIndicatorsKeyId = "carouselIndicatorsKeyId"+i;
        carouselIndicators.push(<li data-target="#carousel-example-generic" data-slide-to={i} className={carouselIndicatorsClassName} key={carouselIndicatorsKeyId}></li>);
      }

      var carouselInner = [];
      for (var i=0; i < dataCount; i++) {
          var carouselInnerDivClassName = (i==0)? "item active":"item";
          var parentDivId = "carouselInnerParentDivId"+i
          var imageId = "carouselInnerImageId"+i;
          var divId = "carouselInnerDivId"+i;
          var newsBgId = "carouselInnerNewsBg"+i;
          var blackOverlayId = "carouselInnerBlackOverlay"+i;
          var newsBgStyle = {
            background: 'url("'+this.state.data[i].image+'")'
          };

          carouselInner.push(<div className={carouselInnerDivClassName} key={parentDivId}>
            <img src="images/spacer.png" height="100%" width="100%" key={imageId}/>
            <div key={divId}>
              <div id="newsBg" style={newsBgStyle} key={newsBgId}/>
              <div id="blackOverlay" key={blackOverlayId}/>
            </div>
          </div>);
      }

      return (
        <div>
          <div id="carousel-example-generic" className="carousel slide" data-ride="carousel"  data-interval="false">
            <ol className='carousel-indicators'>
              {carouselIndicators}
            </ol>
            <div className="carousel-inner" role="listbox">
              {carouselInner}
            </div>
          </div>
          <NewsBox data={this.state.data} />
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
      preload([previousImage, nextImage]);
    }
  },
  getPreviousData : function(){
    var previousIndex = this.state.index-1;
    previousIndex = (previousIndex<0)? this.props.data.length-1: previousIndex;
    this.preloadData(this.props.data, previousIndex);
    this.setState({index:previousIndex, currentData:this.props.data[previousIndex]});
  },
  getNextData : function(){
    var nextIndex = this.state.index+1;
    nextIndex = (nextIndex==this.props.data.length)? 0: nextIndex;
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

      <a className="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev" onClick={this.getPreviousData} />
      <a className="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next" onClick={this.getNextData} />
      </div>
    );
  }
});

ReactDOM.render(
  <TableBox url={backendURL}/>,
  document.getElementById('content')
);
