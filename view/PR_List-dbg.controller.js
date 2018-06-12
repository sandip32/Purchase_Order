/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("ui.s2p.mm.purord.fromrequisition.util.Formatter");
jQuery.sap.require("sap.ui.model.odata.Filter");
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("sap.ca.ui.utils.busydialog");

sap.ca.scfld.md.controller.BaseFullscreenController.extend("ui.s2p.mm.purord.fromrequisition.view.PR_List",{

	onInit : function() {

		// variables for paging / fetching data / order criteria
		this.skip = 0;
		this.packagesize = 50;
		this.orderby = "DeliveryDate desc"; // initially
		this.approvedPRs_all = 0; // from backend (minus the manually / automatically assigned ones)
		this.approvedPRs_ui = 0; // the approved PRs available in ui table
		this.oBundle = this.oApplicationImplementation.getResourceBundle();

		// mock indicator
		this.bResponderOn = jQuery.sap.getUriParameters().get("responderOn");
		this.bExceptionFilter = false;

		this.oList = this.byId("prlist"); // from XML view
		this.bWorkaround = true; //TODO

		this.oTableModel = new sap.ui.model.json.JSONModel();
		this.oTableModel.setSizeLimit(500);
		this.aFilter = [];

		var oBus = sap.ui.getCore().getEventBus();
		// for popup selection
		oBus.subscribe("ui.s2p.mm.purord.fromrequisition.popup", "selection", this.receiveSelection, this);
		oBus.subscribe("ui.s2p.mm.purord.fromrequisition.publish", "count", this.updateButtonText, this);

		if (this.bResponderOn) {
			// load mock data as json model
			var pathToMockFile = "/ui.s2p.mm.purord.fromrequisition/mock/unassignedPRsLikeMockup.json";
			this.oTableModel.loadData(pathToMockFile, "", true);// load
			// asynch
			if (this.oList) {
				this.oList.setModel(this.oTableModel, "PR_appr_model");
			}
		}
		this.setTableHeader();
	},

	// here, the 2 main backend calls for the 2 tables are triggered
	onBeforeRendering : function() {

		if (!this.oList) {
			return;
		}
		var oListModel = this.oList.getModel("PR_appr_model");

		// TODO: strange behaviour after build in of shell.....
		if (oListModel === undefined && this.bWorkaround) {

			this.bWorkaround = false; // hm..
			this.oModel = this.oView.getModel("backendModel");

			// do loading of data self, not implicit via list binding
			// to have the flexibility to push data around..
			var sSkip = "$skip=" + this.skip;
			// initially this value is zero
			var sTop = "$top=" + this.packagesize;
			var sOrderby = "$orderby=" + this.orderby;
			var bMerge = true;

			this.loadDataforView(sSkip, sTop, sOrderby, bMerge);

			// trigger already here the loading for the PR_Assigned view
			// loading itself is done in PR_Assigned view
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.trigger", "loadAssignedPRs");

			if (jQuery.device.is.phone) {
				var message = this.oApplicationImplementation.getResourceBundle().getText('view.POfromPR.phone_warning');
				ui.s2p.mm.purord.fromrequisition.Common.ShowWarningMessage(message, "");
			};
		};
	},

	// trigger loading of data via oData model with suitable parameters
	loadDataforView : function(sSkip, sTop, sOrderby, bMerge) {

		if (!this.oList) {
			return;
		}
		var fnSuccess;
		if (bMerge === true) {
			fnSuccess = this.addToTableModel;
		} else {
			fnSuccess = this.refreshTableModel;
		}
		this.oList.setNoDataText(this.oBundle.getText("view.POfromPR.loading_message"));

		sap.ca.ui.utils.busydialog.requireBusyDialog();
		this.oModel.read('PRItemCollection', null, [sSkip, sTop, sOrderby, "$filter=SupplierId eq '' "], true,
			jQuery.proxy(fnSuccess, this), jQuery.proxy(function(oError) {
				// error case
				sap.ca.ui.utils.busydialog.releaseBusyDialog();

				var message = this.oBundle.getText('view.POfromPR.general_error_unassigned_message');
				this.oList.setNoDataText(message);
				var details = "";
				if (oError.message && oError.response) {
					details = oError.message + "\n" + oError.response.requestUri + "\n" + oError.response.statusText;
				}
				ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage(message, details);
			}, this));
	},

	// adds the data from the back-end call to the table model
	addToTableModel : function(oData, response) {
		var bMerge = true;
		this.updateTableModel(oData, response, bMerge);
	},

	// replaces the data of the table model with the data from the back-end call
	refreshTableModel : function(oData, response) {
		var bMerge = false;
		this.updateTableModel(oData, response, bMerge);
	},

	updateTableModel : function(oData, response, bMerge) {

		var col2 = this.byId("column2");
		var l1 = this.byId("l1");
		var label1 = undefined;
		if (l1) {
			label1 = l1.getDomRef();
		}
		if (col2 && label1) {
			col2.setMinScreenWidth((label1.clientWidth + 1) + "px");
		}
		// Call function to determine Height of List

		sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "orientationChange", this);
		// attention, not only the backend total count should be taken here!!
		// TODO refine / error handling for NaN / oData.__count is a string
		if (this.approvedPRs_all === 0) {
			// first loading - take total backend count
			this.approvedPRs_all = parseInt(oData.__count);
		}

		if (bMerge === true) {
			this.approvedPRs_ui += oData.results.length;
		} else {
			this.approvedPRs_ui = oData.results.length;
		}

		// publish count from backend (for icon tabs)
		sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
			count_prapproved : this.approvedPRs_all,
			count_loaded : this.approvedPRs_ui
		});

		// add the not yet available attribute "SupplierMultiple" with value false
		jQuery.each(oData.results, function(key, value) {
			value.SupplierMultiple = false;
			value.HideMe = false;
			value.ItemSelected = true; // initial selection
		});

		sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", {
			btnPRreleasedColor : sap.ui.core.IconColor.Default
		});

		// merge this with the data already available in the table
		if (this.oTableModel.oData.PRItemCollection && this.oTableModel.oData.PRItemCollection.length > 0 && bMerge === true) {
			this.toggleListVisibility(true);
			// merge
			jQuery.merge(this.oTableModel.oData.PRItemCollection, oData.results);
		} else if (oData.results.length == 0
				&& (!this.oTableModel.oData.PRItemCollection || this.oTableModel.oData.PRItemCollection.length == 0)) {
			this.toggleListVisibility(false);
			sap.ca.ui.utils.busydialog.releaseBusyDialog();
			return;
		} else {
			this.toggleListVisibility(true);
			// update
			this.oTableModel.setData({
				"PRItemCollection" : oData.results
			});
		}

		// set new result to list
		if (this.oList) {
			this.oList.setModel(this.oTableModel, "PR_appr_model");
			this.oTableModel.refresh();
			sap.ca.ui.utils.busydialog.releaseBusyDialog();

			this.oList.setNoDataText(""); // reset no data text
			this.refreshList();
		}
	},

	// for the POfromPR view -> to do the de/select
	getList : function() {
		return this.byId("prlist");
	},

	// trigger the automatic assignment of supplier
	onAssignSupplier : function(oEvent) {

		// expand the SourcesOfSupplyCollection for the selected PRKeys

		// first - select the selected entries
		var aItems = [];
		if (this.oList) {
			aItems = this.oList.getSelectedItems();
		}
		var sRequestString = "";
		var sPRKey = "";
		var oContext;
		var aBatch = [];

		for ( var i = 0; i < aItems.length; i++) {
			sRequestString = "";
			oContext = aItems[i].getBindingContext("PR_appr_model");
			sPRKey = oContext.getProperty("PRKey");
			sRequestString = "PRItemCollection('" + sPRKey + "')?$expand=SourcesOfSupplyCollection";
			aBatch.push(this.oModel.createBatchOperation(sRequestString, "GET"));
		}

		if (aBatch.length > 0) {

			// view.POfromPR.assigning_message
			sap.ca.ui.utils.busydialog.requireBusyDialog({
				text: this.oBundle.getText("view.POfromPR.assigning_message")});

			// load via oModel batch operation
			this.oModel.addBatchReadOperations(aBatch);

			// for the x-csrf-token
			this.oModel.refreshSecurityToken(
			// successfully refreshed -> call batch assign
			jQuery.proxy(this.callBatchAssignSuppliers, this),
			// error in refresh token
			function(info) {
				sap.ca.ui.utils.busydialog.releaseBusyDialog();
				ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage(
						"error refresh csrf token", info);
			}, true);

		}

	},

	// refresh csrf token success -> trigger the batch call
	callBatchAssignSuppliers : function() {
		this.oModel.submitBatch(
		// the success callback
		jQuery.proxy(this.getAssignResult, this),
		// the error callback
		function(oError) {
			jQuery.sap.log.info(oError.toString());
			jQuery.sap.log.info("error submit batch");
			sap.ca.ui.utils.busydialog.releaseBusyDialog();
			var message = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('view.POfromPR.general_error_assign_message');

			var details = "";
			if (oError.message && oError.response) {
				details = oError.message + "\n" + oError.response.requestUri + "\n" + oError.response.statusText;
			}
			ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage(message, details);

		}, true);
	},

	getIfItemInList: function(oPRItemCollection, aItems) {
		// ui.s2p.mm.purord.fromrequisition.util.Formatter.formatPRItem
		for (var i=0; i < aItems.length; i++) {
			var sPRKeyFormatted = ui.s2p.mm.purord.fromrequisition.util.Formatter.formatPRItem(
					oPRItemCollection.PRNumberFormatted,
					oPRItemCollection.PRItemFormatted
			);
			if (sPRKeyFormatted === aItems[i].getCells()[0].getText()) {
				return i;
			}
		}
		return -1;
	},

	// the result callback of the batch call, in oData the result data
	getAssignResult : function(oData, oResponse, oErrorResponses) {

		var aItems = [];
		var aNewModel = [];
		var aResponse = [];
		var aAssigned = []; // for move to other view
		// counters for result messages
		var iMult = 0;
		var iNo = 0;
		var iAssigned = 0;
		var iSuppliers;

		jQuery.each( oData.__batchResponses, function(key, value) {
			// non backend helper attributes
			value.data.SupplierMultiple = false;
			value.data.HideMe = false;
			value.data.ItemSelected = true;

			iSuppliers = 0;
			if (value.data.SourcesOfSupplyCollection.results) {
				iSuppliers = value.data.SourcesOfSupplyCollection.results.length;
			}

			if (iSuppliers > 1) {
				value.data.SupplierMultiple = true;
				iMult += 1;
			} else if (iSuppliers === 1) {

				// check if supplier is filled..., error currently
				if (value.data.SourcesOfSupplyCollection.results[0].FixedVendor === ""
						|| value.data.SourcesOfSupplyCollection.results[0].Error === true) {
					value.data.Error = true;
					iNo += 1;
				} else {
					// assign this supplier and its relevant data and put to other collection
					value.data.PRSourceKeys = value.data.SourcesOfSupplyCollection.results[0].PRSourceKeys;

					value.data.SupplierId = value.data.SourcesOfSupplyCollection.results[0].FixedVendor;
					value.data.SupplierName = value.data.SourcesOfSupplyCollection.results[0].FixedVendorName;

					value.data.OpenQuantityUnit = value.data.SourcesOfSupplyCollection.results[0].OpenQuantityUnit;
					value.data.OpenQuantityUnitDescription = value.data.SourcesOfSupplyCollection.results[0].OpenQuantityUnitDescription;
					value.data.OpenQuantity = value.data.SourcesOfSupplyCollection.results[0].OpenQuantity;
					value.data.OpenQuantityFormatted = value.data.SourcesOfSupplyCollection.results[0].OpenQuantityFormatted;

					value.data.Price = value.data.SourcesOfSupplyCollection.results[0].NetPrice;
					value.data.PriceFormatted = value.data.SourcesOfSupplyCollection.results[0].NetPriceFormatted;
					value.data.Value = value.data.SourcesOfSupplyCollection.results[0].NetOrderValue;
					value.data.ValueFormatted = value.data.SourcesOfSupplyCollection.results[0].NetOrderValueFormatted;

					value.data.Currency = value.data.SourcesOfSupplyCollection.results[0].Currency;
					value.data.PriceUnit = value.data.SourcesOfSupplyCollection.results[0].PriceUnit;
					value.data.OrderPriceUnit = value.data.SourcesOfSupplyCollection.results[0].OrderPriceUnit;
					value.data.OrderPriceUnitDescription = value.data.SourcesOfSupplyCollection.results[0].OrderPriceUnitDescription;

					value.data.PurchasingOrganization = value.data.SourcesOfSupplyCollection.results[0].PurchasingOrg;

					value.data.HideMe = true;

					aAssigned.push(value.data);
					iAssigned += 1;
				}

			} else {
				iNo += 1;
			}
			// every value - also the to move / hide ones
			aResponse.push(value.data);

		});

		sap.ca.ui.utils.busydialog.releaseBusyDialog();

		// in case of less selected / processed in the list -> merge needed
		var iLength = this.oTableModel.oData.PRItemCollection.length;

		if (this.oList) {
			aItems = this.oList.getItems();
		}

		// build a new model based on the oTableModel with the difference that some items
		// will have the property 'HideMe' = true
		for (var i=0; i < iLength; i++) {
			// for each item get if it is already in the list
			var iIndexInList = this.getIfItemInList(this.oTableModel.oData.PRItemCollection[i], aItems);
			if (iIndexInList != -1) {
				// if found then check if it is selected or not :
				// if selected -> replace it, else just add it
				if (aItems[iIndexInList].getSelected()) {
					// get the corresponding entry from the aResponse array
					for (var j=0, bFound = false; !bFound && j < aResponse.length; j++) {
						if (this.oTableModel.oData.PRItemCollection[i].PRKey === aResponse[j].PRKey) {
							aNewModel.push(aResponse[j]);
							bFound = true;
						}
					}
				} else {
					aNewModel.push(this.oTableModel.oData.PRItemCollection[i]);
				}
			}
			// if not found then just add it but as hided
			else {
				this.oTableModel.oData.PRItemCollection[i].HideMe = true;
				aNewModel.push(this.oTableModel.oData.PRItemCollection[i]);
			}
		}

		if (aAssigned.length > 0) {
			// publish them to the pr Assigned view

			var oAssignedModel = new sap.ui.model.json.JSONModel();
			oAssignedModel.setData({
				"PRItemCollection" : aAssigned
			});

			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "assignedPRs", {
				oModel : oAssignedModel
			});
		}

		// set the new table model
		this.oTableModel.setData({
			"PRItemCollection" : aNewModel
		});

		if (this.oList) {
			this.oList.setModel(null);
			this.oList.setModel(this.oTableModel, "PR_appr_model");
			this.oTableModel.refresh();
			this.refreshList();
		}

		// publish the new numbers..
		// deduce the automatically assigned ones from both numbers
		// even if in backend nothing changed.
		this.approvedPRs_all -= iAssigned;
		this.approvedPRs_ui -= iAssigned;
		sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
			count_prapproved : this.approvedPRs_all,
			count_loaded : this.approvedPRs_ui
		});

		// update IconTabColors
		if (iNo > 0) {
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", {
				btnPRreleasedColor : sap.ui.core.IconColor.Negative
			});
		} else if (iMult > 0) {
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", {
				btnPRreleasedColor : sap.ui.core.IconColor.Critical
			});
		} else {
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", {
				btnPRreleasedColor : sap.ui.core.IconColor.Default
			});
		}

		// output of the messages via message toast
		var sMessagesMult = "";
		var sMessagesAss = "";
		var sMessagesNo = "";

		if (iMult > 0) {
			sMessagesMult = iMult === 1
					? this.oBundle.getText("view.POfromPR_Messages.assign_manual_sing")
					: this.oBundle.getText("view.POfromPR_Messages.assign_manual_plu", [iMult]);
		}

		if (iAssigned > 0) {
			sMessagesAss = iAssigned === 1
					? this.oBundle.getText("view.POfromPR_Messages.assigned_sing")
					: this.oBundle.getText("view.POfromPR_Messages.assigned_plu", [iAssigned]);
		}

		if (iNo > 0) {
			sMessagesNo = iNo === 1 ? this.oBundle.getText("view.POfromPR_Messages.not_assigned_sing") : this.oBundle
					.getText("view.POfromPR_Messages.not_assigned_plu", [iNo]);
		}

		// concatenate the message strings with line breaks - no effect yet..
		var sMessage = sMessagesMult + '\n' + sMessagesAss + '\n' + sMessagesNo;

		// message toast - show longer and broader than default
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show(sMessage, {
			width : "30em",
			duration : 6000
		});

	},

	// event for choosing the available suppliers for this purchase requisition
	onMultipleSupplier : function(oEvent) {

		var sTitle;
		var sDisplayText;

		if (!this.oSupplierPopup) {
			// create once
			this.oSupplierPopup = ui.s2p.mm.purord.fromrequisition.Common
					.getSupplierPopup(this.oTableModel, this.getView().getModel("i18n"), this.oRouter);
			this.oSupplierPopup.sOrigin = "PR_List";
		}

		// in case complete views can be removed from app designer
		if (!this.oSupplierPopup) {
			return;
		}
		var oContext = oEvent.getSource().getBindingContext("PR_appr_model");
		var sPath = oContext.getPath();
		var bError = oContext.getProperty(sPath + "/Error");

		if (bError) {
			sTitle = this.oBundle.getText("XTIT_MS_ERROR");
			sDisplayText = this.oBundle.getText("view.PR_List.no_price");
		} else {
			sTitle = this.oBundle.getText("view.POfromPR.assign_tit");
			// no Error text
			sDisplayText = this.oBundle.getText("view.MultipleSuppliers.title");
		}

		this.oSupplierPopup.setTitle(sTitle);

		var sSuppPath = undefined;
		if (this.bResponderOn) {
			sSuppPath = sPath + "/SourcesOfSupplyCollection";
		} else {
			sSuppPath = sPath + "/SourcesOfSupplyCollection/results";
		}

		var oBus = sap.ui.getCore().getEventBus();
		oBus.publish("ui.s2p.mm.purord.fromrequisition.supplier", "path", {
			path : sSuppPath,
			itempath : sPath,
			backendModel : this.oList.getModel("PR_appr_model"),
			displayText : sDisplayText
		});
		this.oSupplierPopup.openBy(oEvent.getSource());
	},

	// receives PR item with selection from popup
	// and deletes in this view this PR item
	receiveSelection : function(chan, event, data) {
		if (!this.oList) {
			return;
		}

		if (data.sOrigin === "PR_List") {
			// hide this item from list:
			var aNewModel = [];
			var iLength = this.oTableModel.oData.PRItemCollection.length;
			var bHasMultiple = false;
			// build a new model based on the oTableModel with the difference that some items
			// will have the property 'HideMe' = true
			for (var i=0; i < iLength; i++) {
				if (this.oTableModel.oData.PRItemCollection[i].PRKey === data.oPRItem.PRKey) {
					this.oTableModel.oData.PRItemCollection[i].HideMe = true;
					this.oTableModel.oData.PRItemCollection[i].ItemSelected = true;
				} else if (this.oTableModel.oData.PRItemCollection[i].AssignedSupplierCount > 1 && !this.oTableModel.oData.PRItemCollection[i].HideMe === true){
						// this PRItem is not hidden and can have multiple suppliers
						bHasMultiple = true;
				}
				aNewModel.push(this.oTableModel.oData.PRItemCollection[i]);
			}
			// set the new table model
			this.oTableModel.setData({
				"PRItemCollection" : aNewModel
			});

			if (this.oList) {
				this.oList.setModel(this.oTableModel, "PR_appr_model");
				this.refreshList();
			}
			// publish the new numbers..
			// deduce the automatically assigned ones from both number
			// even if in backend nothing changed.
			this.approvedPRs_all -= 1;
			this.approvedPRs_ui -= 1;
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "count", {
				count_prapproved : this.approvedPRs_all,
				count_loaded : this.approvedPRs_ui
			});
			// publish color to icon
			if (bHasMultiple == true){
				// at least one PRITem with multiple suppliers
				sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", {
					btnPRreleasedColor : sap.ui.core.IconColor.Critical
				});
			} else {
				sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", {
					btnPRreleasedColor : sap.ui.core.IconColor.Default
				});
			}
		}
	},

	// to fetch more data from backend
	onLoadMoreData : function(oEvent) {

		// to avoid calls in mock mode..
		if (this.oModel && this.oModel.read) {

			this.skip += this.packagesize;
			var sSkip = "$skip=" + this.skip; // now increased value
			var sTop = "$top=" + this.packagesize;
			var sOrderby = "$orderby=" + this.orderby;
			var bMerge = true;

			this.loadDataforView(sSkip, sTop, sOrderby, bMerge);

		}
	},

	// does the filtering for items with / without exceptions
	filterValue : function(filterkey) {
		var oFilter;

		// filter key is the selected index of the filter values
		switch (filterkey) {
			case "noFilter" :
				this.bExceptionFilter = false;
				this.aFilter = []; // nothing to filter
				break;
			case "withException" :
				this.bExceptionFilter = true;
				oFilter = new sap.ui.model.Filter("SupplierMultiple", sap.ui.model.FilterOperator.EQ, true);
				this.aFilter = [oFilter];
				break;
			case "withoutException" :
				this.bExceptionFilter = true;
				oFilter = new sap.ui.model.Filter("SupplierMultiple", sap.ui.model.FilterOperator.EQ, false);
				this.aFilter = [oFilter];
				break;
		}
		this.refreshList();

	},

	// updates the numbers for the load more data button
	updateButtonText : function(chan, event, data) {
		if (data.count_prapproved) {
			var oButton = this.byId("btnLoad");
			var sText = this.oBundle.getText("view.POfromPR.load_more");
			sText += " [ " + data.count_loaded + " / " + data.count_prapproved + " ] ";
			if (oButton) {
				oButton.setText(sText);
			}
		}
	},

	// for the exception column to see the relevant icon
	exceptionFormatter : function(sAssignedSupplierCount, bError) {
		var sIcon = "";
		if (bError) {
			// clarify the error case -> different icon ?
			sIcon = "sap-icon://alert";
		} else {
			var iSupplierCount = parseInt(sAssignedSupplierCount);
			// if a supplier stays on the first page, to be able
			// to show it, tbc
			if (iSupplierCount >= 1) {
				sIcon = "sap-icon://warning2";
			}
		}
		return sIcon;
	},

	// color -> use css class style as in icon filter
	exceptionColorFormatter : function(sAssignedSupplierCount, bError) {
		var sColor = undefined;
		var iSupplierCount = parseInt(sAssignedSupplierCount);
		if (bError) { // return error color #cc1919
			sColor = sap.ui.core.theming.Parameters.get("sapUiNegative");
		} else {
			if (iSupplierCount >= 1) { // the action color #d14900
				sColor = sap.ui.core.theming.Parameters.get("sapUiCritical");
			}
		}
		return sColor;
	},

	// doesn't work currently ? to set the class dynamically to the icon
	exceptionClassFormatter : function(sAssignedSupplierCount, bError) {
		var sClass = "";
		var iSupplierCount = parseInt(sAssignedSupplierCount);
		if (bError) { // return error color
			sClass = "sapMITFilterNegative"; // "#cc1919";
		} else {
			if (iSupplierCount >= 1) { // the action color
				sClass = "sapMITFilterCritical"; // "#d14900";
			}
		}
		return sClass;
	},

	// applies the filters to the list
	// per default always apply the HideMe = true filter
	refreshList : function() {
		if (!this.oList) {
			return;
		}
		var oListBinding = this.oList.getBinding("items");
		var oFilter = new sap.ui.model.Filter("HideMe", sap.ui.model.FilterOperator.EQ, false);
		var aFilter = [];

		aFilter.push(oFilter);

		if (this.aFilter.length > 0) {
			jQuery.merge(aFilter, this.aFilter);
		}
		if (oListBinding) {
//TODO: not needed or even wrong here?
//			this.oList.removeSelections(true);
			oListBinding.filter(aFilter, sap.ui.model.FilterType.Control);
		}
	},

	// toggle for showing List or NoData (true for List)
	toggleListVisibility : function(value) {
		if (this.oList) {
			this.oList.setVisible(value);
		}
		// this.byId("ShowMore").setVisible(value);
		var oShowMore = this.byId("ShowMore");
		if (oShowMore) {
			oShowMore.setVisible(value);
		}
		// this.byId("NoData").setVisible(!value);
		var oNoData = this.byId("NoData");
		if (oNoData) {
			oNoData.setVisible(!value);
		}
	},

	// Navigation to PR Item Factsheet
	onPRItem : function(oEvent) {
		// Get the selected PR Item
		var oContext = oEvent.getSource().getBindingContext("PR_appr_model");
		var sPRKey = oContext.getProperty("PRKey");
		sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.FS_PR_Item").oParams.sCallerId = oEvent.getSource().getId();
		sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.FS_PR_Item").oParams.sPath = oContext.getPath();
		sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.FS_PR_Item").oParams.oList = oEvent.getSource().getParent().getParent().getBinding("items").aIndices;
		this.oRouter.navTo("pr_Item", {
			prKey : sPRKey
		});
	},

	setTableHeader : function() {

		var oVSDialogFilter = this.getVSDialogFilter();
			this.oList.setInfoToolbar(
				new sap.m.Toolbar({
					active : true,
					visible : false,
					press: function (evt) {oVSDialogFilter.open();},
					content : [
						new sap.m.Label({ text : "?"}),
						new sap.m.ToolbarSpacer(),
						new sap.ui.core.Icon({src : "sap-icon://add-filter"})
					]
				})
			);
	},

	getVSDialogSort : function() {

		var that = this;
		if (that.oVSDialogSort) {return that.oVSDialogSort;}
		var oVSDialogSort = new sap.m.ViewSettingsDialog({
			sortItems : [
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.PR_List.column_id"),
					key : "PRKey",
					selected: true
				}),
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.POfromPR.filte_exceptions"),
					key : "SupplierMultiple"
				}),
				new sap.m.ViewSettingsItem({
					text : that.oBundle.getText("view.PR_List.column_reldate"),
					key : "ReleaseDate"
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

				//sort at UI
				if (that.approvedPRs_all === that.approvedPRs_ui) {
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

				// sort in back-end
				} else {
					var sSkip = "$skip=0";
					var sTop = "$top=50";
					that.orderbyAttr = sSortKey;
					if (bDescending === true) {
						that.orderby = that.orderbyAttr + " desc";
					} else {
						that.orderby = sSortKey;
					}
					var sOrderby = "$orderby=" + that.orderby;
					var bMerge = false;
					that.loadDataforView(sSkip, sTop, sOrderby, bMerge);
				}
			},
		});
		that.oVSDialogSort = oVSDialogSort;
		return oVSDialogSort;
	},

	getVSDialogFilter : function() {

		var that = this;
		if (that.oVSDialogFilter) {return that.oVSDialogFilter;}
		var oVSDialogFilter = new sap.m.ViewSettingsDialog({
			presetFilterItems : [
				new sap.m.ViewSettingsFilterItem({
					text : that.oBundle.getText("view.POfromPR.filte_exceptions"),
					key : "withException",
					multiSelect: false,
				}),
				new sap.m.ViewSettingsFilterItem({
					text : that.oBundle.getText("view.POfromPR.filter_no_exceptions"),
					key : "withoutException",
					multiSelect: false,
				})
			],
			confirm : function (evt) {
				var mParams = evt.getParameters();
				var sToolbarVisible = false;
				if (!mParams.presetFilterItem) {
					that.filterValue("noFilter");
				} else {
					var sFilterKey = mParams.presetFilterItem.getKey();
					that.filterValue(sFilterKey);
					sToolbarVisible = true;
				}

				// update filter bar
				var oFilterBar = that.oList.getInfoToolbar();
				oFilterBar.setVisible(sToolbarVisible);
				var oFilterLabel = oFilterBar.getContent()[0];
				oFilterLabel.setText(mParams.filterString);
			},
		});
		that.oVSDialogFilter = oVSDialogFilter;
		return oVSDialogFilter;
	},
});
