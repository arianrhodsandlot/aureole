var config = {
  defaults: {
    historySize: 100,
    lang: '',
    openInNewTab: false,
    resultsSize: 10,
    sort: ['tab', 'history', 'bookmark'],
    theme: 'light'
  },
  get: function (k) {
    return new Promise(function (resolve) {
      chrome.storage.sync.get(k, function (result) {
        resolve(result[k] || config.defaults[k])
      })
    })
  },
  set: function (k, v) {
    return new Promise(function (resolve) {
      var config = {}
      config[k] = v
      chrome.storage.sync.set(config, resolve)
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
