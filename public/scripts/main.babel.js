"use strict";

var backendURL = "http://chrischia.info:3000/newsBing";

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
        var news = data[0];
        this.setState({ data: news });
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
      return React.createElement(
        "div",
        null,
        React.createElement("div", { id: "newsBg" })
      );
    } else {
      var imageUrl = this.state.data.image;
      var newsBgStyle = {
        background: 'url("' + imageUrl + '")'
      };
      return React.createElement(
        "div",
        null,
        React.createElement("div", { id: "newsBg", style: newsBgStyle }),
        React.createElement("div", { id: "blackOverlay" }),
        React.createElement(NewsBox, { data: this.state.data })
      );
    }
  }
});

var NewsBox = React.createClass({
  displayName: "NewsBox",

  getInitialState: function getInitialState() {
    return { date: dateCooked(this.props.data.pubDate) };
  },
  render: function render() {
    return React.createElement(
      "div",
      { id: "newsFg" },
      React.createElement(
        "table",
        { id: "news" },
        React.createElement(
          "tbody",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { id: "logoRow" },
              React.createElement("img", { src: "images/logoTfMed.png" })
            )
          ),
          React.createElement(
            "tr",
            { id: "newsSection" },
            React.createElement(
              "td",
              { id: "newsRow" },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "span",
                  { id: "newsTitle" },
                  this.props.data.title
                ),
                React.createElement("br", null),
                React.createElement(
                  "span",
                  { id: "newsSrc" },
                  this.props.data.newsSrc
                ),
                React.createElement(
                  "span",
                  { id: "newsDate" },
                  " - ",
                  this.state.date
                ),
                React.createElement("br", null),
                React.createElement(
                  "span",
                  { id: "newsBody" },
                  this.props.data.description
                ),
                React.createElement("br", null),
                React.createElement(
                  "span",
                  { id: "apiProvider" },
                  React.createElement("img", { src: "images/brandBing.png" })
                )
              )
            )
          )
        )
      )
    );
  }
});

ReactDOM.render(React.createElement(TableBox, { url: backendURL }), document.getElementById('content'));
