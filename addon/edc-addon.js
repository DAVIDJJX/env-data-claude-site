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
//#region src/version.ts
var r = (e) => String(e ?? "").replace(/\s+/g, ""), i = /檢驗項目|檢測項目/;
function a(e) {
	let t = r(e?.[0]);
	return t.startsWith("樣品編號") && i.test(t);
}
function o(e) {
	if (!e) return !1;
	for (let t of e) {
		let e = r(t);
		if (e !== "" && (/^樣品編號.*(檢驗項目|檢測項目)$/.test(e) || /^(檢驗項目|檢測項目)$/.test(e))) return !0;
	}
	return !1;
}
function s(e) {
	let t = [];
	return e.forEach((e, n) => {
		a(e) && t.push(n);
	}), t;
}
function c(e) {
	let t = [];
	return e.forEach((e, n) => {
		o(e) && t.push(n);
	}), t;
}
function l(e) {
	return Math.max(0, c(e).length - 1);
}
var u = (e) => (e ?? []).map(r), d = (e, t) => {
	let n = u(e), r = u(t), i = Math.max(n.length, r.length);
	for (let e = 0; e < i; e++) if ((n[e] ?? "") !== (r[e] ?? "")) return !1;
	return !0;
};
function f(e) {
	let t = s(e), n = [], i = [], a = [], o = [];
	for (let n = 1; n < t.length; n++) {
		let i = t[n], s = -1;
		for (let a = i - 1; a > t[n - 1]; a--) if (/第\d+頁/.test(r((e[a] ?? []).join("")))) {
			s = a;
			break;
		}
		a.push(s >= 0 ? s + 1 : i), o.push(s >= 0);
	}
	for (let r = 1; r < t.length; r++) {
		let s = t[r], c = r + 1, l = a[r - 1], u = r < t.length - 1 ? a[r] : e.length;
		if (!o[r - 1]) {
			i.push({
				page: c,
				header: s,
				reason: "表頭上方找不到上一頁的頁尾「第N頁」"
			});
			continue;
		}
		if (!d(e[s], e[t[0]])) {
			i.push({
				page: c,
				header: s,
				reason: "表頭和第 1 頁不同"
			});
			continue;
		}
		n.push({
			page: c,
			header: s,
			start: l,
			end: u
		});
	}
	return {
		headers: t,
		blocks: n,
		problems: i
	};
}
function p(e, t) {
	let n = e.slice(t.start, t.end);
	return n._hiddenCols = e._hiddenCols, n;
}
function m(e, t, n) {
	for (let r = t.start; r < t.end; r++) {
		let a = e[r];
		if (a) {
			for (let e of a) if (i.test(n(e))) return r === t.header;
		}
	}
	return !1;
}
var h = [
	"採樣地點",
	"日期(起)",
	"時間(起)",
	"檢測類別",
	"檢測機構許可證號",
	"_siteCode"
];
function g(e, t) {
	return h.filter((n) => String(e[n] ?? "") !== String(t[n] ?? ""));
}
var _ = [
	"檢測項目",
	"比較關係",
	"檢測數值",
	"檢測極限"
];
function v(e, t) {
	let n = (e) => _.map((t) => String(e[t] ?? "")).join("\0"), r = new Set(e.map((e) => String(e.檢測項目 ?? ""))), i = new Set(e.map(n)), a = t.filter((e) => r.has(String(e.檢測項目 ?? ""))).map((e) => String(e.檢測項目 ?? ""));
	return a.length === 0 ? {
		cls: "none",
		items: []
	} : t.length > 0 && t.every((e) => i.has(n(e))) ? {
		cls: "all-same",
		items: a
	} : {
		cls: "conflict",
		items: a
	};
}
function y(e, t, n) {
	let r = [];
	for (let i = t; i < Math.min(t + 3, e.length); i++) (e[i] ?? []).forEach((e, t) => {
		let i = n(e);
		i !== "" && r[t] === void 0 && (r[t] = i);
	});
	let a = (e) => r.findIndex((t) => t !== void 0 && e.test(t)), o = a(i), s = a(/檢測值|檢測結果|檢驗結果|測定值|結\s*果/);
	return o < 0 || s < 0 || s <= o ? { mode: "position" } : {
		mode: "column",
		item: o,
		value: s
	};
}
function b(e, t, n, r, i) {
	let a = y(e, t.header, i), o = (e) => {
		if (a.mode === "column") return {
			item: i(e[a.item]),
			value: a.value
		};
		let t = [];
		return e.forEach((e, n) => {
			i(e) !== "" && t.push(n);
		}), t.length >= 2 ? {
			item: i(e[t[0]]),
			value: t[1]
		} : null;
	}, s = t.header + 1;
	return n.map((n) => {
		let a = String(n.檢測項目 ?? ""), c = null;
		for (; s < t.end;) {
			let t = o(e[s] ?? []);
			if (t && r(t.item) === a && i((e[s] ?? [])[t.value]) !== "") {
				c = t;
				break;
			}
			s++;
		}
		if (!c || s >= t.end) return {
			gridRow: null,
			gridCol: null,
			raw: ""
		};
		let l = {
			gridRow: s,
			gridCol: c.value,
			raw: String(e[s][c.value] ?? "")
		};
		return s++, l;
	});
}
function x(e) {
	let t = "", n = e + 1;
	for (; n > 0;) {
		let e = (n - 1) % 26;
		t = String.fromCharCode(65 + e) + t, n = Math.floor((n - 1) / 26);
	}
	return t;
}
function S(e, t, n) {
	return x(e.c + n) + String(e.r + t + 1);
}
//#endregion
//#region src/page2/hook.ts
var C = (e, t) => `${String(e ?? "")}\u0000${String(t ?? "")}`, w = (e) => e instanceof Error ? e.message : String(e);
function T() {
	return {
		mode: "testing",
		wrapped: [],
		missing: [],
		errors: [],
		originalParseLab: null,
		rowOutcome: /* @__PURE__ */ new WeakMap(),
		gridSource: /* @__PURE__ */ new WeakMap(),
		gridRead: /* @__PURE__ */ new WeakMap(),
		gridSheet: /* @__PURE__ */ new WeakMap(),
		readsByName: /* @__PURE__ */ new Map(),
		sheetOrigin: /* @__PURE__ */ new WeakMap(),
		selftestGrids: /* @__PURE__ */ new WeakSet(),
		reconcileAvailable: !1
	};
}
var E = (e) => typeof e == "object" && !!e;
function ee(e, t = T()) {
	try {
		te(e.XLSX, t);
	} catch (e) {
		t.errors.push("包 sheet_to_json 失敗：" + w(e));
	}
	try {
		ne(e.ImportEngine, t);
	} catch (e) {
		t.errors.push("包 readWorkbookGrids 失敗：" + w(e));
	}
	try {
		re(e.SmartParse, t);
	} catch (e) {
		t.errors.push("包 parseLabItemTableSheet 失敗：" + w(e));
	}
	return t.wrapped.includes("SmartParse.parseLabItemTableSheet") || (t.mode = "failed"), t;
}
function te(e, t) {
	let n = E(e) ? e.utils : void 0, r = E(n) ? n.sheet_to_json : void 0, i = E(n) ? n.decode_range : void 0;
	if (!E(n) || typeof r != "function" || typeof i != "function") {
		t.missing.push("XLSX.utils.sheet_to_json");
		return;
	}
	n.sheet_to_json = function(...e) {
		let n = r.apply(this, e);
		try {
			let [r, a] = e;
			if (Array.isArray(n) && E(r)) {
				let e = E(a) ? a.range : void 0, o = null;
				e == null ? typeof r["!ref"] == "string" && (o = i(r["!ref"]).s) : typeof e == "string" && (o = i(e).s), o && !(Number.isInteger(o.r) && Number.isInteger(o.c)) && (o = null), t.sheetOrigin.set(n, {
					origin: o ? {
						r: o.r,
						c: o.c
					} : null,
					ws: r
				});
			}
		} catch (e) {
			t.errors.push("sheet_to_json 記錄失敗：" + w(e));
		}
		return n;
	}, t.wrapped.push("XLSX.utils.sheet_to_json");
}
function ne(e, t) {
	let n = E(e) ? e.readWorkbookGrids : void 0;
	if (!E(e) || typeof n != "function") {
		t.missing.push("ImportEngine.readWorkbookGrids");
		return;
	}
	e.readWorkbookGrids = async function(...e) {
		let r = await n.apply(this, e);
		try {
			let n = e[0], i = E(n) && typeof n.name == "string" ? n.name : null;
			if (E(r)) {
				let e = {
					file: i,
					sheets: []
				};
				for (let [n, a] of Object.entries(r)) {
					if (!Array.isArray(a)) continue;
					let r = l(a), o = {
						sheet: n,
						extraHeaders: r,
						processed: !1
					};
					e.sheets.push(o), t.gridSource.set(a, {
						file: i,
						sheet: n,
						extraHeaders: r
					}), t.gridRead.set(a, e), t.gridSheet.set(a, o);
				}
				let n = String(i ?? ""), a = t.readsByName.get(n) ?? [];
				a.push(e), t.readsByName.set(n, a);
			}
		} catch (e) {
			t.errors.push("readWorkbookGrids 記錄失敗：" + w(e));
		}
		return r;
	}, t.wrapped.push("ImportEngine.readWorkbookGrids"), t.reconcileAvailable = !0;
}
function re(e, t) {
	let n = E(e) ? e.parseLabItemTableSheet : void 0;
	if (!E(e) || typeof n != "function") {
		t.missing.push("SmartParse.parseLabItemTableSheet");
		return;
	}
	let r = n;
	t.originalParseLab = r, e.parseLabItemTableSheet = function(n, i) {
		let a = r.call(this, n, i);
		if (!Array.isArray(a) || a.length === 0) return a;
		try {
			let e = E(n) ? t.gridSheet.get(n) : void 0;
			e && (e.processed = !0);
		} catch {}
		if (t.mode !== "active" && t.mode !== "testing") return a;
		let o = null;
		try {
			o = {
				read: t.gridRead.get(n) ?? null,
				kind: i,
				source: t.gridSource.get(n) ?? null,
				expected: l(n),
				blocks: []
			};
			let s = t.gridSheet.get(n);
			s && (s.outcome = o);
			for (let e of a) E(e) && t.rowOutcome.set(e, o);
			let c = ie(this, r, n, i, a, o, t, e);
			for (let e of c) t.rowOutcome.set(e, o);
			a.push(...c);
		} catch (e) {
			o && (o.error = w(e), o.blocks = o.blocks.filter((e) => e.status !== "filled")), t.errors.push("補讀失敗：" + w(e));
		}
		return a;
	}, t.wrapped.push("SmartParse.parseLabItemTableSheet");
}
function ie(e, t, n, r, i, a, o, s) {
	let c = (e) => s.cellStr(e), l = (e) => s.normalizeItemName(e), u = o.sheetOrigin.get(n) ?? null, d = u?.origin ?? null, h = (e) => e + 1 + (d?.r ?? 0), _ = (e, t) => a.blocks.push({
		page: e.page,
		header: e.header,
		headerRow: h(e.header),
		status: "skipped",
		reason: t
	}), { blocks: y, problems: x } = f(n), C = [...y.map((e) => ({
		kind: "block",
		b: e
	})), ...x.map((e) => ({
		kind: "problem",
		...e
	}))].sort((e, t) => (e.kind === "block" ? e.b.page : e.page) - (t.kind === "block" ? t.b.page : t.page)), w = u !== null || o.selftestGrids.has(n), T = [...i], E = [];
	for (let o of C) {
		if (o.kind === "problem") {
			_(o, o.reason);
			continue;
		}
		let s = o.b;
		if (!w) {
			_(s, "不是 Excel 來源（例如 PDF），不自動補");
			continue;
		}
		if (!m(n, s, c)) {
			_(s, "區塊內第一個「檢驗項目／檢測項目」不是表頭列");
			continue;
		}
		let f = t.call(e, p(n, s), r);
		if (!Array.isArray(f) || f.length === 0) {
			_(s, "原網站的解析程式不認得這個區塊");
			continue;
		}
		let y = f.flatMap((e) => g(i[0], e));
		if (y.length) {
			_(s, "頁首和第 1 頁不同：" + [...new Set(y)].join("、"));
			continue;
		}
		let x = v(T, f);
		if (x.cls === "all-same") {
			a.blocks.push({
				page: s.page,
				header: s.header,
				headerRow: h(s.header),
				status: "upstream-read"
			});
			continue;
		}
		if (x.cls === "conflict") {
			_(s, "和前面頁重複的項目：" + x.items.join("、"));
			continue;
		}
		let C = b(n, s, f, l, c);
		f.forEach((e, t) => {
			let r = C[t], i = null;
			if (d && u?.ws && r.gridRow !== null && r.gridCol !== null) {
				let e = S(d, r.gridRow, r.gridCol), t = u.ws[e];
				t && t.v === n[r.gridRow][r.gridCol] && (i = e);
			}
			e._edcPage2 = {
				page: s.page,
				cell: i,
				rowGuess: r.gridRow === null ? null : r.gridRow + 1 + (d?.r ?? 0),
				raw: r.raw
			};
		}), a.blocks.push({
			page: s.page,
			header: s.header,
			headerRow: h(s.header),
			status: "filled",
			rows: f
		}), T.push(...f), E.push(...f);
	}
	return E;
}
var ae = (e, t) => e.source?.file ?? (typeof t?._sourceFile == "string" ? t._sourceFile : null), oe = (e, t) => e.source?.sheet ?? (typeof t?._sourceSheet == "string" ? t._sourceSheet : null);
function se(e, t) {
	let n = t.filter((e) => E(e) && E(e._edcPage2)), r = {
		mode: e.mode,
		filled: n,
		skipped: [],
		upstreamRead: [],
		mismatches: [],
		needsConfirm: !1
	};
	if (e.mode === "upstream-fixed") return r;
	if (e.mode === "failed") return r.needsConfirm = !0, r;
	let i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
	for (let n of t) {
		if (!E(n)) continue;
		let t = e.rowOutcome.get(n);
		if (t) {
			i.has(t) || i.set(t, n), t.read && a.add(t.read);
			continue;
		}
		let r = typeof n._sourceFile == "string" ? n._sourceFile : null, s = typeof n._sourceSheet == "string" ? n._sourceSheet : null;
		o.add(C(r, s));
		for (let t of e.readsByName.get(String(r ?? "")) ?? []) a.add(t);
	}
	for (let e of a) for (let t of e.sheets) t.outcome && !i.has(t.outcome) && i.set(t.outcome, void 0);
	for (let [e, t] of i) {
		let n = ae(e, t), i = oe(e, t);
		if (e.error) {
			r.skipped.push({
				file: n,
				sheet: i,
				page: null,
				headerRow: null,
				reason: "補讀程式出錯：" + e.error
			}), r.mismatches.push({
				file: n,
				sheet: i,
				expected: e.expected,
				accounted: 0,
				reason: "補讀程式出錯"
			});
			continue;
		}
		for (let t of e.blocks) {
			let e = {
				file: n,
				sheet: i,
				page: t.page,
				headerRow: t.headerRow,
				reason: t.reason ?? ""
			};
			t.status === "skipped" ? r.skipped.push(e) : t.status === "upstream-read" && r.upstreamRead.push(e);
		}
		let a = e.source ? e.source.extraHeaders : e.expected;
		e.blocks.length !== a && r.mismatches.push({
			file: n,
			sheet: i,
			expected: a,
			accounted: e.blocks.length,
			reason: "第 2 頁以後的表頭數和處理過的區塊數不同"
		});
	}
	for (let e of a) for (let t of e.sheets) {
		if (t.extraHeaders <= 0 || t.processed) continue;
		let n = o.has(C(e.file, t.sheet)) ? "這張表有第 2 頁以後的表頭，但沒有經過補讀" : "這張表有第 2 頁以後的表頭，但原網站沒有讀這張表，第 2 頁也沒有補";
		r.mismatches.push({
			file: e.file,
			sheet: t.sheet,
			expected: t.extraHeaders,
			accounted: 0,
			reason: n
		});
	}
	let s = (e) => {
		let t = /* @__PURE__ */ new Set();
		return e.filter((e) => {
			let n = JSON.stringify(e);
			return t.has(n) ? !1 : (t.add(n), !0);
		});
	};
	return r.skipped = s(r.skipped), r.upstreamRead = s(r.upstreamRead), r.mismatches = s(r.mismatches), !e.reconcileAvailable && t.length > 0 && r.mismatches.push({
		file: null,
		sheet: null,
		expected: -1,
		accounted: -1,
		reason: "獨立對帳無法使用（找不到 ImportEngine.readWorkbookGrids）"
	}), r.needsConfirm = r.skipped.length > 0 || r.mismatches.length > 0, r;
}
//#endregion
//#region src/page2/notice.ts
var D = "edcPage2Notice", O = "Claude 版提醒（第 2 頁補讀）：", ce = "⚠️ Claude 版的第 2 頁補讀目前無法使用（原網站程式可能已更新）。這次匯入不會自動補第 2 頁，請對照報告手動核對。", le = "edcPage2Banner", ue = "⚠️ Claude 版的第 2 頁補讀目前無法使用（原網站程式可能已更新）。匯入水質／地質報告時不會自動補第 2 頁，請對照報告手動核對。", de = `${O}無法確認第 2 頁補讀的狀態（外掛檢查時出錯），請對照報告手動核對第 2 頁以後的值。\n\n仍要匯入嗎？`, fe = "＊按確認匯入時，會依下方『檢測極限』的處理方式調整", pe = "會匯入", me = "已取消（不會匯入）", he = "無法確認", ge = /* @__PURE__ */ new Set(["water", "geo"]), k = (e) => e == null ? "" : String(e);
function A(e, t) {
	let n = t.getState(), r = n?.smartResult?.rows;
	if (!n || !Array.isArray(r)) return null;
	let i = k(n.importCatKey);
	return {
		sum: se(e, r),
		rows: r,
		catKey: i
	};
}
var _e = (e, t) => e.mode === "failed" && ge.has(t);
function j(e, t) {
	try {
		let n = t.win.filterRowsBySelection, r = t.getState(), i = t.getCategories()?.[k(r?.importCatKey)];
		if (typeof n != "function" || !i || typeof i.itemField != "string") return null;
		let a = n.call(t.win, e, i.itemField);
		return Array.isArray(a) ? new Set(a) : null;
	} catch {
		return null;
	}
}
var M = (e) => `第 ${e} 頁`;
function ve(e, t, n, r) {
	let i = k(e._sourceSheet), a = t.cell ? `${i}!${t.cell}` : `${i} 第 ${t.rowGuess ?? "?"} 列（位址未確認）`;
	return `${n && k(e._sourceFile) ? `${k(e._sourceFile)} / ` : ""}${a}${r ? `（${M(t.page)}）` : ""}`;
}
var ye = (e) => {
	let t = k(e.檢測數值);
	return `${k(e.比較關係) ? k(e.比較關係) + " " : ""}${t || "（空白）"}`;
};
function be(e) {
	let t = [];
	return e.file && t.push(e.file), t.push(`工作表「${e.sheet ?? "（不明）"}」`), e.page !== null && t.push(M(e.page)), e.headerRow !== null && t.push(`第 ${e.headerRow} 列起`), t.join("　");
}
function xe(e, t) {
	let n = t.doc, r = n.getElementById(D), i = A(e, t), a = n.getElementById("smartImportSummary");
	if (!i || !a) return r?.remove(), null;
	let { sum: o, rows: s, catKey: c } = i, l = _e(o, c), u = o.mode === "failed" ? [] : o.filled;
	if (!l && !u.length && !o.skipped.length && !o.mismatches.length && !o.upstreamRead.length) return r?.remove(), null;
	let d = (e, t, r) => {
		let i = n.createElement(e);
		return t != null && (i.textContent = t), r && (i.style.cssText = r), i;
	}, f = d("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #7a5fb0;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	f.id = D;
	let p = "margin-top:10px;padding:10px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b";
	if (l) {
		let e = d("div", null, p);
		e.dataset.edc = "failed", e.append(d("div", ce, "font-weight:700")), f.append(e);
	}
	let m = /* @__PURE__ */ new Set();
	for (let e of u) m.add(k(e._sourceFile));
	for (let e of [
		...o.skipped,
		...o.mismatches,
		...o.upstreamRead
	]) e.file && m.add(e.file);
	let h = m.size > 1;
	if (u.length) {
		let e = [...new Set(u.map((e) => e._edcPage2.page))].sort((e, t) => e - t), n = e[e.length - 1], r = n >= 3, i = r ? `🟣 Claude 版補讀：第 ${e[0]}～${n} 頁共 ${u.length} 筆（${e.map((e) => `${M(e)} ${u.filter((t) => t._edcPage2.page === e).length} 筆`).join("、")}）` : `🟣 Claude 版補讀：第 2 頁共 ${u.length} 筆`;
		f.append(d("div", i, "font-weight:700;font-size:15px")), f.append(d("div", "這些值在報告的第 2 頁以後，原網站不會讀到。Claude 版已自動補進下方資料，會一起匯入；寫法轉換（ND、<、去尾 0）由原網站的程式處理。請對照報告核對。（這段提醒只在網頁上，不會寫進匯出檔。）", "margin:2px 0 8px"));
		let a = d("div", null, `${u.length > 8 ? "max-height:300px;overflow:auto;" : ""}background:#fff;border:1px solid #dce5ea;border-radius:4px`), o = d("table", null, "border-collapse:collapse;width:100%;font-size:13px"), c = d("thead"), l = d("tr"), p = [
			!0,
			!1,
			!1,
			!1,
			!1,
			!1,
			!0
		];
		[
			"來源（工作表!儲存格）",
			"測站",
			"項目",
			"報告原文",
			"匯入後的值",
			"檢測極限＊",
			"狀態"
		].forEach((e, t) => l.append(d("th", e, `text-align:left;padding:5px 8px;background:#ece6f5;border-bottom:1px solid #dce5ea;position:sticky;top:0${p[t] ? ";white-space:nowrap" : ""}`))), c.append(l), o.append(c);
		let m = d("tbody"), g = j(s, t);
		u.forEach((e, t) => {
			let n = e._edcPage2, i = d("tr");
			i.dataset.edcRow = String(t), [
				ve(e, n, h, r),
				k(e.採樣地點),
				k(e.檢測項目),
				n.raw,
				ye(e),
				k(e.檢測極限) || "—"
			].forEach((e, t) => i.append(d("td", e, `padding:4px 8px;border-bottom:1px solid #eef2f5${t === 0 ? ";white-space:nowrap" : ""}`)));
			let a = d("td", N(e, g), "padding:4px 8px;border-bottom:1px solid #eef2f5;white-space:nowrap");
			a.dataset.edcStatus = "", i.append(a), m.append(i);
		}), o.append(m), a.append(o), f.append(a);
		let _ = d("div", fe, "margin-top:4px;font-size:12px;color:#5b6b78");
		_.dataset.edc = "limit-note", f.append(_);
	}
	if (o.upstreamRead.length && f.append(d("div", `原網站已讀到 ${o.upstreamRead.length} 個第 2 頁以後的區塊（Claude 版沒有重複補）。`, "margin-top:8px;color:#7a8791;font-size:13px")), !l && o.skipped.length) {
		let e = d("div", null, p);
		e.dataset.edc = "skipped", e.append(d("div", `⚠️ 有 ${o.skipped.length} 個第 2 頁區塊沒有自動補，請對照報告手動補上`, "font-weight:700")), o.skipped.forEach((t) => e.append(d("div", `・${be(t)}：${t.reason}`))), f.append(e);
	}
	if (!l && o.mismatches.length) {
		let e = d("div", null, p);
		e.dataset.edc = "mismatch", e.append(d("div", `⚠️ 第 2 頁以後的區塊對帳不符（${o.mismatches.length} 張工作表），可能有沒補也沒列出的區塊，請對照報告核對`, "font-weight:700")), o.mismatches.forEach((t) => {
			let n = t.sheet === null && t.file === null ? "" : `${t.file && h ? t.file + "　" : ""}工作表「${t.sheet ?? "（不明）"}」：`, r = t.expected >= 0 ? `（讀檔時數到 ${t.expected} 個、處理了 ${t.accounted} 個）` : "";
			e.append(d("div", `・${n}${t.reason}${r}`));
		}), f.append(e);
	}
	return r ? r.replaceWith(f) : a.after(f), f;
}
function N(e, t) {
	return t ? t.has(e) ? pe : me : he;
}
function Se(e, t) {
	let n = t.doc.getElementById(D);
	if (!n) return;
	let r = A(e, t);
	if (!r) return;
	let i = r.sum.mode === "failed" ? [] : r.sum.filled, a = j(r.rows, t);
	n.querySelectorAll("tr[data-edc-row]").forEach((e) => {
		let t = i[Number(e.dataset.edcRow)], n = e.querySelector("td[data-edc-status]");
		if (!n) return;
		let r = t ? N(t, a) : he;
		n.textContent !== r && (n.textContent = r);
	});
}
function Ce(e, t) {
	if (!e.needsConfirm) return null;
	if (e.mode === "failed") return ge.has(t) ? `${O}第 2 頁補讀目前無法使用（原網站程式可能已更新），這次匯入不會自動補第 2 頁。\n\n請對照報告手動核對。仍要匯入嗎？` : null;
	let n = [];
	return e.skipped.length && n.push(`有 ${e.skipped.length} 個第 2 頁區塊沒有自動補，請對照報告手動補上。`), e.mismatches.length && n.push(`第 2 頁以後的區塊對帳不符（${e.mismatches.length} 張工作表），可能有沒補也沒列出的區塊。`), `${O}${n.join("\n")}\n\n詳細請看確認畫面上的紅字。仍要匯入嗎？`;
}
function we(e, t) {
	let n = t.getElementById(le);
	if (e.mode !== "failed") {
		n?.remove();
		return;
	}
	if (n || !t.body) return;
	let r = t.createElement("div");
	r.id = le, r.setAttribute("role", "alert"), r.textContent = ue, r.style.cssText = "position:sticky;top:0;z-index:2147483000;margin:0;padding:8px 14px;background:#fdf1f0;border-bottom:2px solid #d9534f;color:#8a1f1b;font-weight:700;font-size:14px;line-height:1.5", t.body.prepend(r);
}
function Te(e, t) {
	let n = t.win, r = /* @__PURE__ */ new WeakSet(), i = !0, a = () => {
		let n = t.doc.getElementById("smartImportSummary");
		!n || r.has(n) || typeof MutationObserver > "u" || (r.add(n), new MutationObserver(() => {
			try {
				Se(e, t);
			} catch (t) {
				e.errors.push("更新狀態欄失敗：" + String(t));
			}
		}).observe(n, {
			childList: !0,
			characterData: !0,
			subtree: !0
		}));
	}, o = n.renderSmartImportPreview;
	typeof o == "function" ? (n.renderSmartImportPreview = function(...n) {
		let r = o.apply(this, n);
		try {
			xe(e, t), a(), i = !0;
		} catch (t) {
			i = !1, e.errors.push("畫提醒失敗：" + String(t));
		}
		return r;
	}, e.wrapped.push("renderSmartImportPreview")) : e.missing.push("renderSmartImportPreview");
	let s = n.confirmSmartImport;
	typeof s == "function" ? (n.confirmSmartImport = function(...r) {
		let a = null;
		try {
			if (!i) throw Error("這一輪的提醒區塊沒有畫成功");
			let n = A(e, t);
			n && (a = Ce(n.sum, n.catKey));
		} catch (t) {
			e.errors.push("匯入前檢查失敗：" + String(t)), a = de;
		}
		if (!(a !== null && !n.confirm(a))) return s.apply(this, r);
	}, e.wrapped.push("confirmSmartImport")) : e.missing.push("confirmSmartImport"), (!e.wrapped.includes("renderSmartImportPreview") || !e.wrapped.includes("confirmSmartImport")) && (e.mode = "failed");
}
//#endregion
//#region src/page2/selftest.ts
var P = [
	"樣品編號\n檢驗項目",
	"",
	"EDC-SELFTEST",
	"偵測\n極限",
	"單位",
	"檢測方法"
], F = () => [
	["水質檢測報告"],
	[
		"",
		"",
		"",
		"",
		"採樣地點：",
		"自我測試站"
	],
	[
		"",
		"",
		"",
		"",
		"採樣時間：",
		"115年01月02日10時00分"
	],
	["樣品特性：", "放流水"]
], Ee = "水溫";
function I() {
	let e = [
		...F(),
		[...P],
		[
			"",
			"",
			"檢測值"
		],
		[
			Ee,
			"",
			"20.0",
			"--",
			"℃",
			"NIEA W217.52A"
		],
		[
			"",
			"",
			"以下空白"
		],
		[
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"第1頁(共2頁)"
		],
		...F(),
		[...P],
		[
			"",
			"",
			"檢測值"
		],
		[
			"鐵",
			"",
			"0.10",
			"0.004",
			"mg/L",
			"NIEA W311.54C"
		],
		[
			"",
			"",
			"以下空白"
		],
		[
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"第2頁(共2頁)"
		]
	];
	return e._hiddenCols = /* @__PURE__ */ new Set(), e;
}
var L = (e) => Array.isArray(e) ? e.map((e) => String(e?.檢測項目 ?? "")) : [];
function De(e, t) {
	let n = (t, n) => (e.mode = t, t === "failed" && e.errors.push("自我測試：" + n), {
		status: t,
		detail: n
	});
	try {
		if (e.mode === "failed" || !e.originalParseLab) return n("failed", "找不到 SmartParse.parseLabItemTableSheet：" + e.missing.join("、"));
		let r = t;
		if (!r || typeof r.parseSheet != "function") return n("failed", "找不到 SmartParse.parseSheet");
		let i = L(e.originalParseLab.call(r, I(), "water"));
		if (!i.includes("水溫")) return n("failed", "原函式讀不到合成表的第 1 頁");
		if (i.includes("鐵")) return n("upstream-fixed", "原函式已經會讀第 2 頁");
		e.mode = "testing";
		let a = I();
		e.selftestGrids.add(a);
		let o = r.parseSheet.call(r, "water", "__edc_selftest__", a, { allowAutoDetect: !1 }), s = L(o), c = Array.isArray(o) && o.some((e) => e?.檢測項目 === "鐵" && typeof e?._edcPage2 == "object");
		return s.includes("水溫") && c ? n("active", "正常") : n("failed", `包裝後讀到的項目：${s.join("、") || "（沒有）"}`);
	} catch (e) {
		return n("failed", "丟例外：" + (e instanceof Error ? e.message : String(e)));
	}
}
//#endregion
//#region src/xdw/button.ts
var Oe = "edcBtnImportXdw", ke = "📄 匯入檔案（XDW）", Ae = "掃描檔（DocuWorks .xdw）——Claude 版功能", je = "edcXdwStyle", Me = "\n.edc-xdw-btn{border:none;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;background:#6a4c9c;color:#fff;box-shadow:inset 0 0 0 1px #4b3172}\n.edc-xdw-btn:hover,.edc-xdw-btn:focus-visible{background:#57397f}\n.edc-xdw-btn:focus-visible{outline:2px solid #b9a7d6;outline-offset:2px}\n.edc-xdw-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2147482000;display:flex;align-items:center;justify-content:center}\n.edc-xdw-overlay[hidden]{display:none}\n.edc-xdw-dialog{background:#fff;color:#2b3e4e;width:min(1100px,94vw);max-height:92vh;overflow:auto;border-radius:10px;border-top:6px solid #6a4c9c;padding:16px 20px;box-shadow:0 10px 40px rgba(0,0,0,.3);font-size:14px;line-height:1.6}\n.edc-xdw-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}\n.edc-xdw-title{margin:0;font-size:18px;color:#4b3172}\n.edc-xdw-close{border:1px solid #c9bfdc;background:#f6f2fb;color:#4b3172;border-radius:6px;padding:4px 10px;font:inherit;font-size:13px;cursor:pointer}\n.edc-xdw-note{margin:0 0 10px;padding:8px 12px;background:#f6f2fb;border-left:5px solid #7a5fb0;border-radius:4px}\n.edc-xdw-drop{border:2px dashed #b9a7d6;border-radius:8px;padding:16px;text-align:center;background:#fbf9fe}\n.edc-xdw-drop.edc-xdw-drag{background:#ece6f5;border-color:#6a4c9c}\n.edc-xdw-pick{margin-left:6px}\n.edc-xdw-status{margin:10px 0 4px;font-weight:600}\n.edc-xdw-status .edc-xdw-red{margin-left:10px}\n.edc-xdw-red{color:#b3261e;font-weight:700}\n.edc-xdw-errors{margin:6px 0;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b}\n.edc-xdw-errors[hidden]{display:none}\n.edc-xdw-errors ul{margin:4px 0 4px 18px;padding:0}\n.edc-xdw-thumbs{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}\n.edc-xdw-thumb{width:224px;border:1px solid #dce5ea;border-radius:6px;padding:4px;background:#fff;cursor:zoom-in;font:inherit;text-align:center;color:inherit}\n.edc-xdw-thumb canvas{display:block;width:220px;height:auto;background:#fff}\n.edc-xdw-thumb-cap{font-size:12px;color:#5b6b78;margin-top:2px}\n.edc-xdw-thumb-bad{cursor:default;border:2px solid #d9534f;background:#fdf1f0;color:#8a1f1b;padding:10px;min-height:120px;font-weight:700}\n.edc-xdw-zoom{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:2147482001;overflow:auto;padding:20px;text-align:center}\n.edc-xdw-zoom[hidden]{display:none}\n.edc-xdw-zoom-bar{position:sticky;top:0;display:flex;justify-content:center;gap:12px;align-items:center;color:#fff;margin-bottom:8px}\n.edc-xdw-zoom canvas{max-width:100%;height:auto;background:#fff}\n.edc-xdw-connect{margin-top:16px;padding-top:12px;border-top:1px solid #e3dcef}\n.edc-xdw-connect[hidden]{display:none}\n.edc-xdw-connect-title{margin:0 0 6px;font-size:16px;color:#4b3172}\n.edc-xdw-connect-note{margin:0 0 8px;font-size:13px;color:#4a5866}\n.edc-xdw-connect-status{font-weight:700;margin-bottom:6px;color:#5b6b78}\n.edc-xdw-connect-status.edc-xdw-connect-has{color:#2e6b34}\n.edc-xdw-connect-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.edc-xdw-connect-input{flex:1 1 280px;min-width:200px;padding:6px 8px;border:1px solid #b9a7d6;border-radius:6px;font:inherit;font-size:13px}\n.edc-xdw-connect-row button:disabled{opacity:.55;cursor:wait}\n.edc-xdw-connect-msg{min-height:1.4em;margin-top:6px}\n.edc-xdw-connect-results{margin:4px 0 0 18px;padding:0}\n.edc-xdw-connect-ok{color:#2e6b34;font-weight:600}\n.edc-xdw-connect-gray{color:#5b6b78}\n";
function Ne(e) {
	if (e.getElementById("edcXdwStyle")) return;
	let t = e.createElement("style");
	t.id = je, t.textContent = Me, (e.head ?? e.documentElement).append(t);
}
function Pe(e, t) {
	let n = e.getElementById("btnImport"), r = e.getElementById(Oe);
	if (!n || r && n.nextElementSibling === r) return !1;
	let i = r ?? Fe(e, t);
	return n.after(i), !0;
}
function Fe(e, t) {
	let n = e.createElement("button");
	return n.type = "button", n.id = Oe, n.className = "edc-xdw-btn", n.textContent = ke, n.title = Ae, n.addEventListener("click", (e) => {
		try {
			e.preventDefault(), t();
		} catch {}
	}), n;
}
function Ie(e, t) {
	try {
		Ne(e);
	} catch {}
	let n = () => {
		try {
			Pe(e, t);
		} catch {}
	};
	if (n(), typeof MutationObserver > "u") return;
	let r = () => {
		try {
			new MutationObserver(n).observe(e.body, {
				childList: !0,
				subtree: !0
			}), n();
		} catch {}
	};
	e.body ? r() : e.addEventListener("DOMContentLoaded", r, { once: !0 });
}
//#endregion
//#region src/xdw/load.ts
var Le = [
	"pdfjsLib",
	"_pdfjsTestingUtils",
	"pdfjsWorker"
], Re = () => import("./edc-xdw.js"), R = /* @__PURE__ */ new Map();
function ze(e, t) {
	for (let n of t) try {
		n.had ? e[n.k] !== n.v && (e[n.k] = n.v) : Object.prototype.hasOwnProperty.call(e, n.k) && delete e[n.k];
	} catch {}
}
async function z(e, t = globalThis) {
	let n = R.get(t);
	n || (n = {
		depth: 0,
		snap: Le.map((e) => ({
			k: e,
			had: Object.prototype.hasOwnProperty.call(t, e),
			v: t[e]
		}))
	}, R.set(t, n)), n.depth++;
	try {
		return await e();
	} finally {
		ze(t, n.snap), --n.depth === 0 && R.delete(t);
	}
}
function Be(e, t = Re) {
	return z(async () => (await t()).decodeXdw(e));
}
//#endregion
//#region src/xdw/modal.ts
var Ve = "edcXdwModal", B = {
	title: "📄 匯入檔案（XDW）",
	notice: "這一版只解開並預覽，不會把檔案內容傳出去；自動讀值在下一版提供。",
	drop: "把 DocuWorks 的 .xdw 檔拖進這裡，或",
	pick: "選擇檔案",
	notXdw: "這不是 DocuWorks 的 .xdw 檔",
	oneFile: "一次只能放一個 .xdw 檔",
	failTail: "這個檔目前讀不了，請先用人工輸入，並把這個檔交給 David。",
	warnTail: "這個檔可能不完整，請核對頁數。",
	decoding: "解開中…"
}, He = 1650;
function V(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var H = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
function Ue(e) {
	e.querySelectorAll("canvas").forEach((e) => {
		e.width = 0, e.height = 0, e.remove();
	});
}
function We(e, t = (e) => Be(e)) {
	let n = null, r = 0, i = null, a = 0, o = () => {
		if (n && n.overlay.isConnected) return n;
		e.getElementById(Ve)?.remove();
		let t = V(e, "div", "edc-xdw-overlay");
		t.id = Ve, t.hidden = !0, t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-labelledby", "edcXdwTitle");
		let r = V(e, "div", "edc-xdw-dialog"), i = V(e, "div", "edc-xdw-head"), a = V(e, "h2", "edc-xdw-title", B.title);
		a.id = "edcXdwTitle";
		let o = V(e, "button", "edc-xdw-close", "✕ 關閉");
		o.type = "button", o.id = "edcXdwClose", i.append(a, o);
		let c = V(e, "p", "edc-xdw-note", B.notice);
		c.id = "edcXdwNotice";
		let l = V(e, "div", "edc-xdw-drop");
		l.id = "edcXdwDrop";
		let u = V(e, "input");
		u.type = "file", u.accept = ".xdw", u.id = "edcXdwFile", u.hidden = !0;
		let d = V(e, "button", "edc-xdw-btn edc-xdw-pick", B.pick);
		d.type = "button", d.id = "edcXdwPick", l.append(e.createTextNode(B.drop), d, u);
		let p = V(e, "div", "edc-xdw-status");
		p.id = "edcXdwStatus", p.setAttribute("aria-live", "polite");
		let m = V(e, "div", "edc-xdw-errors");
		m.id = "edcXdwErrors", m.hidden = !0;
		let h = V(e, "div", "edc-xdw-thumbs");
		h.id = "edcXdwThumbs";
		let g = V(e, "section", "edc-xdw-connect");
		g.id = "edcXdwConnect", g.hidden = !0, r.append(i, c, l, p, m, h, g);
		let _ = V(e, "div", "edc-xdw-zoom");
		_.id = "edcXdwZoom", _.hidden = !0;
		let v = V(e, "div", "edc-xdw-zoom-bar"), y = V(e, "span"), b = V(e, "button", "edc-xdw-close", "✕ 關閉放大");
		b.type = "button", b.id = "edcXdwZoomClose", v.append(y, b);
		let x = V(e, "div");
		x.id = "edcXdwZoomBody", _.append(v, x), t.append(r, _);
		let S = (e) => () => {
			try {
				Promise.resolve(e()).catch(() => {});
			} catch {}
		};
		return o.addEventListener("click", S(() => f.close())), b.addEventListener("click", S(() => s())), d.addEventListener("click", S(() => u.click())), u.addEventListener("change", S(() => {
			let e = u.files;
			if (e && e.length) return f.handleFiles(Array.from(e));
		})), t.addEventListener("dragover", (e) => {
			try {
				e.preventDefault(), l.classList.add("edc-xdw-drag");
			} catch {}
		}), t.addEventListener("dragleave", (e) => {
			try {
				(e.target === t || e.target === l) && l.classList.remove("edc-xdw-drag");
			} catch {}
		}), t.addEventListener("drop", (e) => {
			try {
				e.preventDefault(), l.classList.remove("edc-xdw-drag");
				let t = e.dataTransfer?.files;
				t && t.length && f.handleFiles(Array.from(t)).catch(() => {});
			} catch {}
		}), (e.body ?? e.documentElement).append(t), n = {
			overlay: t,
			close: o,
			input: u,
			drop: l,
			status: p,
			errors: m,
			thumbs: h,
			connect: g,
			zoom: _,
			zoomTitle: y,
			zoomBody: x
		}, n;
	}, s = () => {
		a++, n && (n.zoom.hidden = !0, Ue(n.zoomBody), n.zoomBody.replaceChildren());
	}, c = () => {
		r++, s();
		let e = i;
		i = null, e && e.close().catch(() => {}), n && (Ue(n.thumbs), n.thumbs.replaceChildren(), n.status.replaceChildren(), n.errors.replaceChildren(), n.errors.hidden = !0);
	}, l = (t, r) => {
		if (!n) return;
		let i = V(e, "ul");
		for (let n of t) i.append(V(e, "li", void 0, n));
		n.errors.replaceChildren(i, V(e, "div", "edc-xdw-red", r)), n.errors.hidden = !1;
	}, u = (t) => {
		n && n.status.replaceChildren(V(e, "span", "edc-xdw-red", t));
	}, d = async (t, r) => {
		let o = i;
		if (!n || !o) return;
		s();
		let c = ++a;
		n.zoomTitle.textContent = `第 ${t + 1} 頁（原始 ${r.width}×${r.height}）`, n.zoomBody.replaceChildren(V(e, "div", void 0, B.decoding)), n.zoom.hidden = !1;
		try {
			let e = await z(() => o.render(t, He));
			if (c !== a || o !== i) {
				e.width = 0, e.height = 0;
				return;
			}
			e.id = "edcXdwZoomCanvas", n.zoomBody.replaceChildren(e);
		} catch (r) {
			if (c !== a) return;
			n.zoomBody.replaceChildren(V(e, "div", "edc-xdw-thumb-bad", `第 ${t + 1} 頁無法顯示：${H(r)}`));
		}
	}, f = {
		open() {
			let e = o();
			e.overlay.hidden = !1;
			try {
				e.close.focus();
			} catch {}
		},
		close() {
			c(), n && (n.input.value = "", n.connect.querySelectorAll("input").forEach((e) => {
				e.value = "";
			}), n.overlay.hidden = !0);
		},
		getConnectSlot() {
			return o().connect;
		},
		async handleFiles(n) {
			let a = o();
			c();
			let s = r;
			if (n.length !== 1) {
				u(B.oneFile);
				return;
			}
			let f = n[0], p;
			try {
				p = new Uint8Array(await f.slice(0, 1).arrayBuffer());
			} catch (e) {
				s === r && u(`${B.notXdw}（${H(e)}）`);
				return;
			}
			if (s !== r) return;
			if (!/\.xdw$/i.test(f.name) || p[0] !== 96) {
				u(B.notXdw);
				return;
			}
			a.status.replaceChildren(V(e, "span", void 0, `${f.name}：${B.decoding}`));
			let m;
			try {
				let e = new Uint8Array(await f.arrayBuffer());
				if (s !== r) return;
				try {
					m = await t(e);
				} finally {
					e = null;
				}
			} catch (t) {
				if (s !== r) return;
				a.status.replaceChildren(V(e, "span", void 0, f.name)), l([H(t)], B.failTail);
				return;
			}
			if (s !== r) {
				m.close().catch(() => {});
				return;
			}
			i = m;
			let h = V(e, "span", void 0, `共 ${m.pages.length} 頁`);
			h.id = "edcXdwPageCount";
			let g = V(e, "span", "edc-xdw-red");
			g.id = "edcXdwBadCount", a.status.replaceChildren(V(e, "span", void 0, `${f.name}　`), h, g), m.warnings.length && l(m.warnings.flatMap((e) => e.split("；")).map((e) => e.trim()).filter(Boolean), B.warnTail);
			let _ = m.pages.map((t) => {
				let n = V(e, "button", "edc-xdw-thumb");
				return n.type = "button", n.dataset.page = String(t.index + 1), n.append(V(e, "div", "edc-xdw-thumb-cap", `第 ${t.index + 1} 頁・${B.decoding}`)), a.thumbs.append(n), n;
			}), v = 0;
			for (let t of m.pages) {
				if (s !== r) return;
				let n = _[t.index], i = `第 ${t.index + 1} 頁・原始 ${t.width}×${t.height}`;
				try {
					let a = await z(() => m.render(t.index, 220));
					if (s !== r) {
						a.width = 0, a.height = 0;
						return;
					}
					n.replaceChildren(a, V(e, "div", "edc-xdw-thumb-cap", i)), n.title = "點一下放大", n.addEventListener("click", () => {
						try {
							d(t.index, t).catch(() => {});
						} catch {}
					});
				} catch (i) {
					if (s !== r) return;
					v++;
					let a = V(e, "div", "edc-xdw-thumb edc-xdw-thumb-bad", `第 ${t.index + 1} 頁無法顯示：${H(i)}`);
					a.dataset.page = String(t.index + 1), n.replaceWith(a), g.textContent = `其中 ${v} 頁無法顯示`;
				}
			}
		}
	};
	return e.addEventListener("keydown", (e) => {
		try {
			if (e.key !== "Escape" || !n || n.overlay.hidden) return;
			n.zoom.hidden ? f.close() : s();
		} catch {}
	}), f;
}
//#endregion
//#region src/claude/config.ts
var Ge = "https://api.anthropic.com/v1/messages", Ke = "2023-06-01", qe = ["claude-sonnet-5-5", "claude-haiku-5-5"], U = "edc_claude_api_key", Je = 3e4, Ye = "請只回覆：OK", W = {
	heading: "🔑 Claude 連線設定",
	notice: "金鑰只存在這台電腦的這個瀏覽器，不會進匯出備份。請用專用金鑰並設每月上限。",
	none: "尚未設定金鑰",
	saved: (e) => `已設定金鑰 ••••${e}`,
	placeholder: "貼上 API 金鑰（sk-ant-…）",
	save: "儲存",
	test: "測試連線",
	remove: "移除金鑰",
	savedOk: "已儲存金鑰",
	badFormat: "金鑰格式不對：要以 sk-ant- 開頭、不可有空白或換行、長度至少 20 個字。沒有儲存。",
	storageFail: "這個瀏覽器不允許儲存金鑰",
	needKey: "請先貼上金鑰並按儲存",
	unsavedNote: "輸入框裡的內容還沒儲存，這次測的是已儲存的金鑰",
	testing: "測試中…",
	confirmRemove: "確定要移除這台電腦上的金鑰嗎？移除後要重新貼上才能用。",
	removed: "已移除金鑰"
};
//#endregion
//#region src/claude/key.ts
function Xe(e) {
	let t = String(e ?? "").trim();
	return !t.startsWith("sk-ant-") || /\s/.test(t) || t.length < 20 ? null : t;
}
function Ze(e) {
	return e.slice(-4);
}
var G = () => {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
};
function Qe(e = G()) {
	try {
		return e?.getItem(U) || null;
	} catch {
		return null;
	}
}
function $e(e, t = G()) {
	try {
		return t ? (t.setItem(U, e), t.getItem(U) === e) : !1;
	} catch {
		return !1;
	}
}
function et(e = G()) {
	try {
		e?.removeItem(U);
	} catch {}
}
//#endregion
//#region src/claude/api.ts
function tt(e, t) {
	return {
		url: Ge,
		init: {
			method: "POST",
			headers: {
				"x-api-key": e,
				"anthropic-version": Ke,
				"content-type": "application/json",
				"anthropic-dangerous-direct-browser-access": "true"
			},
			body: JSON.stringify({
				model: t,
				max_tokens: 8,
				messages: [{
					role: "user",
					content: Ye
				}]
			})
		}
	};
}
var nt = "（已遮蔽）";
function K(e, t) {
	let n = typeof e == "string" ? e : e == null ? "" : String(e);
	return t && (n = n.split(t).join(nt)), n = n.replace(/sk-ant-[^\s"'<>，。；）)]*/g, nt), n = n.replace(/\s+/g, " ").trim(), n.length > 300 ? n.slice(0, 300) + "…" : n;
}
function rt(e) {
	return e === 401 ? "金鑰無效或已刪除" : e === 403 ? "這把金鑰沒有權限" : e === 404 ? "找不到這個模型" : e === 429 ? "請求太頻繁，或已達每月上限" : e >= 500 ? "Anthropic 服務暫時有問題" : `請求被拒（HTTP ${e}）`;
}
var it = "連不到 api.anthropic.com（可能被公司網路擋住）", at = "30 秒內沒有回應，請稍後再試", ot = "回應格式不對（收到 HTTP 200，但內容不是預期的格式）", st = () => ({
	fetch: (e, t) => globalThis.fetch(e, t),
	setTimeout: (e, t) => globalThis.setTimeout(e, t),
	clearTimeout: (e) => globalThis.clearTimeout(e)
}), ct = (e, t, n) => ({
	model: e,
	ok: !0,
	text: `${e}：✅ 成功（回傳模型 ${t}，用了 ${n} 個 token）`
}), q = (e, t, n = "") => ({
	model: e,
	ok: !1,
	text: `${e}：❌ ${t}${n ? `（${n}）` : ""}`
});
async function lt(e, t, n = st()) {
	let r = new AbortController(), i = !1, a = n.setTimeout(() => {
		i = !0, r.abort();
	}, Je);
	try {
		let a;
		try {
			let { url: i, init: o } = tt(e, t);
			a = await n.fetch(i, {
				...o,
				signal: r.signal,
				credentials: "omit",
				referrerPolicy: "no-referrer",
				cache: "no-store"
			});
		} catch {
			return q(t, i ? at : it);
		}
		let o = null, s = !1;
		try {
			o = await a.json(), s = !0;
		} catch {
			if (i) return q(t, at);
		}
		let c = o && typeof o == "object" ? o : {};
		if (!a.ok) {
			let n = K(c.error?.type, e), r = K(c.error?.message, e);
			return q(t, rt(a.status), [n, r].filter(Boolean).join("："));
		}
		let l = (e) => typeof e == "number" && Number.isFinite(e), u = c.usage?.input_tokens, d = c.usage?.output_tokens;
		return !s || !o || typeof o != "object" || Array.isArray(o) || typeof c.model != "string" || !c.model.trim() || !l(u) || !l(d) ? q(t, ot) : ct(t, K(c.model, e), u + d);
	} finally {
		n.clearTimeout(a);
	}
}
//#endregion
//#region src/claude/panel.ts
var J = {
	status: "edcClaudeStatus",
	input: "edcClaudeKeyInput",
	save: "edcClaudeSave",
	test: "edcClaudeTest",
	remove: "edcClaudeRemove",
	msg: "edcClaudeMsg",
	results: "edcClaudeResults",
	notice: "edcClaudeNotice"
};
function Y(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
function ut(e, t) {
	if (t.hidden = !1, t.querySelector("#" + J.status)) return X(e), !1;
	let n = Y(e, "h3", "edc-xdw-connect-title", W.heading), r = Y(e, "p", "edc-xdw-connect-note", W.notice);
	r.id = J.notice;
	let i = Y(e, "div", "edc-xdw-connect-status");
	i.id = J.status, i.setAttribute("aria-live", "polite");
	let a = Y(e, "div", "edc-xdw-connect-row"), o = Y(e, "input", "edc-xdw-connect-input");
	o.type = "password", o.id = J.input, o.autocomplete = "off", o.spellcheck = !1, o.placeholder = W.placeholder, o.setAttribute("aria-label", W.placeholder), o.setAttribute("data-lpignore", "true");
	let s = (t, n, r = "edc-xdw-btn") => {
		let i = Y(e, "button", r, n);
		return i.type = "button", i.id = t, i;
	}, c = s(J.save, W.save), l = s(J.test, W.test), u = s(J.remove, W.remove, "edc-xdw-close");
	a.append(o, c, l, u);
	let d = Y(e, "div", "edc-xdw-connect-msg");
	d.id = J.msg, d.setAttribute("aria-live", "polite");
	let f = Y(e, "ul", "edc-xdw-connect-results");
	f.id = J.results, t.replaceChildren(n, r, i, a, d, f);
	let p = (t, n = "ok") => {
		d.replaceChildren(Y(e, "span", n === "red" ? "edc-xdw-red" : n === "gray" ? "edc-xdw-connect-gray" : "edc-xdw-connect-ok", t));
	}, m = [
		c,
		l,
		u
	], h = !1;
	return c.addEventListener("click", () => {
		try {
			if (h) return;
			let e = Xe(o.value);
			if (o.value = "", f.replaceChildren(), !e) {
				p(W.badFormat, "red");
				return;
			}
			if (!$e(e)) {
				p(W.storageFail, "red");
				return;
			}
			p(W.savedOk);
		} catch {}
		try {
			X(e);
		} catch {}
	}), o.addEventListener("keydown", (e) => {
		try {
			e.key === "Enter" && (e.preventDefault(), c.click());
		} catch {}
	}), l.addEventListener("click", () => {
		h || (async () => {
			h = !0, m.forEach((e) => {
				e.disabled = !0;
			});
			try {
				f.replaceChildren(), d.replaceChildren();
				let t = o.value !== "", n = Qe();
				if (!n) {
					p(W.needKey, "red");
					return;
				}
				t && p(W.unsavedNote, "gray");
				for (let t of qe) {
					let r = Y(e, "li", "edc-xdw-connect-gray", `${t}：${W.testing}`);
					f.append(r);
					let i = await lt(n, t);
					r.textContent = i.text, r.className = i.ok ? "edc-xdw-connect-ok" : "edc-xdw-red";
				}
			} catch {} finally {
				h = !1, m.forEach((e) => {
					e.disabled = !1;
				});
			}
		})();
	}), u.addEventListener("click", () => {
		try {
			if (h) return;
			let t = e.defaultView;
			if (!t || !t.confirm(W.confirmRemove)) return;
			et(), o.value = "", f.replaceChildren(), p(W.removed);
		} catch {}
		try {
			X(e);
		} catch {}
	}), X(e), !0;
}
function X(e) {
	let t = e.getElementById(J.status);
	if (!t) return;
	let n = Qe();
	t.textContent = n ? W.saved(Ze(n)) : W.none, t.classList.toggle("edc-xdw-connect-has", !!n);
}
function dt(e) {
	let t = e.getElementById(J.input);
	t && (t.value = ""), e.getElementById(J.msg)?.replaceChildren(), e.getElementById(J.results)?.replaceChildren();
}
//#endregion
//#region src/xdw/index.ts
var ft = null;
function pt(e = document) {
	return ft ||= We(e), ft;
}
function mt(e = document) {
	let t = pt(e);
	t.open();
	try {
		ut(e, t.getConnectSlot()), dt(e);
	} catch {}
}
function ht(e = document) {
	Ie(e, () => mt(e));
}
//#endregion
//#region src/main.ts
function gt() {
	let e = t(document.title);
	e !== document.title && (document.title = e);
}
function _t() {
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
function vt() {
	let e = document.getElementById("versionBadge");
	if (!e) return;
	let t = e.textContent ?? "", r = n(t, "v1.2");
	r !== t && (e.textContent = r);
}
function yt() {
	try {
		gt(), _t(), vt();
	} catch {}
}
var bt = !1;
function Z() {
	if (bt) return;
	let e = document.getElementById("versionBadge");
	!e || typeof MutationObserver > "u" || (bt = !0, new MutationObserver(() => {
		try {
			vt();
		} catch {}
	}).observe(e, {
		childList: !0,
		characterData: !0,
		subtree: !0
	}));
}
yt(), Z(), document.readyState !== "complete" && document.addEventListener("DOMContentLoaded", () => {
	yt(), Z();
}, { once: !0 });
function xt() {
	let e = T();
	try {
		ee({
			SmartParse: typeof SmartParse < "u" ? SmartParse : void 0,
			ImportEngine: typeof ImportEngine < "u" ? ImportEngine : void 0,
			XLSX: typeof XLSX < "u" ? XLSX : void 0
		}, e), De(e, typeof SmartParse < "u" ? SmartParse : void 0);
	} catch (t) {
		e.mode = "failed", e.errors.push("啟動失敗：" + String(t));
	}
	try {
		Te(e, {
			win: window,
			doc: document,
			getState: () => typeof state < "u" ? state : void 0,
			getCategories: () => typeof CATEGORIES < "u" ? CATEGORIES : void 0
		});
	} catch (t) {
		e.mode = "failed", e.errors.push("提醒安裝失敗：" + String(t));
	}
	return e;
}
var Q = null;
try {
	Q = xt();
} catch {}
var $ = () => {
	try {
		Q && we(Q, document);
	} catch {}
};
$(), document.readyState === "loading" && document.addEventListener("DOMContentLoaded", $, { once: !0 }), window.addEventListener("load", $, { once: !0 });
try {
	Object.defineProperty(window, "__edcPage2Status", {
		configurable: !0,
		get: () => Q ? {
			mode: Q.mode,
			wrapped: [...Q.wrapped],
			missing: [...Q.missing],
			errors: [...Q.errors]
		} : null
	});
} catch {}
try {
	ht(document);
} catch {}
//#endregion
