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
