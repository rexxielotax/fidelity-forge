//#region node_modules/.nitro/vite/services/ssr/assets/bank-helpers-o8oDwLmo.js
var TIER_FEES = {
	standard: {
		fee: 2e3,
		limit: 5e3
	},
	gold: {
		fee: 5e3,
		limit: 15e3
	},
	platinum: {
		fee: 1e4,
		limit: 5e4
	}
};
function reference(prefix = "REF") {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
function adminSessionConfig() {
	return {
		password: process.env["ADMIN_SESSION_SECRET"],
		name: "admin-session",
		maxAge: 28800
	};
}
//#endregion
export { adminSessionConfig as n, reference as r, TIER_FEES as t };
