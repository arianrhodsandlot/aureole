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
            m('h3', i18n('Welcome')),
            m('.content', [
              m('.thanks', i18n('Thanks for installing Aureole', '!')),
              m('.overview', [
                m('p', i18n('Aureole is an extention which brings Sublime Text\'s "Ctrl + P" to your browser', '.')),
                m('p', i18n('With Aureole, you can quickly switch between your bookmarks, your browsing history, and opening tabs', '.'))
              ]),
              m('.howtouse', i18n('IMPORTANT: Your browser may use Ctrl + P as a short cut for printing. To enable Ctrl + P for Aureole, follow steps showing bellow', '.')),
              m('ol.steps', [
                m('li.step', [
                  i18n('Open '),
                  m('a', {
                    href: 'chrome://extensions/',
                    target: '_blank',
                    onclick: ctrl.openChromeExtentionsPage
                  }, 'chrome://extensions/'),
                  i18n(';')
                ]),
                m('li.step', i18n('Scroll to the bottom of the page and click short cuts', ';')),
                m('li.step', i18n('Enter Ctrl + P into the input area after "Aureole"', '.')),
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

        ctrl.updateLanguage = function (language) {
          updateConfig('lang', language)
        }
      },
      view: function (ctrl) {
        return [
          getAsideView(),
          getMainView([
            m('h3', i18n('Settings')),
            m('.content', [
              m('.row', [
                m('label', i18n('Theme', ':')),
                m('select', {
                  onchange: m.withAttr('value', ctrl.updateTheme),
                  value: CONFIG.theme
                }, [
                  m('option', {value: 'light'}, i18n('Light')),
                  m('option', {value: 'dark'}, i18n('Dark'))
                ])
              ]),
              m('.row', [
                m('label', i18n('Language', ':')),
                m('select', {
                  onchange: m.withAttr('value', ctrl.updateLanguage),
                  value: CONFIG.lang
                }, [
                  m('option', {value: ''}, i18n('Auto Detect')),
                  m('option', {value: 'en-US'}, 'English'),
                  m('option', {value: 'zh-CN'}, '简体中文')
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
            m('h3', i18n('About')),
            m('.content', [
              m('img', {src:''}),
              m('h4', 'Aureole'),
              m('.info', i18n('A Super Navigator For Your Browser')),
              m('.version', i18n('Version', ':') + '1.0.0'),
              m('.open-source', m('span', i18n('Aureole is an open-source software.')))
            ])
          ])
        ]
      }
    },
  })
})

document.title = i18n('Settings')
