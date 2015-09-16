den, A DOM utility library that uses native methods and returns native HTMLElement.
================

**Idea**: Native APIs are first-class citizen, always return native HTMLElement.

USAGE
------

```
if not defined $ and $$, it will define
  window.$ = function(selector) { return typeof selector === "string" ? document.querySelector(selector) : selector || null }
  window.$$ = function(selector) { return [].slice.call(document.querySelectorAll(selector)) }

den("#parent").insertAfter(node, $("#child-a"))
```

API
----

```
den(selector) -> <#Den>

- closest(selectorString) -> HTMLElement
- isAncestor(ancestorNode)
- insertAfter(newNode, referenceNode)
- remove()

###########
# Class methods
###########

- den.isNode(obj) .. isElement isText isDocument isWindow
- den.isIE(maxVersion) .. isIOS isMac
- den.createElement(htmlText) -> HTMLElement
```

Install
------

```
$ npm install denjs --save
$ boewr install denjs --save
```
