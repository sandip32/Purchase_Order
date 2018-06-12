jQuery.sap.registerPreloadedModules({
"name":"ui/s2p/mm/purord/fromrequisition/Component-preload",
"version":"2.0",
"modules":{
	"ui/s2p/mm/purord/fromrequisition/Common.js":function(){/*
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

},
	"ui/s2p/mm/purord/fromrequisition/Component.js":function(){/*
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
},
	"ui/s2p/mm/purord/fromrequisition/Configuration.js":function(){/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("ui.s2p.mm.purord.fromrequisition.Configuration");
jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");
jQuery.sap.require("sap.ca.scfld.md.app.Application");

sap.ca.scfld.md.ConfigurationBase.extend("ui.s2p.mm.purord.fromrequisition.Configuration", {

    oServiceParams: {
        serviceList: [
            {
                name: "SRA013_PO_FROM_PR_SRV",
                masterCollection: "PRItemCollection",
                serviceUrl: "/sap/opu/odata/sap/SRA013_PO_FROM_PR_SRV/",
                isDefault: true,
                mockedDataSource: "/ui.s2p.mm.purord.fromrequisition/model/metadata.xml",
                noBusyIndicator: false
            }
        ]
    },

	getServiceParams: function () {
		return this.oServiceParams;
	},

	/**
	 * @inherit
	 */
	getServiceList: function () {
		return this.oServiceParams.serviceList;
	},

	getMasterKeyAttributes: function () {
		return ["Id"];
	}

});

},
	"ui/s2p/mm/purord/fromrequisition/Main.controller.js":function(){/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
sap.ui.controller("ui.s2p.mm.purord.fromrequisition.Main", {

	onInit : function() {
		jQuery.sap.require("sap.ca.scfld.md.Startup");
		sap.ca.scfld.md.Startup.init('ui.s2p.mm.purord.fromrequisition', this);
	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * 
	 * @memberOf MainXML
	 */
	onExit : function() {
		//exit cleanup code here

		// reset models saved in parameter for simulated and created view
		if (sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Simulated").oParams.oModel)
			sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Simulated").oParams.oModel  = null;
		if (sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Created").oParams.oModel)
			sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Created").oParams.oModel = null;
	}
});
},
	"ui/s2p/mm/purord/fromrequisition/Main.view.xml":'<!--\r\n\r\n    Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\r\n\r\n-->\r\n<core:View xmlns:core     = "sap.ui.core"\r\n           xmlns          = "sap.m" \r\n           controllerName = "ui.s2p.mm.purord.fromrequisition.Main"\r\n           displayBlock   = "true" \r\n           height         = "100%">\r\n\t<App id="fioriContent">\r\n\t</App>\r\n</core:View>',
	"ui/s2p/mm/purord/fromrequisition/util/Formatter.js":function(){/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("ui.s2p.mm.purord.fromrequisition.util.Formatter");

jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("ui.s2p.mm.purord.fromrequisition.Common");
jQuery.sap.require("sap.ca.ui.model.format.NumberFormat");
jQuery.sap.require("sap.ca.ui.model.format.AmountFormat");

ui.s2p.mm.purord.fromrequisition.util.Formatter = {
		
	oBundle : sap.ca.scfld.md.app.Application.getImpl().getResourceBundle(),

	// formatter "PR ID" - "PR Item ID"
	formatPRItem : function(sPR, sPRItem) {
		return sPR + "-" + sPRItem;
	},

	formatAmount : function(value, currency) {
		return sap.ca.ui.model.format.AmountFormat.FormatAmountStandard(value, currency);
	},

	// to have a method that works with mock string date data
	// as well as odata date object data
	formatDateShort : function(date) {

		var oDateFormatShort = sap.ui.core.format.DateFormat.getDateInstance({
			style : "short"
		}, sap.ui.getCore().getConfiguration().getLocale());

		if (typeof date === 'string') {
			date = new Date(date);
		}
		if (date instanceof Date) {
			// from odata service and above
			return oDateFormatShort.format(date);
		} else {
			return "";
		}
	},

	formatDateLong : function(date) {
		var oDateFormatLong = sap.ui.core.format.DateFormat.getDateInstance({
			style : "long"
		}, sap.ui.getCore().getConfiguration().getLocale());

		// For mock string date data
		if (typeof date === 'string') {
			date = new Date(date);
		}
		if (date instanceof Date) {
			return oDateFormatLong.format(date);
		} else {
			return "";
		}
	},

	// Returns: <Description> (<ID> if available)
	formatItemDesc : function(sDescription, sID) {
		if (sID == null || sID == "")
			return sDescription;
		else
			return sDescription + " (" + sID + ")";
	},

	// formats the string for the materials quantity ordered open in a purchase req item
	// 
	// data-text="{parts:[ {path:'OpenQuantityFormatted'},
	// {path:'OpenQuantityUnitDescription'}],
	formatMatQuantity : function(openquantity, oqudesc) {

		var sMaterialQuantity = "";
		sMaterialQuantity = ui.s2p.mm.purord.fromrequisition.util.Formatter.formatNumber(openquantity)
				+ " " + oqudesc;
		return sMaterialQuantity;
	},

	// the Unit price is used at 2 place -> separate method
	formatUnitPrice : function(price, curr, priceunit, opudesc) {
		
		var sUnitPrice = "";

		// the no price case
		if (price === "") {
			// no price could be determined -> exit
			return ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle.getText("view.PR_List.no_price");
		}

		return sUnitPrice = (priceunit === "1") ? ui.s2p.mm.purord.fromrequisition.util.Formatter
				.formatNumber(price)
				+ " " + curr + " / " + opudesc : ui.s2p.mm.purord.fromrequisition.util.Formatter
				.formatNumber(price)
				+ " " + curr + " / " + priceunit + " " + opudesc;

	},

	formatUnitPriceL : function(price, curr, priceunit, opudesc) {
		
		var sUnitPrice = ui.s2p.mm.purord.fromrequisition.util.Formatter.formatUnitPrice(price,
				curr, priceunit, opudesc);
		if (sUnitPrice) {
			var sLabel = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle.getText("view.MultipleSuppliers.unit_price");
			return sLabel + ": " + sUnitPrice;

		}
	},

	// formatter for incoterms
	formatIncoterms : function(inco1, inco2) {
		var sInco = "";
		if (inco1) {
			sInco = inco1;
			if (inco2) {
				sInco = sInco + " - " + inco2;
			}
		}

		return sInco;
	},

	formatIncotermsL : function(inco1, inco2) {
	
		var sInco = ui.s2p.mm.purord.fromrequisition.util.Formatter.formatIncoterms(inco1, inco2);
		var sLabel = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle.getText("view.MultipleSuppliers.inco_terms");

		if (sInco)
			return sLabel + ": " + sInco;
	},

	// formatter for payment terms string
	// from sp02 on: take PaymentTermsDescription from backend to be in synch with poa / pra apps
	formatPaymentTerms : function(CashDiscountDays1, CashDiscountPercentage1, CashDiscountDays2, CashDiscountPercentage2,
			CashDiscountDays3, PaymentTermsDescription) {

		if (PaymentTermsDescription === undefined) {
			var sDays = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
					.getText("view.MultipleSuppliers.days");

			var sDaysNet = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
					.getText("view.MultipleSuppliers.daysnet");

			return CashDiscountDays1 + " " + sDays + " " + CashDiscountPercentage1 + " %, " + CashDiscountDays2 + " " + sDays
					+ " " + CashDiscountPercentage2 + " %, " + CashDiscountDays3 + " " + sDaysNet;
		} else {
			return PaymentTermsDescription;
		}

	},

	formatPaymentTermsL : function(CashDiscountDays1, CashDiscountPercentage1, CashDiscountDays2,
			CashDiscountPercentage2, CashDiscountDays3, PaymentTermsDescription) {
		var sPayment = ui.s2p.mm.purord.fromrequisition.util.Formatter.formatPaymentTerms(
				CashDiscountDays1, CashDiscountPercentage1, CashDiscountDays2, CashDiscountPercentage2, CashDiscountDays3,
				PaymentTermsDescription);
		if (sPayment) {
			var sLabel = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
					.getText("view.MultipleSuppliers.payment_terms");
			return sLabel + ": " + sPayment;
		}

	},

	// formatter for Source -> clarification needed
	formatSource : function(Agreement, AgreementItem, InfoRecord, DocumentCategory) {
		// 1) if Agreement filled -> return "Contract" + Agreement - Agreementitem
		// 2) if agreement empty, check InfoRecord -> return "InfoRecord" - InfoRecord
		// 3) if Agreement empty and InfoRecord empty and SupplierID filled -> Supplier

		var sText;

		if (Agreement !== "" && AgreementItem != "") {

			switch (DocumentCategory) {

				case "K" :
					sText = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
							.getText("view.MultipleSuppliers.source_contract");
					return sText + " " + Agreement + "-" + AgreementItem;
					break;
				case "L" :
					sText = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
							.getText("view.MultipleSupplier.source_schedagree");
					return sText + " " + Agreement + "-" + AgreementItem;
					break;
			}

		} else if (Agreement === "" && InfoRecord != "") {
			sText = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
					.getText("view.MultipleSuppliers.source_inforec");
			return sText + " " + InfoRecord;

		} else if (Agreement === "" && InfoRecord === "") {
			// the Supplier case
			return sText = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
					.getText("view.PO_List.supplier");
		}

	},

	formatSourceL : function(Agreement, AgreementItem, InfoRecord, DocumentCategory) {
		var sSource = ui.s2p.mm.purord.fromrequisition.util.Formatter.formatSource(Agreement,
				AgreementItem, InfoRecord, DocumentCategory);
		var sLabel = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
				.getText("view.MultipleSuppliers.source");
		if (sSource)
			return sLabel + ": " + sSource;
	},

	// additional info message for scheduling agreements (DocumentCategory L)
	formatErrorMessageDocCategory : function(DocumentCategory) {
		return (DocumentCategory === 'L') ? ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
				.getText("view.MultipleSupplier.source_schedagree_mess") : "";
	},

	// formatter for evaluated receipt settlement
	formatReceiptSettlement : function(receiptSettlement) {
		if (receiptSettlement === "X") {
			return ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle.getText("view.POfromPR.yes");
		}

		// as we do not know if the field is set to no or there service wasn't able to read the field the text NO is not set
		// here
		// else if (receiptSettlement === "") {
		// return sText = sap.mm.purchaseorderfrompurchaserequisition.create.util.Formatter.oBundle
		// .getText("view.POfromPR.no");
		// }
	},

	// evaluate the status of the supplier (for Supplier Factsheet)
	formatSupplierStatus : function(OrgPurchasingBlock, CentralPurchasingBlock, CentralPostingBlock, CompanyPostingBlock) {

		if (OrgPurchasingBlock === "X" || CentralPurchasingBlock === "X" || CentralPostingBlock === "X"
				|| CompanyPostingBlock === "X") {
			return ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
					.getText("view.Supplier_Factsheet.Blocked");
		} else {
			return ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
					.getText("view.Supplier_Factsheet.Active");
		}

	},

	formatNumber : function(number) {
		return sap.ui.core.format.NumberFormat.getFloatInstance().format(number);

	},


	lazyFormatNumber : function(number) {
		if (number)
			if (!isNaN(parseFloat(number)) && isFinite(number))
				if (Math.abs(number) < 1e6)
					return sap.ui.core.format.NumberFormat.getFloatInstance().format(number);
				else
					return sap.ca.ui.model.format.NumberFormat.getInstance({style:'short'}).format(number);
		return "";
	},
	
	formatQuantityandUnit : function(sQuantity, sUnit) {
		return sap.ui.core.format.NumberFormat.getFloatInstance().format(sQuantity) + " " + sUnit;
	},

	formatPricePerUnit : function(sPrice, sCurrency, sPriceUnit, sPriceUnitDescr) {

		var sUnitPrice;

		if (sPrice === "") {
			// No price available
			sUnitPrice = ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle
					.getText("view.PR_List.no_price");
		} else {
			sUnitPrice = ui.s2p.mm.purord.fromrequisition.util.Formatter.formatNumber(sPrice) + " "
					+ sCurrency + " "
					+ ui.s2p.mm.purord.fromrequisition.util.Formatter.oBundle.getText("fs.pritem.per")
					+ " " + sPriceUnit + " " + sPriceUnitDescr;
		}
		return sUnitPrice;
	}

};
// end formatter object

},
	"ui/s2p/mm/purord/fromrequisition/view/FS_PR_Item.controller.js":function(){/*
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

},
	"ui/s2p/mm/purord/fromrequisition/view/FS_PR_Item.view.xml":'<!--\n\n    Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\n\n-->\n<core:View\txmlns:core="sap.ui.core" \n\t\t\txmlns="sap.m"\n\t\t\txmlns:form="sap.ui.layout.form" \n\t\t\txmlns:layout="sap.ui.layout"\n\t\t\txmlns:me="sap.me"\n\t\t\tcontrollerName="ui.s2p.mm.purord.fromrequisition.view.FS_PR_Item">\n\t<Page id="pg_FS_PR_Item" \n\t\t  class="sapUiFioriObjectPage">\n\t\n        <customHeader>\n            <Bar>\n                <contentLeft>\n                    <Button press="onBack" icon="sap-icon://nav-back"></Button>\n                </contentLeft>\n                <contentMiddle>\n                    <Label text="{i18n>fs.pritem.title}"></Label>\n                </contentMiddle>\n                <contentRight> \n                \t<Button id="btnPreviousPRItem" icon="sap-icon://up"  press="onOtherPRItem"></Button>\n                \t<Button id="btnNextPRItem"     icon="sap-icon://down" press="onOtherPRItem"></Button>\n                </contentRight>\n            </Bar>\n        </customHeader>\n        \n        <content>\n            <ObjectHeader \n            \ttitle="{parts:[{path:\'PR_item_model>/PRNumberFormatted\'},{path:\'PR_item_model>/PRItemFormatted\'}], formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatPRItem\'}"\n                number="{path:\'PR_item_model>/Value\', formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatNumber\'}"\n                numberUnit="{PR_item_model>/Currency}">\n                <attributes>\n                    <ObjectAttribute text="{PR_item_model>/ProductDescription}"> </ObjectAttribute>\n                </attributes>\n            </ObjectHeader>\n\n\t\t\t\t\t<form:Form>\n\t\t\t\t\t\t<form:layout>\n\t\t\t\t\t\t\t<form:ResponsiveLayout></form:ResponsiveLayout>\n\t\t\t\t\t\t</form:layout>\n\t\t\t\t\t\t<form:formContainers>\n\t\t\t\t\t\t\t<form:FormContainer>\n\t\t\t\t\t\t\t\t<form:layoutData>\n\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\tlinebreak="true" margin="false"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t</form:layoutData>\n\n\t\t\t\t\t\t\t\t<form:formElements>\n\t\t\t\t\t\t\t\t\t<!-- Requested by -->\n\t\t\t\t\t\t\t\t\t<form:FormElement>\n\t\t\t\t\t\t\t\t\t\t<form:layoutData>\n\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\tlinebreak="true" margin="false"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t</form:layoutData>\n\t\t\t\t\t\t\t\t\t\t<form:label>\n\t\t\t\t\t\t\t\t\t\t\t<Label text="{i18n>view.PR_Factsheet.requestor}"></Label>\n\t\t\t\t\t\t\t\t\t\t</form:label>\n\t\t\t\t\t\t\t\t\t\t<form:fields>\n\t\t\t\t\t\t\t\t\t\t\t<Text text="{PR_item_model>/RequestedByUserName}">\n\t\t\t\t\t\t\t\t\t\t\t\t<layoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tweight="2"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t</layoutData>\n\t\t\t\t\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t\t\t\t</form:fields>\n\t\t\t\t\t\t\t\t\t</form:FormElement>\n\n\t\t\t\t\t\t\t\t\t<!-- Material -->\n\t\t\t\t\t\t\t\t\t<form:FormElement>\n\t\t\t\t\t\t\t\t\t\t<form:layoutData>\n\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\tlinebreak="true" margin="false"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t</form:layoutData>\n\t\t\t\t\t\t\t\t\t\t<form:label>\n\t\t\t\t\t\t\t\t\t\t\t<Label text="{i18n>view.PR_List.column_mat}"></Label>\n\t\t\t\t\t\t\t\t\t\t</form:label>\n\t\t\t\t\t\t\t\t\t\t<form:fields>\n\t\t\t\t\t\t\t\t\t\t\t<Text text="{parts:[{path : \'PR_item_model>/ProductDescription\'},{path: \'PR_item_model>/ProductID\'}], \n\t\t\t\t\t\t\t\t\t\t\t             formatter : \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatItemDesc\'}">\n\t\t\t\t\t\t\t\t\t\t\t\t<layoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tweight="2"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t</layoutData>\n\t\t\t\t\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t\t\t\t</form:fields>\n\t\t\t\t\t\t\t\t\t</form:FormElement>\n\n\t\t\t\t\t\t\t\t\t<!-- Quantity -->\n\t\t\t\t\t\t\t\t\t<form:FormElement>\n\t\t\t\t\t\t\t\t\t\t<form:layoutData>\n\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\tlinebreak="true" margin="false"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t</form:layoutData>\n\t\t\t\t\t\t\t\t\t\t<form:label>\n\t\t\t\t\t\t\t\t\t\t\t<Label text="{i18n>view.PO_List.quantity}"></Label>\n\t\t\t\t\t\t\t\t\t\t</form:label>\n\t\t\t\t\t\t\t\t\t\t<form:fields>\n\t\t\t\t\t\t\t\t\t\t\t<Text text="{parts:[{path : \'PR_item_model>/OpenQuantityFormatted\'},{path: \'PR_item_model>/OpenQuantityUnitDescription\'}], \n\t\t\t\t\t\t\t\t\t\t\t             formatter : \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatQuantityandUnit\'}">\n\t\t\t\t\t\t\t\t\t\t\t\t<layoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tweight="2"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t</layoutData>\n\t\t\t\t\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t\t\t\t</form:fields>\n\t\t\t\t\t\t\t\t\t</form:FormElement>\n\n\t\t\t\t\t\t\t\t\t<!-- Price per unit -->\n\t\t\t\t\t\t\t\t\t<form:FormElement>\n\t\t\t\t\t\t\t\t\t\t<form:layoutData>\n\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\tlinebreak="true" margin="false"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t</form:layoutData>\n\t\t\t\t\t\t\t\t\t\t<form:label>\n\t\t\t\t\t\t\t\t\t\t\t<Label text="{i18n>fs.pritem.price_per_unit}"></Label>\n\t\t\t\t\t\t\t\t\t\t</form:label>\n\t\t\t\t\t\t\t\t\t\t<form:fields>\n\t\t\t\t\t\t\t\t\t\t\t<Text text="{parts:[{path:\'PR_item_model>/Price\'},{path:\'PR_item_model>/Currency\'},{path:\'PR_item_model>/PriceUnit\'},{path:\'PR_item_model>/OrderPriceUnitDescription\'}], \n\t\t\t\t\t\t\t\t\t\t\t            formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatPricePerUnit\'}">\n\t\t\t\t\t\t\t\t\t\t\t\t<layoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tweight="2"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t</layoutData>\n\t\t\t\t\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t\t\t\t</form:fields>\n\t\t\t\t\t\t\t\t\t</form:FormElement>\n\n\t\t\t\t\t\t\t\t\t<!-- Material Group -->\n\t\t\t\t\t\t\t\t\t<form:FormElement>\n\t\t\t\t\t\t\t\t\t\t<form:layoutData>\n\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\tlinebreak="true" margin="false"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t</form:layoutData>\n\t\t\t\t\t\t\t\t\t\t<form:label>\n\t\t\t\t\t\t\t\t\t\t\t<Label text="{i18n>view.PR_Factsheet.mat_group}"></Label>\n\t\t\t\t\t\t\t\t\t\t</form:label>\n\t\t\t\t\t\t\t\t\t\t<form:fields>\n\t\t\t\t\t\t\t\t\t\t\t<Text text="{parts:[{path : \'PR_item_model>/MaterialGroupDescription\'},{path: \'PR_item_model>/MaterialGroup\'}], \n\t\t\t\t\t\t\t\t\t\t\t             formatter : \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatItemDesc\'}">\n\t\t\t\t\t\t\t\t\t\t\t\t<layoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tweight="2"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t</layoutData>\n\t\t\t\t\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t\t\t\t</form:fields>\n\t\t\t\t\t\t\t\t\t</form:FormElement>\n\n\t\t\t\t\t\t\t\t\t<!-- Delivery on -->\n\t\t\t\t\t\t\t\t\t<form:FormElement>\n\t\t\t\t\t\t\t\t\t\t<form:layoutData>\n\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\tlinebreak="true" margin="false"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t</form:layoutData>\n\t\t\t\t\t\t\t\t\t\t<form:label>\n\t\t\t\t\t\t\t\t\t\t\t<Label text="{i18n>fs.pritem.delivery_on}"></Label>\n\t\t\t\t\t\t\t\t\t\t</form:label>\n\t\t\t\t\t\t\t\t\t\t<form:fields>\n\t\t\t\t\t\t\t\t\t\t\t<Text text="{path:\'PR_item_model>/DeliveryDate\', formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatDateLong\' }">\n\t\t\t\t\t\t\t\t\t\t\t\t<layoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tweight="2"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t</layoutData>\n\t\t\t\t\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t\t\t\t</form:fields>\n\t\t\t\t\t\t\t\t\t</form:FormElement>\n\n\t\t\t\t\t\t\t\t\t<!-- Delivery to -->\n\t\t\t\t\t\t\t\t\t<form:FormElement>\n\t\t\t\t\t\t\t\t\t\t<form:layoutData>\n\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\tlinebreak="true" margin="false"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t</form:layoutData>\n\t\t\t\t\t\t\t\t\t\t<form:label>\n\t\t\t\t\t\t\t\t\t\t\t<Label text="{i18n>fs.pritem.delivery_to}"></Label>\n\t\t\t\t\t\t\t\t\t\t</form:label>\n\t\t\t\t\t\t\t\t\t\t<form:fields>\n\t\t\t\t\t\t\t\t\t\t\t<Text text="{PR_item_model>/DeliveryAddressFormatted}" maxLines="0">\n\t\t\t\t\t\t\t\t\t\t\t\t<layoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tweight="2"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t</layoutData>\n\t\t\t\t\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t\t\t\t</form:fields>\n\t\t\t\t\t\t\t\t\t</form:FormElement>\n\n\t\t\t\t\t\t\t\t\t<!-- Plant -->\n\t\t\t\t\t\t\t\t\t<form:FormElement>\n\t\t\t\t\t\t\t\t\t\t<form:layoutData>\n\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\tlinebreak="true" margin="false"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t</form:layoutData>\n\t\t\t\t\t\t\t\t\t\t<form:label>\n\t\t\t\t\t\t\t\t\t\t\t<Label text="{i18n>view.PO_List.plant}"></Label>\n\t\t\t\t\t\t\t\t\t\t</form:label>\n\t\t\t\t\t\t\t\t\t\t<form:fields>\n\t\t\t\t\t\t\t\t\t\t\t<Text text="{parts:[{path : \'PR_item_model>/ShipToPlantDescription1\'},{path: \'PR_item_model>/ShipToPlant\'}], \n\t\t\t\t\t\t\t\t\t\t\t             formatter : \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatItemDesc\'}">\n\t\t\t\t\t\t\t\t\t\t\t\t<layoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData weight="2"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t</layoutData>\n\t\t\t\t\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t\t\t\t</form:fields>\n\t\t\t\t\t\t\t\t\t</form:FormElement>\n\n\t\t\t\t\t\t\t\t\t<!-- Supplier or Supplying Plant -->\n\t\t\t\t\t\t\t\t\t<form:FormElement>\n\t\t\t\t\t\t\t\t\t\t<form:layoutData>\n\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData\n\t\t\t\t\t\t\t\t\t\t\t\tlinebreak="true" margin="false"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t</form:layoutData>\n\t\t\t\t\t\t\t\t\t\t<form:label>\n\t\t\t\t\t\t\t\t\t\t\t<Label text="{i18n>view.PO_List.supplier}"></Label>\n\t\t\t\t\t\t\t\t\t\t</form:label>\n\t\t\t\t\t\t\t\t\t\t<form:fields>\n\t\t\t\t\t\t\t\t\t\t\t<Link id="lnkSupplier" press="onSupplierLink" \n\t\t\t\t\t\t\t\t\t\t\t    text="{parts:[{path:\'PR_item_model>/SupplierName\'},{path:\'PR_item_model>/SupplyingPlantDescription\'}], formatter : \'.formatSupplierOrPlant\'}">\n\t\t\t\t\t\t\t\t\t\t\t\t<layoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<layout:ResponsiveFlowLayoutData weight="2"></layout:ResponsiveFlowLayoutData>\n\t\t\t\t\t\t\t\t\t\t\t\t</layoutData>\n\t\t\t\t\t\t\t\t\t\t\t</Link>\n\t\t\t\t\t\t\t\t\t\t</form:fields>\n\t\t\t\t\t\t\t\t\t</form:FormElement>\n\n\t\t\t\t\t\t\t\t</form:formElements>\n\n\t\t\t\t\t\t\t</form:FormContainer>\n\n\t\t\t\t\t\t</form:formContainers>\n\t\t\t\t\t</form:Form>\n        </content>\n\n\t</Page>\n</core:View>',
	"ui/s2p/mm/purord/fromrequisition/view/FS_Supplier.controller.js":function(){/*
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
},
	"ui/s2p/mm/purord/fromrequisition/view/FS_Supplier.view.xml":'<!--\r\n\r\n    Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\r\n\r\n-->\r\n<core:View xmlns:core="sap.ui.core" xmlns="sap.m"\r\n\txmlns:form="sap.ui.layout.form"\r\n\tcontrollerName="ui.s2p.mm.purord.fromrequisition.view.FS_Supplier">\r\n\t<Page id="FS_Supplier_Page"\r\n\t\t  class="sapUiFioriObjectPage">\r\n\r\n\t\t<customHeader>\r\n\t\t\t<Bar>\r\n\t\t\t\t<contentLeft>\r\n\t\t\t\t\t<Button press="onBack" icon="sap-icon://nav-back"></Button>\r\n\t\t\t\t</contentLeft>\r\n\t\t\t\t<contentMiddle>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.header}"></Label>\r\n\t\t\t\t</contentMiddle>\r\n\t\t\t</Bar>\r\n\t\t</customHeader>\r\n\r\n\t\t<content>\r\n\r\n\t\t\t<ObjectHeader title="{supplier_model>/VendorName}">\r\n\t\t\t\t<attributes>\r\n\t\t\t\t\t<ObjectAttribute text="{supplier_model>/Address}"></ObjectAttribute>\r\n\t\t\t\t\t<!-- @ExtensionPoint supplier details: header -->\r\n\t\t\t\t\t<core:ExtensionPoint name="supplierDetailsHeader" />\r\n\t\t\t\t</attributes>\r\n\t\t\t</ObjectHeader>\r\n\r\n\t\t\t<!-- Contact Contact Info -->\r\n\t\t\t<form:SimpleForm id="ContactInfo" minWidth="1024" editable="false"\r\n\t\t\t\tlabelMinWidth="-1" maxContainerCols="2">\r\n\t\t\t\t<form:content>\r\n\t\t\t\t<!-- \t<core:Title text="{i18n_c>XTIT_BC_CONTACTINFO}"></core:Title> -->\r\n\t\t\t\t\t<core:Title text="{i18n>XTIT_BC_CONTACTINFO}"></core:Title>\t\t\t\t\t\r\n\t\t\t\t<!-- \t<Label text="{i18n_c>XTIT_BC_SupplierContact}"> -->\r\n\t\t\t\t\t<Label text="{i18n>XTIT_BC_SupplierContact}">\t\t\t\t\t\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Text text="{supplier_model>/SupplierContactCollection/results/0/ContactName}">\r\n\t\t\t\t\t</Text>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.phone}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Link id="bcContactPhone" press="onTapPhone"\r\n\t\t\t\t\t\ttext="{supplier_model>/SupplierContactCollection/results/0/WorkPhone}">\r\n\t\t\t\t\t</Link>\r\n\t\t\t<!-- \t\t<Label text="{i18n_c>XFLD_BC_MOBILE}"> -->\r\n\t\t\t\t\t<Label text="{i18n>XFLD_BC_MOBILE}">\t\t\t\t\t\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Link id="bcContactMobile" press="onTapPhone"\r\n\t\t\t\t\t\ttext="{supplier_model>/SupplierContactCollection/results/0/MobilePhone}">\r\n\t\t\t\t\t</Link>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.fax}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Text text="{supplier_model>/Fax}">\r\n\t\t\t\t\t</Text>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.website}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Link press="onTapWebsite" text="{supplier_model>/Url}">\r\n\t\t\t\t\t</Link>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.Mail}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Link press="onTapEmail" text="{supplier_model>/SupplierContactCollection/results/0/Email}">\r\n\t\t\t\t\t</Link>\r\n\t\t\t\t\t<!-- @ExtensionPoint supplier details: contact details -->\r\n\t\t\t\t\t<core:ExtensionPoint name="supplierDetailsContact" />\r\n\t\t\t\t</form:content>\r\n\t\t\t</form:SimpleForm>\r\n\t\t\t<!-- Supplier Details -->\r\n\t\t\t<form:SimpleForm id="SupplierDetail" minWidth="1024" editable="false">\r\n\t\t\t\t<form:content>\r\n\t\t\t\t\t<core:Title text="{i18n>view.Supplier_Factsheet.header}"></core:Title>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.CustID}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Text text="{supplier_model>/OurAccountWithVendor}" maxLines="0">\r\n\t\t\t\t\t</Text>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.class}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Text text="{supplier_model>/ABCIndicator}" maxLines="0">\r\n\t\t\t\t\t</Text>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.Industry}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Text text="{supplier_model>/IndustryDescription}" maxLines="0">\r\n\t\t\t\t\t</Text>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.Status}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Text id="SupplierStatus"\r\n\t\t\t\t\t\ttext="{parts:[ {path:\'supplier_model>/OrgPurchasingBlock\'},{path:\'supplier_model>/CentralPurchasingBlock\'},\r\n\t\t\t\t\t\t\t{path:\'supplier_model>/CentralPostingBlock\'},{path:\'supplier_model>/CompanyPostingBlock\'}],\r\n\t\t\t\t\t\t\tformatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatSupplierStatus\' }">\r\n\t\t\t\t\t</Text>\r\n\t\t\t\t\t<!-- @ExtensionPoint supplier details: supplier data -->\r\n\t\t\t\t\t<core:ExtensionPoint name="supplierDetailsData" />\r\n\t\t\t\t</form:content>\r\n\t\t\t</form:SimpleForm>\r\n\t\t\t<!-- Purchasing Data -->\r\n\t\t\t<form:SimpleForm id="PurchasingData" minWidth="1024" editable="false">\r\n\t\t\t\t<form:content>\r\n\t\t\t\t\t<core:Title text="{i18n>view.Supplier_Factsheet.Purch_header}"></core:Title>\r\n\t\t\t\t\t<Label text="{i18n>view.MultipleSuppliers.payment_terms}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Text id="payment"\r\n\t\t\t\t\t\ttext="{parts:[ {path:\'supplier_model>/CashDiscountDays1\'},{path:\'supplier_model>/CashDiscountPercentage1\'},\r\n\t\t\t\t\t\t\t{path:\'supplier_model>/CashDiscountDays2\'},{path:\'supplier_model>/CashDiscountPercentage2\'}, \r\n\t\t\t\t\t\t\t{path:\'supplier_model>/CashDiscountDays2\'}, {path:\'supplier_model>/PaymentTermsDescription\'}],\r\n\t\t\t\t\t\t\t\tformatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatPaymentTerms\' }">\r\n\t\t\t\t\t</Text>\r\n\t\t\t\t\t<Label text="{i18n>view.MultipleSuppliers.inco_terms}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Text\r\n\t\t\t\t\t\ttext="{parts:[ {path:\'supplier_model>/Incoterms1\'},{path:\'supplier_model>/Incoterms2\'} ],\r\n\t\t\t\t\t\t\t\tformatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatIncoterms\' }">\r\n\t\t\t\t\t</Text>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.Min_Purch_Val}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Text\r\n\t\t\t\t\t\ttext="{path:\'supplier_model>/MinimumOrderValue\', formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatNumber\'}">\r\n\t\t\t\t\t</Text>\r\n\t\t\t\t\t<Label text="{i18n>view.Supplier_Factsheet.receipt_settle}">\r\n\t\t\t\t\t</Label>\r\n\t\t\t\t\t<Text\r\n\t\t\t\t\t\ttext="{parts:[ {path:\'supplier_model>/EvaluatedReceiptSettlement\'} ],\r\n\t\t\t\t\t\t\t\tformatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatReceiptSettlement\' }">\r\n\t\t\t\t\t</Text>\r\n\t\t\t\t\t<!-- @ExtensionPoint supplier details: purchasing data -->\r\n\t\t\t\t\t<core:ExtensionPoint name="supplierDetailsPurData" />\r\n\t\t\t\t</form:content>\r\n\t\t\t</form:SimpleForm>\r\n\r\n\t\t\t<!-- @ExtensionPoint supplier details: additional customer data -->\r\n\t\t\t<core:ExtensionPoint name="supplierDetailsAddData" />\r\n\t\t</content>\r\n\t</Page>\r\n</core:View>',
	"ui/s2p/mm/purord/fromrequisition/view/MultipleSuppliers.controller.js":function(){/*
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

},
	"ui/s2p/mm/purord/fromrequisition/view/MultipleSuppliers.view.xml":'<!--\r\n\r\n    Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\r\n\r\n-->\r\n<core:View\txmlns:core="sap.ui.core"\r\n\t\t\tcontrollerName="ui.s2p.mm.purord.fromrequisition.view.MultipleSuppliers"\r\n\t\t\txmlns="sap.m" \r\n\t\t\txmlns:layout="sap.ui.layout">\r\n\t<layout:VerticalLayout class="sapMContainerMargin">\r\n\t\t<layout:content>\r\n\t\t\t<Text id="above" text="{i18n>view.MultipleSuppliers.title}">\r\n\t\t\t</Text>\r\n\t\t</layout:content>\r\n\t</layout:VerticalLayout>\r\n\r\n\t<List id="supplist"\r\n\t       items="{/}"\r\n\t       visible="true"\r\n\t       mode="None">\r\n\t\t<items>\r\n\t\t\t<CustomListItem id="listitem">\r\n\t\t\t\t<content>\r\n\t\t\t\t\t<ObjectHeader title="{FixedVendorName}" introActive="false"\r\n\t\t\t\t\t\ttitleActive="false" iconActive="false"\r\n\t\t\t\t\t\tnumber="{path:\'NetOrderValue\', formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatNumber\'}"\r\n\t\t\t\t\t\tunit="{Currency}">\r\n\t\t\t\t\t\t<statuses>\r\n\t\t\t\t\t\t\t<ObjectStatus icon="{path: \'Error\', formatter: \'.formatPriceError\'}"\r\n\t\t\t\t\t\t\t\tstate="Error"></ObjectStatus>\r\n\t\t\t\t\t\t</statuses>\r\n\t\t\t\t\t\t<attributes>\r\n\t\t\t\t\t\t\t<ObjectAttribute\r\n\t\t\t\t\t\t\t\ttext="{parts:[ {path:\'NetPrice\'}, {path:\'Currency\'}, {path:\'PriceUnit\'},\r\n\t\t\t\t\t\t\t\t\t{path:\'OrderPriceUnitDescription\'}],\r\n\t\t\t\t\t\t\t\t\tformatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatUnitPriceL\' }">\r\n\t\t\t\t\t\t\t</ObjectAttribute>\r\n\t\t\t\t\t\t\t<ObjectAttribute\r\n\t\t\t\t\t\t\t\ttext="{parts:[ {path:\'CashDiscountDays1\'},{path:\'CashDiscountPercentage1\'},{path:\'CashDiscountDays2\'},\r\n\t\t\t\t\t\t\t\t\t{path:\'CashDiscountPercentage2\'} ,{path:\'CashDiscountDays2\'}, {path:\'PaymentTermsDescription\'}],\r\n\t\t\t\t\t\t\t\t\tformatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatPaymentTermsL\' }">\r\n\t\t\t\t\t\t\t</ObjectAttribute>\r\n\t\t\t\t\t\t\t<ObjectAttribute\r\n\t\t\t\t\t\t\t\ttext="{parts:[ {path:\'Incoterms1\'},{path:\'Incoterms2\'} ],\r\n\t\t\t\t\t\t\t\t\tformatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatIncotermsL\' }">\r\n\t\t\t\t\t\t\t</ObjectAttribute>\r\n\r\n\t\t\t\t\t\t\t<ObjectAttribute\r\n\t\t\t\t\t\t\t\ttext="{parts: [ {path: \'Agreement\'}, {path: \'AgreementItem\'}, {path: \'InfoRecord\'}, {path: \'DocumentCategory\'}],\r\n\t\t\t\t\t\t\t\t\tformatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatSourceL\' }">\r\n\t\t\t\t\t\t\t</ObjectAttribute>\r\n\t\t\t\t\t\t\t<ObjectAttribute\r\n\t\t\t\t\t\t\t\ttext="{path: \'DocumentCategory\',\r\n\t\t\t\t\t\t\t\t\tformatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatErrorMessageDocCategory\' }">\r\n\t\t\t\t\t\t\t</ObjectAttribute>\r\n\t\t\t\t\t\t</attributes>\r\n\r\n\t\t\t\t\t</ObjectHeader>\r\n\r\n\t\t\t\t\t<layout:HorizontalLayout class="sapMContainerMargin">\r\n\t\t\t\t\t\t<layout:content>\r\n\t\t\t\t\t\t\t<Button text="{i18n>view.POfromPR.assign_tit}" press="onSupplierAssign"\r\n\t\t\t\t\t\t\t\tenabled="{parts: [{path:\'Error\'}, {path: \'DocumentCategory\'}], formatter: \'.formatAssignButton\'}">\r\n\t\t\t\t\t\t\t</Button>\r\n\t\t\t\t\t\t\t<Button text="{i18n>view.POfromPR_Messages.show_details}"\r\n\t\t\t\t\t\t\t\tpress="onSupplierLink">\r\n\t\t\t\t\t\t\t</Button>\r\n\t\t\t\t\t\t</layout:content>\r\n\t\t\t\t\t</layout:HorizontalLayout>\r\n\r\n\t\t\t\t</content>\r\n\t\t\t</CustomListItem>\r\n\t\t</items>\r\n\t</List>\r\n</core:View>',
	"ui/s2p/mm/purord/fromrequisition/view/PO_Created.controller.js":function(){/*
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
},
	"ui/s2p/mm/purord/fromrequisition/view/PO_Created.view.xml":'<!--\n\n    Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\n\n-->\n<core:View xmlns:core="sap.ui.core" xmlns="sap.m"\n\t controllerName="ui.s2p.mm.purord.fromrequisition.view.PO_Created">\n\n\t<!-- purchase requisition list with assigned suppliers -->\n\t<Table id="PO_Created_List" items="{savedPOs>/results}" inset="false"\n\t\tnoDataText="{i18n>view.PO_Created.no_data}">\n\t\t<!-- Columns -->\n\t\t<columns>\n\t\t\t<!-- Purchase Order Number -->\n\t\t\t<Column id="po_id" width="14%">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="label1" text="{i18n>view.PO_List.po_id}" wrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- Supplier -->\n\t\t\t<Column id="supplier" demandPopin="false">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="label2" text="{i18n>view.PO_List.supplier}"\n\t\t\t\t\t\twrapping="true" ></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- Line Items -->\n\t\t\t<Column id="line_items">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="label3" text="{i18n>view.PO_List.line_items}"\n\t\t\t\t\t\twrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- Line Items Quantity -->\n\t\t\t<Column id="quantity" width="15%" hAlign="End">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="label4" text="{i18n>view.PO_List.quantity}"\n\t\t\t\t\t\ttextAlign="End" wrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- Total -->\n\t\t\t<Column id="Total" hAlign="End">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="label5" text="{i18n>view.PO_List.total}" textAlign="End"\n\t\t\t\t\t\twrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t</columns>\n\t\t<!-- Column list item -->\n        <items>\n            <ColumnListItem id="list_item" type="Inactive">\n                <cells>\n                    <ObjectIdentifier title="{savedPOs>PONumberFormatted}" text="{savedPOs>text}" badgeNotes="false" badgePeople="false" badgeAttachments="false"></ObjectIdentifier>\n                    <Text text="{savedPOs>SupplierName}"></Text>\n                </cells>\n            </ColumnListItem>\n        </items>\t\t\n\t</Table>\n</core:View>',
	"ui/s2p/mm/purord/fromrequisition/view/PO_Simulated.controller.js":function(){/*
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
},
	"ui/s2p/mm/purord/fromrequisition/view/PO_Simulated.view.xml":'<!--\n\n    Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\n\n-->\n<core:View xmlns:core="sap.ui.core" xmlns="sap.m"\n\t controllerName="ui.s2p.mm.purord.fromrequisition.view.PO_Simulated">\n\n\t<!-- Purchase order list -->\n\t<Table id="PO_Simulated_List" mode="MultiSelect" items="{simulatedPOs>/results}"\n\t\tnoDataText="{i18n>view.PO_List.no_data}">\n\t\t<!-- Columns -->\n\t\t<columns>\n\t\t\t<!-- Purchase Order Number -->\n\t\t\t<Column id="po_id" width="7%">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="label1" text="{i18n>view.PO_List.po_id}" wrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- Supplier -->\n\t\t\t<Column id="supplier">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="label2" text="{i18n>view.PO_List.supplier}" wrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- Line Items -->\n\t\t\t<Column id="line_items">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="label3" text="{i18n>view.PO_List.line_items}"\twrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- Line Items Quantity -->\n\t\t\t<Column id="quantity" width="15%" hAlign="End">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="label4" text="{i18n>view.PO_List.quantity}"\n\t\t\t\t\t\ttextAlign="End" wrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- Total -->\n\t\t\t<Column id="Total" hAlign="End">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="label5" text="{i18n>view.PO_List.total}" textAlign="End"\n\t\t\t\t\t\twrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t</columns>\n\t\t<!-- Column list item -->\n\t\t<items>\n\t\t\t<ColumnListItem id="list_item" type="Inactive">\n\t\t\t\t<cells>\n\t\t\t\t\t<ObjectIdentifier title="{simulatedPOs>PONumberFormatted}" text="{simulatedPOs>text}" badgeNotes="false" badgePeople="false" badgeAttachments="false"></ObjectIdentifier>\n\t\t\t\t\t<Text text="{simulatedPOs>SupplierName}"></Text>\n \t\t\t\t\t<ObjectNumber\n \t\t\t\t\t\tnumber="{parts:[{path:\'simulatedPOs>Value\'},{path:\'simulatedPOs>Currency\'}], formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatAmount\'}"\n\t\t\t\t\t\tunit="{simulatedPOs>Currency}">\n\t\t\t\t\t</ObjectNumber>\n\t\t\t\t</cells>\n\t\t\t</ColumnListItem>\n\t\t</items>\t\n\t</Table>\n</core:View>',
	"ui/s2p/mm/purord/fromrequisition/view/POfromPR.controller.js":function(){/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("ui.s2p.mm.purord.fromrequisition.util.Formatter");
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("ui.s2p.mm.purord.fromrequisition.Common");

sap.ca.scfld.md.controller.BaseFullscreenController.extend("ui.s2p.mm.purord.fromrequisition.view.POfromPR", {

	onInit : function() {

		var sServiceName = "/sap/opu/odata/sap/SRA013_PO_FROM_PR_SRV";

		this.oBackendModel = undefined;
		this.oScrollContHeight = null;

		// OData
		if (!jQuery.sap.getUriParameters().get("responderOn")) {
			this.oBackendModel = this.loadBackendModel(sServiceName);
		}

		this.PRReleasedView = this.oView.byId("ui.s2p.mm.purord.fromrequisition.PR_Released_View");
		if (this.oBackendModel !== undefined) {
			this.PRReleasedView.setModel(this.oBackendModel, "backendModel");
		}

		// An instance of the PR_Assigned view is already needed
		// in case all selected PR items are assigned
		this.PRAssignedView = sap.ui.xmlview({
			viewName : "ui.s2p.mm.purord.fromrequisition.view.PR_Assigned"
		});

		if (this.oBackendModel !== undefined) {
			this.PRAssignedView.setModel(this.oBackendModel, "backendModel");
		}

		// PR_Released is always the first of the four views
		// that is displayed
		this.CurrentView = this.PRReleasedView;

		var oBus = sap.ui.getCore().getEventBus();
		oBus.subscribe("ui.s2p.mm.purord.fromrequisition.publish", "count", this.updateNumber, this);

		// home button dynamically displayed in case navigation to POFromPR was triggered from landing page
		this.oHomeButton = this.byId("HomeButton");
		if (this.oHomeButton) {
			jQuery.sap.getUriParameters().get("backToHome") ? this.oHomeButton.setVisible(true) : this.oHomeButton
					.setVisible(false);
		}
		this.HomeUrl = document.referrer;

		// listen to orientation and window resize changes
		oBus.subscribe("ui.s2p.mm.purord.fromrequisition.publish", "orientationChange", this.onOrientationChange, this);

		oBus.subscribe("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", this.updateIconizedFilterColor, this);

		this.setLocalHeaderFooterOptions();
	},

	onExit: function() {
	// destroy views and all aggregation to avoid duplicate objects, and events when launching app from launchpad
	// view.destroy() does not work always therefore unsubsribe all events before to be on safe side
		var oBus = sap.ui.getCore().getEventBus();
		if (this.PRReleasedView) {
			oBus.unsubscribe("ui.s2p.mm.purord.fromrequisition.popup", "selection", 
					this.PRReleasedView.getController().receiveSelection, this.PRReleasedView.getController());
			oBus.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish", "count", 
					this.PRReleasedView.getController().updateButtonText, this.PRReleasedView.getController());
			this.PRReleasedView.destroy();};

		if (this.PRAssignedView){
			oBus.unsubscribe("ui.s2p.mm.purord.fromrequisition.trigger", "loadAssignedPRs",
					this.PRAssignedView.getController().loadAssignedPRs, this.PRAssignedView.getController());
			oBus.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish", "assignedPRs",
					this.PRAssignedView.getController().receiveAssignedPRs, this.PRAssignedView.getController());
			oBus.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish", "assignedBackendPRs",
					this.PRAssignedView.getController().receiveAssBackendPRs, this.PRAssignedView.getController());
			oBus.unsubscribe("ui.s2p.mm.purord.fromrequisition.popup", "selection",
					this.PRAssignedView.getController().receiveSelection, this);
			this.PRAssignedView.destroy();
		}

		if (this.POSimulatedView) {
			this.POSimulatedView.destroy();
		}

		if (this.POCreatedView) {
			this.POCreatedView.destroy();
			}

// unsubscribe events from this controller
		oBus.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish", "count", this.updateNumber, this);
		oBus.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish", "orientationChange", this.onOrientationChange, this);
		oBus.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish", "updateIconTabColor", this.updateIconizedFilterColor, this);
	},

	onBeforeRendering : function() {
		this.onOrientationChange();
	},

	onOrientationChange : function() {
		// get position of elements and calculate heights
		// needed since ScrollContainer stretches according to Data, not device height
		var oIconizedFilter = this.byId("IconizedFilter");
		var oPR_Released_Bar = this.byId("PR_Released_Bar");

		if (!oIconizedFilter || !oPR_Released_Bar) {
			return;
		}

		var fromelement = $(oIconizedFilter.getContent()[0].getDomRef());
		var toelement = $(oPR_Released_Bar.getDomRef());

		// get offset of both elements
		var foffset = fromelement.offset();
		var toffset = toelement.offset();

		// check if all elements could be resolved
		if (toffset != null && foffset != null) {
			// calculate difference of both elements and add 1em padding
			this.oScrollContHeight = toffset.top - foffset.top - 16;

			// set Height
			var oScrollContainer = this.byId("ScrollCont");
			if (oScrollContainer) {
				oScrollContainer.setHeight(this.oScrollContHeight + "px");
			}
		}
	},

	// Navigation back to landing page; Url is retrieved in onInit, button is only visible in case navigation was
	// triggered from landing page
	onHome : function(oEvt) {
		window.history.back();
	},

	// returns backend odata model if necessary (not mock mode)
	loadBackendModel : function(sServiceName) {
		var oModel = this.oConnectionManager.getModel();
		if (!oModel) {
			var url = this.getODataUrlPrefix() + sServiceName;
			oModel = new sap.ui.model.odata.ODataModel(url, true);
		}
		return oModel;
	},

	getODataUrlPrefix : function() {

		var sProxyOn = jQuery.sap.getUriParameters().get("proxyOn");

		if (sProxyOn == "true") {
			return "proxy";
		} else {
			return "";
		}

	},

	// For PRReleasedView
	onAssignSupplier : function(oEvent) {

		if (this.PRReleasedView) {
			// delegate to controller of view
			var oController = this.PRReleasedView.getController();
			if (oController && oController.onAssignSupplier) {
				jQuery.proxy(oController.onAssignSupplier, oController)();
			}
		}
	},

	// For PRAssignedView
	onCreatePOSimulated : function(oEvent) {
		if (this.PRAssignedView) {
			// delegate to controller of view
			var oController = this.PRAssignedView.getController();
			if (oController && oController.onCreatePOSimulated) {
				jQuery.proxy(oController.onCreatePOSimulated, oController)();
			}
		}
	},

	// For POSimulatedView
	onSave : function(oEvent) {
		jQuery.sap.log.info("Save PO");
		if (!this.POSimulatedView) {
			this.POSimulatedView = sap.ui.xmlview({
//				id : "ui.s2p.mm.purord.fromrequisition.PO_Simulated_View",
				viewName : "ui.s2p.mm.purord.fromrequisition.view.PO_Simulated"
			});
		}
		var oController = this.POSimulatedView.getController();
		if (oController && oController.onSavePOs) {
			jQuery.proxy(oController.onSavePOs, oController)();
		}

	},

	// IconizedFilter switch
	switchView : function(oEvent) {
		var oScrollContainer = this.byId("ScrollCont");
		// in case the ScrolCont is deleted e.g. in the AppDesigner
		if (!oScrollContainer) {
			return;
		}

		// check if Height of ContentContainer is set
		if (this.oScrollContHeight != null) {
			oScrollContainer.setHeight(this.oScrollContHeight + "px");
		}
		var sKey = oEvent.getParameter("selectedKey");

		if (sKey == "Released") {
			if (this.CurrentView != this.PRReleasedView) {
				oScrollContainer.removeAllContent();
				oScrollContainer.addContent(this.PRReleasedView);
				this.CurrentView = this.PRReleasedView;
			}

		} else if (sKey == "Assigned") {
			if (this.CurrentView != this.PRAssignedView) {
				oScrollContainer.removeAllContent();
				oScrollContainer.addContent(this.PRAssignedView);
				this.CurrentView = this.PRAssignedView;
			}

		} else if (sKey == "Simulated") {
			if (!this.POSimulatedView) {
				this.POSimulatedView = sap.ui.xmlview({
//					id : "ui.s2p.mm.purord.fromrequisition.PO_Simulated_View",
					viewName : "ui.s2p.mm.purord.fromrequisition.view.PO_Simulated"
				});
				if (this.oBackendModel !== undefined) {
					this.POSimulatedView.setModel(this.oBackendModel, "backendModel");
				}
			}
			oScrollContainer.removeAllContent();
			oScrollContainer.addContent(this.POSimulatedView);
			this.CurrentView = this.POSimulatedView;

		} else if (sKey == "Created") {
			if (!this.POCreatedView) {
				this.POCreatedView = sap.ui.xmlview({
//					id : "ui.s2p.mm.purord.fromrequisition.PO_Created_View",
					viewName : "ui.s2p.mm.purord.fromrequisition.view.PO_Created"
				});
				if (this.oBackendModel !== undefined) {
					this.POCreatedView.setModel(this.oBackendModel, "backendModel");
				}
			}
			oScrollContainer.removeAllContent();
			oScrollContainer.addContent(this.POCreatedView);
			this.CurrentView = this.POCreatedView;
		}
		this.setLocalHeaderFooterOptions(oEvent);
	},

	updateIconizedFilterColor : function(chan, event, data) {
		var oIconTab;

		if (data.btnPRreleasedColor) {
			oIconTab = this.byId("btnPRreleased");
			if (oIconTab) {
				oIconTab.setIconColor(data.btnPRreleasedColor);
			}
		}
		if (data.btnPRassignedColor) {
			oIconTab = this.byId("btnPRassigned");
			if (oIconTab) {
				oIconTab.setIconColor(data.btnPRassignedColor);
			}
		}
		if (data.btnPOsimulatedColor) {
			oIconTab = this.byId("btnPOsimulated");
			if (oIconTab) {
				oIconTab.setIconColor(data.btnPOsimulatedColor);
			}
		}
		if (data.btnPOcreatedColor) {
			oIconTab = this.byId("btnPOcreated");
			if (oIconTab) {
				oIconTab.setIconColor(data.btnPOcreatedColor);
			}
		}

	},

	// listener function to set/update the numbers
	updateNumber : function(chan, event, data) {

		var oIconTab;
		var sCount;

		if (data.count_prapproved) {
			oIconTab = this.byId("btnPRreleased");
			if (oIconTab) {
				oIconTab.setCount(data.count_loaded + " / " + data.count_prapproved);
			}
		}

		if (data.count_prassigned) {
			oIconTab = this.byId("btnPRassigned");
			if (oIconTab) {
				if (data.count_loaded === undefined) {
					oIconTab.setCount(data.count_prassigned); // the loading case
				} else {
					oIconTab.setCount(data.count_loaded + " / " + data.count_prassigned);
				}
			}
		}

		if (data.count_posimulated>=0) {
			oIconTab = this.byId("btnPOsimulated");
			if (oIconTab) {
				oIconTab.setCount(data.count_posimulated);
			}
		}

		if (data.decreaseCount_posimulated) {
			oIconTab = this.byId("btnPOsimulated");
			if (oIconTab) {
				sCount = oIconTab.getCount();
				sCount -= data.decreaseCount_posimulated;
				oIconTab.setCount(sCount);
			}
		}

		if (data.count_pocreated) {
			oIconTab = this.byId("btnPOcreated");
			if (oIconTab) {
				oIconTab.setCount(data.count_pocreated);
			}
		}
	},

	setLocalHeaderFooterOptions : function(oEvent) {

		var that = this;
		var oController = {};
		var oVSDialogSort = {};
		var oVSDialogFilter = {};
		var sKey = "";
		var oOptions = {};

		if (that.CurrentView) {
			oController = that.CurrentView.getController();
		}
		if (!oController) {return;}
		if (oController.getVSDialogSort) {
			oVSDialogSort = oController.getVSDialogSort();
		}
		if (!oVSDialogSort) {return;}

		if (oEvent) {sKey = oEvent.getParameter("selectedKey");}
		switch (sKey) {
			case "":
			case "Released":
				if (oController.getVSDialogFilter) {
					oVSDialogFilter = oController.getVSDialogFilter();
				}
				if (!oVSDialogFilter) {return;}
				oOptions = {
					oSortOptions : {
						onSortPressed : function (evt) {oVSDialogSort.open();}
					},
					oFilterOptions : {
						onFilterPressed : function (evt) {oVSDialogFilter.open();}
					},
					oEditBtn : {
						sI18nBtnTxt : "view.POfromPR.assign_tit",
						onBtnPressed : function(evt) {that.onAssignSupplier(oEvent);},
					},
				};
				break;
			case "Assigned":
				oOptions = {
					oSortOptions : {
						onSortPressed : function (evt) {oVSDialogSort.open();}
					},
					oEditBtn : {
						sI18nBtnTxt : "view.POfromPR.simulate_pos",
						onBtnPressed : function(evt) {that.onCreatePOSimulated(oEvent);},
					},
				};
				break;
			case "Simulated":
				oOptions = {
					oSortOptions : {
						onSortPressed : function (evt) {oVSDialogSort.open();}
					},
					oEditBtn : {
						sI18nBtnTxt : "view.PO_List.save",
						onBtnPressed : function(evt) {that.onSave(oEvent);},
					},
				};
				break;
			case "Created":
				oOptions = {
					oSortOptions : {
						onSortPressed : function (evt) {oVSDialogSort.open();}
					},
				};
				break;
		}
		that.setHeaderFooterOptions(oOptions);
	}
});

},
	"ui/s2p/mm/purord/fromrequisition/view/POfromPR.view.xml":'<!--\n\n    Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\n\n-->\n<core:View xmlns:core="sap.ui.core" xmlns="sap.m"     xmlns:core.mvc="sap.ui.core.mvc"\n\tcontrollerName="ui.s2p.mm.purord.fromrequisition.view.POfromPR">\n\t<Page id="POfromPR_Page" title="{i18n>FULLSCREEN_TITLE}"\n\t\tenableScrolling="true">\n\t\t\n\t\t<customHeader>\n\t\t\t<Bar id="HeaderBar">\n\t\t\t\t<contentLeft>\n\t\t\t\t\t<Button id="HomeButton" press="onHome" visible="false"\n\t\t\t\t\t\ticon="sap-icon://home"></Button>\n\t\t\t\t</contentLeft>\n\t\t\t\t<contentMiddle>\n\t\t\t\t\t<Label text="{i18n>view.POfromPR.title}"></Label>\n\t\t\t\t</contentMiddle>\n\t\t\t</Bar>\n\t\t</customHeader>\n\n\t\t<content>\n\t\t\t<IconTabBar id="IconizedFilter" select="switchView"\n\t\t\t\tselectedKey="Released" expandable="false">\n\t\t\t\t<items>\n\t\t\t\t\t<IconTabFilter id="btnPRreleased" text="{i18n>view.POfromPR.approved}"\n\t\t\t\t\t\tkey="Released" icon="sap-icon://approvals" design="Horizontal"></IconTabFilter>\n\t\t\t\t\t<IconTabSeparator icon="sap-icon://process"></IconTabSeparator>\n\t\t\t\t\t<IconTabFilter id="btnPRassigned" text="{i18n>view.POfromPR.assigned}"\n\t\t\t\t\t\tkey="Assigned" count="Loading..." icon="sap-icon://supplier" design="Horizontal"></IconTabFilter>\n\t\t\t\t\t<IconTabSeparator icon="sap-icon://process"></IconTabSeparator>\n\t\t\t\t\t<IconTabFilter id="btnPOsimulated" text="{i18n>view.POfromPR.proposal}"\n\t\t\t\t\t\tkey="Simulated" icon="sap-icon://inspection" design="Horizontal"></IconTabFilter>\n\t\t\t\t\t<IconTabSeparator icon="sap-icon://process"></IconTabSeparator>\n\t\t\t\t\t<IconTabFilter id="btnPOcreated" text="{i18n>view.POfromPR.created}"\n\t\t\t\t\t\tkey="Created" icon="sap-icon://documents" design="Horizontal"></IconTabFilter>\n\t\t\t\t</items>\n\n\t\t\t\t<content>\n\t\t\t\t<ScrollContainer id="ScrollCont"\n\t\t\t\t\t\thorizontal="false" vertical="true">\n\t\t\t\t\t\t<content>\n\t\t\t\t\t\t\t<core.mvc:XMLView id="ui.s2p.mm.purord.fromrequisition.PR_Released_View"\n\t\t\t\t\t\t\t\tviewName="ui.s2p.mm.purord.fromrequisition.view.PR_List"></core.mvc:XMLView>\n\t\t\t\t\t\t</content>\n\t\t\t\t\t</ScrollContainer>\n\t\t\t\t</content>\n\n\t\t\t</IconTabBar>\n\t\t</content>\n\t</Page>\n</core:View>\n',
	"ui/s2p/mm/purord/fromrequisition/view/PR_Assigned.controller.js":function(){/*
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

},
	"ui/s2p/mm/purord/fromrequisition/view/PR_Assigned.view.xml":'<!--\n\n    Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\n\n-->\n<core:View xmlns:core="sap.ui.core" xmlns="sap.m"\n\txmlns:layout="sap.ui.layout" controllerName="ui.s2p.mm.purord.fromrequisition.view.PR_Assigned">\n\n\n\t<!-- purchase requisition list with assigned suppliers -->\n\t<Table id="pralist" mode="MultiSelect" items="{PR_ass_model>/PRItemCollection}"\n\t\tinset="false">\n\n\t\t<!-- column descriptions -->\n\t\t<columns>\n\t\t\t<!-- ID column -->\n\t\t\t<Column id="column1" width="14%">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="l1" text="{i18n>view.PR_List.column_id}" wrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- the exception column -->\n\t\t\t<Column id="column0" width="4%" visible="true">\n\t\t\t</Column>\n\t\t\t<!-- Assigned Supplier column -->\n\t\t\t<Column id="column3" width="17%">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="l3" text="{i18n>view.PR_List.column_supp}" wrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- the edit Icon column -->\n\t\t\t<Column id="column3a" width="3%" visible="true"></Column>\n\t\t\t<!-- Material -->\n\t\t\t<Column id="column4" width="25%">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="l4" text="{i18n>view.PR_List.column_mat}" wrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- Delivery Date -->\n\t\t\t<Column id="column5" width="15%" hAlign="End" minScreenWidth="large"\n\t\t\t\tdemandPopin="true">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="l5" text="{i18n>view.PR_List.column_delivery}"\n\t\t\t\t\t\twrapping="true" textAlign="End"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t\t<!-- Value -->\n\t\t\t<Column id="column6" hAlign="End">\n\t\t\t\t<header>\n\t\t\t\t\t<Text id="l6" text="{i18n>view.PR_List.column_val}" textAlign="End"\n\t\t\t\t\t\twrapping="true"></Text>\n\t\t\t\t</header>\n\t\t\t</Column>\n\t\t</columns>\n\n\n\t\t<items>\n\t\t\t<ColumnListItem id="listitem" selected="{PR_ass_model>ItemSelected}">\n\t\t\t\t<cells>\n\t\t\t\t\t<!-- purchase req (items?) -->\n\t\t\t\t\t<Link id="prnr" press="onPRItem"\n\t\t\t\t\t\ttext="{parts:[{path:\'PR_ass_model>PRNumberFormatted\'},{path:\'PR_ass_model>PRItemFormatted\'}], formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatPRItem\'}"></Link>\n\t\t\t\t\t<!-- error icon for error -->\n\t\t\t\t\t<core:Icon id="err" press="onErrorShow" size="1.375em"\n\t\t\t\t\t\tsrc="{ path:\'PR_ass_model>Error\', formatter: \'.exceptionFormatter\' }" color="{path:\'PR_ass_model>Error\', formatter: \'.exceptionColorFormatter\' }"></core:Icon>\n\t\t\t\t\t<!-- supplier -->\n\t\t\t\t\t<layout:HorizontalLayout>\n\t\t\t\t\t\t<layout:content>\n\t\t\t\t\t\t\t<Link id="supp" press="onSupplierLink"\n\t\t\t\t\t\t\t\ttext="{parts:[{path:\'PR_ass_model>SupplierName\'},{path:\'PR_ass_model>SupplyingPlantDescription\'}], formatter:\'.formatSourceOfSupply\'}"></Link>\n\t\t\t\t\t\t</layout:content>\n\t\t\t\t\t</layout:HorizontalLayout>\n\t\t\t\t\t<layout:VerticalLayout id="vmult" visible="{PR_ass_model>SupplierMultiple}">\n\t\t\t\t\t\t<layout:content>\n\t\t\t\t\t\t\t<core:Icon id="mult" press="onSupplierChange" src="sap-icon://edit"></core:Icon>\n\t\t\t\t\t\t</layout:content>\n\t\t\t\t\t</layout:VerticalLayout>\n\n\t\t\t\t\t<!-- material -->\n\t\t\t\t\t<layout:VerticalLayout>\n\t\t\t\t\t\t<layout:content>\n\t\t\t\t\t\t\t<Text id="matinfo"\n\t\t\t\t\t\t\t\ttext="{parts:[{path : \'PR_ass_model>ProductDescription\'},{path: \'PR_ass_model>ProductID\'}], \n                                   formatter : \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatItemDesc\'}"></Text>\n\t\t\t\t\t\t\t<Text id="quantity"\n\t\t\t\t\t\t\t\ttext="{parts:[ {path:\'PR_ass_model>OpenQuantityFormatted\'},\n\t\t\t\t\t                       {path:\'PR_ass_model>OpenQuantityUnitDescription\'}], \n\t\t\t\t                   formatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatMatQuantity\'}"></Text>\n\n\t\t\t\t\t\t\t<Text id="priceperquantity"\n\t\t\t\t\t\t\t\ttext="{parts:[ {path:\'PR_ass_model>Price\'}, \n\t\t\t\t\t\t\t\t\t\t    {path:\'PR_ass_model>Currency\'},\n\t\t\t\t\t\t\t\t\t\t    {path:\'PR_ass_model>PriceUnit\'},\n\t\t\t\t\t\t\t\t\t\t    {path:\'PR_ass_model>OrderPriceUnitDescription\'}], \n\t\t\t\t\t                   formatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatUnitPrice\'}"></Text>\n\t\t\t\t\t\t</layout:content>\n\t\t\t\t\t</layout:VerticalLayout>\n\t\t\t\t\t<!-- shipping/delivery -->\n\t\t\t\t\t<layout:VerticalLayout>\n\t\t\t\t\t\t<layout:content>\n\t\t\t\t\t\t\t<Text id="shipdate" textAlign="End"\n\t\t\t\t\t\t\t\ttext="{path:\'PR_ass_model>DeliveryDate\', \n                                       formatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatDateShort\' }">\n\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t<Text id="place" textAlign="End" text="{PR_ass_model>ShipToPlantDescription1}"></Text>\n\t\t\t\t\t\t</layout:content>\n\t\t\t\t\t</layout:VerticalLayout>\n\n\t\t\t\t\t<!-- value -->\n\t\t\t\t\t<ObjectNumber\n\t\t\t\t\t\tnumber="{path:\'PR_ass_model>Value\', formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.lazyFormatNumber\'}"\n\t\t\t\t\t\tunit="{PR_ass_model>Currency}">\n\t\t\t\t\t</ObjectNumber>\n\t\t\t\t</cells>\n\t\t\t</ColumnListItem>\n\t\t</items>\n\n\n\t</Table>\n</core:View>',
	"ui/s2p/mm/purord/fromrequisition/view/PR_List.controller.js":function(){/*
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

},
	"ui/s2p/mm/purord/fromrequisition/view/PR_List.view.xml":'<!--\n\n    Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\n\n-->\n<core:View xmlns:core="sap.ui.core" xmlns="sap.m"\n\txmlns:layout="sap.ui.layout" controllerName="ui.s2p.mm.purord.fromrequisition.view.PR_List">\n\n\t<layout:VerticalLayout width="100%">\n\t\t<layout:content>\n\t\t\t<!-- purchase requisition list as table / the unassigned ones (no supplier) -->\n\t\t\t<Table id="prlist" mode="MultiSelect"\n\t\t\t\tnoDataText="{i18n>view.POfromPR.general_error_unassigned_message}"\n\t\t\t\titems="{PR_appr_model>/PRItemCollection}" inset="false" visible="true">\n\t\t\t\t<!-- column descriptions -->\n\t\t\t\t<columns>\n\t\t\t\t\t<Column id="column1" hAlign="Begin">\n\t\t\t\t\t\t<header>\n\t\t\t\t\t\t\t<Text id="l1" text="{i18n>view.PR_List.column_id}" wrapping="true"></Text>\n\t\t\t\t\t\t</header>\n\t\t\t\t\t</Column>\n\t\t\t\t\t<!-- the exception column -->\n\t\t\t\t\t<Column id="column0" width="4%" hAlign="Begin"></Column>\n\t\t\t\t\t<Column id="column2" width="14%" hAlign="Begin"\n\t\t\t\t\t\tminScreenWidth="large" demandPopin="true">\n\t\t\t\t\t\t<header>\n\t\t\t\t\t\t\t<Text id="l2" text="{i18n>view.PR_List.column_reldate}"\n\t\t\t\t\t\t\t\twrapping="true"></Text>\n\t\t\t\t\t\t</header>\n\t\t\t\t\t</Column>\n\t\t\t\t\t<Column id="column4" width="29%">\n\t\t\t\t\t\t<header>\n\t\t\t\t\t\t\t<Text id="l4" text="{i18n>view.PR_List.column_mat}"\n\t\t\t\t\t\t\t\twrapping="true"></Text>\n\t\t\t\t\t\t</header>\n\t\t\t\t\t</Column>\n\t\t\t\t\t<Column id="column5" width="16%" hAlign="End">\n\t\t\t\t\t\t<header>\n\t\t\t\t\t\t\t<Text id="l5" text="{i18n>view.PR_List.column_delivery}"\n\t\t\t\t\t\t\t\twrapping="true"></Text>\n\t\t\t\t\t\t</header>\n\t\t\t\t\t</Column>\n\t\t\t\t\t<Column id="column6" hAlign="End">\n\t\t\t\t\t\t<header>\n\t\t\t\t\t\t\t<Text id="l6" text="{i18n>view.PR_List.column_val}"\n\t\t\t\t\t\t\t\twrapping="true"></Text>\n\t\t\t\t\t\t</header>\n\t\t\t\t\t</Column>\n\t\t\t\t</columns>\n\t\t\t\t<!-- column list item cells -->\n\t\t\t\t<items>\n\t\t\t\t\t<ColumnListItem id="listItem" selected="{PR_appr_model>ItemSelected}"\n\t\t\t\t\t\ttype="Inactive">\n\t\t\t\t\t\t<!-- cells -->\n\t\t\t\t\t\t<cells>\n\t\t\t\t\t\t\t<!-- PR Item -->\n\t\t\t\t\t\t\t<Link id="prnr" press="onPRItem"\n\t\t\t\t\t\t\t\ttext="{parts:[{path:\'PR_appr_model>PRNumberFormatted\'},{path:\'PR_appr_model>PRItemFormatted\'}], formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatPRItem\'}">\n\t\t\t\t\t\t\t</Link>\n\t\t\t\t\t\t\t<!-- alert button, icon font e053 to use -->\n\t\t\t\t\t\t\t<core:Icon id="mult" press="onMultipleSupplier"\n\t\t\t\t\t\t\t\tcolor="{parts: [{path:\'PR_appr_model>AssignedSupplierCount\'}, {path: \'PR_appr_model>Error\'}], formatter: \'.exceptionColorFormatter\' }"\n\t\t\t\t\t\t\t\tsrc="{parts: [{path:\'PR_appr_model>AssignedSupplierCount\'}, {path: \'PR_appr_model>Error\'}], formatter: \'.exceptionFormatter\' }"\n\t\t\t\t\t\t\t\tsize="1.375em">\n\t\t\t\t\t\t\t</core:Icon>\n\t\t\t\t\t\t\t<!-- due date -->\n\t\t\t\t\t\t\t<Text id="ddate"\n\t\t\t\t\t\t\t\ttext="{path:\'PR_appr_model>ReleaseDate\', formatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatDateShort\' }"></Text>\n\t\t\t\t\t\t\t<!-- material -->\n\t\t\t\t\t\t\t<layout:VerticalLayout>\n\t\t\t\t\t\t\t\t<layout:content>\n\t\t\t\t\t\t\t\t\t<Text id="matinfo"\n\t\t\t\t\t\t\t\t\t\ttext="{parts:[{path:\'PR_appr_model>ProductDescription\'},{path:\'PR_appr_model>ProductID\'}],\n\t\t\t\t\t\t\t\t\t\t\t\t\tformatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatItemDesc\'}"></Text>\n\t\t\t\t\t\t\t\t\t<Text id="quantity"\n\t\t\t\t\t\t\t\t\t\ttext="{parts:[{path:\'PR_appr_model>OpenQuantityFormatted\'}, {path:\'PR_appr_model>OpenQuantityUnitDescription\'}],\n\t\t\t\t\t\t\t\t\t\t\t\t\tformatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatMatQuantity\'}"></Text>\n\t\t\t\t\t\t\t\t\t<Text id="priceperquantity"\n\t\t\t\t\t\t\t\t\t\ttext="{parts:[{path:\'PR_appr_model>Price\'},{path:\'PR_appr_model>Currency\'},{path:\'PR_appr_model>PriceUnit\'},\n\t\t\t\t\t\t\t\t\t\t\t\t\t{path:\'PR_appr_model>OrderPriceUnitDescription\'}],\n\t\t\t\t\t\t\t\t\t\t\t\t\tformatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatUnitPrice\'}"></Text>\n\t\t\t\t\t\t\t\t</layout:content>\n\t\t\t\t\t\t\t</layout:VerticalLayout>\n\t\t\t\t\t\t\t<!-- shipping/delivery -->\n\t\t\t\t\t\t\t<layout:VerticalLayout>\n\t\t\t\t\t\t\t\t<layout:content>\n\t\t\t\t\t\t\t\t\t<Text id="shipdate"\n\t\t\t\t\t\t\t\t\t\ttext="{path:\'PR_appr_model>DeliveryDate\', formatter: \'ui.s2p.mm.purord.fromrequisition.util.Formatter.formatDateShort\'}"></Text>\n\t\t\t\t\t\t\t\t\t<Text id="place" text="{PR_appr_model>ShipToPlantDescription1}"></Text>\n\t\t\t\t\t\t\t\t</layout:content>\n\t\t\t\t\t\t\t</layout:VerticalLayout>\n\t\t\t\t\t\t\t<!-- value -->\n\t\t\t\t\t\t\t<ObjectNumber\n\t\t\t\t\t\t\t\tnumber="{path:\'PR_appr_model>Value\', formatter:\'ui.s2p.mm.purord.fromrequisition.util.Formatter.lazyFormatNumber\'}"\n\t\t\t\t\t\t\t\tunit="{PR_appr_model>Currency}">\n\t\t\t\t\t\t\t</ObjectNumber>\n\n\t\t\t\t\t\t</cells>\n\t\t\t\t\t</ColumnListItem>\n\t\t\t\t</items>\n\n\t\t\t</Table>\n\t\t\t<!-- ShowMore Button -->\n\t\t\t<layout:HorizontalLayout class="EndOfListButton"\n\t\t\t\tid="ShowMore" visible="false">\n\t\t\t\t<layout:content>\n\t\t\t\t\t<Button id="btnLoad" press="onLoadMoreData" text="{i18n>view.POfromPR.load_more}"\n\t\t\t\t\t\ttype="Transparent"></Button>\n\t\t\t\t</layout:content>\n\t\t\t</layout:HorizontalLayout>\n\n\t\t\t<!-- No Data Design -->\n\t\t\t<layout:HorizontalLayout class="EndOfListButton"\n\t\t\t\tid="NoData" visible="false">\n\t\t\t\t<layout:content>\n\t\t\t\t\t<layout:VerticalLayout>\n\t\t\t\t\t\t<layout:content>\n\t\t\t\t\t\t\t<core:Icon src="sap-icon://competitor" size="13em"\n\t\t\t\t\t\t\t\tcolor="#007833"></core:Icon>\n\t\t\t\t\t\t\t<Text text="{i18n>view.PR_List.no_data}"></Text>\n\t\t\t\t\t\t</layout:content>\n\t\t\t\t\t</layout:VerticalLayout>\n\t\t\t\t</layout:content>\n\t\t\t</layout:HorizontalLayout>\n\n\t\t</layout:content>\n\n\t</layout:VerticalLayout>\n</core:View>\n'
}});
