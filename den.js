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
    this.node = document.querySelector(selector)
  }

  //
  // den("#parent").insertAfter(node, document.querySelector("#a"))
  //
  Den.prototype.insertAfter = function(newNode, referenceNode) {
    this.node.insertBefore(newNode, referenceNode.nextSibling)
  }

  var den = function(node) {
    return new Den(node)
  }

  //
  // createElement(`<div class="foo">Hello</div>`) -> the div Element
  //
  den.createElement = function(html) {
    var div = document.createElement("div")
    div.innerHTML = html
    return div.firstChild
  }

  return den
})
