/**
 * 
 */
// http://javascript.crockford.com/inheritance.html

Function.prototype.inherit = function (parent) {
	var d = {}, p = (this.prototype = new parent());
	this.prototype.callSuper = function (name) {
		if (!(name in d)) {
			d[name] = 0;
		}		
		var f, r, t = d[name], v = parent.prototype;
		if (t) {
			while (t) {
				v = v.constructor.prototype;
				t -= 1;
			}
			f = v[name];
		} else {
			f = p[name];
			if (f == this[name]) {
				f = v[name];
			}
		}
		d[name] += 1;
		r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
		d[name] -= 1;
		return r;
	};
	return this;
};

Function.prototype.implement = function (interfaze, implementations) {
	if (!this.prototype.$superInterface) {
		this.prototype.$superInterface = {};
	}
	for (var methodName in interfaze.prototype) {
		if (!Object.prototype.hasOwnProperty(methodName)) {
			if (!this.prototype[methodName] &&	// not already implemented  
					implementations[methodName] instanceof Function) {
				(function (implementation) {
					this.prototype[methodName] = function () {
						return implementation.apply(this, arguments);
					};
				}).call(this, implementations[methodName]);
			} else {
				throw new UnimplementedError("Method " + methodName + " not implemented");
			}
		}
	}
	this.prototype.$superInterface[interfaze] = true;
	var implementedInterface = this.prototype.$superInterface;
	this.prototype.implemented = function (interfaze) {
		return implementedInterface[interfaze] === true;
	};
};

Object.prototype.implemented = function (interfaze) {
	return false;
};

Function.prototype.bind = function (instance) {
	var oldFunc = this;
	var f = function () {
		return oldFunc.apply(instance, arguments);
	};
	return f;
};

Array.prototype.forEach = function (callback) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] !== undefined) {
			callback.call(null, this[i], i, this);
		}
	}
};

/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());/**
 * base error class
 */
deriveError = function (name) {
	var f = function (message) {
		this.message = message;
		this.name = name;
	};
	f.prototype = Error.prototype;
	f.prototype.constructor = f;
	return f;
};

LayoutBuildError = deriveError("LayoutBuildError");
IllegalArgumentError = deriveError("IllegalArgumentError");
OutOfRangeError = deriveError("OutOfRangeError");
NullPointerError = deriveError("NullPointerError");
UnimplementedError = deriveError("UnimplementedError");
UnsupportedError = deriveError("UnsupportedError");
LayoutError = deriveError("LayoutError");
IllegalStateError = deriveError("IllegalStateError");
ConfigurationError = deriveError("ConfigurationError");

assertNotNull = function (val) {
	if (val == null) {
		throw new NullPointerError();
	}
};

assertInstanceOf = function (val, type) {
	assertNotNull(val);
	assertNotNull(type);
	if (!(val instanceof type) && !val.implemented(type)) {
		throw new IllegalArgumentError("Type mismatch.");
	}
};

assertFiniteNumber = function (val) {
	assertNotNull(val);
	if (!(typeof val == "number" || val instanceof Number) || isNaN(val) || !isFinite(val)) {
		throw new IllegalArgumentError("Value is not a finite number.");
	}
};

assertInValueSet = function (val, valueSet) {
	for (var i = 0; i < valueSet.length; i++) {
		if (val === valueSet[i]) {
			return;
		}
	}
	throw new IllegalArgumentError("Undefined value: " + val);
};Point = function (x, y) {
	this.setX(x ? x : 0);
	this.setY(y ? y : 0);
};

Point.prototype.setX = function (x) {
	assertFiniteNumber(x);
	this.x = x;
};

Point.prototype.getX = function () {
	return this.x;
};

Point.prototype.setY = function (y) {
	assertFiniteNumber(y, Number);
	this.y = y;
};

Point.prototype.getY = function () {
	return this.y;
};
Rectangle = function (x, y, width, height) {
	this.setX(x ? x : 0);
	this.setY(y ? y : 0);
	this.setWidth(width ? width : 0);
	this.setHeight(height ? height : 0);
};

//////////////////////////////////////////////////
// Property getter / setters
//////////////////////////////////////////////////

Rectangle.prototype.setX = function (x) {
	assertFiniteNumber(x);
	this.x = x;
};

Rectangle.prototype.getX = function () {
	return this.x;
};

Rectangle.prototype.setY = function (y) {
	assertFiniteNumber(y);
	this.y = y;
};

Rectangle.prototype.getY = function () {
	return this.y;
};

Rectangle.prototype.setWidth = function (width) {
	assertFiniteNumber(width);
	this.width = width;
};

Rectangle.prototype.getWidth = function () {
	return this.width;
};

Rectangle.prototype.setHeight = function (height) {
	assertFiniteNumber(height);
	this.height = height;
};

Rectangle.prototype.getHeight = function () {
	return this.height;
};
/**
 * vivimice@gmail.com
 */
 
DisplayObject = function () {
	this.name = "";
	this.data = {};
	this.parent = null;	// should be DisplayObjectContainer
	this.x = 0;
	this.y = 0;
};

DisplayObject.prototype.getData = function (key) {
	assertNotNull(key);
	return this.data[key];
};

DisplayObject.prototype.setData = function(key, value) {
	assertNotNull(key);
	this.data[key] = value;
};

DisplayObject.prototype.getGlobalBoundry = function () {
	assertInstanceOf(this, HasDimension);
	
	var parent = this.getParent();
	if (parent == null) {
		throw new NullPointerError("Content is not been placed in any parent");
	}
	
	var globalTopLeftPoint = 
			parent.toGlobalPoint(new Point(this.getX(), this.getY()));
	var globalBottomRightPoint = 
			parent.toGlobalPoint(new Point(
					this.getX() + this.getWidth(), 
					this.getY() + this.getHeight()));
	var rect = new Rectangle();
	rect.setX(globalTopLeftPoint.getX());
	rect.setY(globalTopLeftPoint.getY());
	rect.setWidth(globalBottomRightPoint.getX() - globalTopLeftPoint.getX());
	rect.setHeight(globalBottomRightPoint.getY() - globalTopLeftPoint.getY());
	return rect;
};

//////////////////////////////////////////////////
// Property getter / setters
//////////////////////////////////////////////////

DisplayObject.prototype.getName = function () {
	return this.name;
};

DisplayObject.prototype.setName = function (name) {
	assertNotNull(name);
	this.name = name;
};

DisplayObject.prototype.getParent = function () {
	return this.parent;
};

DisplayObject.prototype.setParent = function (parent) {
	assertNotNull(parent);
	assertInstanceOf(parent, DisplayObjectContainer);
	this.parent = parent;
};

DisplayObject.prototype.setX = function (x) {
	assertFiniteNumber(x);
	this.x = x;
};

DisplayObject.prototype.getX = function () {
	return this.x;
};

DisplayObject.prototype.setY = function (y) {
	assertFiniteNumber(y);
	this.y = y;
};

DisplayObject.prototype.getY = function () {
	return this.y;
};
/**
 * An general scalable container for DisplayObjects 
 * 
 * vivimice@gmail.com
 */

DisplayObjectContainer = function () {
	this.children = [];	// array of DisplayObject
	this.scaleX = 1.0;
	this.scaleY = 1.0;
};

DisplayObjectContainer.inherit(DisplayObject);

/**
 * transform a local point into global point
 * 
 * A local point is a point within the container, which is decorated by the container's
 * offset and scale.
 */
DisplayObjectContainer.prototype.toGlobalPoint = function (localPoint) {
	assertInstanceOf(localPoint, Point);
	
	var point = new Point(localPoint.x, localPoint.y);	// make a working copy
	var container = this;
	while (container != null) {
		point.x = point.x * container.getScaleX() + container.getX();
		point.y = point.y * container.getScaleY() + container.getY();
		container = container.getParent();
	}
	
	return point;
};

/**
 * add a DisplayObject to the DisplayObjectContainer at end.
 * 
 * if child is a DisplayObjectContainer and contains this DisplayObjectContainer,
 * an IllegalArgumentError is thrown.
 * 
 * index should be integer, otherwise will be floored.
 * 
 * index should greater or equal than 0, and less or equal than the number of the
 * DisplayObjectContainer's children, otherwise OutOfRangeError will be thrown
 */
DisplayObjectContainer.prototype.addChild = function (child) {
	assertInstanceOf(child, DisplayObject);
	this.addChildAt(child, this.children.length);
};

/**
 * add a DisplayObject to the DisplayObjectContainer at specified index
 * 
 * if child is a DisplayObjectContainer and contains this DisplayObjectContainer,
 * an IllegalArgumentError is thrown.
 * 
 * index should be integer, otherwise will be floored.
 * 
 * index should greater or equal than 0, and less or equal than the number of the
 * DisplayObjectContainer's children, otherwise OutOfRangeError will be thrown
 */
DisplayObjectContainer.prototype.addChildAt = function (child, index) {
	assertInstanceOf(child, DisplayObject);
	assertFiniteNumber(index);
	
	if (child instanceof DisplayObjectContainer && child.contains(this)) {
		throw new IllegalArgumentError("Child contains this container");
	}
	
	index = Math.floor(index);
	if (index < 0 || index > this.children.length) {
		throw new OutOfRangeError("index " + index + " out of range. ");
	}
	
	// if child already in children's list, then remove it first
	if (child.getParent() != null) {
		child.getParent().removeChild(child);
	}
	
	var part1 = this.children.slice(0, index);
	var part2 = this.children.slice(index, this.children.length);
	this.children = part1.concat([child], part2);
	child.setParent(this);
};

/**
 * get child at specified index
 * 
 * index should be integer, otherwise will be floored.
 * 
 * index should greater or equal than 0, and less than the number of the
 * DisplayObjectContainer's children, otherwise OutOfRangeError will be thrown
 */
DisplayObjectContainer.prototype.getChildAt = function (index) {
	assertFiniteNumber(index);
	index = Math.floor(index);
	if (index < 0 || index >= this.children.length) {
		throw new OutOfRangeError("index " + index + " out of range. ");
	}
	return this.children[index];
};

/**
 * get child by name, if such child cannot be found, null is returned.
 */
DisplayObjectContainer.prototype.getChildByName = function (name) {
	assertNotNull(name);
	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i].getName() == name) {
			return this.children[i];
		}
	}
	return null;
};

/**
 * get sons and grand sons by name, if such descendants cannot be found,
 * null is returned.
 * 
 * @param name
 */
DisplayObjectContainer.prototype.getDescendantByName = function (name) {
	assertNotNull(name);
	var containers = [];
	for (var i = 0; i < this.children.length; i++) {
		var child = this.children[i];
		if (child.getName() == name) {
			return child;
		} else if (child instanceof DisplayObjectContainer) {
			containers.push(child);
		}
	}
	for (var i = 0; i < containers.length; i++) {
		var container = containers[i];
		var child = container.getDescendantByName(name);
		if (child != null) {
			return child;
		}
	}
	return null;
};

/**
 * get child's index, if such child is not within the container, an
 * IllegalArgumentError is thrown
 */
DisplayObjectContainer.prototype.getChildIndex = function (child) {
	assertInstanceOf(child, DisplayObject);
	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i] === child) {
			return i;
		}
	}
	throw new IllegalArgumentError("Specified child is not within this container.");
};

/**
 * remove child from the container.
 * 
 * if such child is not within the container, an IllegalArgumentError is thrown
 */
DisplayObjectContainer.prototype.removeChild = function (child) {
	assertInstanceOf(child, DisplayObject);
	this.removeChildAt(this.getChildIndex(child));
};

/**
 * remove child at specified index
 * 
 * index should be integer, otherwise will be floored.
 * 
 * index should greater or equal than 0, and less than the number of the
 * DisplayObjectContainer's children, otherwise OutOfRangeError will be thrown
 */
DisplayObjectContainer.prototype.removeChildAt = function (index) {
	assertFiniteNumber(index);
	index = Math.floor(index);
	if (index < 0 || index >= this.children.length) {
		throw new OutOfRangeError("index " + index + " out of range. ");
	}
	
	var child = this.getChildAt(index);
	child.setParent(null);
	this.children.splice(index, 1);
};

/**
 * move the child to the new index.
 * 
 * index should be integer, otherwise will be floored.
 * 
 * index should greater or equal than 0, and less than the number of the
 * DisplayObjectContainer's children, otherwise OutOfRangeError will be thrown
 * 
 * if such child is not within the container, an IllegalArgumentError is thrown
 */
DisplayObjectContainer.prototype.setChildIndex = function (child, newIndex) {
	assertInstanceOf(child, DisplayObject);
	assertFiniteNumber(newIndex);
	
	var oldIndex = this.getChildIndex(child);
	newIndex = Math.floor(newIndex);
	
	if (newIndex < 0 || newIndex >= this.children.length) {
		throw new OutOfRangeError("index " + newIndex + " out of range. ");
	}
	
	if (newIndex > oldIndex) {
		newIndex = newIndex - 1;
	}
	
	this.removeChildAt(oldIndex);
	this.addChildAt(child, newIndex);
};

/**
 * swap children's index
 * 
 * if such child is not within the container, an IllegalArgumentError is thrown
 */
DisplayObjectContainer.prototype.swapChildren = function (child1, child2) {
	assertInstanceOf(child1, DisplayObject);
	assertInstanceOf(child2, DisplayObject);
	
	var index1 = this.getChildIndex(child1);
	var index2 = this.getChildIndex(child2);
	
	this.children[index1] = child2;
	this.children[index2] = child1;
};

/**
 * swap children at index
 * 
 * index should be integer, otherwise will be floored.
 * 
 * index should greater or equal than 0, and less than the number of the
 * DisplayObjectContainer's children, otherwise OutOfRangeError will be thrown
 */
DisplayObjectContainer.prototype.swapChildrenAt = function (index1, index2) {
	assertFiniteNumber(index1);
	assertFiniteNumber(index2);
	
	index1 = Math.floor(index1);
	if (index1 < 0 || index1 >= this.children.length) {
		throw new OutOfRangeError("index1 " + index1 + " out of range. ");
	}
	
	index2 = Math.floor(index2);
	if (index2 < 0 || index2 >= this.children.length) {
		throw new OutOfRangeError("index2 " + index2 + " out of range. ");
	}
	
	var tmpChild = this.children[index1];
	this.children[index1] = this.children[index2];
	this.children[index2] = tmpChild;
};

/**
 * get number of the children in the container
 */
DisplayObjectContainer.prototype.getNumChildren = function () {
	return this.children.length;
};

/**
 * check whether the child is the self/son/grandson/... of this DisplayObjectContainer
 */
DisplayObjectContainer.prototype.contains = function (child) {
	assertInstanceOf(child, DisplayObject);
	
	if (this === child) {
		return true;
	}
	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i] === child) {
			return true;
		} else if (this.children[i] instanceof DisplayObjectContainer) {
			if (this.children[i].contains(child)) {
				return true;
			}
		}
	}
	return false;
};

//////////////////////////////////////////////////
// Property getter / setters
//////////////////////////////////////////////////

DisplayObjectContainer.prototype.setScaleX = function (scaleX) {
	assertFiniteNumber(scaleX);
	this.scaleX = scaleX;
};

DisplayObjectContainer.prototype.getScaleX = function () {
	return this.scaleX;
};

DisplayObjectContainer.prototype.setScaleY = function (scaleY) {
	assertFiniteNumber(scaleY);
	this.scaleY = scaleY;
};

DisplayObjectContainer.prototype.getScaleY = function () {
	return this.scaleY;
};
// Layoutable interface
Layoutable = function () {};

// implementation should return a LayoutInfo instance
Layoutable.prototype.getLayout = function () {};
Layoutable.prototype.setExplicitWidth = function (width) {};
Layoutable.prototype.setExplicitHeight = function (height) {};

/////////////////////////////////
// Layout info meta
/////////////////////////////////

LayoutInfo = function () {
	this.align = Layoutable.ALIGN_DEFAULT;
	
	// min and max values only have effect when width is specific as wrap_content
	// min and max values only allows explicit measurement
	this.width = {measurement : Layoutable.MEASUREMENT_CONTENT, value : NaN};
	this.minWidth = 0;
	this.maxWidth = Number.MAX_VALUE;
	
	this.height = {measurement : Layoutable.MEASUREMENT_CONTENT, value : NaN};
	this.minHeight = 0;
	this.maxHeight = Number.MAX_VALUE;
};

/////////////////////////////////
// static constants
/////////////////////////////////

Layoutable.ALIGN_LEFT 		= 0x01;
Layoutable.ALIGN_CENTER		= 0x02;
Layoutable.ALIGN_RIGHT 		= 0x04;
Layoutable.ALIGN_TOP 		= 0x10;
Layoutable.ALIGN_MIDDLE		= 0x20;
Layoutable.ALIGN_BOTTOM		= 0x40;
Layoutable.ALIGN_DEFAULT 	= Layoutable.ALIGN_LEFT | Layoutable.ALIGN_TOP;

Layoutable.MEASUREMENT_PERCENTAGE 	= 0;
Layoutable.MEASUREMENT_CONTENT 		= 1;
Layoutable.MEASUREMENT_EXPLICIT 	= 2;

Layoutable.STANDARD_IMPL = {
	getLayout : function () {
		if (!this.layout) {
			this.layout = new LayoutInfo();
		}
		return this.layout;
	},
	setExplicitWidth : function (width) {
		this.getLayout().width.measurement = Layoutable.MEASUREMENT_EXPLICIT;
		this.getLayout().width.value = width;
	},
	setExplicitHeight : function (height) {
		this.getLayout().height.measurement = Layoutable.MEASUREMENT_EXPLICIT;
		this.getLayout().height.value = height;
	}
};
/**
 * HasDimension interface
 */
HasDimension = function () {};

// implementation should return a LayoutInfo instance
HasDimension.prototype.getWidth = function () {
	throw new UnimplementedError();
};

HasDimension.prototype.getHeight = function () {
	throw new UnimplementedError();
};

HasDimension.prototype.setWidth = function (width) {
	throw new UnimplementedError();
};

HasDimension.prototype.setHeight = function (height) {
	throw new UnimplementedError();
};

HasDimension.STANDARD_IMPL_FOR_DISPLAY_OBJECT = {
	getWidth : function () {
		return this.width ? this.width : NaN;
	},
	
	setWidth : function (width) {
		assertFiniteNumber(width);
		this.width = width;
	},
	
	getHeight :function () {
		return this.height ? this.height : NaN;
	},
	
	setHeight : function (height) {
		assertFiniteNumber(height);
		this.height = height;
	}
};
LayoutableContent = function () {};

LayoutableContent.inherit(DisplayObject);
LayoutableContent.implement(Layoutable, Layoutable.STANDARD_IMPL);
LayoutableContent.implement(HasDimension, HasDimension.STANDARD_IMPL_FOR_DISPLAY_OBJECT);
/**
 * an abstract layoutable container
 */
LayoutableContainer = function () {};

LayoutableContainer.inherit(DisplayObjectContainer);

LayoutableContainer.implement(Layoutable, Layoutable.STANDARD_IMPL);
LayoutableContainer.implement(HasDimension, HasDimension.STANDARD_IMPL_FOR_DISPLAY_OBJECT);

/**
 * Update layout
 * 
 * After calling this method, the container's width and height will be set as
 * calculated explicit values
 */
LayoutableContainer.prototype.updateLayout = function (parentExplicitWidth, parentExplicitHeight) {
	var layout = this.getLayout();
	// if percentage measured, explicit sizes are calculated by parent
	var explicitWidth;
	switch (layout.width.measurement) {
		case Layoutable.MEASUREMENT_PERCENTAGE:
			if (!isNaN(parentExplicitWidth)) {
				explicitWidth = parentExplicitWidth * layout.width.value / 100;
			} else {
				throw new LayoutError("Can't calculate percentage width for container " + (this.getName() ? this.getName() : "<noname>"));
			}
			break;
		case Layoutable.MEASUREMENT_CONTENT:
			explicitWidth = NaN;
			break;
		case Layoutable.MEASUREMENT_EXPLICIT:
			explicitWidth = layout.width.value;
			break;
		default:
			throw new UnimplementedError();	// unimplemented measurement
	}
	var explicitHeight;
	switch (layout.height.measurement) {
		case Layoutable.MEASUREMENT_PERCENTAGE:
			if (!isNaN(parentExplicitHeight)) {
				explicitHeight = parentExplicitHeight * layout.height.value / 100;
			} else {
				throw new LayoutError("Can't calculate percentage height for container " + (this.getName() ? this.getName() : "<noname>"));
			}
			break;
		case Layoutable.MEASUREMENT_CONTENT:
			explicitHeight = NaN;
			break;
		case Layoutable.MEASUREMENT_EXPLICIT:
			explicitHeight = layout.height.value;
			break;
		default:
			throw new UnimplementedError();	// unimplemented measurement
	}
	
	// do layout
	var childrenDimensions = this.updateChildrenLayout(explicitWidth, explicitHeight);

	// merge size	
	var mergeSize = function (explicit, min, max, calculated) {
		if (isNaN(explicit)) {
			return calculated;
		} else {
			return Math.max(min, Math.min(max, explicit));
		}
	};
	
	this.setWidth(mergeSize(explicitWidth, layout.minWidth, layout.maxWidth, childrenDimensions.width));
	this.setHeight(mergeSize(explicitHeight, layout.minHeight, layout.maxHeight, childrenDimensions.height));
};

// abstract
LayoutableContainer.prototype.updateChildrenLayout = function (explicitWidth, explicitHeight) {
	throw new UnimplementedError();
};

LayoutableContainer.prototype.getLayoutableChildren = function () {
	var children = [];
	for (var i = 0; i < this.getNumChildren(); i++) {
		var child = this.getChildAt(i);
		if (child.implemented(Layoutable)) {
			children.push(child);
		}
	}
	return children;
};

//////////////////////////////////////////////////
// Property getter / setters
//////////////////////////////////////////////////

LayoutableContainer.prototype.setWidth = function (width) {
	assertFiniteNumber(width);
	this.width = width;
};

LayoutableContainer.prototype.getWidth = function () {
	return this.width;
};

LayoutableContainer.prototype.setHeight = function (height) {
	assertFiniteNumber(height);
	this.height = height;
};

LayoutableContainer.prototype.getHeight = function () {
	return this.height;
};

//////////////////////////////////////////////////
// Static consts and helpers
//////////////////////////////////////////////////
/**
 * A box that contains linear layout
 * 
 */
LinearBox = function () {
	this.oriention = LinearBox.HORIZONTAL;	// default oriention
};

LinearBox.inherit(LayoutableContainer);

(function () {	// create a closure to make local functions private
	
function getChildrenByAlignment(layoutables, align) {
	var filtered = [];
	for (var i = 0; i < layoutables.length; i++) {
		var layoutable = layoutables[i];
		if (layoutable.getLayout().align & align) {
			filtered.push(layoutable);
		}
	}
	return filtered;
}

// override
LinearBox.prototype.updateChildrenLayout = function (explicitWidth, explicitHeight) {
	var layoutableChildren = this.getLayoutableChildren();
	var calculatedTotalWidth = explicitWidth ? explicitWidth : 0;
	var calculatedTotalHeight = explicitHeight ? explicitHeight : 0;
	
	// If height for hbox or width for vbox is not determined by parent
	// (wrap_content mode) determine it by content 
	if (isNaN(explicitHeight) && this.oriention == LinearBox.HORIZONTAL ||
			isNaN(explicitWidth) && this.oriention == LinearBox.VERTICAL) {
		var max = -1;
		for (var i = 0; i < layoutableChildren.length; i++) {
			var layoutable = layoutableChildren[i];
			var layout = layoutable.getLayout();
			if (this.oriention == LinearBox.HORIZONTAL) {
				// determine height for hbox
				if (layout.height.measurement == Layoutable.MEASUREMENT_EXPLICIT) {
					max = Math.max(max, layout.height.value);
				}
			} else {
				// determine width for vbox
				if (layout.width.measurement == Layoutable.MEASUREMENT_EXPLICIT) {
					max = Math.max(max, layout.width.value);
				}
			}
		}
		
		if (this.oriention == LinearBox.HORIZONTAL) {
			// set height for hbox
			if (max >= 0) { 
				calculatedTotalHeight = max;
			} else {
				throw new LayoutError("Can't determine content height for " + this.getName());
			}
		} else {
			// set width for vbox
			if (max >= 0) { 
				calculatedTotalWidth = max;
			} else {
				throw new LayoutError("Can't determine content width for " + this.getName());
			}
		}
	}
	
	// Since now, explicit width (calculatedTotalWidth) for vbox or explicit 
	// height for hbox (calculatedTotalHeight) is determined.
	//
	// This may just be a intermediate value, if container's width of vbox or
	// height for hbox is declared as wrap_content, and some of the children
	// is also declared as wrap_content, this may need to calculated in the 
	// second pass. These children has been put into variable named "undetermined"
	//
	// Next, determine height for vbox or width for hbox
	//
	// For vbox: 
	// If height is wrap_content, then get size from children,
	// requires all children are declared height as explicitly
	if (isNaN(explicitHeight) && this.oriention == LinearBox.VERTICAL ||
			isNaN(explicitWidth) && this.oriention == LinearBox.HORIZONTAL) {
		for (var i = 0; i < layoutableChildren.length; i++) {
			var layoutable = layoutableChildren[i];
			if (this.oriention == LinearBox.HORIZONTAL) {
				layoutable.updateLayout(NaN, calculatedTotalHeight);
				calculatedTotalWidth += layoutable.getWidth();
			} else {
				layoutable.updateLayout(calculatedTotalWidth, NaN);
				calculatedTotalHeight += layoutable.getHeight();
			}
		}
	} else {
		// If height is explicit or percentage, means dimension of vbox itself is 
		// determined, just do layout for children, here allows children declare
		// its dimension as percentage, but percentage is calculated from free
		// space
		var freeSpace;
		if (this.oriention == LinearBox.HORIZONTAL) {
			calculatedTotalWidth = explicitWidth;
			freeSpace = calculatedTotalWidth;
		} else {
			calculatedTotalHeight = explicitHeight;
			freeSpace = calculatedTotalHeight;
		}
		// get free space
		var pending = [];
		var totalWeight = 0;
		for (var i = 0; i < layoutableChildren.length; i++) {
			var layoutable = layoutableChildren[i];
			var layout = layoutable.getLayout();
			if (layout.width.measurement == Layoutable.MEASUREMENT_PERCENTAGE && this.oriention == LinearBox.HORIZONTAL ||
					layout.height.measurement == Layoutable.MEASUREMENT_PERCENTAGE && this.oriention == LinearBox.VERTICAL) {
				pending.push(layoutable);
				totalWeight += this.oriention == LinearBox.HORIZONTAL ? layout.width.value : layout.height.value;
			} else {
				layoutable.updateLayout(calculatedTotalWidth, calculatedTotalHeight);
				freeSpace -= this.oriention == LinearBox.HORIZONTAL ? layoutable.getWidth() : layoutable.getHeight();
			}
		}
		// use free space to calculate percentage values
		// since children always use percentage values against 100, but totalWeight may exceed 100
		// so scale freespace to adapt
		if (totalWeight > 100) {
			freeSpace *= 100 / totalWeight;
		}
		for (var i = 0; i < pending.length; i++) {
			var layoutable = pending[i];
			if (this.oriention == LinearBox.HORIZONTAL) {
				layoutable.updateLayout(freeSpace, calculatedTotalHeight);
			} else {
				layoutable.updateLayout(calculatedTotalWidth, freeSpace);
			}
		}
	}
	
	// Since now, dimension of the container itself and all children is determined
	//
	// Now, determine all undetermined children's dimension and
	// update height for hbox or width for vbox if neccessary
	if (isNaN(explicitHeight) && this.oriention == LinearBox.HORIZONTAL ||
			isNaN(explicitWidth) && this.oriention == LinearBox.VERTICAL) {
		var max = 0;
		for (var i = 0; i < layoutableChildren.length; i++) {
			var layoutable = layoutableChildren[i];
			if (this.oriention == LinearBox.HORIZONTAL) {
				// set height for hbox
				max = Math.max(max, layoutable.getHeight());
			} else {
				// set width for vbox
				max = Math.max(max, layoutable.getWidth());
			}
		}
		// update height for hbox or width for vbox if neccessary
		if (this.oriention == LinearBox.HORIZONTAL) {
			// set height for hbox
			calculatedTotalHeight = Math.max(calculatedTotalHeight, max);
		} else {
			// set width for vbox
			calculatedTotalWidth = Math.max(calculatedTotalWidth, max);
		}
	}
	
	// place child in the right place
	// group child by alignmet
	var groups = [
		getChildrenByAlignment.call(this, layoutableChildren,
				this.oriention == LinearBox.HORIZONTAL ? 
						Layoutable.ALIGN_LEFT : Layoutable.ALIGN_TOP),
		getChildrenByAlignment.call(this, layoutableChildren,
				this.oriention == LinearBox.HORIZONTAL ? 
						Layoutable.ALIGN_CENTER : Layoutable.ALIGN_MIDDLE),
		getChildrenByAlignment.call(this, layoutableChildren,
				this.oriention == LinearBox.HORIZONTAL ? 
						Layoutable.ALIGN_RIGHT : Layoutable.ALIGN_BOTTOM)
	];
	var current;
	// left or top ones
	current = 0;
	for (var i = 0; i < groups[0].length; i++) {
		var layoutable = groups[0][i];
		if (this.oriention == LinearBox.HORIZONTAL) {
			layoutable.setX(current);
			current += layoutable.getWidth();
		} else {
			layoutable.setY(current);
			current += layoutable.getHeight();
		}
	}
	var centerStart = current;
	
	// right or bottom ones
	current = ((this.oriention == LinearBox.HORIZONTAL) ? calculatedTotalWidth : calculatedTotalHeight);
	for (var i = groups[2].length - 1; i >= 0; i--) {
		var layoutable = groups[1][i];
		if (this.oriention == LinearBox.HORIZONTAL) {
			current -= layoutable.getWidth();
			layoutable.setX(current);
		} else {
			current -= layoutable.getHeight();
			layoutable.setY(current);
		}
	}
	var centerEnd = current;
	
	// center or middle ones
	var total = 0;
	for (var i = 0; i < groups[1].length; i++) {
		var layoutable = groups[1][i];
		if (this.oriention == LinearBox.HORIZONTAL) {
			total += layoutable.getWidth();
		} else {
			total += layoutable.getHeight();
		}
	}
	current = (centerEnd - centerStart - total) / 2 + centerStart;
	for (var i = 0; i < groups[1].length; i++) {
		var layoutable = groups[1][i];
		if (this.oriention == LinearBox.HORIZONTAL) {
			layoutable.setX(current);
			current += layoutable.getWidth();
		} else {
			layoutable.setY(current);
			current += layoutable.getHeight();
		}
	}
	
	// process the other side
	for (var i = 0; i < layoutableChildren.length; i++) {
		var layoutable = layoutableChildren[i];
		var layout = layoutable.getLayout();
		if (this.oriention == LinearBox.HORIZONTAL) {
			if (layout.align | Layoutable.ALIGN_TOP) {
				layoutable.setY(0);
			} else if (layout.align | Layoutable.ALIGN_BOTTOM) {
				layoutable.setY(calculatedTotalHeight - layoutable.getHeight());
			} else if (layoutable.align | Layoutable.ALIGN_MIDDLE) {
				layoutable.setY((calculatedTotalHeight - layoutable.getHeight()) / 2);
			}
		} else {
			if (layout.align | Layoutable.ALIGN_LEFT) {
				layoutable.setX(0);
			} else if (layout.align | Layoutable.ALIGN_RIGHT) {
				layoutable.setX(calculatedTotalWidth - layoutable.getWidth());
			} else if (layoutable.align | Layoutable.ALIGN_CENTER) {
				layoutable.setX((calculatedTotalWidth - layoutable.getWidth()) / 2);
			}
		}
	}
	
	return {width : calculatedTotalWidth, height : calculatedTotalHeight};
};

})();

//////////////////////////////
// static constants
/////////////////////////////////

LinearBox.VERTICAL = 1;
LinearBox.HORIZONTAL = 2;

//////////////////////////////////////////////////
// Property getter / setters
//////////////////////////////////////////////////

LinearBox.prototype.setOriention = function (oriention) {
	assertInValueSet(oriention, [LinearBox.VERTICAL, LinearBox.HORIZONTAL]);
	this.oriention = oriention;
};

LinearBox.prototype.getOriention = function () {
	return this.oriention;
};
/**
 * zlong exported functions
 * 
 * vivimice@gmail.com
 */
ZLong = new function () {};

ZLong.writeJsDependencies = function (path) {
	var js = "inherits,json,errors,Point,Rectangle,DisplayObject,DisplayObjectContainer,Layoutable,HasDimension,LayoutableContent,LayoutableContainer,LinearBox".split(/\s*,\s*/);
	var path = path ? path : "";
	for (var i = 0; i < js.length; i++) {
		document.write("<script src='" + path + js[i] + ".js'></script>");
	}
};

/////////////////////////////////////////////
// Helpers
/////////////////////////////////////////////

/**
 * Get layout from the display object tree, will return a map
 * 
 * key is name of the display object, value is a layout information object, like:
 * 
 * {boundry : Rectangle}
 * 
 * if the display object is anonymous, then key is the display object itself
 * 
 */
ZLong.getFullLayout = function (node) {
	var getLayoutRecursively = function (node, layoutMap) {
		if (node.getParent() != null) {
			var rect = node.getGlobalBoundry();
			layoutMap[node.getName() ? node.getName() : node] = {
				boundry : rect
			};
		}
		if (node instanceof DisplayObjectContainer) {
			for (var i = 0; i < node.getNumChildren(); i++) {
				getLayoutRecursively(node.getChildAt(i), layoutMap);
			}
		}
	};
	var layoutMap = {};
	getLayoutRecursively(node, layoutMap);
	return layoutMap;
};

ZLong.getNamedLayoutInJson = function (node) {
	var layoutMap = ZLong.getFullLayout(node);
	var filteredMap = {};
	for (var k in layoutMap) {
		if (k instanceof String || typeof k == "string") {
			filteredMap[k] = layoutMap[k];
		}
	}
	return JSON.stringify(filteredMap);
};

/////////////////////////////////////////////
// Declaration Compiler and Layout Builder
/////////////////////////////////////////////

ZLong.getNodeDefinitions = function () {
	return {
		content : {type : LayoutableContent, attr : "name,data,align,width,height"},
		hbox : {type : LinearBox, attr : "name,data,align,width,height,maxWidth,minWidth,maxHeight,minHeight", child : "hbox,vbox,content"},
		vbox : {type : LinearBox, attr : "name,data,align,width,height,maxWidth,minWidth,maxHeight,minHeight", child : "hbox,vbox,content"}
	};
};

/**
 * compile declaration from xml.
 * 
 * Note: this needs DOMParser support (which has been integrated into chrome/firefox)
 */
ZLong.compileJsonDeclarationFromXML = function (xml) {
	var doc = new DOMParser().parseFromString(xml, "text/xml");
	var startElement = doc.firstChild;
	while (startElement != null && startElement.nodeType != 1) { // 1 - element
		startElement = startElement.nextSibling;
	}
	
	var toObjects = function (element) {
		var node = {};
		node.type = element.nodeName;
		
		for (var i = 0; i < element.attributes.length; i++) {
			var attr = element.attributes.item(i);
			node[attr.name] = attr.value;
		}
		
		node.children = [];
		var child = element.firstChild;
		while (child != null) {
			if (child.nodeType == 1) {	// 1 - element
				node.children.push(toObjects(child));
			}
			child = child.nextSibling;
		}
		
		return node;
	};
	
	if (doc.getElementsByTagName("parsererror").length > 0) {
		throw new Error(doc.getElementsByTagName("parsererror")[0].getElementsByTagName("div")[0].innerHTML);
	} else if (startElement != null) {
		return JSON.stringify(toObjects(startElement));
	} else {
		return JSON.stringify({});
	}
};

(function () { // protection closure

ZLong.buildLayoutFromJsonDeclaration = function (jsonDecl) {
	var decls = JSON.parse(jsonDecl);
	return fromObjectDecl(decls);
};

var PropertyProcessors = {};
	
PropertyProcessors["align"] = function(node, value) {
	var mapping = {
		left 			: Layoutable.ALIGN_LEFT | Layoutable.ALIGN_TOP,
		center 			: Layoutable.ALIGN_CENTER | Layoutable.ALIGN_TOP,
		right			: Layoutable.ALIGN_RIGHT | Layoutable.ALIGN_TOP,
		top				: Layoutable.ALIGN_TOP | Layoutable.ALIGN_LEFT,
		middle			: Layoutable.ALIGN_MIDDLE | Layoutable.ALIGN_LEFT,
		bottom			: Layoutable.ALIGN_BOTTOM | Layoutable.ALIGN_LEFT,
		top_left		: Layoutable.ALIGN_TOP | Layoutable.ALIGN_LEFT,
		top_center		: Layoutable.ALIGN_TOP | Layoutable.ALIGN_CENTER,
		top_right		: Layoutable.ALIGN_TOP | Layoutable.ALIGN_RIGHT,
		middle_left		: Layoutable.ALIGN_MIDDLE | Layoutable.ALIGN_LEFT,
		middle_center	: Layoutable.ALIGN_MIDDLE | Layoutable.ALIGN_CENTER,
		middle_right	: Layoutable.ALIGN_MIDDLE | Layoutable.ALIGN_RIGHT,
		bottom_left 	: Layoutable.ALIGN_BOTTOM | Layoutable.ALIGN_LEFT,
		bottom_center 	: Layoutable.ALIGN_BOTTOM | Layoutable.ALIGN_CENTER,
		bottom_right 	: Layoutable.ALIGN_BOTTOM | Layoutable.ALIGN_RIGHT
	};
	if (value) {
		if (mapping[value]) {
			node.getLayout().align = mapping[value];
		} else {
			throw new LayoutBuildError("Illegal align value: " + value);
		}
	} else {
		node.getLayout().align = Layoutable.ALIGN_DEFAULT;
	}
};
	
PropertyProcessors["name"] = function (node, value) {
	node.setName(value ? value + "" : "");
};
	
PropertyProcessors["data"] = function (node, value) {
	node.setData(value);
};
	
PropertyProcessors["width"] = function (node, value) {
	if (node instanceof LayoutableContainer) {
		node.getLayout().width = PropertyProcessors.getGenericSizeValue(value);
	} else if (node.implemented(HasDimension)) {
		value = Number(value);
		assertFiniteNumber(value);
		node.setWidth(value);
	} else {
		throw new UnimplementedError();
	}
};

PropertyProcessors["height"] = function (node, value) {
	if (node instanceof LayoutableContainer) {
		node.getLayout().height = PropertyProcessors.getGenericSizeValue(value);
	} else if (node.implemented(HasDimension)) {
		value = Number(value);
		assertFiniteNumber(value);
		node.setHeight(value);
	} else {
		throw new UnimplementedError();
	}
};

PropertyProcessors["minWidth"] = function (node, value) {
	node.getLayout().minWidth = PropertyProcessors.getExplicitSizeValue(value);
};

PropertyProcessors["minHeight"] = function (node, value) {
	node.getLayout().minHeight = PropertyProcessors.getExplicitSizeValue(value);
};

PropertyProcessors["maxWidth"] = function (node, value) {
	node.getLayout().maxWidth = PropertyProcessors.getExplicitSizeValue(value);
};

PropertyProcessors["maxHeight"] = function (node, value) {
	node.getLayout().maxHeight = PropertyProcessors.getExplicitSizeValue(value);
};

PropertyProcessors.getExplicitSizeValue = function (s) {
	var explicit = Number(s);
	if (!isNaN(explicit)) {
		return {measurement : Layoutable.MEASUREMENT_EXPLICIT, value : explicit};
	} else {
		throw new LayoutBuildError("Bad explicit notation: " + s);
	}
};

PropertyProcessors.getGenericSizeValue = function (s) {
	if (s == "wrap_content" || s == "auto") {
		return {measurement : Layoutable.MEASUREMENT_CONTENT};
	}
	
	var m = s.match(/^([0-9.]+)\%$/);
	if (m) {
		var percentage = Number(m[1]);
		if (!isNaN(percentage)) {
			return {measurement : Layoutable.MEASUREMENT_PERCENTAGE, value : percentage};
		} else {
			throw new LayoutBuildError("Bad percentage notation: " + s);
		}
	}
	
	return PropertyProcessors.getExplicitSizeValue(s);
};

function fromObjectDecl(decl) {
	var defs = ZLong.getNodeDefinitions();
	var def = defs[decl.type];
	if (!def) {
		throw new LayoutBuildError("Unknown type of node: " + decl.type);
	}
	
	var node = new def.type;
	
	def.attr.split(/\s*,\s*/).forEach(function (attrName) {
		var processor = PropertyProcessors[attrName];
		if (processor) {
			if (decl[attrName] !== undefined) {
				processor(node, decl[attrName]);
			}
		} else {
			throw new UnimplementedError("Unimplemented property: " + attrName);
		}
	});
	
	// hbxand vbox are aliases for LinearBox
	switch (decl.type) {
		case "hbox":
			node.setOriention(LinearBox.HORIZONTAL);
			break;
		case "vbox":
			node.setOriention(LinearBox.VERTICAL);
			break;
	}
	
	if (node instanceof DisplayObjectContainer && decl.children) {
		// process child nodes
		for (var i = 0; i < decl.children.length; i++) {
			node.addChild(fromObjectDecl(decl.children[i]));
		}
	}
	
	return node;
}

function defaultNumber(value, defaultValue) {
	return Number(value) ? Number(value) : Number(defaultValue); 
}

function defaultString(value, defaultValue) {
	return value ? value + "" : defaultValue;
}

})();