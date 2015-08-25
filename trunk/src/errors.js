/**
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
};