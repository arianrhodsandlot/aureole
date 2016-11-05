var ENTRIES
var CONFIG = {
  resultsSize: 10,
  historySize: 100,
  sort: ['tab', 'history', 'bookmark']
}

var bookmarks
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
  bookmarks = []
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

var historyItems
var dumpHistoryItem = function (historyItem) {
  var entry = {type: 'history'}
  entry.title = historyItem.title
  entry.url = historyItem.url
  entry.path = ''
  return entry
}
var getHistory = function () {
  return new Promise(function (resolve) {
    historyItems = []
    chrome.history.search({
      text: '', maxResults: CONFIG.historySize
    }, function (results) {
      _.forEach(results, function (result) {
        var entry = dumpHistoryItem(result)
        historyItems.push(entry)
      })
      resolve(historyItems)
    })
  })
}

var tabs
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
    chrome.tabs.query({}, function (currentTabs) {
      tabs = _.map(currentTabs.reverse(), dumpTab)
      resolve(tabs)
    })
  })
}

var entrieIndex
var updateEntriesSearchIndex = function () {
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

var queue = []
var updateTasks = []
var pending = false
var updateEntriesByQueue = function () {
  console.log(pending, queue)
  if (pending) return new Promise(_.noop, _.constant('pending'))
  pending = true
  _.forEach(queue, function (type) {
    var updateCertainEntries
    switch (type) {
      case 'bookmark':
        updateCertainEntries = getBookmarks
        break
      case 'history':
        updateCertainEntries = getHistory
        break
      case 'tab':
        updateCertainEntries = getTabs
        break
    }
    updateTasks.push(updateCertainEntries())
  })
  queue = []
  return Promise.all(updateTasks).then(function () {
    ENTRIES = tabs
      .concat(historyItems)
      .concat(bookmarks)
    updateEntriesSearchIndex()
    pending = false
  }, function () {
    pending = false
  })
}
var initAllEntries = function () {
  queue = ['bookmark', 'history', 'tab']
  return updateEntriesByQueue()
}
var updateEntriesByQueueLazy = _.debounce(updateEntriesByQueue, 500)
var updateEntriesByTypeLazy = function (type) {
  if (!_.includes(queue, type)) {
    queue.push(type)
  }
  updateEntriesByQueueLazy()
}
var updateBookmarksEntriesLazy = _.partial(updateEntriesByTypeLazy, 'bookmark')
var updateHistoryEntriesLazy = _.partial(updateEntriesByTypeLazy, 'history')
var updatetabsEntriesLazy = _.partial(updateEntriesByTypeLazy, 'tab')

chrome.bookmarks.onCreated.addListener(updateBookmarksEntriesLazy)
chrome.bookmarks.onRemoved.addListener(updateBookmarksEntriesLazy)
chrome.bookmarks.onChanged.addListener(updateBookmarksEntriesLazy)
chrome.bookmarks.onMoved.addListener(updateBookmarksEntriesLazy)
chrome.bookmarks.onChildrenReordered.addListener(updateBookmarksEntriesLazy)

chrome.history.onVisited.addListener(updateHistoryEntriesLazy)
chrome.history.onVisitRemoved.addListener(updateHistoryEntriesLazy)

chrome.tabs.onUpdated.addListener(updatetabsEntriesLazy)
chrome.tabs.onMoved.addListener(updatetabsEntriesLazy)
chrome.tabs.onDetached.addListener(updatetabsEntriesLazy)
chrome.tabs.onAttached.addListener(updatetabsEntriesLazy)
chrome.tabs.onRemoved.addListener(updatetabsEntriesLazy)
chrome.tabs.onReplaced.addListener(updatetabsEntriesLazy)

initAllEntries().then(function initialize () {
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
})
