"use strict";

var NavBox = React.createClass({
  displayName: "NavBox",
  getData: function () {
    var sessionSearchText = getSessionSearchText();
    var tagList =
      sessionSearchText == null ? [undefined] : sessionSearchText.split(",");
    var tagListObj = [];
    var id = 0;
    tagList.forEach(function (text) {
      tagListObj[id++] = {
        search: text
      };
    }),
      this.setState({
        tagList: tagListObj
      });
  },
  removeTag: function (text) {
    var tagListObj = this.state.tagList;

    for (var i = 0; i < tagListObj.length; i++) {
      var tag = tagListObj[i];
      tag.search === encodeURI(text) && tagListObj.splice(i, 1);
    }

    this.setState({
      tagList: tagListObj
    });
  },
  componentDidMount: function () {
    var main = this;
    main.getData(),
      $(function () {
        // Implement the form post behavior
        //trick to remove zoom in on mobile phone
        $("#searchForm").submit(function () {
          return false;
        }),
          $("#searchInput").keypress(function (e) {
            // keyId++;
            var _this = $(this);

            if (e.keyCode == 13) {
              // update the localStorage
              var _searchText = _this.val();

              _searchText == getURLRequestSearchText()
                ? localStorage.setItem("tfRefreshSearch", false)
                : localStorage.setItem("tfRefreshSearch", true);
              // if(!isUndefined(history)){
              //   // html5 pushState without forcing a refresh
              //   _searchText = (isEmpty(_searchText))? "/": _searchText;
              //   history.pushState(null,null,_searchText);
              //   updateSearchStorage();
              //
              //   main.props.callbackParent(_this.val());
              //   _this.blur();
              //   var btnNavBarToggle = $("#navbar-toggle");
              //   if(btnNavBarToggle.attr("class").indexOf("collapsed")==-1){
              //     btnNavBarToggle.click(); //toggle navbar-toggle
              //   }
              // }else{
              // not html5. Forcing a refresh
              var winLocation = window.location.origin;
              window.location.replace(winLocation + "/" + _searchText);
            }
          }),
          $("#searchInput").mousedown(function () {
            $("meta[name=viewport]").remove(),
              $("head").append(
                '<meta name="viewport" content="width=device-width, maximum-scale=1.0, user-scalable=0">'
              );
          }),
          $("#searchInput").focusout(function () {
            $("meta[name=viewport]").remove(),
              $("head").append(
                '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
              );
          }),
          $('.has-clear input[type="text"]')
            .on("input propertychange", function () {
              var $this = $(this);
              var visible = Boolean($this.val());
              $this
                .siblings(".form-control-clear")
                .toggleClass("hidden", !visible);
            })
            .trigger("propertychange"),
          $(".form-control-clear").click(function () {
            $("#searchInput").mousedown(),
              $(this)
                .siblings('input[type="text"]')
                .val("")
                .trigger("propertychange")
                .focus();
          });
      });
  },
  render: function () {
    return /*#__PURE__*/ React.createElement(
      "nav",
      {
        className: "navbar navbar-inverse navbar-fixed-top"
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "container-fluid"
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "navbar-header"
          },
          /*#__PURE__*/ React.createElement(
            "a",
            {
              className: "navbar-brand",
              href: "#"
            },
            /*#__PURE__*/ React.createElement("img", {
              src: assetURL + "/images/brandTf.png"
            })
          ),
          /*#__PURE__*/ React.createElement(
            "button",
            {
              id: "navbar-toggle",
              type: "button",
              className: "navbar-toggle collapsed",
              "data-toggle": "collapse",
              "data-target": "#navbar",
              "aria-expanded": "false",
              "aria-controls": "navbar"
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "sr-only"
              },
              "Toggle navigation"
            ),
            /*#__PURE__*/ React.createElement("span", {
              className: "icon-bar"
            }),
            /*#__PURE__*/ React.createElement("span", {
              className: "icon-bar"
            }),
            /*#__PURE__*/ React.createElement("span", {
              className: "icon-bar"
            })
          )
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            id: "navbar",
            className: "navbar-collapse collapse",
            "aria-expanded": "false"
          },
          /*#__PURE__*/ React.createElement(
            "ul",
            {
              className: "nav navbar-nav navbar-left"
            },
            /*#__PURE__*/ React.createElement(
              "form",
              {
                id: "searchForm",
                className: "navbar-form navbar-left has-feedback has-clear",
                role: "form",
                action: "."
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "form-group"
                },
                /*#__PURE__*/ React.createElement("input", {
                  id: "searchInput",
                  type: "text",
                  name: "search",
                  className: "form-control",
                  placeholder: "Search"
                }),
                /*#__PURE__*/ React.createElement("span", {
                  className:
                    "form-control-clear glyphicon glyphicon-remove-circle form-control-feedback translucent"
                })
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "bootstrap-tagsinput",
                  id: "tagCollection"
                },
                this.state != null &&
                  this.state.tagList.map(function (tag, index) {
                    var text = decodeURI(tag.search);
                    var id = index + text;
                    var tagId = "tag:" + id;
                    var tagRemoveId = "tagRemove:" + id;
                    if (text != "")
                      return /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          id: tagId,
                          key: tagId,
                          className: "tag label"
                        },
                        text,
                        /*#__PURE__*/ React.createElement("span", {
                          id: tagRemoveId,
                          key: tagRemoveId,
                          "data-role": "remove",
                          onClick: this.removeTag.bind(this, text)
                        })
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
  getInitialState: function () {
    return {
      data: undefined
    };
  },
  fetchNewsFeeds: function (searchText) {
    var _searchText = searchText;

    var _urlRequestSearchText = getURLRequestSearchText();

    var _sessionSearchText = getSessionSearchText();

    var _refreshSearch = getSessionRefreshSearch();

    isEmpty(searchText) &&
      (isEmpty(_urlRequestSearchText)
        ? (_searchText = _sessionSearchText)
        : (_searchText = _urlRequestSearchText));
    //
    // console.log("_refreshSearch:"+_refreshSearch);
    // console.log("searchText:"+searchText);
    // console.log("_urlRequestSearchText:"+_urlRequestSearchText);
    // console.log("_sessionSearchText:"+_sessionSearchText);
    // console.log("_searchText:"+_searchText);
    var country = "US";

    if (typeof Intl != "undefined") {
      var loc = Intl.DateTimeFormat().resolvedOptions().timeZone;
      var locDetails = loc.split("/");
      country = locDetails.length >= 2 ? locDetails[1] : locDetails[0];
    }

    var strUrl = isEmpty(_searchText)
      ? backendURL + "?search=" + country
      : backendURL + "?search=" + _searchText; //console.log(strUrl);

    this.serverRequest = $.ajax({
      url: strUrl,
      dataType: "json",
      cache: true,
      timeout: 5000,
      success: function (data) {
        if (data.length > 0) {
          if (!isUndefined(typeof localStorage))
            try {
              localStorage.setItem("tfData", JSON.stringify(data)),
                localStorage.setItem("tfLastSaved", new Date().getTime()),
                localStorage.setItem("tfSearchText", _searchText),
                localStorage.setItem("tfRefreshSearch", false);
            } catch (err) {
              console.log(err.toString());
            }
          this.setState({
            data: data
          }),
            this.getNewsBoxData(),
            this.getNavBoxData();
        } else showErrorMsg(_searchText);
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(backendURL, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function () {
    var currentTimestamp = new Date().getTime(); // console.log(window.localStorage);

    if (isOutdated(currentTimestamp))
      // console.log("outdated");
      this.fetchNewsFeeds();
    else {
      // console.log("not outdated");
      var tfData = localStorage.getItem("tfData");
      tfData != null && isJSON(tfData)
        ? this.setState({
            data: JSON.parse(tfData)
          })
        : showErrorMsg("");
    }
  },
  componentWillUnmount: function () {
    this.serverRequest.abort();
  },
  getNewsBoxData: function () {
    this.refs.newsBox.getData();
  },
  getNavBoxData: function () {
    this.refs.navBox.getData();
  },
  render: function () {
    return this.state.data == null
      ? /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(NavBox, {
            ref: "navBox",
            callbackParent: this.fetchNewsFeeds
          })
        )
      : /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(NavBox, {
            ref: "navBox",
            callbackParent: this.fetchNewsFeeds
          }),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              id: "carousel-example-generic",
              className: "carousel slide",
              "data-ride": "carousel",
              "data-interval": "false"
            },
            /*#__PURE__*/ React.createElement(
              "ol",
              {
                className: "carousel-indicators"
              },
              this.state.data.map(function (news, index) {
                var uniqueId = news.title.length;
                var handleUpdate = this.getNewsBoxData.bind(this, index);
                var carouselIndicatorsClassName = index == 0 ? "active" : " ";
                var carouselIndicatorsKeyId =
                  "carouselIndicatorsKeyId" + uniqueId + "_" + index;
                return /*#__PURE__*/ React.createElement("li", {
                  "data-target": "#carousel-example-generic",
                  onClick: handleUpdate,
                  "data-slide-to": index,
                  className: carouselIndicatorsClassName,
                  key: carouselIndicatorsKeyId
                });
              }, this)
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "carousel-inner",
                role: "listbox"
              },
              this.state.data.map(function (news, index) {
                var uniqueId = news.title.length;
                var indexId = uniqueId + "_" + index;
                var carouselInnerDivClassName =
                  index == 0 ? "item active" : "item";
                var parentDivId = "carouselInnerParentDivId" + indexId;
                var imageId = "carouselInnerImageId" + indexId;
                var divId = "carouselInnerDivId" + indexId;
                var newsBgId = "carouselInnerNewsBg" + indexId;
                var blackOverlayId = "carouselInnerBlackOverlay" + indexId;
                var newsBgStyle = {
                  background: 'url("' + this.state.data[index].image + '")'
                };
                return /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: carouselInnerDivClassName,
                    key: parentDivId
                  },
                  /*#__PURE__*/ React.createElement("img", {
                    src: assetURL + "/images/spacer.png",
                    height: "100%",
                    width: "100%",
                    key: imageId
                  }),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      key: divId
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      id: "newsBg",
                      style: newsBgStyle,
                      key: newsBgId
                    }),
                    /*#__PURE__*/ React.createElement("div", {
                      id: "blackOverlay",
                      key: blackOverlayId
                    })
                  )
                );
              }, this)
            )
          ),
          /*#__PURE__*/ React.createElement(NewsBox, {
            ref: "newsBox",
            data: this.state.data
          })
        );
  }
});
var NewsBox = React.createClass({
  displayName: "NewsBox",
  getData: function () {
    var nextIndex = $(".carousel").find(".active").index();
    nextIndex == -1 && (nextIndex = 0),
      this.setState({
        index: nextIndex,
        currentData: this.props.data[nextIndex]
      });
  },
  getInitialState: function () {
    return {
      index: 0,
      currentData: this.props.data[0]
    };
  },
  updateMetaData: function () {
    //link
    //open graph
    //twitter cards
    $("title").html(this.state.currentData.title),
      $("link[rel='image_src']").attr("href", this.state.currentData.thumbnail),
      $("link[rel='canonical']").attr(
        "href",
        frontendURL + "/" + getSessionSearchText()
      ),
      $("meta[name='description']").attr(
        "content",
        this.state.currentData.description
      ),
      $("meta[property='og:type']").attr("content", "website"),
      $('meta[property="og:site_name"]').attr("content", "#TAGfeeds"),
      $('meta[property="og:title"]').attr(
        "content",
        "#TAGfeeds: " + this.state.currentData.title
      ),
      $('meta[property="og:url"]').attr(
        "content",
        frontendURL + "/" + getSessionSearchText()
      ),
      $('meta[property="og:image"]').attr(
        "content",
        this.state.currentData.thumbnail
      ),
      $('meta[property="og:description"]').attr(
        "content",
        this.state.currentData.description
      ),
      $('meta[property="og:updated_time"]').attr(
        "content",
        this.state.currentData.pubDate
      ),
      ($('meta[imageprop="image"]')[0].content =
        this.state.currentData.thumbnail),
      ($('meta[itemprop="description"]')[0].content =
        this.state.currentData.description),
      $('meta[name="twitter:title"]').attr(
        "content",
        "#TAGfeeds: " + this.state.currentData.title
      ),
      $('meta[name="twitter:description"]').attr(
        "content",
        this.state.currentData.description
      ),
      $('meta[name="twitter:image"]').attr(
        "content",
        this.state.currentData.thumbnail
      ),
      $('meta[name="twitter:image:src"]').attr(
        "content",
        this.state.currentData.thumbnail
      );
  },
  componentDidMount: function () {
    var _this = this;

    $(function () {
      $("body").keydown(function (e) {
        var keyPress = e.which;
        isSearchInputFocused() || keyPress != 37
          ? !isSearchInputFocused() &&
            keyPress == 39 &&
            ($("#carousel-right").click(), _this.getData())
          : ($("#carousel-left").click(), _this.getData());
      });
    }),
      _this.updateMetaData();
  },
  componentDidUpdate: function () {
    this.updateMetaData();
  },
  render: function () {
    return /*#__PURE__*/ React.createElement(
      "div",
      null,
      /*#__PURE__*/ React.createElement(
        "div",
        {
          id: "newsFg",
          className: "article"
        },
        /*#__PURE__*/ React.createElement(
          "table",
          {
            id: "news"
          },
          /*#__PURE__*/ React.createElement(
            "colgroup",
            null,
            /*#__PURE__*/ React.createElement("col", {
              className: "table-col"
            }),
            /*#__PURE__*/ React.createElement("col", null),
            /*#__PURE__*/ React.createElement("col", {
              className: "table-col"
            })
          ),
          /*#__PURE__*/ React.createElement(
            "tbody",
            null,
            /*#__PURE__*/ React.createElement(
              "tr",
              null,
              /*#__PURE__*/ React.createElement("td", null),
              /*#__PURE__*/ React.createElement(
                "td",
                {
                  id: "logoRow"
                },
                /*#__PURE__*/ React.createElement("img", {
                  src: assetURL + "/images/logoTfMed.png"
                })
              ),
              /*#__PURE__*/ React.createElement("td", null)
            ),
            /*#__PURE__*/ React.createElement(
              "tr",
              {
                id: "newsSection"
              },
              /*#__PURE__*/ React.createElement(
                "td",
                null,
                /*#__PURE__*/ React.createElement("span", {
                  className:
                    "glyphicon glyphicon-chevron-left glyphicon-padding",
                  "aria-hidden": "true"
                })
              ),
              /*#__PURE__*/ React.createElement(
                "td",
                {
                  id: "newsRow"
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "article",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        id: "newsTitle"
                      },
                      /*#__PURE__*/ React.createElement(
                        "a",
                        {
                          href: this.state.currentData.link,
                          target: "_blank"
                        },
                        this.state.currentData.title
                      )
                    ),
                    /*#__PURE__*/ React.createElement("br", null),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        id: "newsSrc"
                      },
                      this.state.currentData.newsSrc
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        id: "newsDate"
                      },
                      " - " + dateCooked(this.state.currentData.pubDate)
                    ),
                    /*#__PURE__*/ React.createElement("br", null),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        id: "newsBody",
                        className: "article1"
                      },
                      /*#__PURE__*/ React.createElement(
                        "article1",
                        null,
                        this.state.currentData.description
                      )
                    )
                  ),
                  /*#__PURE__*/ React.createElement("br", null),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      id: "apiProvider"
                    },
                    /*#__PURE__*/ React.createElement("img", {
                      src: assetURL + "/images/brandBing.png"
                    })
                  )
                )
              ),
              /*#__PURE__*/ React.createElement(
                "td",
                null,
                /*#__PURE__*/ React.createElement("span", {
                  className:
                    "glyphicon glyphicon-chevron-right glyphicon-padding",
                  "aria-hidden": "true"
                })
              )
            )
          )
        )
      ),
      /*#__PURE__*/ React.createElement("a", {
        id: "carousel-left",
        className: "left carousel-control",
        href: "#carousel-example-generic",
        role: "button",
        "data-slide": "prev",
        onClick: this.getData
      }),
      /*#__PURE__*/ React.createElement("a", {
        id: "carousel-right",
        className: "right carousel-control",
        href: "#carousel-example-generic",
        role: "button",
        "data-slide": "next",
        onClick: this.getData
      })
    );
  }
});
ReactDOM.render(
  /*#__PURE__*/ React.createElement(MainBox, {
    url: backendURL
  }),
  document.getElementById("content")
);
