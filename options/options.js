var config
try {
  config = JSON.parse(localStorage.config)
} catch (e) {
  config = {}
}

var controller = function (data) {
  var ctrl = this

  var initialize = function () {
  }

  initialize()
}

var view = function (ctrl) {
  var configView = [
    m('div', [
      m('label', i18n('Theme')),
      m('select', [
        m('option', {value: 'light'}, i18n('Light')),
        m('option', {value: 'dark'}, i18n('Dark'))
      ])
    ]),
    m('div', [
      m('label', i18n('Language')),
      m('select', [
        m('option', {value: 'en-US'}, 'English'),
        m('option', {value: 'zh-CN'}, '简体中文')
      ])
    ])
  ]

  var aboutView = [
    m('img', {src:''}),
    m('div', 'Aureole'),
    m('div', 'A Super Navigator For Your Browser'),
  ]

  return [
    m('h1', 'Aureole'),
    m('aside', [
      m('a', i18n('Options')),
      m('a', i18n('About'))
    ]),
    m('.main', aboutView)
  ]
}

document.addEventListener('DOMContentLoaded', function() {
  m.mount(document.getElementById('option'), {controller, view})
})

document.title = i18n('optioins')
