var i18n = (function () {
  var dict = {
    'You\'ve visited this page many times.': {
      'zh-CN': '你访问过该网页很多次。'
    },
    'You\'ve visited this page.': {
      'zh-CN': '你曾访问过该网页。'
    },
    'The tab is in the window you are using now.': {
      'zh-CN': '该标签位于当前窗口中。'
    },
    'The tab is in an other window.': {
      'zh-CN': '该标签位于其它窗口中。'
    }
  }

  var config
  try {
    config = JSON.parse(localStorage.config)
  } catch (e) {
    config = {}
  }

  return function (text) {
    var r = _.get(dict, [text, config.lang])
    if (!r) {
      r = text
      console.warn('The translation for ' + text + ' is not availabel now.')
    }
    return r
  }
})()
