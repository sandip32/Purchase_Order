/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("ui.s2p.mm.purord.fromrequisition.util.Formatter");jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");jQuery.sap.require("ui.s2p.mm.purord.fromrequisition.Common");sap.ca.scfld.md.controller.BaseFullscreenController.extend("ui.s2p.mm.purord.fromrequisition.view.POfromPR",{onInit:function(){var s="/sap/opu/odata/sap/SRA013_PO_FROM_PR_SRV";this.oBackendModel=undefined;this.oScrollContHeight=null;if(!jQuery.sap.getUriParameters().get("responderOn")){this.oBackendModel=this.loadBackendModel(s)}this.PRReleasedView=this.oView.byId("ui.s2p.mm.purord.fromrequisition.PR_Released_View");if(this.oBackendModel!==undefined){this.PRReleasedView.setModel(this.oBackendModel,"backendModel")}this.PRAssignedView=sap.ui.xmlview({viewName:"ui.s2p.mm.purord.fromrequisition.view.PR_Assigned"});if(this.oBackendModel!==undefined){this.PRAssignedView.setModel(this.oBackendModel,"backendModel")}this.CurrentView=this.PRReleasedView;var b=sap.ui.getCore().getEventBus();b.subscribe("ui.s2p.mm.purord.fromrequisition.publish","count",this.updateNumber,this);this.oHomeButton=this.byId("HomeButton");if(this.oHomeButton){jQuery.sap.getUriParameters().get("backToHome")?this.oHomeButton.setVisible(true):this.oHomeButton.setVisible(false)}this.HomeUrl=document.referrer;b.subscribe("ui.s2p.mm.purord.fromrequisition.publish","orientationChange",this.onOrientationChange,this);b.subscribe("ui.s2p.mm.purord.fromrequisition.publish","updateIconTabColor",this.updateIconizedFilterColor,this);this.setLocalHeaderFooterOptions()},onExit:function(){var b=sap.ui.getCore().getEventBus();if(this.PRReleasedView){b.unsubscribe("ui.s2p.mm.purord.fromrequisition.popup","selection",this.PRReleasedView.getController().receiveSelection,this.PRReleasedView.getController());b.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish","count",this.PRReleasedView.getController().updateButtonText,this.PRReleasedView.getController());this.PRReleasedView.destroy()};if(this.PRAssignedView){b.unsubscribe("ui.s2p.mm.purord.fromrequisition.trigger","loadAssignedPRs",this.PRAssignedView.getController().loadAssignedPRs,this.PRAssignedView.getController());b.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish","assignedPRs",this.PRAssignedView.getController().receiveAssignedPRs,this.PRAssignedView.getController());b.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish","assignedBackendPRs",this.PRAssignedView.getController().receiveAssBackendPRs,this.PRAssignedView.getController());b.unsubscribe("ui.s2p.mm.purord.fromrequisition.popup","selection",this.PRAssignedView.getController().receiveSelection,this);this.PRAssignedView.destroy()}if(this.POSimulatedView){this.POSimulatedView.destroy()}if(this.POCreatedView){this.POCreatedView.destroy()}b.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish","count",this.updateNumber,this);b.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish","orientationChange",this.onOrientationChange,this);b.unsubscribe("ui.s2p.mm.purord.fromrequisition.publish","updateIconTabColor",this.updateIconizedFilterColor,this)},onBeforeRendering:function(){this.onOrientationChange()},onOrientationChange:function(){var i=this.byId("IconizedFilter");var p=this.byId("PR_Released_Bar");if(!i||!p){return}var f=$(i.getContent()[0].getDomRef());var t=$(p.getDomRef());var a=f.offset();var b=t.offset();if(b!=null&&a!=null){this.oScrollContHeight=b.top-a.top-16;var s=this.byId("ScrollCont");if(s){s.setHeight(this.oScrollContHeight+"px")}}},onHome:function(e){window.history.back()},loadBackendModel:function(s){var m=this.oConnectionManager.getModel();if(!m){var u=this.getODataUrlPrefix()+s;m=new sap.ui.model.odata.ODataModel(u,true)}return m},getODataUrlPrefix:function(){var p=jQuery.sap.getUriParameters().get("proxyOn");if(p=="true"){return"proxy"}else{return""}},onAssignSupplier:function(e){if(this.PRReleasedView){var c=this.PRReleasedView.getController();if(c&&c.onAssignSupplier){jQuery.proxy(c.onAssignSupplier,c)()}}},onCreatePOSimulated:function(e){if(this.PRAssignedView){var c=this.PRAssignedView.getController();if(c&&c.onCreatePOSimulated){jQuery.proxy(c.onCreatePOSimulated,c)()}}},onSave:function(e){jQuery.sap.log.info("Save PO");if(!this.POSimulatedView){this.POSimulatedView=sap.ui.xmlview({viewName:"ui.s2p.mm.purord.fromrequisition.view.PO_Simulated"})}var c=this.POSimulatedView.getController();if(c&&c.onSavePOs){jQuery.proxy(c.onSavePOs,c)()}},switchView:function(e){var s=this.byId("ScrollCont");if(!s){return}if(this.oScrollContHeight!=null){s.setHeight(this.oScrollContHeight+"px")}var k=e.getParameter("selectedKey");if(k=="Released"){if(this.CurrentView!=this.PRReleasedView){s.removeAllContent();s.addContent(this.PRReleasedView);this.CurrentView=this.PRReleasedView}}else if(k=="Assigned"){if(this.CurrentView!=this.PRAssignedView){s.removeAllContent();s.addContent(this.PRAssignedView);this.CurrentView=this.PRAssignedView}}else if(k=="Simulated"){if(!this.POSimulatedView){this.POSimulatedView=sap.ui.xmlview({viewName:"ui.s2p.mm.purord.fromrequisition.view.PO_Simulated"});if(this.oBackendModel!==undefined){this.POSimulatedView.setModel(this.oBackendModel,"backendModel")}}s.removeAllContent();s.addContent(this.POSimulatedView);this.CurrentView=this.POSimulatedView}else if(k=="Created"){if(!this.POCreatedView){this.POCreatedView=sap.ui.xmlview({viewName:"ui.s2p.mm.purord.fromrequisition.view.PO_Created"});if(this.oBackendModel!==undefined){this.POCreatedView.setModel(this.oBackendModel,"backendModel")}}s.removeAllContent();s.addContent(this.POCreatedView);this.CurrentView=this.POCreatedView}this.setLocalHeaderFooterOptions(e)},updateIconizedFilterColor:function(c,e,d){var i;if(d.btnPRreleasedColor){i=this.byId("btnPRreleased");if(i){i.setIconColor(d.btnPRreleasedColor)}}if(d.btnPRassignedColor){i=this.byId("btnPRassigned");if(i){i.setIconColor(d.btnPRassignedColor)}}if(d.btnPOsimulatedColor){i=this.byId("btnPOsimulated");if(i){i.setIconColor(d.btnPOsimulatedColor)}}if(d.btnPOcreatedColor){i=this.byId("btnPOcreated");if(i){i.setIconColor(d.btnPOcreatedColor)}}},updateNumber:function(c,e,d){var i;var C;if(d.count_prapproved){i=this.byId("btnPRreleased");if(i){i.setCount(d.count_loaded+" / "+d.count_prapproved)}}if(d.count_prassigned){i=this.byId("btnPRassigned");if(i){if(d.count_loaded===undefined){i.setCount(d.count_prassigned)}else{i.setCount(d.count_loaded+" / "+d.count_prassigned)}}}if(d.count_posimulated>=0){i=this.byId("btnPOsimulated");if(i){i.setCount(d.count_posimulated)}}if(d.decreaseCount_posimulated){i=this.byId("btnPOsimulated");if(i){C=i.getCount();C-=d.decreaseCount_posimulated;i.setCount(C)}}if(d.count_pocreated){i=this.byId("btnPOcreated");if(i){i.setCount(d.count_pocreated)}}},setLocalHeaderFooterOptions:function(e){var t=this;var c={};var v={};var V={};var k="";var o={};if(t.CurrentView){c=t.CurrentView.getController()}if(!c){return}if(c.getVSDialogSort){v=c.getVSDialogSort()}if(!v){return}if(e){k=e.getParameter("selectedKey")}switch(k){case"":case"Released":if(c.getVSDialogFilter){V=c.getVSDialogFilter()}if(!V){return}o={oSortOptions:{onSortPressed:function(a){v.open()}},oFilterOptions:{onFilterPressed:function(a){V.open()}},oEditBtn:{sI18nBtnTxt:"view.POfromPR.assign_tit",onBtnPressed:function(a){t.onAssignSupplier(e)},},};break;case"Assigned":o={oSortOptions:{onSortPressed:function(a){v.open()}},oEditBtn:{sI18nBtnTxt:"view.POfromPR.simulate_pos",onBtnPressed:function(a){t.onCreatePOSimulated(e)},},};break;case"Simulated":o={oSortOptions:{onSortPressed:function(a){v.open()}},oEditBtn:{sI18nBtnTxt:"view.PO_List.save",onBtnPressed:function(a){t.onSave(e)},},};break;case"Created":o={oSortOptions:{onSortPressed:function(a){v.open()}},};break}t.setHeaderFooterOptions(o)}});
