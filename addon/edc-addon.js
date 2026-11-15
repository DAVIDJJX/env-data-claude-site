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
function D(e, t = T()) {
	try {
		O(e.XLSX, t);
	} catch (e) {
		t.errors.push("包 sheet_to_json 失敗：" + w(e));
	}
	try {
		k(e.ImportEngine, t);
	} catch (e) {
		t.errors.push("包 readWorkbookGrids 失敗：" + w(e));
	}
	try {
		ee(e.SmartParse, t);
	} catch (e) {
		t.errors.push("包 parseLabItemTableSheet 失敗：" + w(e));
	}
	return t.wrapped.includes("SmartParse.parseLabItemTableSheet") || (t.mode = "failed"), t;
}
function O(e, t) {
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
function k(e, t) {
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
function ee(e, t) {
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
			let c = A(this, r, n, i, a, o, t, e);
			for (let e of c) t.rowOutcome.set(e, o);
			a.push(...c);
		} catch (e) {
			o && (o.error = w(e), o.blocks = o.blocks.filter((e) => e.status !== "filled")), t.errors.push("補讀失敗：" + w(e));
		}
		return a;
	}, t.wrapped.push("SmartParse.parseLabItemTableSheet");
}
function A(e, t, n, r, i, a, o, s) {
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
var te = (e, t) => e.source?.file ?? (typeof t?._sourceFile == "string" ? t._sourceFile : null), ne = (e, t) => e.source?.sheet ?? (typeof t?._sourceSheet == "string" ? t._sourceSheet : null);
function re(e, t) {
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
		let n = te(e, t), i = ne(e, t);
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
var ie = "edcPage2Notice", ae = "Claude 版提醒（第 2 頁補讀）：", oe = "⚠️ Claude 版的第 2 頁補讀目前無法使用（原網站程式可能已更新）。這次匯入不會自動補第 2 頁，請對照報告手動核對。", se = "edcPage2Banner", ce = "⚠️ Claude 版的第 2 頁補讀目前無法使用（原網站程式可能已更新）。匯入水質／地質報告時不會自動補第 2 頁，請對照報告手動核對。", le = `${ae}無法確認第 2 頁補讀的狀態（外掛檢查時出錯），請對照報告手動核對第 2 頁以後的值。\n\n仍要匯入嗎？`, ue = "＊按確認匯入時，會依下方『檢測極限』的處理方式調整", de = "會匯入", fe = "已取消（不會匯入）", pe = "無法確認", me = /* @__PURE__ */ new Set(["water", "geo"]), j = (e) => e == null ? "" : String(e);
function he(e, t) {
	let n = t.getState(), r = n?.smartResult?.rows;
	if (!n || !Array.isArray(r)) return null;
	let i = j(n.importCatKey);
	return {
		sum: re(e, r),
		rows: r,
		catKey: i
	};
}
var ge = (e, t) => e.mode === "failed" && me.has(t);
function _e(e, t) {
	try {
		let n = t.win.filterRowsBySelection, r = t.getState(), i = t.getCategories()?.[j(r?.importCatKey)];
		if (typeof n != "function" || !i || typeof i.itemField != "string") return null;
		let a = n.call(t.win, e, i.itemField);
		return Array.isArray(a) ? new Set(a) : null;
	} catch {
		return null;
	}
}
var ve = (e) => `第 ${e} 頁`;
function ye(e, t, n, r) {
	let i = j(e._sourceSheet), a = t.cell ? `${i}!${t.cell}` : `${i} 第 ${t.rowGuess ?? "?"} 列（位址未確認）`;
	return `${n && j(e._sourceFile) ? `${j(e._sourceFile)} / ` : ""}${a}${r ? `（${ve(t.page)}）` : ""}`;
}
var be = (e) => {
	let t = j(e.檢測數值);
	return `${j(e.比較關係) ? j(e.比較關係) + " " : ""}${t || "（空白）"}`;
};
function xe(e) {
	let t = [];
	return e.file && t.push(e.file), t.push(`工作表「${e.sheet ?? "（不明）"}」`), e.page !== null && t.push(ve(e.page)), e.headerRow !== null && t.push(`第 ${e.headerRow} 列起`), t.join("　");
}
function Se(e, t) {
	let n = t.doc, r = n.getElementById(ie), i = he(e, t), a = n.getElementById("smartImportSummary");
	if (!i || !a) return r?.remove(), null;
	let { sum: o, rows: s, catKey: c } = i, l = ge(o, c), u = o.mode === "failed" ? [] : o.filled;
	if (!l && !u.length && !o.skipped.length && !o.mismatches.length && !o.upstreamRead.length) return r?.remove(), null;
	let d = (e, t, r) => {
		let i = n.createElement(e);
		return t != null && (i.textContent = t), r && (i.style.cssText = r), i;
	}, f = d("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #7a5fb0;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	f.id = ie;
	let p = "margin-top:10px;padding:10px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b";
	if (l) {
		let e = d("div", null, p);
		e.dataset.edc = "failed", e.append(d("div", oe, "font-weight:700")), f.append(e);
	}
	let m = /* @__PURE__ */ new Set();
	for (let e of u) m.add(j(e._sourceFile));
	for (let e of [
		...o.skipped,
		...o.mismatches,
		...o.upstreamRead
	]) e.file && m.add(e.file);
	let h = m.size > 1;
	if (u.length) {
		let e = [...new Set(u.map((e) => e._edcPage2.page))].sort((e, t) => e - t), n = e[e.length - 1], r = n >= 3, i = r ? `🟣 Claude 版補讀：第 ${e[0]}～${n} 頁共 ${u.length} 筆（${e.map((e) => `${ve(e)} ${u.filter((t) => t._edcPage2.page === e).length} 筆`).join("、")}）` : `🟣 Claude 版補讀：第 2 頁共 ${u.length} 筆`;
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
		let m = d("tbody"), g = _e(s, t);
		u.forEach((e, t) => {
			let n = e._edcPage2, i = d("tr");
			i.dataset.edcRow = String(t), [
				ye(e, n, h, r),
				j(e.採樣地點),
				j(e.檢測項目),
				n.raw,
				be(e),
				j(e.檢測極限) || "—"
			].forEach((e, t) => i.append(d("td", e, `padding:4px 8px;border-bottom:1px solid #eef2f5${t === 0 ? ";white-space:nowrap" : ""}`)));
			let a = d("td", Ce(e, g), "padding:4px 8px;border-bottom:1px solid #eef2f5;white-space:nowrap");
			a.dataset.edcStatus = "", i.append(a), m.append(i);
		}), o.append(m), a.append(o), f.append(a);
		let _ = d("div", ue, "margin-top:4px;font-size:12px;color:#5b6b78");
		_.dataset.edc = "limit-note", f.append(_);
	}
	if (o.upstreamRead.length && f.append(d("div", `原網站已讀到 ${o.upstreamRead.length} 個第 2 頁以後的區塊（Claude 版沒有重複補）。`, "margin-top:8px;color:#7a8791;font-size:13px")), !l && o.skipped.length) {
		let e = d("div", null, p);
		e.dataset.edc = "skipped", e.append(d("div", `⚠️ 有 ${o.skipped.length} 個第 2 頁區塊沒有自動補，請對照報告手動補上`, "font-weight:700")), o.skipped.forEach((t) => e.append(d("div", `・${xe(t)}：${t.reason}`))), f.append(e);
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
function Ce(e, t) {
	return t ? t.has(e) ? de : fe : pe;
}
function we(e, t) {
	let n = t.doc.getElementById(ie);
	if (!n) return;
	let r = he(e, t);
	if (!r) return;
	let i = r.sum.mode === "failed" ? [] : r.sum.filled, a = _e(r.rows, t);
	n.querySelectorAll("tr[data-edc-row]").forEach((e) => {
		let t = i[Number(e.dataset.edcRow)], n = e.querySelector("td[data-edc-status]");
		if (!n) return;
		let r = t ? Ce(t, a) : pe;
		n.textContent !== r && (n.textContent = r);
	});
}
function Te(e, t) {
	if (!e.needsConfirm) return null;
	if (e.mode === "failed") return me.has(t) ? `${ae}第 2 頁補讀目前無法使用（原網站程式可能已更新），這次匯入不會自動補第 2 頁。\n\n請對照報告手動核對。仍要匯入嗎？` : null;
	let n = [];
	return e.skipped.length && n.push(`有 ${e.skipped.length} 個第 2 頁區塊沒有自動補，請對照報告手動補上。`), e.mismatches.length && n.push(`第 2 頁以後的區塊對帳不符（${e.mismatches.length} 張工作表），可能有沒補也沒列出的區塊。`), `${ae}${n.join("\n")}\n\n詳細請看確認畫面上的紅字。仍要匯入嗎？`;
}
function Ee(e, t) {
	let n = t.getElementById(se);
	if (e.mode !== "failed") {
		n?.remove();
		return;
	}
	if (n || !t.body) return;
	let r = t.createElement("div");
	r.id = se, r.setAttribute("role", "alert"), r.textContent = ce, r.style.cssText = "position:sticky;top:0;z-index:2147483000;margin:0;padding:8px 14px;background:#fdf1f0;border-bottom:2px solid #d9534f;color:#8a1f1b;font-weight:700;font-size:14px;line-height:1.5", t.body.prepend(r);
}
function De(e, t) {
	let n = t.win, r = /* @__PURE__ */ new WeakSet(), i = !0, a = () => {
		let n = t.doc.getElementById("smartImportSummary");
		!n || r.has(n) || typeof MutationObserver > "u" || (r.add(n), new MutationObserver(() => {
			try {
				we(e, t);
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
			Se(e, t), a(), i = !0;
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
			let n = he(e, t);
			n && (a = Te(n.sum, n.catKey));
		} catch (t) {
			e.errors.push("匯入前檢查失敗：" + String(t)), a = le;
		}
		if (!(a !== null && !n.confirm(a))) return s.apply(this, r);
	}, e.wrapped.push("confirmSmartImport")) : e.missing.push("confirmSmartImport"), (!e.wrapped.includes("renderSmartImportPreview") || !e.wrapped.includes("confirmSmartImport")) && (e.mode = "failed");
}
//#endregion
//#region src/page2/selftest.ts
var Oe = [
	"樣品編號\n檢驗項目",
	"",
	"EDC-SELFTEST",
	"偵測\n極限",
	"單位",
	"檢測方法"
], ke = () => [
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
], Ae = "水溫";
function je() {
	let e = [
		...ke(),
		[...Oe],
		[
			"",
			"",
			"檢測值"
		],
		[
			Ae,
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
		...ke(),
		[...Oe],
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
var Me = (e) => Array.isArray(e) ? e.map((e) => String(e?.檢測項目 ?? "")) : [];
function Ne(e, t) {
	let n = (t, n) => (e.mode = t, t === "failed" && e.errors.push("自我測試：" + n), {
		status: t,
		detail: n
	});
	try {
		if (e.mode === "failed" || !e.originalParseLab) return n("failed", "找不到 SmartParse.parseLabItemTableSheet：" + e.missing.join("、"));
		let r = t;
		if (!r || typeof r.parseSheet != "function") return n("failed", "找不到 SmartParse.parseSheet");
		let i = Me(e.originalParseLab.call(r, je(), "water"));
		if (!i.includes("水溫")) return n("failed", "原函式讀不到合成表的第 1 頁");
		if (i.includes("鐵")) return n("upstream-fixed", "原函式已經會讀第 2 頁");
		e.mode = "testing";
		let a = je();
		e.selftestGrids.add(a);
		let o = r.parseSheet.call(r, "water", "__edc_selftest__", a, { allowAutoDetect: !1 }), s = Me(o), c = Array.isArray(o) && o.some((e) => e?.檢測項目 === "鐵" && typeof e?._edcPage2 == "object");
		return s.includes("水溫") && c ? n("active", "正常") : n("failed", `包裝後讀到的項目：${s.join("、") || "（沒有）"}`);
	} catch (e) {
		return n("failed", "丟例外：" + (e instanceof Error ? e.message : String(e)));
	}
}
//#endregion
//#region src/xdw/button.ts
var Pe = "edcBtnImportXdw", Fe = "📄 匯入檔案（XDW）", Ie = "掃描檔（DocuWorks .xdw）——Claude 版功能", Le = "edcXdwStyle", Re = "\n.edc-xdw-btn{border:none;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;background:#6a4c9c;color:#fff;box-shadow:inset 0 0 0 1px #4b3172}\n.edc-xdw-btn:hover,.edc-xdw-btn:focus-visible{background:#57397f}\n.edc-xdw-btn:focus-visible{outline:2px solid #b9a7d6;outline-offset:2px}\n.edc-xdw-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2147482000;display:flex;align-items:center;justify-content:center}\n.edc-xdw-overlay[hidden]{display:none}\n.edc-xdw-dialog{background:#fff;color:#2b3e4e;width:min(1100px,94vw);max-height:92vh;overflow:auto;border-radius:10px;border-top:6px solid #6a4c9c;padding:16px 20px;box-shadow:0 10px 40px rgba(0,0,0,.3);font-size:14px;line-height:1.6}\n.edc-xdw-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}\n.edc-xdw-title{margin:0;font-size:18px;color:#4b3172}\n.edc-xdw-close{border:1px solid #c9bfdc;background:#f6f2fb;color:#4b3172;border-radius:6px;padding:4px 10px;font:inherit;font-size:13px;cursor:pointer}\n.edc-xdw-note{margin:0 0 10px;padding:8px 12px;background:#f6f2fb;border-left:5px solid #7a5fb0;border-radius:4px}\n.edc-xdw-drop{border:2px dashed #b9a7d6;border-radius:8px;padding:16px;text-align:center;background:#fbf9fe}\n.edc-xdw-drop.edc-xdw-drag{background:#ece6f5;border-color:#6a4c9c}\n.edc-xdw-pick{margin-left:6px}\n.edc-xdw-status{margin:10px 0 4px;font-weight:600}\n.edc-xdw-status .edc-xdw-red{margin-left:10px}\n.edc-xdw-red{color:#b3261e;font-weight:700}\n.edc-xdw-errors{margin:6px 0;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b}\n.edc-xdw-errors[hidden]{display:none}\n.edc-xdw-errors ul{margin:4px 0 4px 18px;padding:0}\n.edc-xdw-thumbs{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}\n.edc-xdw-thumb{width:224px;border:1px solid #dce5ea;border-radius:6px;padding:4px;background:#fff;cursor:zoom-in;font:inherit;text-align:center;color:inherit}\n.edc-xdw-thumb canvas{display:block;width:220px;height:auto;background:#fff}\n.edc-xdw-thumb-cap{font-size:12px;color:#5b6b78;margin-top:2px}\n.edc-xdw-thumb-bad{cursor:default;border:2px solid #d9534f;background:#fdf1f0;color:#8a1f1b;padding:10px;min-height:120px;font-weight:700}\n.edc-xdw-zoom{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:2147482001;overflow:auto;padding:20px;text-align:center}\n.edc-xdw-zoom[hidden]{display:none}\n.edc-xdw-zoom-bar{position:sticky;top:0;display:flex;justify-content:center;gap:12px;align-items:center;color:#fff;margin-bottom:8px}\n.edc-xdw-zoom canvas{max-width:100%;height:auto;background:#fff}\n.edc-xdw-thumbs-title{margin:12px 0 4px;font-size:14px;color:#5b6b78;font-weight:600}\n.edc-xdw-thumbs-title[hidden]{display:none}\n.edc-read{margin-top:16px;padding:12px 14px;border:3px solid #6a4c9c;border-radius:8px;background:#f8f5fc}\n.edc-read[hidden]{display:none}\n.edc-read-title{margin:0 0 6px;font-size:18px;color:#4b3172}\n.edc-read-why{font-weight:600;color:#4a5866}\n.edc-read-intro{margin:0 0 8px;padding:6px 10px;background:#fff;border-left:5px solid #6a4c9c;border-radius:4px;font-weight:600}\n.edc-read-progress{font-weight:700;color:#4b3172;min-height:1.2em}\n.edc-read-summary{font-weight:700;font-size:15px;margin:4px 0 8px}\n.edc-read-pages{display:flex;flex-direction:column;gap:10px}\n.edc-read-page{background:#fff;border:1px solid #c9bfdc;border-radius:6px;padding:8px}\n.edc-read-page-bad{border:2px solid #d9534f;background:#fdf1f0}\n.edc-read-page-head{display:flex;flex-wrap:wrap;gap:10px;align-items:baseline;margin-bottom:4px}\n.edc-read-ok{color:#2e6b34;font-weight:700}\n.edc-read-bad{color:#8a1f1b;font-weight:700}\n.edc-read-form{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin:12px 0 8px;padding-top:10px;border-top:1px solid #d8cdea}\n.edc-read-field{display:flex;flex-direction:column;gap:2px;font-size:13px}\n.edc-read-label{font-weight:700;color:#4b3172}\n.edc-read-input{padding:5px 8px;border:1px solid #b9a7d6;border-radius:6px;font:inherit;font-size:13px;max-width:320px}\n.edc-read-hint{font-size:12px;color:#8a5a00}\n.edc-read-confirm-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}\n.edc-read-confirm{font-size:14px;padding:8px 14px}\n.edc-read-confirm:disabled{opacity:.5;cursor:not-allowed}\n.edc-read-why-disabled{color:#8a1f1b;font-weight:600}\n.edc-read-done{margin-top:8px}\n.edc-read-done-item{padding:8px 10px;background:#fff;border:1px dashed #6a4c9c;border-radius:6px;margin-top:6px}\n.edc-read-done-head{font-weight:700;color:#4b3172}\n.edc-read-run{margin-top:10px;padding:8px 10px;background:#fff;border:1px solid #b9a7d6;border-radius:6px}\n.edc-read-run[hidden],.edc-read-pause[hidden],.edc-read-next[hidden],.edc-read-run [hidden],.edc-read-logbar [hidden],.edc-res [hidden]{display:none}\n.edc-read-run-status{font-weight:700;color:#4b3172}\n.edc-read-run-note{font-size:13px;color:#5b6b78;min-height:1.2em}\n.edc-read-pause{font-weight:700;color:#8a5a00}\n.edc-read-tokens{font-size:13px;color:#4a5866;margin-top:4px}\n.edc-read-end{margin-top:6px;font-weight:700}\n.edc-read-locked{color:#4a5866}\n.edc-read-logbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}\n.edc-read-load-why{font-size:12px;color:#5b6b78}\n.edc-read-logbar button:disabled{opacity:.5;cursor:not-allowed}\n.edc-res{margin-top:10px}\n.edc-res-counts{font-weight:700;font-size:15px;margin-bottom:6px}\n.edc-res-page{background:#fff;border:1px solid #c9bfdc;border-radius:6px;padding:8px;margin-top:8px}\n.edc-res-page-manual{border:2px solid #e0882b}\n.edc-res-page-skip{border:2px solid #d9534f;background:#fdf1f0}\n.edc-res-page-head{display:flex;flex-wrap:wrap;gap:10px;align-items:baseline}\n.edc-res-mode{color:#4b3172;font-weight:600}\n.edc-res-page-status{font-weight:600}\n.edc-res-identity{margin:4px 0 4px 18px;padding:0;font-size:13px}\n.edc-res-warn{color:#8a5a00;font-size:13px}\n.edc-res-table,.edc-res-cmp{border-collapse:collapse;font-size:13px;margin-top:4px}\n.edc-res-table th,.edc-res-table td,.edc-res-cmp th,.edc-res-cmp td{border:1px solid #d8cdea;padding:2px 6px;text-align:left}\n.edc-res-row{cursor:pointer}\n.edc-res-pass .edc-res-status{color:#2e6b34;font-weight:700}\n.edc-res-manual .edc-res-status{color:#b35a00;font-weight:700}\n.edc-res-manual{background:#fff4e6}\n.edc-res-frag-img{display:block;max-width:100%;max-height:320px;width:auto;margin-top:4px;border:1px solid #b9a7d6;cursor:zoom-in}\n.edc-res-frag-img.edc-res-frag-full{max-width:none;max-height:none;cursor:zoom-out}\n.edc-res-frag-wrap.edc-res-frag-scroll{overflow:auto;max-height:70vh;max-width:100%}\n.edc-res-frag-note,.edc-res-frag-none{font-size:12px;color:#5b6b78}\n.edc-read-next{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}\n.edc-read-to-import:disabled{opacity:.5;cursor:not-allowed}\n.edc-read-next-note{font-size:13px;color:#5b6b78}\n.edc-read-submit-msg{margin-top:8px}\n.edc-read-submit-stage{font-weight:700;color:#4b3172}\n.edc-read-submit-fail{padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px}\n.edc-read-download-xlsx{margin-top:6px}\n.edc-xdw-connect{margin-top:16px;padding-top:12px;border-top:1px solid #e3dcef}\n.edc-xdw-connect[hidden]{display:none}\n.edc-xdw-connect-title{margin:0 0 6px;font-size:16px;color:#4b3172}\n.edc-xdw-connect-note{margin:0 0 8px;font-size:13px;color:#4a5866}\n.edc-xdw-connect-status{font-weight:700;margin-bottom:6px;color:#5b6b78}\n.edc-xdw-connect-status.edc-xdw-connect-has{color:#2e6b34}\n.edc-xdw-connect-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.edc-xdw-connect-input{flex:1 1 280px;min-width:200px;padding:6px 8px;border:1px solid #b9a7d6;border-radius:6px;font:inherit;font-size:13px}\n.edc-xdw-connect-row button:disabled{opacity:.55;cursor:wait}\n.edc-xdw-connect-msg{min-height:1.4em;margin-top:6px}\n.edc-xdw-connect-results{margin:4px 0 0 18px;padding:0}\n.edc-xdw-connect-ok{color:#2e6b34;font-weight:600}\n.edc-xdw-connect-gray{color:#5b6b78}\n";
function ze(e) {
	if (e.getElementById("edcXdwStyle")) return;
	let t = e.createElement("style");
	t.id = Le, t.textContent = Re, (e.head ?? e.documentElement).append(t);
}
function Be(e, t) {
	let n = e.getElementById("btnImport"), r = e.getElementById(Pe);
	if (!n || r && n.nextElementSibling === r) return !1;
	let i = r ?? Ve(e, t);
	return n.after(i), !0;
}
function Ve(e, t) {
	let n = e.createElement("button");
	return n.type = "button", n.id = Pe, n.className = "edc-xdw-btn", n.textContent = Fe, n.title = Ie, n.addEventListener("click", (e) => {
		try {
			e.preventDefault(), t();
		} catch {}
	}), n;
}
function He(e, t) {
	try {
		ze(e);
	} catch {}
	let n = () => {
		try {
			Be(e, t);
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
var Ue = [
	"pdfjsLib",
	"_pdfjsTestingUtils",
	"pdfjsWorker"
], We = () => import("./edc-xdw.js"), Ge = /* @__PURE__ */ new Map();
function Ke(e, t) {
	for (let n of t) try {
		n.had ? e[n.k] !== n.v && (e[n.k] = n.v) : Object.prototype.hasOwnProperty.call(e, n.k) && delete e[n.k];
	} catch {}
}
async function qe(e, t = globalThis) {
	let n = Ge.get(t);
	n || (n = {
		depth: 0,
		snap: Ue.map((e) => ({
			k: e,
			had: Object.prototype.hasOwnProperty.call(t, e),
			v: t[e]
		}))
	}, Ge.set(t, n)), n.depth++;
	try {
		return await e();
	} finally {
		Ke(t, n.snap), --n.depth === 0 && Ge.delete(t);
	}
}
function Je(e, t = We) {
	return qe(async () => (await t()).decodeXdw(e));
}
var Ye = 2576, Xe = 4784, Ze = (e, t) => Number.isInteger(e) && Number.isInteger(t) && e >= 1 && t >= 1;
function Qe(e, t) {
	if (!Ze(e, t)) return `影像尺寸無效（${e}×${t}）`;
	if (Math.max(e, t) > 2576) return `影像長邊 ${Math.max(e, t)}px 超過上限 ${Ye}px`;
	let n = Math.ceil(e / 28) * Math.ceil(t / 28);
	return n > 4784 ? `影像太大（${n} 個區塊，上限 ${Xe}）` : null;
}
function $e(e, t, n = 3, r = 120) {
	if (!Ze(e, t)) throw Error(`影像尺寸無效（${e}×${t}），無法切圖`);
	let i = Math.min(t, Math.ceil((t + (n - 1) * r) / n)), a = n > 1 ? (t - i) / (n - 1) : 0, o = [];
	for (let r = 0; r < n; r++) {
		let s = r === n - 1 ? t - i : Math.round(r * a);
		o.push({
			scheme: "B",
			index: r,
			count: n,
			x: 0,
			y: s,
			w: e,
			h: i
		});
	}
	return o;
}
function et(e, t) {
	if (!Ze(e, t)) return {
		ok: !1,
		reason: `影像尺寸無效（${e}×${t}）`
	};
	let n = [{
		scheme: "A",
		index: 0,
		count: 1,
		x: 0,
		y: 0,
		w: e,
		h: t
	}], r = $e(e, t);
	for (let e of [...n, ...r]) {
		let t = Qe(e.w, e.h);
		if (t) return {
			ok: !1,
			reason: `${e.scheme} 讀法第 ${e.index + 1} 張：${t}`
		};
	}
	return {
		ok: !0,
		A: n,
		B: r
	};
}
function tt(e, t) {
	if (!Ze(t.w, t.h) || !Number.isInteger(t.x) || !Number.isInteger(t.y) || t.x < 0 || t.y < 0 || t.x + t.w > e.width || t.y + t.h > e.height) throw Error("裁切範圍超出影像");
	let n = new Uint8ClampedArray(t.w * t.h * 4);
	for (let r = 0; r < t.h; r++) {
		let i = ((t.y + r) * e.width + t.x) * 4;
		n.set(e.data.subarray(i, i + t.w * 4), r * t.w * 4);
	}
	return {
		width: t.w,
		height: t.h,
		data: n
	};
}
//#endregion
//#region src/xdwread/canvas.ts
function nt(e, t, n) {
	let r = e.createElement("canvas");
	return r.width = t, r.height = n, r;
}
var rt = (e) => {
	e.width = 0, e.height = 0;
};
async function it(e, t) {
	let n = nt(e, t.width, t.height);
	try {
		let e = n.getContext("2d");
		return e ? (e.putImageData(new ImageData(t.data, t.width, t.height), 0, 0), await new Promise((e) => n.toBlob((t) => e(t), "image/png"))) : null;
	} finally {
		rt(n);
	}
}
function at(e) {
	return new Promise((t) => {
		try {
			e.toBlob((e) => t(e), "image/png");
		} catch {
			t(null);
		}
	});
}
async function ot(e, t) {
	let n = await createImageBitmap(t, {
		colorSpaceConversion: "none",
		premultiplyAlpha: "none"
	}), r = nt(e, n.width, n.height);
	try {
		let e = r.getContext("2d", { willReadFrequently: !0 });
		if (!e) throw Error("畫布無法使用");
		e.drawImage(n, 0, 0);
		let t = e.getImageData(0, 0, n.width, n.height);
		return {
			width: t.width,
			height: t.height,
			data: t.data
		};
	} finally {
		n.close(), rt(r);
	}
}
function st(e) {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
}
async function ct(e, t) {
	let n = await it(e, t);
	if (!n || n.size <= 0) throw Error("PNG 編碼失敗");
	return st(new Uint8Array(await n.arrayBuffer()));
}
async function lt(e) {
	let t = globalThis.crypto?.subtle;
	if (!t) throw Error("這個瀏覽器不能計算 SHA-256");
	let n = new Uint8Array(await t.digest("SHA-256", e));
	return Array.from(n, (e) => e.toString(16).padStart(2, "0")).join("");
}
//#endregion
//#region src/claude/config.ts
var ut = "https://api.anthropic.com/v1/messages", dt = "2023-06-01", ft = ["claude-sonnet-5-5", "claude-haiku-5-5"], pt = "edc_claude_api_key", mt = 3e4, ht = "請只回覆：OK", M = {
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
//#region src/claude/api.ts
function gt(e, t) {
	return {
		url: ut,
		init: {
			method: "POST",
			headers: {
				"x-api-key": e,
				"anthropic-version": dt,
				"content-type": "application/json",
				"anthropic-dangerous-direct-browser-access": "true"
			},
			body: JSON.stringify({
				model: t,
				max_tokens: 8,
				messages: [{
					role: "user",
					content: ht
				}]
			})
		}
	};
}
var _t = "（已遮蔽）";
function N(e, t) {
	let n = typeof e == "string" ? e : e == null ? "" : String(e);
	return t && (n = n.split(t).join(_t)), n = n.replace(/sk-ant-[^\s"'<>，。；）)]*/g, _t), n = n.replace(/\s+/g, " ").trim(), n.length > 300 ? n.slice(0, 300) + "…" : n;
}
function vt(e) {
	return e === 401 ? "金鑰無效或已刪除" : e === 403 ? "這把金鑰沒有權限" : e === 404 ? "找不到這個模型" : e === 429 ? "請求太頻繁，或已達每月上限" : e >= 500 ? "Anthropic 服務暫時有問題" : `請求被拒（HTTP ${e}）`;
}
var yt = "連不到 api.anthropic.com（可能被公司網路擋住）", bt = "30 秒內沒有回應，請稍後再試", xt = "回應格式不對（收到 HTTP 200，但內容不是預期的格式）", St = () => ({
	fetch: (e, t) => globalThis.fetch(e, t),
	setTimeout: (e, t) => globalThis.setTimeout(e, t),
	clearTimeout: (e) => globalThis.clearTimeout(e)
}), Ct = (e, t, n) => ({
	model: e,
	ok: !0,
	text: `${e}：✅ 成功（回傳模型 ${t}，用了 ${n} 個 token）`
}), wt = (e, t, n = "") => ({
	model: e,
	ok: !1,
	text: `${e}：❌ ${t}${n ? `（${n}）` : ""}`
});
async function Tt(e, t, n = St()) {
	let r = new AbortController(), i = !1, a = n.setTimeout(() => {
		i = !0, r.abort();
	}, mt);
	try {
		let a;
		try {
			let { url: i, init: o } = gt(e, t);
			a = await n.fetch(i, {
				...o,
				signal: r.signal,
				credentials: "omit",
				referrerPolicy: "no-referrer",
				cache: "no-store"
			});
		} catch {
			return wt(t, i ? bt : yt);
		}
		let o = null, s = !1;
		try {
			o = await a.json(), s = !0;
		} catch {
			if (i) return wt(t, bt);
		}
		let c = o && typeof o == "object" ? o : {};
		if (!a.ok) {
			let n = N(c.error?.type, e), r = N(c.error?.message, e);
			return wt(t, vt(a.status), [n, r].filter(Boolean).join("："));
		}
		let l = (e) => typeof e == "number" && Number.isFinite(e), u = c.usage?.input_tokens, d = c.usage?.output_tokens;
		return !s || !o || typeof o != "object" || Array.isArray(o) || typeof c.model != "string" || !c.model.trim() || !l(u) || !l(d) ? wt(t, xt) : Ct(t, N(c.model, e), u + d);
	} finally {
		n.clearTimeout(a);
	}
}
//#endregion
//#region src/claude/key.ts
function Et(e) {
	let t = String(e ?? "").trim();
	return !t.startsWith("sk-ant-") || /\s/.test(t) || t.length < 20 ? null : t;
}
function Dt(e) {
	return e.slice(-4);
}
var Ot = () => {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
};
function kt(e = Ot()) {
	try {
		return e?.getItem(pt) || null;
	} catch {
		return null;
	}
}
function At(e, t = Ot()) {
	try {
		return t ? (t.setItem(pt, e), t.getItem(pt) === e) : !1;
	} catch {
		return !1;
	}
}
function jt(e = Ot()) {
	try {
		e?.removeItem(pt);
	} catch {}
}
//#endregion
//#region src/claude/read.ts
var Mt = 4096, Nt = "120 秒內沒有回應", Pt = "回應格式不對（收到 HTTP 200，但內容不是預期的格式）", Ft = "已中止", It = /^[A-Za-z0-9._:-]{1,100}$/, Lt = /^[a-z_]{1,40}$/;
function Rt(e) {
	return {
		"x-api-key": e,
		"anthropic-version": dt,
		"content-type": "application/json",
		"anthropic-dangerous-direct-browser-access": "true"
	};
}
function zt(e, t, n) {
	if (!t.length) throw Error("沒有影像");
	let r = [...t.map((e) => ({
		type: "image",
		source: {
			type: "base64",
			media_type: "image/png",
			data: e.base64
		},
		transformations: { oversized_image: "error" }
	})), {
		type: "text",
		text: n
	}];
	return JSON.stringify({
		model: e,
		max_tokens: Mt,
		messages: [{
			role: "user",
			content: r
		}]
	});
}
var Bt = () => ({
	fetch: (e, t) => globalThis.fetch(e, t),
	setTimeout: (e, t) => globalThis.setTimeout(e, t),
	clearTimeout: (e) => globalThis.clearTimeout(e)
});
function Vt(e) {
	if (e == null) return null;
	let t = e.trim();
	return /^\d+(?:\.\d+)?$/.test(t) ? Math.round(Number(t) * 1e3) : null;
}
var Ht = (e) => typeof e == "number" && Number.isInteger(e) && e >= 0;
function Ut(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return null;
	let t = e;
	if (typeof t.model != "string" || !It.test(t.model) || !t.usage || typeof t.usage != "object" || !Ht(t.usage.input_tokens) || !Ht(t.usage.output_tokens) || !Array.isArray(t.content) || !(t.stop_reason === null || t.stop_reason === void 0 || typeof t.stop_reason == "string" && Lt.test(t.stop_reason))) return null;
	let n = "";
	for (let e of t.content) {
		if (!e || typeof e != "object" || typeof e.type != "string") return null;
		if (e.type === "text") {
			let t = e.text;
			if (typeof t != "string") return null;
			n += t;
		}
	}
	return n.length > 2e5 ? null : {
		text: n,
		stopReason: t.stop_reason ?? null,
		appliedModel: t.model,
		usage: {
			input: t.usage.input_tokens,
			output: t.usage.output_tokens
		}
	};
}
async function Wt(e, t, n, r, i = {}, a = Bt()) {
	if (i.signal?.aborted) return {
		kind: "cancelled",
		message: Ft
	};
	let o = new AbortController(), s = !1, c = () => o.abort();
	i.signal?.addEventListener("abort", c, { once: !0 });
	let l = a.setTimeout(() => {
		s = !0, o.abort();
	}, i.timeoutMs ?? 12e4), u = () => s ? {
		kind: "timeout",
		message: Nt
	} : i.signal?.aborted ? {
		kind: "cancelled",
		message: Ft
	} : null;
	try {
		let i;
		try {
			i = await a.fetch(ut, {
				method: "POST",
				headers: Rt(e),
				body: zt(t, n, r),
				signal: o.signal,
				credentials: "omit",
				referrerPolicy: "no-referrer",
				cache: "no-store"
			});
		} catch {
			return u() ?? {
				kind: "network",
				message: "連不到 api.anthropic.com（網路中斷，或被公司網路擋住）"
			};
		}
		let s = null, c = !1;
		try {
			s = await i.json(), c = !0;
		} catch {
			let e = u();
			if (e) return e;
		}
		if (!i.ok) {
			let t = s && typeof s == "object" ? s : {}, n = [N(t.error?.type, e), N(t.error?.message, e)].filter(Boolean).join("：");
			return {
				kind: "http",
				status: i.status,
				message: N(n ? `${vt(i.status)}（${n}）` : vt(i.status), e),
				retryAfterMs: Vt(i.headers.get("retry-after"))
			};
		}
		let l = c ? Ut(s) : null;
		return l ? {
			kind: "ok",
			...l
		} : {
			kind: "format",
			message: Pt
		};
	} finally {
		a.clearTimeout(l), i.signal?.removeEventListener("abort", c);
	}
}
//#endregion
//#region src/xdwread/prompts/read-gw.txt?raw
var Gt = "你是「掃描報表讀值員」。{{IMAGE_INTRO}}\n\n這一頁是地下水檢測報告。圖上只會用到：右上方的「報告編號」、「採樣時間」，左方的「樣品名稱」，以及「檢驗結果」表格。圖上表格與這三格以外的內容一律不要抄（人名、簽章、單位名稱、地址、頁首頁尾等都不要抄，也不要寫進任何欄位）。\n\n工作規則（一定要遵守）：\n1. 只抄圖上「印刷」的字，原樣照抄成字串。不可四捨五入、不可換算單位、不可計算、不可猜、不可從常識或其他頁補值。保留印刷的小數位數（例如印 8.640 就寫 \"8.640\"）。\n2. 任何一格只要有一個字不確定，那一格就寫 \"UNREADABLE\"。\n3. 圖上那一格是空白，就寫 null。表上沒有 MDL 欄時，每一列的 mdl 都寫 null。\n4. 所有值都用字串或 null，不可以用數字型別（寫 \"97.31\"，不可寫 97.31）。\n5. 字元寫法（讓抄寫結果一致）：\n   - 微（micro）一律用希臘字母 μ；溫度單位用單一字元 ℃。\n   - 英文字母、數字、標點與符號（< . / : ~ 等）一律用半形。\n   - 印刷是一條橫線（不論長短）一律寫半形 \"-\"。\n   - 數字（檢測結果、MDL、報告編號）裡不要抄空白，例如印「6. 5」寫 \"6.5\"。\n   - 其他文字照印刷：字與字之間印刷上有空白才留一個半形空白，沒有就不要加。\n6. 不抄「管制值」欄、不抄「備註」欄的內容。\n\n要抄的內容：\n- report_no、sample_name、sample_time：三格各抄 {\"label\": 標籤原文, \"value\": 值原文}。標籤是格子左邊印的字（例如「報告編號」），值是標籤右邊的內容。\n- columns：「檢驗結果」表格表頭由左到右的全部欄名（包含不抄內容的「管制值」「備註」等欄），一欄一個字串。\n- rows：表格由上到下的每一列（不含表頭）：item（檢測項目）、unit（單位）、result（檢測結果）、mdl（MDL 欄；表上沒有這欄就寫 null）、method（檢驗方法）。印 \"ND\" 就寫 \"ND\"，印 \"<0.0007\" 就寫 \"<0.0007\"。\n\n只輸出一個 JSON，不要有任何其他文字、說明或 markdown。鍵名固定，不要增加或減少任何鍵。格式如下（下面全是假的示範內容，不是這一頁的值）：\n{\n  \"report_no\": {\"label\": \"報告編號\", \"value\": \"XY999Z0000\"},\n  \"sample_name\": {\"label\": \"樣品名稱\", \"value\": \"示範測站\"},\n  \"sample_time\": {\"label\": \"採樣時間\", \"value\": \"100.01.01 08:00~ 08:30\"},\n  \"columns\": [\"檢測項目\", \"單位\", \"檢測結果\", \"MDL\", \"檢驗方法\"],\n  \"rows\": [\n    {\"item\": \"示範項目\", \"unit\": \"mg/L\", \"result\": \"98.76\", \"mdl\": \"0.0009\", \"method\": \"NIEA X000.00X\"},\n    {\"item\": \"示範項目二\", \"unit\": \"-\", \"result\": \"ND\", \"mdl\": null, \"method\": \"-\"}\n  ]\n}\n", Kt = "\n\n上一次的回覆不是只有一個 JSON。這次只輸出 JSON，第一個字元必須是 {，最後一個字元必須是 }。", qt = "\n\n上一次的回覆結構不對。這次只輸出上面指定結構的一個 JSON：不要增加或減少任何鍵，所有值都用字串或 null（不可用數字型別）。";
function Jt(e, t = null) {
	if (!Number.isInteger(e) || e < 1) throw Error("影像張數無效");
	let n = e === 1 ? "這次給你 1 張圖，是同一頁報告的內容。" : `這次給你 ${e} 張圖，是同一頁報告由上到下切成的 ${e} 條水平帶（相鄰兩條有部分重疊，重疊處是同一段內容，不要重複抄）。請把它們當成一整頁來讀。`, r = Gt.replaceAll("{{IMAGE_INTRO}}", n);
	return t === "json" ? r + Kt : t === "shape" ? r + qt : r;
}
//#endregion
//#region src/xdwread/schema.ts
var Yt = [
	"report_no",
	"sample_name",
	"sample_time"
], Xt = [
	...Yt,
	"columns",
	"rows"
], Zt = ["label", "value"], Qt = [
	"item",
	"unit",
	"result",
	"mdl",
	"method"
];
function $t(e) {
	return e === "not_json" || e === "extra_text" ? "json" : e === "shape" ? "shape" : null;
}
var en = /^\s*```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```\s*$/, tn = (e) => !!e && typeof e == "object" && !Array.isArray(e), nn = (e) => e === null || typeof e == "string";
function rn(e, t, n) {
	let r = Object.keys(e).filter((e) => !t.includes(e));
	if (r.length) return `${n}多了不該有的鍵（${r.length} 個）`;
	let i = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t));
	return i.length ? `${n}缺少鍵：${i.join("、")}` : null;
}
function an(e) {
	if (!tn(e)) return {
		ok: !1,
		detail: "最外層不是 JSON 物件"
	};
	let t = rn(e, Xt, "最外層");
	if (t) return {
		ok: !1,
		detail: t
	};
	for (let t of Yt) {
		let n = e[t];
		if (!tn(n)) return {
			ok: !1,
			detail: `${t} 不是物件`
		};
		let r = rn(n, Zt, `${t} `);
		if (r) return {
			ok: !1,
			detail: r
		};
		if (!nn(n.label) || !nn(n.value)) return {
			ok: !1,
			detail: `${t} 的 label／value 要是字串或 null`
		};
	}
	if (!Array.isArray(e.columns)) return {
		ok: !1,
		detail: "columns 不是陣列"
	};
	if (!e.columns.every(nn)) return {
		ok: !1,
		detail: "columns 裡要全是字串或 null"
	};
	if (!Array.isArray(e.rows)) return {
		ok: !1,
		detail: "rows 不是陣列"
	};
	for (let t = 0; t < e.rows.length; t++) {
		let n = e.rows[t];
		if (!tn(n)) return {
			ok: !1,
			detail: `rows 第 ${t + 1} 列不是物件`
		};
		let r = rn(n, Qt, `rows 第 ${t + 1} 列`);
		if (r) return {
			ok: !1,
			detail: r
		};
		for (let e of Qt) if (!nn(n[e])) return {
			ok: !1,
			detail: `rows 第 ${t + 1} 列的 ${e} 要是字串或 null`
		};
	}
	let n = (e) => ({
		label: e.label,
		value: e.value
	});
	return {
		ok: !0,
		reply: {
			report_no: n(e.report_no),
			sample_name: n(e.sample_name),
			sample_time: n(e.sample_time),
			columns: [...e.columns],
			rows: e.rows.map((e) => ({
				item: e.item,
				unit: e.unit,
				result: e.result,
				mdl: e.mdl,
				method: e.method
			}))
		}
	};
}
function on(e) {
	try {
		return {
			ok: !0,
			value: JSON.parse(e)
		};
	} catch {
		return { ok: !1 };
	}
}
function sn(e) {
	if (typeof e != "string" || e.trim() === "") return {
		ok: !1,
		kind: "empty",
		detail: "回覆是空的"
	};
	let t = e, n = !1, r = en.exec(e);
	r && (t = r[1], n = !0);
	let i = on(t.trim());
	if (i.ok) {
		let e = an(i.value);
		return e.ok ? {
			ok: !0,
			reply: e.reply,
			fenced: n
		} : {
			ok: !1,
			kind: "shape",
			detail: e.detail
		};
	}
	let a = e.indexOf("{"), o = e.lastIndexOf("}");
	return a >= 0 && o > a && on(e.slice(a, o + 1)).ok ? {
		ok: !1,
		kind: "extra_text",
		detail: "JSON 前後多了其他文字"
	} : {
		ok: !1,
		kind: "not_json",
		detail: "回覆不是 JSON（可能被截斷）"
	};
}
//#endregion
//#region src/xdwread/template-gw.ts
var cn = {
	A: [
		"水位",
		"水溫",
		"氫離子濃度指數",
		"溶氧量",
		"生化需氧量",
		"硝酸鹽",
		"導電度",
		"硫化氫"
	],
	B: [
		"硫酸鹽",
		"氨氮",
		"總溶解固體物",
		"總有機碳",
		"氯鹽",
		"鎘",
		"鉛",
		"鉻",
		"銅",
		"鋅",
		"鐵",
		"錳",
		"砷",
		"汞"
	]
}, ln = {
	A: cn.A.length,
	B: cn.B.length
}, un = {
	A: [
		"檢測項目",
		"單位",
		"檢測結果",
		"檢驗方法",
		"備註"
	],
	B: [
		"檢測項目",
		"單位",
		"檢測結果",
		"管制值",
		"MDL",
		"檢驗方法",
		"備註"
	]
}, dn = {
	report_no: "報告編號",
	sample_name: "樣品名稱",
	sample_time: "採樣時間"
}, fn = /^[A-Z]{2}\d{3}[A-Z]\d{4}N?$/, pn = {
	氫離子濃度指數: "pH",
	溶氧量: "溶氧"
}, mn = [{
	item: "導電度",
	from: "μmho/cm25°C",
	to: "μmho/cm"
}], hn = "這一站只讀到 1 頁（另一頁沒有讀成功或沒送）", gn = [
	"-",
	"－",
	"—",
	"–"
], P = (e) => e.replace(/\s+/gu, ""), F = (e) => e.normalize("NFKC").replace(/\s+/gu, ""), _n = (e) => e !== null && gn.includes(P(e)), vn = (e) => e !== null && P(e) === "UNREADABLE", yn = /^(?:ND|<\d+(?:\.\d+)?|\d+(?:\.\d+)?)$/, bn = /^\d+(?:\.\d+)?$/, xn = /^NIEA [A-Z]\d{3}\.\d{2}[A-Z]$/, Sn = /^\s*(\d{3})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})(?:\s*~\s*(\d{2}):(\d{2}))?\s*$/u;
function Cn(e) {
	if (e === null) return null;
	let t = Sn.exec(e);
	if (!t) return null;
	let [n, r, i, a, o] = t.slice(1, 6).map(Number);
	if (n < 1 || r < 1 || r > 12 || i < 1 || i > new Date(Date.UTC(n + 1911, r, 0)).getUTCDate() || a > 23 || o > 59) return null;
	if (t[6] !== void 0) {
		let e = Number(t[6]), n = Number(t[7]);
		if (e > 23 || n > 59 || e * 60 + n < a * 60 + o) return null;
	}
	return {
		rocYear: n,
		month: r,
		day: i,
		hour: a,
		minute: o
	};
}
var wn = (e, t) => e.rocYear === t.rocYear && Math.ceil(e.month / 3) === t.quarter, I = (e) => ({
	ok: !1,
	reason: e
});
function Tn(e, t, n, r) {
	if (vn(t) || vn(n)) return I(`${e}有一次讀不清楚（UNREADABLE）`);
	if (t !== null && P(t) === "" || n !== null && P(n) === "") return I(`${e}讀到空字串`);
	let i = t === null, a = n === null, o = _n(t), s = _n(n);
	if (i || a || o || s) return r ? i && a || o && s ? {
		ok: !0,
		out: ""
	} : I(`${e}兩次讀值不同（一次空白或破折號、一次不同）`) : I(i && a ? `${e}是空白` : o && s ? `${e}是破折號（沒有值）` : `${e}兩次讀值不同（空白／破折號）`);
}
function En(e, t, n, r, i) {
	let a = Tn(e, t, n, i);
	if (a) return a;
	let o = P(t);
	return o === P(n) ? r.test(o) ? {
		ok: !0,
		out: o
	} : I(`${e}的寫法不在允許清單內`) : I(`${e}兩次讀值不同`);
}
function Dn(e, t, n, r, i) {
	return Tn(e, t, n, r) || (F(t) === F(n) ? i && !i.test(t) ? I(`${e}的寫法不在允許清單內`) : {
		ok: !0,
		out: t
	} : I(`${e}兩次讀值不同`));
}
function On(e, t) {
	return t === null ? `${e} 讀法沒有回覆` : t.ok ? null : `${e} 讀法沒有可用的回覆（${t.detail}）`;
}
function kn(e, t) {
	let n = e.a.columns.length, r = e.b.columns.length, i = null;
	if (n === 5 && r === 5 ? i = "A" : n === 7 && r === 7 ? i = "B" : t.push(n === r ? `表格欄數 ${n} 不是版型的 5 欄或 7 欄` : `A、B 讀到的表格欄數不同（${n}／${r}）`), !i) return null;
	let a = un[i];
	for (let [n, r] of [["A", e.a], ["B", e.b]]) r.columns.forEach((e, r) => {
		(e === null || F(e) !== F(a[r])) && t.push(`${n} 讀法的表頭第 ${r + 1} 欄欄名不符（應為「${a[r]}」）`);
	});
	return i;
}
var An = (e) => e === null ? null : F(e).replace(/:/g, "");
function jn(e, t, n, r) {
	for (let e of Yt) for (let [n, i] of [["A", t.a], ["B", t.b]]) An(i[e].label) !== dn[e] && r.push(`${n} 讀法的「${dn[e]}」標籤不符`);
	let i = En("報告編號", t.a.report_no.value, t.b.report_no.value, fn, !1);
	i.ok ? e && i.out.endsWith("N") !== (e === "A") && r.push(e === "A" ? "報告編號結尾沒有 N，與 5 欄表格（A 型）不符" : "報告編號結尾有 N，與 7 欄表格（B 型）不符") : r.push(i.reason);
	let a = Dn("樣品名稱", t.a.sample_name.value, t.b.sample_name.value, !1);
	a.ok || r.push(a.reason);
	let o = t.a.sample_time.value, s = t.b.sample_time.value, c = null, l = Tn("採樣時間", o, s, !1);
	return l ? r.push(l.reason) : P(o) === P(s) ? (c = Cn(o)) ? wn(c, n) || r.push(`採樣日期不在選的期別內（${n.rocYear} 年第 ${n.quarter} 季）`) : r.push("採樣時間的寫法無法解析（要像「年.月.日 時:分~時:分」，日期要存在）") : r.push("採樣時間兩次讀值不同"), !i.ok || !a.ok || !c || r.length ? null : {
		reportNo: i.out,
		sampleName: a.out,
		sampleTime: o,
		date: c
	};
}
function Mn(e, t, n, r) {
	let i = cn[e][t], a = [], o = Dn("項目名稱", n.item, r.item, !1);
	o.ok ? F(o.out) !== F(i) && a.push(`項目名稱與版型預期「${i}」不符`) : a.push(o.reason);
	let s = En("檢測結果", n.result, r.result, yn, !1);
	s.ok || a.push(s.reason);
	let c;
	c = e === "A" ? n.mdl === null && r.mdl === null ? {
		ok: !0,
		out: ""
	} : I("5 欄表格沒有 MDL 欄，卻讀到 MDL 內容") : En("MDL", n.mdl, r.mdl, bn, !0), c.ok || a.push(c.reason);
	let l = Dn("單位", n.unit, r.unit, !0);
	l.ok || a.push(l.reason);
	let u = Dn("檢驗方法", n.method, r.method, !0, xn);
	return u.ok || a.push(u.reason), a.length || !o.ok || !s.ok || !c.ok || !l.ok || !u.ok ? {
		index: t,
		expected: i,
		status: "manual",
		reasons: a,
		a: n,
		b: r,
		out: null
	} : {
		index: t,
		expected: i,
		status: "pass",
		reasons: [],
		a: n,
		b: r,
		out: {
			item: o.out,
			unit: l.out,
			result: s.out,
			mdl: c.out,
			method: u.out
		}
	};
}
function Nn(e, t, n, r) {
	let i = Math.max(t?.rows.length ?? 0, n?.rows.length ?? 0, e ? ln[e] : 0);
	return Array.from({ length: i }, (i, a) => ({
		index: a,
		expected: e ? cn[e][a] ?? "" : "",
		status: "manual",
		reasons: [r],
		a: t?.rows[a] ?? null,
		b: n?.rows[a] ?? null,
		out: null
	}));
}
function Pn(e, t, n) {
	let r = (e, t) => e !== null && t !== null && !vn(e) && !_n(e) && F(e) !== "" && F(e) === F(t) ? F(e) : null, i = (e, t) => e !== null && t !== null && !vn(e) && P(e) !== "" && P(e) === P(t) ? P(e) : null, a = r(n.a.sample_name.value, n.b.sample_name.value);
	return a ? {
		idx: e,
		name: a,
		type: t,
		time: i(n.a.sample_time.value, n.b.sample_time.value),
		report: i(n.a.report_no.value, n.b.report_no.value)
	} : null;
}
var Fn = (e, t) => e.endsWith("N") !== t.endsWith("N") && e.replace(/N$/, "") === t.replace(/N$/, "");
function In(e) {
	let t = [], n = [], r = [];
	e.pages.forEach((i, a) => {
		let o = {
			page: i.page,
			mode: i.mode,
			tableType: null,
			status: "manual",
			reasons: [],
			warnings: [],
			identity: null,
			rows: []
		};
		if (n.push(null), i.mode === "skip") {
			t.push({
				...o,
				status: "skip",
				reasons: ["這頁沒有送出（需人工輸入）"]
			});
			return;
		}
		let s = On("A", i.a), c = On("B", i.b);
		if (s || c) {
			let e = [s, c].filter((e) => !!e), n = i.a?.ok ? i.a.reply : null, r = i.b?.ok ? i.b.reply : null;
			t.push({
				...o,
				tableType: null,
				reasons: e,
				rows: Nn(null, n, r, "整頁需人工：" + e[0])
			});
			return;
		}
		let l = {
			a: i.a.reply,
			b: i.b.reply
		};
		n[a] = l;
		let u = [], d = kn(l, u);
		d && (l.a.rows.length !== ln[d] || l.b.rows.length !== ln[d]) && u.push(`表格列數不對（版型 ${ln[d]} 列，A 讀 ${l.a.rows.length}、B 讀 ${l.b.rows.length}）`);
		let f = jn(d, l, e.period, u), p = Pn(a, d, l);
		p && r.push(p), t.push({
			...o,
			tableType: d,
			status: u.length ? "manual" : "ok",
			reasons: u,
			identity: u.length ? null : f
		});
	});
	let i = /* @__PURE__ */ new Map();
	for (let e of r) i.set(e.name, [...i.get(e.name) ?? [], e]);
	for (let e of i.values()) {
		let n = [];
		if (e.length > 2) n.push(`同一個樣品名稱出現 ${e.length} 頁`);
		else if (e.length === 2) {
			let [t, r] = e;
			t.type && r.type && t.type === r.type && n.push("同一個樣品名稱出現兩頁相同型式的表格"), t.time && r.time && t.time !== r.time && n.push("同一站兩頁的採樣時間不同"), t.report && r.report && !Fn(t.report, r.report) && n.push("同一站兩頁的報告編號不是只差結尾 N");
		}
		if (n.length) {
			for (let r of e) t[r.idx].reasons.push(...n.map((e) => `站層級：${e}`));
			for (let n of e) t[n.idx].status = "manual", t[n.idx].identity = null;
			continue;
		}
		if (e.length === 1) {
			t[e[0].idx].warnings.push(hn);
			continue;
		}
		for (let [n, r] of [[e[0], e[1]], [e[1], e[0]]]) t[r.idx].status === "manual" && t[n.idx].warnings.push(r.time && r.report && r.type ? "同站另一頁需人工" : "同站另一頁需人工，無法交叉確認");
	}
	t.forEach((e, t) => {
		if (e.status === "skip" || e.rows.length) return;
		let r = n[t];
		if (!r) return;
		if (e.status === "manual") {
			e.rows = Nn(e.tableType, r.a, r.b, "整頁需人工：" + e.reasons[0]);
			return;
		}
		let i = e.tableType;
		e.rows = r.a.rows.map((e, t) => Mn(i, t, e, r.b.rows[t]));
	});
	let a = {
		pass: 0,
		manual: 0,
		pagesOk: 0,
		pagesManual: 0,
		pagesSkipped: 0
	};
	for (let e of t) {
		e.status === "skip" ? a.pagesSkipped++ : e.status === "ok" ? a.pagesOk++ : a.pagesManual++;
		for (let t of e.rows) t.status === "pass" ? a.pass++ : a.manual++;
	}
	return {
		pages: t,
		totals: a
	};
}
//#endregion
//#region src/xdwread/readlog.ts
var Ln = "edc-xdw-readlog", Rn = [
	"rate_limited",
	"upstream_error",
	"auth",
	"bad_request",
	"timeout",
	"network",
	"refused",
	"empty",
	"truncated",
	"format",
	"cancelled",
	"secret_like"
], zn = /sk-ant-/i, Bn = /^[0-9a-f]{64}$/, Vn = /^[A-Za-z0-9._:-]{1,100}$/, Hn = /^[a-z_]{1,40}$/, Un = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
function Wn(e) {
	return typeof e == "string" ? zn.test(e) : Array.isArray(e) ? e.some(Wn) : e && typeof e == "object" ? Object.entries(e).some(([e, t]) => zn.test(e) || Wn(t)) : !1;
}
var Gn = (e) => !!e && typeof e == "object" && !Array.isArray(e), L = (e, t = 0) => typeof e == "number" && Number.isInteger(e) && e >= t, Kn = (e) => typeof e == "number" && Number.isFinite(e), R = (e, t = 1e6) => typeof e == "string" && e.length <= t;
function qn(e, t, n) {
	let r = Object.keys(e), i = r.filter((e) => !t.includes(e)), a = t.filter((e) => !r.includes(e));
	if (i.length || a.length) throw Error(`${n}的欄位不對`);
}
function z(e, t) {
	if (!e) throw Error(t);
}
function Jn(e, t) {
	let n = `第 ${t + 1} 頁紀錄`;
	z(Gn(e), `${n}不是物件`), qn(e, [
		"page",
		"mode",
		"image",
		"reason"
	], n), z(L(e.page, 1), `${n}的頁碼不對`), z(e.mode === "whole" || e.mode === "skip", `${n}的送出方式不對`), z(R(e.reason, 2e3), `${n}的原因不對`), z(e.mode === "skip" == e.reason.length > 0, `${n}：沒送的頁一定要有原因、送出的頁不可有原因`), e.image !== null && (z(Gn(e.image), `${n}的影像尺寸不對`), qn(e.image, ["w", "h"], `${n}的影像尺寸`), z(L(e.image.w, 1) && L(e.image.h, 1), `${n}的影像尺寸不對`)), z(e.mode === "skip" == (e.image === null), `${n}：沒送的頁不可有影像尺寸、送出的頁一定要有`);
}
function Yn(e, t) {
	let n = `第 ${t + 1} 筆呼叫紀錄`;
	z(Gn(e), `${n}不是物件`), qn(e, [
		"page",
		"scheme",
		"attempt",
		"requestedModel",
		"appliedModel",
		"replyText",
		"stopReason",
		"usage",
		"ms",
		"error"
	], n), z(L(e.page, 1) && (e.scheme === "A" || e.scheme === "B") && L(e.attempt, 1), `${n}的頁碼／讀法／次數不對`), z(R(e.requestedModel) && Vn.test(e.requestedModel), `${n}的模型名稱不對`), z(e.appliedModel === null || R(e.appliedModel) && Vn.test(e.appliedModel), `${n}的實際模型不對`), z(e.replyText === null || R(e.replyText, 2e5), `${n}的回覆不對`), z(e.stopReason === null || R(e.stopReason) && Hn.test(e.stopReason), `${n}的停止原因不對`), e.usage !== null && (z(Gn(e.usage), `${n}的用量不對`), qn(e.usage, ["input", "output"], `${n}的用量`), z(L(e.usage.input) && L(e.usage.output), `${n}的用量不對`)), z(Kn(e.ms) && e.ms >= 0, `${n}的耗時不對`), e.error !== null && (z(Gn(e.error), `${n}的錯誤不對`), qn(e.error, [
		"kind",
		"status",
		"message"
	], `${n}的錯誤`), z(Rn.includes(e.error.kind) && (e.error.status === null || L(e.error.status, 100)) && R(e.error.message, 301), `${n}的錯誤型別不對`));
}
function Xn(e) {
	z(Gn(e), "讀值紀錄不是 JSON 物件"), qn(e, [
		"kind",
		"version",
		"fileName",
		"xdwSha256",
		"createdAt",
		"period",
		"category",
		"agency",
		"pages",
		"calls"
	], "讀值紀錄"), z(e.kind === Ln, "這不是讀值紀錄檔"), z(e.version === 2, "讀值紀錄版本不符（這一版只讀第 2 版）"), z(R(e.fileName, 500) && e.fileName.length > 0, "讀值紀錄的檔名不對"), z(R(e.xdwSha256) && Bn.test(e.xdwSha256), "讀值紀錄的 SHA-256 格式不對"), z(R(e.createdAt) && Un.test(e.createdAt), "讀值紀錄的時間格式不對"), z(Gn(e.period), "讀值紀錄的期別不對"), qn(e.period, ["rocYear", "quarter"], "讀值紀錄的期別"), z(L(e.period.rocYear, 1) && L(e.period.quarter, 1) && e.period.quarter <= 4, "讀值紀錄的期別不對"), z(R(e.category, 200), "讀值紀錄的類別不對"), z(Gn(e.agency), "讀值紀錄的機構不對"), qn(e.agency, ["code", "name"], "讀值紀錄的機構"), z(R(e.agency.code, 50) && R(e.agency.name, 200), "讀值紀錄的機構不對"), z(Array.isArray(e.pages) && Array.isArray(e.calls), "讀值紀錄的頁或呼叫不是陣列"), e.pages.forEach(Jn), e.calls.forEach(Yn);
	let t = e.pages.map((e) => e.page);
	z(new Set(t).size === t.length, "讀值紀錄有重複的頁碼");
	for (let t of e.calls) {
		let n = e.pages.find((e) => e.page === t.page);
		z(!!n && n.mode !== "skip", "讀值紀錄有沒送的頁卻有呼叫紀錄");
	}
	z(!Wn(e), "讀值紀錄裡有疑似金鑰的字串，拒絕");
}
function Zn(e) {
	return Xn(e), JSON.stringify(e, null, 2);
}
function Qn(e) {
	let t;
	try {
		t = JSON.parse(e);
	} catch {
		return {
			ok: !1,
			reason: "讀值紀錄不是 JSON"
		};
	}
	try {
		Xn(t);
	} catch (e) {
		return {
			ok: !1,
			reason: e.message
		};
	}
	return {
		ok: !0,
		log: t
	};
}
function $n(e, t) {
	return Bn.test(t) ? e.xdwSha256 === t ? null : "這份讀值紀錄不是這個 XDW 檔的（SHA-256 不同），拒絕載入" : "目前檔案的 SHA-256 格式不對";
}
function er(e, t, n) {
	let r = null;
	for (let i of e) i.page === t && i.scheme === n && (!r || i.attempt >= r.attempt) && (r = i);
	return r ? r.error ? {
		ok: !1,
		kind: "call",
		detail: r.error.message || r.error.kind
	} : r.stopReason === "max_tokens" ? {
		ok: !1,
		kind: "call",
		detail: "回覆被截斷"
	} : r.stopReason === "refusal" ? {
		ok: !1,
		kind: "call",
		detail: "模型拒絕回答"
	} : r.replyText === null ? {
		ok: !1,
		kind: "call",
		detail: "沒有回覆"
	} : sn(r.replyText) : null;
}
function tr(e) {
	return {
		period: { ...e.period },
		pages: e.pages.map((t) => ({
			page: t.page,
			mode: t.mode,
			a: t.mode === "skip" ? null : er(e.calls, t.page, "A"),
			b: t.mode === "skip" ? null : er(e.calls, t.page, "B")
		}))
	};
}
var nr = (e) => In(tr(e));
function rr(e) {
	let t = {
		A: {
			input: 0,
			output: 0
		},
		B: {
			input: 0,
			output: 0
		}
	};
	for (let n of e) n.usage && (t[n.scheme].input += n.usage.input, t[n.scheme].output += n.usage.output);
	return t;
}
function ir(e) {
	return {
		kind: Ln,
		version: 2,
		fileName: e.fileName,
		xdwSha256: e.xdwSha256,
		createdAt: e.createdAt,
		period: { ...e.period },
		category: e.category,
		agency: { ...e.agency },
		pages: e.pages,
		calls: []
	};
}
//#endregion
//#region src/xdwread/reader.ts
var ar = ft[0], or = ft[1], sr = 12e4, cr = 5e3, lr = "（回覆含疑似金鑰的字串，原文不保存）", ur = {
	noKey: "沒有 Claude 金鑰（尚未設定，或讀值途中被移除），已停止讀值。",
	rateLimited: "Claude 一直回覆「太頻繁或已達每月上限」，同一頁重試 3 次仍不行，已停止讀值。請過一段時間再重新選檔讀值。",
	auth: (e) => `${e}，已停止讀值。`,
	cancelled: "已中止讀值。",
	imageFail: (e) => `送出圖做不出來：${e}`
}, dr = (e) => ({
	...Bt(),
	now: () => Date.now(),
	sleep: (e, t) => new Promise((n) => {
		if (t.aborted) {
			n();
			return;
		}
		let r = setTimeout(i, e);
		function i() {
			clearTimeout(r), t.removeEventListener("abort", i), n();
		}
		t.addEventListener("abort", i, { once: !0 });
	}),
	readKey: () => kt(),
	...e
}), fr = class extends Error {
	text;
	why;
	constructor(e, t) {
		super(e), this.text = e, this.why = t;
	}
};
async function pr(e, t, n) {
	if (!e.image || !e.box) throw Error("沒有送出圖");
	let r = await n.decode(e.image);
	if (r.width !== e.box.w || r.height !== e.box.h) throw Error(`送出圖尺寸 ${r.width}×${r.height} 與預覽 ${e.box.w}×${e.box.h} 不同`);
	let i = et(r.width, r.height);
	if (!i.ok) throw Error(i.reason);
	let a = t === "A" ? i.A : i.B, o = [];
	for (let e of a) o.push({ base64: await n.encode(tt(r, e)) });
	return o;
}
async function mr(e, t) {
	let n = e.pages.filter((e) => e.mode !== "skip");
	for (let e of n) if (!(e.image instanceof Blob) || !e.box) throw Error(`第 ${e.page} 頁要送出卻沒有送出圖`);
	let r = e.pages.map((e) => ({
		page: e.page,
		mode: e.mode,
		image: e.mode === "skip" || !e.box ? null : {
			w: e.box.w,
			h: e.box.h
		},
		reason: e.reason
	})), i = ir({
		fileName: e.fileName,
		xdwSha256: e.xdwSha256,
		createdAt: t.isoNow?.() ?? new Date(t.now()).toISOString(),
		period: e.period,
		category: e.category,
		agency: e.agency,
		pages: r
	}), a = [], o = new AbortController(), s = () => {
		c ||= new fr(ur.cancelled, "cancelled"), o.abort();
	}, c = null;
	e.signal?.aborted && s(), e.signal?.addEventListener("abort", s, { once: !0 });
	let l = (e) => {
		c ||= e, o.abort();
	}, u = "A", d = 0, f = 0, p = 0, m = 0, h = 0, g = null, _ = (n) => {
		n !== void 0 && (g = n);
		let r = t.now();
		try {
			e.onProgress?.({
				scheme: u,
				done: d,
				total: f,
				calls: p,
				inFlight: m,
				pausedUntil: h > r ? h : null,
				remainingMs: Math.max(0, h - r),
				usage: rr(i.calls),
				note: g
			});
		} catch {}
	}, v = async (e, n) => {
		let r = n === "A" ? ar : or, s;
		try {
			s = await pr(e, n, t);
		} catch (t) {
			a.push({
				page: e.page,
				scheme: n,
				text: ur.imageFail(t?.message || "未知錯誤")
			});
			return;
		}
		let c = 0, u = 0, d = !1, f = null, v = !1, y = 0;
		for (;;) {
			for (; !o.signal.aborted && h > t.now();) await t.sleep(h - t.now(), o.signal);
			if (o.signal.aborted) return;
			let a = t.readKey();
			if (!a) {
				l(new fr(ur.noKey, "stopped"));
				return;
			}
			c++, p++, m++, _();
			let b = t.now(), x;
			try {
				x = await Wt(a, r, s, Jt(s.length, f), {
					signal: o.signal,
					timeoutMs: t.timeoutMs ?? 12e4
				}, t);
			} catch (e) {
				x = {
					kind: "network",
					message: N(e?.message, a)
				};
			} finally {
				m--;
			}
			let S = Math.max(0, t.now() - b), C = {
				page: e.page,
				scheme: n,
				attempt: c,
				requestedModel: r,
				appliedModel: null,
				replyText: null,
				stopReason: null,
				usage: null,
				ms: S,
				error: null
			}, w = (e, t, n = null) => {
				C.error = {
					kind: e,
					status: n,
					message: N(t, a)
				};
			}, T = "end", E = 0;
			if (x.kind === "ok") if (C.appliedModel = x.appliedModel, C.stopReason = x.stopReason, C.usage = { ...x.usage }, zn.test(x.text)) C.replyText = lr, w("secret_like", "回覆含疑似金鑰的字串，這次回覆作廢");
			else if (C.replyText = x.text, x.stopReason === "refusal") w("refused", "模型拒絕回答");
			else if (x.stopReason === "max_tokens") w("truncated", "回覆被截斷"), v || (v = !0, f = "json", T = "retry");
			else {
				let e = sn(x.text);
				if (!e.ok) if (e.kind === "empty") w("empty", "回覆是空的");
				else {
					let t = $t(e.kind);
					t && !v && (v = !0, f = t, T = "retry");
				}
			}
			else if (x.kind === "http") {
				let e = x.status;
				if (e === 429) {
					if (w("rate_limited", x.message, e), u >= 3) {
						i.calls.push(C), _(), l(new fr(ur.rateLimited, "stopped"));
						return;
					}
					u++;
					let n = Math.min(x.retryAfterMs ?? 6e4, sr);
					h = Math.max(h, t.now() + n), T = "retry", g = `Claude 回覆太頻繁，暫停約 ${Math.ceil(n / 1e3)} 秒後自動續跑`;
				} else if (e === 401 || e === 403 || e === 404) {
					w("auth", x.message, e), i.calls.push(C), _(), l(new fr(ur.auth(x.message), "stopped"));
					return;
				} else e >= 500 ? (w("upstream_error", x.message, e), d || (d = !0, T = "retry", E = cr)) : w("bad_request", x.message, e);
			} else x.kind === "network" ? (w("network", x.message), d || (d = !0, T = "retry", E = cr)) : x.kind === "timeout" ? (w("timeout", x.message), y++, y <= 2 && (T = "retry", g = `第 ${e.page} 頁 ${n} 讀法逾時，自動重送（第 ${y} 次）`)) : x.kind === "cancelled" ? w("cancelled", x.message) : w("format", x.message);
			if (i.calls.push(C), _(), x.kind === "cancelled" || o.signal.aborted || T === "end" || E > 0 && (await t.sleep(E, o.signal), o.signal.aborted)) return;
		}
	}, y = async (e, t) => {
		u = e, d = 0, f = t.length, g = null, _();
		let n = 0;
		await Promise.all(Array.from({ length: Math.min(2, t.length) }, async () => {
			for (; !o.signal.aborted && n < t.length;) {
				let r = t[n++];
				await v(r, e), d++, _();
			}
		}));
	};
	try {
		!o.signal.aborted && !t.readKey() && l(new fr(ur.noKey, "stopped")), o.signal.aborted || await y("A", n), o.signal.aborted || await y("B", n.filter((e) => {
			let t = er(i.calls, e.page, "A");
			return !!t && t.ok;
		}));
	} finally {
		e.signal?.removeEventListener("abort", s);
	}
	let b = c;
	Zn(i);
	let x = {
		status: b ? b.why : "done",
		stopText: b ? b.text : null,
		log: i,
		notes: a,
		verify: nr(i)
	};
	return _(b ? b.text : void 0), x;
}
//#endregion
//#region src/xdwread/results.ts
var B = {
	counts: (e, t, n) => `通過 ${e}／需人工 ${t}／沒送 ${n} 頁`,
	page: (e) => `第 ${e} 頁`,
	modeWhole: "整頁送出",
	modeSkip: "沒送",
	pageOk: "頁層級檢查通過",
	pageManual: "整頁需人工輸入：",
	pageSkip: "沒送（需人工輸入）：",
	unconfirmed: "（未確認）",
	notRead: "（沒有讀到）",
	labels: {
		sampleName: "樣品名稱",
		reportNo: "報告編號",
		sampleTime: "採樣時間"
	},
	cols: [
		"項目",
		"A 值",
		"B 值",
		"狀態",
		"原因"
	],
	pass: "通過",
	manual: "需人工輸入",
	empty: "（空）",
	none: "（沒有）",
	fields: {
		item: "項目",
		unit: "單位",
		result: "檢測結果",
		mdl: "MDL",
		method: "方法"
	},
	fragAlt: (e, t) => `第 ${e} 頁（第 ${t} 列所在頁）送出的整頁圖`,
	fragNone: "片段不顯示",
	fragWhole: "顯示這頁送出的整頁圖（不定位到列）；點圖放大到原尺寸，再點一下縮回。",
	fragFail: (e) => `片段做不出來：${e}`,
	tokens: (e) => `token：A 輸入 ${e.A.input}／輸出 ${e.A.output}；B 輸入 ${e.B.input}／輸出 ${e.B.output}`
}, hr = (e) => B.counts(e.totals.pass, e.totals.manual, e.totals.pagesSkipped), gr = (e) => String(e).padStart(2, "0");
function _r(e, t) {
	return `${e.replace(/\.xdw$/i, "") || "XDW"}（讀值紀錄 ${`${t.getFullYear()}${gr(t.getMonth() + 1)}${gr(t.getDate())}-${gr(t.getHours())}${gr(t.getMinutes())}${gr(t.getSeconds())}`}）.json`;
}
function V(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var vr = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤", yr = (e) => e == null || e === "" ? B.empty : e;
function br(e, t) {
	if (e.status === "ok" && e.identity) return {
		sampleName: e.identity.sampleName,
		reportNo: e.identity.reportNo,
		sampleTime: e.identity.sampleTime
	};
	let n = e.mode === "skip" ? null : er(t.calls, e.page, "A"), r = (e) => {
		if (!n || !n.ok) return B.notRead;
		let t = n.reply[e].value;
		return t === null || t.trim() === "" ? B.notRead : `${t}${B.unconfirmed}`;
	};
	return {
		sampleName: r("sample_name"),
		reportNo: r("report_no"),
		sampleTime: r("sample_time")
	};
}
function xr(e, t, n, r) {
	let i = [], a = !1, o = V(e, "div", "edc-res");
	o.id = "edcReadResults";
	let s = V(e, "div", "edc-res-counts", hr(t));
	s.id = "edcReadCounts", o.append(s);
	for (let r of t.pages) {
		let t = n.pages.find((e) => e.page === r.page) ?? null, i = V(e, "div", `edc-res-page edc-res-page-${r.status}`);
		i.dataset.page = String(r.page), i.dataset.status = r.status;
		let a = V(e, "div", "edc-res-page-head");
		a.append(V(e, "strong", void 0, B.page(r.page)), V(e, "span", "edc-res-mode", r.mode === "whole" ? B.modeWhole : B.modeSkip));
		let s = r.status === "ok" ? B.pageOk : r.status === "manual" ? B.pageManual + (r.reasons.join("；") || "—") : B.pageSkip + (t?.reason || "—");
		if (a.append(V(e, "span", "edc-res-page-status", s)), i.append(a), r.status !== "skip") {
			let t = br(r, n), a = V(e, "ul", "edc-res-identity"), o = (t, n) => {
				let r = V(e, "li", void 0, `${B.labels[t]}：${n}`);
				r.dataset.field = t, a.append(r);
			};
			o("sampleName", t.sampleName), o("reportNo", t.reportNo), o("sampleTime", t.sampleTime), i.append(a);
		}
		for (let t of r.warnings) i.append(V(e, "div", "edc-res-warn", `⚠ ${t}`));
		if (r.rows.length) {
			let t = V(e, "table", "edc-res-table"), n = V(e, "tr");
			for (let t of B.cols) n.append(V(e, "th", void 0, t));
			let a = V(e, "thead");
			a.append(n);
			let o = V(e, "tbody");
			for (let e of r.rows) o.append(...c(r, e));
			t.append(a, o), i.append(t);
		}
		o.append(i);
	}
	function c(t, n) {
		let r = V(e, "tr", `edc-res-row edc-res-${n.status}`);
		r.dataset.page = String(t.page), r.dataset.row = String(n.index + 1), r.title = "點一下看五格對照與片段", r.append(V(e, "td", void 0, n.expected), V(e, "td", void 0, n.a ? yr(n.a.result) : B.none), V(e, "td", void 0, n.b ? yr(n.b.result) : B.none), V(e, "td", "edc-res-status", n.status === "pass" ? B.pass : B.manual), V(e, "td", "edc-res-reason", n.reasons.join("；")));
		let i = V(e, "tr", "edc-res-detail-row");
		i.hidden = !0;
		let a = V(e, "td");
		a.colSpan = B.cols.length, i.append(a);
		let o = !1;
		return r.addEventListener("click", () => {
			try {
				i.hidden = !i.hidden, !o && !i.hidden && (o = !0, a.append(l(t, n)));
			} catch {}
		}), [r, i];
	}
	function l(t, n) {
		let r = V(e, "div", "edc-res-detail");
		r.dataset.page = String(t.page), r.dataset.row = String(n.index + 1);
		let i = V(e, "table", "edc-res-cmp"), o = V(e, "tr");
		o.append(V(e, "th", void 0, "欄位"), V(e, "th", void 0, "A"), V(e, "th", void 0, "B")), i.append(o);
		for (let t of Object.keys(B.fields)) {
			let r = V(e, "tr");
			r.append(V(e, "td", void 0, B.fields[t]), V(e, "td", void 0, n.a ? yr(n.a[t]) : B.none), V(e, "td", void 0, n.b ? yr(n.b[t]) : B.none)), i.append(r);
		}
		r.append(i);
		let s = V(e, "div", "edc-res-frag");
		return r.append(s), u(t, n, s).catch((t) => {
			a || s.replaceChildren(V(e, "div", "edc-xdw-red", B.fragFail(vr(t))));
		}), r;
	}
	async function u(t, a, o) {
		let s = n.pages.find((e) => e.page === t.page) ?? null, c = r(t.page);
		if (!(s && c && c.mode === s.mode && c.image && c.box && s.image && s.image.w === c.box.w && s.image.h === c.box.h) || !c || !c.image || !c.box) {
			o.append(V(e, "div", "edc-res-frag-none", B.fragNone));
			return;
		}
		let l = V(e, "img", "edc-res-frag-img");
		l.alt = B.fragAlt(t.page, a.index + 1);
		let u = URL.createObjectURL(c.image);
		i.push(u), l.src = u, l.title = "點一下放大到原尺寸／縮回";
		let d = V(e, "div", "edc-res-frag-wrap");
		l.addEventListener("click", () => {
			try {
				l.classList.toggle("edc-res-frag-full"), d.classList.toggle("edc-res-frag-scroll");
			} catch {}
		}), d.append(l), o.append(V(e, "div", "edc-res-frag-note", B.fragWhole), d);
	}
	return {
		element: o,
		dispose: () => {
			a = !0;
			for (let e of i) try {
				URL.revokeObjectURL(e);
			} catch {}
			i.length = 0;
		}
	};
}
//#endregion
//#region src/xdwread/sheet.ts
var Sr = {
	site: "採樣地點：",
	time: "採樣時間：",
	category: "樣品特性：",
	agency: "採樣單位：",
	reportNo: "報告編號："
}, Cr = [
	"檢驗項目",
	"檢測值",
	"偵測極限",
	"單位",
	"檢測方法"
], wr = "以下空白", Tr = (e) => `p${String(e).padStart(2, "0")}`;
function Er(e) {
	let t = pn[F(e)];
	return t === void 0 ? e : t;
}
function Dr(e, t) {
	let n = F(e), r = F(t), i = mn.find((e) => e.item === n && e.from === r);
	return i ? i.to : t;
}
var Or = (e) => typeof e == "string";
function kr(e, t, n) {
	let r = `第 ${e} 頁第 ${t + 1} 列`;
	if (!n || ![
		n.item,
		n.unit,
		n.result,
		n.mdl,
		n.method
	].every(Or)) throw Error(`${r}：寫入內容不完整（內部檢查）`);
	if (!yn.test(n.result)) throw Error(`${r}：檢測結果的寫法不在允許清單內（內部檢查）`);
	if (n.mdl !== "" && !bn.test(n.mdl)) throw Error(`${r}：MDL 的寫法不在允許清單內（內部檢查）`);
	if (n.item.trim() === "") throw Error(`${r}：項目名稱空白（內部檢查）`);
}
function Ar(e, t) {
	let n = [], r = [], i = [], a = [], o = /* @__PURE__ */ new Set();
	for (let s of e.pages) {
		let e = br(s, t).sampleName;
		if (s.status === "skip") {
			a.push({
				page: s.page,
				index: null,
				sampleName: e,
				item: "",
				reason: s.reasons[0] ?? "這頁沒有送出"
			});
			continue;
		}
		let c = s.status === "ok" && s.mode === "whole" && s.identity !== null, l = [];
		!c && s.rows.length === 0 && a.push({
			page: s.page,
			index: null,
			sampleName: e,
			item: "",
			reason: s.reasons[0] ?? "整頁需人工輸入"
		});
		for (let t of s.rows) {
			if (!c || t.status !== "pass" || !t.out) {
				a.push({
					page: s.page,
					index: t.index,
					sampleName: e,
					item: t.expected,
					reason: t.reasons[0] ?? (c ? "需人工輸入" : s.reasons[0] ?? "整頁需人工輸入")
				});
				continue;
			}
			kr(s.page, t.index, t.out);
			let n = Er(t.out.item), o = Dr(t.out.item, t.out.unit);
			n !== t.out.item && r.push({
				page: s.page,
				index: t.index,
				from: t.out.item,
				to: n
			}), o !== t.out.unit && i.push({
				page: s.page,
				index: t.index,
				from: t.out.unit,
				to: o
			}), l.push({
				page: s.page,
				index: t.index,
				out: { ...t.out },
				cells: {
					item: n,
					result: t.out.result,
					mdl: t.out.mdl,
					unit: o,
					method: t.out.method
				}
			});
		}
		if (!c || l.length === 0) continue;
		let u = s.identity, d = Tr(s.page);
		if (o.has(d)) throw Error(`第 ${s.page} 頁重複（內部檢查）`);
		o.add(d);
		let f = [
			[Sr.site, u.sampleName],
			[Sr.time, u.sampleTime],
			[Sr.category, t.category],
			[Sr.agency, t.agency.name],
			[Sr.reportNo, u.reportNo],
			[],
			[...Cr],
			...l.map((e) => [
				e.cells.item,
				e.cells.result,
				e.cells.mdl,
				e.cells.unit,
				e.cells.method
			]),
			[wr]
		];
		n.push({
			name: d,
			page: s.page,
			identity: {
				...u,
				date: { ...u.date }
			},
			rows: l,
			aoa: f
		});
	}
	return {
		xdwFileName: t.fileName,
		category: t.category,
		agency: { ...t.agency },
		period: { ...t.period },
		sheets: n,
		total: n.reduce((e, t) => e + t.rows.length, 0),
		itemRenames: r,
		unitRenames: i,
		excluded: a
	};
}
function jr(e, t) {
	if (!e.sheets.length) throw Error("沒有任何通過核對的列，不能產生 xlsx");
	let n = t.utils.book_new();
	for (let r of e.sheets) {
		let e = t.utils.aoa_to_sheet(r.aoa.map((e) => e.map(String)));
		for (let t of Object.keys(e)) {
			if (t.startsWith("!")) continue;
			let n = e[t];
			n.t = "s", n.v = String(n.v ?? ""), delete n.w, delete n.z;
		}
		t.utils.book_append_sheet(n, e, r.name);
	}
	let r = t.write(n, {
		type: "array",
		bookType: "xlsx"
	});
	return r instanceof Uint8Array ? r : new Uint8Array(r);
}
var Mr = (e) => String(e).padStart(2, "0");
function Nr(e, t) {
	return `${e.replace(/\.xdw$/i, "") || "XDW"}（Claude讀值 ${`${t.getFullYear()}${Mr(t.getMonth() + 1)}${Mr(t.getDate())}-${Mr(t.getHours())}${Mr(t.getMinutes())}${Mr(t.getSeconds())}`}）.xlsx`;
}
//#endregion
//#region src/xdwread/preflight.ts
var H = {
	noUpstream: "找不到原網站的 Excel 解析函式（原網站程式可能已更新），無法自我檢查",
	crashed: "原網站的解析函式在自我檢查時出錯",
	sheets: "原網站讀到的工作表和放進去的不一樣",
	noRows: (e) => `第 ${e} 頁：原網站沒有讀出任何列`,
	count: (e, t, n) => `第 ${e} 頁：原網站讀出 ${n} 列，放進去的是 ${t} 列`,
	item: (e, t) => `第 ${e} 頁第 ${t} 列：原網站解析出的項目名稱和放進去的不一樣`,
	value: (e, t) => `第 ${e} 頁第 ${t} 列：原網站解析出的值和讀到的不相符`,
	mdl: (e, t) => `第 ${e} 頁第 ${t} 列：原網站解析出的檢測極限和讀到的不相符`,
	category: (e) => `第 ${e} 頁：原網站解析出的檢測類別和你確認的不一樣`,
	agency: (e) => `第 ${e} 頁：原網站解析出的檢測機構代碼和你選的不一樣`,
	date: (e) => `第 ${e} 頁：原網站解析出的採樣日期或時間和讀到的不一樣`,
	site: (e) => `第 ${e} 頁：原網站解析出的採樣地點和讀到的樣品名稱不一樣`
};
function Pr(e) {
	let t = /^(\d+)(?:\.(\d+))?$/.exec(e);
	if (!t) return null;
	let n = t[1].replace(/^0+(?=\d)/, ""), r = (t[2] ?? "").replace(/0+$/, "");
	return r ? `${n}.${r}` : n;
}
function Fr(e) {
	if (e === "ND") return {
		cmp: "ND",
		value: ""
	};
	if (e.startsWith("<")) {
		let t = Pr(e.slice(1));
		return t === null ? null : {
			cmp: "<",
			value: t
		};
	}
	let t = Pr(e);
	return t === null ? null : {
		cmp: "",
		value: t
	};
}
var Ir = (e) => e === "" ? "" : Pr(e), U = (e) => e == null ? "" : String(e), Lr = (e) => String(e).padStart(2, "0");
async function Rr(e, t, n) {
	let r = e?.ImportEngine?.readWorkbookGrids, i = e?.SmartParse?.parseSheet;
	if (typeof r != "function" || typeof i != "function") return {
		ok: !1,
		problems: [H.noUpstream],
		rows: null
	};
	let a = [], o = {};
	try {
		let s = await r.call(e.ImportEngine, t), c = s && typeof s == "object" ? Object.keys(s) : [], l = n.sheets.map((e) => e.name);
		(c.length !== l.length || l.some((e) => !c.includes(e))) && a.push(H.sheets);
		for (let t of n.sheets) {
			let r = s?.[t.name];
			if (!r) continue;
			let c = i.call(e.SmartParse, "water", t.name, r, { allowAutoDetect: !1 }), l = Array.isArray(c) ? c : [];
			o[t.name] = l;
			let u = t.page;
			if (!l.length) {
				a.push(H.noRows(u));
				continue;
			}
			if (l.length !== t.rows.length) {
				a.push(H.count(u, t.rows.length, l.length));
				continue;
			}
			let d = t.identity.date, f = `${d.rocYear + 1911}-${Lr(d.month)}-${Lr(d.day)}`, p = `${Lr(d.hour)}:${Lr(d.minute)}`, m = /* @__PURE__ */ new Set();
			t.rows.forEach((e, r) => {
				let i = l[r], o = e.index + 1;
				U(i.檢測項目) !== e.cells.item && a.push(H.item(u, o));
				let s = Fr(e.cells.result);
				(!s || U(i.比較關係) !== s.cmp || U(i.檢測數值) !== s.value) && a.push(H.value(u, o));
				let c = Ir(e.cells.mdl);
				(c === null || U(i.檢測極限) !== c) && a.push(H.mdl(u, o)), U(i.檢測類別) !== n.category.trim() && m.add("category"), U(i.檢測機構許可證號) !== n.agency.code && m.add("agency");
				let d = U(i["時間(起)"]);
				(U(i["日期(起)"]) !== f || d !== `${p}:00`) && m.add("date"), U(i.採樣地點).trim() !== t.identity.sampleName.trim() && m.add("site");
			}), m.has("category") && a.push(H.category(u)), m.has("agency") && a.push(H.agency(u)), m.has("date") && a.push(H.date(u)), m.has("site") && a.push(H.site(u));
		}
	} catch {
		return {
			ok: !1,
			problems: [...a, H.crashed],
			rows: Object.keys(o).length ? o : null
		};
	}
	return a.length ? {
		ok: !1,
		problems: a,
		rows: o
	} : {
		ok: !0,
		rows: o,
		total: Object.values(o).reduce((e, t) => e + t.length, 0)
	};
}
//#endregion
//#region src/xdwread/submit.ts
var zr = [
	"btnImport",
	"importFileInput",
	"btnImportStagedConfirm",
	"btnImportConfirm"
], W = {
	button: "送進匯入確認畫面",
	ready: "會先自我檢查（用原網站自己的解析程式試讀一次），相符才交給原網站的匯入確認畫面",
	why: {
		noLog: "還沒有讀值結果",
		noPass: "沒有任何通過核對的列，沒有東西可以送",
		busy: "送件中…",
		reading: "讀值進行中"
	},
	confirm: (e, t, n) => {
		let r = [
			e > 0 ? `${e} 列沒有自動帶入` : "",
			t > 0 ? `${t} 頁整頁沒有讀成功` : "",
			n > 0 ? `${n} 頁沒送` : ""
		].filter(Boolean);
		return r.length ? `有 ${r.join("、")}，匯入後要手動補。要繼續嗎？` : null;
	},
	working: "自我檢查中…",
	sending: "自我檢查相符，交給原網站中…",
	planFail: (e) => `沒有送出：產生 xlsx 前的內部檢查不通過（${e}）`,
	noXlsx: "沒有送出：找不到原網站的 Excel 函式庫（XLSX），無法產生 xlsx",
	xlsxFail: (e) => `沒有送出：xlsx 產生失敗（${e}）`,
	preflightHead: "沒有送出：自我檢查發現原網站讀到的內容和讀值不相符",
	notWater: "沒有送出：目前不在水質分頁或沒有選計畫（請先回到水質分頁、選好計畫再按一次）",
	missing: (e) => `沒有送出：原網站畫面上找不到 ${e.map((e) => `#${e}`).join("、")}（原網站程式可能已更新）`,
	stepFail: (e) => `交給原網站時失敗：${e}`,
	steps: {
		modal: "按了「匯入」之後原網站的匯入視窗沒有出現",
		staged: "檔案沒有進到原網站的待匯入清單",
		stagedNotOne: (e) => e > 1 ? "檔案沒有進到原網站的待匯入清單：原網站的待匯入清單裡不只這一個檔，請關掉匯入視窗後再按一次" : "檔案沒有進到原網站的待匯入清單：清單裡找不到這個檔的項目，請關掉匯入視窗後再按一次",
		preview: "等不到原網站的匯入確認畫面（或來源檔名不是這份 xlsx）"
	},
	fallback: "可以改用「下載這份 xlsx」，再用原網站的「匯入資料（Excel）」手動匯入。",
	download: "下載這份 xlsx",
	logFail: (e) => `讀值紀錄無法自動下載：${e}；沒有送出`
};
function Br(e) {
	return e.reading ? W.why.reading : e.busy ? W.why.busy : !e.log || !e.verify ? W.why.noLog : e.verify.totals.pass > 0 ? null : W.why.noPass;
}
var Vr = (e) => e.pages.filter((e) => e.status === "manual" && e.rows.length === 0).length, Hr = (e) => W.confirm(e.totals.manual, Vr(e), e.totals.pagesSkipped);
function Ur(e) {
	return zr.filter((t) => !e.getElementById(t));
}
var Wr = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤", Gr = (e) => !e || e.classList.contains("hidden"), Kr = class extends Error {}, qr = (e) => {
	try {
		return e.isCurrent();
	} catch {
		return !1;
	}
};
async function Jr(e, t) {
	let n = t.sleep ?? ((e) => new Promise((t) => setTimeout(t, e))), r = t.timeoutMs ?? 15e3;
	for (let i = 0; i <= r; i += 100) {
		if (!qr(t)) throw new Kr();
		try {
			if (e()) return !0;
		} catch {}
		await n(100);
	}
	if (!qr(t)) throw new Kr();
	try {
		return e();
	} catch {
		return !1;
	}
}
async function Yr(e, t, n) {
	let r = (e, t, n = null) => ({
		ok: !1,
		stage: e,
		messages: t,
		xlsx: n
	}), i = Br({
		log: t,
		verify: e,
		busy: !1
	});
	if (i) return r("disabled", [i]);
	let a = Hr(e);
	if (a !== null && !n.confirm(a)) return r("cancel", []);
	n.onStage?.(W.working);
	let o;
	try {
		o = Ar(e, t);
	} catch (e) {
		return r("plan", [W.planFail(Wr(e))]);
	}
	let s = n.upstream(), c = s?.XLSX;
	if (!c || typeof c.write != "function" || !c.utils) return r("xlsx", [W.noXlsx]);
	let l = Nr(t.fileName, n.now()), u;
	try {
		u = jr(o, c);
	} catch (e) {
		return r("xlsx", [W.xlsxFail(Wr(e))]);
	}
	let d = {
		name: l,
		bytes: u
	}, f = () => u.slice().buffer, p = await Rr(s, {
		name: l,
		arrayBuffer: async () => f()
	}, o);
	if (!qr(n)) return n.clearPending(), r("cancel", []);
	if (!p.ok) return r("preflight", [
		W.preflightHead,
		...p.problems,
		W.fallback
	], d);
	let m = Ur(n.doc);
	if (m.length) return r("env", [W.missing(m), W.fallback], d);
	if (!n.waterReady()) return r("env", [W.notWater, W.fallback], d);
	if (!qr(n)) return n.clearPending(), r("cancel", []);
	try {
		n.download(new Blob([Zn(t)], { type: "application/json" }), _r(t.fileName, n.now()));
	} catch (e) {
		return r("log", [W.logFail(Wr(e))], d);
	}
	n.onStage?.(W.sending), n.setPending({
		fileName: l,
		plan: o,
		preflightRows: p.rows
	});
	let h = n.doc, g = !1, _ = () => {
		if (!qr(n)) throw new Kr();
	};
	try {
		_();
		let e = h.defaultView, t = e?.File ?? File, r = e?.DataTransfer ?? DataTransfer;
		if (h.getElementById("btnImport").click(), !await Jr(() => !Gr(h.getElementById("importModal")), n)) throw Error(W.steps.modal);
		_();
		let i = h.getElementById("importFileInput");
		if (!i) throw Error(W.steps.staged);
		let a = new t([f()], l, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), o = new r();
		o.items.add(a), i.files = o.files, i.dispatchEvent(new Event("change", { bubbles: !0 }));
		let s = h.getElementById("btnImportStagedConfirm"), c = h.getElementById("importStagedList");
		if (!await Jr(() => !Gr(s) && (!c || (c.textContent ?? "").includes(l)), n)) throw Error(W.steps.staged);
		let u = c ? c.querySelectorAll(".staged-file-item").length : 0;
		if (u !== 1) throw Error(W.steps.stagedNotOne(u));
		if (_(), s.click(), g = !0, !await Jr(() => {
			let e = n.importState(), t = h.getElementById("smartImportSummary");
			return !!e && e.label === l && e.mode === "smart" && Array.isArray(e.rows) && !!t && (t.textContent ?? "") !== "";
		}, n)) throw Error(W.steps.preview);
	} catch (e) {
		return g || n.clearPending(), e instanceof Kr ? r("cancel", []) : r("dom", [W.stepFail(Wr(e)), W.fallback], d);
	}
	return qr(n) ? (n.closeModal(), {
		ok: !0,
		fileName: l,
		plan: o
	}) : r("cancel", []);
}
//#endregion
//#region src/xdwread/notice.ts
var Xr = "edcXdwImportNotice", G = {
	title: (e, t, n) => `🟣 Claude 版 XDW 讀值：帶入 ${e} 筆（${t}／${n}）`,
	titleNote: "這些值由兩個模型各讀一次、兩次完全相同才帶入；寫法轉換（ND、<、去尾 0、單位與方法代碼）由原網站的程式處理。請對照報告核對。（這段提醒只在網頁上，不會寫進匯出檔。）",
	excludedHead: (e, t) => `⚠️ 沒有帶入、要手動補：${[e ? `${e} 列` : "", t ? `${t} 頁整頁` : ""].filter(Boolean).join("、")}`,
	excludedRow: (e, t, n, r) => `・第 ${e} 頁｜${t}｜${n}｜${r}`,
	excludedPage: (e, t, n) => `・第 ${e} 頁（整頁）｜${t}｜${n}`,
	carriedHead: "原網站自己帶入的格（不是這次讀到的）",
	rowDiff: (e, t, n, r) => `・第 ${e} 頁｜${t}｜${n}｜現在的值：${r}`,
	rowDiffHead: "⚠️ 下列格子和送進去的不一樣，請逐格核對",
	grouped: (e, t, n, r) => `・${e}｜${t}｜${n}｜${r.length} 列（${r.map((e) => `第 ${e} 頁`).join("、")}）——不是這次讀到的，是原網站從上一季帶入`,
	otherField: (e, t) => `・${e}：${t} 列由原網站從上一季帶入`,
	noCarried: "原網站沒有從上一季帶入任何格。",
	cannot: "無法確認原網站有沒有從上一季帶入內容，請逐欄核對",
	generic: "若下方『差異建議』出現預設勾選的『新增空白列』，代表有項目名稱和上一季不同，請先取消勾選再確認。",
	itemRename: (e, t, n) => `項目名稱已統一成上一季寫法：${e} → ${t}（${n} 列）`,
	unitRename: (e, t, n) => `單位已換成申報代碼表的寫法：${e} → ${t}（${n} 列）`,
	mdlNote: "現場項目（報告沒有檢測極限欄的頁）的檢測極限留空送出；若現在有值，是原網站從上一季帶入的（見上方）。",
	empty: "（空白）"
}, Zr = /* @__PURE__ */ new Set([
	"檢測數值",
	"比較關係",
	"檢測極限"
]), Qr = /* @__PURE__ */ new Set([
	"日期(起)",
	"時間(起)",
	"日期(迄)",
	"時間(迄)",
	"採樣地點",
	"檢測類別",
	"檢測機構許可證號",
	"檢測項目"
]), $r = /* @__PURE__ */ new Set([
	"檢測濃度/質量單位",
	"其他檢測濃度/質量單位",
	"檢測方法"
]), ei = (e) => e == null ? "" : String(e), ti = (e) => e === "" ? G.empty : e;
function ni(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = `${n.from}\u0000${n.to}`, r = t.get(e);
		r ? r.n++ : t.set(e, {
			from: n.from,
			to: n.to,
			n: 1
		});
	}
	return [...t.values()];
}
function ri(e, t) {
	if (!Array.isArray(t)) return null;
	let n = t;
	if (n.length !== e.plan.total || n.some((e) => !e || typeof e != "object" || ei(e._sourceSheet) === "")) return null;
	let r = /* @__PURE__ */ new Set(), i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
	for (let t of e.plan.sheets) {
		let s = e.preflightRows[t.name];
		if (!Array.isArray(s) || s.length !== t.rows.length) return null;
		for (let e of s) {
			let s = ei(e.檢測項目), c = n.filter((e) => ei(e._sourceSheet) === t.name && ei(e.檢測項目) === s);
			if (c.length !== 1 || r.has(c[0])) return null;
			let l = c[0];
			r.add(l);
			let u = [.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(l)])].filter((e) => !e.startsWith("_"));
			for (let n of u) {
				let r = ei(e[n]), c = ei(l[n]);
				if (r !== c) if (Zr.has(n) || Qr.has(n) || $r.has(n)) if (r === "" && c !== "" && ($r.has(n) || n === "檢測極限")) {
					let e = `${n}\u0000${s}\u0000${c}`, r = a.get(e);
					r ? r.pages.includes(t.page) || r.pages.push(t.page) : a.set(e, {
						field: n,
						item: s,
						value: c,
						pages: [t.page]
					});
				} else i.push(G.rowDiff(t.page, s, n, ti(c)));
				else r === "" ? o.set(n, (o.get(n) ?? 0) + 1) : i.push(G.rowDiff(t.page, s, n, ti(c)));
			}
		}
	}
	return r.size === n.length ? {
		rowDiffs: i,
		grouped: [...a.values()].map((e) => G.grouped(e.field, e.item, e.value, e.pages.sort((e, t) => e - t))),
		others: [...o.entries()].map(([e, t]) => G.otherField(e, t))
	} : null;
}
function ii(e, t) {
	let n = e.plan, r = n.excluded.filter((e) => e.index !== null), i = n.excluded.filter((e) => e.index === null), a = n.excluded.map((e) => e.index === null ? G.excludedPage(e.page, e.sampleName, e.reason) : G.excludedRow(e.page, e.sampleName, e.item, e.reason)), o = null;
	try {
		o = ri(e, t);
	} catch {
		o = null;
	}
	return {
		title: G.title(n.total, n.xdwFileName, e.fileName),
		excludedHead: a.length ? G.excludedHead(r.length, i.length) : null,
		excluded: a,
		cannotCompare: o === null,
		rowDiffs: o?.rowDiffs ?? [],
		grouped: o?.grouped ?? [],
		others: o?.others ?? [],
		generic: G.generic,
		itemRenames: ni(n.itemRenames).map((e) => G.itemRename(e.from, e.to, e.n)),
		unitRenames: ni(n.unitRenames).map((e) => G.unitRename(e.from, e.to, e.n)),
		mdlNote: G.mdlNote
	};
}
var ai = null, oi = !1, si = /* @__PURE__ */ new WeakSet(), ci = null;
function li(e, t) {
	ai = e, oi = !1, ci = t, mi(t);
}
function ui() {
	ai = null, oi = !1;
	try {
		ci?.doc.getElementById(Xr)?.remove();
	} catch {}
}
function di(e) {
	try {
		let t = e.getState();
		return t ? {
			label: ei(t.currentImportSourceLabel),
			rows: t.smartResult ? t.smartResult.rows : void 0,
			ok: !0
		} : {
			label: "",
			rows: void 0,
			ok: !1
		};
	} catch {
		return {
			label: "",
			rows: void 0,
			ok: !1
		};
	}
}
function fi() {
	let e = ci;
	if (!e) return null;
	let t = e.doc, n = t.getElementById(Xr), r = t.getElementById("smartImportSummary"), i = ai;
	if (!i || !r) return n?.remove(), null;
	let a = di(e);
	if (a.ok && a.label !== "" && a.label !== i.fileName) return ui(), null;
	if (a.ok && a.label !== i.fileName || !r.textContent) return n?.remove(), null;
	oi = !0;
	let o = pi(t, ii(i, a.ok ? a.rows : void 0));
	return n ? n.replaceWith(o) : r.after(o), o;
}
function pi(e, t) {
	let n = (t, n, r) => {
		let i = e.createElement(t);
		return n != null && (i.textContent = n), r && (i.style.cssText = r), i;
	}, r = "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b", i = n("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #6a4c9c;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	i.id = Xr;
	let a = n("div", t.title, "font-weight:700;font-size:15px;color:#4b3172");
	if (a.dataset.edc = "title", i.append(a, n("div", G.titleNote, "margin:2px 0 6px")), t.excludedHead) {
		let e = n("div", null, r);
		e.dataset.edc = "excluded", e.append(n("div", t.excludedHead, "font-weight:700"), ...t.excluded.map((e) => n("div", e))), i.append(e);
	}
	let o = n("div", null, "margin-top:8px");
	if (o.dataset.edc = "carried", o.append(n("div", G.carriedHead, "font-weight:700")), t.cannotCompare) {
		let e = n("div", G.cannot, "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b;font-weight:700");
		e.dataset.edc = "cannot", o.append(e);
	} else {
		if (t.rowDiffs.length) {
			let e = n("div", null, r);
			e.dataset.edc = "row-diffs", e.append(n("div", G.rowDiffHead, "font-weight:700"), ...t.rowDiffs.map((e) => n("div", e))), o.append(e);
		}
		for (let e of t.grouped) {
			let t = n("div", e);
			t.dataset.edc = "grouped", o.append(t);
		}
		for (let e of t.others) {
			let t = n("div", e);
			t.dataset.edc = "others", o.append(t);
		}
		!t.rowDiffs.length && !t.grouped.length && !t.others.length && o.append(n("div", G.noCarried));
	}
	i.append(o);
	let s = n("div", null, "margin-top:8px");
	for (let [e, r] of [
		["generic", [t.generic]],
		["item-rename", t.itemRenames],
		["unit-rename", t.unitRenames],
		["mdl", [t.mdlNote]]
	]) for (let t of r) {
		let r = n("div", `・${t}`);
		r.dataset.edc = e, s.append(r);
	}
	return i.append(s), i;
}
function mi(e) {
	if (typeof MutationObserver > "u") return;
	let t = e.doc, n = t.getElementById("smartImportSummary");
	n && !si.has(n) && (si.add(n), new MutationObserver(() => {
		try {
			fi();
		} catch {}
	}).observe(n, {
		childList: !0,
		characterData: !0,
		subtree: !0
	}));
	let r = t.getElementById("importModal");
	r && !si.has(r) && (si.add(r), new MutationObserver(() => {
		try {
			r.classList.contains("hidden") && ai && oi && ui();
		} catch {}
	}).observe(r, {
		attributes: !0,
		attributeFilter: ["class"]
	}));
}
//#endregion
//#region src/xdwread/runview.ts
var K = {
	status: (e) => `${e.scheme} 讀法（${e.scheme === "A" ? ar : or}）：已完成 ${e.done}／${e.total} 頁（已送出 ${e.calls} 次呼叫）`,
	starting: "讀值準備中…",
	pause: (e) => `Claude 回覆太頻繁，暫停中，約 ${e} 秒後自動續跑`,
	abort: "中止",
	aborting: "中止中…",
	done: "讀值完成",
	cancelled: "已中止讀值。已讀完的頁照樣核對如下。",
	locked: "這次讀值已結束；要重讀請重新選檔。",
	crash: (e) => `讀值結束時出錯：${e}；這次的結果不顯示，請重新選檔。`,
	note: (e) => `第 ${e.page} 頁${e.scheme ? ` ${e.scheme} 讀法` : ""}：${e.text}`,
	download: "下載讀值紀錄",
	downloadFail: (e) => `讀值紀錄無法下載：${e}`,
	load: "載入讀值紀錄",
	loadHint: "要先選同一個 XDW 並等頁面準備完；載入後重看結果，不會送出任何東西。",
	loadReject: (e) => `沒有載入：${e}`,
	loaded: (e, t) => `已載入讀值紀錄（${e}，${t}）；這次沒有送出任何東西。`,
	loadedTokens: "（紀錄裡的用量，這次沒有花額度）",
	toImport: W.button,
	toImportNote: W.ready
}, hi = (e, t) => e === null ? 0 : Math.max(0, Math.ceil((e - t) / 1e3));
function q(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var gi = (e) => N((e instanceof Error ? e.message : String(e)) || "未知錯誤", kt());
function _i(e, t, n) {
	let r = 0, i = !1, a = !1, o = null, s = null, c = null, l = null, u = null, d = !1, f = null, p = q(e, "div", "edc-read-run");
	p.id = "edcReadRun", p.hidden = !0;
	let m = q(e, "div", "edc-read-run-status");
	m.id = "edcReadRunStatus", m.setAttribute("aria-live", "polite");
	let h = q(e, "div", "edc-read-run-note");
	h.id = "edcReadRunNote";
	let g = q(e, "div", "edc-read-pause");
	g.id = "edcReadPause", g.hidden = !0;
	let _ = q(e, "button", "edc-xdw-btn edc-read-abort", K.abort);
	_.type = "button", _.id = "edcReadAbort";
	let v = q(e, "div", "edc-read-tokens");
	v.id = "edcReadTokens";
	let y = q(e, "div", "edc-read-end");
	y.id = "edcReadEnd";
	let b = q(e, "div", "edc-read-notes");
	b.id = "edcReadNotes", p.append(m, h, g, _, v, y, b);
	let x = q(e, "div", "edc-read-logbar"), S = q(e, "button", "edc-xdw-btn edc-read-download", K.download);
	S.type = "button", S.id = "edcReadDownloadLog", S.hidden = !0;
	let C = q(e, "button", "edc-xdw-btn edc-read-load", K.load);
	C.type = "button", C.id = "edcReadLoadLog";
	let w = q(e, "input");
	w.type = "file", w.accept = ".json,application/json", w.id = "edcReadLogFile", w.hidden = !0;
	let T = q(e, "span", "edc-read-load-why");
	T.id = "edcReadLoadWhy", x.append(S, C, w, T);
	let E = q(e, "div", "edc-read-load-msg");
	E.id = "edcReadLoadMsg";
	let D = q(e, "div", "edc-read-results-slot"), O = q(e, "div", "edc-read-next");
	O.hidden = !0;
	let k = q(e, "button", "edc-xdw-btn edc-read-to-import", K.toImport);
	k.type = "button", k.id = "edcReadToImport", k.disabled = !0;
	let ee = q(e, "span", "edc-read-next-note", K.toImportNote);
	ee.id = "edcReadToImportWhy", O.append(k, ee);
	let A = q(e, "div", "edc-read-submit-msg");
	A.id = "edcReadSubmitMsg", A.setAttribute("aria-live", "polite"), t.replaceChildren(p, x, E, D, O, A);
	let te = () => {
		s !== null && (clearInterval(s), s = null);
	}, ne = () => {
		let e = hi(c, Date.now());
		e > 0 ? (g.hidden = !1, g.textContent = K.pause(e)) : (g.hidden = !0, g.textContent = "", c = null, te());
	}, re = () => {
		let e = Br({
			log: l,
			verify: u,
			busy: d,
			reading: i
		});
		k.disabled = e !== null, ee.textContent = e ?? K.toImportNote;
	}, ie = (t, n) => {
		let r = URL.createObjectURL(t), i = e.createElement("a");
		i.href = r, i.download = n, i.click(), setTimeout(() => {
			try {
				URL.revokeObjectURL(r);
			} catch {}
		}, 1e4);
	}, ae = (t) => ({
		doc: e,
		isCurrent: () => t === r,
		upstream: () => ({
			ImportEngine: typeof ImportEngine < "u" ? ImportEngine : void 0,
			SmartParse: typeof SmartParse < "u" ? SmartParse : void 0,
			XLSX: typeof XLSX < "u" ? XLSX : void 0
		}),
		waterReady: () => {
			try {
				return typeof state < "u" && !!state && state.currentTab === "water" && !!state.currentProjectId;
			} catch {
				return !1;
			}
		},
		importState: () => {
			try {
				return typeof state > "u" || !state ? null : {
					label: String(state.currentImportSourceLabel ?? ""),
					mode: String(state.importMode ?? ""),
					rows: state.smartResult ? state.smartResult.rows : void 0
				};
			} catch {
				return null;
			}
		},
		confirm: (t) => (e.defaultView ?? window).confirm(t),
		download: ie,
		now: () => /* @__PURE__ */ new Date(),
		setPending: (t) => li(t, {
			doc: e,
			getState: () => typeof state < "u" ? state : void 0
		}),
		clearPending: ui,
		closeModal: () => {
			try {
				n.closeModal?.();
			} catch {}
		},
		onStage: (t) => {
			A.replaceChildren(q(e, "div", "edc-read-submit-stage", t));
		}
	}), oe = async () => {
		if (d || !l || !u) return;
		let t = r;
		d = !0, re(), A.replaceChildren();
		try {
			let n = await Yr(u, l, ae(t));
			if (t !== r || n.ok) {
				t === r && A.replaceChildren();
				return;
			}
			if (n.stage === "cancel") {
				A.replaceChildren();
				return;
			}
			let i = q(e, "div", "edc-xdw-red edc-read-submit-fail");
			if (i.append(...n.messages.map((t) => q(e, "div", void 0, N(t, kt())))), A.replaceChildren(i), n.xlsx) {
				let t = n.xlsx, r = q(e, "button", "edc-xdw-btn edc-read-download-xlsx", W.download);
				r.type = "button", r.id = "edcReadDownloadXlsx", r.addEventListener("click", () => {
					try {
						ie(new Blob([t.bytes.slice().buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), t.name);
					} catch {}
				}), A.append(r);
			}
		} catch (n) {
			t === r && A.replaceChildren(q(e, "div", "edc-xdw-red edc-read-submit-fail", gi(n)));
		} finally {
			t === r && (d = !1, re());
		}
	};
	k.addEventListener("click", () => {
		try {
			oe().catch(() => {});
		} catch {}
	});
	let se = (t, r) => {
		u = t, f?.dispose(), f = xr(e, t, r, n.frag), D.replaceChildren(f.element), O.hidden = !1, S.hidden = !1, re();
	}, ce = () => {
		let e = i || a ? K.locked : n.canLoad();
		C.disabled = e !== null, T.textContent = e ?? K.loadHint;
	}, le = () => {
		i = !1, a = !0, o = null, _.disabled = !0, _.hidden = !0, te(), c = null, g.hidden = !0, ce(), re(), n.changed();
	};
	_.addEventListener("click", () => {
		try {
			i && o && (_.disabled = !0, _.textContent = K.aborting, o.abort());
		} catch {}
	}), S.addEventListener("click", () => {
		try {
			if (!l) return;
			let t = Zn(l), n = new Blob([t], { type: "application/json" }), r = URL.createObjectURL(n), i = e.createElement("a");
			i.href = r, i.download = _r(l.fileName, /* @__PURE__ */ new Date()), i.click(), setTimeout(() => {
				try {
					URL.revokeObjectURL(r);
				} catch {}
			}, 1e4);
		} catch (t) {
			y.append(q(e, "div", "edc-xdw-red edc-read-error", K.downloadFail(gi(t))));
		}
	}), C.addEventListener("click", () => {
		try {
			ce(), C.disabled || (w.value = "", w.click());
		} catch {}
	}), w.addEventListener("change", () => {
		let t = r, o = w.files?.[0];
		o && (async () => {
			let s = i || a ? K.locked : n.canLoad();
			if (s) {
				E.replaceChildren(q(e, "div", "edc-xdw-red", K.loadReject(s)));
				return;
			}
			let c = await o.text();
			if (t !== r) return;
			let u = Qn(c);
			if (!u.ok) {
				E.replaceChildren(q(e, "div", "edc-xdw-red", K.loadReject(u.reason)));
				return;
			}
			let d = n.sha(), f = d ? $n(u.log, d) : "目前的檔案沒有 SHA-256，不能比對";
			if (f) {
				E.replaceChildren(q(e, "div", "edc-xdw-red", K.loadReject(f)));
				return;
			}
			l = u.log;
			let g = nr(u.log);
			E.replaceChildren(q(e, "div", "edc-read-loaded", K.loaded(u.log.fileName, u.log.createdAt))), p.hidden = !1, m.textContent = "", h.textContent = "", _.hidden = !0, v.textContent = `${B.tokens(rr(u.log.calls))}${K.loadedTokens}`, y.replaceChildren(q(e, "div", "edc-read-locked", K.locked)), se(g, u.log), le();
		})().catch((n) => {
			t === r && E.replaceChildren(q(e, "div", "edc-xdw-red", K.loadReject(gi(n))));
		});
	});
	let ue = {
		async run(t) {
			if (i || a) return;
			let u = ++r;
			i = !0, o = new AbortController(), p.hidden = !1, _.hidden = !1, _.disabled = !1, _.textContent = K.abort, m.textContent = K.starting, h.textContent = "", v.textContent = B.tokens({
				A: {
					input: 0,
					output: 0
				},
				B: {
					input: 0,
					output: 0
				}
			}), y.replaceChildren(), b.replaceChildren(), E.replaceChildren(), ce(), n.changed();
			let d = (e) => {
				u === r && (m.textContent = K.status(e), h.textContent = e.note ?? "", v.textContent = B.tokens(e.usage), c = e.pausedUntil, ne(), c !== null && s === null && (s = setInterval(() => {
					try {
						ne();
					} catch {}
				}, 1e3)));
			}, f;
			try {
				let n = dr({
					decode: (t) => ot(e, t),
					encode: (t) => ct(e, t)
				});
				f = await mr({
					...t,
					signal: o.signal,
					onProgress: d
				}, n);
			} catch (t) {
				if (u !== r) return;
				y.replaceChildren(q(e, "div", "edc-xdw-red edc-read-error", K.crash(gi(t))), q(e, "div", "edc-read-locked", K.locked)), le();
				return;
			}
			if (u !== r) return;
			l = f.log, v.textContent = B.tokens(rr(f.log.calls));
			let g = f.status === "done" ? K.done : f.status === "cancelled" ? K.cancelled : f.stopText ?? "";
			y.replaceChildren(q(e, "div", f.status === "stopped" ? "edc-xdw-red edc-read-stop" : "edc-read-done-text", N(g, kt())), q(e, "div", "edc-read-locked", K.locked)), b.replaceChildren(...f.notes.map((t) => q(e, "div", "edc-xdw-red edc-read-note-item", N(K.note(t), kt())))), se(f.verify, f.log), le();
		},
		busy: () => i,
		submitting: () => d,
		ended: () => a,
		abort: () => {
			try {
				o?.abort();
			} catch {}
		},
		reset() {
			r++;
			try {
				o?.abort();
			} catch {}
			o = null, i = !1, a = !1, l = null, u = null, d = !1, A.replaceChildren(), te(), c = null, f?.dispose(), f = null, p.hidden = !0, m.textContent = "", h.textContent = "", g.hidden = !0, v.textContent = "", y.replaceChildren(), b.replaceChildren(), E.replaceChildren(), D.replaceChildren(), O.hidden = !0, S.hidden = !0, w.value = "", ce();
		},
		refreshLoad: ce
	};
	return ce(), ue;
}
//#endregion
//#region src/xdwread/ui.ts
var vi = "edcXdwRead", J = {
	title: "Claude 讀值",
	notAvailable: "這個類別的自動讀值尚未提供",
	intro: "按『開始讀取』後，會送出的每一頁會整頁送到 Claude（Anthropic）讀取；兩個模型各讀一次，兩次讀到的字完全相同才會帶入。",
	waiting: "選檔後會自動準備每一頁，結果列在這裡。",
	preparing: (e, t) => `準備頁面 ${e}/${t}`,
	summary: (e, t) => t > 0 ? `會送出 ${e} 頁、不送 ${t} 頁（需人工輸入）` : `會送出 ${e} 頁`,
	ok: "會送出",
	bad: "不送（需人工輸入）：",
	noSize: "這頁的尺寸不能送出，請人工輸入",
	category: "檢測類別",
	categoryDefault: "地下水",
	categoryHint: "版型預設，請確認",
	agency: "檢測機構",
	year: "期別（民國年）",
	quarter: "季",
	choose: "請選擇",
	confirm: (e) => `開始讀取 ${e} 頁（約 ${2 * e} 次呼叫）`,
	confirmed: "已開始",
	why: {
		preparing: "頁面還在準備，請等它做完",
		noFile: "還沒有選檔",
		none: "沒有可以送出的頁",
		key: "尚未設定 Claude 金鑰（在下方「Claude 連線設定」儲存）",
		sha: "無法計算檔案的 SHA-256，不能送出",
		reading: "讀值進行中",
		ended: "這次讀值已結束；要重讀請重新選檔",
		category: "請填檢測類別",
		agency: "請選擇檢測機構",
		year: "請選擇期別的年",
		quarter: "請選擇期別的季",
		confirmed: "已開始；改任何欄位可以重新開始"
	},
	pageFail: (e) => `這頁無法處理：${e}`,
	pngFail: "這頁的送出圖做不出來",
	notWater: "目前不在水質分頁或沒有選計畫，沒有送出。",
	inconsistent: (e) => `送出前檢查不一致（第 ${e} 頁），沒有送出。請重新選檔。`,
	confirmFail: (e) => `確認失敗：${e}`
};
function yi(e) {
	return e.reading ? J.why.reading : e.ended ? J.why.ended : e.preparing ? J.why.preparing : e.hasFile ? e.hasSha ? e.sendCount <= 0 ? J.why.none : e.hasKey ? e.category.trim() ? e.agency ? e.year ? e.quarter ? e.confirmed ? J.why.confirmed : null : J.why.quarter : J.why.year : J.why.agency : J.why.category : J.why.key : J.why.sha : J.why.noFile;
}
function bi(e = /* @__PURE__ */ new Date()) {
	let t = e.getFullYear() - 1911;
	return [
		t - 2,
		t - 1,
		t,
		t + 1
	];
}
var xi = (e) => e.image instanceof Blob && e.image.size > 0 && !!e.box;
function Si(e, t) {
	if (e.length !== t) return e.length + 1;
	for (let t = 0; t < e.length; t++) {
		let n = e[t];
		if (n.page !== t + 1) return t + 1;
		if (n.mode === "whole") {
			if (!xi(n) || n.box.x !== 0 || n.box.y !== 0 || n.reason !== "") return n.page;
		} else if (n.mode !== "skip" || n.image !== null || n.box !== null || !n.reason) return n.page;
	}
	return e.some((e) => e.mode === "whole") ? null : 1;
}
var Ci = 1600;
function wi(e, t, n = Ci) {
	let r = e > n ? n / e : 1;
	return r === 1 ? {
		w: e,
		h: t
	} : {
		w: Math.round(e * r),
		h: Math.round(t * r)
	};
}
var Ti = (e, t) => et(e, t).ok;
function Ei(e, t, n) {
	let r = wi(t, n);
	return Ti(r.w, r.h) ? null : Di(e, J.noSize);
}
var Di = (e, t) => ({
	page: e,
	mode: "skip",
	image: null,
	box: null,
	reason: t
});
function Oi(e) {
	let t = e.agencies.find((t) => t.code === e.agencyCode);
	if (!t) throw Error("檢測機構不在代碼表裡");
	let n = Number(e.year), r = Number(e.quarter);
	if (!Number.isInteger(n) || !Number.isInteger(r) || r < 1 || r > 4) throw Error("期別不正確");
	return {
		fileName: e.fileName,
		xdwSha256: e.xdwSha256,
		category: e.category.trim(),
		agency: {
			code: t.code,
			name: t.name
		},
		period: {
			rocYear: n,
			quarter: r
		},
		pages: e.entries.map((e) => ({
			page: e.page,
			mode: e.mode,
			image: e.image,
			box: e.box ? { ...e.box } : null,
			reason: e.reason
		}))
	};
}
function ki() {
	try {
		return typeof state < "u" && !!state && state.currentTab === "water" && !!state.currentProjectId;
	} catch {
		return !1;
	}
}
function Ai() {
	try {
		return typeof AGENCY_CODES > "u" || !AGENCY_CODES ? [] : Object.entries(AGENCY_CODES).map(([e, t]) => ({
			code: String(e),
			name: String(t)
		}));
	} catch {
		return [];
	}
}
function Y(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var ji = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
function Mi(e, t, n = {}) {
	let r = 0, i = !1, a = !1, o = "", s = null, c = 0, l = [], u = !1, d = [], f = null, p = null, m = n.onConfirm ?? ((e) => f ? f.run(e) : void 0), h = () => !!f && f.busy(), g = () => !!f && f.ended(), _ = () => h() || g(), v = () => l.filter((e) => e.mode === "whole").length, y = () => ({
		preparing: a,
		hasFile: c > 0,
		sendCount: v(),
		hasKey: !!kt(),
		confirmed: u,
		hasSha: !!s,
		reading: h(),
		ended: g(),
		category: p?.category.value ?? "",
		agency: p?.agency.value ?? "",
		year: p?.year.value ?? "",
		quarter: p?.quarter.value ?? ""
	}), b = () => J.summary(v(), l.length - v()), x = () => {
		if (!p) return;
		let e = y(), t = yi(e);
		p.confirm.textContent = u || e.reading || e.ended ? J.confirmed : J.confirm(e.sendCount), p.confirm.disabled = t !== null, p.why.textContent = t ?? "", !a && l.length && l.length === c && (p.summary.textContent = b());
		let n = _();
		for (let e of [
			p.category,
			p.agency,
			p.year,
			p.quarter
		]) e.disabled = n;
		f?.refreshLoad();
	}, S = (t) => {
		p?.done.append(Y(e, "div", "edc-xdw-red edc-read-error", t));
	}, C = (t, n, r) => {
		let i = Y(e, "label", "edc-read-field");
		i.append(Y(e, "span", "edc-read-label", n));
		let a = Y(e, "select", "edc-read-input");
		a.id = t;
		let o = Y(e, "option", void 0, J.choose);
		o.value = "", a.append(o);
		for (let t of r) {
			let n = Y(e, "option", void 0, t.text);
			n.value = t.value, a.append(n);
		}
		return a.value = "", i.append(a), {
			wrap: i,
			sel: a
		};
	}, w = (e) => {
		let t = l.find((t) => t.page === e);
		return t ? {
			mode: t.mode,
			image: t.image,
			box: t.box ? { ...t.box } : null
		} : null;
	}, T = () => {
		let r = Y(e, "h3", "edc-read-title", J.title), i = Y(e, "p", "edc-read-intro", J.intro);
		i.id = "edcReadIntro";
		let m = Y(e, "div", "edc-read-progress", J.waiting);
		m.id = "edcReadProgress", m.setAttribute("aria-live", "polite");
		let h = Y(e, "div", "edc-read-summary");
		h.id = "edcReadSummary";
		let g = Y(e, "div", "edc-read-pages");
		g.id = "edcReadPages";
		let _ = Y(e, "div", "edc-read-form");
		_.id = "edcReadForm";
		let v = Y(e, "label", "edc-read-field");
		v.append(Y(e, "span", "edc-read-label", J.category));
		let y = Y(e, "input", "edc-read-input");
		y.type = "text", y.id = "edcReadCategory", y.value = J.categoryDefault, y.autocomplete = "off", v.append(y, Y(e, "span", "edc-read-hint", J.categoryHint)), d = Ai();
		let b = C("edcReadAgency", J.agency, d.map((e) => ({
			value: e.code,
			text: `${e.name}（${e.code}）`
		}))), S = C("edcReadYear", J.year, bi().map((e) => ({
			value: String(e),
			text: `${e} 年`
		}))), T = C("edcReadQuarter", J.quarter, [
			1,
			2,
			3,
			4
		].map((e) => ({
			value: String(e),
			text: `第 ${e} 季`
		})));
		_.append(v, b.wrap, S.wrap, T.wrap);
		let D = Y(e, "div", "edc-read-confirm-row"), O = Y(e, "button", "edc-xdw-btn edc-read-confirm");
		O.type = "button", O.id = "edcReadConfirm";
		let k = Y(e, "span", "edc-read-why-disabled");
		k.id = "edcReadDisabledWhy", D.append(O, k);
		let ee = Y(e, "div", "edc-read-done");
		ee.id = "edcReadDone", ee.setAttribute("aria-live", "polite");
		let A = Y(e, "div", "edc-read-runslot");
		t.replaceChildren(r, i, m, h, g, _, D, ee, A), p = {
			progress: m,
			summary: h,
			pages: g,
			category: y,
			agency: b.sel,
			year: S.sel,
			quarter: T.sel,
			confirm: O,
			why: k,
			done: ee
		}, f = _i(e, A, {
			canLoad: () => a ? J.why.preparing : c <= 0 || l.length !== c ? J.why.noFile : s ? null : J.why.sha,
			sha: () => s,
			fileName: () => o,
			frag: w,
			changed: () => {
				try {
					x();
				} catch {}
			},
			closeModal: n.closeModal
		});
		let te = () => {
			try {
				u = !1, x();
			} catch {}
		};
		for (let e of [
			y,
			b.sel,
			S.sel,
			T.sel
		]) e.addEventListener("input", te), e.addEventListener("change", te);
		O.addEventListener("click", () => {
			try {
				E().catch(() => {});
			} catch {}
		});
	}, E = async () => {
		if (!p) return;
		if (yi(y()) !== null) {
			x();
			return;
		}
		if (!ki()) {
			S(J.notWater);
			return;
		}
		let e = Si(l, c);
		if (e !== null) {
			S(J.inconsistent(e));
			return;
		}
		let t;
		try {
			t = Oi({
				fileName: o,
				xdwSha256: s ?? "",
				category: p.category.value,
				agencyCode: p.agency.value,
				agencies: d,
				year: p.year.value,
				quarter: p.quarter.value,
				entries: l
			});
		} catch (e) {
			S(J.confirmFail(ji(e)));
			return;
		}
		u = !0, x();
		try {
			await m(t);
		} catch (e) {
			S(J.confirmFail(ji(e)));
		}
		x();
	}, D = () => {
		r++, a = !1, l = [], c = 0, o = "", s = null, u = !1;
		try {
			f?.reset();
		} catch {}
		p && (p.pages.replaceChildren(), p.summary.replaceChildren(), p.done.replaceChildren(), p.progress.textContent = J.waiting, x());
	}, O = () => {
		if (D(), i = ki(), t.hidden = !1, i) {
			T(), x();
			return;
		}
		p = null, f = null;
		let n = Y(e, "div", "edc-read-why", J.notAvailable);
		t.replaceChildren(n);
	}, k = (t) => {
		let n = Y(e, "div", "edc-read-page " + (t.mode === "whole" ? "edc-read-page-ok" : "edc-read-page-bad"));
		n.dataset.page = String(t.page), n.dataset.mode = t.mode;
		let r = Y(e, "div", "edc-read-page-head");
		return r.append(Y(e, "strong", void 0, `第 ${t.page} 頁`)), t.mode === "whole" ? r.append(Y(e, "span", "edc-read-ok", J.ok)) : r.append(Y(e, "span", "edc-read-bad", J.bad + t.reason)), n.append(r), n;
	}, ee = async (e, t, n) => {
		let r = t.index + 1, i = Ei(r, t.width, t.height);
		if (i) return i;
		try {
			let i = await qe(() => e.render(t.index, Ci)), a = i.width, o = i.height, s = null;
			try {
				if (!n()) return null;
				Ti(a, o) && (s = await at(i));
			} finally {
				i.width = 0, i.height = 0;
			}
			return Ti(a, o) ? !s || s.size <= 0 ? Di(r, J.pngFail) : {
				page: r,
				mode: "whole",
				image: s,
				box: {
					x: 0,
					y: 0,
					w: a,
					h: o
				},
				reason: ""
			} : Di(r, J.noSize);
		} catch (e) {
			return Di(r, J.pageFail(ji(e)));
		}
	};
	return e.addEventListener("click", (e) => {
		try {
			let t = e.target;
			p && t && typeof t.closest == "function" && t.closest("#edcXdwConnect") && x();
		} catch {}
	}), {
		prepare: O,
		start: async (e, t, n, u = null) => {
			if (!i || !p) return;
			if (!ki()) {
				O();
				return;
			}
			D();
			let d = r, f = () => d === r && n();
			o = t, s = u, c = e.pages.length, a = !0, x();
			try {
				for (let t = 0; t < e.pages.length; t++) {
					if (!f() || !p) return;
					p.progress.textContent = J.preparing(t + 1, c);
					let n = await ee(e, e.pages[t], f);
					if (!n || !f() || !p) return;
					l.push(n), p.pages.append(k(n)), x(), await new Promise((e) => setTimeout(e, 0));
				}
				if (!f() || !p) return;
				p.progress.textContent = "", p.summary.textContent = b();
			} finally {
				d === r && (a = !1, x());
			}
		},
		reset: D,
		refresh: x,
		busy: h,
		submitting: () => !!f && f.submitting()
	};
}
//#endregion
//#region src/xdw/modal.ts
var Ni = "edcXdwModal", X = {
	title: "📄 匯入檔案（XDW）",
	notice: "選檔後只在這台電腦解開。按下『開始讀取』之前，不會把任何內容傳出去；按下後，會送出的每一頁會整頁送到 Claude（Anthropic）讀取。",
	noticeOther: "選檔後只在這台電腦解開並預覽，不會把任何內容傳出去。這個類別的自動讀值尚未提供。",
	thumbsTitle: "原始頁面（只在這台電腦顯示，不會送出）",
	thumbsTitleWater: "原始頁面（按『開始讀取』後會整頁送到 Claude 讀取）",
	drop: "把 DocuWorks 的 .xdw 檔拖進這裡，或",
	pick: "選擇檔案",
	notXdw: "這不是 DocuWorks 的 .xdw 檔",
	oneFile: "一次只能放一個 .xdw 檔",
	failTail: "這個檔目前讀不了，請先用人工輸入，並把這個檔交給 David。",
	warnTail: "這個檔可能不完整，請核對頁數。",
	decoding: "解開中…",
	busyLeave: "讀值進行中，關閉會中止，這次的結果不保留（可先下載讀值紀錄）",
	submitLeave: "正在把讀值交給原網站，現在關閉會中止。要關閉嗎？"
}, Pi = 1650;
function Z(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var Fi = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
function Ii(e) {
	e.querySelectorAll("canvas").forEach((e) => {
		e.width = 0, e.height = 0, e.remove();
	});
}
function Li(e, t = (e) => Je(e)) {
	let n = null, r = 0, i = null, a = 0, o = () => {
		if (n && n.overlay.isConnected) return n;
		e.getElementById(Ni)?.remove();
		let t = Z(e, "div", "edc-xdw-overlay");
		t.id = Ni, t.hidden = !0, t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-labelledby", "edcXdwTitle");
		let r = Z(e, "div", "edc-xdw-dialog"), i = Z(e, "div", "edc-xdw-head"), a = Z(e, "h2", "edc-xdw-title", X.title);
		a.id = "edcXdwTitle";
		let o = Z(e, "button", "edc-xdw-close", "✕ 關閉");
		o.type = "button", o.id = "edcXdwClose", i.append(a, o);
		let l = Z(e, "p", "edc-xdw-note", X.notice);
		l.id = "edcXdwNotice";
		let u = Z(e, "div", "edc-xdw-drop");
		u.id = "edcXdwDrop";
		let d = Z(e, "input");
		d.type = "file", d.accept = ".xdw", d.id = "edcXdwFile", d.hidden = !0;
		let f = Z(e, "button", "edc-xdw-btn edc-xdw-pick", X.pick);
		f.type = "button", f.id = "edcXdwPick", u.append(e.createTextNode(X.drop), f, d);
		let m = Z(e, "div", "edc-xdw-status");
		m.id = "edcXdwStatus", m.setAttribute("aria-live", "polite");
		let h = Z(e, "div", "edc-xdw-errors");
		h.id = "edcXdwErrors", h.hidden = !0;
		let g = Z(e, "h3", "edc-xdw-thumbs-title", X.thumbsTitle);
		g.id = "edcXdwThumbsTitle", g.hidden = !0;
		let _ = Z(e, "div", "edc-xdw-thumbs");
		_.id = "edcXdwThumbs";
		let v = Z(e, "section", "edc-read");
		v.id = vi, v.hidden = !0;
		let y = Z(e, "section", "edc-xdw-connect");
		y.id = "edcXdwConnect", y.hidden = !0, r.append(i, l, u, m, h, g, _, v, y);
		let b = Z(e, "div", "edc-xdw-zoom");
		b.id = "edcXdwZoom", b.hidden = !0;
		let x = Z(e, "div", "edc-xdw-zoom-bar"), S = Z(e, "span"), C = Z(e, "button", "edc-xdw-close", "✕ 關閉放大");
		C.type = "button", C.id = "edcXdwZoomClose", x.append(S, C);
		let w = Z(e, "div");
		w.id = "edcXdwZoomBody", b.append(x, w), t.append(r, b);
		let T = (e) => () => {
			try {
				Promise.resolve(e()).catch(() => {});
			} catch {}
		};
		return o.addEventListener("click", T(() => {
			s() && p.close();
		})), C.addEventListener("click", T(() => c())), f.addEventListener("click", T(() => d.click())), d.addEventListener("change", T(() => {
			let e = d.files;
			if (!(!e || !e.length)) {
				if (!s()) {
					d.value = "";
					return;
				}
				return p.handleFiles(Array.from(e));
			}
		})), t.addEventListener("dragover", (e) => {
			try {
				e.preventDefault(), u.classList.add("edc-xdw-drag");
			} catch {}
		}), t.addEventListener("dragleave", (e) => {
			try {
				(e.target === t || e.target === u) && u.classList.remove("edc-xdw-drag");
			} catch {}
		}), t.addEventListener("drop", (e) => {
			try {
				e.preventDefault(), u.classList.remove("edc-xdw-drag");
				let t = e.dataTransfer?.files;
				t && t.length && s() && p.handleFiles(Array.from(t)).catch(() => {});
			} catch {}
		}), (e.body ?? e.documentElement).append(t), n = {
			overlay: t,
			close: o,
			input: d,
			drop: u,
			status: m,
			errors: h,
			thumbs: _,
			connect: y,
			zoom: b,
			zoomTitle: S,
			zoomBody: w,
			note: l,
			thumbsTitle: g,
			read: Mi(e, v, { closeModal: () => p.close() })
		}, n;
	}, s = () => {
		try {
			if (!n) return !0;
			let t = n.read.busy() ? X.busyLeave : n.read.submitting() ? X.submitLeave : null;
			return t === null || (e.defaultView ?? window).confirm(t);
		} catch {
			return !1;
		}
	}, c = () => {
		a++, n && (n.zoom.hidden = !0, Ii(n.zoomBody), n.zoomBody.replaceChildren());
	}, l = () => {
		r++, c();
		let e = i;
		if (i = null, e && e.close().catch(() => {}), n) {
			try {
				n.read.reset();
			} catch {}
			n.thumbsTitle.hidden = !0, Ii(n.thumbs), n.thumbs.replaceChildren(), n.status.replaceChildren(), n.errors.replaceChildren(), n.errors.hidden = !0;
		}
	}, u = (t, r) => {
		if (!n) return;
		let i = Z(e, "ul");
		for (let n of t) i.append(Z(e, "li", void 0, n));
		n.errors.replaceChildren(i, Z(e, "div", "edc-xdw-red", r)), n.errors.hidden = !1;
	}, d = (t) => {
		n && n.status.replaceChildren(Z(e, "span", "edc-xdw-red", t));
	}, f = async (t, r) => {
		let o = i;
		if (!n || !o) return;
		c();
		let s = ++a;
		n.zoomTitle.textContent = `第 ${t + 1} 頁（原始 ${r.width}×${r.height}）`, n.zoomBody.replaceChildren(Z(e, "div", void 0, X.decoding)), n.zoom.hidden = !1;
		try {
			let e = await qe(() => o.render(t, Pi));
			if (s !== a || o !== i) {
				e.width = 0, e.height = 0;
				return;
			}
			e.id = "edcXdwZoomCanvas", n.zoomBody.replaceChildren(e);
		} catch (r) {
			if (s !== a) return;
			n.zoomBody.replaceChildren(Z(e, "div", "edc-xdw-thumb-bad", `第 ${t + 1} 頁無法顯示：${Fi(r)}`));
		}
	}, p = {
		open() {
			let e = o(), t = ki();
			e.note.textContent = t ? X.notice : X.noticeOther, e.thumbsTitle.textContent = t ? X.thumbsTitleWater : X.thumbsTitle;
			try {
				e.read.prepare();
			} catch {}
			e.overlay.hidden = !1;
			try {
				e.close.focus();
			} catch {}
		},
		close() {
			l(), n && (n.input.value = "", n.connect.querySelectorAll("input").forEach((e) => {
				e.value = "";
			}), n.overlay.hidden = !0);
		},
		getConnectSlot() {
			return o().connect;
		},
		async handleFiles(n) {
			let a = o();
			l();
			let s = r;
			if (n.length !== 1) {
				d(X.oneFile);
				return;
			}
			let c = n[0], p;
			try {
				p = new Uint8Array(await c.slice(0, 1).arrayBuffer());
			} catch (e) {
				s === r && d(`${X.notXdw}（${Fi(e)}）`);
				return;
			}
			if (s !== r) return;
			if (!/\.xdw$/i.test(c.name) || p[0] !== 96) {
				d(X.notXdw);
				return;
			}
			a.status.replaceChildren(Z(e, "span", void 0, `${c.name}：${X.decoding}`));
			let m, h = null;
			try {
				let e = new Uint8Array(await c.arrayBuffer());
				if (s !== r) return;
				try {
					h = await lt(e);
				} catch {
					h = null;
				}
				if (s !== r) return;
				try {
					m = await t(e);
				} finally {
					e = null;
				}
			} catch (t) {
				if (s !== r) return;
				a.status.replaceChildren(Z(e, "span", void 0, c.name)), u([Fi(t)], X.failTail);
				return;
			}
			if (s !== r) {
				m.close().catch(() => {});
				return;
			}
			i = m;
			let g = Z(e, "span", void 0, `共 ${m.pages.length} 頁`);
			g.id = "edcXdwPageCount";
			let _ = Z(e, "span", "edc-xdw-red");
			_.id = "edcXdwBadCount", a.status.replaceChildren(Z(e, "span", void 0, `${c.name}　`), g, _), m.warnings.length && u(m.warnings.flatMap((e) => e.split("；")).map((e) => e.trim()).filter(Boolean), X.warnTail), a.thumbsTitle.hidden = !1;
			let v = m.pages.map((t) => {
				let n = Z(e, "button", "edc-xdw-thumb");
				return n.type = "button", n.dataset.page = String(t.index + 1), n.append(Z(e, "div", "edc-xdw-thumb-cap", `第 ${t.index + 1} 頁・${X.decoding}`)), a.thumbs.append(n), n;
			}), y = 0;
			for (let t of m.pages) {
				if (s !== r) return;
				let n = v[t.index], i = `第 ${t.index + 1} 頁・原始 ${t.width}×${t.height}`;
				try {
					let a = await qe(() => m.render(t.index, 220));
					if (s !== r) {
						a.width = 0, a.height = 0;
						return;
					}
					n.replaceChildren(a, Z(e, "div", "edc-xdw-thumb-cap", i)), n.title = "點一下放大", n.addEventListener("click", () => {
						try {
							f(t.index, t).catch(() => {});
						} catch {}
					});
				} catch (i) {
					if (s !== r) return;
					y++;
					let a = Z(e, "div", "edc-xdw-thumb edc-xdw-thumb-bad", `第 ${t.index + 1} 頁無法顯示：${Fi(i)}`);
					a.dataset.page = String(t.index + 1), n.replaceWith(a), _.textContent = `其中 ${y} 頁無法顯示`;
				}
			}
			if (s === r) try {
				await a.read.start(m, c.name, () => s === r && i === m, h);
			} catch {}
		}
	};
	return e.addEventListener("keydown", (e) => {
		try {
			if (e.key !== "Escape" || !n || n.overlay.hidden) return;
			n.zoom.hidden ? s() && p.close() : c();
		} catch {}
	}), p;
}
//#endregion
//#region src/claude/panel.ts
var Q = {
	status: "edcClaudeStatus",
	input: "edcClaudeKeyInput",
	save: "edcClaudeSave",
	test: "edcClaudeTest",
	remove: "edcClaudeRemove",
	msg: "edcClaudeMsg",
	results: "edcClaudeResults",
	notice: "edcClaudeNotice"
};
function $(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
function Ri(e, t) {
	if (t.hidden = !1, t.querySelector("#" + Q.status)) return zi(e), !1;
	let n = $(e, "h3", "edc-xdw-connect-title", M.heading), r = $(e, "p", "edc-xdw-connect-note", M.notice);
	r.id = Q.notice;
	let i = $(e, "div", "edc-xdw-connect-status");
	i.id = Q.status, i.setAttribute("aria-live", "polite");
	let a = $(e, "div", "edc-xdw-connect-row"), o = $(e, "input", "edc-xdw-connect-input");
	o.type = "password", o.id = Q.input, o.autocomplete = "off", o.spellcheck = !1, o.placeholder = M.placeholder, o.setAttribute("aria-label", M.placeholder), o.setAttribute("data-lpignore", "true");
	let s = (t, n, r = "edc-xdw-btn") => {
		let i = $(e, "button", r, n);
		return i.type = "button", i.id = t, i;
	}, c = s(Q.save, M.save), l = s(Q.test, M.test), u = s(Q.remove, M.remove, "edc-xdw-close");
	a.append(o, c, l, u);
	let d = $(e, "div", "edc-xdw-connect-msg");
	d.id = Q.msg, d.setAttribute("aria-live", "polite");
	let f = $(e, "ul", "edc-xdw-connect-results");
	f.id = Q.results, t.replaceChildren(n, r, i, a, d, f);
	let p = (t, n = "ok") => {
		d.replaceChildren($(e, "span", n === "red" ? "edc-xdw-red" : n === "gray" ? "edc-xdw-connect-gray" : "edc-xdw-connect-ok", t));
	}, m = [
		c,
		l,
		u
	], h = !1;
	return c.addEventListener("click", () => {
		try {
			if (h) return;
			let e = Et(o.value);
			if (o.value = "", f.replaceChildren(), !e) {
				p(M.badFormat, "red");
				return;
			}
			if (!At(e)) {
				p(M.storageFail, "red");
				return;
			}
			p(M.savedOk);
		} catch {}
		try {
			zi(e);
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
				let t = o.value !== "", n = kt();
				if (!n) {
					p(M.needKey, "red");
					return;
				}
				t && p(M.unsavedNote, "gray");
				for (let t of ft) {
					let r = $(e, "li", "edc-xdw-connect-gray", `${t}：${M.testing}`);
					f.append(r);
					let i = await Tt(n, t);
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
			if (!t || !t.confirm(M.confirmRemove)) return;
			jt(), o.value = "", f.replaceChildren(), p(M.removed);
		} catch {}
		try {
			zi(e);
		} catch {}
	}), zi(e), !0;
}
function zi(e) {
	let t = e.getElementById(Q.status);
	if (!t) return;
	let n = kt();
	t.textContent = n ? M.saved(Dt(n)) : M.none, t.classList.toggle("edc-xdw-connect-has", !!n);
}
function Bi(e) {
	let t = e.getElementById(Q.input);
	t && (t.value = ""), e.getElementById(Q.msg)?.replaceChildren(), e.getElementById(Q.results)?.replaceChildren();
}
//#endregion
//#region src/xdw/index.ts
var Vi = null;
function Hi(e = document) {
	return Vi ||= Li(e), Vi;
}
function Ui(e = document) {
	let t = Hi(e);
	t.open();
	try {
		Ri(e, t.getConnectSlot()), Bi(e);
	} catch {}
}
function Wi(e = document) {
	He(e, () => Ui(e));
}
//#endregion
//#region src/main.ts
function Gi() {
	let e = t(document.title);
	e !== document.title && (document.title = e);
}
function Ki() {
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
function qi() {
	let e = document.getElementById("versionBadge");
	if (!e) return;
	let t = e.textContent ?? "", r = n(t, "v1.3");
	r !== t && (e.textContent = r);
}
function Ji() {
	try {
		Gi(), Ki(), qi();
	} catch {}
}
var Yi = !1;
function Xi() {
	if (Yi) return;
	let e = document.getElementById("versionBadge");
	!e || typeof MutationObserver > "u" || (Yi = !0, new MutationObserver(() => {
		try {
			qi();
		} catch {}
	}).observe(e, {
		childList: !0,
		characterData: !0,
		subtree: !0
	}));
}
Ji(), Xi(), document.readyState !== "complete" && document.addEventListener("DOMContentLoaded", () => {
	Ji(), Xi();
}, { once: !0 });
function Zi() {
	let e = T();
	try {
		D({
			SmartParse: typeof SmartParse < "u" ? SmartParse : void 0,
			ImportEngine: typeof ImportEngine < "u" ? ImportEngine : void 0,
			XLSX: typeof XLSX < "u" ? XLSX : void 0
		}, e), Ne(e, typeof SmartParse < "u" ? SmartParse : void 0);
	} catch (t) {
		e.mode = "failed", e.errors.push("啟動失敗：" + String(t));
	}
	try {
		De(e, {
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
var Qi = null;
try {
	Qi = Zi();
} catch {}
var $i = () => {
	try {
		Qi && Ee(Qi, document);
	} catch {}
};
$i(), document.readyState === "loading" && document.addEventListener("DOMContentLoaded", $i, { once: !0 }), window.addEventListener("load", $i, { once: !0 });
try {
	Object.defineProperty(window, "__edcPage2Status", {
		configurable: !0,
		get: () => Qi ? {
			mode: Qi.mode,
			wrapped: [...Qi.wrapped],
			missing: [...Qi.missing],
			errors: [...Qi.errors]
		} : null
	});
} catch {}
try {
	Wi(document);
} catch {}
//#endregion
