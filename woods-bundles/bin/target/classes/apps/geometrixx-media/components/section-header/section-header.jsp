<%--                                                                                                                                                                                     /libs/granite/ui/clientlibs/bootstrap/source/less/responsive-767px-max.less
  ADOBE CONFIDENTIAL
  __________________

   Copyright 2012 Adobe Systems Incorporated
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
%><%@include file="/apps/geometrixx-media/global.jsp" %>
<%@ page session="false"
         contentType="text/html; charset=utf-8"%><%
    String header = xssAPI.encodeForHTML( properties.get("headerSize", "h3" ) );
    
    if(header.contains("p")){
%>
    <div class="section-title clearfix">
        <p><%= properties.get("sectionHeaderText", i18n.get("Section Header")) %></p>
    </div>
<%
    } else {
%>
    <<%= header %>><span><%= xssAPI.encodeForHTML( properties.get("sectionHeaderText", i18n.get("Section Header")) ) %></span></<%= header %>>
<%
    }
%>


