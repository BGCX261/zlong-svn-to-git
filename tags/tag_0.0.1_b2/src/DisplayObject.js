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
