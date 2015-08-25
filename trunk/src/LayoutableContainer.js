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
