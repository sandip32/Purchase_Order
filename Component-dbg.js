/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
// define a root UIComponent which exposes the main view
jQuery.sap.declare("ui.s2p.mm.purord.fromrequisition.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");
jQuery.sap.require("sap.ca.scfld.md.ComponentBase");
jQuery.sap.require("ui.s2p.mm.purord.fromrequisition.Configuration");
jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.require("sap.ui.core.routing.History");
jQuery.sap.require("ui.s2p.mm.purord.fromrequisition.Common");

// new Component
sap.ca.scfld.md.ComponentBase.extend("ui.s2p.mm.purord.fromrequisition.Component", {

	metadata : sap.ca.scfld.md.ComponentBase.createMetaData("FS", {
		"name": "Fullscreen Sample",
		"version" : "1.0.0",
		"library" : "ui.s2p.mm.purord.fromrequisition",
		"includes" : [ "css/app.css"],
		"dependencies" : {
			"libs" : [
				"sap.m",
				"sap.me"
			],
			"components" : [
			],
		},
		"config" : {
			"resourceBundle" : "i18n/i18n.properties",
			"titleResource" : "FULLSCREEN_TITLE",
			"icon" : "sap-icon://expense-report",
			"favIcon" : "./resources/sap/ca/ui/themes/base/img/favicon/Order_From_Requisitions.ico",
			"homeScreenIconPhone" : "./resources/sap/ca/ui/themes/base/img/launchicon/Order_From_Requisitions/57_iPhone_Desktop_Launch.png",
			"homeScreenIconPhone@2" : "./resources/sap/ca/ui/themes/base/img/launchicon/Order_From_Requisitions/114_iPhone-Retina_Web_Clip.png",
			"homeScreenIconTablet" : "./resources/sap/ca/ui/themes/base/img/launchicon/Order_From_Requisitions/72_iPad_Desktop_Launch.png",
			"homeScreenIconTablet@2" : "./resources/sap/ca/ui/themes/base/img/launchicon/Order_From_Requisitions/144_iPad_Retina_Web_Clip.png"
		},
		viewPath: "ui.s2p.mm.purord.fromrequisition.view",

		fullScreenPageRoutes:{
			"fullscreen" : {
				pattern : "",
				view    : "POfromPR"
			},
			"pr_Item":{
				pattern : "pr_Item/{prKey}",
				view    : "FS_PR_Item"
			},
			"supplier":{
				pattern : "supplier/{supplierId}/{companyCode}/{purchasingOrganization}",
				view    : "FS_Supplier"
			}
		}
	}),

	/**
	 * Initialize the application
	 * 
	 * @returns {sap.ui.core.Control} the content
	 */
	createContent : function() {
		var oViewData = {component: this};
		return sap.ui.view({
			viewName : "ui.s2p.mm.purord.fromrequisition.Main",
			type     : sap.ui.core.mvc.ViewType.XML,
			viewData : oViewData
		});
	},

});