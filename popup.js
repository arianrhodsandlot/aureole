var service = function (message) {
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
  return service({action: 'list'})
}
service.search = function (keyword) {
  return service({action: 'search', params: {keyword}})
}
service.open = function (url) {
  return service({action: 'open', params: {url}})
}

var controller = function (data) {
  var ctrl = this

  var selectedEntry

  var testImage = function (src) {
    var deferred = m.deferred()
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
  ctrl.open = function () {
    service.open(selectedEntry.url)
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
  ctrl.getFavicon = function (url) {
    var faviconCaches = JSON.parse(localStorage.faviconCaches)
    var domain = '0'
    var googleFaviconServer = 'https://www.google.com/s2/favicons'

    try {
      domain = new URL(url).origin
    } catch (e) {}

    var cachedFavicon = faviconCaches[domain]
    if (cachedFavicon) {
      var deferred = m.deferred()
      deferred.resolve(cachedFavicon)
      m.redraw()
      return deferred.promise
    }

    return testImage(domain + '/favicon.ico')
      .then(_.identity, function () {
        return testImage(googleFaviconServer + '?domain=' + domain)
      })
      .then(_.identity, function () {
        var defaultGoogleFavicon = googleFaviconServer + '?domain=0'
        return testImage(defaultFavicon)
      })
      .then(_.identity, function () {
        var defaultLocalFavicon = 'xxx'
        return defaultFavicon
      })
      .then(function (src) {
        m.redraw()
        faviconCaches[domain] = src
        localStorage.faviconCaches = JSON.stringify(faviconCaches)
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

  initialize()
}

var view = function (ctrl) {
  var highlight = function (text, keyword) {
    var keyword = ctrl.keyword()
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
      m('ul.entries', _.map(ctrl.entries(), function (entry) {
        var entryClasses = ''
        var favicon

        if (ctrl.isSelected(entry)) entryClasses += 'selected'
        ctrl.getFavicon(entry.url).then(function (src) {
          favicon = src
        })

        return m('li.entry', {
          class: entryClasses,
          onmousedown: ctrl.select(entry),
          onclick: ctrl.open,
          config: ctrl.scrollIntoViewIfNeeded(entry)
        }, [
          m('img.favicon', {src: favicon}),
          m('.title', highlight(entry.title)),
          m('.path', highlight(entry.path + entry.title)),
          m('.url', highlight(entry.url))
        ])
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
  m.mount(document.body, {controller, view})
})
