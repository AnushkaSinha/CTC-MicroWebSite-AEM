<%--
  Copyright 1997-2009 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  List component sub-script

  Draws a list item as a teaser.

  request attributes:
  - {com.day.cq.wcm.foundation.List} list The list
  - {com.day.cq.wcm.api.Page} listitem The list item as a page

--%><%
%><%@ page session="false" import="com.adobe.cq.social.journal.Journal,
                   com.adobe.cq.social.journal.JournalEntry,
                   com.adobe.cq.social.journal.JournalManager,
                   com.adobe.cq.social.commons.CollabUtil,
                   com.day.cq.commons.date.DateUtil,
                   com.day.cq.i18n.I18n,
                   com.day.cq.tagging.Tag,
                   com.day.cq.wcm.api.components.IncludeOptions,
                   com.day.cq.wcm.foundation.Paragraph,
                   com.day.cq.wcm.foundation.ParagraphSystem,
                   java.text.DateFormat,
                   java.util.Locale,
                   java.util.ResourceBundle" %>
<%
%><%@ include file="/libs/social/commons/commons.jsp"%><%

    JournalManager journalMgr = resource.getResourceResolver().adaptTo(JournalManager.class);
    JournalEntry entry = journalMgr.getJournalEntry(slingRequest, ((Page)request.getAttribute("listitem")).getPath());
    String title = entry.getTitle();
    String text = entry.getText();
    ParagraphSystem parsys = entry.getContentResource() != null ?
            new ParagraphSystem(entry.getContentResource()) : null;

    DateFormat dateFormat = DateUtil.getDateFormat(properties.get("dateFormat", String.class), DateFormat.getDateTimeInstance(DateFormat.LONG, DateFormat.SHORT, pageLocale), pageLocale);
    String date = entry.getDate() != null ? dateFormat.format(entry.getDate()) : "";

    String author = entry.getAuthor();
    String url = entry.getUrl();
    Tag[] tags = entry.getTags();

    int comments = entry.countComments();
%><div class="journalentry">
    <% if (entry.hasAttachments()) { %>
        <ul class="entry-image-list">
            <% for (Resource res : entry.getAttachments()) {
                final Resource contentRes = res.getChild("jcr:content");
                String mimeType = contentRes == null ? null : contentRes.adaptTo(ValueMap.class).get("jcr:mimeType", String.class);
                if (mimeType != null && mimeType.contains("image")) { %>
                    <li><a href="<%=xssAPI.getValidHref(res.getPath())%>"><img src="<%=res.getPath()%>.thumb.160.240.png"/></a></li>
            <% }
            } %>
        </ul>
    <% } %>
    <h2>
        <a href="<%= xssAPI.getValidHref(url) %>" <%
            %>rel="bookmark" <%
            %>title="<%= xssAPI.encodeForHTMLAttr(i18n.get("Permanent link to '{0}'", null, title)) %>" <%
            %>onclick="journalSearchTrackClick('<%= xssAPI.encodeForJSString(title) %>')"<%
        %>><%= xssAPI.filterHTML(title) %></a>
    </h2>
    <small><%= date %><%
        if (!Journal.ANONYMOUS.equals(author)) {
            %> <%= xssAPI.encodeForHTML(i18n.get("by {0}", "Text inserted just before displaying the author of a journal entry", author)) %><%
        }
    %></small>
    <div class="entry">
        <div class="snap_preview"><%
            if (parsys == null) {
                %><%= xssAPI.filterHTML(text) %><%
            } else {
                for (Paragraph par : parsys.paragraphs()) {
                    IncludeOptions.getOptions(request, true).forceSameContext(true);
                    %><%= ellipsize(xssAPI.filterHTML(entry.getText()), 200) %><%
                }
            }
            %> <a href="<%= xssAPI.getValidHref(url) %>" <%
                %>title="<%= xssAPI.encodeForHTMLAttr(entry.getTitle()) %>" <%
                     %>onclick="journalSearchTrackClick('<%= xssAPI.encodeForJSString(entry.getTitle()) %>')"<%
            %>><%= i18n.get("Read More", "Name of the link to jump to the full journal entry page") %> &raquo;</a><%
        %></div>
    </div>
    <p class="postmetadata"><%
        if (tags.length > 0) {
            %><%= xssAPI.filterHTML(i18n.get("Posted in {0}", null, entry.getTagsAsHTML(resourceBundle))) %> | <%
        }
        String editUrl = null;
        String deleteUrl = null;
        String user = loggedInUserName;
        if(entry!=null && (CollabUtil.hasModeratePermissions(entry.getTextComment().getResource()) || CollabUtil.isResourceOwner(entry.getTextComment().getResource()))){
            //replace with journal edit form
            //String editUrl = entry.getEditUrl(slingRequest);
            Journal journal = entry.getJournal();
            String formUrl = journal.getPage().getProperties().get("editForm", String.class);
            if(formUrl == null || formUrl==""){
                formUrl = journal.getUrl().replace(".html", "/editjournalform");
            }
            editUrl = entry.getUrl();
            editUrl = editUrl.replace(".html", ".form.html" + formUrl);
            
            deleteUrl = entry.getFullUrl();
            deleteUrl = deleteUrl.replace(".html", ".social.deletejournalentry.html");
        }
        
        if (editUrl != null) {
            %><a href="<%= xssAPI.getValidHref(editUrl) %>" <%
                %>title="<%= xssAPI.encodeForHTMLAttr(i18n.get("Edit '{0}'", "Name of the link to edit a journal entry", title)) %>"<%
            %>><%= i18n.get("Edit") %></a> | <%
        }
        
        if (deleteUrl != null) {
            %><a href="#"  onclick="$CQ.post('<%= xssAPI.getValidHref(deleteUrl) %>', function(data){location.reload();})"<%
                %>title="<%= xssAPI.encodeForHTMLAttr(i18n.get("Delete '{0}'", "Name of the link to delete a journal entry", title)) %>"<%
            %>><%= i18n.get("Delete") %></a> | <%
        } %>
        <div class="btn">
        <a class="comments" href="<%= xssAPI.getValidHref(url) %>#comments" <%
            %>title="<%= xssAPI.encodeForHTMLAttr(i18n.get("Comment on '{0}'", "Name of the link to view comments of a journal entry", title)) %>" <%
            %>onclick="journalSearchTrackClick('<%= xssAPI.encodeForJSString(title) %>')" <%
        %>><%
        if (comments == 0) {
            %><%= i18n.get("No comments yet") %><%
        } else {
            %><%= comments == 1 ? i18n.get("Comment", "Number of comments (only one)") : i18n.get("Comments", "Number of comments (multiple)") %> (<%= comments %>)<%
        }
        %></a></div>
    </p>
</div>

<%!
    private final static String NON_THIN = "[^iIl1\\.,']";

    private static int textWidth(String str) {
        return (int) (str.length() - str.replaceAll(NON_THIN, "").length() / 2);
    }

    public static String ellipsize(String text, int max) {

        if (textWidth(text) <= max)
            return text;

        // Start by chopping off at the word before max
        // This is an over-approximation due to thin-characters...
        int end = text.lastIndexOf(' ', max - 3);

        // Just one long word. Chop it off.
        if (end == -1)
            return text.substring(0, max - 3) + "...";

        // Step forward as long as textWidth allows.
        int newEnd = end;
        do {
            end = newEnd;
            newEnd = text.indexOf(' ', end + 1);

            // No more spaces.
            if (newEnd == -1)
                newEnd = text.length();

        } while (textWidth(text.substring(0, newEnd) + "...") < max);

        return text.substring(0, end) + "...";
    }
%>