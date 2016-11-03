var ENTRIES
var CONFIG = {
  resultsSize: 10,
  historySize: 100
}

var dumpBookmarkPathRecord = function (bookmarkPathRecord) {
  var entry = {type: 'bookmark'}
  var path = '/'
  _.each(bookmarkPathRecord, function (node) {
    var title = node.title

    if (_.isUndefined(node.children)) {
      var url = node.url
      entry.title = title
      entry.url = url
    } else if (title) {
      path += title + '/'
    }
  })
  entry.path = path
  return entry
}
var getBookmarks = function () {
  var bookmarks = []
  var bookmarkPathRecord = []
  var walk = function (nodes) {
    for (var node of nodes) {
      bookmarkPathRecord.push(node)
      if (node.children) {
        walk(node.children)
      } else {
        var entry = dumpBookmarkPathRecord(_.clone(bookmarkPathRecord))
        bookmarks.push(entry)
      }
      bookmarkPathRecord.pop()
    }
  }

  return new Promise(function (resolve) {
    chrome.bookmarks.getTree(function (tree) {
      walk(tree)
      resolve(bookmarks)
    })
  })
}

var dumpHistoryItem = function (historyItem) {
  var entry = {type: 'history'}
  entry.title = historyItem.title
  entry.url = historyItem.url
  entry.path = ''
  return entry
}
var getHistory = function () {
  return new Promise(function (resolve) {
    var history = []
    chrome.history.search({
      text: '', maxResults: CONFIG.historySize
    }, function (historyItems) {
      _.forEach(historyItems, function (historyItem) {
        var entry = dumpHistoryItem(historyItem)
        history.push(entry)
      })
      resolve(history)
    })
  })
}

var dumpTab = function (tab) {
  var entry = {type: 'tab'}
  entry.title = tab.title
  entry.url = tab.url
  entry.favIconUrl = tab.favIconUrl
  entry.path = ''
  entry.tabId = tab.id
  entry.windowId = tab.windowId
  return entry
}
var getTabs = function () {
  return new Promise(function (resolve) {
    chrome.tabs.query({}, function (tabs) {
      resolve(_.map(tabs, dumpTab))
    })
  })
}

var initialize = function () {
  var list = function () {
    var response = _.take(ENTRIES, CONFIG.resultsSize)
    return response
  }

  var search = function (keyword) {
    response = getEntriesIndex().search(keyword)
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
    }
  })
}

var updateEntries = function () {
  console.log('Updating entries...')
  var entries = {}
  return Promise.all([
    getBookmarks().then(function (bookmarks) {entries.bookmarks = bookmarks}),
    getHistory().then(function (history) {entries.history = history}),
    getTabs().then(function (tabs) {entries.tabs = tabs})
  ]).then(function () {
    ENTRIES = entries.tabs
      .concat(entries.history)
      .concat(entries.bookmarks)
    updateEntriesIndex()
  })
}

var entrieIndex
var updateEntriesIndex = function () {
  entrieIndex = new Fuse(ENTRIES, {
    shouldSort: true,
    tokenize: true,
    maxPatternLength: 32,
    keys: [
      {name: 'title', weight: 0.8},
      {name: 'url', weight: 0.7},
      {name: 'path', weight: 0.1}
    ]
  })
}
var getEntriesIndex = function () {
  return entrieIndex
}


var updateEntriesLazy = _.debounce(updateEntries, 100)
chrome.bookmarks.onCreated.addListener(updateEntriesLazy)
chrome.bookmarks.onRemoved.addListener(updateEntriesLazy)
chrome.bookmarks.onChanged.addListener(updateEntriesLazy)
chrome.bookmarks.onMoved.addListener(updateEntriesLazy)
chrome.bookmarks.onChildrenReordered.addListener(updateEntriesLazy)
chrome.history.onVisited.addListener(updateEntriesLazy)
chrome.history.onVisitRemoved.addListener(updateEntriesLazy)
chrome.tabs.onCreated.addListener(updateEntriesLazy)
chrome.tabs.onUpdated.addListener(updateEntriesLazy)
chrome.tabs.onMoved.addListener(updateEntriesLazy)
chrome.tabs.onDetached.addListener(updateEntriesLazy)
chrome.tabs.onAttached.addListener(updateEntriesLazy)
chrome.tabs.onRemoved.addListener(updateEntriesLazy)
chrome.tabs.onReplaced.addListener(updateEntriesLazy)

updateEntries().then(initialize)
