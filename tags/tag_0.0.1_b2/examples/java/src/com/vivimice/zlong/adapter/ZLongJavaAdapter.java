package com.vivimice.zlong.adapter;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Reader;
import java.util.HashMap;
import java.util.Map;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.json.JSONObject;

public class ZLongJavaAdapter {

	private ScriptEngine engine = new ScriptEngineManager().getEngineByName("js");
	
	public ZLongJavaAdapter(Reader zlongLibrary) throws ScriptException {
		engine.eval(zlongLibrary);
	}
	
	public ZLongJavaAdapter(String zlongLibrary) throws ScriptException {
		engine.eval(zlongLibrary);
	}
	
	public ZLongJavaAdapter(File zlongLibraryFile) throws ScriptException, FileNotFoundException {
		engine.eval(new FileReader(zlongLibraryFile));
	}
	
	public Map<String, ZLongRectangle> getNamedLayout(String declaration) throws ZLongException {
		String script = String.format("" +
				"try {" +
				"	var root = ZLong.buildLayoutFromJsonDeclaration('%s');" +
				"	root.updateLayout();" +
				"	'R' + ZLong.getNamedLayoutInJson(root);" +
				"} catch (e) {" +
				"	'E' + JSON.stringify(e);" +
				"}", declaration);
		char resultType;
		JSONObject jo;
		try {
			String result = (String) engine.eval(script);
			resultType = result.charAt(0);
			jo = new JSONObject(result.substring(1));
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
		
		if (resultType == 'E') {
			String message = jo.optString("message");
			String type = jo.optString("type");
			throw new ZLongException(String.format("%s: %s", type, message));
		}
		
		Map<String, ZLongRectangle> layoutMap = new HashMap<String, ZLongRectangle>();
		for (String name : JSONObject.getNames(jo)) {
			JSONObject rectJo = jo.optJSONObject(name).optJSONObject("boundry");
			ZLongRectangle rect = new ZLongRectangle();
			rect.setX(rectJo.optDouble("x", Double.NaN));
			rect.setY(rectJo.optDouble("y", Double.NaN));
			rect.setWidth(rectJo.optDouble("width", Double.NaN));
			rect.setHeight(rectJo.optDouble("height", Double.NaN));
			layoutMap.put(name, rect);
		}
		return layoutMap;
	}
	
}
