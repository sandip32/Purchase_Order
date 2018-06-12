/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("ui.s2p.mm.purord.fromrequisition.Common");jQuery.sap.require("sap.ui.base.Object");jQuery.sap.require("sap.m.Popover");jQuery.sap.require("sap.ca.ui.message.message");sap.ui.base.Object.extend("ui.s2p.mm.purord.fromrequisition.Common",{});
ui.s2p.mm.purord.fromrequisition.Common.getSupplierPopup=function(m,i,r){var v=new sap.ui.view({viewName:"ui.s2p.mm.purord.fromrequisition.view.MultipleSuppliers",type:sap.ui.core.mvc.ViewType.XML});v.setModel(m);v.setModel(i,"i18n");v.getController().oRouter=r;var p=new sap.m.Popover({placement:sap.m.PlacementType.Right});p.addContent(v);return p};
ui.s2p.mm.purord.fromrequisition.Common.ShowErrorMessage=function(m,d){var s={message:m,type:sap.ca.ui.message.Type.ERROR};if(d!==""){s.details=d}sap.ca.ui.message.showMessageBox(s)};
ui.s2p.mm.purord.fromrequisition.Common.ShowWarningMessage=function(m,d){var s={message:m,type:sap.ca.ui.message.Type.WARNING};if(d!==""){s.details=d};sap.ca.ui.message.showMessageBox(s)};
ui.s2p.mm.purord.fromrequisition.Common.getListPopup=function(t,l,s,S,L){var p=new sap.m.Popover({placement:sap.m.PlacementType.Top,title:t});var o=new sap.m.List({mode:"SingleSelectLeft",includeItemInSelection:true});jQuery.each(l,function(k,v){var i=new sap.m.StandardListItem();i.setTitle(v);if(k===s){i.setSelected(true)};o.addItem(i)});o.attachSelect(S,L);p.addContent(o);return p};
ui.s2p.mm.purord.fromrequisition.Common.sortList=function(l,s,d){if(!l){return};var S=new sap.ui.model.Sorter(s,d);if(s==="Value"){S.fnCompare=function(a,b){var v=parseFloat(a);var V=parseFloat(b);if(v<V)return-1;if(v>V)return 1;return 0}};var L=l.getBinding("items");if(L)L.sort(S)};
