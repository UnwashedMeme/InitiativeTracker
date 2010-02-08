//This code is was taken from a public post by Douglas Crockford at http://www.crockford.com/javascript/remedial.html

function isAlien(a) {
   return isObject(a) && typeof a.constructor != 'function';
}

function isArray(a) {
    return isObject(a) && a.constructor == Array;
}

function isBoolean(a) {
    return typeof a == 'boolean';
}

function isEmpty(o) {
    var i, v;
    if (isObject(o)) {
        for (i in o) {
            v = o[i];
            if (isUndefined(v) && isFunction(v)) {
                return false;
            }
        }
    }
    return true;
}

function isFunction(a) {
    return typeof a == 'function';
}

function isNull(a) {
    return typeof a == 'object' && !a;
}

function isNumber(a) {
    return typeof a == 'number' && isFinite(a);
}

function isObject(a) {
    return (a && typeof a == 'object') || isFunction(a);
}

function isString(a) {
    return typeof a == 'string';
}

function isUndefined(a) {
    return typeof a == 'undefined';
} 

