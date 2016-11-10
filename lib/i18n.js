var i18n = (function () {
  var dict = {
    'en-US': [
      'About',
      'Dark',
      'Language',
      'Light',
      'Options',
      'Theme',
      'The tab is in an other window.',
      'The tab is in the window you are using now.',
      'You\'ve visited this page many times.',
      'You\'ve visited this page.'
    ],
    'zh-CN': [
      '关于',
      '暗色',
      '语言',
      '亮色',
      '选项',
      '主题',
      '该标签位于其它窗口中。',
      '该标签位于当前窗口中。',
      '你访问过该网页很多次。',
      '你曾访问过该网页。'
    ]
  }

  return function (text) {
    var CONFIG
    try {
      CONFIG = JSON.parse(localStorage.CONFIG)
    } catch (e) {
      CONFIG = {}
    }
    var pos = dict['en-US'].indexOf(text)
    var result = dict[CONFIG.lang][pos]
    if (!result) {
      result = text
      console.warn('The translation for ' + text + ' is not availabel now.')
    }
    return result
  }
})()
