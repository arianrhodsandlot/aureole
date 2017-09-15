// var defaultFavIcon = 'https://www.google.com/s2/favIcons?domain=0'
var defaultFavIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABs0lEQVR4AWL4//8/RRjO8Iucx+noO0O2qmlbUEnt5r3Juas+hsQD6KaG7dqCKPgx72Pe9GIY27btZBrbtm3btm0nO12D7tVXe63jqtqqU/iDw9K58sEruKkngH0DBljOE+T/qqx/Ln718RZOFasxyd3XRbWzlFMxRbgOTx9QWFzHtZlD+aqLb108sOAIAai6+NbHW7lUHaZkDFJt+wp1DG7R1d0b7Z88EOL08oXwjokcOvvUxYMjBFCamWP5KjKBjKOpZx2HEPj+Ieod26U+dpg6lK2CIwTQH0oECGT5eHj+IgSueJ5fPaPg6PZrz6DGHiGAISE7QPrIvIKVrSvCe2DNHSsehIDatOBna/+OEOgTQE6WAy1AAFiVcf6PhgCGxEvlA9QngLlAQCkLsNWhBZIDz/zg4ggmjHfYxoPGEMPZECW+zjwmFk6Ih194y7VHYGOPvEYlTAJlQwI4MEhgTOzZGiNalRpGgsOYFw5lEfTKybgfBtmuTNdI3MrOTAQmYf/DNcAwDeycVjROgZFt18gMso6V5Z8JpcEk2LPKpOAH0/4bKMCAYnuqm7cHOGHJTBRhAEJN9d/t5zCxAAAAAElFTkSuQmCC'

var CONFIG

var service = {}
var sendMessage = function (message) {
  var deferred = m.deferred()
  m.startComputation()
  chrome.runtime.sendMessage(message, function (response) {
    console.log(message)
    response = JSON.parse(response || '{}')
    deferred.resolve(response)
    m.endComputation()
  })
  return deferred.promise
}
service.list = function () {
  return sendMessage({action: 'list'})
}
service.search = function (keyword) {
  return sendMessage({action: 'search', params: {keyword}})
}
service.open = function (entry, target) {
  if (target === 'blank') {
    chrome.tabs.create({url: entry.url})
  } else if (entry.type === 'tab') {
    chrome.tabs.update(entry.tabId, {active: true})
    chrome.windows.update(entry.windowId, {focused: true})
  } else {
    chrome.tabs.update({url: entry.url})
  }
  _.defer(close)
}

var controller = function (data) {
  var ctrl = this

  var selectedEntry

  var testImage = function (src) {
    var deferred = m.deferred()
    if (!src) return deferred.reject().promise
    var img = new Image()
    img.src = src
    img.onload = function () {
      deferred.resolve(src)
    }
    img.onerror = function () {
      deferred.reject()
    }
    return deferred.promise
  }
  var scrollIntoViewIfNeeded = function (el) {
    el.scrollIntoViewIfNeeded()
  }
  var initialize = function (keyword) {
    keyword = _.trim(keyword)
    ctrl.keyword(keyword)
    var getEntries = keyword
      ? service.search(keyword)
      : service.list()

    var updateSelectedEntry = function (entries) {
      selectedEntry = entries[0]
      return entries
    }

    ctrl.entries = m.prop(getEntries
      .then(updateSelectedEntry))
  }

  ctrl.keyword = m.prop('')
  ctrl.entries = m.prop(null)

  var search = m.withAttr('value', initialize)
  ctrl.search = _.debounce(search, 100)
  ctrl.open = function (e) {
    e.preventDefault()
    var target = CONFIG.openInNewTab ? 'blank' : 'self'
    service.open(selectedEntry, target)
  }
  ctrl.tryToOpen = function (e) {
    if (e.keyCode !== 13) return
    e.preventDefault()
    var openInNewTab = selectedEntry.type === 'tab' ? false : CONFIG.openInNewTab
    if (e.shiftKey) openInNewTab = !openInNewTab
    var target = openInNewTab ? 'blank' : 'self'
    service.open(selectedEntry, target)
  }
  ctrl.isSelected = function (entry) {
    return entry === selectedEntry
  }
  ctrl.select = function (entry) {
    return function () {
      selectedEntry = entry
    }
  }
  ctrl.nav = function (e) {
    if (e.keyCode !== 38 && e.keyCode !== 40) return

    e.preventDefault()
    var entries = ctrl.entries()
    var nextIndex = entries.indexOf(selectedEntry)
    var maxIndex = entries.length - 1
    switch (e.keyCode) {
      case 38:
        nextIndex -= 1
        if (nextIndex < 0) nextIndex = maxIndex
        break
      case 40:
        nextIndex += 1
        if (nextIndex > maxIndex) nextIndex = 0
        break
    }
    ctrl.select(entries[nextIndex])()
  }

  var getCachedFavIconByDomain = function (domain) {
    var favIconCaches = JSON.parse(localStorage.favIconCaches)
    return favIconCaches[domain]
  }
  var setCachedFavIconByDomain = function (domain, favIconUrl) {
    var favIconCaches = JSON.parse(localStorage.favIconCaches)
    favIconCaches[domain] = favIconUrl
    localStorage.favIconCaches = JSON.stringify(favIconCaches)
  }
  var testingDomains = []
  var redrawLazy = _.debounce(m.redraw, 100)
  var updateCachedFavIcon = function (domain, knownFavicon) {
    if (_.includes(testingDomains, domain)) return

    testingDomains.push(domain)
    testImage(knownFavicon)
      .then(_.identity, function () {
        return testImage(domain + '/favicon.ico')
      })
      .then(_.identity, function () {
        var googleFavIconServer = 'https://www.google.com/s2/favicons'
        return testImage(googleFavIconServer + '?domain=' + domain)
      })
      .then(_.identity, _.constant(defaultFavIcon))
      .then(function (favIconUrl) {
        setCachedFavIconByDomain(domain, favIconUrl)
        _.pull(testingDomains, domain)
        redrawLazy()
      })
  }
  var getDomainFromUrl = _.memoize(function (url) {
    try {
      return new URL(url).origin
    } catch (e) {
      return '0'
    }
  })
  ctrl.getFavIcon = function (entry) {
    var deferred = m.deferred()
    var domain = getDomainFromUrl(entry.url)

    var cachedFavIcon = getCachedFavIconByDomain(domain)
    if (cachedFavIcon) return cachedFavIcon

    updateCachedFavIcon(domain, entry.favIconUrl)
    return defaultFavIcon
  }
  ctrl.scrollIntoViewIfNeeded = function (entry) {
    return ctrl.isSelected(entry) ? scrollIntoViewIfNeeded : _.noop
  }
  ctrl.highlight = function (text, keyword) {
    return _.map(text, function (char) {
      keychar = keyword.substring(0, 1).toLowerCase()
      const matched = keyword !== '' &&
        char.toLowerCase() === keychar
      if (matched) keyword = keyword.substring(1)
      return {char, matched}
    })
  }
  var currentWindowId
  chrome.windows.getCurrent({}, function (win) {
    currentWindowId = win.id
  })
  ctrl.isEntryInCurrentWindow = function (entry) {
    return entry.windowId === currentWindowId
  }

  initialize()
}

var view = function (ctrl) {
  var entries = ctrl.entries()
  var highlight = function (text) {
    if (!text) return ''
    var keyword = ctrl.keyword()
    if (!keyword) return text
    var highlighted = ctrl.highlight(text, keyword)
    return _.map(highlighted, function (item) {
      var tag = item.matched ? 'i' : 'span'
      return m(tag, item.char)
    })
  }

  var entriesView = _.map(entries, function (entry, i) {
    var entryClasses = ''
    if (ctrl.isSelected(entry)) entryClasses += 'selected'

    var faIconClassName
    var entryInfo
    switch (entry.type) {
      case 'bookmark':
        faIconClassName = 'fa-star'
        entryInfo = highlight(entry.path + entry.title)
        break
      case 'history':
        faIconClassName = 'fa-clock-o'
        if (entry.visitCount >= 3) {
          entryInfo = i18n('YOU_VE_VISITED_THIS_PAGE_MANY_TIMES')
        } else {
          entryInfo = i18n('YOU_VE_VISITED_THIS_PAGE')
        }
        break
      case 'tab':
        faIconClassName = 'fa-folder-open'
        entryInfo = ctrl.isEntryInCurrentWindow(entry)
          ? i18n('THE_TAB_IS_IN_THE_WINDOW_YOU_ARE_USING_NOW')
          : i18n('THE_TAB_IS_IN_AN_OTHER_WINDOW')
        break
    }

    var highlightedUrl = highlight(entry.url)

    return m('li.entry', {
      class: entryClasses,
      onmousedown: ctrl.select(entry),
      onclick: ctrl.open,
      config: ctrl.scrollIntoViewIfNeeded(entry)
    }, m('a', {href: entry.url}, [
      m('.icons', [
        m('img.favicon', {src: ctrl.getFavIcon(entry)}),
        m(`i.type.fa.${faIconClassName}`)
      ]),
      m('.main', [
        m('.title', entry.title ? highlight(entry.title) : highlightedUrl),
        m('.url', highlightedUrl),
        m('.info', entryInfo)
      ])
    ]))
  })

  var noMatchesView = m('.no-matches', i18n('NO_MATCHES'))

  return [
    m('.container.' + CONFIG.theme + '-theme', {onkeydown: ctrl.nav, tabindex: '1'}, [
      m('form', [
        m('input.keyword', {autofocus: true, oninput: ctrl.search, onkeydown: ctrl.tryToOpen})
      ]),
      m('ul.entries', _.isEmpty(entries) ? noMatchesView : entriesView)
    ])
  ]
}

try {
  JSON.parse(localStorage.favIconCaches)
} catch (e) {
  localStorage.favIconCaches = JSON.stringify({})
}

document.addEventListener('DOMContentLoaded', function() {
  _.defer(function () { // wait for popup window finish it's animation when in macOS
    Demiurge.getUserStorage().then((userStorage) => {
      CONFIG = userStorage
      console.log(CONFIG)
      m.mount(document.getElementById('aureole'), {controller, view})
    })
  })
})
