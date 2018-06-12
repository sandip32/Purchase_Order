/*
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
