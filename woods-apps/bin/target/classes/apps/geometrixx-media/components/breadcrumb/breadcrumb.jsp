<%@page session="false"%><%--
  Copyright 1997-2008 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Breadcrumb component

  Draws the breadcrumb

--%><%@include file="/libs/foundation/global.jsp"%><%
%>
<nav class="breadcrumbs">
<%

    // get starting point of trail
    long level = currentStyle.get("absParent", 2L);
    long endLevel = currentStyle.get("relParent", 1L);
    String delimStr = currentStyle.get("delim", "<span>&nbsp;&gt;&nbsp;</span>");
    String trailStr = currentStyle.get("trail", "");
    int currentLevel = currentPage.getDepth();
    String delim = "";
    while (level < currentLevel - endLevel) {
        Page trail = currentPage.getAbsoluteParent((int) level);
        if (trail == null) {
            break;
        }
        String title = trail.getTitle();
        if (title == null || title.equals("")) {
            title = trail.getTitle();
            log.info("title is: "+ title);
        }
        if (title == null || title.equals("")) {
            title = trail.getName();
            log.info("name is: "+ title);
        }
        if(title.equals("English") || title.equals("en")){
            title="Home";
        }
        %><%= xssAPI.filterHTML(delim) %><%
        %><a href="<%= xssAPI.getValidHref(trail.getPath()+".html") %>"
             onclick="CQ_Analytics.record({event:'followBreadcrumb',values: { breadcrumbPath: '<%= xssAPI.getValidHref(trail.getPath()) %>' },collect: false,options: { obj: this },componentPath: '<%=resource.getResourceType()%>'})"><%
        %><%= xssAPI.encodeForHTML(title) %><%
        %></a><%
        
        delim = delimStr;
        level++;
        
        if(level == (currentLevel - endLevel)){
                   %><span> > </span> <span><%=currentPage.getTitle()%></span> <%
        }
        
    }
    if (trailStr.length() > 0) {
        %><%= xssAPI.filterHTML(trailStr) %><%
    }

%>
</nav>