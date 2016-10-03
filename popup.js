$(function () {
  chrome.runtime.sendMessage({action: 'list'}, function(response) {
    console.log(response)
  })
})

