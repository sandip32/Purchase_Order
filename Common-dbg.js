/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("ui.s2p.mm.purord.fromrequisition.Common");

jQuery.sap.require("sap.ui.base.Object");
jQuery.sap.require("sap.m.Popover");
jQuery.sap.require("sap.ca.ui.message.message");

sap.ui.base.Object.extend("ui.s2p.mm.purord.fromrequisition.Common", {});

// returns a supplier popup for 2 views
// oModel: the table model of the triggering view
ui.s2p.mm.purord.fromrequisition.Common.getSupplierPopup = function(oModel, oI18nModel, oRouter) {

	var oView = new sap.ui.view({
		viewName : "ui.s2p.mm.purord.fromrequisition.view.MultipleSuppliers",
		type : sap.ui.core.mvc.ViewType.XML
	});
	oView.setModel(oModel);
	// the i18n model for the texts
	oView.setModel(oI18nModel, "i18n");
	oView.getController().oRouter = oRouter;
	
	var oPopup = new sap.m.Popover({
		placement : sap.m.PlacementType.Right
	});

	oPopup.addContent(oView);

	return oPopup;

};

ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage = function(sMessage, sDetails) {

	var oSettings = {
		message : sMessage,
		type : sap.ca.ui.message.Type.ERROR
	};
	if (sDetails !== "") {
		oSettings.details = sDetails;
	}

	sap.ca.ui.message.showMessageBox(oSettings);
};

ui.s2p.mm.purord.fromrequisition.Common.ShowWarningMessage = function(sMessage, sDetails) {

	var oSettings = {
		message : sMessage,
		type : sap.ca.ui.message.Type.WARNING
	};
	if (sDetails !== "") {
		oSettings.details = sDetails;
	};

	sap.ca.ui.message.showMessageBox(oSettings);
};

// returns a popup with a single select list for sorting / filtering
ui.s2p.mm.purord.fromrequisition.Common.getListPopup = function(sTitle, aListValues, iSelected,
		fnSelect, oListener) {

	var oPopup = new sap.m.Popover({
		placement : sap.m.PlacementType.Top,
		title : sTitle
	});

	var oList = new sap.m.List({
		mode : "SingleSelectLeft",
		includeItemInSelection : true
	});

	jQuery.each(aListValues, function(key, value) {
		var oItem = new sap.m.StandardListItem();

		oItem.setTitle(value);
		if (key === iSelected) {
			oItem.setSelected(true);
		};
		oList.addItem(oItem);
	});

	oList.attachSelect(fnSelect, oListener);
	oPopup.addContent(oList);
	return oPopup;

};

// does the sorting of the list with json model (ui sorting)
// special case for value sorting included
ui.s2p.mm.purord.fromrequisition.Common.sortList = function(oList, sSortPath, bDescending) {

	if (!oList) {
		return;
	};

	var oSorter = new sap.ui.model.Sorter(sSortPath, bDescending);
	if (sSortPath === "Value") {
		// see sorter object in sap.ui.model.json.JSONListBinding.prototype.applySort
		// add own sort function because of value sorting
		oSorter.fnCompare = function(a, b) {
			var aVal = parseFloat(a);
			var bVal = parseFloat(b);
			if (aVal < bVal)
				return -1;
			if (aVal > bVal)
				return 1;
			return 0;
		};
	};

	var oListBinding = oList.getBinding("items");
	// triggers the necessary update of the list
	if(oListBinding)
	oListBinding.sort(oSorter);

};
