﻿
(function() {

	CodeMirror.editor = null;

	CodeMirror.xmlHints = [];

	CodeMirror.xmlHint = function(cm, simbol) {

		if(simbol.length > 0) {
			var cursor = cm.getCursor();
			cm.replaceSelection(simbol);
			cursor = {line: cursor.line, ch: cursor.ch + 1};
			cm.setCursor(cursor);
		}

		// dirty hack for simple-hint to receive getHint event on space
		var getTokenAt = CodeMirror.editor.getTokenAt;

		CodeMirror.editor.getTokenAt = function() { return 'disabled'; }
		CodeMirror.simpleHint(cm, getHint);

		CodeMirror.editor.getTokenAt = getTokenAt;
	};

	var getHint = function(cm) {

		var cursor = cm.getCursor();

		if (cursor.ch > 0) {

			var text = cm.getRange({line: 0, ch: 0}, cursor);
			var typed = '';
			var simbol = '';
			for(var i = text.length - 1; i >= 0; i--) {
				if(text[i] == ' ' || text[i] == '<') {
					simbol = text[i];
					break;
				}
				else {
					typed = text[i] + typed;
				}
			}

			text = text.substr(0, text.length - typed.length);

			for (var path = getActiveElement(cm, text) + simbol;
					typeof CodeMirror.xmlHints[path] === 'undefined' && path.length > 1; 
					path = path.replace(/^\<.+?\>(.*)$/i, "$1")) {
				// wait
			}
			var hints = CodeMirror.xmlHints[path];

			if(typeof hints === 'undefined')
				hints = [''];
			else {
				hints = hints.slice(0);
				for (var i = hints.length - 1; i >= 0; i--) {
					if(hints[i].indexOf(typed) != 0)
						hints.splice(i, 1);
				}
			}

			return {
				list: hints,
				from: { line: cursor.line, ch: cursor.ch - typed.length },
				to: cursor,
			};
		};
	}

	var getActiveElement = function(codeMirror, text) {

		var element = '';

		if(text.length >= 0) {

			var regex = new RegExp('<([^!?][^\\s/>]*).*?>', 'g');

			var matches = [];
			var match;
			while ((match = regex.exec(text)) != null) {
				matches.push({
					tag: match[1],
					selfclose: (match[0].substr(-1) === '/>')
				});
			}

			for (var i = matches.length - 1, skip = 0; i >= 0; i--) {

				var item = matches[i];

				if (item.tag[0] == '/')
				{
					skip++;
				}
				else if (item.selfclose == false)
				{
					if (skip > 0)
					{
						skip--;
					}
					else
					{
						element = '<' + item.tag + '>' + element;
					}
				}
			}

			element += getOpenTag(text);
		}

		return element;
	};

	var getOpenTag = function(text) {

		var open = text.lastIndexOf('<');
		var close = text.lastIndexOf('>');

		if (close < open)
		{
			text = text.substr(open);

			if(text != '<') {

				var space = text.indexOf(' ');
				if(space < 0)
					space = text.indexOf('\t');
				if(space < 0)
					space = text.indexOf('\n');

				if (space < 0)
					space = text.length;

				return text.substr(0, space);
			}
		}

		return '';
	};

})();
