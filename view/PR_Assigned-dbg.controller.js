/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("ui.s2p.mm.purord.fromrequisition.util.Formatter");
jQuery.sap.require("sap.ca.ui.utils.busydialog");

sap.ca.scfld.md.controller.BaseFullscreenController.extend("ui.s2p.mm.purord.fromrequisition.view.PR_Assigned",{

	onInit : function() {

		// variables for paging / fetching data / order criteria
		this.skip = 0;
		this.packagesize = 100;
		this.orderby = "DeliveryDate desc";
		this.orderbyAttr = "DeliveryDate";
		// from backend (plus the manually / automatically
		// assigned ones:
		this.assignedPRs_all = 0;
		// the approved PRs available in the UI list
		this.assignedPRs_ui = 0;

		this.oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();

		this.bResponderOn = jQuery.sap.getUriParameters().get("responderOn");
		var oList = this.oList = this.byId("pralist");

		this.oTableModel = new sap.ui.model.json.JSONModel();
		this.oAutoAssignModel = new sap.ui.model.json.JSONModel();
		// this.oBusyDialog = new sap.m.BusyDialog();

		var oBus = sap.ui.getCore().getEventBus();
		oBus.subscribe("ui.s2p.mm.purord.fromrequisition.publish", "assignedPRs",
				this.receiveAssignedPRs, this);
		oBus.subscribe("ui.s2p.mm.purord.fromrequisition.publish", "assignedBackendPRs",
				this.receiveAssBackendPRs, this);
		oBus.subscribe("ui.s2p.mm.purord.fromrequisition.popup", "selection",
				this.receiveSelection, this);
		oBus.subscribe("ui.s2p.mm.purord.fromrequisition.trigger", "loadAssignedPRs",
				this.loadAssignedPRs, this);

		this.poSimulatedCount = 0;

		if (this.bResponderOn) {
			// load mock data as json model
			var pathToMockFile = "/ui.s2p.mm.purord.fromrequisition/mock/unassignedPRsLikeMockup.json";
			this.oTableModel.loadData(pathToMockFile, "", true);// load
			// asynch
			if (oList) {
				oList.setModel(this.oTableModel, "PR_ass_model");
				var oTemplate = this.byId("listitem");
				if (oTemplate) {
					oList.bindItems("/PRItemCollectionAss", oTemplate);
				}
			}
		}
	},

	// called on each tab switch
	onBeforeRendering : function() {

		if (this.bResponderOn) {
			// this.oBackendModel = this.oModel;
		} else {
			// merge auto assign result if available
			if (this.oAutoAssignModel.oData && this.oAutoAssignModel.oData.PRItemCollection
					&& this.oAutoAssignModel.oData.PRItemCollection.length > 0) {
				// append the oData to oBackendModel
				jQuery.merge(this.oTableModel.oData.PRItemCollection, this.oAutoAssignModel.oData.PRItemCollection);
				// refresh Autoassign model after merge
				this.oAutoAssignModel.setData({
					"PRItemCollection" : []
				});
				this.refreshList();
			}
		}
	},

	removeItemsFromModels: function(oPRItemCollection, oListIndexToDelete) {
		for (var i=0; i < oListIndexToDelete.length; i++) {
			oPRItemCollection.splice(oListIndexToDelete[i], 1);
		}
	},

	removeSelectionFromListItem : function(sPRKeyFormatted) {
		var aItems = this.oList.getSelectedItems();
		for (var i=0; i < aItems.length; i++) {
			if (aItems[i].getCells()[0].getText() === sPRKeyFormatted) {
				this.oList.setSelectedItem(aItems[i], false);
				break;
			}
		}
	},
	
	onCreatePOSimulated : function(oEvent) {

		var aItems = [];
		var oContext = undefined;
		var sPRSourceKeys = undefined;
		var aPRSourceKeys = [];

		// Callback function for ODataModel.read()
		function successODataRead(oData, response) {

			var oSimulatedPOsModel = undefined;
			var aPRKey = [];
			var iIndex = undefined;
			var oTableData = undefined;
			var oNewSimulatedPO = {
				results : []
			};
			var oSimulatedPO;
			var iGeneratedPONumber = 0;

			sap.ca.ui.utils.busydialog.releaseBusyDialog();

			// Collect the PR Items that have successfully been simulated
			for (iIndex = 0; iIndex < oData.results.length; ++iIndex) {
				if (oData.results[iIndex].Error == "") {
					oNewSimulatedPO.results.push(oData.results[iIndex]);
					for (var iIndex2 = 0; iIndex2 < oData.results[iIndex].POProposalItemCollection.results.length; ++iIndex2) {
						aPRKey.push(oData.results[iIndex].POProposalItemCollection.results[iIndex2].PRKey);
					}
				}
			}

			// Overwrite model with latest simulation
			oSimulatedPOsModel = new sap.ui.model.json.JSONModel({results : []});
			oSimulatedPO = oSimulatedPOsModel.getData();

			if (oSimulatedPO) {
				oSimulatedPO.results = oNewSimulatedPO.results;
				for (iIndex = 0; iIndex < oSimulatedPO.results.length; ++iIndex) {
					// Make sure every simulated PO has a unique PO ID
					iGeneratedPONumber++;
					oSimulatedPO.results[iIndex].PONumber = iGeneratedPONumber;
					oSimulatedPO.results[iIndex].PONumberFormatted = iGeneratedPONumber;
				}
				oSimulatedPOsModel.setData(oSimulatedPO, false);
				// Determine how many simulated items are currently in the list
				this.poSimulatedCount = oSimulatedPO.results.length;
			}
			sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Simulated").oParams.oModel = oSimulatedPOsModel;

			// Remove the simulated PR Items from table "Assigned PRs" (in descending order because of possible deletion)
			oTableData = this.oTableModel.getData();
			var oListIndexToDelete = [];
			for (iIndex = oTableData.PRItemCollection.length - 1; iIndex >= 0; iIndex--) {
				for (iIndex2 = 0; iIndex2 < aPRKey.length; ++iIndex2) {
					if (oTableData.PRItemCollection[iIndex].PRKey == aPRKey[iIndex2]) {
						var sPRKeyFormatted = ui.s2p.mm.purord.fromrequisition.util.Formatter.formatPRItem(
								oTableData.PRItemCollection[iIndex].PRNumberFormatted,
								oTableData.PRItemCollection[iIndex].PRItemFormatted
						);
						this.removeSelectionFromListItem(sPRKeyFormatted);
						//oTableData.PRItemCollection.splice(iIndex, 1);
						oListIndexToDelete.push(iIndex);
						break;
					}
				}
			}
			this.removeItemsFromModels(oTableData.PRItemCollection, oListIndexToDelete);
			// Refresh model
			if (this.oList) {
				this.oTableModel.refresh();
				this.oList.setModel(null);
				this.oList.setModel(this.oTableModel, "PR_ass_model");
				//this.oTableModel.updateBindings(true);
			}

			// Show message
			var poCounter = oNewSimulatedPO.results.length;
			var simulationInputCounter = this.previousSimulationPRItemCounter + this.selectedPRItemCounter;
			var sMessage = "";
			if (poCounter == 1) {
				// 1 purchase order, based on {0} purchase requisitions
				sMessage = this.oBundle.getText("view.POfromPR_Messages.create_sing1", [simulationInputCounter]);
			} else {
				// {0} purchase orders, based on {1} purchase requisitions
				sMessage = this.oBundle.getText("view.POfromPR_Messages.create_plu", [this.poSimulatedCount,
						simulationInputCounter]);
			}

			// message toast - show longer than default
			jQuery.sap.require("sap.m.MessageToast");
			sap.m.MessageToast.show(sMessage, {
				width : "30em",
				duration : 6000
			});

			// publish count from backend (for icon tabs)
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
				count_posimulated : this.poSimulatedCount,
			});

			// Do not update IconTab Color for "Po simulated List": Only successfully simulated PO go to that list, so leave the default color

			// Decrease the amount of assigned PR Items by the amount of simulated PR Items
			this.assignedPRs_all -= this.selectedPRItemCounter;
			this.assignedPRs_ui -= this.selectedPRItemCounter;

			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
				count_prassigned : this.assignedPRs_all,
				count_loaded : this.assignedPRs_ui
			});

		};

		// Callback function for ODataModel.read()
		function errorODataRead(oError) {
			sap.ca.ui.utils.busydialog.releaseBusyDialog();

			var details = "";
			var message = this.oBundle.getText('view.POfromPR.general_error_simulate_message');
			if ((oError.message && oError.response)) {
				details = oError.message + "\n" + oError.response.requestUri + "\n" + oError.response.statusText;
			}
			ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage(message, details);
		};

		if (this.oList) {
			aItems = this.oList.getSelectedItems();
		}
		this.selectedPRItemCounter = 0;
		// Collect the PRSourceKeys from the selected items
		for ( var i = 0; i < aItems.length; i++) {
			//if (aItems[i].getSelected() === true) {

				oContext = aItems[i].getBindingContext("PR_ass_model");
				if (!oContext.getProperty("Error")) {
					aPRSourceKeys.push(oContext.getProperty("PRSourceKeys"));
					this.selectedPRItemCounter++;
				}
			//}
		}

		// Add items from previous simulations runs
		this.previousSimulationPRItemCounter = 0;
		var oAlreadySimulatedPOsModel = sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Simulated").oParams.oModel;
		//sap.ui.getCore().getModel("simulatedPOs");
		if (oAlreadySimulatedPOsModel) {
			var oAlreadySimulatedPOs = oAlreadySimulatedPOsModel.getData();
			for (var iIndex = 0; iIndex < oAlreadySimulatedPOs.results.length; ++iIndex) {
				var keys = oAlreadySimulatedPOs.results[iIndex].PRSourceKeys;
				if (keys != "") {
					aPRSourceKeys.push(keys);
//					this.previousSimulationPRItemCounter++;
					this.previousSimulationPRItemCounter += oAlreadySimulatedPOs.results[iIndex].POProposalItemCollection.results.length;
				}
			}
		}

		// Prepare backend call
		sPRSourceKeys = aPRSourceKeys.join(",");
		var sUrlParam = "PRSourceKey=" + "'" + sPRSourceKeys + "'";
		sap.ca.ui.utils.busydialog.requireBusyDialog();

		var oBackendODataModel = this.oView.getModel();
		oBackendODataModel.read("CreatePOProposal", null, [sUrlParam, "$expand=POProposalItemCollection"], true,
				jQuery.proxy(successODataRead, this), jQuery.proxy(errorODataRead, this));
	},

	// sets model again and does current sorting
	refreshList : function() {
		// refresh model
		if (this.oList) {
			this.oList.setModel(null);
			this.oList.setModel(this.oTableModel, "PR_ass_model");
			this.oTableModel.refresh();

			// apply current sorting to the list
			if (this.orderbyAttr) {
				ui.s2p.mm.purord.fromrequisition.Common.sortList(this.oList, this.orderbyAttr,
						true);
			}
		}
	},

	// returns list for selection
	getList : function() {
		return this.byId("pralist");
	},

	receiveAssignedPRs : function(chan, event, data) {
		// keep the incoming model data for the list
//		this.oAutoAssignModel = data.oModel;
		if (this.oAutoAssignModel.oData && this.oAutoAssignModel.oData.PRItemCollection
				&& this.oAutoAssignModel.oData.PRItemCollection.length > 0) {
			jQuery.merge(this.oAutoAssignModel.oData.PRItemCollection, data.oModel.oData.PRItemCollection);
		} else {
			this.oAutoAssignModel = data.oModel;
		}


		// increase the counters
		var iIncoming = data.oModel.oData.PRItemCollection.length;
		this.assignedPRs_all += iIncoming;
		this.assignedPRs_ui += iIncoming;

		// and publish it:
		sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
			count_prassigned : this.assignedPRs_all,
			count_loaded : this.assignedPRs_ui
		});

		// Do not update IconTabColors: Either the Icon is red from initial loading, then it stays red, as these entrys never appear
		//or the Icon is green from initial loading, then it stays green, as only successfully assigned PR come to this list
	},

	// listener method for triggering the backend loading of the assigned PR's
	loadAssignedPRs : function() {

		if (this.oDataModel === undefined || this.oDataModel === null) {
			this.oDataModel = this.oView.getModel("backendModel");
		}
		// do loading of data self, not implicit via list binding
		// to have the flexibility to push data around..
		var sSkip = "$skip=" + this.skip; // initially this value is zero
		var sTop = "$top=" + this.packagesize;
		var sOrderby = "$orderby=" + this.orderby;
		this.loadDataforView(sSkip, sTop, sOrderby);
	},

	// trigger loading of data via oData model with suitable parameters
	loadDataforView : function(sSkip, sTop, sOrderby) {

		var sText = this.oBundle.getText("view.POfromPR.loading_assigned");
		if (this.oList) {
			this.oList.setNoDataText(sText);
		}

		// publish count from backend (for icon tabs
		sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
			count_prassigned : this.oBundle.getText("view.POfromPR.counter_loading")
		});

		this.oDataModel.read('PRItemCollection', null, [sSkip, "$expand=SourcesOfSupplyCollection", sTop, sOrderby,
			"$filter=SupplierId ne '' "], true, jQuery.proxy(this.receiveAssBackendPRs, this), jQuery.proxy(
			function(oError) {
				// error case
				sap.ca.ui.utils.busydialog.releaseBusyDialog();

				var details = "";
				var message = this.oBundle.getText('view.POfromPR.general_error_assigned_message');
				if (this.oList) {
					this.oList.setNoDataText(message);
				}
				if (oError.message && oError.response) {
					details = oError.message + "\n" + oError.response.requestUri + "\n" + oError.response.statusText;
				}
				ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage(message, details);
			}, this));
	},

	receiveAssBackendPRs : function(oData, response) {
		// data is the complete odata + response from the odata call
		if (this.oList) {
			this.oList.setNoDataText(""); // reset no data text
		}

		// TODO refine / error handling for NaN / oData.__count is a string
		this.assignedPRs_all = parseInt(oData.__count);
		this.assignedPRs_ui += oData.results.length;

		var error = null;

		// add the not yet available attribute "SupplierMultiple" with value false
		// for the "edit" stuff
		jQuery.each(oData.results, function(key, value) {
			value.SupplierMultiple = false;
			value.ItemSelected = true; // keep selection in model

			// to mark the error case
			if (value.SourcesOfSupplyCollection && value.SourcesOfSupplyCollection.results
					&& value.SourcesOfSupplyCollection.results.length === 1) {
				// only one entry in results expected in this case
				value.Error = value.SourcesOfSupplyCollection.results[0].Error;
				error = true; // TODO error is not always true, adaption needed here
			}
		});

		this.oTableModel.setData({
			"PRItemCollection" : oData.results
		});

		this.refreshList();

		// publish count from backend (for icon tabs
		sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
			count_prassigned : this.assignedPRs_all,
			count_loaded : this.assignedPRs_ui
		});

		// update IconTabColors
		if (error) {
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", {
				btnPRassignedColor : sap.ui.core.IconColor.Negative
			});
		} else {
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", {
				btnPRassignedColor : sap.ui.core.IconColor.Positive
			});
		}
	},

	// receives PR item with selection from popup
	receiveSelection : function(chan, event, data) {

		if (data.sOrigin === "PR_List") { // data coming from
			// PR_List
			// wrap the data.oPRItem object in a suitable way and merge it in the oAutoAssignModel
			if (this.oAutoAssignModel.oData && this.oAutoAssignModel.oData.PRItemCollection) {
				jQuery.merge(this.oAutoAssignModel.oData.PRItemCollection, [data.oPRItem]);
			} else {
				this.oAutoAssignModel.setData({
					"PRItemCollection" : [data.oPRItem]
				});
			}

			this.assignedPRs_all += 1;
			this.assignedPRs_ui += 1;
			// publish count from backend (for icon tabs
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
				count_prassigned : this.assignedPRs_all,
				count_loaded : this.assignedPRs_ui
			});

			// do not update IconTab color - either it is red from initial loading, than it stays red, as these
			// items cannot be worked on, or it is green, then it stays green, as only items without error 
			// come to the assigned list

		}
	},

	// opens popup
	onSupplierChange : function(oEvent) {

		if (!this.oSupplierPopup) {
			// create once
			if (this.oList) {
				this.oSupplierPopup = ui.s2p.mm.purord.fromrequisition.Common
					.getSupplierPopup(this.oTableModel, this.getView().getModel("i18n"), this.oRouter);
				this.oSupplierPopup.sOrigin = "PR_Assigned";
				// currently always same title
				this.oSupplierPopup.setTitle(this.oBundle.getText("view.POfromPR.assign_tit"));
			}
		}

		// in case complete views can be removed from app designer
		if (!this.oSupplierPopup) {
			return;
		}

		var sSuppPath = '';
		var sPath = oEvent.getSource().getBindingContext("PR_ass_model").getPath();

		if (this.bResponderOn) {
			sSuppPath = sPath + "/SourcesOfSupplyCollection";
		} else {
			sSuppPath = sPath + "/SourcesOfSupplyCollection/results";
		}
		var oBus = sap.ui.getCore().getEventBus();
		oBus.publish("ui.s2p.mm.purord.fromrequisition.supplier", "path", {
			path : sSuppPath,
			itempath : sPath,
//			backendModel : this.oView.getModel("backendModel")
			backendModel : this.oList.getModel("PR_ass_model"),
		});
		this.oSupplierPopup.openBy(oEvent.getSource());
	},

	// navigation to Supplier Factsheet - resp info popover for supplier
	onSupplierLink : function(oEvent) {
		// Get the selected PR Item
		var oContext = oEvent.getSource().getBindingContext("PR_ass_model");
		var sSupplierId = oContext.getProperty("SupplierId");

		if (sSupplierId === "") {
			// it's a plant -> just info Pop-Up, no Factsheet for plants
			var sPlantName = oContext.getProperty("SupplyingPlantDescription");
			var sInfo = this.oBundle.getText("view.PR_Assigned.sos_plant", [sPlantName]);
			var oLabel = new sap.m.Label();
			oLabel.addStyleClass("sapMContainerMargin");

			if (!this.oPlantPopup) {
				var sTitle = this.oBundle.getText("view.PO_List.plant");
				this.oPlantPopup = new sap.m.Popover({
					title : sTitle,
					placement : sap.m.PlacementType.Right,
					content : oLabel
				});
			}

			this.oPlantPopup.getContent()[0].setText(sInfo);
			this.oPlantPopup.openBy(oEvent.getSource());

		} else {
			this.oRouter.navTo("supplier", {
				supplierId             : oContext.getProperty("SupplierId"),
				companyCode            : oContext.getProperty("CompanyCode"),
				purchasingOrganization : oContext.getProperty("PurchasingOrganization")
			});
		};
	},

	onErrorShow : function() {
		var message = this.oBundle.getText("view.PR_List.no_price");
		ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage(message);
	},

	// Navigation to PR Item Factsheet
	onPRItem : function(oEvent) {
		// Get the selected PR Item
		var oContext = oEvent.getSource().getBindingContext("PR_ass_model");
		var sPRKey = oContext.getProperty("PRKey");
		sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.FS_PR_Item").oParams.sCallerId = oEvent.getSource().getId();
		sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.FS_PR_Item").oParams.sPath = oContext.getPath();
		sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.FS_PR_Item").oParams.oList = oEvent.getSource().getParent().getParent().getBinding("items").aIndices;
		this.oRouter.navTo("pr_Item", {
			prKey : sPRKey
		});
	},

	exceptionFormatter : function(bError) {
		return (bError) ? "sap-icon://alert" : "";
	},

	exceptionColorFormatter : function(bError) {
		return (bError) ? sap.ui.core.theming.Parameters.get("sapUiNegative") : undefined;
	},

	formatSourceOfSupply : function(supplierName, plantName) {
		return (supplierName) ? supplierName : plantName;
	},

	getVSDialogSort : function() {

		var that = this;
		if (that.oVSDialog) {return that.oVSDialog;}
		var oVSDialog = new sap.m.ViewSettingsDialog({
			sortItems : [
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.PR_List.column_id"),
					key : "PRKey",
					selected: true
				}),
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.PR_List.column_supp"),
					key : "SupplierName"
				}),
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.PR_List.column_mat"),
					key : "ProductDescription"
				}),
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.PR_List.column_delivery"),
					key : "DeliveryDate"
				}),
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.PR_List.column_val"),
					key : "Value"
				})
			],
			confirm : function (evt) {
				var mParams = evt.getParameters();
				var oBinding = that.oList.getBinding("items");
				var sSortKey = mParams.sortItem.getKey();
				var bDescending = mParams.sortDescending;
				var oSorter = new sap.ui.model.Sorter(sSortKey, bDescending);
				if (sSortKey == "Value") {
					oSorter.fnCompare = function(a, b) {
						var aVal = parseFloat(a);
						var bVal = parseFloat(b);
						if (aVal < bVal) {return -1;}
						if (aVal > bVal) {return 1;}
						return 0;
					};
				}
				oBinding.sort(oSorter);
			},
		});
		that.oVSDialog = oVSDialog;
		return oVSDialog;
	}
});
