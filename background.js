var ENTRIES = []
var CONFIG = {
  resultsSize: 10,
  historySize: 100
}

var dumpBookmarkEntry = function (entry) {
  var result = {type: 'bookmark'}
  var path = '/'
  _.each(entry, function (node) {
    var title = node.title

    if (_.isUndefined(node.children)) {
      var url = node.url
      result.title = title
      result.url = url
    } else if (title) {
      path += title + '/'
    }
  })
  result.path = path
  return result
}
var getBookmarks = function () {
  var path = []
  var walk = function (nodes) {
    for (var node of nodes) {
      path.push(node)
      if (node.children) {
        walk(node.children)
      } else {
        var entry = _.clone(path)
        entry = dumpBookmarkEntry(entry)
        ENTRIES.push(entry)
      }
      path.pop()
    }
  }

  return new Promise(function (resolve) {
    chrome.bookmarks.getTree(function (tree) {
      walk(tree)
      resolve()
    })
  })
}

var dumpHistoryEntry = function (entry) {
  var result = {type: 'history'}
  result.title = entry.title
  result.url = entry.url
  return result
}
var getHistory = function () {
  return new Promise(function (resolve) {
    chrome.history.search({
      text: '', maxResults: CONFIG.historySize
    }, function (results) {
      _.forEach(results, function (result) {
        var entry = dumpHistoryEntry(result)
        ENTRIES.push(result)
      })
      resolve()
    })
  })
}

var initialize = function () {
  console.log(ENTRIES)
  var list = function () {
    var response = _.take(ENTRIES, CONFIG.resultsSize)
    return response
  }

  var search = function (keyword) {
    var fuse = new Fuse(ENTRIES, {
      shouldSort: true,
      tokenize: true,
      maxPatternLength: 32,
      keys: [
        {name: 'title', weight: 0.8},
        {name: 'url', weight: 0.7},
        {name: 'path', weight: 0.1}
      ]
    })
    response = fuse.search(keyword)
    response = _.take(response, CONFIG.resultsSize)
    return response
  }

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var sendJson = _.flow(JSON.stringify, sendResponse)
    switch (request.action) {
      case 'list':
        sendJson(list())
        break
      case 'search':
        sendJson(search(request.params.keyword))
        break
      case 'open':
        chrome.tabs.create({url: request.params.url})
        sendJson(null)
        break
    }
  })
}

Promise.all([
  getBookmarks(),
  getHistory()
])
.then(initialize)
