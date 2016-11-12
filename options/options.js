var CONFIG
try {
  CONFIG = JSON.parse(localStorage.CONFIG)
} catch (e) {
  CONFIG = {}
}

var getAsideView = function () {
  var route = m.route()
  return m('aside', [
    m('h1', 'Aureole'),
    m('nav.navs', [
      m('a.nav[href=welcome]', {
        class: route === 'welcome' ? 'active' : null,
        config: m.route
      }, i18n('Welcome')),
      m('a.nav[href]', {
        class: route === '' ? 'active' : null,
        config: m.route
      }, i18n('Settings')),
      m('a.nav.about[href=about]', {
        class: route === 'about' ? 'active' : null,
        config: m.route
      }, i18n('About'))
    ])
  ])
}

var getMainView = function (content) {
  return m('.main', content)
}

document.addEventListener('DOMContentLoaded', function() {
  var firstLoad = true
  m.route.mode = 'search'
  m.route(document.getElementById('option'), '', {
    welcome: {
      controller: function () {
        var ctrl = this
        ctrl.openChromeExtentionsPage = function (e) {
          e.preventDefault()
          chrome.tabs.create({url:'chrome://extensions/#footer-section'})
        }
      },
      view: function (ctrl) {
        return [
          getAsideView(),
          getMainView([
            m('h3', i18n('WELCOME')),
            m('.content', [
              m('.thanks', i18n('THANKS_FOR_INSTALLING_AUREOLE', '.')),
              m('.overview', [
                m('p', i18n('AUREOLE_IS', '.')),
                m('p', i18n('WITH_AUREOLE', '.'))
              ]),
              m('.howtouse', [
                m('b', i18n('ATTENTION', ':')),
                i18n('WARNING_OF_ENABLE_CTRL_P')
              ]),
              m('ol.steps', [
                m('li.step', [
                  i18n('OPEN'),
                  m('a', {
                    href: 'chrome://extensions/',
                    target: '_blank',
                    onclick: ctrl.openChromeExtentionsPage
                  }, 'chrome://extensions/'),
                  i18n(';')
                ]),
                m('li.step', i18n('SCROLL_TO', ';')),
                m('li.step', i18n('ENTER_CTRL_P', '.')),
              ])
            ])
          ])
        ]
      }
    },
    '': {
      controller: function () {
        var ctrl = this

        var updateConfig = function (key, value) {
          CONFIG[key] = value
          localStorage.CONFIG = JSON.stringify(CONFIG)
          m.redraw()
        }

        ctrl.updateTheme = function (theme) {
          updateConfig('theme', theme)
        }
      },
      view: function (ctrl) {
        return [
          getAsideView(),
          getMainView([
            m('h3', i18n('SETTINGS')),
            m('.content', [
              m('.row', [
                m('label', i18n('THEME', ':')),
                m('select', {
                  onchange: m.withAttr('value', ctrl.updateTheme),
                  value: CONFIG.theme
                }, [
                  m('option', {value: 'light'}, i18n('LIGHT')),
                  m('option', {value: 'dark'}, i18n('DARK'))
                ])
              ])
            ])
          ])
        ]}
    },
    about: {
      controller: _.noop,
      view: function () {
        return [
          getAsideView(),
          getMainView([
            m('h3', i18n('ABOUT')),
            m('.content', [
              m('img', {src:''}),
              m('h4', 'Aureole'),
              m('.info', i18n('A_SUPER_NAVIGATOR_FOR_YOUR_BROWSER')),
              m('.version', i18n('VERSION', ':') + '1.0.0'),
              m('.open-source', m('span', i18n('AUREOLE_IS_AN_OPEN_SOURCE_SOFTWARE', '.')))
            ])
          ])
        ]
      }
    },
  })
})

document.title = i18n('Settings')
