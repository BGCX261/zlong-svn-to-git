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
