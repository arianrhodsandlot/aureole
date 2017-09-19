Demiurge({
  title: 'Aureole的选项',
  sections: [{
    title: '设置',
    rows: [[{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'format_color_fill' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: Demiurge.i18n('THEME') }
    }, {
      type: Demiurge.constants.cellTypes.input,
      ui: {
        type: Demiurge.constants.inputTypes.select,
        hintText: '请选择主题',
        options: [{text: Demiurge.i18n('LIGHT'), value: 'light'}, {text: Demiurge.i18n('DARK'), value: 'dark'}]
      },
      storage: { key: 'theme', default: 'light' }
    }], [{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'reorder' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: Demiurge.i18n('OPEN_IN_NEW_TAB'), subtitle: '启用时，按Shift在当前标签打开；禁用时，按Shift在新标签打开' }
    }, {
      type: Demiurge.constants.cellTypes.input,
      ui: {
        type: Demiurge.constants.inputTypes.checkbox,
        label: Demiurge.i18n('OPEN_IN_NEW_TAB')
      },
      storage: { key: 'openInNewTab', default: true }
    }]]
  }, {
    title: '快捷键',
    rows: [[{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'keyboard' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: '快捷键', subtitle: '在浏览器的设置中自定义你希望使用的快捷键（如Ctrl + P）' }
    }, {
      type: Demiurge.constants.cellTypes.button,
      ui: {
        label: '去设置',
        link: 'chrome://extensions/configureCommands'
      }
    }]]
  }, {
    title: '关于',
    rows: [[{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'info_outline' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: 'Aureole 1.0.1', subtitle: Demiurge.i18n('AUREOLE_IS'), cols: 10 }
    }], [{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'star' }
    }, {
      type: Demiurge.constants.cellTypes.button,
      ui: { label: '评价', link: 'https://chrome.google.com/webstore/detail/aureole/plfglniepgcommenlfbniohcknjdcdjd/reviews?utm_source=chrome-ntp-icon', cols: 3 }
    }, {
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'help_outline' }
    }, {
      type: Demiurge.constants.cellTypes.button,
      ui: { label: '反馈问题', link: 'https://github.com/arianrhodsandlot/Aureole/issues/new', cols: 3 }
    }, {
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'code' }
    }, {
      type: Demiurge.constants.cellTypes.button,
      ui: { label: '查看源代码', link: 'https://github.com/arianrhodsandlot/Aureole', cols: 3 }
    }]]
  }]
})
