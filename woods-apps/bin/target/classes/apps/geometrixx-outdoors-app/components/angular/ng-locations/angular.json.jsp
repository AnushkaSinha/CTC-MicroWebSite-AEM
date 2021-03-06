<%--
    ADOBE CONFIDENTIAL
    __________________

     Copyright 2013 Adobe Systems Incorporated
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
%><%@ page session="false"
        import="com.day.cq.commons.TidyJSONWriter,
                java.util.List,
                com.adobe.cq.address.api.location.LocationManager,
                com.adobe.cq.address.api.location.Location,
                java.util.Iterator"%><%
%><%@include file="/libs/foundation/global.jsp"%><%
%><%@include file="utils.jsp" %><%

    response.setContentType("application/json");
    response.setCharacterEncoding("utf-8");

    //
    // Return all locations as JSON data
    //
    TidyJSONWriter writer = new TidyJSONWriter(response.getWriter());

    writer.setTidy(true);
    writer.object();
    writer.key("items");
    writer.array();

    String offlineStr = properties.get("./offline", "true");
    if (offlineStr.equalsIgnoreCase("true") || offlineStr.equalsIgnoreCase("on")) {
        LocationManager locMgr = slingRequest.getResourceResolver().adaptTo(LocationManager.class);
        List<Location> locationList = locMgr.getLocations(properties.get("./locations", String.class));

        if (locationList != null) {
            Iterator<Location> locationIter = locationList.iterator();
            while (locationIter.hasNext()) {
                writeLocation(writer, locationIter.next());
            }
        }
    }

    writer.endArray();
    writer.endObject();

    response.flushBuffer();

%>