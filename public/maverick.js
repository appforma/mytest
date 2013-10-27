;(function(window) {
  var document = window.document,
      settings = {
        tabColor: "#000000",
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
                        '  <div id="maverick_header"><a id="maverick_close" href="#"><img src="http://sassyhongkong.com/wp-content/themes/lifestyle/images/lightbox_close_button.png" /></a></div>' +
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
    // server_url = 'http://192.168.1.102:3005/external/accounts/external_show?embed_hash=' + settings.acc_hash;
    // css_url = 'http://192.168.1.102:3000/maverick.embed.css';

    server_url = 'http://smp-staging.herokuapp.com/external/accounts/external_show?embed_hash=' + settings.acc_hash;
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
    // setting important data
    set_resources_links();
    // setting up the html elements
    if (!tab) { createElements(); }
    // loading the css file into the DOM
    if (!document.getElementById(css_id)) { loadCss(); }


    showTab();
    // updateTab();
    // closeButton.src = closeButtonURL();
    // iframe.src = loadingURL();

    // window.addEventListener('message', function(e) {
    //   if (e.data === 'hideZenbox') {
    //     hide();
    //   }
    // }, false);
  }

  function show_popup() {
    iframe.src = server_url;
    overlay.style.height = getDocHeight() + 'px';
    modal.style.top = getScrollOffsets().top + 50 + 'px';
    overlay.style.display = "block";
  }

  function hide_popup() {
    overlay.style.display = 'none';
    // iframe.src = loadingURL();
  }

  var Maverick = {
    /*
        PUBLIC API
    */

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

  // bindEvent(window, 'load', function() {
  //   if (window.zenbox_params) {
  //     Maverick.init(window.zenbox_params);
  //   }
  // });

  window.Maverick = Maverick;

}(this.window || this));