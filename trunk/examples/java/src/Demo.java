import java.io.File;
import java.util.Map;

import com.vivimice.zlong.adapter.ZLongJavaAdapter;
import com.vivimice.zlong.adapter.ZLongRectangle;

/**
 * Demostration of ZLongJavaAdpater usage
 * 
 * @author vivimice
 *
 */
public class Demo {

	private final static String LAYOUT_DECLARATION = "{\"type\" : \"hbox\", \"children\" : [{\"type\" : \"content\", \"name\" : \"A\", \"width\" : \"100\", \"height\" : \"200\", \"children\" : []}, {\"type\" : \"content\", \"name\" : \"B\", \"width\" : \"50\", \"height\" : \"100\", \"children\" : []}, {\"type\" : \"vbox\", \"name\" : \"C\", \"children\" : [{\"type\" : \"content\", \"name\" : \"D\", \"width\" : \"100\", \"height\" : \"200\", \"children\" : []}, {\"type\" : \"content\", \"name\" : \"E\", \"width\" : \"50\", \"height\" : \"100\", \"children\" : []}]}]}";
	
	public static void main(String[] args) throws Exception {
		// Create an adapter instance
		// An adapter needs to load zlong libraries, here use a File object and a relative path
		//
		// String is also acceptable
		//
		// String zlongLibraryContent = <contents-of-zlong-library>;
		// ZLongJavaAdapter adapter = new ZLongJavaAdapter(zlongLibraryContent);
		File zlongLibrary = new File(Demo.class.getResource(".").toURI().resolve("../../../lib/zlong-0.0.1-b1.js"));
		ZLongJavaAdapter adapter = new ZLongJavaAdapter(zlongLibrary);
		
		// Use ZLongJavaAdapter to calculate layout from layout declaration
		// Layout declarations can be generated from layout editor (editor.html)
		Map<String, ZLongRectangle> layoutMap = adapter.getNamedLayout(LAYOUT_DECLARATION);
		System.out.println(layoutMap);
	}
	

}
