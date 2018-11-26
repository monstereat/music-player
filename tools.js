var log = function() {
    return console.apply(console, arguments)
}

var e = function(name) {
    return document.querySelector(name)
}

var es = function(name) {
    return document.querySelectorAll(name)
}

var bindEvent = function(element, event) {
    element.addEventListener(event, callback)
}

var appendHtml = function(element, html) {
    element.insertAdjacentHTML('beforeend', html)
}

var toggleClass = function(element, className) {
    if(element.classList.contains(className)) {
        element.classList.removeClass(className)
    } else {
        element.classList.add(className)
    }
}

var removeClassAll = function(className) {
    var selector = '.' + className
    var elements = document.querySelectorAll(className)
    for(var i = 0; i < elements.length; i++) {
        elements[i].removeClass(selector)
    }
}

var bindAll = function(selector, eventName, callback) {
    var elements = document.querySelectorAll(selector)
    for(let i = 0; i < elements.length; i++) {
        bindEvent(elements[i], eventName, callback)
    }
}

// 查找 element 的所有值元素
var findChild = function(element, selector) {
    element.querySelector(selector)
}
