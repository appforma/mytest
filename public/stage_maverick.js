;(function(window) {
  var document = window.document,
      settings = {
        acc_hash: ""
      },
      // references to elements on the page:
      server_url,
      css_url,
      css_id,
      tab,
      overlay,
      container,
      closeButton,
      iframe,
      scrim;

  function attempt(fn) {
    try {
      return fn();
    } catch(e) {
      if (window.console && window.console.log && window.console.log.apply) {
        window.console.log("Maverick Error: ", e);
      }
    }
  }

  function bindEvent(element, eventName, callback) {
    if (element && element.addEventListener) {
      element.addEventListener(eventName, callback, false);
    } else if (element && element.attachEvent) {
      element.attachEvent('on' + eventName, callback);
    }
  }

  // must be called after the DOM is loaded
  function createElements() {
    tab = document.createElement('div');
    tab.setAttribute('id', 'maverick_tab');
    tab.setAttribute('href', '#');
    tab.style.display = 'none';
    document.body.appendChild(tab);

    overlay = document.createElement('div');
    overlay.setAttribute('id', 'maverick_overlay');
    overlay.style.display = 'none';
    overlay.innerHTML = '<div id="maverick_modal">' +
                        '  <div id="maverick_header"><a id="maverick_close" href="#"><img src="https://s3.amazonaws.com/appforma_static/embed/close-x.png" /></a></div>' +
                        '  <div id="maverick_body">' +
                          '  <iframe id="maverick_iframe" frameborder="0" scrolling="auto" allowTransparency="true"></iframe>' +
                        '  </div>' +
                        '</div>' +
                        '<div id="maverick_scrim">&nbsp;</div>' 
    document.body.appendChild(overlay);

    modal       = document.getElementById('maverick_modal');
    closeButton = document.getElementById('maverick_close');
    iframe      = document.getElementById('maverick_iframe');
    scrim       = document.getElementById('maverick_scrim');

    bindEvent(tab, 'click', function() { window.Maverick.show_popup(); });
    bindEvent(closeButton, 'click', function() { window.Maverick.hide_popup(); });
    bindEvent(scrim, 'click', function() { window.Maverick.hide_popup(); });
  }

  function configure_settings(options) {
    var prop;
    for (prop in options) {
      if (options.hasOwnProperty(prop)) {
        settings[prop] = options[prop];
      }
    }
  }

  function loadCss() {
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.id   = css_id;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = css_url;
    link.media = 'all';
    head.appendChild(link);
  }

  function set_resources_links() {
    domain = 'b-stage.appforma.com';
    server_url = '//' + domain + '/external/accounts/embed_show?embed_hash=' + settings.acc_hash;
    css_url = 'https://s3.amazonaws.com/appforma_static/embed/maverick.embed.css';
    css_id = 'maverick_css_holder';
  }


  function showTab() {
    tab.style.display = 'block';
  }

  function getDocHeight(){
    return Math.max(
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
      Math.max(document.body.clientHeight, document.documentElement.clientHeight)
    );
  }

  function getScrollOffsets(){
    return {
      left: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      top:  window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
    };
  }

  function initialize(options) {
    // init all the user settings params
    configure_settings(options);
    set_resources_links();
    // setting up the html elements
    if (!tab) { createElements(); }
    // loading the css file into the DOM
    if (!document.getElementById(css_id)) { loadCss(); }

    // showing the promotion tab if the account has any promotion running
    initPromotions();
  }

  function initPromotions() {
    doAjax( { 
      url: '//' + domain + '/api/v1/embed_channels/check_for_promotions/' + settings.acc_hash + '.json',
      onSuccess: function () {
        showTab();
        if (needToAutoShowPopup()) {
          show_popup();
        }
      },
      onFailure: function () {
      }
    });
  }

  // return true if the promotion popup should be opened.
  // To automaticaly open promotion, there should be query param 'sh=1'
  function needToAutoShowPopup() {
    var param_open = getQueryVariable("sh");
    return param_open == "1";
  }

  function show_popup() {
    iframe.src = server_url;
    overlay.style.height = getDocHeight() + 'px';
    modal.style.height = (getVisibleHeight()) + 'px';
    overlay.style.display = "block";
  }

  function getVisibleHeight() {
    var visible_height = (window.innerHeight / 1.04);
    var final_height = visible_height > 1000 ? 1000 : visible_height;
    return final_height;
  }

  function hide_popup() {
    overlay.style.display = 'none';
  }

  //  Helper methods
  // return the value of the query param 'sh'. 
  // If such parameter doesnt exist, returns "".
  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return "";
  }

  // performs an ajax call to the given request params
  // request {
  //   :url - the url of the ajax call
  //   :onSuccess - function that will be called if the ajax call status is 200
  //   :onFailure - function that will be called if the ajax call status was something else than 200
  // }
  function doAjax( request ) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", request.url, false);
    ajax.onreadystatechange = function() {
      var res = JSON.parse(ajax.responseText);
      var res_status = res["status"];
      var res_msg = res["message"];
      
      if (res_status == 200) {
        request.onSuccess.call(); 
      } else {
        request.onFailure.call(); 
      }
    }
    ajax.send();
  }

  var Maverick = {
    init: function(options) {
      attempt(function() { return initialize(options); });
    },
    show_popup: function(options) {
      attempt(function() { return show_popup(); });
    },
    hide_popup: function(options) {
      attempt(function() { return hide_popup(); });
    }
  };

  window.Maverick = Maverick;

}(this.window || this));
