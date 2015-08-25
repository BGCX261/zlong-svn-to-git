Preview = {};

Preview.init = function () {
	Preview.editor = window.dialogArguments.editor;
	
	$("body").html("");
	$("body").addClass("preview");
	$("body").removeClass("editor");
	Preview.initCursorView();
	
	Preview.appendToConsole("Initiating layout preview ...");
	
	try {
		var rootNode = ZLong.buildLayoutFromJsonDeclaration(window.dialogArguments.json);
		rootNode.updateLayout(); // here implies that the root node is LayoutableContainer
		
		window.resizeTo(rootNode.getWidth() + 100, rootNode.getHeight() + 100);
		$("body").append($("<div class='stage-area' style='border:1px dashed #333;width:$WIDTH$px;height:$HEIGHT$px;'><b></b></div>".replace("$HEIGHT$", rootNode.getHeight()).replace("$WIDTH$", rootNode.getWidth())));
		
		for (var i = 0; i < rootNode.getNumChildren(); i++) {
			var child = rootNode.getChildAt(i);
			Preview.drawNode(child, 0);
		}
	} catch (e) {
		Preview.appendToConsole("Layout error: " + e.message);
		if (e.stack) {
			Preview.appendToConsole("Caused by:\n" + e.stack);
		}
		window.close();
		return;
	}
};

Preview.drawNode = function (node, level) {
//		<div class="displayobject" style="left:100px;top:100px;width:234px;height:264px;border:1px solid red;">
//			<div class="name" style="color:red">Name</div>
//			<div class="bg" style="background:red"><b></b></div>
//		</div>
	var rect = node.getGlobalBoundry();
	var a = [];
	a.push('<div class="displayobject" name="$NAME$" style="left:$LEFT$px;top:$TOP$px;width:$WIDTH$px;height:$HEIGHT$px;border:1px solid $COLOR$;">');
	a.push('<div class="name" style="color:$COLOR$">$NAME$</div>');
	a.push('<div class="bg" style="background:$COLOR$"><b></b></div>');
	a.push('</div>');
	var html = a.join('')
		.replace(/\$LEFT\$/g, rect.getX())
		.replace(/\$TOP\$/g, rect.getY())
		.replace(/\$WIDTH\$/g, rect.getWidth() - 2)
		.replace(/\$HEIGHT\$/g, rect.getHeight() - 2)
		.replace(/\$NAME\$/g, node.getName())
		.replace(/\$COLOR\$/g, Preview.getColorByLevel(node.getName(), level))
		;
	$(".stage-area").append($(html));
	if (node instanceof DisplayObjectContainer) {
		for (var i = 0; i < node.getNumChildren(); i++) {
			var child = node.getChildAt(i);
			Preview.drawNode(child, level + 1);
		}
	}
};

Preview.getColorByLevel = function (name, level) {
	return name ? "#f00" : "transparent";
};

Preview.appendToConsole = function (line) {
	Preview.editor.appendToConsole(line);
};

Preview.initCursorView = function () {
	$("body").prepend($("<div class='cursor-position'></div>"));
	$("body").mousemove(function (event) {
		$(".cursor-position").text(event.clientX + "," + event.clientY);
	});
	
	$("body").mouseout(function (event) {
		$(".cursor-position").hide();
	});
	
	$("body").mouseover(function (event) {
		$(".cursor-position").show();
	});
};

Editor = {};

Editor.init = function () {
	Editor.console = document.getElementById("console");
	Editor.createXMLEditor();
	Editor.initXMLHints();
	Editor.load();
	
	$("#preview").click(Editor.preview);
	$("#save").click(Editor.save);
	$("#load").click(Editor.load);

	Editor.changeSaveAndLoadStatus();
	Editor.editor.setOption("onChange", Editor.changeSaveAndLoadStatus);
};

Editor.changeSaveAndLoadStatus = function () {
	var now = new Date().getTime();
	if (Editor.lastCheckedSaveAndLoadStatus && now - Editor.lastCheckedSaveAndLoadStatus < 300) {
		return;
	}
	
	if (Editor.isSaved()) {
		$("#save").attr("disabled", "disabled");
	} else {
		$("#save").removeAttr("disabled");
	}
	
	if (Editor.isLoadable()) {
		$("#load").removeAttr("disabled");
	} else {
		$("#load").attr("disabled", "disabled");
	}
	Editor.lastCheckedSaveAndLoadStatus = now;
};

Editor.initXMLHints = function () {
	CodeMirror.xmlHints["<"] = [];
	var def = ZLong.getNodeDefinitions();
	for (var k in def) {
		CodeMirror.xmlHints["<"].push(k);
		if (def[k].child) {
			CodeMirror.xmlHints["<" + k + "><"] = def[k].child.split(/\s*,\s*/);
			Editor.editor.setOption("closeTagIndent", [k].concat(Editor.editor.getOption("closeTagIndent")));
		} else {
			CodeMirror.xmlHints["<" + k + "><"] = [];
		}
		if (def[k].attr) {
			CodeMirror.xmlHints["<" + k + " "] = def[k].attr.split(/\s*,\s*/);
		}
	}
};

Editor.appendToConsole = function (line) {
	Editor.console.value += "[" + new Date().format("yyyy-MM-dd HH:mm:ss.SSS") + "] " + line + "\n";
	Editor.console.scrollTop = console.scrollHeight;
};

Editor.clearConsole = function () {
	Editor.console.value = "";
	Editor.console.scrollTop = console.scrollHeight;
};

Editor.save = function () {
	var xml = Editor.editor.getValue();
	localStorage.setItem("zlong-saved-xml", xml);
	Editor.appendToConsole("Xml saved to local storage.");
	Editor.savedXml = xml;
	Editor.changeSaveAndLoadStatus();
};

Editor.load = function () {
	var xml = localStorage.getItem("zlong-saved-xml");
	xml = xml ? xml : "";
	Editor.editor.setValue(xml);
	Editor.appendToConsole("Xml loaded from local storage.");
	Editor.savedXml = xml;
	Editor.changeSaveAndLoadStatus();
};

Editor.isSaved = function () {
	return Editor.editor.getValue() == Editor.savedXml;
};

Editor.isLoadable = function () {
	return Editor.savedXml;
};

Editor.preview = function () {
	Editor.clearConsole();
	$("#json-result").hide();
	
	var xml = Editor.editor.getValue();
	
	Editor.appendToConsole("Compiling layout declaration from xml ...");
	var json;
	try {
		json = ZLong.compileJsonDeclarationFromXML(xml);
	} catch (e) {
		Editor.appendToConsole("XML error: " + e.message.replace(/^\s*(.*?)\s*$/, "$1"));
		Editor.appendToConsole("Compile failed.");
		return;
	}
	
	$("#json-result").show();
	$("#json-layout-decl").text(json.replace(/\,/g, ", ").replace(/\:/g, " : "));
	
	Editor.appendToConsole("Building layout ...");
	var root;
	try {
		root = ZLong.buildLayoutFromJsonDeclaration(json);
	} catch (e) {
		Editor.appendToConsole("Layout error: " + e.message);
		if (e.stack) {
			Editor.appendToConsole("Caused by:\n" + e.stack);
		}
		Editor.appendToConsole("Build failed.");
		return;
	}
	
	Editor.appendToConsole("Opening preview dialog ...");
	window.showModalDialog("editor.html?" + Math.random(), {editor : Editor, json : json}, "dialogWidth=400px,dialogHeight=300px");
};

Editor.createXMLEditor = function () {
	var el = document.getElementById("xml");
	Editor.editor = CodeMirror.editor = CodeMirror.fromTextArea(el, {
		mode: 'text/html',
		lineNumbers: true,
		closeTagIndent: [],
		tabSize: 4,
		indentUnit: 4,
		extraKeys: {
			"'>'": function(cm) { cm.closeTag(cm, '>'); },
			"'/'": function(cm) { cm.closeTag(cm, '/'); },
			"' '": function(cm) { CodeMirror.xmlHint(cm, ' '); },
			"'<'": function(cm) { CodeMirror.xmlHint(cm, '<'); },
			"Alt+/": function(cm) { CodeMirror.xmlHint(cm, ''); }
		}
	});
};

/**
 * 时间对象的格式化;
 */
Date.prototype.format = function(format) {
	/*
	 * eg:format="YYYY-MM-dd hh:mm:ss";
	 */
	var o = {
		"M+" : this.getMonth() + 1, //month
		"d+" : this.getDate(), //day
		"H+" : this.getHours(), //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth() + 3) / 3), //quarter
		"S+" : this.getMilliseconds()
	//millisecond
	}

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1,
				(this.getFullYear() + "")
						.substr(4 - RegExp.$1.length));
	}

	for ( var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1,
					RegExp.$1.length == 1 ? o[k] : ("00" + o[k])
							.substr(("00" + o[k]).length - RegExp.$1.length));
		}
	}
	return format;
}
