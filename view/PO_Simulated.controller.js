/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.ui.model.format.QuantityFormat");jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");jQuery.sap.require("sap.ca.ui.utils.busydialog");sap.ui.core.mvc.Controller.extend("ui.s2p.mm.purord.fromrequisition.view.PO_Simulated",{oParams:{},onInit:function(){this.oBundle=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();this.sPO=this.oBundle.getText("view.PO_List.po_id");this.sSupplier=this.oBundle.getText("view.PO_List.supplier");this.sTotal=this.oBundle.getText("view.PO_List.total");this.sTitle=this.oBundle.getText("view.POfromPR.sort_tit");this.sSaving=this.oBundle.getText("view.POfromPR.creating_message");this.bResponderOn=jQuery.sap.getUriParameters().get("responderOn");this.oList=this.byId("PO_Simulated_List");this.sPathToMockFile="/ui.s2p.mm.purord.fromrequisition/mock/PurchaseOrders.json";this.oMockModel=undefined;this.oBackendModel=undefined;this.bFirstCall=true;this.poCreatedTotal=0;this.oOldSavedPOsModel=undefined;if(this.bResponderOn){this.oBackendModel=new sap.ui.model.json.JSONModel();this.oBackendModel.loadData(this.sPathToMockFile,"",false);if(this.oList){this.oList.setModel(this.oBackendModel)}}},onBeforeRendering:function(){var l=[];var L;if(!this.bResponderOn){this.oBackendModel=this.oParams.oModel}if(!this.oList){return}this.oList.setModel(this.oBackendModel,"simulatedPOs");l=this.oList.getItems();L=this.oList.getModel("simulatedPOs");if(l[0]&&l[0].getCells().length===3){$.each(this.oList.getItems(),function(a,b){var c=new sap.ui.layout.VerticalLayout();var d=new sap.ui.layout.VerticalLayout();$.each(L.getData().results[a].POProposalItemCollection.results,function(i,v){var D=new sap.m.Text({text:v.ProductDescription});var q=new sap.m.Text({text:sap.ca.ui.model.format.QuantityFormat.getInstance().format(v.QuantityFormatted)+" "+v.QtyUnitDescription});q.setTextAlign("End");c.addContent(D);d.addContent(q)});l[a].insertCell(c,2);l[a].insertCell(d,3)})}if(this.bFirstCall){l=this.oList.getItems();for(var i=0;i<l.length;i++){l[i].setSelected(true)}this.bFirstCall=false}},successSavePO:function(d,r){sap.ca.ui.utils.busydialog.releaseBusyDialog();var p=[];var P=[];var a=[];var I=0;for(I=0;I<d.PO.results.length;++I){if(d.PO.results[I].Error==""){p.push(d.PO.results[I].PONumber);a.push(d.PO.results[I].PRSourceKeys)}else{P.push(I)}}jQuery.sap.log.info("PO saved:"+p);if(P.length>0){var n=[];for(I=0;I<d.PO.results.length;++I){if(d.PO.results[I].Error==""){n.push(d.PO.results[I])}}d.PO.results=n}if(p.length>0){this.poCreatedTotal+=p.length;sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish","count",{count_pocreated:this.poCreatedTotal})}var m="";if(p.length==1){m=this.oBundle.getText("view.POfromPR_Messages.save_sing")}else if(p.length>1){m=this.oBundle.getText("view.POfromPR_Messages.save_plu",[p.length])}var M="";if(P.length==1){M=this.oBundle.getText("view.POfromPR_Messages.save_failed_sing")}else if(P.length>1){M=this.oBundle.getText("view.POfromPR_Messages.save_failed_plu",[P.length])}var s=m+"\n"+M;jQuery.sap.require("sap.m.MessageToast");sap.m.MessageToast.show(s,{width:"30em",duration:6000});if(p.length>0){var S=new sap.ui.model.json.JSONModel();if(this.oOldSavedPOsModel!=null){jQuery.merge(d.PO.results,this.oOldSavedPOsModel.oData.results)}S.setData(d.PO);this.oOldSavedPOsModel=S;sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Created").oParams.oModel=S;jQuery.sap.log.info("Success saving POs");var t=this.oBackendModel.getData();for(I=t.results.length-1;I>=0;I--){for(var b=0;b<a.length;++b){if(t.results[I].PRSourceKeys==a[b]){t.results.splice(I,1);a.splice(b,1);break}}}for(var c=0;c<a.length;++c){for(b=t.results.length-1;b>=0;b--){var T=t.results[b].PRSourceKeys.split(",");var e=a[c].split(",");for(var f=0;f<e.length;++f){var g=T.indexOf(e[f]);if(g!==-1){T.splice(g,1);t.results[b].PRSourceKeys=T.toString();t.results[b].Value-=t.results[b].POProposalItemCollection.results[g].NetValue;t.results[b].POProposalItemCollection.results.splice(g,1)}}break}}if(this.oList){this.oBackendModel.refresh();this.oList.setModel(null);this.oList.setModel(this.oBackendModel,"simulatedPOs");var l=this.oList.getItems();var L=this.oList.getModel("simulatedPOs");$.each(this.oList.getItems(),function(h,j){var k;var o;if(l[h].getCells().length===3){k=new sap.ui.layout.VerticalLayout();o=new sap.ui.layout.VerticalLayout()}else{k=l[h].getCells()[2];o=l[h].getCells()[3];k.removeAllContent();o.removeAllContent()}$.each(L.getData().results[h].POProposalItemCollection.results,function(i,v){var D=new sap.m.Text({text:v.ProductDescription});var q=new sap.m.Text({text:sap.ca.ui.model.format.QuantityFormat.getInstance().format(v.QuantityFormatted)+" "+v.QtyUnitDescription});q.setTextAlign("End");k.addContent(D);o.addContent(q)});if(l[h].getCells().length===3){l[h].insertCell(k,2);l[h].insertCell(o,3)}})}this.poSimulatedCount=this.oBackendModel.getData().results.length;sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish","count",{count_posimulated:this.poSimulatedCount,});if(this.poSimulatedCount>0&&P.length>1){sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish","updateIconTabColor",{btnPOsimulatedColor:sap.ui.core.IconColor.Negative})}else{sap.ui.getCore().getEventBus().publish("ui.s2p.mm.purord.fromrequisition.publish","updateIconTabColor",{btnPOsimulatedColor:sap.ui.core.IconColor.Default})}}},errorSavePO:function(e){sap.ca.ui.utils.busydialog.releaseBusyDialog();var m=this.oBundle.getText('view.POfromPR.general_error_create_message');var d="";if(e.message&&e.response){d=e.message+"\n"+e.response.requestUri+"\n"+e.response.statusText}ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage(m,d)},postSavePO:function(){this.oBackendODataModel.create("POContainerCollection",this.POContainer,undefined,jQuery.proxy(this.successSavePO,this),jQuery.proxy(this.errorSavePO,this))},onSavePOs:function(){var p=undefined;var P=[];var I=[];if(this.oList){I=this.oList.getSelectedItems()}for(var i=0;i<I.length;i++){var c=I[i].getBindingContext("simulatedPOs");var k=c.getProperty("PRSourceKeys");P.push(k)}if(P.length>0){p=P.join(",");var a="00000";var b="0";var S="0";var d="0";var e="0";var f="0";var C="0";var g="0";var h="0";var j="0.000";var l="0.000";var m="0";var n="0";var V="0.00";var o="0,00";var q="0";var r="0";var E="X";var s="00000";var t="0";var u="0";var v="0";var w="0";var x="0";var y="0";var z="0";var A="0";var B="0";var D="0";var F="0";var G="0";var H="0";var J="0";var K="0";var L="0";var M="0";var N="0";var O="0";var Q="0";var R="0";var T="0";var U="0";var W="0";var X="0";var Y="0";var Z=" ";this.POContainer={POContainerKey:"X",PO:[{POKey:a,PRSourceKeys:p,PONumberFormatted:b,SupplierId:S,SupplierName:d,PurchOrg:e,PaymentTerms:f,CashDiscountDays1:C,CashDiscountDays2:g,CashDiscountDays3:h,CashDiscountPerc1:j,CashDiscountPerc2:l,Incoterms1:m,Incoterms2:n,Value:V,ValueFormatted:o,Currency:q,StatusId:r,Error:E,POItem:[{POKey:s,PONumber:t,POItem:u,PONumberFormatted:v,POItemFormatted:w,PRKey:x,AssignedPRNumber:y,AssignedPRItem:z,ProductId:A,ProductDescription:B,ProductGroup:D,ProductGroupDescr:F,ShipToPlantId:G,ShipToPlantDescr1:H,ShipToPlantDescr2:J,Quantity:K,QuantityFormatted:L,QtyUnit:M,QtyUnitDescription:N,Currency:O,NetPrice:Q,NetPriceFormatted:T,PriceUnit:U,NetValue:R,NetValueFormatted:T,OrderPriceUnit:U,OrderPriceUnitDescr:W,DeliveryDate:X,RequisitionedBy:Y,Error:Z}]}]};if(!this.bResponderOn){sap.ca.ui.utils.busydialog.requireBusyDialog({text:this.sSaving});this.oBackendODataModel=this.oView.getModel("backendModel");this.oBackendODataModel.refreshSecurityToken(jQuery.proxy(this.postSavePO,this),function($){sap.ca.ui.utils.busydialog.releaseBusyDialog();ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage("error refresh csrf token",$)},true)}}},getList:function(){return this.byId("PO_Simulated_List")},getVSDialogSort:function(){var t=this;if(t.oVSDialog){return t.oVSDialog}var v=new sap.m.ViewSettingsDialog({sortItems:[new sap.m.ViewSettingsItem({text:t.oBundle.getText("view.PO_List.po_id"),key:"PoNumber",selected:true}),new sap.m.ViewSettingsItem({text:t.oBundle.getText("view.PO_List.supplier"),key:"SupplierName"}),new sap.m.ViewSettingsItem({text:t.oBundle.getText("view.PO_List.total"),key:"Value"}),],confirm:function(e){var p=e.getParameters();var i=t.oBackendModel.getData().results;var d=p.sortDescending;var s=p.sortItem.getKey();switch(s){case"PoNumber":if(!d){i.sort(function(a,b){if(a.PONumberFormatted<b.PONumberFormatted){return-1}if(a.PONumberFormatted>b.PONumberFormatted){return 1}return 0})}else{i.sort(function(a,b){if(a.PONumberFormatted<b.PONumberFormatted){return 1}if(a.PONumberFormatted>b.PONumberFormatted){return-1}return 0})}break;case"SupplierName":if(!d){i.sort(function(a,b){if(a.SupplierName<b.SupplierName){return-1}if(a.SupplierName>b.SupplierName){return 1}return 0})}else{i.sort(function(a,b){if(a.SupplierName<b.SupplierName){return 1}if(a.SupplierName>b.SupplierName){return-1}return 0})}break;case"Value":if(!d){i.sort(function(a,b){var V=parseFloat(a.Value);var c=parseFloat(b.Value);if(V<c){return-1}if(V>c){return 1}return 0})}else{i.sort(function(a,b){var V=parseFloat(a.Value);var c=parseFloat(b.Value);if(V<c){return 1}if(V>c){return-1}return 0})}break}if(t.oList){t.oList.setModel(null);t.oList.setModel(this.oBackendModel,"simulatedPOs")}t.onBeforeRendering()},});t.oVSDialog=v;return v}});
