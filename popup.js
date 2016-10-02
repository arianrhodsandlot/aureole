$(function () {
  chrome.bookmarks.getTree(function (tree) {
    var items = []
    var path = []
    var dump = function (nodes) {
      _.each(nodes, function (node) {
        path.push(node)
        if (node.children) {
          dump(node.children)
        } else {
          items.push(_.clone(path))
        }
        path.pop()
      })
    }
    dump(tree)
    $('#bookmarks').html(_.map(items, function (item) {
      var itemHtml = '/'
      _.each(item, function (node) {
        if (node.children) {
          if (node.title) {
            itemHtml += node.title + '/'
          }
        } else {
          itemHtml += node.title + '(' + node.url + ')'
        }
      })
      return '<p>' + itemHtml + '</p>'
    }).join(''))
  });
})
