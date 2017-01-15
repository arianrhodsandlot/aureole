var CONFIG

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

var render = function() {
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
        var needShowAttention = navigator.userAgent.toLowerCase().indexOf('mac os x') === -1
        document.title = i18n('WELCOME')
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
              needShowAttention ?
              m('div', [
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
              : null
            ])
          ])
        ]
      }
    },
    '': {
      controller: function () {
        var ctrl = this

        var updateConfig = function (key, value) {
          config.set(key, value).then(loadConfig).then(m.redraw)
        }

        ctrl.updateTheme = function (theme) {
          updateConfig('theme', theme)
        }

        ctrl.updateOpenInNewTab = function (checked) {
          updateConfig('openInNewTab', checked)
        }
      },
      view: function (ctrl) {
        document.title = i18n('SETTINGS')
        return [
          getAsideView(),
          getMainView([
            m('h3', i18n('SETTINGS')),
            m('.content', [
              m('.row', [
                m('label.theme-label', i18n('THEME', ':')),
                m('select', {
                  onchange: m.withAttr('value', ctrl.updateTheme),
                  value: CONFIG.theme
                }, [
                  m('option', {value: 'light'}, i18n('LIGHT')),
                  m('option', {value: 'dark'}, i18n('DARK'))
                ])
              ]),
              m('.row', [
                m('label', [
                  m('input', {
                    type: 'checkbox',
                    onchange: m.withAttr('checked', ctrl.updateOpenInNewTab),
                    checked: CONFIG.openInNewTab
                  }),
                  m('span', i18n('OPEN_IN_NEW_TAB')),
                  m('small', i18n('(', CONFIG.openInNewTab ? 'OPEN_IN_CURRENT_TAB_WITH_SHIFT' : 'OPEN_IN_NEW_TAB_WITH_SHIFT', ')'))
                ])
              ])
            ])
          ])
        ]}
    },
    about: {
      controller: _.noop,
      view: function () {
        document.title = i18n('ABOUT')
        return [
          getAsideView(),
          getMainView([
            m('h3', i18n('ABOUT')),
            m('.content', [
              m('h4', [
                m('img.icon', {src: '../../icon/icon48.png'}),
                'Aureole',
                ' - ',
                m('span.info', i18n('A_SUPER_NAVIGATOR_FOR_YOUR_BROWSER'))
              ]),
              m('.version', i18n('VERSION', ':') + '1.0.0'),
              m('.open-source', [
                m('span', i18n('AUREOLE_IS_AN_OPEN_SOURCE_SOFTWARE', '.')),
                m('span', [
                  i18n('GET_SOURCE'),
                  m('a', {href: 'http://github.com/arianrhodsandlot/Aureole'}, 'GitHub'),
                  i18n('GET_SOURCE_TRAILING_WORDS', '.')
                ])
              ])
            ])
          ])
        ]
      }
    },
  })
}

var loadConfig = function () {
  return config.load('openInNewTab', 'theme')
    .then(function (results) {
      CONFIG = results
    })
}

document.addEventListener('DOMContentLoaded', function () {
  loadConfig().then(render)
})
