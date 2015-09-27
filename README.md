den, A DOM utility library that uses native methods and returns native HTMLElement.
================

**Idea**: Native APIs are first-class citizen, always return native HTMLElement.

USAGE
------

```
- node is element or text node
- element is element
- text is text node

if not defined $ and $$, it will define
  window.$ = function(selector) { return typeof selector === "string" ? document.querySelector(selector) : selector || null }
  window.$$ = function(selector) { return [].slice.call(document.querySelectorAll(selector)) }

den("#parent").insertAfter(node, $("#child-a"))
[].slice.call(x.childNodes)
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
- den.keystroke(event) -> "a" "ctrl-a" "ctrl-alt-shift-cmd-a"
```

Install
------

```
$ npm install denjs --save
$ boewr install denjs --save
```

TODO
------

from medium-editor selection.js

```
getSelectedElements: function (doc) {
rangeSelectsSingleNode: function (range) {
getSelectedParentElement: function (range) {
getCaretOffsets: function getCaretOffsets(element, range) {
getSelectionHtml: function getSelectionHtml(doc) {
importSelection: function (selectionState, root, doc, favorLaterSelectionAnchor) {
exportSelection: function (root, doc) {
```

from quill lib/dom.js

```
...
```
