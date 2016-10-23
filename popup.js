
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
  window.ctrl=ctrl

  var selectedEntry
  var updateSelectedEntry = function (entries) {
    selectedEntry = entries[0]
    return entries
  }

  ctrl.keyword = m.prop('')
  ctrl.entries = m.prop(service.list().then(updateSelectedEntry))

  ctrl.search = m.withAttr('value', function (keyword) {
    ctrl.entries = m.prop(service.search(keyword).then(updateSelectedEntry))
  })
  ctrl.open = _.constant(function () {
    service.open(selectedEntry.url)
  })
  ctrl.isSelected = function (entry) {
    return entry === selectedEntry
  }
  ctrl.select = function (entry) {
    return function () {
      console.log(entry)
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
}

var view = function (ctrl) {
  return [
    m('form', {onsubmit: ctrl.open()}, [
      m('input.keyword', {autofocus: true, oninput: ctrl.search, onkeydown: ctrl.nav}),
    ]),
    m('ul', _.map(ctrl.entries(), function (entry) {
      return m('li.entry', {
        class: ctrl.isSelected(entry) ? 'selected' : null,
        onclick: ctrl.open(),
        onmouseover: ctrl.select(entry)
      }, [
        m('div.title', entry.title),
        m('div.path', entry.path + entry.title)
      ])
    }))
  ]
}

document.addEventListener('DOMContentLoaded', function() {
  m.mount(document.body, {controller, view})
})
