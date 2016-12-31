var i18n = (function () {
  return function () {
    return _.map(arguments, function (text) {
      switch (text) {
        case ':':
          text = 'colon'
          break
        case ',':
          text = 'comma'
          break
        case '.':
          text = 'period'
          break
        case ';':
          text = 'semi'
          break
        case '(':
          text = 'parenthesis_left'
          break
        case ')':
          text = 'parenthesis_right'
          break
      }
      var result = chrome.i18n.getMessage(text)
      if (!result) {
        result = text
        console.warn('The translation for ' + text + ' is not availabel now.')
      }
      return result
    }).join('')
  }
})()
