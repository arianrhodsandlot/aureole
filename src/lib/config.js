var config = {
  defaults: {
    historySize: 100,
    lang: '',
    openInNewTab: false,
    resultsSize: 10,
    sort: ['tab', 'history', 'bookmark'],
    theme: 'light'
  },
  storage: chrome.storage.sync || chrome.storage.local,
  get: function (k) {
    return new Promise(function (resolve) {
      config.storage.get(k, function (result) {
        resolve(result[k] || config.defaults[k])
      })
    })
  },
  set: function (k, v) {
    return new Promise(function (resolve) {
      var item = {}
      item[k] = v
      config.storage.set(item, resolve)
    })
  },
  load: function () {
    var ks = arguments
    return Promise.all(_.map(ks, config.get))
      .then(function (vs) {
        var results = {}
        _.each(ks, function (k, i) {
          results[k] = vs[i]
        })
        return results
      })
  }
}
