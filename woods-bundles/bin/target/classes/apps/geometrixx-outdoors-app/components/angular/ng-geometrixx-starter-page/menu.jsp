<%--
  ADOBE CONFIDENTIAL
  __________________

   Copyright 2015 Adobe Systems Incorporated
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
%><%@include file="/apps/geometrixx-media/global.jsp" %><%
    String headerText = currentPage.getTitle();
    String headerImageXSS = xssAPI.getValidHref(currentPage.getProperties().get("headerImage", ""));
    boolean useImage = (headerImageXSS != null && headerImageXSS.length() > 0);
 
%><c:set var="useImage"><%= useImage %></c:set><%
%>
<nav id="menu" role="navigation">
    <ul>
        <li class="header"><%= i18n.get("Menu") %></li>
        <li ng-show="currentUser"><a href="#"><span class="topcoat-icon topcoat-icon--user left"></span>{{currentUser.username}}</a></li>
        <li class="with-icons"><a ng-click="updateApp($event)">Update</a><div class="spinner spin" ng-show="updating"></div></li>
    </ul>

    <span class="logo-wrapper">
      <div class="bottom-center">
          <c:choose>
              <c:when test="${useImage}">
                  <img class="logo" src="<%= headerImageXSS %>">
              </c:when>
              <c:otherwise>
                  <h4 class="menu-application-name"><%= xssAPI.encodeForHTML(headerText) %></h4>
              </c:otherwise>
          </c:choose>

      </div>
    </span>
</nav>