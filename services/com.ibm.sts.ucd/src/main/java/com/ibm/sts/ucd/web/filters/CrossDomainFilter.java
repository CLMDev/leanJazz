package com.ibm.sts.ucd.web.filters;

import java.io.IOException;

import javax.servlet.DispatcherType;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet Filter implementation class CrossDomainFilter
 */
@WebFilter(
		dispatcherTypes = {
				DispatcherType.REQUEST, 
				DispatcherType.FORWARD, 
				DispatcherType.INCLUDE, 
				DispatcherType.ERROR
		}, 
		urlPatterns = { 
				"/rest/ucd/*"
		})
public class CrossDomainFilter implements Filter {

	/**
	 * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
	 */
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		HttpServletResponse resp = (HttpServletResponse) response;
		resp.addHeader("Access-Control-Allow-Origin", "*");
		resp.addHeader("Access-Control-Max-Age", "3600");
		resp.addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
		resp.addHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With, Host, User-Agent, Accept, Accept-Language, Accept-Encoding, Accept-Charset, Keep-Alive, Connection, Referer, Origin, UCD_SERVER, UCD_USERNAME, UCD_PASSWORD");
		
		chain.doFilter(request, response);
	}

	/**
	 * @see Filter#destroy()
	 */
	@Override
	public void destroy() {
	}

	/**
	 * @see Filter#init(FilterConfig)
	 */
	@Override
	public void init(FilterConfig fConfig) throws ServletException {
	}

}
