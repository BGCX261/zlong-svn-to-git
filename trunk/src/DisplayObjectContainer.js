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
