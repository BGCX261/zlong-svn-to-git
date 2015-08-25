/**
 * zlong exported functions
 * 
 * vivimice@gmail.com
 */
ZLong = new function () {};

ZLong.writeJsDependencies = function (path) {
	var js = "inherits,json,errors,Point,Rectangle,DisplayObject,DisplayObjectContainer,Layoutable,HasDimension,LayoutableContent,LayoutableContainer,LinearBox".split(/\s*,\s*/);
	var path = path ? path : "";
	for (var i = 0; i < js.length; i++) {
		document.write("<script src='" + path + js[i] + ".js'></script>");
	}
};

/////////////////////////////////////////////
// Helpers
/////////////////////////////////////////////

/**
 * Get layout from the display object tree, will return a map
 * 
 * key is name of the display object, value is a layout information object, like:
 * 
 * {boundry : Rectangle}
 * 
 * if the display object is anonymous, then key is the display object itself
 * 
 */
ZLong.getFullLayout = function (node) {
	var getLayoutRecursively = function (node, layoutMap) {
		if (node.getParent() != null) {
			var rect = node.getGlobalBoundry();
			layoutMap[node.getName() ? node.getName() : node] = {
				boundry : rect
			};
		}
		if (node instanceof DisplayObjectContainer) {
			for (var i = 0; i < node.getNumChildren(); i++) {
				getLayoutRecursively(node.getChildAt(i), layoutMap);
			}
		}
	};
	var layoutMap = {};
	getLayoutRecursively(node, layoutMap);
	return layoutMap;
};

ZLong.getNamedLayoutInJson = function (node) {
	var layoutMap = ZLong.getFullLayout(node);
	var filteredMap = {};
	for (var k in layoutMap) {
		if (k instanceof String || typeof k == "string") {
			filteredMap[k] = layoutMap[k];
		}
	}
	return JSON.stringify(filteredMap);
};

/////////////////////////////////////////////
// Declaration Compiler and Layout Builder
/////////////////////////////////////////////

ZLong.getNodeDefinitions = function () {
	return {
		content : {type : LayoutableContent, attr : "name,data,align,width,height"},
		hbox : {type : LinearBox, attr : "name,data,align,width,height,maxWidth,minWidth,maxHeight,minHeight", child : "hbox,vbox,content"},
		vbox : {type : LinearBox, attr : "name,data,align,width,height,maxWidth,minWidth,maxHeight,minHeight", child : "hbox,vbox,content"}
	};
};

/**
 * compile declaration from xml.
 * 
 * Note: this needs DOMParser support (which has been integrated into chrome/firefox)
 */
ZLong.compileJsonDeclarationFromXML = function (xml) {
	var doc = new DOMParser().parseFromString(xml, "text/xml");
	var startElement = doc.firstChild;
	while (startElement != null && startElement.nodeType != 1) { // 1 - element
		startElement = startElement.nextSibling;
	}
	
	var toObjects = function (element) {
		var node = {};
		node.type = element.nodeName;
		
		for (var i = 0; i < element.attributes.length; i++) {
			var attr = element.attributes.item(i);
			node[attr.name] = attr.value;
		}
		
		node.children = [];
		var child = element.firstChild;
		while (child != null) {
			if (child.nodeType == 1) {	// 1 - element
				node.children.push(toObjects(child));
			}
			child = child.nextSibling;
		}
		
		return node;
	};
	
	if (doc.getElementsByTagName("parsererror").length > 0) {
		throw new Error(doc.getElementsByTagName("parsererror")[0].getElementsByTagName("div")[0].innerHTML);
	} else if (startElement != null) {
		return JSON.stringify(toObjects(startElement));
	} else {
		return JSON.stringify({});
	}
};

(function () { // protection closure

ZLong.buildLayoutFromJsonDeclaration = function (jsonDecl) {
	var decls = JSON.parse(jsonDecl);
	return fromObjectDecl(decls);
};

var PropertyProcessors = {};
	
PropertyProcessors["align"] = function(node, value) {
	var mapping = {
		left 			: Layoutable.ALIGN_LEFT | Layoutable.ALIGN_TOP,
		center 			: Layoutable.ALIGN_CENTER | Layoutable.ALIGN_TOP,
		right			: Layoutable.ALIGN_RIGHT | Layoutable.ALIGN_TOP,
		top				: Layoutable.ALIGN_TOP | Layoutable.ALIGN_LEFT,
		middle			: Layoutable.ALIGN_MIDDLE | Layoutable.ALIGN_LEFT,
		bottom			: Layoutable.ALIGN_BOTTOM | Layoutable.ALIGN_LEFT,
		top_left		: Layoutable.ALIGN_TOP | Layoutable.ALIGN_LEFT,
		top_center		: Layoutable.ALIGN_TOP | Layoutable.ALIGN_CENTER,
		top_right		: Layoutable.ALIGN_TOP | Layoutable.ALIGN_RIGHT,
		middle_left		: Layoutable.ALIGN_MIDDLE | Layoutable.ALIGN_LEFT,
		middle_center	: Layoutable.ALIGN_MIDDLE | Layoutable.ALIGN_CENTER,
		middle_right	: Layoutable.ALIGN_MIDDLE | Layoutable.ALIGN_RIGHT,
		bottom_left 	: Layoutable.ALIGN_BOTTOM | Layoutable.ALIGN_LEFT,
		bottom_center 	: Layoutable.ALIGN_BOTTOM | Layoutable.ALIGN_CENTER,
		bottom_right 	: Layoutable.ALIGN_BOTTOM | Layoutable.ALIGN_RIGHT
	};
	if (value) {
		if (mapping[value]) {
			node.getLayout().align = mapping[value];
		} else {
			throw new LayoutBuildError("Illegal align value: " + value);
		}
	} else {
		node.getLayout().align = Layoutable.ALIGN_DEFAULT;
	}
};
	
PropertyProcessors["name"] = function (node, value) {
	node.setName(value ? value + "" : "");
};
	
PropertyProcessors["data"] = function (node, value) {
	node.setData(value);
};
	
PropertyProcessors["width"] = function (node, value) {
	if (node instanceof LayoutableContainer) {
		node.getLayout().width = PropertyProcessors.getGenericSizeValue(value);
	} else if (node.implemented(HasDimension)) {
		value = Number(value);
		assertFiniteNumber(value);
		node.setWidth(value);
	} else {
		throw new UnimplementedError();
	}
};

PropertyProcessors["height"] = function (node, value) {
	if (node instanceof LayoutableContainer) {
		node.getLayout().height = PropertyProcessors.getGenericSizeValue(value);
	} else if (node.implemented(HasDimension)) {
		value = Number(value);
		assertFiniteNumber(value);
		node.setHeight(value);
	} else {
		throw new UnimplementedError();
	}
};

PropertyProcessors["minWidth"] = function (node, value) {
	node.getLayout().minWidth = PropertyProcessors.getExplicitSizeValue(value);
};

PropertyProcessors["minHeight"] = function (node, value) {
	node.getLayout().minHeight = PropertyProcessors.getExplicitSizeValue(value);
};

PropertyProcessors["maxWidth"] = function (node, value) {
	node.getLayout().maxWidth = PropertyProcessors.getExplicitSizeValue(value);
};

PropertyProcessors["maxHeight"] = function (node, value) {
	node.getLayout().maxHeight = PropertyProcessors.getExplicitSizeValue(value);
};

PropertyProcessors.getExplicitSizeValue = function (s) {
	var explicit = Number(s);
	if (!isNaN(explicit)) {
		return {measurement : Layoutable.MEASUREMENT_EXPLICIT, value : explicit};
	} else {
		throw new LayoutBuildError("Bad explicit notation: " + s);
	}
};

PropertyProcessors.getGenericSizeValue = function (s) {
	if (s == "wrap_content" || s == "auto") {
		return {measurement : Layoutable.MEASUREMENT_CONTENT};
	}
	
	var m = s.match(/^([0-9.]+)\%$/);
	if (m) {
		var percentage = Number(m[1]);
		if (!isNaN(percentage)) {
			return {measurement : Layoutable.MEASUREMENT_PERCENTAGE, value : percentage};
		} else {
			throw new LayoutBuildError("Bad percentage notation: " + s);
		}
	}
	
	return PropertyProcessors.getExplicitSizeValue(s);
};

function fromObjectDecl(decl) {
	var defs = ZLong.getNodeDefinitions();
	var def = defs[decl.type];
	if (!def) {
		throw new LayoutBuildError("Unknown type of node: " + decl.type);
	}
	
	var node = new def.type;
	
	def.attr.split(/\s*,\s*/).forEach(function (attrName) {
		var processor = PropertyProcessors[attrName];
		if (processor) {
			if (decl[attrName] !== undefined) {
				processor(node, decl[attrName]);
			}
		} else {
			throw new UnimplementedError("Unimplemented property: " + attrName);
		}
	});
	
	// hbxand vbox are aliases for LinearBox
	switch (decl.type) {
		case "hbox":
			node.setOriention(LinearBox.HORIZONTAL);
			break;
		case "vbox":
			node.setOriention(LinearBox.VERTICAL);
			break;
	}
	
	if (node instanceof DisplayObjectContainer && decl.children) {
		// process child nodes
		for (var i = 0; i < decl.children.length; i++) {
			node.addChild(fromObjectDecl(decl.children[i]));
		}
	}
	
	return node;
}

function defaultNumber(value, defaultValue) {
	return Number(value) ? Number(value) : Number(defaultValue); 
}

function defaultString(value, defaultValue) {
	return value ? value + "" : defaultValue;
}

})();