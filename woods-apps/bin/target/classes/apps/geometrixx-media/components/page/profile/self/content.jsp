<%@ taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %>
<%--
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
%><%@include file="/apps/geometrixx-media/global.jsp" %><%
%><%@ page import="com.day.cq.wcm.foundation.forms.FormsHelper, org.apache.sling.api.SlingHttpServletRequest, java.text.SimpleDateFormat, com.day.cq.wcm.api.WCMMode, org.apache.sling.settings.SlingSettingsService, com.day.cq.personalization.UserPropertiesUtil, org.apache.sling.api.resource.Resource, java.util.List, com.day.cq.wcm.commons.WCMUtils, com.adobe.cq.social.ugcbase.SocialUtils, com.adobe.cq.social.scf.ClientUtilityFactory, com.adobe.cq.social.scf.ClientUtilities, org.apache.jackrabbit.api.security.user.Authorizable, com.adobe.cq.social.messaging.client.api.MessagingUser, com.adobe.cq.social.scf.User" %><%
%><%@page session="false" %>
<%
	String currentUserProfilePath = request.getRequestURI().split(".form.html")[0];
	Node currentUserProfileNode = resourceResolver.resolve(currentUserProfilePath).adaptTo(Node.class);
	boolean isAuthorMode = WCMMode.fromRequest(request) != WCMMode.DISABLED && !sling.getService(SlingSettingsService.class).getRunModes().contains("publish");
%>
<div class="profile-self">
    <%--<cq:include path="start" resourceType="foundation/components/form/start"/>
    <cq:include script="4x8col.jsp"/>
    <cq:include path="end" resourceType="foundation/components/form/end"/>--%>

	<div class="community-header">
		<div class="category-title">
			<nav class="breadcrumbs">
				<a href="#">Home</a>
				<span>&gt;</span>
				<span>My Profile</span>
			</nav>
			<div class="row-fluid">
				<span class="span12 title">My Profile</span>
				<nav class="profile-links">
					<a href="#">Edit Profile</a>
					<span class="divider">|</span>
				</nav>
			</div>
			<div class="row-fluid">
				<hr class="span12 stripeHr">
			</div>
			<%
	        	if (isAuthorMode) {%>
				<script type="text/javascript">
					CQ.WCM.edit({"path":"/content/geometrixx-media/en/community/jcr:content/category-title","type":"geometrixx-media/components/category-title","csp":"community|page/category-title"});
				</script>
				<%}%>
		</div>
	</div>

	<cq:include path="superParsys" resourceType="wcm/foundation/components/responsivegrid"/>
	<cq:include path="start" resourceType="foundation/components/form/start"/>
	<div class="row-fluid">
		<div class="span4">
			<div class="parsys grid-4-par">
				<div class="section-title clearfix">
					<p>user profile</p>
				</div>
			</div>

			<div class="parsys grid-4-par">
				<div class="user-detail clearfix">
					<div class="user-detail-left span6">
						<%
							//set the formshelper to be readonly, so we do NOT get the upload field here
							FormsHelper.setFormReadOnly((SlingHttpServletRequest)request);
						%>
						<cq:include path="right-par/image" resourceType="geometrixx-media/components/image"/>
						<cq:include path="togglerelation" resourceType="social/activitystreams/components/togglerelation"/>
						<%
                            final boolean isAnon = UserPropertiesUtil.isAnonymous(slingRequest);
                            List<Resource> resources = FormsHelper.getFormEditResources(slingRequest);
                            String userID = "";
                            if (resources != null && resources.size() > 0) {
                                final Resource userRes = resources.get(0);
                                Authorizable auth = userRes.getParent().adaptTo(Authorizable.class);
                                userID = auth.getID();
                            }

                            SocialUtils socialUtils = slingRequest.getResourceResolver().adaptTo(SocialUtils.class);
                            ClientUtilityFactory clientUtilsFactory = sling.getService(ClientUtilityFactory.class);
                            ClientUtilities clientUtils = clientUtilsFactory.getClientUtilities(xssAPI, slingRequest, socialUtils);

                            User user = clientUtils.getUser(userID, slingRequest.getResourceResolver(), MessagingUser.RESOURCE_TYPE);
                            String authorPath = user.getId().getResourceIdentifier();
                            String authorName = user.getName();

                            final String composeMessagePagePath = WCMUtils.getInheritedProperty(currentPage,
                                    resourceResolver, "cq:composeMessagePage");
                            final String composeUrl = xssAPI.getValidHref(composeMessagePagePath) + ".html?topath=" +
                                    xssAPI.encodeForHTMLAttr(authorPath) + "&toname=" + xssAPI.encodeForHTMLAttr(authorName);
                            if (!isAnon) {
                        %>
                        <a href="<%=composeUrl%>"><%=i18n.get("Private Message")%></a>
                        <%
                            }
                        %>
					</div>
					<div class="user-detail-right span6">
						<cq:include path="user-badge" resourceType="/apps/geometrixx-media/components/badgelist" />
						<%
							String memberSince, location, posts, comments, upvotes;
							memberSince = location = posts = comments = upvotes = "";

							//memberSince
							if (currentUserProfileNode.hasProperty("memberSince")) {
								memberSince = new SimpleDateFormat("dd MMM yyyy").format(currentUserProfileNode.getProperty("memberSince").getDate().getTime());
							}

							//location
							if (currentUserProfileNode.hasProperty("city")) {
								if (currentUserProfileNode.hasProperty("region")) {
									location = currentUserProfileNode.getProperty("city").getString() + ", " + currentUserProfileNode.getProperty("region").getString();
								} else {
									location = currentUserProfileNode.getProperty("city").getString();
								}
							} else if (currentUserProfileNode.hasProperty("region")) {
								location = currentUserProfileNode.getProperty("region").getString();
							}
						%>
						<ul>
							<li>
								<p>Joined</p>
								<span><%=xssAPI.encodeForHTML(memberSince)%></span>
							</li>
							<li>
								<p>Location</p>
								<span><%=xssAPI.encodeForHTML(location)%></span>
							</li>
							<li>
								<cq:include path="left-par/community-score" resourceType="foundation/components/form/text"/>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<%
				if (currentNode.hasNode("./social/relationships/following")) {
					Node socialNode = currentNode.getNode("./social/relationships/following");

				}
			%>
			<cq:include path="peopleboxlist" resourceType="geometrixx-media/components/peopleboxlist"/>


			<div class="parsys grid-4-par">
			</div>
		</div>
		<div class="span8">
			<div class="parsys grid-8-par">
				<div class="personal-info section">
					<div class="personal-info">

						<div class="section-title clearfix">
							<p>recent activities</p>
						</div>

						<div class="topic-list">
							<cq:include path="useractivities" resourceType="geometrixx-media/components/social/activitystreams/useractivities" />
						</div>
					</div>
					<script type="text/javascript">
						$CQ(function(){
							CQ.soco.commons.attachToPagination($CQ("#pagination"), $CQ(".topics>ul"), 0, 25, "/content/geometrixx-media/en/community/jcr:content/grid-8-par/forum");
						});
					</script>
								<%
	        	if (isAuthorMode) {%>

					<script type="text/javascript">
						CQ.WCM.edit({"path":"/content/geometrixx-media/en/community/jcr:content/grid-8-par/forum","dialog":"/libs/social/forum/components/forum/dialog","type":"geometrixx-media/components/social/forum/components/forum","csp":"community|page/grid-8-par|parsys/forum","isContainer":true,"editConfig":{"listeners":{"afterinsert":"REFRESH_PAGE","afteredit":"REFRESH_PAGE"},"actions":[CQ.wcm.EditBase.EDIT,CQ.wcm.EditBase.COPYMOVE,CQ.wcm.EditBase.DELETE,CQ.wcm.EditBase.INSERT,{"xtype":"tbseparator","jcr:primaryType":"nt:unstructured"},{"handler":"function(){CQ.soco.commons.openModeration();}","jcr:primaryType":"nt:unstructured","text":"Manage comments"}]}});
					</script>
					<%}%>
				</div>
				<div class="new section">
							<%
	        	if (isAuthorMode) {%>

					<script type="text/javascript">
						CQ.WCM.edit({"path":"/content/geometrixx-media/en/community/jcr:content/grid-8-par/*","type":"foundation/components/parsys/new","csp":"community|page/grid-8-par|parsys/new","editConfig":{"actions":[CQ.wcm.EditBase.INSERT],"disableTargeting":true}});
					</script>
					<%}%>
				</div>
							<%
	        	if (isAuthorMode) {%>
				<script type="text/javascript">
					CQ.WCM.edit({"path":"/content/geometrixx-media/en/community/jcr:content/grid-8-par","type":"foundation/components/parsys","csp":"community|page/grid-8-par|parsys","isContainer":true});
				</script>
				<%}%>
			</div>
		</div>
	</div>

</div>
<script type="text/javascript">
	$(document).ready(function() {
		$('.form_mv_add').hide();
	});
</script>
