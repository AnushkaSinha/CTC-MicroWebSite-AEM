<%@page session="false"%><%--
  Copyright 1997-2009 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Default content script.

  Draws the HTML content.

  ==============================================================================

--%>
<%@include file="/libs/foundation/global.jsp" %>
<div id="main">
    <div class="container_16">
        <div class="grid_16">
            <cq:include path="carousel" resourceType="foundation/components/carousel"/>
        </div>
        <div class="grid_12 body_container">
            <cq:include path="lead" resourceType="geometrixx/components/lead"/>
            <cq:include path="par" resourceType="foundation/components/parsys"/>
        </div>
        <div class="grid_4 right_container">
            <cq:include path="rightpar" resourceType="foundation/components/parsys"/>
        </div>
        <div class="clear"></div>
    </div>
</div>
