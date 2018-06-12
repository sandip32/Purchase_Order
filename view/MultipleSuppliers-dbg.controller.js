/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.MultipleSuppliers", {

	onInit : function() {

		this.supplierBindingPath = "";
		this.oRouter = undefined;
		// add listener
		this.oBus = sap.ui.getCore().getEventBus();
		this.oBus.subscribe("ui.s2p.mm.purord.fromrequisition.supplier", "path", this.setSupplierList, this);
		var oList = this.byId("supplist");
		if (oList) {
			oList.setShowNoData(false);
		}
	},
	onExit : function() {
		sap.ui.getCore().getEventBus().unsubscribe("ui.s2p.mm.purord.fromrequisition.supplier", "path", this.setSupplierList, this);
	},

	// sets binding for suppliers
	setSupplierList : function(chan, evnt, data) {

		var oList = this.byId("supplist");
		var oListItemTemplate = this.byId("listitem");
		if (oList && oListItemTemplate) {
			oList.bindItems(data.path, oListItemTemplate);
		}

		this.itemPath = data.itempath;

		// get backendModel
		this.oBackendModel = data.backendModel;

		// cut off index from the end
		var nPos = data.itempath.lastIndexOf("/");
		this.iPRItemIndex = data.itempath.slice(nPos + 1);

		var oText = this.byId("above");
		if (oText && data.displayText) {
			oText.setText(data.displayText);
		}

	},

	// sets the selected supplier + needed data to the data model
	// maps the data to the PRItem level
	onSupplierAssign : function(oEvent) {

		var oContext = oEvent.getSource().getBindingContext();
		var sPath = oContext.getPath();

		var sPRSourceKeys = oContext.getProperty(sPath + "/PRSourceKeys");
		var sSupplierID = oContext.getProperty(sPath + "/FixedVendor");
		var sSupplierName = oContext.getProperty(sPath + "/FixedVendorName");

		var sOpenQuantityUnit = oContext.getProperty(sPath + "/OpenQuantityUnit");
		var sOpenQuantityUnitDescription = oContext.getProperty(sPath + "/OpenQuantityUnitDescription");
		var sOpenQuantity = oContext.getProperty(sPath + "/OpenQuantity");
		var sOpenQuantityFormatted = oContext.getProperty(sPath + "/OpenQuantityFormatted");

		var sNetPrice = oContext.getProperty(sPath + "/NetPrice");
		var sNetPriceFormatted = oContext.getProperty(sPath + "/NetPriceFormatted");
		var sNetOrderValue = oContext.getProperty(sPath + "/NetOrderValue");
		var sNetOrderValueFormatted = oContext.getProperty(sPath + "/NetOrderValueFormatted");

		var sCurrency = oContext.getProperty(sPath + "/Currency");
		var sPriceUnit = oContext.getProperty(sPath + "/PriceUnit");
		var sOrderPriceUnit = oContext.getProperty(sPath + "/OrderPriceUnit");
		var sOrderPriceUnitDescription = oContext.getProperty(sPath + "/OrderPriceUnitDescription");

		var sPurchasingOrganization =  oContext.getProperty(sPath + "/PurchasingOrg");

		if (sSupplierID !== "") {

			var oModel = this.oView.getModel();
			var obind = oModel.bindProperty(this.itemPath + "/SupplierId");
			obind.setValue(sSupplierID);
			obind = oModel.bindProperty(this.itemPath + "/SupplierName");
			obind.setValue(sSupplierName);

			obind = oModel.bindProperty(this.itemPath + "/PRSourceKeys");
			obind.setValue(sPRSourceKeys);

			obind = oModel.bindProperty(this.itemPath + "/OpenQuantityUnit");
			obind.setValue(sOpenQuantityUnit);
			obind = oModel.bindProperty(this.itemPath + "/OpenQuantityUnitDescription");
			obind.setValue(sOpenQuantityUnitDescription);
			obind = oModel.bindProperty(this.itemPath + "/OpenQuantity");
			obind.setValue(sOpenQuantity);
			obind = oModel.bindProperty(this.itemPath + "/OpenQuantityFormatted");
			obind.setValue(sOpenQuantityFormatted);

			obind = oModel.bindProperty(this.itemPath + "/Price");
			obind.setValue(sNetPrice);
			obind = oModel.bindProperty(this.itemPath + "/PriceFormatted");
			obind.setValue(sNetPriceFormatted);
			obind = oModel.bindProperty(this.itemPath + "/Value");
			obind.setValue(sNetOrderValue);
			obind = oModel.bindProperty(this.itemPath + "/ValueFormatted");
			obind.setValue(sNetOrderValueFormatted);

			obind = oModel.bindProperty(this.itemPath + "/Currency");
			obind.setValue(sCurrency);
			obind = oModel.bindProperty(this.itemPath + "/PriceUnit");
			obind.setValue(sPriceUnit);
			obind = oModel.bindProperty(this.itemPath + "/OrderPriceUnit");
			obind.setValue(sOrderPriceUnit);
			obind = oModel.bindProperty(this.itemPath + "/OrderPriceUnitDescription");
			obind.setValue(sOrderPriceUnitDescription);

			obind = oModel.bindProperty(this.itemPath + "/PurchasingOrganization");
			obind.setValue(sPurchasingOrganization)
			;
			var oPRItem = oModel.getData().PRItemCollection[this.iPRItemIndex];

			// the view is embedded in a popup -> close it.
			this.oView.getParent().close();

			// publish the selection in this case
			sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.popup", "selection", {
				// pathes from triggering model
				sItemPath : this.itemPath,
				iPRItemIndex : this.iPRItemIndex,
				sContextPath : sPath, // path to selected supplier
				oPRItem : oPRItem, // the relevant PRItem entry
				sOrigin : this.oView.getParent().sOrigin

			});

		} else {
			// do nothing special, can this happen at all?
			// the view is embedded in a popup -> close it.
			this.oView.getParent().close();
		}
	},

	// navigation to Supplier Factsheet
	onSupplierLink : function(oEvent) {

		var oContext = oEvent.oSource.getBindingContext();

		this.oRouter.navTo("supplier", {
			supplierId             : oContext.getProperty("FixedVendor"),
			companyCode            : oContext.oModel.getProperty(this.itemPath + "/CompanyCode"),
			purchasingOrganization : oContext.getProperty("PurchasingOrg")
		});

		// the view is embedded in a popup -> close it.
		this.oView.getParent().close();

	},

	formatAssignButton : function(error, documentCategory) {
		if (error || documentCategory === 'L') {
			return false;
		} else {
			return true;
		}

	},

	formatPriceError : function(error) {
		return (error) ? "sap-icon://alert" : "";
	}

});
