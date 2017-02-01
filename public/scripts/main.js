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
      return (((currentTimestamp-tfLastSaved)/3600000)>1); // is outdated after an hour
    }
  }
  return true;
}

var getSessionSearchText = function(){
  var sessionSearchText = "";
  if(typeof(localStorage)!=="undefined" && localStorage.getItem("tfSearchText")!==null){
    sessionSearchText = localStorage.getItem("tfSearchText");
  }
  return sessionSearchText;
}

var isJSON = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

var showErrorMsg = function(str){
  if(str.length>0)
    alert("Your search: "+str+" did not return any result.");
  else
    alert("Your search did not return any result.");
}

var isSearchInputFocused = function(){
  return ($("#searchInput").is(":focus"));
}

var backendURL = "http://app.tagfeeds.com/newsBing";
var keyId = 0;

var NavBox = React.createClass({
  getData : function(){
    var sessionSearchText = getSessionSearchText();
    var tagList = (sessionSearchText == undefined) ? [undefined] : sessionSearchText.split(',');
    var tagListObj = [];
    var id=0;
    tagList.forEach(function(text){
      tagListObj[id++]={"search":text};
    });
    this.setState({tagList:tagListObj});
  },
  removeTag : function(text){
    var tagListObj = this.state.tagList;
    for(var i=0; i<tagListObj.length; i++){
      var tag = tagListObj[i];
      if(tag.search === text){
        tagListObj.splice(i,1);
      }
    }
    this.setState({tagList:tagListObj});
  },
  componentDidMount: function(){
    // keyup event
    var main = this;
    main.getData();

    $(function(){
        $('#searchForm').submit(function () {
          return false;
        });
        $('#searchInput').keypress(function(e){
          keyId++;
          var _this = $(this);
          if(e.keyCode == 13){
            main.props.callbackParent(_this.val());
            _this.blur();
            var btnNavBarToggle = $("#navbar-toggle");
            if(btnNavBarToggle.attr("class").indexOf("collapsed")==-1){
              btnNavBarToggle.click(); //toggle navbar-toggle
            }
          }
        });

        //trick to remove zoom in on mobile phone
        $('#searchInput').mousedown(function(){
          $('meta[name=viewport]').remove();
          $('head').append('<meta name="viewport" content="width=device-width, maximum-scale=1.0, user-scalable=0">');
        });

        $('#searchInput').focusout(function(){
          $('meta[name=viewport]').remove();
          $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0">' );
        });

        $('.has-clear input[type="text"]').on('input propertychange', function() {
          var $this = $(this);
          var visible = Boolean($this.val());
          $this.siblings('.form-control-clear').toggleClass('hidden', !visible);
        }).trigger('propertychange');

        $('.form-control-clear').click(function() {
          $('#searchInput').mousedown();
          $(this).siblings('input[type="text"]').val('')
            .trigger('propertychange').focus();
        });
    });
  },

  render: function(){
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">
              <img src="images/brandTf.png" />
            </a>
            <button id="navbar-toggle" type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
          </div>
          <div id="navbar" className="navbar-collapse collapse" aria-expanded="false">
            <ul className="nav navbar-nav navbar-left">
            <form id="searchForm" className="navbar-form navbar-left has-feedback has-clear" role="form" action=".">
              <div className="form-group">
                <input id="searchInput" type="text" name="search" className="form-control" placeholder="Search"/>
                <span className="form-control-clear glyphicon glyphicon-remove-circle form-control-feedback translucent"></span>
              </div>
              <div className="bootstrap-tagsinput" id="tagCollection">
                {
                  this.state!=null && this.state.tagList.map(function(tag,index) {
                    var text = tag.search;
                    var id = index + text;
                    var tagId = "tag:"+id;
                    var tagRemoveId = "tagRemove:"+id;
                    if (text != "")
                       return(<span id={tagId} key={tagId} className="tag label">{text}<span id={tagRemoveId} key={tagRemoveId} data-role="remove" onClick={this.removeTag.bind(this, text)}></span></span>);
                  },this)
                }
              </div>
            </form>
            </ul>
          </div>
        </div>
      </nav>
    )
  }
});
var MainBox = React.createClass({
  getInitialState: function() {
    return {data:undefined};
  },
  fetchNewsFeeds: function(searchText){
    var _searchText = (searchText==undefined)? getSessionSearchText() : searchText;
    var strUrl = (_searchText=="")? backendURL: backendURL+"?search="+_searchText;

    this.serverRequest = $.ajax({
      url: strUrl,
      dataType: 'json',
      cache: true,
      timeout: 5000,
      success: function(data) {
        if(data.length>0){
          if(typeof(localStorage)!=="undefined"){
            try {
              localStorage.setItem("tfData", JSON.stringify(data));
              localStorage.setItem("tfLastSaved", new Date().getTime());
              localStorage.setItem("tfSearchText", _searchText);
            }catch (err) {
              console.log(err.toString());
            }
          }
          this.setState({data:data});
          this.getNewsBoxData();
          this.getNavBoxData();
        }else {
          showErrorMsg(_searchText);
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(backendURL, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    var currentTimestamp = new Date().getTime();
    if(isOutdated(currentTimestamp)){
      this.fetchNewsFeeds();
    }else{
      var tfData = localStorage.getItem("tfData");
      if(tfData!=null && isJSON(tfData)){
        this.setState({data:JSON.parse(tfData)});
      }else{
        showErrorMsg("");
      }
    }
  },
  componentWillUnmount: function() {
    this.serverRequest.abort();
  },
  getNewsBoxData: function(){
    this.refs.newsBox.getData();
  },
  getNavBoxData: function(){
    this.refs.navBox.getData();
  },
  render: function() {
    if(this.state.data==undefined){
      return (
        <div>
          <NavBox ref="navBox" callbackParent={this.fetchNewsFeeds}/>
        </div>
      );
    }else{
      return (
        <div>
          <NavBox ref="navBox" callbackParent={this.fetchNewsFeeds}/>
          <div id="carousel-example-generic" className="carousel slide" data-ride="carousel" data-interval="false">
            <ol className='carousel-indicators'>
              {
                this.state.data.map(function(news, index) {
                  var uniqueId = news.title.length;
                  var handleUpdate = this.getNewsBoxData.bind(this, index);
                  var carouselIndicatorsClassName = (index==0)? "active":" ";
                  var carouselIndicatorsKeyId = "carouselIndicatorsKeyId"+uniqueId+"_"+index;
                    return <li data-target="#carousel-example-generic" onClick={handleUpdate} data-slide-to={index} className={carouselIndicatorsClassName} key={carouselIndicatorsKeyId}/>
                },this)
              }
            </ol>
            <div className="carousel-inner" role="listbox">
              {
                this.state.data.map(function(news, index){
                  var uniqueId = news.title.length;
                  var indexId = uniqueId+"_"+index;
                  var carouselInnerDivClassName = (index==0)? "item active":"item";
                  var parentDivId = "carouselInnerParentDivId"+indexId;
                  var imageId = "carouselInnerImageId"+indexId;
                  var divId = "carouselInnerDivId"+indexId;
                  var newsBgId = "carouselInnerNewsBg"+indexId;
                  var blackOverlayId = "carouselInnerBlackOverlay"+indexId;
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
  getData : function(){
    var nextIndex = $('.carousel').find(".active").index();
    if(nextIndex==-1){
      nextIndex = 0;
    }
    this.setState({index:nextIndex, currentData:this.props.data[nextIndex]});
  },
  getInitialState: function() {
    return {index:0, currentData:this.props.data[0]};
  },
  updateMetaData: function(){
    //open graph
    $('meta[property="og:type"]').attr("content","article");
    $('meta[property="og:site_name"]').attr("content",this.state.currentData.newsSrc);
    $('meta[property="og:title"]').attr("content","TAGfeeds: "+this.state.currentData.title);
    $('meta[property="og:image"]').attr("content",this.state.currentData.image);
    $('meta[property="og:url"]').attr("content",this.state.currentData.link);
    $('meta[property="og:description"]').attr("content",this.state.currentData.description);
    //twitter cards
    $('meta[name="twitter:title"]').attr("content","TAGfeeds: "+this.state.currentData.title);
    $('meta[name="twitter:description"]').attr("content",this.state.currentData.description);
    $('meta[name="twitter:image"]').attr("content",this.state.currentData.image);
  },
  componentDidMount: function(){
    var _this = this;
    $(function(){
        $('body').keydown(function(e){
          var keyPress = e.which;
          if(!isSearchInputFocused() && keyPress == 37){
            $("#carousel-left").click();
            _this.getData();
          }else if(!isSearchInputFocused() && keyPress == 39){
            $("#carousel-right").click();
            _this.getData();
          }
        });
    });
    this.updateMetaData();
  },
  componentDidUpdate: function(){
    this.updateMetaData();
  },
  render: function() {
    return (
      <div>
      <div id="newsFg" className="article">
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
                  <article>
                    <span id="newsTitle">
                      <a href={this.state.currentData.link} target="_blank">{this.state.currentData.title}</a>
                    </span>
                    <br/>
                    <span id="newsSrc">
                      {this.state.currentData.newsSrc}
                    </span>
                    <span id="newsDate">{" - "+ dateCooked(this.state.currentData.pubDate)}
                    </span>
                    <br/>
                    <span id="newsBody" className="article1">
                      <article1>{this.state.currentData.description}</article1>
                    </span>
                  </article>
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

      <a id="carousel-left" className="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev" onClick={this.getData} />
      <a id="carousel-right" className="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next" onClick={this.getData} />
      </div>
    );
  }
});

ReactDOM.render(
  <MainBox url={backendURL}/>,
  document.getElementById('content')
);
