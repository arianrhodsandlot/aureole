var i18n = _.identity
// var defaultFavicon = 'https://www.google.com/s2/favicons?domain=0'
var defaultFavicon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABs0lEQVR4AWL4//8/RRjO8Iucx+noO0O2qmlbUEnt5r3Juas+hsQD6KaG7dqCKPgx72Pe9GIY27btZBrbtm3btm0nO12D7tVXe63jqtqqU/iDw9K58sEruKkngH0DBljOE+T/qqx/Ln718RZOFasxyd3XRbWzlFMxRbgOTx9QWFzHtZlD+aqLb108sOAIAai6+NbHW7lUHaZkDFJt+wp1DG7R1d0b7Z88EOL08oXwjokcOvvUxYMjBFCamWP5KjKBjKOpZx2HEPj+Ieod26U+dpg6lK2CIwTQH0oECGT5eHj+IgSueJ5fPaPg6PZrz6DGHiGAISE7QPrIvIKVrSvCe2DNHSsehIDatOBna/+OEOgTQE6WAy1AAFiVcf6PhgCGxEvlA9QngLlAQCkLsNWhBZIDz/zg4ggmjHfYxoPGEMPZECW+zjwmFk6Ih194y7VHYGOPvEYlTAJlQwI4MEhgTOzZGiNalRpGgsOYFw5lEfTKybgfBtmuTNdI3MrOTAQmYf/DNcAwDeycVjROgZFt18gMso6V5Z8JpcEk2LPKpOAH0/4bKMCAYnuqm7cHOGHJTBRhAEJN9d/t5zCxAAAAAElFTkSuQmCC'

var service = {}
var sendMessage = function (message) {
  var deferred = m.deferred()
  m.startComputation()
  chrome.runtime.sendMessage(message, function (response) {
    response = JSON.parse(response)
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
  if (entry.target === 'blank') {
    chrome.tabs.create({url: entry.url})
  } else if (entry.type === 'tab') {
    chrome.tabs.update(entry.tabId, {active: true})
    chrome.windows.update(entry.windowId, {focused: true})
    _.defer(close)
  } else {
    chrome.tabs.create({url: entry.url})
  }
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

  ctrl.search = m.withAttr('value', initialize)
  ctrl.open = function (e) {
    e.preventDefault()
    var target = 'self'
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
  ctrl.getFavicon = function (entry) {
    var deferred = m.deferred()
    var faviconCaches = JSON.parse(localStorage.faviconCaches)
    var domain = '0'
    var googleFaviconServer = 'https://www.google.com/s2/favicons'
    var url = entry.url
    try {
      domain = new URL(url).origin
    } catch (e) {}

    var cachedFavicon = faviconCaches[domain]
    if (cachedFavicon) {
      deferred.resolve(cachedFavicon)
      m.redraw()
      return deferred.promise
    }

    return testImage(entry.favIconUrl)
      .then(_.identity, function () {
        return testImage(domain + '/favicon.ico')
      })
      .then(_.identity, function () {
        return testImage(googleFaviconServer + '?domain=' + domain)
      })
      .then(_.identity, function () {
        return defaultFavicon
      })
      .then(function (src) {
        faviconCaches[domain] = src
        localStorage.faviconCaches = JSON.stringify(faviconCaches)
        m.redraw()
        return src
      })
  }
  ctrl.scrollIntoViewIfNeeded = function (entry) {
    return function (el) {
      if (!ctrl.isSelected(entry)) return

      scrollIntoViewIfNeeded(el)
    }
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
  chrome.windows.getCurrent({}, function (window) {
    currentWindowId = window.id
  })
  ctrl.isEntryInCurrentWindow = function (entry) {
    return entry.windowId === currentWindowId
  }

  initialize()
}

var view = function (ctrl) {
  var entries = ctrl.entries()
  var highlight = function (text) {
    if (!text) return '-'
    var keyword = ctrl.keyword()
    if (!keyword) return text
    var highlighted = ctrl.highlight(text, keyword)
    return _.map(highlighted, function (item) {
      var tag = item.matched ? 'i' : 'span'
      return m(tag, item.char)
    })
  }
  return [
    m('.container', {onkeydown: ctrl.nav, tabindex: '1'}, [
      m('form', {onsubmit: ctrl.open}, [
        m('input.keyword', {autofocus: true, oninput: ctrl.search})
      ]),
      m('ul.entries', _.map(entries, function (entry) {
        var entryClasses = ''
        // var favicon = 'https://www.google.com/s2/favicons?domain=0'
        var favicon = defaultFavicon

        if (ctrl.isSelected(entry)) entryClasses += 'selected'
        ctrl.getFavicon(entry).then(function (src) {
          favicon = src
        })

        var faIconClassName
        var entryInfo
        switch (entry.type) {
          case 'bookmark':
            faIconClassName = 'fa-star'
            entryInfo = ['Open ', highlight(entry.path + entry.title)]
            break
          case 'history':
            faIconClassName = 'fa-history'
            entryInfo = i18n('Last visit at ') + entry.lastVisitTime
            break
          case 'tab':
            faIconClassName = 'fa-folder-open'
            entryInfo = i18n('Switch to this tab')
            break
        }


        return m('li.entry', {
          class: entryClasses,
          onmousedown: ctrl.select(entry),
          onclick: ctrl.open,
          config: ctrl.scrollIntoViewIfNeeded(entry)
        }, m('a', {href: entry.url}, [
          m('.icons', [
            m('img.favicon', {src: favicon}),
            m(`i.type.fa.${faIconClassName}`)
          ]),
          m('.main', [
            m('.title', highlight(entry.title)),
            m('.url', highlight(entry.url)),
            m('.info', entryInfo)
          ])
        ]))
      }))
    ])
  ]
}

try {
  JSON.parse(localStorage.faviconCaches)
} catch (e) {
  localStorage.faviconCaches = JSON.stringify({})
}

document.addEventListener('DOMContentLoaded', function() {
  _.defer(function () { // wait for popup window finish it's animation when in macOS
    m.mount(document.getElementById('aureole'), {controller, view})
  })
})
