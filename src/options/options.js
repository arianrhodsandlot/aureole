Demiurge.onUserStorageChanged(function (key, value) {
  if (key !== 'enableSync') return
  if (value) {
    Demiurge.enableSync()
  } else {
    Demiurge.disableSync()
  }
})

Demiurge.render()
