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
