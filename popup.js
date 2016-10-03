document.addEventListener('DOMContentLoaded', function(event) {
  var q = function (message) {
    var deferred = m.deferred()
    m.startComputation()
    chrome.runtime.sendMessage(message, function (response) {
      entries = JSON.parse(response)
      deferred.resolve(entries)
      m.endComputation()
    })
    return deferred.promise
  }

  var Entry = {
    list () {
      return q({action: 'list'})
    },
    search (keyword) {
      return q({action: 'list', keyword})
    }
  }

  var controller = function (data) {
    var ctrl = this
    ctrl.keyword = m.prop('')
    ctrl.entries = m.prop([])

    ctrl.search = _.flow(
      m.withAttr('value', ctrl.keyword),
      function () {
        Entry.search(ctrl.keyword).then(ctrl.entries).then(function (r) {
          console.log(r)
        })
      })

    ctrl.open = function () {

    }


    Entry.list().then(ctrl.entries)
  }

  var view = function (ctrl) {
    return [
      m('div', ctrl.keyword()),
      m('input.query', {oninput: ctrl.search}),
      m('ul', _.map(ctrl.entries(), function (entry) {
        return m('li', entry.title || 'lilili')
      }))
    ]
  }
  m.mount(document.body, {controller, view})
})
