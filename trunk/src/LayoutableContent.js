LayoutableContent = function () {};

LayoutableContent.inherit(DisplayObject);
LayoutableContent.implement(Layoutable, Layoutable.STANDARD_IMPL);
LayoutableContent.implement(HasDimension, HasDimension.STANDARD_IMPL_FOR_DISPLAY_OBJECT);
