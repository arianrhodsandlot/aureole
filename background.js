var ENTRIES = []
var CONFIG = {
  size: 10
}

var getBookmarks = function () {
  var path = []
  var walk = function (nodes) {
    for (var node of nodes) {
      path.push(node)
      if (node.children) {
        walk(node.children)
      } else {
        ENTRIES.push(_.clone(path))
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

var dumpBookmarkEntry = function (bookmarkEntry) {
  var result = {type: 'bookmark'}
  var path = '/'
  _.each(bookmarkEntry, function (node) {
    var title = node.title

    if (_.isUndefined(node.children)) {
      var url = node.url
      result.id = node.id
      result.title = title
      result.url = url
    } else if (title) {
      path += title + '/'
    }
  })
  result.path = path
  return result
}

var list = function () {
  var response = _.take(ENTRIES, CONFIG.size)
  response = _.map(response, dumpBookmarkEntry)
  return JSON.stringify(response)
}

var search = function (keyword) {
  var response = _.map(ENTRIES, dumpBookmarkEntry)
  var fuse = new Fuse(response, {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: [
      {name: 'title', weight: 0.8},
      {name: 'url', weight: 0.7},
      {name: 'path', weight: 0.1}
    ]
  })
  response = fuse.search(keyword)
  response = _.take(response, CONFIG.size)
  return JSON.stringify(response)
}

var initialize = function () {
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

getBookmarks().then(initialize)
