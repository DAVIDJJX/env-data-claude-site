//#endregion
//#region src/main.ts
function e() {
	let e = document.getElementById("edc-addon-status");
	e && (e.textContent = "外掛已載入 v0.1");
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", e, { once: !0 }) : e();
//#endregion
