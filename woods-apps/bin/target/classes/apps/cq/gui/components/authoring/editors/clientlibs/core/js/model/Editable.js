/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
;(function ($, ns, channel, window, undefined) {
    "use strict";

    /**
     * Represents the cq:EditConfig object.
     * Contains all the properties defined on the Component level to configure the editing behavior of the Editable.
     *
     * @typedef {object} Granite.author.Editable~EditConfig
     *
     * @property {Object[]}     [actions=['EDIT', 'ANNOTATE']] - List of the actions available on the Editable
     * @property {Object[]}     [dropTargets] - List of asset types and groups allowed to be dropped on the Editable
     * @property {boolean}      [orderable=true] - Indicates if the Editable is orderable or not
     * @property {{}}           [inplaceEditingConfig] - Defines the in place editing configuration of the Editable
     * @property {Object}       [listeners] - Contains the different cq:listeners defined for the Editable.<br>All listeners are no operations by default.<br>Inside all listeners, "this" refers to the current Editable.
     * @property {function}     [listeners.beforedelete=function (deleteFunction) {}]
     * @property {function}     [listeners.beforeedit=function (editFunction, properties) {}]
     * @property {function}     [listeners.beforecopy=function (copyFunction) {}]
     * @property {function}     [listeners.beforemove=function (moveFunction) {}]
     * @property {function}     [listeners.beforechildinsert=function (insertFunction, component) {}]
     * @property {function}     [listeners.beforechilddelete=function (deleteFunction, childEditable) {}]
     * @property {function}     [listeners.beforechildedit=function (editFunction, properties, childEditable) {}]
     * @property {function}     [listeners.beforechildcopy=function (copyFunction, childEditable) {}]
     * @property {function}     [listeners.beforechildmove=function (moveFunction, childEditable) {}]
     * @property {function}     [listeners.afterdelete=function () {}]
     * @property {function}     [listeners.afteredit=function () {}]
     * @property {function}     [listeners.aftercopy=function () {}]
     * @property {function}     [listeners.afterinsert=function () {}]
     * @property {function}     [listeners.aftermove=function () {}]
     * @property {function}     [listeners.afterchildinsert=function (childEditable) {}]
     * @property {function}     [listeners.afterchilddelete=function (childEditable) {}]
     * @property {function}     [listeners.afterchildedit=function (childEditable) {}]
     * @property {function}     [listeners.afterchildcopy=function (childEditable) {}]
     * @property {function}     [listeners.afterchildmove=function (childEditable) {}]
     * @property {function}     [listeners.updatecomponentlist=function (cellSearchPath, allowedComponents, components) {}]
     */

    /**
     * Represents the Editable Configuration object.
     * Contains all the properties that configure the different aspects of the Editable
     *
     * @typedef {object} Granite.author.Editable~Config
     *
     * @property {string} csp                           - Cell Search Path expression. It is a path expression where (1) the slash is the delimiter, (2) the pipe represents a variation and (3) chunks are component type names.<br>Example: "contentpage|page/title"
     * @property {string[]} cellSearchPath              - Computed list of all Cell Search Paths (derived from the csp expression). It is used to retrieve the corresponding component's design cell.<br>Example: ["contentpage/title", "page/title", "contentpage", "page", "title"]
     * @property {Granite.author.Editable~EditConfig} childConfig               - Provides all the edit behavior that the children of the Editable will inherit
     * @property {string} dialog                        - Path to the cq:dialog node
     * @property {string} dialogClassic                 - Path to the dialog node (Classic UI)
     * @property {string} dialogSrc                     - URL of dialog (including content suffix) that will be used to configure Editable content properties
     * @property {boolean} isDropTarget                 - Indicates if the Editable could be used as a drop target
     * @property {string} path                          - Path to the corresponding Editable in the repository
     * @property {Granite.author.Editable~EditConfig} editConfig                - Provides all the edit behavior of the Editable
     * @property {string} type                          - Sling resource type of the corresponding Component
     */

    var dropTargetPrefix = '.cq-dd-';
    // Describes the associated DOM element of an Editable (in the ContentFrame)
    var editableDomClass = 'cq-Editable-dom';
    // Describes the associated DOM element of an Editable, that's also a container
    var editableDomContainerClass = 'cq-Editable-dom--container';

    var defaults = {
        /**
         * Default editConfig passed to the children of any container (if the container component doesn't define its own childConfig)
         */
        childConfig: {
            actions: ['EDIT', 'ANNOTATE', 'COPY', 'MOVE', 'DELETE', 'INSERT']
        },
        /**
         * Default editConfig passed when the component doesn't define one
         */
        editConfig: {
            actions: ['EDIT', 'ANNOTATE'],
            orderable: true,
            listeners: {
                // All listeners are always filled with an empty function (default parameters are documented here)
                // NB: For all listeners function, "this" always refers to the editable on which the listener is defined
                beforedelete: function (deleteFunction) {},
                beforeedit: function (editFunction, properties) {},
                beforecopy: function (copyFunction) {},
                beforemove: function (moveFunction) {},
                beforechildinsert: function (insertFunction, component) {},
                beforechilddelete: function (deleteFunction, childEditable) {},
                beforechildedit: function (editFunction, properties, childEditable) {},
                beforechildcopy: function (copyFunction, childEditable) {},
                beforechildmove: function (moveFunction, childEditable) {},
                afterdelete: function () {},
                afteredit: function () {},
                aftercopy: function () {},
                afterinsert: function () {},
                aftermove: function () {},
                afterchildinsert: function (childEditable) {},
                afterchilddelete: function (childEditable) {},
                afterchildedit: function (childEditable) {},
                afterchildcopy: function (childEditable) {},
                afterchildmove: function (childEditable) {},
                updatecomponentlist: function (cellSearchPath, allowedComponents, components) {}
            }
        },

        isDropTarget: true
    };

    /**
     * @classdesc An Editable represents the basic JS entity on which we can perform editing / authoring related actions (in-place edit, properties configuration via dialog, copy/cut/paste/delete, etc.)
     *
     * All the Editables of a given page are stored in {@link Granite.author.editables}.
     *
     * @class
     * @alias Granite.author.Editable
     * @extends Granite.author.Inspectable
     *
     * @param {jQuery} dom - The content DOM corresponding to the HTML rendered by the corresponding component included by the page.
     */
    ns.Editable = ns.util.extendClass(ns.Inspectable, /** @lends Granite.author.Editable.prototype */ {

        constructor: function (config, dom) {
            // Constructor should be used with one parameter (dom element), // FIXME
            // (Legacy: it could also be used with two (config, dom) (in this case, DOM is optional))

            // First argument is the DOM element (= HTML rendered by the component) that will be represented by the Editable
            if (arguments.length === 1 && !arguments[0].path) {
                var $cqDOM = $(config);
                dom = $cqDOM.parent();
                config = ns.configParser($cqDOM.data("config"));

            }

            // Call super constructor; at this point:
            //  "config" = the configuration properties (as a JS object)
            //  "dom" = the DOM element (= the HTML rendered by the component) represented by the Editable
            ns.Editable.super_.constructor.call(this, config, dom);

            /**
             * For allowedComponents, use {@link Granite.author.components.allowedComponentsFor} instead
             * @ignore
             * @deprecated
             */
            this.design = {};

            /**
             * List of drop targets defined in the config
             * @ignore
             */
            this.dropTargets = null;

            /**
             * Original configuration object reused when updating the instance without providing a new configuration
             *
             * <p><i>Raw/unmodified configuration as it has been given during the instantiation</i></p>
             * @ignore
             * @private
             */
            this._originalConfig = Granite.Util.applyDefaults({}, config);

            // Actually load the full config
            this.updateConfig(config);

            // Add required CSS classes (requires the config to be updated)
            this._adaptDOM();
        },

        /**
         * Returns the drop targets available on the Editable
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param {string} [id] - If passed a single drop target object will be returned (the one matching the identifier)
         * @returns {Array|Object} Returns the drop targets of the Editable (null if not found or empty)
         */
        getDropTarget: function (id) {
            if( !this.onPage() ) {
                return null;
            }

            var ret = [];


            for (var i=(this.dropTargets.length||0); i > 0; i--) {
                var dt = this.dropTargets[i-1];

                if (id && dt.id !== id) {
                    continue;
                }

                if (!dt.dom || !$.contains(document.documentElement, dt.dom[0])) { // no dom assigned or detached from DOM
                    dt.dom = this.dom.find(dropTargetPrefix + dt.id);
                    dt.dom = dt.dom.length === 0 ? null : dt.dom;
                }

                if (id && dt.id === id) {
                    return dt;
                }

                ret.push(dt);
            }

            return ret.length ? ret : null;
        },

        /**
         * Actions are ready to be loaded (use this hook in subclasses to update the list of available actions)
         *
         * @memberOf Granite.author.Editable.prototype
         */
        actionsUpdated: function () {
            if (this.isStructureLocked()) {
                this.config.editConfig.actions = [];
            }
        },
        /**
         * Adapts backend cq:actions to the frontend logic
         *
         * @ignore
         * @private
         * @memberOf Granite.author.Editable.prototype
         */
        _adaptActions: function () {
            if (this.config && this.config.editConfig) {
                if (this.config.editConfig.actions && this.config.editConfig.actions.length > 0) {

                    var editConfig = this.config.editConfig;
                    // For every entry in the input array potentially return an array of corresponding actions
                    editConfig.actions = editConfig.actions.map(function (action) {
                        switch (action) {
                            case "EDIT":
                                return ["EDIT", "CONFIGURE"];

                            case "EDITANNOTATE":
                                return ["EDIT", "CONFIGURE", "ANNOTATE"];

                            case "COPYMOVE":
                                return ["COPY", "CUT", "MOVE"]; // NB: 'COPY' and 'MOVE' are used on the client-side only: the proper cq:action value is 'COPYMOVE'

                            case "MOVE":
                                return ["CUT", "MOVE"];

                            case "INSERT":
                                return ["INSERT", "PASTE"];

                            default:
                                return [action];

                        }
                    });

                    // Flatten it back to a one dimensional array
                    editConfig.actions = editConfig.actions.reduce(function (a, b) {
                        return a.concat(b);
                    });

                    if (this.actionsUpdated && typeof this.actionsUpdated === 'function') {
                        this.actionsUpdated();
                    }
                }
            }
        },

        /**
         * Builds the configuration based on the given configuration object, parent configuration and default configuration
         *
         * @private
         * @memberOf Granite.author.Editable.prototype
         *
         * @param {Granite.author.Editable~Config} config - Configuration object
         */
        _buildConfig: function (config) {
            var cfg;
            var parent = this.getParent();

            if (parent) {
                // Inherit edit config from parent if existing
                var parentChildConfig = {
                    editConfig: parent.config.childConfig ? parent.config.childConfig : {}
                };

                cfg = Granite.Util.applyDefaults({}, defaults, parentChildConfig, config);
            } else {
                cfg = Granite.Util.applyDefaults({}, defaults, config);
            }

            // If the configuration provided by the server has no edit configuration
            // AND has no dialog
            // Then it means the component shouldn't be editable
            // Therefore no default configuration should be provided
            if (!config.dialog && !config.editConfig) {
                cfg.editConfig = {};
                cfg.editConfig.actions = cfg.editConfig.actions || [];
                cfg.editConfig.orderable = cfg.editConfig.orderable || false;
                cfg.editConfig.listeners = cfg.editConfig.listeners || defaults.editConfig.listeners;
            }

            // No action allowed on the root container
            if (!parent && cfg.isContainer) {
                cfg.editConfig.actions = [];
            }

            /**
             * The computed configuration object (built via [Editable#_buildConfig]{@link Granite.author.Editable#_buildConfig})
             * @type {Granite.author.Editable~Config}
             */
            this.config = cfg;

            // Lazy computation since cellSearchPath computation is expensive
            Object.defineProperty(this.config, "cellSearchPath", {
                get: function() {
                    return ns.calculateSearchPaths(cfg.csp);
                }
            });

            this._adaptActions();
        },


        /**
         * Adapts the Editable DOM according to its config
         *
         * @ignore
         * @private
         */
        _adaptDOM: function () {
            // Ignore Editables with no DOM attached or disabled Editables
            if (this.dom && this.hasActionsAvailable()) {
                this.dom.addClass(editableDomClass);

                if (this.config.isContainer) {
                    // Allows to style the containers (e.g., adding margin)
                    this.dom.addClass(editableDomContainerClass);
                }
            }
        },


        /**
         * Loads the current configuration
         *
         * @ignore
         * @private
         * @memberOf Granite.author.Editable.prototype
         */
        _loadConfig: function () {
            var cfg = this.config;

            // Set path first so that a _jcr_content will be normalized to jcr:content
            this.path = cfg.path;
            this.slingPath = cfg.slingPath;
            this.type = cfg.type;

            // Technical name of the resource
            // TODO first check for the existence of the title/name property
            this.name = cfg.path.replace(/(.)+\//, "") || "";

            // Depth under the jcr:content
            this.depth = "" + (cfg.path.replace(/\/(.)+\/jcr:content/, "").match(/\//g) || []).length;

            this.dropTargets = (cfg.editConfig ? cfg.editConfig.dropTarget : null) || [];

            // Find out if the element is a drop target
            cfg.isDropTarget = $.inArray("INSERT", cfg.editConfig.actions) > -1;

            // Handle touch ui additionnal "group" action
            if (cfg.editConfig.actions.length > 0 &&
                ($.inArray("COPY", cfg.editConfig.actions) > -1 ||
                $.inArray("COPYMOVE", cfg.editConfig.actions) > -1 ||
                $.inArray("DELETE", cfg.editConfig.actions) > -1) &&
                $.inArray("GROUP", cfg.editConfig.actions) === -1) {

                cfg.editConfig.actions.push("GROUP");
            }

            // Handle touch ui additionnal "parent" action
            if (ns.editables.getSelectableParents(this).length !== 0) {
                cfg.editConfig.actions.push("PARENT");
            }

            cfg.editConfig.orderable = cfg.editConfig.actions.indexOf("MOVE") !== -1;

            //
            // Evaluate listeners
            //
            // Map listener shortcuts to actual functions
            $.each(cfg.editConfig.listeners, function (point, val) {
                // Stop proceeding if the given value is already a Function
                if ($.isFunction(val)) {
                    return true;
                }

                switch (val) {
                    case 'REFRESH_SELF':
                        cfg.editConfig.listeners[point] = function () {
                            ns.edit.EditableActions.REFRESH.execute(this);
                        };
                        break;
                    case 'REFRESH_PAGE':
                        cfg.editConfig.listeners[point] = function () {
                            ns.ContentFrame.reload();
                        };
                        break;
                    case 'REFRESH_PARENT':
                        cfg.editConfig.listeners[point] = function () {
                            var parent = ns.editables.getParent(this);
                            if (parent) {
                                ns.edit.EditableActions.REFRESH.execute(parent);
                            }
                        };
                        break;
                    case 'REFRESH_INSERTED':
                        // Don't do anything; the "refresh inserted" behavior is already the default one
                        cfg.editConfig.listeners[point] = function () {};
                        break;
                    default:
                        // Other values are inline functions
                        cfg.editConfig.listeners[point] = ns.util.sanitizeCQHandler(val);
                        break;
                }
            });

            //
            // Evaluate actions
            //
            $.each(cfg.editConfig.actions, function (i, val) {
                // Stop proceeding if the given value is not an object
                if (!$.isPlainObject(val)) {
                    return true;
                }

                // The entry needs a handler AND an icon
                if (val.handler) {
                    cfg.editConfig.actions[i] = {
                        // in case of no name, let's fallback to text
                        name: val.name || val.text,
                        handler: ns.util.sanitizeCQHandler(val.handler),
                        condition: ns.util.sanitizeCQHandler(val.condition),
                        icon: val.icon,
                        text: val.text
                    };
                } else {
                    cfg.editConfig.actions[i] = null;
                }
            });

            // Clean previously nullified actions
            cfg.editConfig.actions = cfg.editConfig.actions.filter(function (elem) {
                return elem;
            });
        },

        /**
         * Updates the config from the given config passed
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param {Granite.author.Editable~Config} config
         */
        updateConfig: function (config) {
            config = config ? config : this._originalConfig;

            if (config) {
                this._buildConfig(config);
                this._loadConfig();
            }
        },

        /**
         * Tells if in-place edit is possible on the editable
         * For instance, of in-place editor is the image editor, it returns true only if the editable has an image to edit
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @returns {Boolean} Indicates if the editable can be in-place edited
         */
        canInPlaceEdit: function () {
            var inPlaceEditConfig = this.config.editConfig.inplaceEditingConfig;
            var isActive = inPlaceEditConfig && inPlaceEditConfig.active;
            var inPlaceEditor = inPlaceEditConfig && ns.editor.registry[inPlaceEditConfig.editorType];

            if (inPlaceEditConfig && isActive) {
                // if in-place editor not registered
                if (!inPlaceEditor) {
                    return false;
                } else {
                    // if in-place editor cannot work with the editable (it's OK if "canEdit" is not defined)
                    return !inPlaceEditor.canEdit || inPlaceEditor.canEdit(this);
                }
            } else {
                return false;
            }
        },

        /**
         * @override
         * @memberOf Granite.author.Editable.prototype
         *
         * @returns {boolean} Returns true if some actions are available on the Editable
         */
        hasActionsAvailable: function () {
            // Filter undesired actions ('Annotate' is available in a specific mode)
            var actions = this.config.editConfig.actions.filter(function (action) {
                return action !== "ANNOTATE";
            });

            if (actions.length) {
                if (actions.length === 1) {
                    // If only 'Edit' is defined but no dialog is provided, then ignore 'Edit'
                    if (actions[0] === "EDIT") {
                        return this.config.dialog != null;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                return false;
            }
        },

        /**
         * Returns true if the action is allowed from either the edit config of the editable
         * NB: This doesn't necessarily means that the action could be executed on the editable; because (1) the toolbar defines what actions are available for a given layer,
         * and (2) the action itself defines a condition to be evaluated before it could be performed on an editable.
         *
         * @override
         * @memberOf Granite.author.Editable.prototype
         *
         * @param {String} actionName - The name of the action (default actions are usually uppercase)
         * @return {boolean} Returns true if the action is present in the config of the Editable
         */
        hasAction: function (actionName) {
            return actionName &&
                this.config &&
                this.config.editConfig &&
                this.config.editConfig.actions &&
                this.config.editConfig.actions.indexOf(actionName.toUpperCase()) !== -1;
        },

        /**
         * Returns the type name of the Editable class
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @return {String} returns the unique name of the Editable
         */
        getTypeName: function () {
            return 'Editable';
        },

        /**
         * Executes the specified listener with the specified parameters
         * If the listener is a "beforeoperation" listener, and it explicitly returns false, then the operation should be aborted.
         *
         * @ignore
         * @private
         * @memberOf Granite.author.Editable.prototype
         * @fires Document#error
         *
         * @return {boolean} Returns the value resulting from the listener's execution.
         * */
        _executeListener: function (listenerName, parameters) {
            try {
                return this.config.editConfig.listeners[listenerName].apply(this, parameters);
            } catch (e) {
                // eg, if the listener contains ExtJS code
                channel.trigger($.Event('error', {
                    message: "An error has occured during " + listenerName + " listener: " + e.message,
                    exception: e
                }));
                return false;
            }
        },

        /**
         * Executes the beforedelete listener.
         * If the listener explicitly returns false, then the operation should be aborted.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param defaultDeleteFunction {Function} The default delete operation to be applied (to allow clients to override it).
         * @return {Boolean} Returns the value resulting from the listener's execution.
         * */
        beforeDelete: function (defaultDeleteFunction) {
            return this._executeListener("beforedelete", arguments);
        },

        /**
         * Executes the afterdelete listener.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         * */
        afterDelete: function () {
            this._executeListener("afterdelete");
        },

        /**
         * Executes the beforeedit listener. If "false" is returned, the edit operation gets aborted.
         * If the listener explicitly returns false, then the operation should be aborted.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param defaultEditFunction {Function} The default edit operation to be applied (to allow clients to override it).
         * @param properties {Object} The properties to be updated
         * @return {Boolean} Returns the value resulting from the listener's execution.
         * */
        beforeEdit: function (defaultEditFunction, properties) {
            return this._executeListener("beforeedit", arguments);
        },

        /**
         * Executes the afteredit listener.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         */
        afterEdit: function () {
            this._executeListener("afteredit");
        },

        /**
         * Executes the beforecopy listener. If "false" is returned, the copy operation gets aborted.
         * If the listener explicitly returns false, then the operation should be aborted.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param defaultCopyFunction {Function} The default copy operation to be applied (to allow clients to override it).
         * @return {Boolean} Returns the value resulting from the listener's execution.
         */
        beforeCopy: function (defaultCopyFunction) {
            return this._executeListener("beforecopy", arguments);
        },

        /**
         * Executes the aftercopy listener.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         */
        afterCopy: function () {
            this._executeListener("aftercopy");
        },

        /**
         * Executes the beforemove listener. If "false" is returned, the move operation gets aborted.
         * If the listener explicitly returns false, then the operation should be aborted.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param defaultMoveFunction {Function} The default move operation to be applied (to allow clients to override it).
         * @return {Boolean} Returns the value resulting from the listener's execution.
         */
        beforeMove: function (defaultMoveFunction) {
            return this._executeListener("beforemove", arguments);
        },

        /**
         * Executes the aftermove listener.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         */
        afterMove: function () {
            this._executeListener("aftermove");
        },

        /**
         * Executes the beforechildinsert listener. If "false" is returned, the insert child operation gets aborted.
         * If the listener explicitly returns false, then the operation should be aborted.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param defaultChildInsertFunction {Function} The default move operation to be applied (to allow clients to override it).
         * @param component {Object} The component definition of the new child
         * @return {Boolean} Returns the value resulting from the listener's execution.
         */
        beforeChildInsert: function (defaultChildInsertFunction, component) {
            return this._executeListener("beforechildinsert", arguments);
        },

        /**
         * Executes the beforechildinsert listener. If "false" is returned, the insert child operation gets aborted.
         * If the listener explicitly returns false, then the operation should be aborted.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param defaultDeleteFunction {Function} The default delete operation to be applied (to allow clients to override it).
         * @param childEditable {Editable} The editable to be deleted
         * @return {Boolean} Returns the value resulting from the listener's execution.
         */
        beforeChildDelete: function (defaultDeleteFunction, childEditable) {
            return this._executeListener("beforechilddelete", arguments);
        },

        /**
         * Executes the beforechildedit listener. If "false" is returned, the edit operation gets aborted.
         * If the listener explicitly returns false, then the operation should be aborted.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param defaultEditFunction {Function} The default edit operation to be applied (to allow clients to override it).
         * @param properties {Object} The properties to be updated
         * @param childEditable {Editable} The editable to be edited
         * @return {Boolean} Returns the value resulting from the listener's execution.
         */
        beforeChildEdit: function (defaultEditFunction, properties, childEditable) {
            return this._executeListener("beforechildedit", arguments);
        },

        /**
         * Executes the beforechildcopy listener. If "false" is returned, the insert child operation gets aborted.
         * If the listener explicitly returns false, then the operation should be aborted.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param defaultCopyFunction {Function} The default copy operation to be applied (to allow clients to override it).
         * @param childEditable {Editable} The editable to be copied
         * @return {Boolean} Returns the value resulting from the listener's execution.
         */
        beforeChildCopy: function (defaultCopyFunction, childEditable) {
            return this._executeListener("beforechildcopy", arguments);
        },

        /**
         * Executes the beforechildmove listener. If "false" is returned, the move operation gets aborted.
         * If the listener explicitly returns false, then the operation should be aborted.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         *
         * @param defaultMoveFunction {Function} The default move operation to be applied (to allow clients to override it).
         * @param editable {Editable} The editable to be copied
         * @return {Boolean} Returns the value resulting from the listener's execution.
         */
        beforeChildMove: function (defaultMoveFunction) {
            return this._executeListener("beforechildmove", arguments);
        },

        /**
         * Executes the afterchildinsert listener.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         */
        afterChildInsert: function (newEditable) {
            this._executeListener("afterchildinsert", arguments);
        },

        /**
         * Executes the afterchilddelete listener.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         */
        afterChildDelete: function (childEditable) {
            this._executeListener("afterchilddelete", arguments);
        },

        /**
         * Executes the afterchildedit listener.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         */
        afterChildEdit: function (childEditable) {
            this._executeListener("afterchildedit", arguments);
        },

        /**
         * Executes the afterchildcopy listener.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         */
        afterChildCopy: function (childEditable) {
            this._executeListener("afterchildcopy", arguments);
        },

        /**
         * Executes the afterchildmove listener.
         * NB: Inside of the listener function, "this" refers to the current Editable.
         *
         * @memberOf Granite.author.Editable.prototype
         */
        afterChildMove: function (childEditable) {
            this._executeListener("afterchildmove", arguments);
        },

        /**
         * Executes the afterinsert listener.
         *
         * @memberOf Granite.author.Editable.prototype
         */
        afterInsert: function () {
            this._executeListener("afterinsert");
        },

        /**
         * Executes the afterinsert listener.
         *
         * @memberOf Granite.author.Editable.prototype
         */
        updateComponentList: function (allowedComponents, components) {
            this._executeListener("updatecomponentlist", [this.config.policyPath ? this.config.policyPath : this.config.cellSearchPath, allowedComponents, components]);
        },

        /**
         * Executes a listener that would be executed when the editable refreshes,
         * <p>before refreshing its children.
         * By default, it does nothing; however, it could be overridden in special cases
         * (e.g., if the children are asynchronously loaded)</p>
         *
         * <p>Note: by rejecting the deferred, the default method that handle children refresh would not be executed;
         * and in such case, it would be up to the beforeChildrenRefresh method to handle the children refresh.</p>
         *
         * @memberOf Granite.author.Editable.prototype
         * @ignore
         *
         * @return {$.Promise} Returns a deferred that should be resolved when the children are ready
         * */
        // TODO remove me
        beforeChildrenRefresh: function () {
            var dfd = $.Deferred().resolve();
            return dfd;
        },

        /**
         * Use {@link Granite.author.edit.EditableActions.REFRESH} instead
         *
         * @ignore
         * @deprecated
         * @memberOf Granite.author.Editable.prototype
         */
        refresh: function () {
            return ns.edit.EditableActions.REFRESH.execute(this);
        }
    });


}(jQuery, Granite.author, jQuery(document), this));
