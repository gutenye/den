"use strict";
(function (root, factory) {
	if (typeof exports === "object" && typeof module === "object")
		module.exports = factory()
  root["den"] = factory()
})(this, function() {
  class Den { //{{{1
    constructor(selector) {
      if (typeof selector === "string") {
        this.node = document.querySelector(selector)
      } else if (den.isNode(selector)) {
        this.node = selector
      } else { // seletor === null or undefined or other
        this.node = null
      }
    }

    replace(newNode) {
      if (!this.node)
        return null
      this.node.parentNode.replaceChild(newNode, this.node)
      return newNode
    }

    // den(x).replaceTag("h1") -> newNode
    // den(x).replaceTag("")   // replace text node
    replaceTag(newTag) {
      if (!this.node)
        return null
      if (this.node.tagName === newTag.toUpperCase())
        return this.node
      var newNode
      if (newTag === "") {
        newNode = document.createTextNode(this.node.textContent)
      } else {
        newNode = document.createElement(newTag)
        newNode.innerHTML = this.node.innerHTML
      }
      for (let attr of this.node.attributes) {
        newNode.setAttribute(attr.name, attr.value)
      }
      return den(this.node).replace(newNode)
    }

    // den(parent).insertAfterElement(node, reference)
    insertAfterElement(newNode, referenceNode) {
      if (this.node === null)
        return
      this.node.insertBefore(newNode, referenceNode.nextElementSibling)
    }

    // den(node).insertNextElementSibling(newNode)
    insertNextElementSibling(newNode) {
      if (this.node === null)
        return
      den(this.node.parentElement).insertAfter(newNode, this.node)
    }

    // den(parent).insertAfter(node, reference)
    insertAfter(newNode, referenceNode) {
      if (this.node === null)
        return
      this.node.insertBefore(newNode, referenceNode.nextSibling)
    }

    // den(node).insertNextSibling(newNode)
    insertNextSibling(newNode) {
      if (this.node === null)
        return
      den(this.node.parentElement).insertAfter(newNode, this.node)
    }

    insertPreviousSibling(newNode) {
      if (this.node === null)
        return
      this.node.parentElement.insertBefore(newNode, this.node)
    }

    // insert child at
    insertAt(newNode, index) {
      if (this.node === null)
        return
      this.node.insertBefore(newNode, this.node.children[index])
    }

    // -> removed node
    // remove self
    remove() {
      if (this.node === null)
        return null
      return this.node.parentElement.removeChild(this.node)
    }

    // -> removed node
    // remove child at
    removeAt(index) {
      if (this.node === null)
        return null
      return this.node.removeChild(this.node.children[index])
    }


    // include current node
    closest(selector) {
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
    isAncestor(ancestorNode, options) {
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
    index() {
      if (this.node === null)
        return null
      return Array.from(this.node.parentElement.children).indexOf(this.node)
    }

    // <a>hello</a><b>world</b>
    //   den(a).extend(b)  -> <a>helloworld</a>
    extend(other) {
      if (!this.node)
        return
      this.node.innerHTML += other.innerHTML
      den(other).remove()
    }

    // <a>hello</a><b>world</b>
    //   den(b).prepend(a)  -> <b>helloworld</b>
    prepend(other) {
      if (!this.node)
        return
      this.node.innerHTML = other.innerHTML + this.node.innerHTML
      den(other).remove()
    }
  }
  //}}}1

  var den = function(selector) {
    return new Den(selector)
  }

  den.INLINE_TAGS = ["B", "I", "U", "STRIKE", "A"]

  // ¤Selection //{{{1
  ////////////////

  den.hasSelection = function() {
    return getSelection().rangeCount > 0 && !getSelection().isCollapsed
  }

  // -> "forward" backward
  den.getSelectionDirection = function() {
    var sel = getSelection()
    var position = sel.anchorNode.compareDocumentPosition(sel.focusNode)
    var backward = false
    // position == 0 if nodes are the same
    if (!position && sel.anchorOffset > sel.focusOffset || position === Node.DOCUMENT_POSITION_PRECEDING)
      backward = true

    return backward ? "backward" : "forward"
  }

  // den.getSelectionRect() -> {anchorNode, anchorOffset, focusNode, focusOffset}
  // convert backward selection to forward.
  den.getSelectionRect = function() {
    var sel = getSelection()
    if (den.getSelectionDirection() === "forward") {
      return {
        anchorNode: sef.anchorNode,
        anchorOffset: sel.anchorOffset,
        focusNode: sel.focusNode,
        focusOffset: sef.focusOffset
      }
    } else {
      return {
        anchorNode: sef.focusNode,
        anchorOffset: sel.focusOffset,
        focusNode: sel.anchorNode,
        focusOffset: sef.anchorOffset
      }
    }
  }

  // den.getSelectionAnchorElement() -> always return element, not text node
  den.getSelectionAnchorElement = function () {
    var node = getSelection().anchorNode
    if (node === null) {
      return null
    }
    return den.isText(node) ? node.parentElement : node
  }

  den.getSelectionFocusElement = function () {
    var node = getSelection().focusNode
    if (node === null) {
      return null
    }
    return den.isText(node) ? node.parentElement : node
  }

  // den.splitSelection() -> <densplit>
  //    <b>hello</b>  -> <b>he<densplit>ll</densplit>o</b>
  //         ~~
  //
  //
  // depends den.INLINE_TAGS
  den.splitSelection = function() {
    // hello <b>world</b> guten                    case 1: split text
    //   ~~~                                       -> he<denslipt>llo</denslipt>
    //   ~~~~~~~~~~~~~~~~~~~~~~                    -> he<denslipt>llo <b>world</b> guten</densplit>
    //            ~~                               -> ..
    //           ~~~~~                             -> hello <b><denslipt>world</denslipt></b> guten
    //
    // hello <b>world</b> <b>guten</b>             case 2: split element
    //   ~~~~~~~~                                  -> he<densplit>llo <b>w</b><densplit><b>orld</b>
    //         ~~~~~~~~~~~~~~                      -> ..

    if (!den.hasSelection())
      return null

    var text1 = getSelection().anchorNode
    var element1 = text1.parentNode
    var text1Offset = getSelection().anchorOffset
    var text2 = getSelection().focusNode
    var element2 = text2.parentNode
    var text2Offset = getSelection().focusOffset

    // node1 = text1 or element1
    // case 1: split text
    var node1 = text1
    var node2 = text2
    if (element1 !== element2) {
      // case 2: split element
      if (den.INLINE_TAGS.indexOf(element1.tagName) !== -1)
        node1 = element1
      if (den.INLINE_TAGS.indexOf(element2.tagName) !== -1)
        node2 = element2
    }

    var newNode2, newNode3
    if (den.getSelectionDirection() === "forward") {
      newNode3 = den.split(node2, text2Offset)
      newNode2 = den.split(node1, text1Offset)
    } else {
      newNode3 = den.split(node1, text1Offset)
      newNode2 = den.split(node2, text2Offset)
    }

    var densplit = den.wrap(newNode2, newNode3, "densplit")
    // remove empty text nodes
    densplit.parentNode.normalize()
    return densplit
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

  // moveCursor(node, [offset=0])
  den.moveCursor = function(node, offset) {
    return den.select(node, offset || 0)
  }
  //}}}1
  // ¤keystroke //{{{1
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

    var keystroke = ''
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
  //}}}1

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

  // den.wrap(startNode, endNode, tagName|node)
  //
  // Example:
  //
  // den.wrap(startNode, endNode, "p") -> wrapper
  //    <div> 1 </div>              wrap(1, 1, "b")            -> <div> <b>1</b> </div>
  //    <div> 1 <a>2</a> 3 </div>   wrap(<a>2</a>, 3, "b")     -> <div> 1 <b><a>2</a> 3</b> </div>
  //
  // den.wrap(startNode, null, "p")     from startNode to end siblings
  den.wrap = function(startNode, endNode, wrapper) {
    var nodes = []
    var current = startNode
    while (current !== endNode) {
      var next = current.nextSibling
      nodes.push(current)
      current = next
    }

    wrapper = den.isNode(wrapper) ? wrapper : document.createElement(wrapper)
    den(nodes[0]).insertPreviousSibling(wrapper)
    for (let node of nodes) {
      wrapper.appendChild(node)
    }
    return wrapper
  }

  // split element or text node.
  // split(text)
  //    "hello"        -> "llo"                it becomes "he" "llo"
  //       ^
  // split(element)
  //    <b>hello</b>   -> <b>llo</b>           it becomes <b>he</b><b>llo</b>
  den.split = function(node, offset) {
    // split Text Node
    if (den.isText(node)) {
      return node.splitText(offset)

    // split Element Node
    //
    // <b>hello</b>
    //      ^
    // 1. node is <b>hello</b>
    // 2. right is <b></b>         by cloneNode(false)
    // 3. <b>hello</b><b></b>      insert right to left's nextSibling
    // 4. <b>he</b><b>llo</b>      all right child siblings are moved into right.
    } else {
      var right = node.cloneNode(false)
      den(node).insertNextSibling(right)
      var childRight = node.firstChild.splitText(offset)
      while (childRight !== null) {
        var nextRight = childRight.nextSibling
        right.appendChild(childRight)
        childRight = nextRight
      }
      // remove empty text node
      if (node.nextSibling.textContent === "") {
        den(node.nextSibling).remove()
      }
      return right
    }
  }

  return den
})

if (window.$ === undefined && window.$$ === undefined) {
  window.$ = function(selector) { return typeof selector === "string" ? document.querySelector(selector) : selector || null }
  window.$$ = function(selector) { return Array.from(document.querySelectorAll(selector)) }
}
// vim: fdm=marker commentstring=//%s
