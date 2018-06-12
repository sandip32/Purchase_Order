/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.ui.model.format.QuantityFormat");
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");

sap.ui.core.mvc.Controller.extend("ui.s2p.mm.purord.fromrequisition.view.PO_Created", {

	oParams : {},

	onInit : function() {

		this.oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		this.sStatusSaved = this.oBundle.getText("view.POfromPR_Status.saved");
		this.sStatusSent = this.oBundle.getText("view.POfromPR_Status.sent");
		this.sPO = this.oBundle.getText("view.PO_List.po_id");
		this.sSupplier = this.oBundle.getText("view.PO_List.supplier");
		this.sTotal = this.oBundle.getText("view.PO_List.total");
		this.sTitle = this.oBundle.getText("view.POfromPR.sort_tit");

		this.oList = this.byId("PO_Created_List");

		this.bResponderOn = jQuery.sap.getUriParameters().get("responderOn");
		this.sPathToMockFile = "/ui.s2p.mm.purord.fromrequisition/mock/createdPurchaseOrders.json";

		// Mock data
		if (this.bResponderOn) {
			this.oBackendModel = new sap.ui.model.json.JSONModel();
			this.oBackendModel.loadData(this.sPathToMockFile, "", false);
			if (this.oList) {
				this.oList.setModel(this.oBackendModel);
			}
			this.renderPOs(this.oBackendModel);
		}
	},

	renderPOs : function(oPOModel) {

		var aListItem = [];

		if (!this.oList) {
			return
		};
		aListItem = this.oList.getItems();

		$.each(aListItem, jQuery.proxy(function(index, value) {

			var vLayout1 = new sap.ui.layout.VerticalLayout();
			var vLayout2 = new sap.ui.layout.VerticalLayout();
			var vLayout3 = new sap.ui.layout.VerticalLayout();

			// Determine PO status
			var oPO = oPOModel.getData().results[index];
			var sState = undefined;
			var sStatus = undefined;

			if (oPO.StatusId == 2) {
				sStatus = this.sStatusSaved;
				jQuery.sap.log.info("status saved");
			} else if (oPO.StatusId == 2) {
				sStatus = this.sStatusSent;
			}

			else if (oPO.StatusId == 3) {
				sStatus = this.sStatusSent;
				sState = sap.ui.core.ValueState.Success;
			}

			var oStatus = new sap.m.ObjectStatus({
				text : sStatus,
				state : sState
			});

			var oTotal = new sap.m.ObjectNumber({
				number :  ui.s2p.mm.purord.fromrequisition.util.Formatter.lazyFormatNumber(oPO.Value),
				unit : oPO.Currency
			});
			vLayout3.addContent(oTotal);
			vLayout3.addContent(oStatus);

			$.each(oPOModel.getData().results[index].POItem.results, function(i, v) {

				var oDescr = new sap.m.Text({
					text : v.ProductDescription
				});
				var oQty = new sap.m.Text({
					text : sap.ca.ui.model.format.QuantityFormat.getInstance().format(v.QuantityFormatted)
							+ " " + v.QtyUnitDescription,
					align : "End"
				});
				vLayout1.addContent(oDescr);
				vLayout2.addContent(oQty);
			});
			aListItem[index].insertCell(vLayout1, 2);
			aListItem[index].insertCell(vLayout2, 3);
			aListItem[index].insertCell(vLayout3, 4);
		}, this));
	},

	// Returns the list for selection/deselection
	getList : function() {
		return this.byId("PO_Created_List");
	},

	onBeforeRendering : function() {
		// TODO: not final

		if (!this.bResponderOn) {
			this.oBackendModel = this.oParams.oModel;
		}
		if (this.oList){
			this.oList.setModel(this.oBackendModel, "savedPOs");
		}
		this.renderPOs(this.oBackendModel);

	},

	getVSDialogSort : function() {

		var that = this;
		if (that.oVSDialog) {return that.oVSDialog;}
		var oVSDialog = new sap.m.ViewSettingsDialog({
			sortItems : [
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.PO_List.po_id"),
					key : "PoNumber",
					selected: true
				}),
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.PO_List.supplier"),
					key : "SupplierName"
				}),
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.PO_List.total"),
					key : "Value"
				}),
			],
			confirm : function (evt) {
				var mParams = evt.getParameters();
				var aItems = that.oBackendModel.getData().results;
				var bDescending = mParams.sortDescending;
				var sSortKey = mParams.sortItem.getKey();
				switch (sSortKey) {
					case "PoNumber":
						if (!bDescending) {
							aItems.sort(function(a, b) {
								if (a.PONumberFormatted < b.PONumberFormatted) {return -1;}
								if (a.PONumberFormatted > b.PONumberFormatted) {return 1;}
								return 0;
							});
						} else {
							aItems.sort(function(a, b) {
								if (a.PONumberFormatted < b.PONumberFormatted) {return 1;}
								if (a.PONumberFormatted > b.PONumberFormatted) {return -1;}
								return 0;
							});
						}
						break;
					case "SupplierName":
						if (!bDescending) {
							aItems.sort(function(a, b) {
								if (a.SupplierName < b.SupplierName) {return -1;}
								if (a.SupplierName > b.SupplierName) {return 1;}
								return 0;
							});
						} else {
							aItems.sort(function(a, b) {
								if (a.SupplierName < b.SupplierName) {return 1;}
								if (a.SupplierName > b.SupplierName) {return -1;}
								return 0;
							});
						}
						break;
					case "Value":
						if (!bDescending) {
							aItems.sort(function(a, b) {
								var aVal = parseFloat(a.Value);
								var bVal = parseFloat(b.Value);
								if (aVal < bVal) {return -1;}
								if (aVal > bVal) {return 1;}
								return 0;
							});
						} else {
							aItems.sort(function(a, b) {
								var aVal = parseFloat(a.Value);
								var bVal = parseFloat(b.Value);
								if (aVal < bVal) {return 1;}
								if (aVal > bVal) {return -1;}
								return 0;
							});
						}
						break;
				}
				if (that.oList) {
					that.oList.setModel(null);
					that.oList.setModel(this.oBackendModel, "savedPOs");
				}
				that.onBeforeRendering();
			},
		});
		that.oVSDialog = oVSDialog;
		return oVSDialog;
	}
});