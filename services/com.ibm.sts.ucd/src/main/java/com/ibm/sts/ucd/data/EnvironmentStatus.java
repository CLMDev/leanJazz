/**
 * 
 */
package com.ibm.sts.ucd.data;

import java.io.Serializable;
import java.util.LinkedList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Super Wang
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "EnvironmentStatus")
public class EnvironmentStatus implements Serializable {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 3351360939938590636L;
	
	@XmlAttribute(name = "online")
	private boolean online;
	@XmlElement(name = "resources")
	private final List<ResourceStatus> resources = new LinkedList<>();
	
	/**
	 * @return the online
	 */
	public boolean isOnline() {
		return online;
	}

	/**
	 * @param online the online to set
	 */
	public void setOnline(boolean online) {
		this.online = online;
	}
	
	/**
	 * @param status
	 */
	public void addResourceStatus(ResourceStatus status) {
		if (status != null) {
			this.resources.add(status);
		}
	}

}
