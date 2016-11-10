var CONFIG
try {
  CONFIG = JSON.parse(localStorage.CONFIG)
} catch (e) {
  CONFIG = {}
}

var controller = function (data) {
  var ctrl = this

  var initialize = function () {
  }

  var updateConfig = function (key, value) {
    CONFIG[key] = value
    localStorage.CONFIG = JSON.stringify(CONFIG)
    m.redraw()
  }

  ctrl.updateTheme = function (theme) {
    updateConfig('theme', theme)
  }

  ctrl.updateLanguage = function (language) {
    updateConfig('lang', language)
  }

  initialize()
}

var view = function (ctrl) {
  var welcomView = [
    m('div', 'Welcom to Aureole!')
  ]

  var configView = [
    m('div', [
      m('label', i18n('Theme')),
      m('select', {
        onchange: m.withAttr('value', ctrl.updateTheme),
        value: CONFIG.theme
      }, [
        m('option', {value: 'light'}, i18n('Light')),
        m('option', {value: 'dark'}, i18n('Dark'))
      ])
    ]),
    m('div', [
      m('label', i18n('Language')),
      m('select', {
        onchange: m.withAttr('value', ctrl.updateLanguage),
        value: CONFIG.lang
      }, [
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
    m('.main', [
      welcomView,
      configView,
      aboutView
    ])
  ]
}

document.addEventListener('DOMContentLoaded', function() {
  m.mount(document.getElementById('option'), {controller, view})
})

document.title = i18n('Options')
