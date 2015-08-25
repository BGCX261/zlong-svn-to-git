Point = function (x, y) {
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
