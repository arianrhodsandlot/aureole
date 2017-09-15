const __ = Demiurge.i18n
Demiurge({
  title: 'XXX的选项',
  sections: [{
    title: '设置',
    rows: [[{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'format_color_fill' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: __('THEME') }
    }, {
      type: Demiurge.constants.cellTypes.input,
      ui: {
        type: Demiurge.constants.inputTypes.select,
        hintText: '请选择主题',
        options: [{text: __('LIGHT'), value: 'light'}, {text: __('DARK'), value: 'dark'}]
      },
      model: { key: 'theme', default: 'light' }
    }], [{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'reorder' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: '是否新标签打开', subtitle: '启用时，按Shift在当前标签打开；禁用时，按Shift在新标签打开' }
    }, {
      type: Demiurge.constants.cellTypes.input,
      ui: {
        type: Demiurge.constants.inputTypes.checkbox,
        label: '显示'
      },
      model: { key: 'showContextMenu', default: true }
    }], [{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'sync' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: '同步设置' }
    }, {
      type: Demiurge.constants.cellTypes.input,
      ui: {
        disabled: !Demiurge.isSyncAvailable(),
        type: Demiurge.constants.inputTypes.checkbox,
        label: '同步'
      },
      model: { key: 'enableSync', default: false }
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
        link: 'vivaldi://settings/help'
      }
    }]]
  }, {
    title: '关于',
    rows: [[{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'info_outline' }
    }, {
      type: Demiurge.constants.cellTypes.head,
      ui: { title: 'XXX 0.1.0', subtitle: 'a', cols: 10 }
    }], [{
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'star' }
    }, {
      type: Demiurge.constants.cellTypes.button,
      ui: { label: '评价', link: 'http://github.com/xxx', cols: 3 }
    }, {
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'help_outline' }
    }, {
      type: Demiurge.constants.cellTypes.button,
      ui: { label: '反馈问题', link: 'http://github.com/xxx', cols: 3 }
    }, {
      type: Demiurge.constants.cellTypes.icon,
      ui: { icon: 'code' }
    }, {
      type: Demiurge.constants.cellTypes.button,
      ui: { label: '查看源代码', link: 'http://github.com/xxx', cols: 3 }
    }]]
  }]
})
.onUserStorageLoaded(function (userStorage) {
  if (userStorage.enableSync) {
    Demiurge.enableSync().then(() => {
      Demiurge.render()
    })
  } else {
    Demiurge.disableSync().then(() => {
      Demiurge.render()
    })
  }
})
.onUserStorageChanged(function (key, value) {
  if (key !== 'enableSync') return
  if (value) {
    Demiurge.enableSync()
  } else {
    Demiurge.disableSync()
  }
})
