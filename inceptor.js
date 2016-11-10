document.addEventListener('keyup', function (e) {
  console.log(e.ctrlKey, e.keyCode)
  if (e.ctrlKey && e.keyCode === 80) {
    e.preventDefault()
    e.stopPropagation()
    alert('should show popup')
  }
}, false)
