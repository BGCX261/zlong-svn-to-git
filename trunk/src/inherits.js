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

