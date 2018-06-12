/*
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
