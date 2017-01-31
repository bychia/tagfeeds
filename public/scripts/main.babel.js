"use strict";

var dateCooked = function dateCooked(pubDateStr) {
  var pubDate = new Date(pubDateStr);
  var currentDate = new Date();
  var differenceDateMS = currentDate - pubDate;
  if (differenceDateMS < 3600000) {
    //less than an hour
    return Math.round(differenceDateMS / 60000) + " minutes ago";
  } else if (differenceDateMS < 86400000) {
    //less than a day
    return Math.round(differenceDateMS / 3600000) + " hours ago";
  } else if (differenceDateMS < 604800000) {
    //less than a week
    return Math.round(differenceDateMS / 86400000) + " days ago";
  } else {
    return pubDate.toLocaleDateString();
  }
};
var localStorage = window.localStorage;

var isOutdated = function isOutdated(currentTimestamp) {
  if (typeof localStorage !== "undefined") {
    var tfLastSaved = localStorage.getItem("tfLastSaved");
    if (tfLastSaved != null) {
      return (currentTimestamp - tfLastSaved) / 3600000 > 1; // is outdated after an hour
    }
  }
  return true;
};

var getSessionSearchText = function getSessionSearchText() {
  var sessionSearchText = "";
  if (typeof localStorage !== "undefined" && localStorage.getItem("tfSearchText") !== null) {
    sessionSearchText = localStorage.getItem("tfSearchText");
  }
  return sessionSearchText;
};
//
// var preloadImage = function(arrayOfImages) {
//     $(arrayOfImages).each(function(){
//         $('<img/>')[0].src = this;
//     });
// }

var isJSON = function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

var showErrorMsg = function showErrorMsg(str) {
  if (str.length > 0) alert("Your search: " + str + " did not return any result.");else alert("Your search did not return any result.");
};

var isSearchInputFocused = function isSearchInputFocused() {
  return $("#searchInput").is(":focus");
};

var backendURL = "http://tagfeeds.com/api/newsBing";
var keyId = 0;

var NavBox = React.createClass({
  displayName: "NavBox",

  getData: function getData() {
    var sessionSearchText = getSessionSearchText();
    var tagList = sessionSearchText == undefined ? [undefined] : sessionSearchText.split(',');
    var tagListObj = [];
    var id = 0;
    tagList.forEach(function (text) {
      tagListObj[id++] = { "search": text };
    });
    this.setState({ tagList: tagListObj });
  },
  removeTag: function removeTag(text) {
    var tagListObj = this.state.tagList;
    for (var i = 0; i < tagListObj.length; i++) {
      var tag = tagListObj[i];
      if (tag.search === text) {
        tagListObj.splice(i, 1);
      }
    }
    this.setState({ tagList: tagListObj });
  },
  componentDidMount: function componentDidMount() {
    // keyup event
    var main = this;
    main.getData();

    $(function () {
      $('#searchForm').submit(function () {
        return false;
      });
      $('#searchInput').keypress(function (e) {
        keyId++;
        var _this = $(this);
        if (e.keyCode == 13) {
          main.props.callbackParent(_this.val());
          _this.blur();
          var btnNavBarToggle = $("#navbar-toggle");
          if (btnNavBarToggle.attr("class").indexOf("collapsed") == -1) {
            btnNavBarToggle.click(); //toggle navbar-toggle
          }
        }
      });

      //trick to remove zoom in on mobile phone
      $('#searchInput').mousedown(function () {
        $('meta[name=viewport]').remove();
        $('head').append('<meta name="viewport" content="width=device-width, maximum-scale=1.0, user-scalable=0">');
      });

      $('#searchInput').focusout(function () {
        $('meta[name=viewport]').remove();
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
      });

      $('.has-clear input[type="text"]').on('input propertychange', function () {
        var $this = $(this);
        var visible = Boolean($this.val());
        $this.siblings('.form-control-clear').toggleClass('hidden', !visible);
      }).trigger('propertychange');

      $('.form-control-clear').click(function () {
        $('#searchInput').mousedown();
        $(this).siblings('input[type="text"]').val('').trigger('propertychange').focus();
      });
    });
  },

  render: function render() {
    return React.createElement(
      "nav",
      { className: "navbar navbar-inverse navbar-fixed-top" },
      React.createElement(
        "div",
        { className: "container-fluid" },
        React.createElement(
          "div",
          { className: "navbar-header" },
          React.createElement(
            "a",
            { className: "navbar-brand", href: "#" },
            React.createElement("img", { src: "images/brandTf.png" })
          ),
          React.createElement(
            "button",
            { id: "navbar-toggle", type: "button", className: "navbar-toggle collapsed", "data-toggle": "collapse", "data-target": "#navbar", "aria-expanded": "false", "aria-controls": "navbar" },
            React.createElement(
              "span",
              { className: "sr-only" },
              "Toggle navigation"
            ),
            React.createElement("span", { className: "icon-bar" }),
            React.createElement("span", { className: "icon-bar" }),
            React.createElement("span", { className: "icon-bar" })
          )
        ),
        React.createElement(
          "div",
          { id: "navbar", className: "navbar-collapse collapse", "aria-expanded": "false" },
          React.createElement(
            "ul",
            { className: "nav navbar-nav navbar-left" },
            React.createElement(
              "form",
              { id: "searchForm", className: "navbar-form navbar-left has-feedback has-clear", role: "form", action: "." },
              React.createElement(
                "div",
                { className: "form-group" },
                React.createElement("input", { id: "searchInput", type: "text", name: "search", className: "form-control", placeholder: "Search" }),
                React.createElement("span", { className: "form-control-clear glyphicon glyphicon-remove-circle form-control-feedback translucent" })
              ),
              React.createElement(
                "div",
                { className: "bootstrap-tagsinput", id: "tagCollection" },
                this.state != null && this.state.tagList.map(function (tag, index) {
                  var text = tag.search;
                  var id = index + text;
                  var tagId = "tag:" + id;
                  var tagRemoveId = "tagRemove:" + id;
                  if (text != "") return React.createElement(
                    "span",
                    { id: tagId, key: tagId, className: "tag label" },
                    text,
                    React.createElement("span", { id: tagRemoveId, key: tagRemoveId, "data-role": "remove", onClick: this.removeTag.bind(this, text) })
                  );
                }, this)
              )
            )
          )
        )
      )
    );
  }
});
var MainBox = React.createClass({
  displayName: "MainBox",

  getInitialState: function getInitialState() {
    return { data: undefined };
  },
  fetchNewsFeeds: function fetchNewsFeeds(searchText) {
    var _searchText = searchText == undefined ? getSessionSearchText() : searchText;
    var strUrl = _searchText == "" ? backendURL : backendURL + "?search=" + _searchText;

    this.serverRequest = $.ajax({
      url: strUrl,
      dataType: 'json',
      cache: true,
      timeout: 5000,
      success: function (data) {
        if (data.length > 0) {
          if (typeof localStorage !== "undefined") {
            try {
              localStorage.setItem("tfData", JSON.stringify(data));
              localStorage.setItem("tfLastSaved", new Date().getTime());
              localStorage.setItem("tfSearchText", _searchText);
            } catch (err) {
              console.log(err.toString());
            }
          }
          this.setState({ data: data });
          this.getNewsBoxData();
          this.getNavBoxData();
        } else {
          showErrorMsg(_searchText);
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(backendURL, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function componentDidMount() {
    var currentTimestamp = new Date().getTime();
    if (isOutdated(currentTimestamp)) {
      this.fetchNewsFeeds();
    } else {
      var tfData = localStorage.getItem("tfData");
      if (tfData != null && isJSON(tfData)) {
        this.setState({ data: JSON.parse(tfData) });
      } else {
        showErrorMsg("");
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    this.serverRequest.abort();
  },
  getNewsBoxData: function getNewsBoxData() {
    this.refs.newsBox.getData();
  },
  getNavBoxData: function getNavBoxData() {
    this.refs.navBox.getData();
  },
  render: function render() {
    if (this.state.data == undefined) {
      return React.createElement(
        "div",
        null,
        React.createElement(NavBox, { ref: "navBox", callbackParent: this.fetchNewsFeeds })
      );
    } else {
      return React.createElement(
        "div",
        null,
        React.createElement(NavBox, { ref: "navBox", callbackParent: this.fetchNewsFeeds }),
        React.createElement(
          "div",
          { id: "carousel-example-generic", className: "carousel slide", "data-ride": "carousel", "data-interval": "false" },
          React.createElement(
            "ol",
            { className: "carousel-indicators" },
            this.state.data.map(function (news, index) {
              var uniqueId = news.title.length;
              var handleUpdate = this.getNewsBoxData.bind(this, index);
              var carouselIndicatorsClassName = index == 0 ? "active" : " ";
              var carouselIndicatorsKeyId = "carouselIndicatorsKeyId" + uniqueId + "_" + index;
              return React.createElement("li", { "data-target": "#carousel-example-generic", onClick: handleUpdate, "data-slide-to": index, className: carouselIndicatorsClassName, key: carouselIndicatorsKeyId });
            }, this)
          ),
          React.createElement(
            "div",
            { className: "carousel-inner", role: "listbox" },
            this.state.data.map(function (news, index) {
              var uniqueId = news.title.length;
              var indexId = uniqueId + "_" + index;
              var carouselInnerDivClassName = index == 0 ? "item active" : "item";
              var parentDivId = "carouselInnerParentDivId" + indexId;
              var imageId = "carouselInnerImageId" + indexId;
              var divId = "carouselInnerDivId" + indexId;
              var newsBgId = "carouselInnerNewsBg" + indexId;
              var blackOverlayId = "carouselInnerBlackOverlay" + indexId;
              var newsBgStyle = {
                background: 'url("' + this.state.data[index].image + '")'
              };

              return React.createElement(
                "div",
                { className: carouselInnerDivClassName, key: parentDivId },
                React.createElement("img", { src: "images/spacer.png", height: "100%", width: "100%", key: imageId }),
                React.createElement(
                  "div",
                  { key: divId },
                  React.createElement("div", { id: "newsBg", style: newsBgStyle, key: newsBgId }),
                  React.createElement("div", { id: "blackOverlay", key: blackOverlayId })
                )
              );
            }, this)
          )
        ),
        React.createElement(NewsBox, { ref: "newsBox", data: this.state.data })
      );
    }
  }
});

var NewsBox = React.createClass({
  displayName: "NewsBox",

  getData: function getData() {
    var nextIndex = $('.carousel').find(".active").index();
    if (nextIndex == -1) {
      nextIndex = 0;
    }
    this.setState({ index: nextIndex, currentData: this.props.data[nextIndex] });
  },
  getInitialState: function getInitialState() {
    return { index: 0, currentData: this.props.data[0] };
  },
  updateMetaData: function updateMetaData() {
    //open graph
    $('meta[property="og:type"]').attr("content", "article");
    $('meta[property="og:site_name"]').attr("content", this.state.currentData.newsSrc);
    $('meta[property="og:title"]').attr("content", "TAGfeeds: " + this.state.currentData.title);
    $('meta[property="og:image"]').attr("content", this.state.currentData.image);
    $('meta[property="og:url"]').attr("content", this.state.currentData.link);
    $('meta[property="og:description"]').attr("content", this.state.currentData.description);
    //twitter cards
    $('meta[name="twitter:title"]').attr("content", "TAGfeeds: " + this.state.currentData.title);
    $('meta[name="twitter:description"]').attr("content", this.state.currentData.description);
    $('meta[name="twitter:image"]').attr("content", this.state.currentData.image);
  },
  componentDidMount: function componentDidMount() {
    var _this = this;
    $(function () {
      $('body').keydown(function (e) {
        var keyPress = e.which;
        if (!isSearchInputFocused() && keyPress == 37) {
          $("#carousel-left").click();
          _this.getData();
        } else if (!isSearchInputFocused() && keyPress == 39) {
          $("#carousel-right").click();
          _this.getData();
        }
      });
    });
    this.updateMetaData();
  },
  componentDidUpdate: function componentDidUpdate() {
    this.updateMetaData();
  },
  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { id: "newsFg", className: "article" },
        React.createElement(
          "table",
          { id: "news" },
          React.createElement(
            "colgroup",
            null,
            React.createElement("col", { className: "table-col" }),
            React.createElement("col", null),
            React.createElement("col", { className: "table-col" })
          ),
          React.createElement(
            "tbody",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement("td", null),
              React.createElement(
                "td",
                { id: "logoRow" },
                React.createElement("img", { src: "images/logoTfMed.png" })
              ),
              React.createElement("td", null)
            ),
            React.createElement(
              "tr",
              { id: "newsSection" },
              React.createElement(
                "td",
                null,
                React.createElement("span", { className: "glyphicon glyphicon-chevron-left glyphicon-padding", "aria-hidden": "true" })
              ),
              React.createElement(
                "td",
                { id: "newsRow" },
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "article",
                    null,
                    React.createElement(
                      "span",
                      { id: "newsTitle" },
                      React.createElement(
                        "a",
                        { href: this.state.currentData.link, target: "_blank" },
                        this.state.currentData.title
                      )
                    ),
                    React.createElement("br", null),
                    React.createElement(
                      "span",
                      { id: "newsSrc" },
                      this.state.currentData.newsSrc
                    ),
                    React.createElement(
                      "span",
                      { id: "newsDate" },
                      " - " + dateCooked(this.state.currentData.pubDate)
                    ),
                    React.createElement("br", null),
                    React.createElement(
                      "span",
                      { id: "newsBody", className: "article1" },
                      React.createElement(
                        "article1",
                        null,
                        this.state.currentData.description
                      )
                    )
                  ),
                  React.createElement("br", null),
                  React.createElement(
                    "span",
                    { id: "apiProvider" },
                    React.createElement("img", { src: "images/brandBing.png" })
                  )
                )
              ),
              React.createElement(
                "td",
                null,
                React.createElement("span", { className: "glyphicon glyphicon-chevron-right glyphicon-padding", "aria-hidden": "true" })
              )
            )
          )
        )
      ),
      React.createElement("a", { id: "carousel-left", className: "left carousel-control", href: "#carousel-example-generic", role: "button", "data-slide": "prev", onClick: this.getData }),
      React.createElement("a", { id: "carousel-right", className: "right carousel-control", href: "#carousel-example-generic", role: "button", "data-slide": "next", onClick: this.getData })
    );
  }
});

ReactDOM.render(React.createElement(MainBox, { url: backendURL }), document.getElementById('content'));
