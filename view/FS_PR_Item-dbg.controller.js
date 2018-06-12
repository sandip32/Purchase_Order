/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("ui.s2p.mm.purord.fromrequisition.util.Formatter");
jQuery.sap.require("sap.ca.ui.utils.busydialog");

sap.ca.scfld.md.controller.BaseFullscreenController.extend("ui.s2p.mm.purord.fromrequisition.view.FS_PR_Item", {

	oParams : {},

	onInit : function(oEvent) {
		sap.ca.scfld.md.controller.BaseFullscreenController.prototype.onInit.call(this);

		this.oRouter.attachRouteMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "pr_Item") {
				this.sCallerId = this.oParams.sCallerId;
				this.oList = this.oParams.oList;
				// if this.oHomeButton is defined -> this item was selected from a list in the previous view
				// and then we can get data from the previously loaded view
				if (this.sCallerId) {
					this.byId("btnPreviousPRItem").setVisible(true);
					this.byId("btnNextPRItem").setVisible(true);
					this.oModel = sap.ui.getCore().byId(this.sCallerId).getModel("PR_appr_model");
					if (!this.oModel) {
						this.oModel = sap.ui.getCore().byId(this.sCallerId).getModel("PR_ass_model");
					}
					this.iNumberOfItems = this.oModel.getProperty("/PRItemCollection").length;
					this.ReadLocalData();
				}
				// else we have to load data from the Backend
				else {
					this.byId("btnPreviousPRItem").setVisible(false);
					this.byId("btnNextPRItem").setVisible(false);
					sap.ca.ui.utils.busydialog.requireBusyDialog();
					this.getView().getModel().read(
						"/PRItemCollection('" + oEvent.getParameter("arguments").prKey + "')",
						null, null, true,
						jQuery.proxy(this.onOdataReadSuccess, this),
						jQuery.proxy(this.onOdataReadError, this));
				}
			}
		}, this);
	},

	onOdataReadError: function(oError){
		sap.ca.ui.utils.busydialog.releaseBusyDialog();

		var message = this.oApplicationImplementation.getResourceBundle().getText('view.POfromPR.general_error_unassigned_message');
		var details = "";
		if (oError.message && oError.response) {
			details = oError.message + "\n" + oError.response.requestUri + "\n" + oError.response.statusText;
		}
		ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage(message, details);
	},

	onOdataReadSuccess: function(oData){
		sap.ca.ui.utils.busydialog.releaseBusyDialog();
		var oModel = new sap.ui.model.json.JSONModel(oData);
		this.getView().setModel(oModel, "PR_item_model");
	},

	ReadLocalData: function(){
		var	sPathPRItemCollection = this.oParams.sPath?("/"+this.oParams.sPath.split("/")[1]+"/"):undefined;
		var sCurrentIndex = this.oParams.sPath?(this.oParams.sPath.split(sPathPRItemCollection)[1]):undefined;
		var oModel = new sap.ui.model.json.JSONModel();

		oModel.setData(this.oModel.getProperty(sPathPRItemCollection + sCurrentIndex));
		this.getView().setModel(oModel, "PR_item_model");;
	},

	getPreviousItem : function(sCurrentIndex) {
		var iIndexPreviousItem = (this.oList.indexOf(parseInt(sCurrentIndex))-1>=0?this.oList.indexOf(parseInt(sCurrentIndex))-1:this.oList.indexOf(parseInt(sCurrentIndex)));
		return this.oList[iIndexPreviousItem];
	},

	getNextItem : function(sCurrentIndex) {
		var iIndexNextItem = (this.oList.indexOf(parseInt(sCurrentIndex))+1<this.oList.length?this.oList.indexOf(parseInt(sCurrentIndex))+1:this.oList.indexOf(parseInt(sCurrentIndex)));
		return this.oList[iIndexNextItem];
	},

	getIndexInListFromIndexInModel: function(sCurrentIndex) {
		if (this.oList)
			return this.oList.indexOf(parseInt(sCurrentIndex));
		return -1;
	},

	onOtherPRItem : function(oEvent) {
		// The path can be /PRItemCollectionAss/ (mock data for assigned PRs) or /PRItemCollection
		var	sPathPRItemCollection = this.oParams.sPath?("/"+this.oParams.sPath.split("/")[1]+"/"):undefined;
		var sCurrentIndex = this.oParams.sPath?(this.oParams.sPath.split(sPathPRItemCollection)[1]):undefined;
		var iIndexInList = this.getIndexInListFromIndexInModel(sCurrentIndex);
		var sOtherPath;
		var oPRItem;

		if (oEvent.getSource() == this.oView.byId("btnPreviousPRItem")) {
			if (iIndexInList != -1) {
				if (iIndexInList > "0") {
					sOtherPath = sPathPRItemCollection + this.getPreviousItem(sCurrentIndex);
					oPRItem = this.oModel.getProperty(sOtherPath);

					this.oParams.sPath = sOtherPath;
					this.oRouter.navTo("pr_Item", {
						prKey : oPRItem.PRKey
					}, true);
				}
			}
		} else if (oEvent.getSource() == this.oView.byId("btnNextPRItem")) {
			if (iIndexInList != -1) {
				if (iIndexInList < this.iNumberOfItems - 1) {
					sOtherPath = sPathPRItemCollection + this.getNextItem(sCurrentIndex);
					oPRItem = this.oModel.getProperty(sOtherPath);

					this.oParams.sPath = sOtherPath;
					this.oRouter.navTo("pr_Item", {
						prKey : oPRItem.PRKey
					}, true);
				}
			}
		}
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

	// Navigation to Supplier Factsheet; Popover for supplying plant
	onSupplierLink : function(oEvent) {

		var oModel = this.getView().getModel("PR_item_model");

		this.oRouter.navTo("supplier", {
			supplierId             : oModel.getProperty("/SupplierId"),
			companyCode            : oModel.getProperty("/CompanyCode"),
			purchasingOrganization : oModel.getProperty("/PurchasingOrganization")
		});
	},

	formatSupplierOrPlant : function(supplierName, plantName) {
		return (supplierName) ? supplierName : plantName;
	}	
});
