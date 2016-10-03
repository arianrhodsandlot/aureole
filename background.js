var ENTRIES = []
var CONFIG = {
  size: 10
}

var getBookmarks = function () {
  var path = []
  var walk = function (nodes) {
    _.each(nodes, function (node) {
      path.push(node)
      if (node.children) {
        walk(node.children)
      } else {
        ENTRIES.push(_.clone(path))
      }
      path.pop()
    })
  }
  return new Promise(function (resolve) {
    chrome.bookmarks.getTree(function (tree) {
      walk(tree)
      resolve(ENTRIES)
    })
  })
}

var dumpBookmarkEntry = function (bookmarkEntry) {
  var result = {type: 'bookmark'}
  var path = '/'
  _.each(bookmarkEntry, function (node) {
    var title = node.title

    if (!node.children) {
      result.title = title
      path += title + '(' + node.url + ')'
      return
    }

    if (title) path += title + '/'
  })
  result.path = path
  return result
}

var list = function () {
  var response = _.take(ENTRIES, CONFIG.size)
  response = _.map(response, dumpBookmarkEntry)
  return JSON.stringify(response)
}

var search = function (query) {
  var response = []
  return JSON.stringify(response)
}

var initialize = function () {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var response
    switch (request.action) {
      case 'list':
        response = list()
        break
      case 'search':
        response = search(request.query)
        break
    }
    sendResponse(response)
  })
}

getBookmarks().then(initialize)
