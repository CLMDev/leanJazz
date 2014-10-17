/**
 * 
 */
package com.ibm.sts.ucd.web;

import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

import com.ibm.sts.ucd.services.UCDService;

/**
 * @author Super Wang
 *
 */
@ApplicationPath("rest")
public class ServiceRegistration extends Application {

	@Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> classes = new HashSet<Class<?>>();
        classes.add(UCDService.class);
        return classes;
    }

}
