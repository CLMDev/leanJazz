/**
 * 
 */
package com.ibm.sts.ucd.data;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Super Wang
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "ResourceStatus")
public class ResourceStatus {
	
	@XmlAttribute(name = "name")
	public final String name;
	@XmlAttribute(name = "status")
	public final String status;
	
	/**
	 * @param name
	 * @param status
	 */
	public ResourceStatus(String name, String status) {
		super();
		this.name = name;
		this.status = status;
	}

}
