/*
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
