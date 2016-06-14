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
var preload = function preload(arrayOfImages) {
  $(arrayOfImages).each(function () {
    $('<img/>')[0].src = this;
  });
};
var backendURL = "http://chrischia.info:3000/newsBing";
var TableBox = React.createClass({
  displayName: "TableBox",

  getInitialState: function getInitialState() {
    return { data: undefined };
  },
  componentDidMount: function componentDidMount() {
    this.serverRequest = $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: true,
      timeout: 5000,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentWillUnmount: function componentWillUnmount() {
    this.serverRequest.abort();
  },
  render: function render() {
    if (this.state.data == undefined) {
      return React.createElement("div", null);
    } else {
      var dataCount = this.state.data.length;
      var carouselIndicators = [];
      for (var i = 0; i < dataCount; i++) {
        var carouselIndicatorsClassName = i == 0 ? "active" : "";
        var carouselIndicatorsKeyId = "carouselIndicatorsKeyId" + i;
        carouselIndicators.push(React.createElement("li", { "data-target": "#carousel-example-generic", "data-slide-to": i, className: carouselIndicatorsClassName, key: carouselIndicatorsKeyId }));
      }

      var carouselInner = [];
      for (var i = 0; i < dataCount; i++) {
        var carouselInnerDivClassName = i == 0 ? "item active" : "item";
        var parentDivId = "carouselInnerParentDivId" + i;
        var imageId = "carouselInnerImageId" + i;
        var divId = "carouselInnerDivId" + i;
        var newsBgId = "carouselInnerNewsBg" + i;
        var blackOverlayId = "carouselInnerBlackOverlay" + i;
        var newsBgStyle = {
          background: 'url("' + this.state.data[i].image + '")'
        };

        carouselInner.push(React.createElement(
          "div",
          { className: carouselInnerDivClassName, key: parentDivId },
          React.createElement("img", { src: "images/spacer.png", height: "100%", width: "100%", key: imageId }),
          React.createElement(
            "div",
            { key: divId },
            React.createElement("div", { id: "newsBg", style: newsBgStyle, key: newsBgId }),
            React.createElement("div", { id: "blackOverlay", key: blackOverlayId })
          )
        ));
      }

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { id: "carousel-example-generic", className: "carousel slide", "data-ride": "carousel", "data-interval": "false" },
          React.createElement(
            "ol",
            { className: "carousel-indicators" },
            carouselIndicators
          ),
          React.createElement(
            "div",
            { className: "carousel-inner", role: "listbox" },
            carouselInner
          )
        ),
        React.createElement(NewsBox, { data: this.state.data })
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
      preload([previousImage, nextImage]);
    }
  },
  getPreviousData: function getPreviousData() {
    var previousIndex = this.state.index - 1;
    previousIndex = previousIndex < 0 ? this.props.data.length - 1 : previousIndex;
    this.preloadData(this.props.data, previousIndex);
    this.setState({ index: previousIndex, currentData: this.props.data[previousIndex] });
  },
  getNextData: function getNextData() {
    var nextIndex = this.state.index + 1;
    nextIndex = nextIndex == this.props.data.length ? 0 : nextIndex;
    this.preloadData(this.props.data, nextIndex);
    this.setState({ index: nextIndex, currentData: this.props.data[nextIndex] });
  },
  getInitialState: function getInitialState() {
    this.preloadData(this.props.data, 0);
    return { index: 0, currentData: this.props.data[0] };
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
                    this.state.currentData.title
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
      React.createElement("a", { className: "left carousel-control", href: "#carousel-example-generic", role: "button", "data-slide": "prev", onClick: this.getPreviousData }),
      React.createElement("a", { className: "right carousel-control", href: "#carousel-example-generic", role: "button", "data-slide": "next", onClick: this.getNextData })
    );
  }
});

ReactDOM.render(React.createElement(TableBox, { url: backendURL }), document.getElementById('content'));
