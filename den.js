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
    } else if (selector.nodeType) {
      this.node = selector
    } else { // seletor === null or undefined or other
      this.node = null
    }
  }

  // den("#parent").insertAfter(node, document.querySelector("#a"))
  Den.prototype.insertAfter = function(newNode, referenceNode) {
    if (this.node === null) {
      return
    }
    this.node.insertBefore(newNode, referenceNode.nextSibling)
  }

  // den(x).remove()
  Den.prototype.remove = function() {
    if (this.node === null) {
      return
    }
    this.node.parentNode.removeChild(this.node)
  }

  var den = function(node) {
    return new Den(node)
  }

  // createElement(`<div class="foo">Hello</div>`) -> the div Element
  den.createElement = function(html) {
    var div = document.createElement("div")
    div.innerHTML = html
    return div.firstChild
  }

  return den
})
