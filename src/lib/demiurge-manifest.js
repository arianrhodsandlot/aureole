Demiurge(Demiurge.i18n({
  title: 'Aureole的选项',
  sections: [{
    title: '设置',
    rows: [[{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'format_color_fill' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: 'THEME' }
    }, {
      type: Demiurge.constants.cellTypes.input,
      ui: {
        type: Demiurge.constants.inputTypes.select,
        hintText: 'CHOOSE_A_THEME',
        options: [{text: Demiurge.i18n('LIGHT'), value: 'light'}, {text: Demiurge.i18n('DARK'), value: 'dark'}]
      },
      storage: { key: 'theme', default: 'light' }
    }], [{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'reorder' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: Demiurge.i18n('OPEN_IN_NEW_TAB'), subtitle: 'OPEN_IN_NEW_TAB_SUBTITLE' }
    }, {
      type: Demiurge.constants.cellTypes.input,
      ui: {
        type: Demiurge.constants.inputTypes.checkbox,
        label: Demiurge.i18n('OPEN_IN_NEW_TAB')
      },
      storage: { key: 'openInNewTab', default: true }
    }]]
  }, {
    title: 'SHORTCUT',
    rows: [[{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'keyboard' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: 'SHORTCUT', subtitle: 'SHORTCUT_SUBTITLE' }
    }, {
      type: Demiurge.constants.cellTypes.button,
      ui: {
        label: 'CONFIGURE_SHORTCUTS',
        link: 'chrome://extensions/configureCommands'
      }
    }]]
  }, {
    title: 'ABOUT',
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
      ui: { label: 'REVIEW', link: 'https://chrome.google.com/webstore/detail/aureole/plfglniepgcommenlfbniohcknjdcdjd/reviews?utm_source=chrome-ntp-icon', cols: 3 }
    }, {
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'help_outline' }
    }, {
      type: Demiurge.constants.cellTypes.button,
      ui: { label: 'FEEDBACK', link: 'https://github.com/arianrhodsandlot/Aureole/issues/new', cols: 3 }
    }, {
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'code' }
    }, {
      type: Demiurge.constants.cellTypes.button,
      ui: { label: 'SOURCE_CODE', link: 'https://github.com/arianrhodsandlot/Aureole', cols: 3 }
    }]]
  }]
}))
