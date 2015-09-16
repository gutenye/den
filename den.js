(function (root, factory) {
	if(typeof exports === "object" && typeof module === "object")
		module.exports = factory()
	else if(typeof define === "function" && define.amd)
		define(factory)
	else if(typeof exports === "object")
		exports["den"] = factory()
	else
		root["den"] = factory()
})(this, function() {
  Den = function(selector) {
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

  Den.prototype.insertAfter = function(newNode, referenceNode) {
    if (this.node === null) {
      return
    }
    this.node.insertBefore(newNode, referenceNode.nextSibling)
  }

  Den.prototype.remove = function() {
    if (this.node === null) {
      return
    }
    this.node.parentNode.removeChild(this.node)
  }

  Den.prototype.closest = function(selector) {
    if (this.node === null) {
      return null
    }
    var node = this.node
    while (node.matches && !node.matches(selector)) { // <#document> does not have maches() function
      node = node.parentNode
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
      node = node.parentNode
    }
    return false
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
    div.innerHTML = html
    return div.firstChild
  }

  ////////////////
  // ¤Selection
  ////////////////

  den.getSelectionStart = function (ownerDocument) {
      var node = ownerDocument.getSelection().anchorNode,
          startNode = (node && node.nodeType === 3 ? node.parentNode : node);
      return startNode;
  }

  return den
})

if (window.$ === undefined && window.$$ === undefined) {
  window.$ = function(selector) { return typeof selector === "string" ? document.querySelector(selector) : selector || null }
  window.$$ = function(selector) { return [].slice.call(document.querySelectorAll(selector)) }
}
