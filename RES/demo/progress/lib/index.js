window.addEventListener('load', function() {
  var getLeftCSS = function(value) {
    return (value - 1) * 100 + "%";
  }

  var bs = 'noprogress=true';

  var progressBar = document.getElementById("progressBar"),
    progress = document.getElementById("progress");

  var main = document.createElement("iframe");

  _progress = {

    domLoaded: .4,
    imgLoaded: .8,
    windowLoaded: 1,
    now: 0,
    next: .4,
    growing: null,

    loading: function(value, callback) {
      _progress.next = value;
      _progress.slowGrow(function() {
        callback && callback();
      })
    },

    notify: function(value, callback) {
      _progress.next = value;
      _progress.quickGrow(function() {
        callback && callback();
      })
    },

    loadDone: function() {
      _progress.notify(_progress.windowLoaded, _progress.hide)

    },

    hide: function() {
      progressBar.style.display = "none";
    },

    show: function() {
      progressBar.style.display = "";
    },

    domLoading: function() {
      _progress.loading(_progress.domLoaded);
    },

    imgLoading: function() {
      _progress.loading(_progress.imgLoaded);
    },

    windowLoading: function() {
      _progress.loading(_progress.windowLoaded);
    },

    update: function() {
      progress.style.left = getLeftCSS(_progress.now);
    },

    grow: function(dc, callback) {
      _progress.clearGrow();
      _progress.growing = setInterval(function() {
        if (_progress.now + dc <= _progress.next) {
          _progress.now += dc;
          _progress.update();
        } else {
          _progress.clearGrow();
          callback && callback();
        }
      }, 10)
    },

    clearGrow: function() {
      clearInterval(_progress.growing);
    },

    slowGrow: function(callback) {
      var dc = (_progress.next - _progress.now) / 1000;
      _progress.grow(dc, callback);
    },

    quickGrow: function(callback) {
      var dc = (_progress.next - _progress.now) / 30;
      _progress.grow(dc, callback);
    },

    getRealHref: function(a) {
      a = a || window.location;
      var search = a.search;
      if (search == "") {
        search = "?" + bs;
      } else {
        search += search.indexOf(bs) == -1 ? '&&' + bs : '';
      }
      return a.origin + a.pathname + search + a.hash;
    },

    getProgressHref: function(a) {
      a = a || window.location;
      var search = a.search;
      search = search.replace(new RegExp(bs, "g"), '');
      search = search.replace(/&&&&/g, '&&');
      search = search.replace(/&&$/, '');
      search = search.replace(/^\?&&/, '?');
      search = search == '?' ? '' : search;
      return a.origin + a.pathname + search + a.hash;
    },

    jumpTo: function(href) {

      _progress.init();

      var a = document.createElement("a");
      a.href = href;

      if (a.origin == window.location.origin && a.search.indexOf(bs) == -1) {
        _progress.lead(a);
      } else {
        window.location.href = a.href;
      }


    },

    lead: function(a) {
      window.history.replaceState({}, document.title, a.href);
      main.src = _progress.getRealHref(a);
    },

    follow: function() {
      document.title = main.contentDocument.title;
      window.history.replaceState({}, document.title, _progress.getProgressHref(main.contentWindow.location));
    },

    setHash: function(hash, offset) {
      window.location.hash = hash;
    },

    init: function() {
      _progress.now = 0;
      _progress.next = _progress.domLoaded;
      _progress.show();
      _progress.update();
      _progress.domLoading();
    }
  };

  startLoad = function(a) {

    main.src = _progress.getRealHref(a);
    main.frameBorder = 0;
    main.id = "main";
    // var t = main.contentWindow;
    // console.log(main.contentWindow);
    // -> null

    main.onload = function() {
      _progress.loadDone();
      _progress.follow();
      // console.log(t === main.contentWindow);
      // -> false
    }

    document.body.appendChild(main);

    _progress.init();

  }

  window.addEventListener('hashchange', function(e) {
    if (main.contentWindow.location.hash == window.location.hash) {
      main.contentWindow.location.href = main.contentWindow.location.href;
    } else {
      main.contentWindow.location.hash = window.location.hash;
    }

  })

})

/*some function*/

function render(urlpath) {
  if (parent.window._progress) {
    return parent.window._progress.jumpTo(urlpath);
  };
  window.addEventListener('load', function() {
    var a = document.createElement('a');
    a.href = urlpath;
    if (a.origin != window.location.origin) {
        alert('origin not equal: ' + a.origin + ' , require: ' + window.location.origin);
    } else {
        startLoad(a);
    }
  });
}
