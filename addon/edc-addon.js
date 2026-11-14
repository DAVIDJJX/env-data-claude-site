//#region src/branding.ts
var e = "／上游 ";
function t(e) {
	let t = e.indexOf("環評監測資料填報小工具");
	if (t === -1) return e;
	let n = t + 11;
	return e.startsWith("（Claude 版）", n) ? e : e.slice(0, n) + "（Claude 版）" + e.slice(n);
}
function n(t, n) {
	let r = t.trim();
	return !r || r.includes(e) ? t : `${n}${e}${r}`;
}
//#endregion
//#region src/main.ts
function r() {
	let e = t(document.title);
	e !== document.title && (document.title = e);
}
function i() {
	let e = document.querySelector(".topbar .brand");
	if (e) for (let n of Array.from(e.childNodes)) {
		if (n.nodeType !== Node.TEXT_NODE) continue;
		let e = n.textContent ?? "", r = t(e);
		if (r !== e) {
			n.textContent = r;
			return;
		}
		if (r.includes("（Claude 版）")) return;
	}
}
function a() {
	let e = document.getElementById("versionBadge");
	if (!e) return;
	let t = e.textContent ?? "", r = n(t, "v1.0");
	r !== t && (e.textContent = r);
}
function o() {
	try {
		r(), i(), a();
	} catch {}
}
var s = !1;
function c() {
	if (s) return;
	let e = document.getElementById("versionBadge");
	!e || typeof MutationObserver > "u" || (s = !0, new MutationObserver(() => {
		try {
			a();
		} catch {}
	}).observe(e, {
		childList: !0,
		characterData: !0,
		subtree: !0
	}));
}
o(), c(), document.readyState !== "complete" && document.addEventListener("DOMContentLoaded", () => {
	o(), c();
}, { once: !0 });
//#endregion
