<%@page session="false"%><%--
  ADOBE CONFIDENTIAL
  __________________

   Copyright 2014 Adobe Systems Incorporated
   All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%><%
%><%@include file="/libs/foundation/global.jsp"%>
<%@include file="/apps/geometrixx-gov/components/util/afutil.jsp" %><%
%><%@ page import="com.day.cq.commons.Doctype,
        com.day.cq.wcm.api.PageFilter,
        com.day.cq.wcm.foundation.Navigation,
		org.apache.sling.api.resource.ResourceResolver,
        com.day.text.Text" %><%

	Page servicesHomePage = currentPage.getAbsoluteParent(3);
	Page govHomePage = currentPage.getAbsoluteParent(2);

	//Fix for adaptive form page rendition. AF doesn't have parent page, so creating current page as home page.
	if(servicesHomePage==null){

        servicesHomePage=currentPage;
    }
    String servicesHome = servicesHomePage != null ? servicesHomePage.getPath() : Text.getAbsoluteParent(currentPage.getPath(), 3);
	String govHome = govHomePage != null ? govHomePage.getPath() : Text.getAbsoluteParent(currentPage.getPath(), 2);

    int absParent = currentStyle.get("absParent", 3);

	//Fix for Naviagtion of adaptive form
    if(servicesHome.contains(afHome))
        {
            servicesHome = getSiteRootForAF(servicesHome,afHome,resourceResolver);
        	govHome = getSiteRootForAF(govHome,afHome,resourceResolver);
        }
    if(servicesHome.contains(afMetadataHome))
        {
            servicesHome = getSiteRootForAF(servicesHome,afMetadataHome,resourceResolver);
        	govHome = getSiteRootForAF(govHome,afMetadataHome,resourceResolver);
        }

	currentPage = resourceResolver.resolve(servicesHome).adaptTo(Page.class);
	PageFilter filter = new PageFilter(request);
    Navigation nav = new Navigation(currentPage, absParent, filter, 2);
    String xs = Doctype.isXHTML(request) ? "/" : "";

    // help linkchecker to increase performance
    String linkCheckerHint = filter.isIncludeInvalid() ? "" : "x-cq-linkchecker=\"valid\"";

%><div class="topnav">

        <ul id="topnav" class="nav navbar-nav navbar-left">

            <%
                for (Navigation.Element e: nav) {
                    switch (e.getType()) {
                       case NODE_OPEN:
                            %><ul><%
                            break;
                        case ITEM_BEGIN:
                            %><li <%= e.hasChildren() ? "class=\"noleaf\"" : "" %>><a href="<%= xssAPI.getValidHref(e.getPath()) %>.html" <%= linkCheckerHint %>><%= xssAPI.encodeForHTML(e.getTitle()) %></a><%
                            break;
                        case ITEM_END:
                            %></li><%
                            break;
                        case NODE_CLOSE:
                            %></ul><%
                            break;
                    }
                }

                %>
                <li class="home"><a href="<%= xssAPI.getValidHref(govHome) %>.html">Main Site<%=xs%></a></li>



            <li class="sep1">&nbsp;</li>
        </ul>
      </div>

