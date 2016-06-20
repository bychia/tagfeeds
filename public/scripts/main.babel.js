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
var preloadImage = function preloadImage(arrayOfImages) {
  $(arrayOfImages).each(function () {
    $('<img/>')[0].src = this;
  });
};
var backendURL = "http://tagfeeds.com:3000/newsBing";
var TableBox = React.createClass({
  displayName: "TableBox",

  getInitialState: function getInitialState() {
    return { data: undefined };
  },
  fetchNewsFeeds: function fetchNewsFeeds() {
    this.serverRequest = $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: true,
      timeout: 5000,
      success: function (data) {
        if (typeof localStorage !== "undefined") {
          try {
            localStorage.setItem("tfData", JSON.stringify(data));
            localStorage.setItem("tfLastSaved", new Date().getTime());
          } catch (err) {
            console.log(err.toString());
          }
        }
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function componentDidMount() {
    var currentTimestamp = new Date().getTime();
    if (isOutdated(currentTimestamp)) {
      this.fetchNewsFeeds();
    } else {
      var tfData = localStorage.getItem("tfData");
      if (tfData != null) {
        this.setState({ data: JSON.parse(tfData) });
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    this.serverRequest.abort();
  },
  getNewsBoxData: function getNewsBoxData() {
    this.refs.newsBox.getData();
  },
  render: function render() {
    if (this.state.data == undefined) {
      return React.createElement("div", null);
    } else {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { id: "carousel-example-generic", className: "carousel slide", "data-ride": "carousel", "data-interval": "false" },
          React.createElement(
            "ol",
            { className: "carousel-indicators" },
            this.state.data.map(function (news, index) {
              var handleUpdate = this.getNewsBoxData.bind(this, index);
              var carouselIndicatorsClassName = index == 0 ? "active" : " ";
              var carouselIndicatorsKeyId = "carouselIndicatorsKeyId" + index;
              return React.createElement("li", { "data-target": "#carousel-example-generic", onClick: handleUpdate, "data-slide-to": index, className: carouselIndicatorsClassName, key: carouselIndicatorsKeyId });
            }, this)
          ),
          React.createElement(
            "div",
            { className: "carousel-inner", role: "listbox" },
            this.state.data.map(function (news, index) {
              var carouselInnerDivClassName = index == 0 ? "item active" : "item";
              var parentDivId = "carouselInnerParentDivId" + index;
              var imageId = "carouselInnerImageId" + index;
              var divId = "carouselInnerDivId" + index;
              var newsBgId = "carouselInnerNewsBg" + index;
              var blackOverlayId = "carouselInnerBlackOverlay" + index;
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

  preloadData: function preloadData(items, index) {
    var imageCount = items.length;
    if (imageCount > 1) {
      var previousIndex = index - 1 < 0 ? imageCount - 1 : index - 1;
      var previousImage = items[previousIndex].image;
      var nextIndex = index + 1 >= imageCount ? 0 : index + 1;
      var nextImage = items[nextIndex].image;
      preloadImage([previousImage, nextImage]);
    }
  },
  getData: function getData() {
    var nextIndex = $('.carousel').find(".active").index();
    this.preloadData(this.props.data, nextIndex);
    this.setState({ index: nextIndex, currentData: this.props.data[nextIndex] });
  },
  getInitialState: function getInitialState() {
    this.preloadData(this.props.data, 0);
    return { index: 0, currentData: this.props.data[0] };
  },
  componentDidMount: function componentDidMount() {
    var _this = this;
    // keydown event
    $(function () {
      $('body').keydown(function (e) {
        var keyPress = e.which;
        if (keyPress == 37) {
          $("#carousel-left").click();
          _this.getData();
        } else if (keyPress == 39) {
          $("#carousel-right").click();
          _this.getData();
        }
      });
    });
  },
  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { id: "newsFg" },
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
                    " - ",
                    dateCooked(this.state.currentData.pubDate)
                  ),
                  React.createElement("br", null),
                  React.createElement(
                    "span",
                    { id: "newsBody" },
                    this.state.currentData.description
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

ReactDOM.render(React.createElement(TableBox, { url: backendURL }), document.getElementById('content'));
