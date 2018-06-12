/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.ui.model.format.QuantityFormat");
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("sap.ca.ui.utils.busydialog");

sap.ui.core.mvc.Controller.extend("ui.s2p.mm.purord.fromrequisition.view.PO_Simulated", {

	oParams : {},

	onInit : function() {

		this.oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		this.sPO = this.oBundle.getText("view.PO_List.po_id");
		this.sSupplier = this.oBundle.getText("view.PO_List.supplier");
		this.sTotal = this.oBundle.getText("view.PO_List.total");
		this.sTitle = this.oBundle.getText("view.POfromPR.sort_tit");
		this.sSaving = this.oBundle.getText("view.POfromPR.creating_message");

		this.bResponderOn = jQuery.sap.getUriParameters().get("responderOn");
		this.oList = this.byId("PO_Simulated_List");
		this.sPathToMockFile = "/ui.s2p.mm.purord.fromrequisition/mock/PurchaseOrders.json";
		this.oMockModel = undefined;
		this.oBackendModel = undefined;
		this.bFirstCall = true;
		this.poCreatedTotal = 0;
		this.oOldSavedPOsModel = undefined;

		if (this.bResponderOn) {
			// Use mock data
			this.oBackendModel = new sap.ui.model.json.JSONModel();
			this.oBackendModel.loadData(this.sPathToMockFile, "", false);
			if (this.oList) {
				this.oList.setModel(this.oBackendModel); //TODO mock data...
			}
		}
	},

	onBeforeRendering : function() {
		// TODO: not final

		var aListItem = [];
		var oListModel;

		if (!this.bResponderOn) {
			this.oBackendModel = this.oParams.oModel;
		}
		if (!this.oList) {
			return


		}
		this.oList.setModel(this.oBackendModel, "simulatedPOs");

		aListItem = this.oList.getItems();
		oListModel = this.oList.getModel("simulatedPOs");

		// TODO - check this workaround for ui issue
		// if cells === 3 -> new model was set,
		// else old model not changed, just display and don't insert the cells
		if (aListItem[0] && aListItem[0].getCells().length === 3) {

			$.each(this.oList.getItems(), function(index, value) {
				var vLayout1 = new sap.ui.layout.VerticalLayout();
				var vLayout2 = new sap.ui.layout.VerticalLayout();
				$.each(oListModel.getData().results[index].POProposalItemCollection.results, function(i, v) {
					var oDescr = new sap.m.Text({
						text : v.ProductDescription
					});
					var oQty = new sap.m.Text({text : sap.ca.ui.model.format.QuantityFormat.getInstance().format(v.QuantityFormatted)
								+ " " + v.QtyUnitDescription
					});
					oQty.setTextAlign("End");

					vLayout1.addContent(oDescr);
					vLayout2.addContent(oQty);
				});
				aListItem[index].insertCell(vLayout1, 2);
				aListItem[index].insertCell(vLayout2, 3);
			});

		}

		// At first call of this view select all elements
		if (this.bFirstCall) {
			aListItem = this.oList.getItems();
			for ( var i = 0; i < aListItem.length; i++) {
				aListItem[i].setSelected(true);
			}
			this.bFirstCall = false;
		}

	}, // End of onBeforeRendering

	// Callback function for ODataModel.read()
	successSavePO : function(oData, response) {
		sap.ca.ui.utils.busydialog.releaseBusyDialog();

		// Collect PO numbers
		var aPOs = [];
		var aPOsError = [];
		var aPRSourceKeys = [];
		var iIndex = 0;
		for (iIndex = 0; iIndex < oData.PO.results.length; ++iIndex) {
			if (oData.PO.results[iIndex].Error == "") {
				aPOs.push(oData.PO.results[iIndex].PONumber);
				aPRSourceKeys.push(oData.PO.results[iIndex].PRSourceKeys);
			} else {
				aPOsError.push(iIndex);
			}
		}
		jQuery.sap.log.info("PO saved:" + aPOs);

		// Remove the POs with error from model
		if (aPOsError.length > 0) {
			var aNewResults = [];
			for (iIndex = 0; iIndex < oData.PO.results.length; ++iIndex) {
				if (oData.PO.results[iIndex].Error == "") {
					aNewResults.push(oData.PO.results[iIndex]);
				}
			}
			oData.PO.results = aNewResults;
		}

		// publish count from backend (for icon tabs)
		if (aPOs.length > 0) {
			this.poCreatedTotal += aPOs.length;
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
				count_pocreated : this.poCreatedTotal
			});
		}

		// Do not update IconTabColors: Only successfully simulated PO go to this list, so default color should stay

		// Show message: Success
		var sMessageSuccess = "";
		if (aPOs.length == 1) {
			sMessageSuccess = this.oBundle.getText("view.POfromPR_Messages.save_sing");
		} else if (aPOs.length > 1) {
			sMessageSuccess = this.oBundle.getText("view.POfromPR_Messages.save_plu", [aPOs.length]);
		}

		// Show message: Error
		var sMessageError = "";
		if (aPOsError.length == 1) {
			sMessageError = this.oBundle.getText("view.POfromPR_Messages.save_failed_sing");
		} else if (aPOsError.length > 1) {
			sMessageError = this.oBundle.getText("view.POfromPR_Messages.save_failed_plu", [aPOsError.length]);
		}

		// message toast - show longer than default
		var sMessage = sMessageSuccess + "\n" + sMessageError;
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show(sMessage, {
			width : "30em",
			duration : 6000
		});

		if (aPOs.length > 0) {

			// Save model for "Created POs"
			var oSavedPOsModel = new sap.ui.model.json.JSONModel();
			if (this.oOldSavedPOsModel != null) {
				jQuery.merge(oData.PO.results, this.oOldSavedPOsModel.oData.results);
			}
			oSavedPOsModel.setData(oData.PO);
			this.oOldSavedPOsModel = oSavedPOsModel;

			// set the "Created POs" model as a parameter in the PO_Created controller
			sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Created").oParams.oModel = oSavedPOsModel;

			jQuery.sap.log.info("Success saving POs");

			// Remove successfully created POs from Simulated PO list
			var oTableData = this.oBackendModel.getData();
			for (iIndex = oTableData.results.length - 1; iIndex >= 0; iIndex--) {
				for (var iIndex2 = 0; iIndex2 < aPRSourceKeys.length; ++iIndex2) {
					if (oTableData.results[iIndex].PRSourceKeys == aPRSourceKeys[iIndex2]) {
						oTableData.results.splice(iIndex, 1);
						// remove successfully created PO items from aPRSourceKeys
						aPRSourceKeys.splice(iIndex2, 1);
						break;
					}
				}
			}
			// If not all items of a simulated PO could be saved the remaining are saved as single PO with 1 item
			// so no 1:1 relation anymore -> remove the not saved items individually
			// and recalculate simulated PO Header value

			for (var iIndex1 = 0; iIndex1 < aPRSourceKeys.length; ++iIndex1){
				for (iIndex2 = oTableData.results.length - 1; iIndex2 >= 0; iIndex2--) {
					var oTablePRSoS = oTableData.results[iIndex2].PRSourceKeys.split(",");
					var aPRSos = aPRSourceKeys[iIndex1].split(",");
					for (var iIndex3 = 0; iIndex3 < aPRSos.length; ++iIndex3 ){
					var iItem = oTablePRSoS.indexOf(aPRSos[iIndex3]);

						if (iItem !== -1) {
							// remove PRSource Key from simulate PO
							oTablePRSoS.splice(iItem,1);
							oTableData.results[iIndex2].PRSourceKeys = oTablePRSoS.toString();
							// recalculate Header value TODO:
							oTableData.results[iIndex2].Value -= oTableData.results[iIndex2].POProposalItemCollection.results[iItem].NetValue;
							// remove corresponding Item
							oTableData.results[iIndex2].POProposalItemCollection.results.splice(iItem,1);
						}
					}
					break;
				}
			}

			// Refresh model: Removes Simulated POs from list
			if (this.oList) {
				this.oBackendModel.refresh();
				this.oList.setModel(null);
				this.oList.setModel(this.oBackendModel, "simulatedPOs");

				var aListItem = this.oList.getItems();
				var oListModel = this.oList.getModel("simulatedPOs");

				// if cells === 3 -> new model was set,
				// else old model not changed, just update and don't insert the cells
					$.each(this.oList.getItems(), function(index, value) {
						var vLayout1;
						var vLayout2;
						if (aListItem[index].getCells().length === 3) {
							vLayout1 = new sap.ui.layout.VerticalLayout();
							vLayout2 = new sap.ui.layout.VerticalLayout();
						} else {
							vLayout1 = aListItem[index].getCells()[2];
							vLayout2 = aListItem[index].getCells()[3];
							vLayout1.removeAllContent();
							vLayout2.removeAllContent();
						}

						$.each(oListModel.getData().results[index].POProposalItemCollection.results, function(i, v) {
							var oDescr = new sap.m.Text({
								text : v.ProductDescription
							});
							var oQty = new sap.m.Text({text : sap.ca.ui.model.format.QuantityFormat.getInstance().format(v.QuantityFormatted)
										+ " " + v.QtyUnitDescription
							});
							oQty.setTextAlign("End");

							vLayout1.addContent(oDescr);
							vLayout2.addContent(oQty);
						});

						if (aListItem[index].getCells().length === 3) {
							aListItem[index].insertCell(vLayout1, 2);
							aListItem[index].insertCell(vLayout2, 3);
						}
					});
			}

			// publish count from backend (for icon tabs)
			this.poSimulatedCount = this.oBackendModel.getData().results.length;
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
			//	decreaseCount_posimulated : aPOs.length
				count_posimulated : this.poSimulatedCount,
			});

			// IconTabColor to "error" if simulated PO remain on List
			if (this.poSimulatedCount > 0 && aPOsError.length > 1) {
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", {
				btnPOsimulatedColor : sap.ui.core.IconColor.Negative});
			}
			else {
				sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", {
					btnPOsimulatedColor : sap.ui.core.IconColor.Default});
			}
		}

	},

	// Callback function for ODataModel.read()
	errorSavePO : function(oError) {
//						this.oBusyDialog.close();
		sap.ca.ui.utils.busydialog.releaseBusyDialog();

		var message = this.oBundle.getText('view.POfromPR.general_error_create_message');
		var details = "";
		if (oError.message && oError.response) {
			details = oError.message + "\n" + oError.response.requestUri + "\n" + oError.response.statusText;
		}
		ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage(message, details);

	},

	postSavePO : function() {
		this.oBackendODataModel.create("POContainerCollection", this.POContainer, undefined, jQuery.proxy(
				this.successSavePO, this), jQuery.proxy(this.errorSavePO, this));
	},

	onSavePOs : function() {

		var sPRSourceKeys = undefined;
		var aPRSourceKeys = [];
		var aItems = [];

		// Retrieve PRSourceKeys from selected items
		if (this.oList) {
			aItems = this.oList.getSelectedItems();
		}
		for ( var i = 0; i < aItems.length; i++) {
				var oContext = aItems[i].getBindingContext("simulatedPOs");
				var keys = oContext.getProperty("PRSourceKeys");
				aPRSourceKeys.push(keys);
		}

		if (aPRSourceKeys.length > 0) {

			// Prepare data for POST call
			sPRSourceKeys = aPRSourceKeys.join(",");
			var PONumber = "00000";
			var PONumberFormatted = "0";
			var SupplierId = "0";
			var SupplierName = "0";
			var PurchOrg = "0";
			var PaymentTerms = "0";
			var CashDiscountDays1 = "0";
			var CashDiscountDays2 = "0";
			var CashDiscountDays3 = "0";
			var CashDiscountPerc1 = "0.000";
			var CashDiscountPerc2 = "0.000";
			var Incoterms1 = "0";
			var Incoterms2 = "0";
			var Value = "0.00";
			var ValueFormatted = "0,00";
			var Currency = "0";
			var StatusId = "0";
			var Error = "X";

			var item_POKey = "00000";
			var item_PONumber = "0";
			var item_POItem = "0";
			var item_PONumberFormatted = "0";
			var item_POItemFormatted = "0";
			var item_PRKey = "0";
			var item_AssignedPRNumber = "0";
			var item_AssignedPRItem = "0";
			var item_ProductId = "0";
			var item_ProductDescription = "0";
			var item_ProductGroup = "0";
			var item_ProductGroupDescr = "0";
			var item_ShipToPlantId = "0";
			var item_ShipToPlantDescr1 = "0";
			var item_ShipToPlantDescr2 = "0";
			var item_Quantity = "0";
			var item_QuantityFormatted = "0";
			var item_QtyUnit = "0";
			var item_QtyUnitDescription = "0";
			var item_Currency = "0";
			var item_NetPrice = "0";
			var item_NetValue = "0";
			var item_NetValueFormatted = "0";
			var item_OrderPriceUnit = "0";
			var item_OrderPriceUnitDescr = "0";
			var item_DeliveryDate = "0";
			var item_RequisitionedBy = "0";
			var item_Error = " ";

			this.POContainer = {

				POContainerKey : "X",

				PO : [{
					POKey : PONumber,
					PRSourceKeys : sPRSourceKeys,
					PONumberFormatted : PONumberFormatted,
					SupplierId : SupplierId,
					SupplierName : SupplierName,
					PurchOrg : PurchOrg,
					PaymentTerms : PaymentTerms,
					CashDiscountDays1 : CashDiscountDays1,
					CashDiscountDays2 : CashDiscountDays2,
					CashDiscountDays3 : CashDiscountDays3,
					CashDiscountPerc1 : CashDiscountPerc1,
					CashDiscountPerc2 : CashDiscountPerc2,
					Incoterms1 : Incoterms1,
					Incoterms2 : Incoterms2,
					Value : Value,
					ValueFormatted : ValueFormatted,
					Currency : Currency,
					StatusId : StatusId,
					Error : Error,
					POItem : [{
						POKey : item_POKey,
						PONumber : item_PONumber,
						POItem : item_POItem,
						PONumberFormatted : item_PONumberFormatted,
						POItemFormatted : item_POItemFormatted,
						PRKey : item_PRKey,
						AssignedPRNumber : item_AssignedPRNumber,
						AssignedPRItem : item_AssignedPRItem,
						ProductId : item_ProductId,
						ProductDescription : item_ProductDescription,
						ProductGroup : item_ProductGroup,
						ProductGroupDescr : item_ProductGroupDescr,
						ShipToPlantId : item_ShipToPlantId,
						ShipToPlantDescr1 : item_ShipToPlantDescr1,
						ShipToPlantDescr2 : item_ShipToPlantDescr2,
						Quantity : item_Quantity,
						QuantityFormatted : item_QuantityFormatted,
						QtyUnit : item_QtyUnit,
						QtyUnitDescription : item_QtyUnitDescription,
						Currency : item_Currency,
						NetPrice : item_NetPrice,
						NetPriceFormatted : item_NetValueFormatted,
						PriceUnit : item_OrderPriceUnit,
						NetValue : item_NetValue,
						NetValueFormatted : item_NetValueFormatted,
						OrderPriceUnit : item_OrderPriceUnit,
						OrderPriceUnitDescr : item_OrderPriceUnitDescr,
						DeliveryDate : item_DeliveryDate,
						RequisitionedBy : item_RequisitionedBy,
						Error : item_Error
					}]

				}]

			};

			if (!this.bResponderOn) {

				// Busy indicator
				sap.ca.ui.utils.busydialog.requireBusyDialog({text: this.sSaving});
//								this.oBusyDialog.setText(this.sSaving);
//								this.oBusyDialog.open();

				// POST call
				// var sServiceName = "/sap/opu/odata/sap/ZDH_DEEP_TEST";
				// var sServiceName = "/sap/opu/odata/sap/ZSG_SRA013_TEST";
				// this.oBackendODataModel = this.loadBackendModel(sServiceName);

				// for the x-csrf-token
				this.oBackendODataModel = this.oView.getModel("backendModel");
				this.oBackendODataModel.refreshSecurityToken(
				// successfully refreshed -> call post
				jQuery.proxy(this.postSavePO, this),
				// error in refresh token
				function(info) {
//									this.oBusyDialog.close();
					sap.ca.ui.utils.busydialog.releaseBusyDialog();

					ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage(
							"error refresh csrf token", info);
				}, true);
			}
		}

	}, // End of nSavePOs

	// Returns the list for selection/deselection
	getList : function() {
		return this.byId("PO_Simulated_List");
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
					that.oList.setModel(this.oBackendModel, "simulatedPOs");
				}
				that.onBeforeRendering();
			},
		});
		that.oVSDialog = oVSDialog;
		return oVSDialog;
	}
});