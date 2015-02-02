/**
 * 
 */
package com.ibm.sts.ucd.utils;

/**
 * @author Super Wang
 *
 */
public class StringUtils {
	
	public static boolean isBlank(String str) {
		return str == null || "".equals(str.trim());
	}

}
