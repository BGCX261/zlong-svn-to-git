// Layoutable interface
Layoutable = function () {};

// implementation should return a LayoutInfo instance
Layoutable.prototype.getLayout = function () {};

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
	}
};
