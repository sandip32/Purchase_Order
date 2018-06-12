/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");

sap.ca.scfld.md.controller.BaseFullscreenController.extend("ui.s2p.mm.purord.fromrequisition.view.FS_Supplier", {

	onInit : function(oEvent) {

		this.oRouter.attachRouteMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "supplier") {
				this.getView().getModel().read("SupplierInfoCollection(VendorId='" + oEvent.getParameter("arguments").supplierId
						+ "',CompanyCode='" + oEvent.getParameter("arguments").companyCode
						+ "',PurchasingOrganization='" + oEvent.getParameter("arguments").purchasingOrganization + "')",
						null, ["$expand=SupplierContactCollection"], true,
						jQuery.proxy( this.onOdataReadSuccess, this ));
			}
		}, this);
	},

	onOdataReadSuccess: function(oData){
		var oModel = new sap.ui.model.json.JSONModel(oData);
		/**
		 * @ControllerHook
		 * With this controller method the supplier data can be checked and changed.
		 * @callback sap.ca.scfld.md.controller.BaseDetailController~extHookOnDataReceived
		 * @param {sap.ui.model.json.JSONModel} model
		 * @return {sap.ui.model.json.JSONModel} model
		 */
		if (this.extHookOnDataReceived) {
			oModel = this.extHookOnDataReceived(oModel);
		}
		this.getView().setModel(oModel, "supplier_model");
	},

	onBack : function() {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var sDir = oHistory.getDirection("");

		if (sDir === sap.ui.core.routing.HistoryDirection.Unknown) {
			this.oRouter.navTo("fullscreen",{});
		} else {
			window.history.go(-1);
		}
	},

	onTapPhone : function(oEvent) {
		sap.m.URLHelper.triggerTel(oEvent.getSource().getText());
	},

	onTapEmail : function(oEvent) {
		sap.m.URLHelper.triggerEmail(oEvent.getSource().getText());
	},

	onTapWebsite : function(oEvent) {

		var surl = oEvent.getSource().getText();
		// delete leading and trailling blanks
		surl = surl.replace(/^\s+|\s+$/g, "");

		// attach http:// if it is not leading (=0) of the url
		var iposition = surl.search("http");
		if (iposition !== 0) {
			surl = "http://" + surl;
		}

		sap.m.URLHelper.redirect(surl, true);
	}

});