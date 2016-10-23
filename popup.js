
var service = function (message) {
  var deferred = m.deferred()
  m.startComputation()
  chrome.runtime.sendMessage(message, function (response) {
    entries = JSON.parse(response)
    deferred.resolve(entries)
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

  var initialize = function (keyword) {
    keyword = _.trim(keyword)
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
    selectedEntry = entries[nextIndex]
  }

  initialize()
}

var view = function (ctrl) {
  return [
    m('.container', {onkeydown: ctrl.nav, tabindex: '1'}, [
      m('form', {onsubmit: ctrl.open}, [
        m('input.keyword', {autofocus: true, oninput: ctrl.search})
      ]),
      m('ul.entries', _.map(ctrl.entries(), function (entry) {
        return m('li.entry', {
          class: ctrl.isSelected(entry) ? 'selected' : null,
          onclick: ctrl.open,
          onmouseover: ctrl.select(entry)
        }, [
          m('.title', entry.title),
          m('.path', entry.path + entry.title)
        ])
      }))
    ])
  ]
}

document.addEventListener('DOMContentLoaded', function() {
  m.mount(document.body, {controller, view})
})
