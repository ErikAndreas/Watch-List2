var Ractive = require('ractive');
var fetcher = require('./fetcher');
var store = require('./store');
var routie = require('./vendor/routie');
var controller = require('./controller');

function hasChanged(remoteEvt, localEvt) {
  console.log(remoteEvt, localEvt);
  if (remoteEvt) {
    var records = remoteEvt.affectedRecordsForTable('swl');
    console.log(remoteEvt.isLocal(), records);
    store.getData(); // will emit localEvt STORE
  } else {
    if (localEvt === store.events.STORE) {
      if (window.location.hash === '#/albums') {
        controller.aac.populate();
      } else if (window.location.hash === '#/news') {
        controller.nc.populate();
      } else if (window.location.hash === '#/') {
        controller.lfmc.populate();
      } else if (window.location.hash === '#/settings') {
        controller.sc.set();
      }
      console.log('has changed populated');
    } else if (localEvt === store.events.ALBUM_ADDED || localEvt === store.events.ALBUM_REMOVED) {
      controller.aac.setAA();
      controller.aac.populate();
    } else if (localEvt === store.events.NEWS_ADDED || localEvt === store.events.NEWS_REMOVED) {
      controller.nc.setNews();
      controller.nc.populate();
    }
  }
}

store.auth().then(function () {
  console.log('authed');
}).fail(function (err) {
  console.log('auth fail', err);
});

store.getData().then(function () {
  store.setRemoteChangedListener(hasChanged);
  console.log('index done getData');
});

store.setStoreChangedListener(hasChanged);

controller.mc.set();

controller.notc.init();

routie({
  '/albums': function () {
    console.log('route: albums');
    controller.aac.setAA();
    controller.aac.populate();
    controller.mc.rmenu.set('active', 'albums');
  },
  '/news': function () {
    console.log('route: news');
    controller.nc.setNews();
    controller.nc.populate();
    controller.mc.rmenu.set('active', 'news');
  },
  '/settings': function () {
    console.log('route: settings');
    controller.sc.set();
    controller.mc.rmenu.set('active', 'settings');
  },
  '*': function () {
    console.log('route: *');
    controller.lfmc.setLastFM();
    controller.lfmc.populate();
    controller.mc.rmenu.set('active', '/');
  }
});
