(function (root, factory) {
	if (typeof exports === "object" && typeof module === "object")
		module.exports = factory()
  root["den"] = factory()
})(this, function() {
  var Den = function(selector) {
    if (typeof selector === "string") {
      this.node = document.querySelector(selector)
    } else if (den.isNode(selector)) {
      this.node = selector
    } else { // seletor === null or undefined or other
      this.node = null
    }
  }

  var den = function(selector) {
    return new Den(selector)
  }

  // den(parent).insertAfter(node, reference)
  Den.prototype.insertAfter = function(newNode, referenceNode) {
    if (this.node === null)
      return
    this.node.insertBefore(newNode, referenceNode.nextElementSibling)
  }

  // den(node).insertNextSibling(newNode)
  Den.prototype.insertNextSibling = function(newNode) {
    if (this.node === null)
      return
    den(this.node.parentElement).insertAfter(newNode, this.node)
  }

  // insert child at
  Den.prototype.insertAt = function(newNode, index) {
    if (this.node === null)
      return
    this.node.insertBefore(newNode, this.node.children[index])
  }

  // -> removed node
  // remove self
  Den.prototype.remove = function() {
    if (this.node === null)
      return null
    return this.node.parentElement.removeChild(this.node)
  }

  // -> removed node
  // remove child at
  Den.prototype.removeAt = function(index) {
    if (this.node === null)
      return null
    return this.node.removeChild(this.node.children[index])
  }


  // include current node
  Den.prototype.closest = function(selector) {
    if (this.node === null)
      return null
    var node = this.node
    while (node && !node.matches(selector)) {
      node = node.parentElement
      if (den.isDocument(node))   // <#document> does not have maches() function
        node = null
    }
    return node
  }

  // options: {inclusive: false}
  Den.prototype.isAncestor = function(ancestorNode, options) {
    options = Object.assign({inclusive: false}, options)
    if (this.node === null) {
      return false
    } else if (this.node === ancestorNode) {
      return options.inclusive
    }
    var node = this.node
    while (node) {
      if (node === ancestorNode) {
        return true
      }
      node = node.parentElement
    }
    return false
  }

  // index of parentElement
  Den.prototype.index = function() {
    if (this.node === null)
      return null
    return [].slice.call(this.node.parentElement.children).indexOf(this.node)
  }

  ////////////////
  // Class Methods
  ////////////////

  den.isNode = function(obj) {
    return obj && obj.nodeType
  }

  den.isElement = function(obj) {
    return obj && obj.nodeType === document.ELEMENT_NODE
  }

  den.isText = function(obj) {
    return obj && obj.nodeType === document.TEXT_NODE
  }

  den.isDocument = function(obj) {
    return obj && obj.nodeType === document.DOCUMENT_NODE
  }

  den.isWindow = function(obj) {
    return obj && obj === obj.window
  }

  den.isIE = function(maxVersion) {
    version = document.documentMode
    return version && maxVersion >= version
  }

  den.isIOS = function() {
    return /iPhone|iPad/i.test(navigator.userAgent)
  }

  den.isMac = function() {
    return /Mac/i.test(navigator.platform)
  }

  // createElement(`<div class="foo">Hello</div>`) -> the div Element
  den.createElement = function(html) {
    var div = document.createElement("div")
    div.innerHTML = html.trim()
    return div.firstChild
  }

  ////////////////
  // ¤Selection
  ////////////////

  den.getSelectionAnchorNode = function () {
    var node = getSelection().anchorNode
    if (node === null) {
      return null
    }
    return node.nodeType === document.TEXT_NODE ? node.parentElement : node
  }

  // select(node|selector)
  // select(startNode, startOffset, endNode, endOffset)
  den.select = function(startNode, startOffset, endNode, endOffset) {
    startNode = den(startNode).node
    if (startNode === null)
      return null
    var range = document.createRange()
    if (arguments.length === 1) {
      range.selectNodeContents(startNode)
    } else if (arguments.length === 2) {
      range.setStart(startNode, startOffset)
    } else {
      endNode = den(endNode).node
      range.setStart(startNode, startOffset)
      range.setEnd(endNode, endOffset)
    }
    getSelection().removeAllRanges()
    getSelection().addRange(range)
    return range
  }

  //////////////
  // ¤Cursor
  //////////////

  // moveCursor(node, [offset=0])
  den.moveCursor = function(node, offset) {
    return den.select(node, offset || 0)
  }

  // TODO: from medium-editor selection.js
  // getSelectedElements: function (doc) {
  // rangeSelectsSingleNode: function (range) {
  // getSelectedParentElement: function (range) {
  // getCaretOffsets: function getCaretOffsets(element, range) {
  // getSelectionHtml: function getSelectionHtml(doc) {
  // importSelection: function (selectionState, root, doc, favorLaterSelectionAnchor) {
  // exportSelection: function (root, doc) {

  ///////////
  // ¤keyCode
  //////////
  var keys = {
    8: "backspace",
    9: "tab",
    13: "enter",
    19: "pause",
    20: "capsLock",
    27: "escape",
    32: "space",
    33: "pageup",
    34: "pagedown",
    35: "end",
    36: "home",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    45: "insert",
    46: "delete",
    91: "command",
    93: "rightclick",
    106: "numpadmultiply",
    107: "numpadadd",
    109: "numpadsubtract",
    110: "numpaddot",
    111: "numpaddivide",
    144: "numlock",
    145: "scrolllock",
    182: "mycomputer",
    183: "mycalculator",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
  }
  // lower case chars
  for (var i = 97; i < 123; i++) keys[i-32] = String.fromCharCode(i)
  // numbers
  for (i = 48; i < 58; i++) keys[i] = `${i - 48}`
  // function keys
  for (i = 1; i < 13; i++) keys[i+111] = `f${i}`
  // numpad keys
  for (i = 0; i < 10; i++) keys[i+96] = `numpad${i}`

  // den.keystroke(event) -> "a" "ctrl-a" "ctrl-alt-shift-cmd-a"
  den.keystroke = function(event) {
    var keyCode = event.which || event.keyCode || event.charCode
    var key = keys[keyCode]

    keystroke = ''
    if (event.ctrlKey) {
      keystroke += 'ctrl'
    }
    if (event.altKey) {
      if (keystroke)
        keystroke += '-'
      keystroke += 'alt'
    }
    if (event.shiftKey) {
      // Don't push 'shift' when modifying symbolic characters like '{'
      if (!/^[^A-Za-z]$/.test(key)) {
        if (keystroke)
          keystroke += '-'
        keystroke += 'shift'
      }
    }
    if (event.metaKey) {
      if (keystroke)
        keystroke += '-'
      keystroke += 'cmd'
    }
    if (key) {
      if (keystroke)
        keystroke += '-'
      keystroke += key
    }

    return keystroke
  }

  return den
})

if (window.$ === undefined && window.$$ === undefined) {
  window.$ = function(selector) { return typeof selector === "string" ? document.querySelector(selector) : selector || null }
  window.$$ = function(selector) { return [].slice.call(document.querySelectorAll(selector)) }
}
