/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
sap.ui.controller("ui.s2p.mm.purord.fromrequisition.Main",{onInit:function(){jQuery.sap.require("sap.ca.scfld.md.Startup");sap.ca.scfld.md.Startup.init('ui.s2p.mm.purord.fromrequisition',this)},onExit:function(){if(sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Simulated").oParams.oModel)sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Simulated").oParams.oModel=null;if(sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Created").oParams.oModel)sap.ui.controller("ui.s2p.mm.purord.fromrequisition.view.PO_Created").oParams.oModel=null}});
