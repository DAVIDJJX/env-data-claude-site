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
//#region src/page2/hash.ts
var C = /^[\s　]*[#＃]+[\s　]*/, w = (e) => /^[\s　]*[#＃]/.test(String(e ?? ""));
function T(e) {
	if (!C.test(e)) return null;
	let t = e.replace(C, "");
	return t === "" ? null : t;
}
var E = /^(以下空白|聲明書|本報告|公司名稱|負責人|檢驗室主管|第\d+頁)/, ee = /^[\s　（(【「\[]*/, te = /[:：]\s*$/;
function D(e, t, n, r) {
	let i = y(e, t, r.cellStr), a = i.mode === "column" ? i.value : -1, o = t + 1;
	for (let n = t + 1; n < Math.min(t + 4, e.length); n++) if ((e[n] ?? []).some((e) => /^檢測值$/.test(r.cellStr(e)))) {
		o = n + 1;
		break;
	}
	let s = [];
	for (let t = o; t < n; t++) {
		let n = e[t];
		if (!Array.isArray(n)) continue;
		let o = [];
		if (n.forEach((e, t) => {
			r.cellStr(e) !== "" && o.push(t);
		}), !o.length) continue;
		let c = r.cellStr(n[o[0]]).replace(ee, "");
		if (E.test(c)) break;
		if (/^備註/.test(c)) {
			if (r.hasItemRowBelow?.(e, t + 1)) continue;
			break;
		}
		if (o.length < 2) continue;
		let l;
		if (i.mode === "column") {
			if (l = i.item, r.cellStr(n[l]) === "" || r.cellStr(n[a]) === "") continue;
		} else l = o[0];
		n.slice(0, l).some((e) => te.test(r.cellStr(e))) || s.push({
			r: t,
			c: l
		});
	}
	return s;
}
function ne(e, t) {
	let n = {
		grid: e,
		changed: [],
		onlyHash: []
	};
	if (!Array.isArray(e)) return n;
	let r = t.findCell(e, /檢驗項目|檢測項目/);
	if (!r) return n;
	let i = f(e).blocks.filter((e) => e.header > r.r), a = [{
		header: r.r,
		end: i.length ? i[0].start : e.length
	}, ...i.map((e) => ({
		header: e.header,
		end: e.end
	}))], o = [], s = [], c = /* @__PURE__ */ new Set();
	for (let n of a) for (let { r, c: i } of D(e, n.header, n.end, t)) {
		if (c.has(r)) continue;
		c.add(r);
		let n = e[r][i];
		if (typeof n != "string") continue;
		let a = t.cellStr(n);
		if (!w(a)) continue;
		let l = T(a);
		if (l === null) {
			s.push({
				gridRow: r,
				gridCol: i,
				raw: a
			});
			continue;
		}
		o.push({
			gridRow: r,
			gridCol: i,
			raw: a,
			stripped: l
		});
	}
	if (!o.length) return {
		grid: e,
		changed: o,
		onlyHash: s
	};
	let l = e.slice();
	l._hiddenCols = e._hiddenCols;
	for (let e of o) {
		let t = l[e.gridRow].slice();
		t[e.gridCol] = e.stripped, l[e.gridRow] = t;
	}
	return {
		grid: l,
		changed: o,
		onlyHash: s
	};
}
//#endregion
//#region src/page2/hook.ts
var re = (e, t) => `${String(e ?? "")}\u0000${String(t ?? "")}`, ie = (e) => e instanceof Error ? e.message : String(e);
function ae() {
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
		reconcileAvailable: !1,
		hash: "testing",
		hashRow: /* @__PURE__ */ new WeakMap()
	};
}
var O = (e) => typeof e == "object" && !!e;
function oe(e, t = ae()) {
	try {
		se(e.XLSX, t);
	} catch (e) {
		t.errors.push("包 sheet_to_json 失敗：" + ie(e));
	}
	try {
		ce(e.ImportEngine, t);
	} catch (e) {
		t.errors.push("包 readWorkbookGrids 失敗：" + ie(e));
	}
	try {
		k(e.SmartParse, t);
	} catch (e) {
		t.errors.push("包 parseLabItemTableSheet 失敗：" + ie(e));
	}
	return t.wrapped.includes("SmartParse.parseLabItemTableSheet") || (t.mode = "failed", t.hash = "failed"), t;
}
function se(e, t) {
	let n = O(e) ? e.utils : void 0, r = O(n) ? n.sheet_to_json : void 0, i = O(n) ? n.decode_range : void 0;
	if (!O(n) || typeof r != "function" || typeof i != "function") {
		t.missing.push("XLSX.utils.sheet_to_json");
		return;
	}
	n.sheet_to_json = function(...e) {
		let n = r.apply(this, e);
		try {
			let [r, a] = e;
			if (Array.isArray(n) && O(r)) {
				let e = O(a) ? a.range : void 0, o = null;
				e == null ? typeof r["!ref"] == "string" && (o = i(r["!ref"]).s) : typeof e == "string" && (o = i(e).s), o && !(Number.isInteger(o.r) && Number.isInteger(o.c)) && (o = null), t.sheetOrigin.set(n, {
					origin: o ? {
						r: o.r,
						c: o.c
					} : null,
					ws: r
				});
			}
		} catch (e) {
			t.errors.push("sheet_to_json 記錄失敗：" + ie(e));
		}
		return n;
	}, t.wrapped.push("XLSX.utils.sheet_to_json");
}
function ce(e, t) {
	let n = O(e) ? e.readWorkbookGrids : void 0;
	if (!O(e) || typeof n != "function") {
		t.missing.push("ImportEngine.readWorkbookGrids");
		return;
	}
	e.readWorkbookGrids = async function(...e) {
		let r = await n.apply(this, e);
		try {
			let n = e[0], i = O(n) && typeof n.name == "string" ? n.name : null;
			if (O(r)) {
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
			t.errors.push("readWorkbookGrids 記錄失敗：" + ie(e));
		}
		return r;
	}, t.wrapped.push("ImportEngine.readWorkbookGrids"), t.reconcileAvailable = !0;
}
function k(e, t) {
	let n = O(e) ? e.parseLabItemTableSheet : void 0;
	if (!O(e) || typeof n != "function") {
		t.missing.push("SmartParse.parseLabItemTableSheet");
		return;
	}
	let r = n;
	t.originalParseLab = r;
	let i = e, a = (e, n, a, o) => {
		let s = n, c = null;
		if (o) {
			let e = i._hasItemRowBelow, r = ne(n, {
				findCell: (e, t) => i.findCell(e, t),
				cellStr: (e) => i.cellStr(e),
				hasItemRowBelow: typeof e == "function" ? (t, n) => e.call(i, t, n) : void 0
			});
			if (r.changed.length) {
				s = r.grid;
				let e = t.sheetOrigin.get(n) ?? null;
				c = {
					grid: n,
					changed: r.changed,
					byRow: new Map(r.changed.map((e) => [e.gridRow, e])),
					mapped: /* @__PURE__ */ new Set(),
					origin: e?.origin ?? null,
					ws: e?.ws ?? null,
					bad: !1
				};
			}
		}
		let u = r.call(e, s, a);
		if (c && !de(u, r.call(e, n, a))) return {
			rows: null,
			ok: !1
		};
		if (!Array.isArray(u) || u.length === 0) return {
			rows: u,
			ok: !0
		};
		c && me(t, c, s, fe(i, s), u, 1, i);
		try {
			let e = O(n) ? t.gridSheet.get(n) : void 0;
			e && (e.processed = !0);
		} catch {}
		if (t.mode === "active" || t.mode === "testing") {
			let o = null;
			try {
				o = {
					read: t.gridRead.get(n) ?? null,
					kind: a,
					source: t.gridSource.get(n) ?? null,
					expected: l(n),
					blocks: []
				};
				let d = t.gridSheet.get(n);
				d && (d.outcome = o);
				for (let e of u) O(e) && t.rowOutcome.set(e, o);
				let f = le(e, r, n, s, a, u, o, t, i, c);
				for (let e of f) t.rowOutcome.set(e, o);
				u.push(...f);
			} catch (e) {
				o && (o.error = ie(e), o.blocks = o.blocks.filter((e) => e.status !== "filled")), t.errors.push("補讀失敗：" + ie(e));
			}
		}
		return {
			rows: u,
			ok: !c || !c.bad && he(t, c, u, i)
		};
	};
	e.parseLabItemTableSheet = function(e, n) {
		if (t.hash === "active" || t.hash === "testing" && O(e) && t.selftestGrids.has(e)) try {
			let r = a(this, e, n, !0);
			if (r.ok) return r.rows;
			t.errors.push("去 # 後有列對不回報告的格子，這張表改照原網站讀（不去 #）");
		} catch (e) {
			t.errors.push("去 # 失敗，這張表改照原網站讀（不去 #）：" + ie(e));
		}
		return a(this, e, n, !1).rows;
	}, t.wrapped.push("SmartParse.parseLabItemTableSheet");
}
function le(e, t, n, r, i, a, o, s, c, l) {
	let u = (e) => c.cellStr(e), d = (e) => c.normalizeItemName(e), h = s.sheetOrigin.get(n) ?? null, _ = h?.origin ?? null, y = (e) => e + 1 + (_?.r ?? 0), x = (e, t) => o.blocks.push({
		page: e.page,
		header: e.header,
		headerRow: y(e.header),
		status: "skipped",
		reason: t
	}), { blocks: C, problems: w } = f(r), T = [...C.map((e) => ({
		kind: "block",
		b: e
	})), ...w.map((e) => ({
		kind: "problem",
		...e
	}))].sort((e, t) => (e.kind === "block" ? e.b.page : e.page) - (t.kind === "block" ? t.b.page : t.page)), E = h !== null || s.selftestGrids.has(n), ee = [...a], te = [];
	for (let c of T) {
		if (c.kind === "problem") {
			x(c, c.reason);
			continue;
		}
		let f = c.b;
		if (!E) {
			x(f, "不是 Excel 來源（例如 PDF），不自動補");
			continue;
		}
		if (!m(r, f, u)) {
			x(f, "區塊內第一個「檢驗項目／檢測項目」不是表頭列");
			continue;
		}
		let C = t.call(e, p(r, f), i);
		if (l && r !== n && !de(C, t.call(e, p(n, f), i))) {
			l.bad = !0;
			continue;
		}
		if (!Array.isArray(C) || C.length === 0) {
			x(f, "原網站的解析程式不認得這個區塊");
			continue;
		}
		let w = C.flatMap((e) => g(a[0], e));
		if (w.length) {
			x(f, "頁首和第 1 頁不同：" + [...new Set(w)].join("、"));
			continue;
		}
		let T = v(ee, C);
		if (T.cls === "all-same") {
			o.blocks.push({
				page: f.page,
				header: f.header,
				headerRow: y(f.header),
				status: "upstream-read"
			});
			continue;
		}
		if (T.cls === "conflict") {
			x(f, "和前面頁重複的項目：" + T.items.join("、"));
			continue;
		}
		let D = b(r, f, C, d, u);
		C.forEach((e, t) => {
			let r = D[t], i = null;
			if (_ && h?.ws && r.gridRow !== null && r.gridCol !== null) {
				let e = S(_, r.gridRow, r.gridCol), t = h.ws[e];
				t && t.v === n[r.gridRow][r.gridCol] && (i = e);
			}
			e._edcPage2 = {
				page: f.page,
				cell: i,
				rowGuess: r.gridRow === null ? null : r.gridRow + 1 + (_?.r ?? 0),
				raw: r.raw
			}, l && pe(s, l, e, r.gridRow, f.page);
		}), o.blocks.push({
			page: f.page,
			header: f.header,
			headerRow: y(f.header),
			status: "filled",
			rows: C
		}), ee.push(...C), te.push(...C);
	}
	return te;
}
var ue = /* @__PURE__ */ new Set([
	"檢測項目",
	"檢測濃度/質量單位",
	"其他檢測濃度/質量單位",
	"_uncertainUnit"
]);
function de(e, t) {
	return !Array.isArray(e) || !Array.isArray(t) ? e === t || !e?.length && !t?.length : e.length === t.length && e.every((e, n) => {
		let r = t[n];
		if (!O(e) || !O(r)) return !1;
		let i = /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(r)]);
		for (let t of i) if (!ue.has(t) && JSON.stringify(e[t]) !== JSON.stringify(r[t])) return !1;
		return !0;
	});
}
function fe(e, t) {
	let n = e.findCell(t, /檢驗項目|檢測項目/);
	return n ? n.r : -1;
}
function pe(e, t, n, r, i) {
	if (r === null || !O(n)) return;
	let a = t.byRow.get(r);
	if (!a) return;
	let o = null;
	if (t.origin && t.ws) {
		let e = S(t.origin, r, a.gridCol), n = t.ws[e];
		n && n.v === t.grid[r]?.[a.gridCol] && (o = e);
	}
	e.hashRow.set(n, {
		raw: a.raw,
		stripped: String(n.檢測項目 ?? ""),
		cell: o,
		rowGuess: r + 1 + (t.origin?.r ?? 0),
		page: i
	}), t.mapped.add(a);
}
function me(e, t, n, r, i, a, o) {
	if (r < 0) return;
	let s = b(n, {
		page: a,
		header: r,
		start: 0,
		end: n.length
	}, i, (e) => o.normalizeItemName(e), (e) => o.cellStr(e));
	i.forEach((n, r) => pe(e, t, n, s[r].gridRow, a));
}
function he(e, t, n, r) {
	for (let i of t.changed) {
		if (t.mapped.has(i)) continue;
		let a = r.normalizeItemName(i.stripped);
		if (n.some((t) => O(t) && String(t.檢測項目 ?? "") === a && !e.hashRow.has(t))) return !1;
	}
	return !0;
}
var ge = (e, t) => e.source?.file ?? (typeof t?._sourceFile == "string" ? t._sourceFile : null), _e = (e, t) => e.source?.sheet ?? (typeof t?._sourceSheet == "string" ? t._sourceSheet : null);
function ve(e, t) {
	let n = t.filter((e) => O(e) && O(e._edcPage2)), r = {
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
		if (!O(n)) continue;
		let t = e.rowOutcome.get(n);
		if (t) {
			i.has(t) || i.set(t, n), t.read && a.add(t.read);
			continue;
		}
		let r = typeof n._sourceFile == "string" ? n._sourceFile : null, s = typeof n._sourceSheet == "string" ? n._sourceSheet : null;
		o.add(re(r, s));
		for (let t of e.readsByName.get(String(r ?? "")) ?? []) a.add(t);
	}
	for (let e of a) for (let t of e.sheets) t.outcome && !i.has(t.outcome) && i.set(t.outcome, void 0);
	for (let [e, t] of i) {
		let n = ge(e, t), i = _e(e, t);
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
		let n = o.has(re(e.file, t.sheet)) ? "這張表有第 2 頁以後的表頭，但沒有經過補讀" : "這張表有第 2 頁以後的表頭，但原網站沒有讀這張表，第 2 頁也沒有補";
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
//#region src/page2/hashnotice.ts
var ye = "edcItemHashNotice", be = "Claude 版提醒（項目名稱去 #）：", xe = (e) => `🟣 Claude 版：項目名稱開頭的「#」已去掉，共 ${e} 筆`, Se = "報告上項目名稱前面的「#」是檢驗室的標示（例如「依公告檢測方法分析」），申報的項目名稱不帶「#」。Claude 版在讀報告時已去掉，其餘欄位都照原網站的讀法。（這段提醒只在網頁上，不會寫進匯出檔。）", Ce = /* @__PURE__ */ new Set(["water", "geo"]), A = (e) => e == null ? "" : String(e), we = (e) => typeof e == "object" && !!e, Te = (e) => T(e.trim()) ?? e.trim();
function Ee(e, t) {
	let n = t.getState(), r = n?.smartResult?.rows;
	if (!n || !Array.isArray(r)) return null;
	let i = A(n.importCatKey), a = r.filter((t) => we(t) && e.hashRow.has(t)), o = /* @__PURE__ */ new Map(), s = 0;
	if (Ce.has(i)) for (let e of r) {
		if (!we(e) || !w(e.檢測項目)) continue;
		s++;
		let t = A(e.採樣地點), n = A(e.檢測項目), r = t + "\0" + n, i = o.get(r) ?? {
			station: t,
			item: n,
			count: 0
		};
		i.count++, o.set(r, i);
	}
	let c = A(n.importPeriod).trim(), l = new Set(r.filter(we).map((e) => A(e.檢測項目))), u = [];
	if (a.length || s || Ce.has(i)) try {
		let e = A(n.importProjectId) || A(n.currentProjectId), r = t.getDataStore?.();
		if (!r || typeof r.getData != "function" || !e) throw Error("讀不到 DataStore");
		let a = r.getData(e, i);
		if (!Array.isArray(a)) throw Error("getData 不是陣列");
		let o = /* @__PURE__ */ new Map();
		for (let e of a) {
			let t = A(we(e) ? e.檢測項目 : "");
			if (!w(t)) continue;
			let n = Te(t);
			if (n === t.trim() || !l.has(n)) continue;
			let r = o.get(t) ?? {
				name: t,
				bare: n,
				count: 0,
				samePeriod: 0
			};
			r.count++, c && A(e._period).trim() === c && r.samePeriod++, o.set(t, r);
		}
		u = [...o.values()];
	} catch {
		u = null;
	}
	return {
		catKey: i,
		rows: r,
		stripped: a,
		stillHash: [...o.values()],
		stillHashRows: s,
		old: u,
		importPeriod: c
	};
}
function De(e, t) {
	let n = new Set(t.rows.filter(we).map((e) => A(e.檢測項目))), r = [];
	return e.querySelectorAll("#smartImportMissingItemsWrap .missing-item-single").forEach((e) => {
		if (!e.checked) return;
		let t = A(e.dataset.identityKey).split("::")[0];
		w(t) && n.has(Te(t)) && r.push(t);
	}), r;
}
var Oe = (e) => `第 ${e} 頁`;
function ke(e, t) {
	let n = t.doc, r = n.getElementById(ye), i = Ee(e, t), a = n.getElementById("smartImportSummary");
	if (!i || !a) return r?.remove(), null;
	let o = (i.old ?? []).filter((e) => e.count > 0), s = i.old === null && (i.stripped.length > 0 || i.stillHashRows > 0);
	if (!i.stripped.length && !i.stillHashRows && !o.length && !s) return r?.remove(), null;
	let c = (e, t, r) => {
		let i = n.createElement(e);
		return t != null && (i.textContent = t), r && (i.style.cssText = r), i;
	}, l = c("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #7a5fb0;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	l.id = ye;
	let u = "margin-top:10px;padding:10px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b";
	if (i.stripped.length) {
		l.append(c("div", xe(i.stripped.length), "font-weight:700;font-size:15px")), l.append(c("div", Se, "margin:2px 0 8px"));
		let n = new Set(i.stripped.map((e) => A(e._sourceFile))).size > 1, r = i.stripped.some((t) => e.hashRow.get(t).page >= 3), a = c("div", null, `${i.stripped.length > 8 ? "max-height:300px;overflow:auto;" : ""}background:#fff;border:1px solid #dce5ea;border-radius:4px`), o = c("table", null, "border-collapse:collapse;width:100%;font-size:13px"), s = c("thead"), u = c("tr");
		[
			"來源（工作表!儲存格）",
			"測站",
			"報告原文（項目）",
			"匯入後的項目",
			"狀態"
		].forEach((e, t) => u.append(c("th", e, `text-align:left;padding:5px 8px;background:#ece6f5;border-bottom:1px solid #dce5ea;position:sticky;top:0${t === 0 || t === 4 ? ";white-space:nowrap" : ""}`))), s.append(u), o.append(s);
		let d = c("tbody"), f = Ke(i.rows, t);
		i.stripped.forEach((t, i) => {
			let a = e.hashRow.get(t), o = A(t._sourceSheet), s = a.cell ? `${o}!${a.cell}` : `${o} 第 ${a.rowGuess ?? "?"} 列（位址未確認）`, l = `${n && A(t._sourceFile) ? A(t._sourceFile) + " / " : ""}${s}${r ? `（${Oe(a.page)}）` : ""}`, u = c("tr");
			u.dataset.edcHashRow = String(i), [
				l,
				A(t.採樣地點),
				a.raw,
				A(t.檢測項目)
			].forEach((e, t) => u.append(c("td", e, `padding:4px 8px;border-bottom:1px solid #eef2f5${t === 0 ? ";white-space:nowrap" : ""}`)));
			let p = c("td", f ? f.has(t) ? ze : Be : Ve, "padding:4px 8px;border-bottom:1px solid #eef2f5;white-space:nowrap");
			p.dataset.edcStatus = "", u.append(p), d.append(u);
		}), o.append(d), a.append(o), l.append(a);
	}
	if (i.stillHashRows) {
		let t = c("div", null, u);
		t.dataset.edc = "hash-still", t.append(c("div", `⚠️ 有 ${i.stillHashRows} 筆的項目名稱開頭仍是「#」，Claude 版沒有自動去掉，請在表格裡手動改：`, "font-weight:700")), e.hash === "failed" && t.append(c("div", "（Claude 版的去「#」功能目前無法使用，原網站程式可能已更新。）")), i.stillHash.forEach((e) => t.append(c("div", `・${e.station || "（沒有測站）"}／${e.item}（${e.count} 筆）`))), l.append(t);
	}
	if (o.length) {
		let e = c("div", null, u);
		e.dataset.edc = "hash-old";
		let t = o[0];
		e.append(c("div", `⚠️ 表格裡現有資料的項目名稱還帶「#」（例：「${t.name}」${t.count} 筆），這次匯入的是「${t.bare}」，原網站會把兩者當成不同項目：`, "font-weight:700")), o.length > 1 && e.append(c("div", `・帶「#」的舊項目：${o.map((e) => `${e.name}（${e.count} 筆）`).join("、")}`)), e.append(c("div", `・下方『差異建議』裡若預設勾選了「${t.name}」的新增空白列，請取消勾選。`));
		let n = o.filter((e) => e.samePeriod > 0);
		if (n.length) {
			let t = n[0];
			e.append(c("div", `・這一季（${i.importPeriod}）已經有「${t.name}」的舊資料，確認後不會被更新，表格會多出一筆「${t.bare}」；請匯入後刪掉舊的「${t.name}」列，或先刪掉再匯入。`));
		}
		l.append(e);
	} else s && l.append(c("div", "無法檢查表格裡的舊資料是否帶「#」。", "margin-top:8px;color:#7a8791;font-size:13px"));
	let d = n.getElementById("edcPage2Notice") ?? a;
	return r ? r.replaceWith(l) : d.after(l), l;
}
function Ae(e, t) {
	let n = t.doc.getElementById(ye);
	if (!n) return;
	let r = Ee(e, t);
	if (!r) return;
	let i = Ke(r.rows, t);
	n.querySelectorAll("tr[data-edc-hash-row]").forEach((e) => {
		let t = r.stripped[Number(e.dataset.edcHashRow)], n = e.querySelector("td[data-edc-status]");
		if (!n) return;
		let a = t && i ? i.has(t) ? ze : Be : Ve;
		n.textContent !== a && (n.textContent = a);
	});
}
function je(e, t) {
	let n = Ee(e, t);
	if (!n) return null;
	let r = [];
	n.stillHashRows && r.push(`有 ${n.stillHashRows} 筆的項目名稱開頭仍是「#」，Claude 版沒有自動去掉，請匯入後在表格裡手動改。`);
	let i = De(t.doc, n);
	i.length && r.push(`下方『差異建議』仍勾選了 ${i.length} 項帶「#」的新增空白列（例：「${i[0]}」）；這次的項目已是去掉「#」的名字，確認後會多出這些空白列。`);
	let a = (n.old ?? []).filter((e) => e.samePeriod > 0);
	return a.length && r.push(`這一季已經有「${a[0].name}」等 ${a.reduce((e, t) => e + t.samePeriod, 0)} 筆帶「#」的舊資料，確認後不會被更新，表格會多出去掉「#」的同一筆。`), r.length ? `${be}${r.join("\n")}\n\n詳細請看確認畫面上的紅字。仍要匯入嗎？` : null;
}
//#endregion
//#region src/page2/notice.ts
var Me = "edcPage2Notice", Ne = "Claude 版提醒（第 2 頁補讀）：", Pe = "⚠️ Claude 版的第 2 頁補讀目前無法使用（原網站程式可能已更新）。這次匯入不會自動補第 2 頁，請對照報告手動核對。", Fe = "edcPage2Banner", Ie = "⚠️ Claude 版的第 2 頁補讀目前無法使用（原網站程式可能已更新）。匯入水質／地質報告時不會自動補第 2 頁，請對照報告手動核對。", Le = `${Ne}無法確認第 2 頁補讀的狀態（外掛檢查時出錯），請對照報告手動核對第 2 頁以後的值。\n\n仍要匯入嗎？`, Re = "＊按確認匯入時，會依下方『檢測極限』的處理方式調整", ze = "會匯入", Be = "已取消（不會匯入）", Ve = "無法確認", He = /* @__PURE__ */ new Set(["water", "geo"]), Ue = (e) => e == null ? "" : String(e);
function We(e, t) {
	let n = t.getState(), r = n?.smartResult?.rows;
	if (!n || !Array.isArray(r)) return null;
	let i = Ue(n.importCatKey);
	return {
		sum: ve(e, r),
		rows: r,
		catKey: i
	};
}
var Ge = (e, t) => e.mode === "failed" && He.has(t);
function Ke(e, t) {
	try {
		let n = t.win.filterRowsBySelection, r = t.getState(), i = t.getCategories()?.[Ue(r?.importCatKey)];
		if (typeof n != "function" || !i || typeof i.itemField != "string") return null;
		let a = n.call(t.win, e, i.itemField);
		return Array.isArray(a) ? new Set(a) : null;
	} catch {
		return null;
	}
}
var qe = (e) => `第 ${e} 頁`;
function Je(e, t, n, r) {
	let i = Ue(e._sourceSheet), a = t.cell ? `${i}!${t.cell}` : `${i} 第 ${t.rowGuess ?? "?"} 列（位址未確認）`;
	return `${n && Ue(e._sourceFile) ? `${Ue(e._sourceFile)} / ` : ""}${a}${r ? `（${qe(t.page)}）` : ""}`;
}
var Ye = (e) => {
	let t = Ue(e.檢測數值);
	return `${Ue(e.比較關係) ? Ue(e.比較關係) + " " : ""}${t || "（空白）"}`;
};
function Xe(e) {
	let t = [];
	return e.file && t.push(e.file), t.push(`工作表「${e.sheet ?? "（不明）"}」`), e.page !== null && t.push(qe(e.page)), e.headerRow !== null && t.push(`第 ${e.headerRow} 列起`), t.join("　");
}
function Ze(e, t) {
	let n = t.doc, r = n.getElementById(Me), i = We(e, t), a = n.getElementById("smartImportSummary");
	if (!i || !a) return r?.remove(), null;
	let { sum: o, rows: s, catKey: c } = i, l = Ge(o, c), u = o.mode === "failed" ? [] : o.filled;
	if (!l && !u.length && !o.skipped.length && !o.mismatches.length && !o.upstreamRead.length) return r?.remove(), null;
	let d = (e, t, r) => {
		let i = n.createElement(e);
		return t != null && (i.textContent = t), r && (i.style.cssText = r), i;
	}, f = d("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #7a5fb0;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	f.id = Me;
	let p = "margin-top:10px;padding:10px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b";
	if (l) {
		let e = d("div", null, p);
		e.dataset.edc = "failed", e.append(d("div", Pe, "font-weight:700")), f.append(e);
	}
	let m = /* @__PURE__ */ new Set();
	for (let e of u) m.add(Ue(e._sourceFile));
	for (let e of [
		...o.skipped,
		...o.mismatches,
		...o.upstreamRead
	]) e.file && m.add(e.file);
	let h = m.size > 1;
	if (u.length) {
		let e = [...new Set(u.map((e) => e._edcPage2.page))].sort((e, t) => e - t), n = e[e.length - 1], r = n >= 3, i = r ? `🟣 Claude 版補讀：第 ${e[0]}～${n} 頁共 ${u.length} 筆（${e.map((e) => `${qe(e)} ${u.filter((t) => t._edcPage2.page === e).length} 筆`).join("、")}）` : `🟣 Claude 版補讀：第 2 頁共 ${u.length} 筆`;
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
		let m = d("tbody"), g = Ke(s, t);
		u.forEach((e, t) => {
			let n = e._edcPage2, i = d("tr");
			i.dataset.edcRow = String(t), [
				Je(e, n, h, r),
				Ue(e.採樣地點),
				Ue(e.檢測項目),
				n.raw,
				Ye(e),
				Ue(e.檢測極限) || "—"
			].forEach((e, t) => i.append(d("td", e, `padding:4px 8px;border-bottom:1px solid #eef2f5${t === 0 ? ";white-space:nowrap" : ""}`)));
			let a = d("td", Qe(e, g), "padding:4px 8px;border-bottom:1px solid #eef2f5;white-space:nowrap");
			a.dataset.edcStatus = "", i.append(a), m.append(i);
		}), o.append(m), a.append(o), f.append(a);
		let _ = d("div", Re, "margin-top:4px;font-size:12px;color:#5b6b78");
		_.dataset.edc = "limit-note", f.append(_);
	}
	if (o.upstreamRead.length && f.append(d("div", `原網站已讀到 ${o.upstreamRead.length} 個第 2 頁以後的區塊（Claude 版沒有重複補）。`, "margin-top:8px;color:#7a8791;font-size:13px")), !l && o.skipped.length) {
		let e = d("div", null, p);
		e.dataset.edc = "skipped", e.append(d("div", `⚠️ 有 ${o.skipped.length} 個第 2 頁區塊沒有自動補，請對照報告手動補上`, "font-weight:700")), o.skipped.forEach((t) => e.append(d("div", `・${Xe(t)}：${t.reason}`))), f.append(e);
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
function Qe(e, t) {
	return t ? t.has(e) ? ze : Be : Ve;
}
function $e(e, t) {
	let n = t.doc.getElementById(Me);
	if (!n) return;
	let r = We(e, t);
	if (!r) return;
	let i = r.sum.mode === "failed" ? [] : r.sum.filled, a = Ke(r.rows, t);
	n.querySelectorAll("tr[data-edc-row]").forEach((e) => {
		let t = i[Number(e.dataset.edcRow)], n = e.querySelector("td[data-edc-status]");
		if (!n) return;
		let r = t ? Qe(t, a) : Ve;
		n.textContent !== r && (n.textContent = r);
	});
}
function et(e, t) {
	if (!e.needsConfirm) return null;
	if (e.mode === "failed") return He.has(t) ? `${Ne}第 2 頁補讀目前無法使用（原網站程式可能已更新），這次匯入不會自動補第 2 頁。\n\n請對照報告手動核對。仍要匯入嗎？` : null;
	let n = [];
	return e.skipped.length && n.push(`有 ${e.skipped.length} 個第 2 頁區塊沒有自動補，請對照報告手動補上。`), e.mismatches.length && n.push(`第 2 頁以後的區塊對帳不符（${e.mismatches.length} 張工作表），可能有沒補也沒列出的區塊。`), `${Ne}${n.join("\n")}\n\n詳細請看確認畫面上的紅字。仍要匯入嗎？`;
}
function tt(e, t) {
	let n = t.getElementById(Fe);
	if (e.mode !== "failed") {
		n?.remove();
		return;
	}
	if (n || !t.body) return;
	let r = t.createElement("div");
	r.id = Fe, r.setAttribute("role", "alert"), r.textContent = Ie, r.style.cssText = "position:sticky;top:0;z-index:2147483000;margin:0;padding:8px 14px;background:#fdf1f0;border-bottom:2px solid #d9534f;color:#8a1f1b;font-weight:700;font-size:14px;line-height:1.5", t.body.prepend(r);
}
function nt(e, t) {
	let n = t.win, r = /* @__PURE__ */ new WeakSet(), i = !0, a = () => {
		let n = t.doc.getElementById("smartImportSummary");
		!n || r.has(n) || typeof MutationObserver > "u" || (r.add(n), new MutationObserver(() => {
			try {
				$e(e, t);
			} catch (t) {
				e.errors.push("更新狀態欄失敗：" + String(t));
			}
			try {
				Ae(e, t);
			} catch (t) {
				e.errors.push("更新去 # 狀態欄失敗：" + String(t));
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
			Ze(e, t), ke(e, t), a(), i = !0;
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
			let n = We(e, t), r = [];
			if (n) {
				let e = et(n.sum, n.catKey);
				e && r.push(e);
			}
			let o = je(e, t);
			o && r.push(o), a = r.length ? r.join("\n\n") : null;
		} catch (t) {
			e.errors.push("匯入前檢查失敗：" + String(t)), a = Le;
		}
		if (!(a !== null && !n.confirm(a))) return s.apply(this, r);
	}, e.wrapped.push("confirmSmartImport")) : e.missing.push("confirmSmartImport"), (!e.wrapped.includes("renderSmartImportPreview") || !e.wrapped.includes("confirmSmartImport")) && (e.mode = "failed", e.hash = "failed");
}
//#endregion
//#region src/page2/selftest.ts
var rt = [
	"樣品編號\n檢驗項目",
	"",
	"EDC-SELFTEST",
	"偵測\n極限",
	"單位",
	"檢測方法"
], it = () => [
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
], at = "水溫";
function ot() {
	let e = [
		...it(),
		[...rt],
		[
			"",
			"",
			"檢測值"
		],
		[
			at,
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
		...it(),
		[...rt],
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
var st = (e) => Array.isArray(e) ? e.map((e) => String(e?.檢測項目 ?? "")) : [];
function ct(e, t) {
	let n = (t, n) => (e.mode = t, t === "failed" && e.errors.push("自我測試：" + n), {
		status: t,
		detail: n
	});
	try {
		if (e.mode === "failed" || !e.originalParseLab) return n("failed", "找不到 SmartParse.parseLabItemTableSheet：" + e.missing.join("、"));
		let r = t;
		if (!r || typeof r.parseSheet != "function") return n("failed", "找不到 SmartParse.parseSheet");
		let i = st(e.originalParseLab.call(r, ot(), "water"));
		if (!i.includes("水溫")) return n("failed", "原函式讀不到合成表的第 1 頁");
		if (i.includes("鐵")) return n("upstream-fixed", "原函式已經會讀第 2 頁");
		e.mode = "testing";
		let a = ot();
		e.selftestGrids.add(a);
		let o = r.parseSheet.call(r, "water", "__edc_selftest__", a, { allowAutoDetect: !1 }), s = st(o), c = Array.isArray(o) && o.some((e) => e?.檢測項目 === "鐵" && typeof e?._edcPage2 == "object");
		return s.includes("水溫") && c ? n("active", "正常") : n("failed", `包裝後讀到的項目：${s.join("、") || "（沒有）"}`);
	} catch (e) {
		return n("failed", "丟例外：" + (e instanceof Error ? e.message : String(e)));
	}
}
var lt = ["#水溫", "＃ 鐵"], ut = ["水溫", "鐵"], dt = "#1自我測試站";
function ft() {
	let e = [
		["水質檢測報告"],
		[
			"",
			"",
			"",
			"",
			"採樣地點：",
			dt
		],
		[
			"",
			"",
			"",
			"",
			"採樣時間：",
			"115年01月02日10時00分"
		],
		["樣品特性：", "放流水"],
		[...rt],
		[
			"",
			"",
			"檢測值"
		],
		[
			lt[0],
			"",
			"20.0",
			"--",
			"℃",
			"NIEA W217.52A"
		],
		[
			lt[1],
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
			"第1頁(共1頁)"
		]
	];
	return e._hiddenCols = /* @__PURE__ */ new Set(), e;
}
function pt(e, t) {
	let n = (t, n) => (e.hash = t, t === "failed" && e.errors.push("去 # 自我測試：" + n), {
		status: t,
		detail: n
	});
	try {
		if (e.hash === "failed" || !e.originalParseLab) return n("failed", "找不到 SmartParse.parseLabItemTableSheet");
		let r = t;
		if (!r || typeof r.parseSheet != "function") return n("failed", "找不到 SmartParse.parseSheet");
		e.hash = "testing";
		let i = ft();
		e.selftestGrids.add(i);
		let a = r.parseSheet.call(r, "water", "__edc_selftest_hash__", i, { allowAutoDetect: !1 }), o = st(a);
		return Array.isArray(a) && a.length === 2 && o[0] === ut[0] && o[1] === ut[1] && a.every((t) => t?.採樣地點 === "#1自我測試站" && e.hashRow.has(t)) ? n("active", "正常") : n("failed", `讀到的項目：${o.join("、") || "（沒有）"}`);
	} catch (e) {
		return n("failed", "丟例外：" + (e instanceof Error ? e.message : String(e)));
	}
}
//#endregion
//#region src/xdw/button.ts
var mt = "edcBtnImportXdw", ht = "📄 匯入檔案（XDW）", gt = "掃描檔（DocuWorks .xdw）——Claude 版功能", _t = "edcXdwStyle", vt = "\n.edc-xdw-btn{border:none;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;background:#6a4c9c;color:#fff;box-shadow:inset 0 0 0 1px #4b3172}\n.edc-xdw-btn:hover,.edc-xdw-btn:focus-visible{background:#57397f}\n.edc-xdw-btn:focus-visible{outline:2px solid #b9a7d6;outline-offset:2px}\n.edc-xdw-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2147482000;display:flex;align-items:center;justify-content:center}\n.edc-xdw-overlay[hidden]{display:none}\n.edc-xdw-dialog{background:#fff;color:#2b3e4e;width:min(1100px,94vw);max-height:92vh;overflow:auto;border-radius:10px;border-top:6px solid #6a4c9c;padding:16px 20px;box-shadow:0 10px 40px rgba(0,0,0,.3);font-size:14px;line-height:1.6}\n.edc-xdw-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}\n.edc-xdw-title{margin:0;font-size:18px;color:#4b3172}\n.edc-xdw-close{border:1px solid #c9bfdc;background:#f6f2fb;color:#4b3172;border-radius:6px;padding:4px 10px;font:inherit;font-size:13px;cursor:pointer}\n.edc-xdw-note{margin:0 0 10px;padding:8px 12px;background:#f6f2fb;border-left:5px solid #7a5fb0;border-radius:4px}\n.edc-xdw-drop{border:2px dashed #b9a7d6;border-radius:8px;padding:16px;text-align:center;background:#fbf9fe}\n.edc-xdw-drop.edc-xdw-drag{background:#ece6f5;border-color:#6a4c9c}\n.edc-xdw-pick{margin-left:6px}\n.edc-xdw-status{margin:10px 0 4px;font-weight:600}\n.edc-xdw-status .edc-xdw-red{margin-left:10px}\n.edc-xdw-red{color:#b3261e;font-weight:700}\n.edc-xdw-errors{margin:6px 0;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b}\n.edc-xdw-errors[hidden]{display:none}\n.edc-xdw-errors ul{margin:4px 0 4px 18px;padding:0}\n.edc-xdw-thumbs{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}\n.edc-xdw-thumb{width:224px;border:1px solid #dce5ea;border-radius:6px;padding:4px;background:#fff;cursor:zoom-in;font:inherit;text-align:center;color:inherit}\n.edc-xdw-thumb canvas{display:block;width:220px;height:auto;background:#fff}\n.edc-xdw-thumb-cap{font-size:12px;color:#5b6b78;margin-top:2px}\n.edc-xdw-thumb-bad{cursor:default;border:2px solid #d9534f;background:#fdf1f0;color:#8a1f1b;padding:10px;min-height:120px;font-weight:700}\n.edc-xdw-zoom{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:2147482001;overflow:auto;padding:20px;text-align:center}\n.edc-xdw-zoom[hidden]{display:none}\n.edc-xdw-zoom-bar{position:sticky;top:0;display:flex;justify-content:center;gap:12px;align-items:center;color:#fff;margin-bottom:8px}\n.edc-xdw-zoom canvas{max-width:100%;height:auto;background:#fff}\n.edc-xdw-thumbs-title{margin:12px 0 4px;font-size:14px;color:#5b6b78;font-weight:600}\n.edc-xdw-thumbs-title[hidden]{display:none}\n.edc-read{margin-top:16px;padding:12px 14px;border:3px solid #6a4c9c;border-radius:8px;background:#f8f5fc}\n.edc-read[hidden]{display:none}\n.edc-read-title{margin:0 0 6px;font-size:18px;color:#4b3172}\n.edc-read-why{font-weight:600;color:#4a5866}\n.edc-read-intro{margin:0 0 8px;padding:6px 10px;background:#fff;border-left:5px solid #6a4c9c;border-radius:4px;font-weight:600}\n.edc-read-progress{font-weight:700;color:#4b3172;min-height:1.2em}\n.edc-read-summary{font-weight:700;font-size:15px;margin:4px 0 8px}\n.edc-read-pages{display:flex;flex-direction:column;gap:10px}\n.edc-read-page{background:#fff;border:1px solid #c9bfdc;border-radius:6px;padding:8px}\n.edc-read-page-bad{border:2px solid #d9534f;background:#fdf1f0}\n.edc-read-page-head{display:flex;flex-wrap:wrap;gap:10px;align-items:baseline;margin-bottom:4px}\n.edc-read-ok{color:#2e6b34;font-weight:700}\n.edc-read-pages-all{color:#2e6b34;font-weight:700}\n.edc-read-file{margin:6px 0;padding:4px 0 4px 8px;border-left:3px solid #b9c7d6}\n.edc-read-file-title{font-weight:700;color:#2b3e4e}\n.edc-read-filecount{margin:4px 0;color:#2b3e4e}\n.edc-xdw-file-head{grid-column:1/-1;flex-basis:100%;width:100%;font-weight:700;margin:8px 0 2px;color:#2b3e4e}\n.edc-res-file{margin:10px 0;padding:6px 0 6px 10px;border-left:4px solid #6a8cae}\n.edc-res-file-title{font-weight:700;font-size:15px;color:#24496e;margin-bottom:4px}\n.edc-res-file-counts{margin:2px 0 6px}\n.edc-read-bad{color:#8a1f1b;font-weight:700}\n.edc-read-form{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin:12px 0 8px;padding-top:10px;border-top:1px solid #d8cdea}\n.edc-read-field{display:flex;flex-direction:column;gap:2px;font-size:13px}\n.edc-read-label{font-weight:700;color:#4b3172}\n.edc-read-input{padding:5px 8px;border:1px solid #b9a7d6;border-radius:6px;font:inherit;font-size:13px;max-width:320px}\n.edc-read-hint{font-size:12px;color:#8a5a00}\n.edc-read-confirm-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}\n.edc-read-confirm{font-size:14px;padding:8px 14px}\n.edc-read-confirm:disabled{opacity:.5;cursor:not-allowed}\n.edc-read-why-disabled{color:#8a1f1b;font-weight:600}\n.edc-read-done{margin-top:8px}\n.edc-read-done-item{padding:8px 10px;background:#fff;border:1px dashed #6a4c9c;border-radius:6px;margin-top:6px}\n.edc-read-done-head{font-weight:700;color:#4b3172}\n.edc-read-run{margin-top:10px;padding:8px 10px;background:#fff;border:1px solid #b9a7d6;border-radius:6px}\n.edc-read-run[hidden],.edc-read-pause[hidden],.edc-read-next[hidden],.edc-read-run [hidden],.edc-read-logbar [hidden],.edc-res [hidden]{display:none}\n.edc-read-run-status{font-weight:700;color:#4b3172}\n.edc-read-run-note{font-size:13px;color:#5b6b78;min-height:1.2em}\n.edc-read-pause{font-weight:700;color:#8a5a00}\n.edc-read-tokens{font-size:13px;color:#4a5866;margin-top:4px}\n.edc-read-end{margin-top:6px;font-weight:700}\n.edc-read-locked{color:#4a5866}\n.edc-read-logbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}\n.edc-read-load-why{font-size:12px;color:#5b6b78}\n.edc-read-logbar button:disabled{opacity:.5;cursor:not-allowed}\n.edc-res{margin-top:10px}\n.edc-res-counts{font-weight:700;font-size:15px;margin-bottom:6px}\n.edc-res-page{background:#fff;border:1px solid #c9bfdc;border-radius:6px;padding:8px;margin-top:8px}\n.edc-res-page-manual{border:2px solid #e0882b}\n.edc-res-page-skip{border:2px solid #d9534f;background:#fdf1f0}\n.edc-res-page-head{display:flex;flex-wrap:wrap;gap:10px;align-items:baseline}\n.edc-res-mode{color:#4b3172;font-weight:600}\n.edc-res-page-status{font-weight:600}\n.edc-res-identity{margin:4px 0 4px 18px;padding:0;font-size:13px}\n.edc-res-warn{color:#8a5a00;font-size:13px}\n.edc-res-table,.edc-res-cmp{border-collapse:collapse;font-size:13px;margin-top:4px}\n.edc-res-table th,.edc-res-table td,.edc-res-cmp th,.edc-res-cmp td{border:1px solid #d8cdea;padding:2px 6px;text-align:left}\n.edc-res-row,.edc-res-arow{cursor:pointer}\n.edc-res-attn-page{background:#fff;border:1px solid #c9bfdc;border-radius:6px;padding:8px;margin-top:8px}\n.edc-res-attn-page-manual{border:2px solid #e0882b}\n.edc-res-attn-page-skip{border:2px solid #d9534f;background:#fdf1f0}\n.edc-res-allpass{background:#eef7ef;border:1px solid #9fcca4;border-radius:6px;padding:6px 8px;color:#2e6b34;font-weight:600}\n.edc-res-noattn{color:#2e6b34;margin-top:6px}\n.edc-res-hidden-pass{font-size:13px;color:#5b6b78;margin-top:4px}\n.edc-res-showall{margin-top:10px}\n.edc-res-pass .edc-res-status{color:#2e6b34;font-weight:700}\n.edc-res-manual .edc-res-status{color:#b35a00;font-weight:700}\n.edc-res-manual{background:#fff4e6}\n.edc-res-manualin,.edc-res-manual.edc-res-manualin{background:#f1e9fb}\n.edc-res-manualin .edc-res-status{color:#6a4c9c;font-weight:700}\n.edc-res-byhand{font-size:13px;color:#8a1f1b;margin-top:4px}\n.edc-man{margin-top:8px;padding:8px 10px;border:1px solid #9b7fc7;border-left:5px solid #6a4c9c;background:#f8f4fd;border-radius:6px;cursor:default}\n.edc-man-head{font-weight:700;color:#4b3172}\n.edc-man-item{font-size:13px;margin:2px 0 4px}\n.edc-man-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px 12px}\n.edc-man-field{display:flex;flex-direction:column;font-size:13px}\n.edc-man-label{font-weight:600}\n.edc-man-input{font-size:14px;padding:3px 6px;border:1px solid #b9a7d6;border-radius:4px}\n.edc-man-input[aria-invalid=\"true\"]{border-color:#d9534f;background:#fdf1f0}\n.edc-man-input.edc-man-preset-on{background:#efe8f8;color:#4b3172}\n.edc-man-why{font-size:12px;color:#5b6b78}\n.edc-man-why.edc-man-bad,.edc-man-msg.edc-man-bad{color:#8a1f1b}\n.edc-man-preset{margin-top:6px}\n.edc-man-preset-note{font-size:12px;color:#5b6b78;margin-top:2px}\n.edc-man-checkline{display:flex;gap:6px;align-items:center;margin-top:8px;font-weight:600}\n.edc-man-msg{font-size:13px;margin-top:2px}\n.edc-man-msg.edc-man-ok{color:#4b3172}\n.edc-res-frag-img{display:block;max-width:100%;max-height:320px;width:auto;margin-top:4px;border:1px solid #b9a7d6;cursor:zoom-in}\n.edc-res-frag-img.edc-res-frag-full{max-width:none;max-height:none;cursor:zoom-out}\n.edc-res-frag-wrap.edc-res-frag-scroll{overflow:auto;max-height:70vh;max-width:100%}\n.edc-res-frag-note,.edc-res-frag-none{font-size:12px;color:#5b6b78}\n.edc-read-next{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}\n.edc-read-to-import:disabled{opacity:.5;cursor:not-allowed}\n.edc-read-next-note{font-size:13px;color:#5b6b78}\n.edc-read-submit-msg{margin-top:8px}\n.edc-read-submit-stage{font-weight:700;color:#4b3172}\n.edc-read-submit-fail{padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px}\n.edc-read-download-xlsx{margin-top:6px}\n.edc-xdw-connect{margin-top:16px;padding-top:12px;border-top:1px solid #e3dcef}\n.edc-xdw-connect[hidden]{display:none}\n.edc-xdw-connect-title{margin:0 0 6px;font-size:16px;color:#4b3172}\n.edc-xdw-connect-note{margin:0 0 8px;font-size:13px;color:#4a5866}\n.edc-xdw-connect-status{font-weight:700;margin-bottom:6px;color:#5b6b78}\n.edc-xdw-connect-status.edc-xdw-connect-has{color:#2e6b34}\n.edc-xdw-connect-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.edc-xdw-connect-input{flex:1 1 280px;min-width:200px;padding:6px 8px;border:1px solid #b9a7d6;border-radius:6px;font:inherit;font-size:13px}\n.edc-xdw-connect-row button:disabled{opacity:.55;cursor:wait}\n.edc-xdw-connect-msg{min-height:1.4em;margin-top:6px}\n.edc-xdw-connect-results{margin:4px 0 0 18px;padding:0}\n.edc-xdw-connect-ok{color:#2e6b34;font-weight:600}\n.edc-xdw-connect-gray{color:#5b6b78}\n";
function yt(e) {
	if (e.getElementById("edcXdwStyle")) return;
	let t = e.createElement("style");
	t.id = _t, t.textContent = vt, (e.head ?? e.documentElement).append(t);
}
function bt(e, t) {
	let n = e.getElementById("btnImport"), r = e.getElementById(mt);
	if (!n || r && n.nextElementSibling === r) return !1;
	let i = r ?? xt(e, t);
	return n.after(i), !0;
}
function xt(e, t) {
	let n = e.createElement("button");
	return n.type = "button", n.id = mt, n.className = "edc-xdw-btn", n.textContent = ht, n.title = gt, n.addEventListener("click", (e) => {
		try {
			e.preventDefault(), t();
		} catch {}
	}), n;
}
function St(e, t) {
	try {
		yt(e);
	} catch {}
	let n = () => {
		try {
			bt(e, t);
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
var Ct = [
	"pdfjsLib",
	"_pdfjsTestingUtils",
	"pdfjsWorker"
], wt = () => import("./edc-xdw.js"), Tt = /* @__PURE__ */ new Map();
function Et(e, t) {
	for (let n of t) try {
		n.had ? e[n.k] !== n.v && (e[n.k] = n.v) : Object.prototype.hasOwnProperty.call(e, n.k) && delete e[n.k];
	} catch {}
}
async function Dt(e, t = globalThis) {
	let n = Tt.get(t);
	n || (n = {
		depth: 0,
		snap: Ct.map((e) => ({
			k: e,
			had: Object.prototype.hasOwnProperty.call(t, e),
			v: t[e]
		}))
	}, Tt.set(t, n)), n.depth++;
	try {
		return await e();
	} finally {
		Et(t, n.snap), --n.depth === 0 && Tt.delete(t);
	}
}
function Ot(e, t = wt) {
	return Dt(async () => (await t()).decodeXdw(e));
}
function kt(e) {
	return Dt(async () => (await import("./edc-xdw.js")).countXdwPages(e));
}
var At = 2576, jt = 4784, Mt = (e, t) => Number.isInteger(e) && Number.isInteger(t) && e >= 1 && t >= 1;
function Nt(e, t) {
	if (!Mt(e, t)) return `影像尺寸無效（${e}×${t}）`;
	if (Math.max(e, t) > 2576) return `影像長邊 ${Math.max(e, t)}px 超過上限 ${At}px`;
	let n = Math.ceil(e / 28) * Math.ceil(t / 28);
	return n > 4784 ? `影像太大（${n} 個區塊，上限 ${jt}）` : null;
}
function Pt(e, t, n = 3, r = 120) {
	if (!Mt(e, t)) throw Error(`影像尺寸無效（${e}×${t}），無法切圖`);
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
function Ft(e, t) {
	if (!Mt(e, t)) return {
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
	}], r = Pt(e, t);
	for (let e of [...n, ...r]) {
		let t = Nt(e.w, e.h);
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
function It(e, t) {
	if (!Mt(t.w, t.h) || !Number.isInteger(t.x) || !Number.isInteger(t.y) || t.x < 0 || t.y < 0 || t.x + t.w > e.width || t.y + t.h > e.height) throw Error("裁切範圍超出影像");
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
function Lt(e, t, n) {
	let r = e.createElement("canvas");
	return r.width = t, r.height = n, r;
}
var Rt = (e) => {
	e.width = 0, e.height = 0;
};
async function zt(e, t) {
	let n = Lt(e, t.width, t.height);
	try {
		let e = n.getContext("2d");
		return e ? (e.putImageData(new ImageData(t.data, t.width, t.height), 0, 0), await new Promise((e) => n.toBlob((t) => e(t), "image/png"))) : null;
	} finally {
		Rt(n);
	}
}
function Bt(e) {
	return new Promise((t) => {
		try {
			e.toBlob((e) => t(e), "image/png");
		} catch {
			t(null);
		}
	});
}
async function Vt(e, t) {
	let n = await createImageBitmap(t, {
		colorSpaceConversion: "none",
		premultiplyAlpha: "none"
	}), r = Lt(e, n.width, n.height);
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
		n.close(), Rt(r);
	}
}
function Ht(e) {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
}
async function Ut(e, t) {
	let n = await zt(e, t);
	if (!n || n.size <= 0) throw Error("PNG 編碼失敗");
	return Ht(new Uint8Array(await n.arrayBuffer()));
}
async function Wt(e) {
	let t = globalThis.crypto?.subtle;
	if (!t) throw Error("這個瀏覽器不能計算 SHA-256");
	let n = new Uint8Array(await t.digest("SHA-256", e));
	return Array.from(n, (e) => e.toString(16).padStart(2, "0")).join("");
}
//#endregion
//#region src/claude/config.ts
var Gt = "https://api.anthropic.com/v1/messages", Kt = "2023-06-01", qt = ["claude-sonnet-5-5", "claude-haiku-5-5"], Jt = "edc_claude_api_key", Yt = 3e4, Xt = "請只回覆：OK", j = {
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
function Zt(e, t) {
	return {
		url: Gt,
		init: {
			method: "POST",
			headers: {
				"x-api-key": e,
				"anthropic-version": Kt,
				"content-type": "application/json",
				"anthropic-dangerous-direct-browser-access": "true"
			},
			body: JSON.stringify({
				model: t,
				max_tokens: 8,
				messages: [{
					role: "user",
					content: Xt
				}]
			})
		}
	};
}
var Qt = "（已遮蔽）";
function $t(e, t) {
	let n = typeof e == "string" ? e : e == null ? "" : String(e);
	return t && (n = n.split(t).join(Qt)), n = n.replace(/sk-ant-[^\s"'<>，。；）)]*/g, Qt), n = n.replace(/\s+/g, " ").trim(), n.length > 300 ? n.slice(0, 300) + "…" : n;
}
function en(e) {
	return e === 401 ? "金鑰無效或已刪除" : e === 403 ? "這把金鑰沒有權限" : e === 404 ? "找不到這個模型" : e === 429 ? "請求太頻繁，或已達每月上限" : e >= 500 ? "Anthropic 服務暫時有問題" : `請求被拒（HTTP ${e}）`;
}
var tn = "連不到 api.anthropic.com（可能被公司網路擋住）", nn = "30 秒內沒有回應，請稍後再試", rn = "回應格式不對（收到 HTTP 200，但內容不是預期的格式）", an = () => ({
	fetch: (e, t) => globalThis.fetch(e, t),
	setTimeout: (e, t) => globalThis.setTimeout(e, t),
	clearTimeout: (e) => globalThis.clearTimeout(e)
}), on = (e, t, n) => ({
	model: e,
	ok: !0,
	text: `${e}：✅ 成功（回傳模型 ${t}，用了 ${n} 個 token）`
}), sn = (e, t, n = "") => ({
	model: e,
	ok: !1,
	text: `${e}：❌ ${t}${n ? `（${n}）` : ""}`
});
async function cn(e, t, n = an()) {
	let r = new AbortController(), i = !1, a = n.setTimeout(() => {
		i = !0, r.abort();
	}, Yt);
	try {
		let a;
		try {
			let { url: i, init: o } = Zt(e, t);
			a = await n.fetch(i, {
				...o,
				signal: r.signal,
				credentials: "omit",
				referrerPolicy: "no-referrer",
				cache: "no-store"
			});
		} catch {
			return sn(t, i ? nn : tn);
		}
		let o = null, s = !1;
		try {
			o = await a.json(), s = !0;
		} catch {
			if (i) return sn(t, nn);
		}
		let c = o && typeof o == "object" ? o : {};
		if (!a.ok) {
			let n = $t(c.error?.type, e), r = $t(c.error?.message, e);
			return sn(t, en(a.status), [n, r].filter(Boolean).join("："));
		}
		let l = (e) => typeof e == "number" && Number.isFinite(e), u = c.usage?.input_tokens, d = c.usage?.output_tokens;
		return !s || !o || typeof o != "object" || Array.isArray(o) || typeof c.model != "string" || !c.model.trim() || !l(u) || !l(d) ? sn(t, rn) : on(t, $t(c.model, e), u + d);
	} finally {
		n.clearTimeout(a);
	}
}
//#endregion
//#region src/claude/key.ts
function ln(e) {
	let t = String(e ?? "").trim();
	return !t.startsWith("sk-ant-") || /\s/.test(t) || t.length < 20 ? null : t;
}
function un(e) {
	return e.slice(-4);
}
var dn = () => {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
};
function fn(e = dn()) {
	try {
		return e?.getItem(Jt) || null;
	} catch {
		return null;
	}
}
function pn(e, t = dn()) {
	try {
		return t ? (t.setItem(Jt, e), t.getItem(Jt) === e) : !1;
	} catch {
		return !1;
	}
}
function mn(e = dn()) {
	try {
		e?.removeItem(Jt);
	} catch {}
}
//#endregion
//#region src/claude/read.ts
var hn = 4096, gn = "120 秒內沒有回應", _n = "回應格式不對（收到 HTTP 200，但內容不是預期的格式）", vn = "已中止", yn = /^[A-Za-z0-9._:-]{1,100}$/, bn = /^[a-z_]{1,40}$/;
function xn(e) {
	return {
		"x-api-key": e,
		"anthropic-version": Kt,
		"content-type": "application/json",
		"anthropic-dangerous-direct-browser-access": "true"
	};
}
function Sn(e, t, n) {
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
		max_tokens: hn,
		messages: [{
			role: "user",
			content: r
		}]
	});
}
var Cn = () => ({
	fetch: (e, t) => globalThis.fetch(e, t),
	setTimeout: (e, t) => globalThis.setTimeout(e, t),
	clearTimeout: (e) => globalThis.clearTimeout(e)
});
function wn(e) {
	if (e == null) return null;
	let t = e.trim();
	return /^\d+(?:\.\d+)?$/.test(t) ? Math.round(Number(t) * 1e3) : null;
}
var Tn = (e) => typeof e == "number" && Number.isInteger(e) && e >= 0;
function En(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return null;
	let t = e;
	if (typeof t.model != "string" || !yn.test(t.model) || !t.usage || typeof t.usage != "object" || !Tn(t.usage.input_tokens) || !Tn(t.usage.output_tokens) || !Array.isArray(t.content) || !(t.stop_reason === null || t.stop_reason === void 0 || typeof t.stop_reason == "string" && bn.test(t.stop_reason))) return null;
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
async function Dn(e, t, n, r, i = {}, a = Cn()) {
	if (i.signal?.aborted) return {
		kind: "cancelled",
		message: vn
	};
	let o = new AbortController(), s = !1, c = () => o.abort();
	i.signal?.addEventListener("abort", c, { once: !0 });
	let l = a.setTimeout(() => {
		s = !0, o.abort();
	}, i.timeoutMs ?? 12e4), u = () => s ? {
		kind: "timeout",
		message: gn
	} : i.signal?.aborted ? {
		kind: "cancelled",
		message: vn
	} : null;
	try {
		let i;
		try {
			i = await a.fetch(Gt, {
				method: "POST",
				headers: xn(e),
				body: Sn(t, n, r),
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
			let t = s && typeof s == "object" ? s : {}, n = [$t(t.error?.type, e), $t(t.error?.message, e)].filter(Boolean).join("：");
			return {
				kind: "http",
				status: i.status,
				message: $t(n ? `${en(i.status)}（${n}）` : en(i.status), e),
				retryAfterMs: wn(i.headers.get("retry-after"))
			};
		}
		let l = c ? En(s) : null;
		return l ? {
			kind: "ok",
			...l
		} : {
			kind: "format",
			message: _n
		};
	} finally {
		a.clearTimeout(l), i.signal?.removeEventListener("abort", c);
	}
}
//#endregion
//#region src/xdwread/prompts/read-gw.txt?raw
var On = "你是「掃描報表讀值員」。{{IMAGE_INTRO}}\n\n這一頁是地下水檢測報告。圖上只會用到：右上方的「報告編號」、「採樣時間」，左方的「樣品名稱」，以及「檢驗結果」表格。圖上表格與這三格以外的內容一律不要抄（人名、簽章、單位名稱、地址、頁首頁尾等都不要抄，也不要寫進任何欄位）。\n\n工作規則（一定要遵守）：\n1. 只抄圖上「印刷」的字，原樣照抄成字串。不可四捨五入、不可換算單位、不可計算、不可猜、不可從常識或其他頁補值。保留印刷的小數位數（例如印 8.640 就寫 \"8.640\"）。\n2. 任何一格只要有一個字不確定，那一格就寫 \"UNREADABLE\"。\n3. 圖上那一格是空白，就寫 null。表上沒有 MDL 欄時，每一列的 mdl 都寫 null。\n4. 所有值都用字串或 null，不可以用數字型別（寫 \"97.31\"，不可寫 97.31）。\n5. 字元寫法（讓抄寫結果一致）：\n   - 微（micro）一律用希臘字母 μ；溫度單位用單一字元 ℃。\n   - 英文字母、數字、標點與符號（< . / : ~ 等）一律用半形。\n   - 印刷是一條橫線（不論長短）一律寫半形 \"-\"。\n   - 數字（檢測結果、MDL、報告編號）裡不要抄空白，例如印「6. 5」寫 \"6.5\"。\n   - 其他文字照印刷：字與字之間印刷上有空白才留一個半形空白，沒有就不要加。\n6. 不抄「管制值」欄、不抄「備註」欄的內容。\n\n要抄的內容：\n- report_no、sample_name、sample_time：三格各抄 {\"label\": 標籤原文, \"value\": 值原文}。標籤是格子左邊印的字（例如「報告編號」），值是標籤右邊的內容。\n- columns：「檢驗結果」表格表頭由左到右的全部欄名（包含不抄內容的「管制值」「備註」等欄），一欄一個字串。\n- rows：表格由上到下的每一列（不含表頭）：item（檢測項目）、unit（單位）、result（檢測結果）、mdl（MDL 欄；表上沒有這欄就寫 null）、method（檢驗方法）。印 \"ND\" 就寫 \"ND\"，印 \"<0.0007\" 就寫 \"<0.0007\"。\n\n只輸出一個 JSON，不要有任何其他文字、說明或 markdown。鍵名固定，不要增加或減少任何鍵。格式如下（下面全是假的示範內容，不是這一頁的值）：\n{\n  \"report_no\": {\"label\": \"報告編號\", \"value\": \"XY999Z0000\"},\n  \"sample_name\": {\"label\": \"樣品名稱\", \"value\": \"示範測站\"},\n  \"sample_time\": {\"label\": \"採樣時間\", \"value\": \"100.01.01 08:00~ 08:30\"},\n  \"columns\": [\"檢測項目\", \"單位\", \"檢測結果\", \"MDL\", \"檢驗方法\"],\n  \"rows\": [\n    {\"item\": \"示範項目\", \"unit\": \"mg/L\", \"result\": \"98.76\", \"mdl\": \"0.0009\", \"method\": \"NIEA X000.00X\"},\n    {\"item\": \"示範項目二\", \"unit\": \"-\", \"result\": \"ND\", \"mdl\": null, \"method\": \"-\"}\n  ]\n}\n", kn = "\n\n上一次的回覆不是只有一個 JSON。這次只輸出 JSON，第一個字元必須是 {，最後一個字元必須是 }。", An = "\n\n上一次的回覆結構不對。這次只輸出上面指定結構的一個 JSON：不要增加或減少任何鍵，所有值都用字串或 null（不可用數字型別）。";
function jn(e, t = null) {
	if (!Number.isInteger(e) || e < 1) throw Error("影像張數無效");
	let n = e === 1 ? "這次給你 1 張圖，是同一頁報告的內容。" : `這次給你 ${e} 張圖，是同一頁報告由上到下切成的 ${e} 條水平帶（相鄰兩條有部分重疊，重疊處是同一段內容，不要重複抄）。請把它們當成一整頁來讀。`, r = On.replaceAll("{{IMAGE_INTRO}}", n);
	return t === "json" ? r + kn : t === "shape" ? r + An : r;
}
//#endregion
//#region src/xdwread/schema.ts
var Mn = [
	"report_no",
	"sample_name",
	"sample_time"
], Nn = [
	...Mn,
	"columns",
	"rows"
], Pn = ["label", "value"], Fn = [
	"item",
	"unit",
	"result",
	"mdl",
	"method"
];
function In(e) {
	return e === "not_json" || e === "extra_text" ? "json" : e === "shape" ? "shape" : null;
}
var Ln = /^\s*```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```\s*$/, Rn = (e) => !!e && typeof e == "object" && !Array.isArray(e), zn = (e) => e === null || typeof e == "string";
function Bn(e, t, n) {
	let r = Object.keys(e).filter((e) => !t.includes(e));
	if (r.length) return `${n}多了不該有的鍵（${r.length} 個）`;
	let i = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t));
	return i.length ? `${n}缺少鍵：${i.join("、")}` : null;
}
function Vn(e) {
	if (!Rn(e)) return {
		ok: !1,
		detail: "最外層不是 JSON 物件"
	};
	let t = Bn(e, Nn, "最外層");
	if (t) return {
		ok: !1,
		detail: t
	};
	for (let t of Mn) {
		let n = e[t];
		if (!Rn(n)) return {
			ok: !1,
			detail: `${t} 不是物件`
		};
		let r = Bn(n, Pn, `${t} `);
		if (r) return {
			ok: !1,
			detail: r
		};
		if (!zn(n.label) || !zn(n.value)) return {
			ok: !1,
			detail: `${t} 的 label／value 要是字串或 null`
		};
	}
	if (!Array.isArray(e.columns)) return {
		ok: !1,
		detail: "columns 不是陣列"
	};
	if (!e.columns.every(zn)) return {
		ok: !1,
		detail: "columns 裡要全是字串或 null"
	};
	if (!Array.isArray(e.rows)) return {
		ok: !1,
		detail: "rows 不是陣列"
	};
	for (let t = 0; t < e.rows.length; t++) {
		let n = e.rows[t];
		if (!Rn(n)) return {
			ok: !1,
			detail: `rows 第 ${t + 1} 列不是物件`
		};
		let r = Bn(n, Fn, `rows 第 ${t + 1} 列`);
		if (r) return {
			ok: !1,
			detail: r
		};
		for (let e of Fn) if (!zn(n[e])) return {
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
function Hn(e) {
	try {
		return {
			ok: !0,
			value: JSON.parse(e)
		};
	} catch {
		return { ok: !1 };
	}
}
function Un(e) {
	if (typeof e != "string" || e.trim() === "") return {
		ok: !1,
		kind: "empty",
		detail: "回覆是空的"
	};
	let t = e, n = !1, r = Ln.exec(e);
	r && (t = r[1], n = !0);
	let i = Hn(t.trim());
	if (i.ok) {
		let e = Vn(i.value);
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
	return a >= 0 && o > a && Hn(e.slice(a, o + 1)).ok ? {
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
//#region src/xdwread/prompts/read-air.txt?raw
var Wn = "你是「掃描報表讀值員」。{{IMAGE_INTRO}}\n\n這一頁是空氣品質監測報告的其中一頁。它應該是下面兩種表單之一：\n（甲）「檢測報告」：上方有表頭區（報告編號、收樣日期…），下方有一個測項表格（左邊「測項（單位）」，中間有「現場編號」「檢測位置」「檢測日期/時間」三格），表格下方可能還有一個「備註：」表格。\n（乙）「空氣品質監測逐時結果紀錄表」：上方有現場編號、監測位置、監測日期，下方是逐時表格（左邊一欄是時間，一列一小時，最後三列是統計值）。\n如果這一頁兩種都不是，form_title 照抄頁面最上方的標題，其他鍵照下面規則能填就填、不能填就寫 null。\n\n工作規則（一定要遵守）：\n1. 只抄圖上「印刷」的字，原樣照抄成字串。不可四捨五入、不可換算單位（ppb 不可改成 ppm）、不可計算、不可猜、不可從常識或其他格、其他頁補值。保留印刷的小數位數（例如印 8.60 就寫 \"8.60\"，印 19.00 就寫 \"19.00\"）。\n2. 任何一格只要有一個字不確定，那一格就寫 \"UNREADABLE\"。\n3. 圖上那一格是空白，就寫 null。\n4. 所有值都用字串或 null，不可以用數字型別（寫 \"0.97\"，不可寫 0.97）。\n5. 字元寫法（讓抄寫結果一致）：\n   - 英文字母、數字、標點與符號（< . / : ~ * % 等）一律用半形；全形冒號「：」也寫成半形 \":\"。\n   - 下標、上標一律寫成一般字元：SO₂ 寫 \"SO2\"、O₃ 寫 \"O3\"、CH₄ 寫 \"CH4\"、PM₁₀ 寫 \"PM10\"、PM₂.₅ 寫 \"PM2.5\"、m³ 寫 \"m3\"。NOx 的 x 照印刷的大小寫。\n   - 微（micro）一律用希臘字母 μ；溫度單位用單一字元 ℃。\n   - 印刷是一條橫線（不論長短）一律寫半形 \"-\"；印刷是星號寫 \"*\"。\n   - 數字裡不要抄空白，例如印「0. 97」寫 \"0.97\"。\n   - 一格裡印成好幾行時，各行之間用一個半形空白連接。\n   - 其他文字照印刷：字與字之間不要自己加空白。\n6. 不抄：人名、簽章、印章、單位名稱、地址、電話、文件編號、頁碼、「空氣品質標準」欄、「備註」表格裡的「測定條件（氣象條件）」那幾格、最下方「空氣污染物偵測極限值」那一行。這些內容也不要寫進任何欄位。\n\n要抄的內容（鍵名固定，不要增加或減少任何鍵）：\n- form_title：頁面最上方表單名稱那一行（不含單位名稱、不含文件編號那一行），例如「檢測報告」或「某某紀錄表(1/2)」。\n- report_no、receive_date、site_code、location、period：各抄 {\"label\": 標籤原文, \"value\": 值原文}。標籤是印在值左邊的字（去掉冒號），值是標籤右邊或旁邊那一格的內容。\n  - report_no＝「報告編號」；receive_date＝「收樣日期」。逐時紀錄表沒有這兩格 → label 與 value 都寫 null。\n  - site_code＝「現場編號」；location＝「檢測位置」或「監測位置」；period＝「檢測日期/時間」或「監測日期」。\n- summary_rows：只有（甲）檢測報告才填，（乙）寫 null。測項表格由上到下的每一列，接著是「備註：」表格裡有測項與數值的列（不含測定條件、氣象那幾格）；每列：\n  - item：該列所屬的測項名稱（左邊「測項（單位）」格的上半，例如 \"SO2\"；一個測項跨好幾列時，每一列都寫同一個測項名稱）。\n  - unit：該測項的單位（同一格括號裡的字，不含括號；每一列都寫）。\n  - stat：統計項那一格（例如「日平均值」）。\n  - value：數值那一格（「空氣品質標準」左邊那一格）。\n  - method：「檢測方法編號」格（跨好幾列的合併格，該測項的每一列都寫同一個）。\n- hourly：只有（乙）逐時紀錄表才填，（甲）寫 null。內容是一個物件：\n  - columns：表頭「時間」以右由左到右的每一欄：{\"item\": 欄名（例如 \"SO2\"）, \"sub\": 欄名下方的小字（例如「8小時平均」，沒有就寫 null）, \"unit\": 該欄單位（例如 \"ppb\"）}。\n  - hours：由上到下每一個小時列的「時間」格原文（例如 \"10:00 ~ 11:00\"），一列一個字串，只抄時間格，不抄那一列的數值。\n  - stats：最下方三個統計列，由上到下，每列 {\"label\": 統計列左邊的字（印成兩行時用一個半形空白連接）, \"values\": 該列由左到右每一欄的值，欄數要和 columns 一樣}。某一欄是好幾列合併成一格的大格時，統計列那一格照印刷（印 \"*\" 就寫 \"*\"，有數字就寫數字）。\n\n只輸出一個 JSON，不要有任何其他文字、說明或 markdown。格式如下（下面全是假的示範內容，不是這一頁的值；沒用到的那一種寫 null）：\n{\n  \"form_title\": \"檢測報告\",\n  \"report_no\": {\"label\": \"報告編號\", \"value\": \"XY999Z0000\"},\n  \"receive_date\": {\"label\": \"收樣日期\", \"value\": \"100.01.02\"},\n  \"site_code\": {\"label\": \"現場編號\", \"value\": \"1000101XX-9\"},\n  \"location\": {\"label\": \"檢測位置\", \"value\": \"示範測站\"},\n  \"period\": {\"label\": \"檢測日期/時間\", \"value\": \"100.01.01/08:00 至 100.01.02/08:00\"},\n  \"summary_rows\": [\n    {\"item\": \"示範測項\", \"unit\": \"ppm\", \"stat\": \"最大小時平均值\", \"value\": \"0.123\", \"method\": \"NIEA X000.00X\"},\n    {\"item\": \"示範測項\", \"unit\": \"ppm\", \"stat\": \"日平均值\", \"value\": \"0.045\", \"method\": \"NIEA X000.00X\"}\n  ],\n  \"hourly\": null\n}\n";
//#endregion
//#region src/xdwread/prompt-air.ts
function Gn(e, t = null) {
	if (!Number.isInteger(e) || e < 1) throw Error("影像張數無效");
	let n = e === 1 ? "這次給你 1 張圖，是同一頁報告的內容。" : `這次給你 ${e} 張圖，是同一頁報告由上到下切成的 ${e} 條水平帶（相鄰兩條有部分重疊，重疊處是同一段內容，不要重複抄）。請把它們當成一整頁來讀。`, r = Wn.replaceAll("{{IMAGE_INTRO}}", n);
	return t === "json" ? r + kn : t === "shape" ? r + An : r;
}
//#endregion
//#region src/xdwread/schema-air.ts
var Kn = [
	"report_no",
	"receive_date",
	"site_code",
	"location",
	"period"
], qn = [
	"form_title",
	...Kn,
	"summary_rows",
	"hourly"
], Jn = ["label", "value"], Yn = [
	"item",
	"unit",
	"stat",
	"value",
	"method"
], Xn = [
	"item",
	"sub",
	"unit"
], Zn = [
	"columns",
	"hours",
	"stats"
], Qn = ["label", "values"], $n = /^\s*```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```\s*$/, er = (e) => !!e && typeof e == "object" && !Array.isArray(e), tr = (e) => e === null || typeof e == "string";
function nr(e, t, n) {
	let r = Object.keys(e).filter((e) => !t.includes(e));
	if (r.length) return `${n}多了不該有的鍵（${r.length} 個）`;
	let i = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t));
	return i.length ? `${n}缺少鍵：${i.join("、")}` : null;
}
function rr(e) {
	if (e === null) return {
		ok: !0,
		v: null
	};
	if (!Array.isArray(e)) return {
		ok: !1,
		detail: "summary_rows 不是陣列或 null"
	};
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		if (!er(r)) return {
			ok: !1,
			detail: `summary_rows 第 ${n + 1} 列不是物件`
		};
		let i = nr(r, Yn, `summary_rows 第 ${n + 1} 列`);
		if (i) return {
			ok: !1,
			detail: i
		};
		for (let e of Yn) if (!tr(r[e])) return {
			ok: !1,
			detail: `summary_rows 第 ${n + 1} 列的 ${e} 要是字串或 null`
		};
		t.push({
			item: r.item,
			unit: r.unit,
			stat: r.stat,
			value: r.value,
			method: r.method
		});
	}
	return {
		ok: !0,
		v: t
	};
}
function ir(e) {
	if (e === null) return {
		ok: !0,
		v: null
	};
	if (!er(e)) return {
		ok: !1,
		detail: "hourly 不是物件或 null"
	};
	let t = nr(e, Zn, "hourly ");
	if (t) return {
		ok: !1,
		detail: t
	};
	if (!Array.isArray(e.columns)) return {
		ok: !1,
		detail: "hourly.columns 不是陣列"
	};
	let n = [];
	for (let t = 0; t < e.columns.length; t++) {
		let r = e.columns[t];
		if (!er(r)) return {
			ok: !1,
			detail: `hourly.columns 第 ${t + 1} 欄不是物件`
		};
		let i = nr(r, Xn, `hourly.columns 第 ${t + 1} 欄`);
		if (i) return {
			ok: !1,
			detail: i
		};
		for (let e of Xn) if (!tr(r[e])) return {
			ok: !1,
			detail: `hourly.columns 第 ${t + 1} 欄的 ${e} 要是字串或 null`
		};
		n.push({
			item: r.item,
			sub: r.sub,
			unit: r.unit
		});
	}
	if (!Array.isArray(e.hours)) return {
		ok: !1,
		detail: "hourly.hours 不是陣列"
	};
	if (!e.hours.every(tr)) return {
		ok: !1,
		detail: "hourly.hours 裡要全是字串或 null"
	};
	if (!Array.isArray(e.stats)) return {
		ok: !1,
		detail: "hourly.stats 不是陣列"
	};
	let r = [];
	for (let t = 0; t < e.stats.length; t++) {
		let n = e.stats[t];
		if (!er(n)) return {
			ok: !1,
			detail: `hourly.stats 第 ${t + 1} 列不是物件`
		};
		let i = nr(n, Qn, `hourly.stats 第 ${t + 1} 列`);
		if (i) return {
			ok: !1,
			detail: i
		};
		if (!tr(n.label)) return {
			ok: !1,
			detail: `hourly.stats 第 ${t + 1} 列的 label 要是字串或 null`
		};
		if (!Array.isArray(n.values) || !n.values.every(tr)) return {
			ok: !1,
			detail: `hourly.stats 第 ${t + 1} 列的 values 要是字串或 null 的陣列`
		};
		r.push({
			label: n.label,
			values: [...n.values]
		});
	}
	return {
		ok: !0,
		v: {
			columns: n,
			hours: [...e.hours],
			stats: r
		}
	};
}
function ar(e) {
	if (!er(e)) return {
		ok: !1,
		detail: "最外層不是 JSON 物件"
	};
	let t = nr(e, qn, "最外層");
	if (t) return {
		ok: !1,
		detail: t
	};
	if (!tr(e.form_title)) return {
		ok: !1,
		detail: "form_title 要是字串或 null"
	};
	let n = {};
	for (let t of Kn) {
		let r = e[t];
		if (!er(r)) return {
			ok: !1,
			detail: `${t} 不是物件`
		};
		let i = nr(r, Jn, `${t} `);
		if (i) return {
			ok: !1,
			detail: i
		};
		if (!tr(r.label) || !tr(r.value)) return {
			ok: !1,
			detail: `${t} 的 label／value 要是字串或 null`
		};
		n[t] = {
			label: r.label,
			value: r.value
		};
	}
	let r = rr(e.summary_rows);
	if (!r.ok) return {
		ok: !1,
		detail: r.detail
	};
	let i = ir(e.hourly);
	return i.ok ? {
		ok: !0,
		reply: {
			form_title: e.form_title,
			...n,
			summary_rows: r.v,
			hourly: i.v
		}
	} : {
		ok: !1,
		detail: i.detail
	};
}
function or(e) {
	try {
		return {
			ok: !0,
			value: JSON.parse(e)
		};
	} catch {
		return { ok: !1 };
	}
}
function sr(e) {
	if (typeof e != "string" || e.trim() === "") return {
		ok: !1,
		kind: "empty",
		detail: "回覆是空的"
	};
	let t = e, n = !1, r = $n.exec(e);
	r && (t = r[1], n = !0);
	let i = or(t.trim());
	if (i.ok) {
		let e = ar(i.value);
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
	return a >= 0 && o > a && or(e.slice(a, o + 1)).ok ? {
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
//#region src/xdwread/prompts/read-noise.txt?raw
var cr = "你是「掃描報表讀值員」。{{IMAGE_INTRO}}\n\n這一頁是噪音振動監測報告的其中一頁。它應該是下面兩種表單之一：\n（甲）「檢測報告」：上方有表頭區（報告編號、收樣日期…），下方有一個測項表格（左邊「測項（單位）」，中間有「現場編號」「檢測位置」「檢測日期/時間」三格，右邊有「法規值」「檢測方法編號」），表格最下面一列是「管制區標準類屬」。\n（乙）「監測數據逐時紀錄」（標題括號裡寫「噪音」或「振動」）：上方有監測位置、監測日期、現場編號，下方是逐時表格（左邊一欄是時間，一列一小時，共 24 列），表格最下方有一個「監測結果」框。\n如果這一頁兩種都不是，form_title 照抄頁面最上方的標題，其他鍵照下面規則能填就填、不能填就寫 null。\n\n工作規則（一定要遵守）：\n1. 只抄圖上「印刷」的字，原樣照抄成字串。不可四捨五入、不可換算、不可計算、不可猜、不可從常識或其他格、其他頁補值。保留印刷的小數位數（例如印 30.0 就寫 \"30.0\"）。\n2. 任何一格只要有一個字不確定，那一格就寫 \"UNREADABLE\"。\n3. 圖上那一格是空白，就寫 null。\n4. 所有值都用字串或 null，不可以用數字型別（寫 \"54.2\"，不可寫 54.2）。\n5. 字元寫法（讓抄寫結果一致）：\n   - 英文字母、數字、標點與符號（( ) . / : ~ - 等）一律用半形；全形冒號「：」也寫成半形 \":\"，全形括號「（）」寫成半形 \"()\"。\n   - 下標、上標一律寫成一般字元，接在前一個字後面：L 下標 eq 寫 \"Leq\"、L 下標 max 寫 \"Lmax\"、L 下標 日 寫 \"L日\"、L 下標 d 寫 \"Ld\"、L 下標 V(10)eq 寫 \"LV(10)eq\"。英文字母照印刷的大小寫。\n   - 印刷是一條橫線（不論長短）一律寫半形 \"-\"。\n   - 數字裡不要抄空白，例如印「54. 2」寫 \"54.2\"；日期裡也不要抄空白，例如印「115. 08. 31-01」寫 \"115.08.31-01\"。\n   - 一格裡印成好幾行時，各行之間用一個半形空白連接。\n   - 其他文字照印刷：字與字之間不要自己加空白。\n6. 不抄：人名、簽章、印章、單位名稱、地址、電話、文件編號、頁碼、表頭區除了報告編號以外的其他欄（計畫名稱、委託單位、案件編號、收樣日期、報告日期、樣品特性、採樣行程編號…）、「註」的文字、逐時表 24 列裡的數值。這些內容也不要寫進任何欄位。\n\n要抄的內容（鍵名固定，不要增加或減少任何鍵）：\n- form_title：頁面最上方表單名稱那一行（不含單位名稱、不含文件編號那一行），例如「檢測報告」或「某某紀錄(噪音)」。\n- report_no、site_code、location、period、zone：各抄 {\"label\": 標籤原文, \"value\": 值原文}。標籤是印在值左邊（或上方）的字（去掉冒號），值是標籤右邊或旁邊那一格的內容。\n  - report_no＝「報告編號」（表頭區）。逐時紀錄沒有這一格 → label 與 value 都寫 null。\n  - site_code＝「現場編號」；location＝「檢測位置」或「監測位置」；period＝「檢測日期/時間」或「監測日期」（印成好幾行就用一個半形空白連接）。\n  - zone＝測項表格最下面一列「管制區標準類屬」與它右邊的內容。逐時紀錄沒有這一列 → label 與 value 都寫 null。\n- summary_rows：只有（甲）檢測報告才填，（乙）寫 null。「管制區標準類屬」以上、有數值的每一列，由上到下；每列：\n  - item：左邊「測項（單位）」格裡括號前面的測項名稱（一個測項跨好幾列時，每一列都寫同一個）。\n  - unit：同一格最外層括號裡的字（不含最外層括號；裡面的括號照抄，例如 \"dB(A)\"）。每一列都寫。\n  - stat：統計項那一格，連同下標與「監測值」三個字（例如 \"L日監測值\"、\"Ld監測值\"、\"Leq24監測值\"）。下標字很小，請照位置一列一列對齊抄；只有下標那一個字太小讀不出時，那個字寫成半形 \"?\"（例如 \"L?監測值\"），不要整格寫 \"UNREADABLE\"，也不要猜。\n  - value：數值那一格（「法規值」左邊那一格）。\n  - limit：「法規值」那一格（印一條橫線就寫 \"-\"）。\n  - method：「檢測方法編號」格（跨好幾列的合併格，每一列都寫同一個）。\n- hourly：只有（乙）逐時紀錄才填，（甲）寫 null。欄名與單位印在表格最上方、「監測結果」框印在表格最下方，中間隔著 24 個小時列；兩者都要抄。內容是一個物件：\n  - columns：表頭「時間」以右由左到右的每一欄：{\"item\": 欄名（照規則 5 寫下標，例如 \"Leq\"、\"L90\"、\"LV10(1)\"）, \"unit\": 欄名下面那一格的單位（例如 \"dB(A)\"、\"dB\"）}。\n  - hours：由上到下每一個小時列的「時間」格原文（例如 \"09:00~10:00\"），一列一個字串，只抄時間格，不抄那一列的數值。從表格第一列抄到最後一列，順序不可以調換。\n  - results：表格最下方「監測結果」框裡的每一個結果，先左欄由上到下、再右欄由上到下；每個 {\"label\": 結果的標籤（冒號左邊的字，包含括號裡的時段，例如 \"L日(06~20)\"、\"Ld(07~22)\"、\"Ldn\"）, \"value\": 標籤右邊的數值, \"unit\": 數值右邊的單位}。\n\n只輸出一個 JSON，不要有任何其他文字、說明或 markdown。格式如下（下面全是假的示範內容，不是這一頁的值；沒用到的那一種寫 null）：\n{\n  \"form_title\": \"示範紀錄(示範)\",\n  \"report_no\": {\"label\": null, \"value\": null},\n  \"site_code\": {\"label\": \"現場編號\", \"value\": \"1000101XX-9\"},\n  \"location\": {\"label\": \"監測位置\", \"value\": \"示範測站\"},\n  \"period\": {\"label\": \"監測日期\", \"value\": \"100.01.01-02\"},\n  \"zone\": {\"label\": null, \"value\": null},\n  \"summary_rows\": null,\n  \"hourly\": {\n    \"columns\": [{\"item\": \"X1\", \"unit\": \"dB\"}, {\"item\": \"X2\", \"unit\": \"dB\"}],\n    \"hours\": [\"10:00~11:00\", \"11:00~12:00\"],\n    \"results\": [{\"label\": \"示範(10~11)\", \"value\": \"12.3\", \"unit\": \"dB\"}]\n  }\n}\n";
//#endregion
//#region src/xdwread/prompt-noise.ts
function lr(e, t = null) {
	if (!Number.isInteger(e) || e < 1) throw Error("影像張數無效");
	let n = e === 1 ? "這次給你 1 張圖，是同一頁報告的內容。" : `這次給你 ${e} 張圖，是同一頁報告由上到下切成的 ${e} 條水平帶（相鄰兩條有部分重疊，重疊處是同一段內容，不要重複抄）。請把它們當成一整頁來讀。`, r = cr.replaceAll("{{IMAGE_INTRO}}", n);
	return t === "json" ? r + kn : t === "shape" ? r + An : r;
}
//#endregion
//#region src/xdwread/schema-noise.ts
var ur = [
	"report_no",
	"site_code",
	"location",
	"period",
	"zone"
], dr = [
	"form_title",
	...ur,
	"summary_rows",
	"hourly"
], fr = ["label", "value"], pr = [
	"item",
	"unit",
	"stat",
	"value",
	"limit",
	"method"
], mr = ["item", "unit"], hr = [
	"label",
	"value",
	"unit"
], gr = [
	"columns",
	"hours",
	"results"
], _r = /^\s*```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```\s*$/, vr = (e) => !!e && typeof e == "object" && !Array.isArray(e), yr = (e) => e === null || typeof e == "string";
function br(e, t, n) {
	let r = Object.keys(e).filter((e) => !t.includes(e));
	if (r.length) return `${n}多了不該有的鍵（${r.length} 個）`;
	let i = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t));
	return i.length ? `${n}缺少鍵：${i.join("、")}` : null;
}
function xr(e, t, n) {
	if (!Array.isArray(e)) return {
		ok: !1,
		detail: `${n} 不是陣列`
	};
	let r = [];
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		if (!vr(a)) return {
			ok: !1,
			detail: `${n} 第 ${i + 1} 個不是物件`
		};
		let o = br(a, t, `${n} 第 ${i + 1} 個`);
		if (o) return {
			ok: !1,
			detail: o
		};
		let s = {};
		for (let e of t) {
			if (!yr(a[e])) return {
				ok: !1,
				detail: `${n} 第 ${i + 1} 個的 ${e} 要是字串或 null`
			};
			s[e] = a[e];
		}
		r.push(s);
	}
	return {
		ok: !0,
		v: r
	};
}
function Sr(e) {
	if (e === null) return {
		ok: !0,
		v: null
	};
	if (!vr(e)) return {
		ok: !1,
		detail: "hourly 不是物件或 null"
	};
	let t = br(e, gr, "hourly ");
	if (t) return {
		ok: !1,
		detail: t
	};
	let n = xr(e.columns, mr, "hourly.columns");
	if (!n.ok) return n;
	if (!Array.isArray(e.hours) || !e.hours.every(yr)) return {
		ok: !1,
		detail: "hourly.hours 要是字串或 null 的陣列"
	};
	let r = xr(e.results, hr, "hourly.results");
	return r.ok ? {
		ok: !0,
		v: {
			columns: n.v,
			hours: [...e.hours],
			results: r.v
		}
	} : r;
}
function Cr(e) {
	if (!vr(e)) return {
		ok: !1,
		detail: "最外層不是 JSON 物件"
	};
	let t = br(e, dr, "最外層");
	if (t) return {
		ok: !1,
		detail: t
	};
	if (!yr(e.form_title)) return {
		ok: !1,
		detail: "form_title 要是字串或 null"
	};
	let n = {};
	for (let t of ur) {
		let r = e[t];
		if (!vr(r)) return {
			ok: !1,
			detail: `${t} 不是物件`
		};
		let i = br(r, fr, `${t} `);
		if (i) return {
			ok: !1,
			detail: i
		};
		if (!yr(r.label) || !yr(r.value)) return {
			ok: !1,
			detail: `${t} 的 label／value 要是字串或 null`
		};
		n[t] = {
			label: r.label,
			value: r.value
		};
	}
	let r = null;
	if (e.summary_rows !== null) {
		let t = xr(e.summary_rows, pr, "summary_rows");
		if (!t.ok) return {
			ok: !1,
			detail: t.detail
		};
		r = t.v;
	}
	let i = Sr(e.hourly);
	return i.ok ? {
		ok: !0,
		reply: {
			form_title: e.form_title,
			...n,
			summary_rows: r,
			hourly: i.v
		}
	} : {
		ok: !1,
		detail: i.detail
	};
}
function wr(e) {
	try {
		return {
			ok: !0,
			value: JSON.parse(e)
		};
	} catch {
		return { ok: !1 };
	}
}
function Tr(e) {
	if (typeof e != "string" || e.trim() === "") return {
		ok: !1,
		kind: "empty",
		detail: "回覆是空的"
	};
	let t = e, n = !1, r = _r.exec(e);
	r && (t = r[1], n = !0);
	let i = wr(t.trim());
	if (i.ok) {
		let e = Cr(i.value);
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
	return a >= 0 && o > a && wr(e.slice(a, o + 1)).ok ? {
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
//#region src/xdwread/template-air.ts
var Er = (e) => e === "L1" || e === "L2", Dr = {
	L1: "檢測報告",
	L2: "檢測報告",
	L3: "空氣品質監測逐時結果紀錄表(1/2)",
	L4: "空氣品質監測逐時結果紀錄表(2/2)"
}, Or = "ppm", kr = "μg/m3", Ar = "最大小時平均值", jr = "日平均值", Mr = "8小時最大平均值", Nr = "24小時值", Pr = [
	[
		"SO2",
		Or,
		Ar
	],
	[
		"SO2",
		Or,
		jr
	],
	[
		"NOx",
		Or,
		Ar
	],
	[
		"NOx",
		Or,
		jr
	],
	[
		"CO",
		Or,
		Ar
	],
	[
		"CO",
		Or,
		jr
	],
	[
		"CO",
		Or,
		Mr
	],
	[
		"O3",
		Or,
		Ar
	],
	[
		"O3",
		Or,
		jr
	],
	[
		"O3",
		Or,
		Mr
	],
	[
		"THC",
		Or,
		Ar
	],
	[
		"THC",
		Or,
		jr
	],
	[
		"PM10",
		kr,
		Ar
	],
	[
		"PM10",
		kr,
		jr
	],
	[
		"TSP",
		kr,
		Nr
	],
	[
		"NO2",
		Or,
		Ar
	],
	[
		"NO2",
		Or,
		jr
	]
], Fr = [[
	"PM2.5",
	kr,
	Nr
]], Ir = [
	[
		"SO2",
		null,
		"ppb"
	],
	[
		"NO",
		null,
		"ppb"
	],
	[
		"NO2",
		null,
		"ppb"
	],
	[
		"NOx",
		null,
		"ppb"
	],
	[
		"CO",
		null,
		"ppm"
	],
	[
		"CO",
		"8小時平均",
		"ppm"
	],
	[
		"O3",
		null,
		"ppb"
	],
	[
		"O3",
		"8小時平均",
		"ppb"
	]
], Lr = [
	[
		"THC",
		null,
		"ppm"
	],
	[
		"NMHC",
		null,
		"ppm"
	],
	[
		"CH4",
		null,
		"ppm"
	],
	[
		"PM10",
		null,
		kr
	],
	[
		"風向",
		null,
		"Deg"
	],
	[
		"風速",
		null,
		"m/s"
	],
	[
		"溫度",
		null,
		"℃"
	],
	[
		"相對濕度",
		null,
		"%"
	],
	[
		"TSP",
		null,
		kr
	]
], Rr = [
	"最大小時平均值",
	"最小小時平均值",
	"日平均值或最頻風向"
], zr = { NOx: ["NOx", "NOX"] }, Br = {
	summary: {
		report_no: "報告編號",
		receive_date: "收樣日期",
		site_code: "現場編號",
		location: "檢測位置",
		period: "檢測日期/時間"
	},
	hourly: {
		site_code: "現場編號",
		location: "監測位置",
		period: "監測日期"
	}
}, Vr = /^[A-Z]{2}\d{3}[A-Z]\d{4}N?$/, Hr = /^\d{3}\.\d{2}\.\d{2}$/, Ur = /^NIEA [A-Z]\d{3}\.\d{2}[A-Z]$/, Wr = /^\d+(?:\.\d+)?$/, Gr = /^(\d{3})\.(\d{2})\.(\d{2})\/(\d{2}):(\d{2})至(\d{3})\.(\d{2})\.(\d{2})\/(\d{2}):(\d{2})$/, Kr = /^(\d{3})\.(\d{2})\.(\d{2})~(\d{3})\.(\d{2})\.(\d{2})$/, qr = /^(\d{2}):00~(\d{2}):00$/, Jr = [
	"SO2",
	"NO2",
	"CO",
	"O3",
	"CH4",
	"NMHC",
	"THC",
	"PM10",
	"TSP",
	"PM2.5"
], Yr = [
	{
		key: "SO2",
		name: "SO2",
		layout: "L1",
		index: 1,
		use: "write"
	},
	{
		key: "CO",
		name: "CO",
		layout: "L1",
		index: 5,
		use: "write"
	},
	{
		key: "O3",
		name: "O3",
		layout: "L1",
		index: 8,
		use: "write"
	},
	{
		key: "PM10",
		name: "PM10",
		layout: "L1",
		index: 13,
		use: "write"
	},
	{
		key: "TSP",
		name: "TSP",
		layout: "L1",
		index: 14,
		use: "write"
	},
	{
		key: "NO2",
		name: "NO2",
		layout: "L1",
		index: 16,
		use: "write"
	},
	{
		key: "THC",
		name: "THC",
		layout: "L4",
		index: 0,
		use: "write"
	},
	{
		key: "NMHC",
		name: "NMHC",
		layout: "L4",
		index: 1,
		use: "write"
	},
	{
		key: "CH4",
		name: "CH4",
		layout: "L4",
		index: 2,
		use: "write"
	},
	{
		key: "PM2.5",
		name: "PM2.5",
		layout: "L2",
		index: 0,
		use: "write"
	}
], Xr = [
	{
		name: "THC",
		layout: "L1",
		index: 11,
		use: "check"
	},
	{
		name: "SO2",
		layout: "L3",
		index: 0,
		use: "check"
	},
	{
		name: "NO2",
		layout: "L3",
		index: 2,
		use: "check"
	},
	{
		name: "CO",
		layout: "L3",
		index: 4,
		use: "check"
	},
	{
		name: "O3",
		layout: "L3",
		index: 6,
		use: "check"
	},
	{
		name: "PM10",
		layout: "L4",
		index: 3,
		use: "check"
	},
	{
		name: "TSP",
		layout: "L4",
		index: 8,
		use: "check"
	}
], Zr = [
	{
		key: "SO2",
		against: {
			layout: "L3",
			name: "SO2"
		},
		shift: 3
	},
	{
		key: "NO2",
		against: {
			layout: "L3",
			name: "NO2"
		},
		shift: 3
	},
	{
		key: "O3",
		against: {
			layout: "L3",
			name: "O3"
		},
		shift: 3
	},
	{
		key: "CO",
		against: {
			layout: "L3",
			name: "CO"
		},
		shift: 0
	},
	{
		key: "PM10",
		against: {
			layout: "L4",
			name: "PM10"
		},
		shift: 0
	},
	{
		key: "TSP",
		against: {
			layout: "L4",
			name: "TSP"
		},
		shift: 0
	},
	{
		key: "THC",
		against: {
			layout: "L1",
			name: "THC"
		},
		shift: 0
	}
], M = {
	titleCell: [1, 0],
	title: "空氣品質檢測報告",
	agencyCell: [5, 10],
	agencyLabel: "採樣單位：",
	receiveCell: [6, 10],
	receiveLabel: "收樣日期：",
	reportCell: [7, 10],
	reportLabel: "報告編號：",
	headerRow: 13,
	header: [
		"監測項目",
		"SO2",
		"NO2",
		"CO",
		"O3",
		"CH4",
		"NMHC",
		"THC",
		"PM10",
		"TSP",
		"檢測方法",
		"監測地點",
		"監測時間",
		"PM2.5濃度"
	],
	headerFirstCol: 1,
	unitRow: 15,
	firstHourRow: 16,
	lastHourRow: 17,
	hourCol: 1,
	avgRow: 18,
	avgLabel: "日平均值或",
	methodRow: 20,
	methodPrefix: "檢測方法:",
	rows: 21,
	cols: 15
}, Qr = {
	SO2: 2,
	NO2: 3,
	CO: 4,
	O3: 5,
	CH4: 6,
	NMHC: 7,
	THC: 8,
	PM10: 9,
	TSP: 10,
	method: 11,
	location: 12,
	time: 13,
	pm25: 14
}, $r = [
	"SO2",
	"NO2",
	"CO",
	"O3",
	"CH4",
	"NMHC",
	"THC",
	"PM10"
], ei = [
	"SO2",
	"NO2",
	"CO",
	"O3",
	"THC",
	"PM10",
	"TSP"
], ti = "周界空氣品質", ni = {
	SO2: "SO2",
	NO2: "NO2",
	CO: "CO",
	O3: "O3",
	CH4: "CH4",
	NMHC: "NMHC",
	THC: "THC",
	PM10: "PM10",
	TSP: "TSP",
	"PM2.5": "PM2.5"
}, ri = {
	SO2: "113",
	NO2: "113",
	CO: "113",
	O3: "113",
	CH4: "113",
	NMHC: "113",
	THC: "113",
	PM10: "127",
	TSP: "127",
	"PM2.5": "127"
}, ii = {
	CH4: "THC",
	NMHC: "THC"
}, ai = {
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
}, oi = {
	A: ai.A.length,
	B: ai.B.length
}, si = {
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
}, ci = {
	report_no: "報告編號",
	sample_name: "樣品名稱",
	sample_time: "採樣時間"
}, li = /^[A-Z]{2}\d{3}[A-Z]\d{4}N?$/, ui = {
	氫離子濃度指數: "pH",
	溶氧量: "溶氧"
}, di = [{
	item: "導電度",
	from: "μmho/cm25°C",
	to: "μmho/cm"
}], fi = "這一站只讀到 1 頁（另一頁沒有讀成功或沒送）", pi = [
	"-",
	"－",
	"—",
	"–"
], N = (e) => e.replace(/\s+/gu, ""), P = (e) => e.normalize("NFKC").replace(/\s+/gu, ""), mi = (e) => e !== null && pi.includes(N(e)), hi = (e) => e !== null && N(e) === "UNREADABLE", gi = /^(?:ND|<\d+(?:\.\d+)?|\d+(?:\.\d+)?)$/, _i = /^\d+(?:\.\d+)?$/, vi = /^NIEA [A-Z]\d{3}\.\d{2}[A-Z]$/, yi = /^\s*(\d{3})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})(?:\s*~\s*(\d{2}):(\d{2}))?\s*$/u;
function bi(e) {
	if (e === null) return null;
	let t = yi.exec(e);
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
var xi = (e, t) => e.rocYear === t.rocYear && Math.ceil(e.month / 3) === t.quarter, Si = (e) => ({
	ok: !1,
	reason: e
});
function Ci(e, t, n, r) {
	if (hi(t) || hi(n)) return Si(`${e}有一次讀不清楚（UNREADABLE）`);
	if (t !== null && N(t) === "" || n !== null && N(n) === "") return Si(`${e}讀到空字串`);
	let i = t === null, a = n === null, o = mi(t), s = mi(n);
	if (i || a || o || s) return r ? i && a || o && s ? {
		ok: !0,
		out: ""
	} : Si(`${e}兩次讀值不同（一次空白或破折號、一次不同）`) : Si(i && a ? `${e}是空白` : o && s ? `${e}是破折號（沒有值）` : `${e}兩次讀值不同（空白／破折號）`);
}
function wi(e, t, n, r, i) {
	let a = Ci(e, t, n, i);
	if (a) return a;
	let o = N(t);
	return o === N(n) ? r.test(o) ? {
		ok: !0,
		out: o
	} : Si(`${e}的寫法不在允許清單內`) : Si(`${e}兩次讀值不同`);
}
function Ti(e, t, n, r, i) {
	return Ci(e, t, n, r) || (P(t) === P(n) ? i && !i.test(t) ? Si(`${e}的寫法不在允許清單內`) : {
		ok: !0,
		out: t
	} : Si(`${e}兩次讀值不同`));
}
function Ei(e, t) {
	return t === null ? `${e} 讀法沒有回覆` : t.ok ? null : `${e} 讀法沒有可用的回覆（${t.detail}）`;
}
function Di(e, t) {
	let n = e.a.columns.length, r = e.b.columns.length, i = null;
	if (n === 5 && r === 5 ? i = "A" : n === 7 && r === 7 ? i = "B" : t.push(n === r ? `表格欄數 ${n} 不是版型的 5 欄或 7 欄` : `A、B 讀到的表格欄數不同（${n}／${r}）`), !i) return null;
	let a = si[i];
	for (let [n, r] of [["A", e.a], ["B", e.b]]) r.columns.forEach((e, r) => {
		(e === null || P(e) !== P(a[r])) && t.push(`${n} 讀法的表頭第 ${r + 1} 欄欄名不符（應為「${a[r]}」）`);
	});
	return i;
}
var Oi = (e) => e === null ? null : P(e).replace(/:/g, "");
function ki(e, t, n, r) {
	for (let e of Mn) for (let [n, i] of [["A", t.a], ["B", t.b]]) Oi(i[e].label) !== ci[e] && r.push(`${n} 讀法的「${ci[e]}」標籤不符`);
	let i = wi("報告編號", t.a.report_no.value, t.b.report_no.value, li, !1);
	i.ok ? e && i.out.endsWith("N") !== (e === "A") && r.push(e === "A" ? "報告編號結尾沒有 N，與 5 欄表格（A 型）不符" : "報告編號結尾有 N，與 7 欄表格（B 型）不符") : r.push(i.reason);
	let a = Ti("樣品名稱", t.a.sample_name.value, t.b.sample_name.value, !1);
	a.ok || r.push(a.reason);
	let o = t.a.sample_time.value, s = t.b.sample_time.value, c = null, l = Ci("採樣時間", o, s, !1);
	return l ? r.push(l.reason) : N(o) === N(s) ? (c = bi(o)) ? xi(c, n) || r.push(`採樣日期不在選的期別內（${n.rocYear} 年第 ${n.quarter} 季）`) : r.push("採樣時間的寫法無法解析（要像「年.月.日 時:分~時:分」，日期要存在）") : r.push("採樣時間兩次讀值不同"), !i.ok || !a.ok || !c || r.length ? null : {
		reportNo: i.out,
		sampleName: a.out,
		sampleTime: o,
		date: c
	};
}
function Ai(e, t, n, r) {
	let i = ai[e][t], a = [], o = Ti("項目名稱", n.item, r.item, !1);
	o.ok ? P(o.out) !== P(i) && a.push(`項目名稱與版型預期「${i}」不符`) : a.push(o.reason);
	let s = wi("檢測結果", n.result, r.result, gi, !1);
	s.ok || a.push(s.reason);
	let c;
	c = e === "A" ? n.mdl === null && r.mdl === null ? {
		ok: !0,
		out: ""
	} : Si("5 欄表格沒有 MDL 欄，卻讀到 MDL 內容") : wi("MDL", n.mdl, r.mdl, _i, !0), c.ok || a.push(c.reason);
	let l = Ti("單位", n.unit, r.unit, !0);
	l.ok || a.push(l.reason);
	let u = Ti("檢驗方法", n.method, r.method, !0, vi);
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
function ji(e, t, n, r) {
	let i = Math.max(t?.rows.length ?? 0, n?.rows.length ?? 0, e ? oi[e] : 0);
	return Array.from({ length: i }, (i, a) => ({
		index: a,
		expected: e ? ai[e][a] ?? "" : "",
		status: "manual",
		reasons: [r],
		a: t?.rows[a] ?? null,
		b: n?.rows[a] ?? null,
		out: null
	}));
}
function Mi(e, t, n) {
	let r = (e, t) => e !== null && t !== null && !hi(e) && !mi(e) && P(e) !== "" && P(e) === P(t) ? P(e) : null, i = (e, t) => e !== null && t !== null && !hi(e) && N(e) !== "" && N(e) === N(t) ? N(e) : null, a = r(n.a.sample_name.value, n.b.sample_name.value);
	return a ? {
		idx: e,
		name: a,
		type: t,
		time: i(n.a.sample_time.value, n.b.sample_time.value),
		report: i(n.a.report_no.value, n.b.report_no.value)
	} : null;
}
var Ni = (e, t) => e.endsWith("N") !== t.endsWith("N") && e.replace(/N$/, "") === t.replace(/N$/, "");
function Pi(e) {
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
		let s = Ei("A", i.a), c = Ei("B", i.b);
		if (s || c) {
			let e = [s, c].filter((e) => !!e), n = i.a?.ok ? i.a.reply : null, r = i.b?.ok ? i.b.reply : null;
			t.push({
				...o,
				tableType: null,
				reasons: e,
				rows: ji(null, n, r, "整頁需人工：" + e[0])
			});
			return;
		}
		let l = {
			a: i.a.reply,
			b: i.b.reply
		};
		n[a] = l;
		let u = [], d = Di(l, u);
		d && (l.a.rows.length !== oi[d] || l.b.rows.length !== oi[d]) && u.push(`表格列數不對（版型 ${oi[d]} 列，A 讀 ${l.a.rows.length}、B 讀 ${l.b.rows.length}）`);
		let f = ki(d, l, e.period, u), p = Mi(a, d, l);
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
			t.type && r.type && t.type === r.type && n.push("同一個樣品名稱出現兩頁相同型式的表格"), t.time && r.time && t.time !== r.time && n.push("同一站兩頁的採樣時間不同"), t.report && r.report && !Ni(t.report, r.report) && n.push("同一站兩頁的報告編號不是只差結尾 N");
		}
		if (n.length) {
			for (let r of e) t[r.idx].reasons.push(...n.map((e) => `站層級：${e}`));
			for (let n of e) t[n.idx].status = "manual", t[n.idx].identity = null;
			continue;
		}
		if (e.length === 1) {
			t[e[0].idx].warnings.push(fi);
			continue;
		}
		for (let [n, r] of [[e[0], e[1]], [e[1], e[0]]]) t[r.idx].status === "manual" && t[n.idx].warnings.push(r.time && r.report && r.type ? "同站另一頁需人工" : "同站另一頁需人工，無法交叉確認");
	}
	t.forEach((e, t) => {
		if (e.status === "skip" || e.rows.length) return;
		let r = n[t];
		if (!r) return;
		if (e.status === "manual") {
			e.rows = ji(e.tableType, r.a, r.b, "整頁需人工：" + e.reasons[0]);
			return;
		}
		let i = e.tableType;
		e.rows = r.a.rows.map((e, t) => Ai(i, t, e, r.b.rows[t]));
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
var Fi = {
	sameTime: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一站同一時間的報告（可能重複選檔）`,
	sameReport: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一個報告編號（同一份報告不該出現在兩個檔）`
};
function Ii(e) {
	let t = {
		pass: 0,
		manual: 0,
		pagesOk: 0,
		pagesManual: 0,
		pagesSkipped: 0
	};
	for (let n of e) {
		n.status === "skip" ? t.pagesSkipped++ : n.status === "ok" ? t.pagesOk++ : t.pagesManual++;
		for (let e of n.rows) e.status === "pass" ? t.pass++ : t.manual++;
	}
	return t;
}
function Li(e) {
	if (e.length < 2) return e.map((e) => e.v);
	let t = [];
	e.forEach((e, n) => e.v.pages.forEach((e, r) => {
		e.status !== "ok" || !e.identity || t.push({
			f: n,
			p: r,
			name: P(e.identity.sampleName),
			time: N(e.identity.sampleTime),
			report: N(e.identity.reportNo).replace(/N$/, "")
		});
	}));
	let n = /* @__PURE__ */ new Map(), r = (e, t) => {
		let r = `${e.f}:${e.p}`;
		n.set(r, [...n.get(r) ?? [], t]);
	};
	for (let n = 0; n < t.length; n++) for (let i = n + 1; i < t.length; i++) {
		let a = t[n], o = t[i];
		if (a.f === o.f) continue;
		let s = e[a.f].v.pages[a.p].page, c = e[o.f].v.pages[o.p].page;
		a.name === o.name && a.time === o.time && (r(a, Fi.sameTime(e[o.f].fileName, c)), r(o, Fi.sameTime(e[a.f].fileName, s))), a.report === o.report && (r(a, Fi.sameReport(e[o.f].fileName, c)), r(o, Fi.sameReport(e[a.f].fileName, s)));
	}
	return n.size ? e.map((e, t) => {
		if (![...n.keys()].some((e) => e.startsWith(`${t}:`))) return e.v;
		let r = e.v.pages.map((e, r) => {
			let i = n.get(`${t}:${r}`);
			if (!i) return e;
			let a = [...e.reasons, ...i], o = "整頁需人工：" + i[0];
			return {
				...e,
				status: "manual",
				identity: null,
				reasons: a,
				warnings: [...e.warnings],
				rows: e.rows.map((e) => ({
					...e,
					status: "manual",
					reasons: [o],
					out: null
				}))
			};
		});
		return {
			pages: r,
			totals: Ii(r)
		};
	}) : e.map((e) => e.v);
}
//#endregion
//#region src/xdwread/verify-air.ts
var Ri = "不是空品版型（封面、目錄、聲明書等沒有資料的頁也是這個結果）", zi = (e, t) => {
	if (e === null) return !1;
	let n = P(e), r = zr[t];
	return r ? r.includes(n) : n === P(t);
}, Bi = (e, t) => e !== null && P(e) === P(t);
function Vi(e, t) {
	let n = e.summary_rows;
	return n.length === t.length && t.every(([e, t, r], i) => zi(n[i].item, e) && Bi(n[i].unit, t) && Bi(n[i].stat, r));
}
function Hi(e, t) {
	let n = e.hourly.columns;
	return n.length === t.length && t.every(([e, t, r], i) => zi(n[i].item, e) && (t === null ? n[i].sub === null : Bi(n[i].sub, t)) && Bi(n[i].unit, r));
}
function Ui(e, t) {
	let n = e.form_title === null ? "" : P(e.form_title);
	return e.summary_rows !== null && e.hourly === null ? n === P(Dr.L1) ? Vi(e, Pr) ? "L1" : Vi(e, Fr) ? "L2" : (t.push(`測項列的項目／單位／統計項不符版型（讀到 ${e.summary_rows.length} 列）`), null) : (t.push("標題不是「檢測報告」"), null) : e.hourly !== null && e.summary_rows === null ? n === P(Dr.L3) && Hi(e, Ir) ? "L3" : n === P(Dr.L4) && Hi(e, Lr) ? "L4" : (t.push(`逐時表的標題或欄（項目／小字／單位）不符版型（讀到 ${e.hourly.columns.length} 欄）`), null) : (t.push(e.hourly === null ? "沒有測項表格也沒有逐時表格" : "測項表格與逐時表格兩個都有"), null);
}
var Wi = (e, t) => new Date(Date.UTC(e + 1911, t, 0)).getUTCDate(), Gi = (e) => e.rocYear >= 1 && e.month >= 1 && e.month <= 12 && e.day >= 1 && e.day <= Wi(e.rocYear, e.month), Ki = (e) => Date.UTC(e.rocYear + 1911, e.month - 1, e.day), qi = (e) => Ki(e) + (e.hour * 60 + e.minute) * 6e4, Ji = (e, t) => e.rocYear === t.rocYear && e.month === t.month && e.day === t.day, Yi = (e, t) => e.rocYear === t.rocYear && Math.ceil(e.month / 3) === t.quarter;
function Xi(e) {
	if (e === null) return null;
	let t = Gr.exec(N(e));
	if (!t) return null;
	let n = t.slice(1).map(Number), r = {
		rocYear: n[0],
		month: n[1],
		day: n[2],
		hour: n[3],
		minute: n[4]
	}, i = {
		rocYear: n[5],
		month: n[6],
		day: n[7],
		hour: n[8],
		minute: n[9]
	};
	for (let e of [r, i]) if (!Gi(e) || e.hour > 23 || e.minute > 59) return null;
	return qi(i) <= qi(r) ? null : {
		start: r,
		end: i
	};
}
function Zi(e) {
	if (e === null) return null;
	let t = Kr.exec(N(e));
	if (!t) return null;
	let n = t.slice(1).map(Number), r = {
		rocYear: n[0],
		month: n[1],
		day: n[2]
	}, i = {
		rocYear: n[3],
		month: n[4],
		day: n[5]
	};
	return !Gi(r) || !Gi(i) || Ki(i) < Ki(r) ? null : {
		start: r,
		end: i
	};
}
var Qi = (e) => {
	let [t, n = ""] = e.split(".");
	return {
		n: BigInt(t + n),
		d: n.length
	};
};
function $i(e, t, n) {
	if (!Wr.test(e) || !Wr.test(t)) return !1;
	let r = Qi(e), i = Qi(t);
	i.d += n;
	let a = Math.max(r.d, i.d), o = r.n * 10n ** BigInt(a - r.d), s = i.n * 10n ** BigInt(a - i.d), c = 10n ** BigInt(a - Math.min(r.d, i.d));
	return (o > s ? o - s : s - o) <= c;
}
function ea(e, t) {
	return t === null ? `${e} 讀法沒有回覆` : t.ok ? null : `${e} 讀法沒有可用的回覆（${t.detail}）`;
}
var ta = (e) => e === null ? null : P(e).replace(/:/g, ""), na = (e) => e.summary_rows === null && e.hourly === null;
function ra(e, t, n, r) {
	let i = Er(e), a = i ? Br.summary : Br.hourly;
	for (let [e, n] of Object.entries(a)) for (let [i, a] of [["A", t.a], ["B", t.b]]) ta(a[e].label) !== n && r.push(`${i} 讀法的「${n}」標籤不符`);
	let o = null, s = null;
	if (i) {
		let e = wi("報告編號", t.a.report_no.value, t.b.report_no.value, Vr, !1);
		e.ok ? o = e.out : r.push(e.reason);
		let n = wi("收樣日期", t.a.receive_date.value, t.b.receive_date.value, Hr, !1);
		if (!n.ok) r.push(n.reason);
		else {
			let [e, t, i] = n.out.split(".").map(Number);
			Gi({
				rocYear: e,
				month: t,
				day: i
			}) ? s = n.out : r.push("收樣日期不是存在的日期");
		}
	} else for (let e of ["report_no", "receive_date"]) [t.a, t.b].some((t) => t[e].label !== null || t[e].value !== null) && r.push(`逐時紀錄表不該有「${e === "report_no" ? "報告編號" : "收樣日期"}」，卻讀到內容`);
	let c = Ti("現場編號", t.a.site_code.value, t.b.site_code.value, !1);
	c.ok || r.push(c.reason);
	let l = Ti(i ? "檢測位置" : "監測位置", t.a.location.value, t.b.location.value, !1);
	l.ok || r.push(l.reason);
	let u = t.a.period.value, d = t.b.period.value, f = null, p = null, m = i ? "檢測日期/時間" : "監測日期";
	u === null || d === null ? r.push(`${m}是空白`) : N(u) === N(d) ? i ? (f = Xi(u), f ? p = {
		start: f.start,
		end: f.end
	} : r.push(`${m}的寫法無法解析（要像「年.月.日/時:分 至 年.月.日/時:分」，日期要存在、迄晚於起）`)) : (p = Zi(u), p || r.push(`${m}的寫法無法解析（要像「年.月.日~年.月.日」，日期要存在）`)) : r.push(`${m}兩次讀值不同`), p && !Yi(p.start, n) && r.push(`起始日期不在選的期別內（${n.rocYear} 年第 ${n.quarter} 季）`);
	let h = null;
	return i || (h = ia(t, r)), r.length || !c.ok || !l.ok || !p || i && (!o || !s || !f) || !i && !h ? null : {
		siteCode: c.out,
		location: l.out,
		siteKey: P(c.out),
		locKey: P(l.out),
		periodKey: N(u),
		reportNo: o,
		receiveDate: s,
		window: f,
		dates: p,
		hours: h
	};
}
function ia(e, t) {
	let n = t.length, r = e.a.hourly.hours, i = e.b.hourly.hours, a = -1, o = -1;
	if (r.length !== 24 || i.length !== 24) t.push(`小時列不是 24 列（A ${r.length}、B ${i.length}）`);
	else {
		let e = [], n = -1;
		for (let t = 0; t < 24; t++) {
			let s = r[t], c = i[t], l = s === null ? null : qr.exec(N(s)), u = l ? Number(l[1]) : -1, d = l ? Number(l[2]) : -1;
			s !== null && c !== null && N(s) === N(c) && l !== null && u <= 23 && d <= 23 && (u + 1) % 24 === d && (t === 0 || u === n) || e.push(t + 1), n = d, t === 0 && (a = u), t === 23 && (o = d);
		}
		e.length && t.push(`小時列兩次讀值不同、寫法不符或不連續：第 ${e.join("、")} 列`);
	}
	for (let [n, r] of [["A", e.a], ["B", e.b]]) {
		let e = r.hourly;
		e.stats.length !== Rr.length || !e.stats.every((e, t) => Bi(e.label, Rr[t])) ? t.push(`${n} 讀法的統計列標籤不符（要依序是 ${Rr.join("、")}）`) : e.stats.every((t) => t.values.length === e.columns.length) || t.push(`${n} 讀法的統計列值的個數和欄數不同`);
	}
	return t.length === n ? {
		firstStart: a,
		lastEnd: o
	} : null;
}
function aa(e, t) {
	let n = {
		name: e.name,
		layout: e.layout,
		index: e.index,
		use: e.use
	}, r = [], i, a = null, o, s;
	if (Er(e.layout)) {
		let n = t.a.summary_rows[e.index], c = t.b.summary_rows[e.index];
		o = n.value, s = c.value, i = wi(`${e.name} 的值`, n.value, c.value, Wr, !1);
		let l = Ti(`${e.name} 的單位`, n.unit, c.unit, !1);
		a = Ti(`${e.name} 的檢測方法`, n.method, c.method, !1, Ur), l.ok || r.push(l.reason), a.ok || r.push(a.reason);
	} else o = t.a.hourly.stats[2].values[e.index], s = t.b.hourly.stats[2].values[e.index], i = wi(`${e.name} 的日平均值`, o, s, Wr, !1);
	i.ok || r.unshift(i.reason);
	let c = r.length === 0 && i.ok && (a === null || a.ok);
	return {
		...n,
		status: c ? "pass" : "manual",
		reasons: r,
		a: o,
		b: s,
		value: c && i.ok ? i.out : null,
		method: c && a && a.ok ? a.out : null
	};
}
var oa = (e) => [...Yr, ...Xr].filter((t) => t.layout === e);
function sa(e, t) {
	let n = [], r = [];
	for (let i of e.pages) {
		let a = {
			page: i.page,
			mode: i.mode,
			layout: null,
			status: "manual",
			reasons: [],
			identity: null,
			cells: [],
			station: null
		};
		if (r.push(null), i.mode === "skip") {
			n.push({
				...a,
				status: "skip",
				reasons: ["這頁沒有送出"]
			});
			continue;
		}
		let o = ea("A", i.a), s = ea("B", i.b);
		if (o || s) {
			n.push({
				...a,
				reasons: [o, s].filter((e) => !!e)
			});
			continue;
		}
		let c = {
			a: i.a.reply,
			b: i.b.reply
		};
		r[r.length - 1] = c;
		let l = [], u = [], d = Ui(c.a, l), f = Ui(c.b, u);
		if (!d && !f && na(c.a) && na(c.b)) {
			n.push({
				...a,
				status: "nodata",
				reasons: [Ri]
			});
			continue;
		}
		if (!d || !f || d !== f) {
			let e = d && f ? [`A、B 判定的版型不同（${d}／${f}）`] : [
				Ri,
				...l.map((e) => `A 讀法：${e}`),
				...u.map((e) => `B 讀法：${e}`)
			];
			n.push({
				...a,
				layout: d === f ? d : null,
				reasons: e
			});
			continue;
		}
		let p = [], m = ra(d, c, e.period, p);
		if (!m) {
			n.push({
				...a,
				layout: d,
				reasons: p
			});
			continue;
		}
		let h = t?.get(i.page);
		if (h !== void 0) {
			n.push({
				...a,
				layout: d,
				identity: m,
				reasons: [h]
			});
			continue;
		}
		n.push({
			...a,
			layout: d,
			status: "ok",
			identity: m,
			cells: oa(d).map((e) => aa(e, c))
		});
	}
	let i = /* @__PURE__ */ new Map();
	n.forEach((e, t) => {
		if (e.status !== "ok") return;
		let n = `${e.identity.siteKey}\u0000${e.identity.locKey}`;
		i.set(n, [...i.get(n) ?? [], t]);
	});
	let a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
	for (let e of i.values()) {
		let t = n[e[0]].identity;
		a.set(t.locKey, (a.get(t.locKey) ?? /* @__PURE__ */ new Set()).add(t.siteKey)), o.set(t.siteKey, (o.get(t.siteKey) ?? /* @__PURE__ */ new Set()).add(t.locKey));
	}
	let s = [], c = (e, t) => {
		let r = n[e];
		r.status = "manual", r.reasons.push(`站層級：${t}`);
	};
	for (let e of i.values()) {
		let t = s.length, r = n[e[0]].identity, i = {
			siteCode: r.siteCode,
			location: r.location,
			pages: {},
			status: "ok",
			reasons: [],
			window: null,
			windowPage: null,
			receiveDate: null,
			reportNos: {
				L1: null,
				L2: null
			},
			values: []
		};
		s.push(i);
		let l = {}, u = (e) => {
			i.reasons.includes(e) || i.reasons.push(e), i.status = "manual";
		};
		for (let r of e) {
			n[r].station = t;
			let e = n[r].layout;
			l[e] !== void 0 && u(`同一站有兩頁以上的 ${e} 版型`), l[e] = r, i.pages[e] = n[r].page;
		}
		if ((a.get(r.locKey)?.size ?? 0) > 1 && u("同一個測站名稱出現不同的現場編號（矛盾）"), (o.get(r.siteKey)?.size ?? 0) > 1 && u("同一個現場編號出現不同的測站名稱（矛盾）"), i.status === "manual") {
			e.forEach((e) => c(e, i.reasons[0])), ca(i, i.reasons[0]);
			continue;
		}
		let d = l.L1, f = l.L2;
		if (d !== void 0 && f !== void 0) {
			let e = n[d].identity, t = n[f].identity, r = [];
			if (e.periodKey !== t.periodKey && r.push("L1、L2 的檢測日期/時間不同"), e.reportNo === t.reportNo && r.push("L1、L2 的報告編號相同（應該是兩份報告）"), e.receiveDate !== t.receiveDate && r.push("L1、L2 的收樣日期不同"), r.length) for (let e of [d, f]) for (let t of r) c(e, t);
		}
		let p = [d, f].find((e) => e !== void 0 && n[e].status === "ok");
		if (p === void 0) u("這一站沒有通過的總表（L1 或 L2），拿不到時間窗");
		else {
			let e = n[p].identity, t = e.window;
			if ((t.start.minute !== 0 || t.end.minute !== 0 || qi(t.end) - qi(t.start) !== 24 * 36e5) && u("時間窗不是整點起訖的 24 小時"), Number(e.receiveDate.split(".")[0]) !== t.start.rocYear && u("收樣日期的年和時間窗起始的年不同"), i.status === "ok") {
				i.window = t, i.windowPage = n[p].page, i.receiveDate = e.receiveDate, d !== void 0 && n[d].status === "ok" && (i.reportNos.L1 = n[d].identity.reportNo), f !== void 0 && n[f].status === "ok" && (i.reportNos.L2 = n[f].identity.reportNo), i.location = e.location, i.siteCode = e.siteCode;
				for (let e of ["L3", "L4"]) {
					let r = l[e];
					if (r === void 0) continue;
					let i = n[r].identity;
					!Ji(i.dates.start, t.start) || !Ji(i.dates.end, t.end) ? c(r, `${e} 的監測日期和總表的時間窗日期不同`) : (i.hours.firstStart !== t.start.hour || i.hours.lastEnd !== t.end.hour) && c(r, `${e} 的第一／最後一個小時格和總表的時間窗不同`);
				}
			}
		}
		if (i.status === "manual") {
			e.forEach((e) => {
				n[e].status === "ok" && c(e, i.reasons[0]);
			}), ca(i, i.reasons[0]);
			continue;
		}
		i.values = la(n, l);
	}
	let l = {
		pass: 0,
		manual: 0,
		pagesOk: 0,
		pagesManual: 0,
		pagesSkipped: 0,
		pagesNoData: 0,
		stations: s.length
	};
	for (let e of n) e.status === "ok" ? l.pagesOk++ : e.status === "skip" ? l.pagesSkipped++ : e.status === "nodata" ? l.pagesNoData++ : l.pagesManual++;
	for (let e of s) for (let t of e.values) t.status === "pass" ? l.pass++ : l.manual++;
	return {
		pages: n,
		stations: s,
		totals: l
	};
}
function ca(e, t) {
	e.values = Jr.map((e) => ({
		key: e,
		page: null,
		status: "manual",
		reasons: [`全站需人工：${t}`],
		value: null,
		method: null,
		cross: "none"
	}));
}
function la(e, t) {
	let n = (n) => {
		let r = t[n];
		return r !== void 0 && e[r].status === "ok" ? e[r] : null;
	}, r = (e, t) => n(e)?.cells.find((n) => n.name === t && n.layout === e) ?? null, i = [];
	for (let a of Jr) {
		let o = Yr.find((e) => e.key === a), s = n(o.layout), c = {
			key: a,
			page: s?.page ?? null,
			status: "manual",
			reasons: [],
			value: null,
			method: null,
			cross: "none"
		};
		if (i.push(c), !s) {
			let n = t[o.layout];
			c.page = n === void 0 ? null : e[n].page, c.reasons.push(n === void 0 ? `沒有通過頁層級核對的 ${o.layout} 頁（來源頁）` : `來源頁（${o.layout}）需人工：${e[n].reasons[e[n].reasons.length - 1] ?? ""}`);
			continue;
		}
		let l = r(o.layout, o.name);
		if (l.status !== "pass") {
			c.reasons.push(...l.reasons);
			continue;
		}
		let u = l.method;
		if (!Er(o.layout)) {
			let e = ii[a] ?? a, t = r("L1", e);
			if (!t || t.status !== "pass" || !t.method) {
				c.reasons.push(`方法來源（L1 的 ${e} 日平均列）沒有通過核對`);
				continue;
			}
			u = t.method;
		}
		let d = Zr.find((e) => e.key === a);
		if (d) {
			let e = r(d.against.layout, d.against.name);
			if (!e || e.status !== "pass") {
				c.cross = "unavailable", c.reasons.push(`交叉檢查無法進行（${d.against.layout} 的 ${d.against.name} 日平均沒有通過核對）`);
				continue;
			}
			if (!$i(l.value, e.value, d.shift)) {
				c.cross = "mismatch", c.reasons.push(`交叉檢查不一致（和 ${d.against.layout} 的 ${d.against.name} 日平均${d.shift ? "換算後" : ""}差超過末位 1）`);
				continue;
			}
			c.cross = "pass";
		}
		c.status = "pass", c.value = l.value, c.method = u;
	}
	return i;
}
var ua = {
	sameDay: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一站（現場編號＋測站）同一天的報告（可能重複選檔，例如 A 檔與 PM2.5 氣象檔）`,
	sameReport: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一個報告編號（同一份報告不該出現在兩個檔）`
};
function da(e) {
	let t = e.map(() => /* @__PURE__ */ new Map());
	if (e.length < 2) return t;
	let n = [];
	e.forEach((e, t) => e.v.pages.forEach((e) => {
		let r = e.identity;
		if (!r) return;
		let i = r.dates.start;
		n.push({
			f: t,
			page: e.page,
			day: `${r.siteKey}\u0000${r.locKey}\u0000${i.rocYear}.${i.month}.${i.day}`,
			report: r.reportNo === null ? null : N(r.reportNo).replace(/N$/, "")
		});
	}));
	let r = (e, n) => {
		t[e.f].has(e.page) || t[e.f].set(e.page, n);
	};
	for (let t = 0; t < n.length; t++) for (let i = t + 1; i < n.length; i++) {
		let a = n[t], o = n[i];
		a.f !== o.f && (a.day === o.day && (r(a, ua.sameDay(e[o.f].fileName, o.page)), r(o, ua.sameDay(e[a.f].fileName, a.page))), a.report !== null && a.report === o.report && (r(a, ua.sameReport(e[o.f].fileName, o.page)), r(o, ua.sameReport(e[a.f].fileName, a.page))));
	}
	return t;
}
//#endregion
//#region src/xdwread/manual.ts
var fa = [
	"result",
	"mdl",
	"unit",
	"method"
], pa = /sk-ant-/i, ma = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u, F = {
	notEditable: "這一列不能在視窗裡輸入",
	pageNotOk: "這頁整頁需人工（或沒送），要匯入後到原網站表格手動補",
	rowPass: "這一列已經通過核對，不需要人工輸入",
	item: "項目名稱和版型預期的不一樣（內部檢查）",
	source: "來源標記不對（內部檢查）",
	notString: "有一格不是文字（內部檢查）",
	tooLong: "有一格太長",
	secret: "有一格含疑似金鑰的字串",
	result: "檢測結果要寫成 ND、<數字 或純數字（例：ND、<0.5、12.30）",
	resultBlank: "檢測結果不可空白",
	mdlA: "這頁的表格沒有 MDL 欄，MDL 要空白",
	mdl: "MDL 要寫純數字，或空白",
	unitBad: "單位不可是 UNREADABLE",
	unitCtrl: "單位不可有換行或控制字元",
	unitLong: "單位最多 30 個字",
	unitDash: "沒有單位請留空白（不要寫破折號）",
	method: "方法要寫成「NIEA X000.00X」，或空白",
	ctrl: "不可有換行或控制字元",
	presetNotDash: "只有檢測結果兩次都是破折號的列可以套用上一季寫法",
	presetFilled: "套用上一季寫法時檢測結果與 MDL 要空白",
	presetBad: "套用方式不對（內部檢查）",
	agreed: "A、B 一致"
}, ha = (e) => e.status === "ok" && e.mode === "whole" && e.identity !== null && (e.tableType === "A" || e.tableType === "B");
function ga(e, t) {
	if (!ha(e) || t.status !== "manual") return !1;
	let n = ai[e.tableType][t.index];
	return n !== void 0 && n === t.expected;
}
var _a = (e) => !!e.a && !!e.b && mi(e.a.result) && mi(e.b.result), va = (e) => typeof e == "string";
function ya(e, t, n, r = null) {
	if (!va(t)) return F.notString;
	if (t.length > 200) return F.tooLong;
	if (pa.test(t)) return F.secret;
	switch (e) {
		case "result": {
			let e = N(t);
			return r === "unmeasurable" ? e === "" ? null : F.presetFilled : e === "" ? F.resultBlank : gi.test(e) ? null : F.result;
		}
		case "mdl": {
			let e = N(t);
			return r === "unmeasurable" ? e === "" ? null : F.presetFilled : n === "A" ? e === "" ? null : F.mdlA : e === "" || _i.test(e) ? null : F.mdl;
		}
		case "unit": {
			let e = t.trim();
			return ma.test(t) ? F.unitCtrl : N(e) === "UNREADABLE" ? F.unitBad : e !== "" && mi(e) ? F.unitDash : e.length > 30 ? F.unitLong : null;
		}
		case "method": {
			let e = t.trim();
			return ma.test(t) ? F.ctrl : e === "" || vi.test(e) ? null : F.method;
		}
	}
}
var ba = (e, t) => e === "result" || e === "mdl" ? N(t) : t.trim();
function xa(e, t) {
	let n = {
		result: "",
		mdl: "",
		unit: "",
		method: ""
	}, r = {
		result: !1,
		mdl: !1,
		unit: !1,
		method: !1
	}, i = {
		result: "",
		mdl: "",
		unit: "",
		method: ""
	}, a = e.tableType;
	if (!ga(e, t) || !a || !t.a || !t.b) {
		for (let e of fa) i[e] = F.notEditable;
		return {
			raw: n,
			agreed: r,
			why: i
		};
	}
	let o = t.a, s = t.b, c = {
		result: wi("檢測結果", o.result, s.result, gi, !1),
		mdl: a === "A" ? null : wi("MDL", o.mdl, s.mdl, _i, !0),
		unit: Ti("單位", o.unit, s.unit, !0),
		method: Ti("檢驗方法", o.method, s.method, !0, vi)
	};
	for (let e of fa) {
		let t = c[e];
		if (t === null) {
			i[e] = F.mdlA;
			continue;
		}
		if (!t.ok) {
			i[e] = t.reason;
			continue;
		}
		let o = ya(e, t.out, a);
		if (o) {
			i[e] = o;
			continue;
		}
		n[e] = t.out, r[e] = !0, i[e] = F.agreed;
	}
	return {
		raw: n,
		agreed: r,
		why: i
	};
}
function Sa(e, t, n) {
	let r = [];
	if (!n || typeof n != "object") return {
		ok: !1,
		reasons: [F.notString]
	};
	if (!ha(e)) return {
		ok: !1,
		reasons: [F.pageNotOk]
	};
	if (!t || t.index !== n.index || n.page !== e.page) return {
		ok: !1,
		reasons: [F.notEditable]
	};
	if (t.status !== "manual") return {
		ok: !1,
		reasons: [F.rowPass]
	};
	if (!ga(e, t)) return {
		ok: !1,
		reasons: [F.notEditable]
	};
	let i = e.tableType;
	(n.item !== ai[i][n.index] || n.item !== t.expected) && r.push(F.item), n.source !== "manual" && r.push(F.source);
	let a = n.raw;
	if (!a || typeof a != "object" || !fa.every((e) => va(a[e]))) return {
		ok: !1,
		reasons: [...r, F.notString]
	};
	let o = n.preset;
	o !== null && o !== "unmeasurable" && r.push(F.presetBad), o === "unmeasurable" && (_a(t) || r.push(F.presetNotDash), a.result !== "" && r.push(F.presetFilled));
	for (let e of fa) {
		let t = ya(e, a[e], i, o === "unmeasurable" ? o : null);
		t && !r.includes(t) && r.push(t);
	}
	return r.length ? {
		ok: !1,
		reasons: r
	} : {
		ok: !0,
		cells: {
			item: n.item,
			result: ba("result", a.result),
			mdl: ba("mdl", a.mdl),
			unit: ba("unit", a.unit),
			method: ba("method", a.method),
			preset: o === "unmeasurable" ? o : null
		}
	};
}
function Ca(e, t, n, r) {
	let i = e.tableType;
	return {
		page: e.page,
		index: t.index,
		item: ai[i][t.index],
		raw: {
			result: n.result,
			mdl: n.mdl,
			unit: n.unit,
			method: n.method
		},
		preset: r,
		source: "manual"
	};
}
function wa(e, t) {
	let n = 0, r = 0;
	for (let i of t) {
		let t = e.find((e) => e.page === i.page);
		if (!t) continue;
		let a = Sa(t, t.rows[i.index], i);
		a.ok && (n++, a.cells.preset && r++);
	}
	return {
		ok: n,
		preset: r
	};
}
//#endregion
//#region src/xdwread/template-noise.ts
var Ta = (e) => e === "N2" || e === "V1", Ea = {
	N1: "檢測報告",
	N2: "監測數據逐時紀錄(噪音)",
	V1: "監測數據逐時紀錄(振動)"
}, Da = [
	"L日監測值",
	"L晚監測值",
	"L夜監測值",
	"Ld監測值",
	"Ln監測值",
	"Leq24監測值"
], Oa = "管制區標準類屬", ka = {
	II: "第二類噪音管制區一般環境",
	III: "第三類噪音管制區一般環境"
}, Aa = {
	II: "第二類",
	III: "第三類"
}, ja = [
	"Leq",
	"Lmax",
	"L5",
	"L10",
	"L50",
	"L90",
	"L95"
], Ma = {
	II: [
		"L日(06~20)",
		"L晚(20~22)",
		"L夜(22~06)",
		"Ld(07~22)",
		"Ln(22~07)",
		"Ldn",
		"Leq(24)"
	],
	III: [
		"L日(07~20)",
		"L晚(20~23)",
		"L夜(23~07)",
		"Ld(07~22)",
		"Ln(22~07)",
		"Ldn",
		"Leq(24)"
	]
}, Na = [
	"LV(10)eq",
	"LVmax",
	"LV10(1)",
	"LV10(2)",
	"LV10(3)",
	"LV10(4)",
	"LV10(5)"
], Pa = [
	"LV(10)日(05~19)",
	"LV(10)夜(19~05)",
	"LV(10)eq(24)"
], Fa = {
	summary: {
		report_no: "報告編號",
		site_code: "現場編號",
		location: "檢測位置",
		period: "檢測日期/時間",
		zone: Oa
	},
	hourly: {
		site_code: "現場編號",
		location: "監測位置",
		period: "監測日期"
	}
}, Ia = /^[A-Z]{2}\d{3}[A-Z]\d{4}N?$/, La = /^NIEA [A-Z]\d{3}\.\d{2}[A-Z]$/, Ra = /^(?:0|[1-9]\d*)(?:\.\d)?$/, za = /^(\d{3})\.(\d{2})\.(\d{2})\/(\d{2}):(\d{2})至(\d{3})\.(\d{2})\.(\d{2})\/(\d{2}):(\d{2})$/, Ba = /^(\d{3})\.(\d{2})\.(\d{2})-(\d{2})$/, Va = /^(\d{2}):00~(\d{2}):00$/, Ha = [
	"L日",
	"L晚",
	"L夜",
	"Lv10日",
	"Lv10夜"
], Ua = [
	"L日",
	"L晚",
	"L夜"
], Wa = ["Lv10日", "Lv10夜"], Ga = {
	L日: {
		layout: "N2",
		index: 0
	},
	L晚: {
		layout: "N2",
		index: 1
	},
	L夜: {
		layout: "N2",
		index: 2
	},
	Lv10日: {
		layout: "V1",
		index: 0
	},
	Lv10夜: {
		layout: "V1",
		index: 1
	}
}, Ka = {
	L日: {
		layout: "N1",
		index: 0
	},
	L晚: {
		layout: "N1",
		index: 1
	},
	L夜: {
		layout: "N1",
		index: 2
	}
}, I = {
	agencyCell: [1, 0],
	agencyLabel: "採樣單位：",
	locationCell: [2, 0],
	locationLabel: "監測地點：",
	dateCell: [3, 0],
	dateLabel: "監測日期：",
	methodCell: [4, 0],
	methodLabel: "採樣方法：",
	reportCell: [5, 0],
	reportLabel: "報告編號：",
	timeHeaderCell: [7, 0],
	timeHeader: "時間",
	firstHourRow: 8,
	hourCol: 0,
	labelRow: 32,
	valueRow: 33,
	rows: 34,
	cols: 3
}, qa = {
	Lv10日: "Lv日(Lv10)=",
	Lv10夜: "Lv夜(Lv10)="
}, Ja = {
	L日: "日間",
	L晚: "晚間",
	L夜: "夜間",
	Lv10日: "日間",
	Lv10夜: "夜間"
}, Ya = {
	noise: {
		category: "環境噪音",
		feature: "均能音量(Leq)",
		unit: "16",
		standard: "噪音管制法第7條第1項",
		zone: ""
	},
	vib: {
		category: "振動",
		featureDay: "Lvd(10)",
		featureNight: "Lvn(10)",
		unit: "159",
		method: "NIEA P204",
		standard: "無",
		zone: "無"
	}
}, Xa = "不是噪音振動版型（封面、目錄、聲明書等沒有資料的頁也是這個結果）", Za = (e, t) => e !== null && P(e) === P(t), Qa = (e, t) => e !== null && P(e).toUpperCase() === P(t).toUpperCase(), $a = (e, t) => Za(e, Da[t]) || t < 3 && Za(e, "L?監測值");
function eo(e) {
	let t = e.hourly?.results;
	if (!t) return null;
	for (let e of ["II", "III"]) {
		let n = Ma[e];
		if (t.length === n.length && n.every((e, n) => Za(t[n].label, e) && Za(t[n].unit, "dB(A)"))) return e;
	}
	return null;
}
function to(e, t) {
	let n = e.form_title === null ? "" : P(e.form_title);
	if (e.summary_rows !== null && e.hourly === null) {
		if (n !== P(Ea.N1)) return t.push("標題不是「檢測報告」"), null;
		let r = e.summary_rows;
		return r.length === Da.length && r.every((e, t) => Za(e.item, "一般環境噪音") && Za(e.unit, "dB(A)") && $a(e.stat, t)) ? "N1" : (t.push(`測項列的項目／單位／統計項不符版型（讀到 ${r.length} 列）`), null);
	}
	if (e.hourly !== null && e.summary_rows === null) {
		let r = e.hourly;
		if (n === P(Ea.N2)) return r.columns.length === ja.length && ja.every((e, t) => Za(r.columns[t].item, e) && Za(r.columns[t].unit, "dB(A)")) && eo(e) ? "N2" : (t.push(`噪音逐時表的欄或監測結果（標籤／單位）不符版型（讀到 ${r.columns.length} 欄、${r.results.length} 個結果）`), null);
		if (n === P(Ea.V1)) {
			let e = r.columns.length === Na.length && Na.every((e, t) => Qa(r.columns[t].item, e) && Za(r.columns[t].unit, "dB")), n = r.results.length === Pa.length && Pa.every((e, t) => Qa(r.results[t].label, e) && Za(r.results[t].unit, "dB"));
			return e && n ? "V1" : (t.push(`振動逐時表的欄或監測結果（標籤／單位）不符版型（讀到 ${r.columns.length} 欄、${r.results.length} 個結果）`), null);
		}
		return t.push("逐時表的標題不符版型"), null;
	}
	return t.push(e.hourly === null ? "沒有測項表格也沒有逐時表格" : "測項表格與逐時表格兩個都有"), null;
}
var no = (e, t) => new Date(Date.UTC(e + 1911, t, 0)).getUTCDate(), ro = (e) => e.rocYear >= 1 && e.month >= 1 && e.month <= 12 && e.day >= 1 && e.day <= no(e.rocYear, e.month), io = (e) => Date.UTC(e.rocYear + 1911, e.month - 1, e.day, e.hour, e.minute), ao = (e, t) => e.rocYear === t.rocYear && e.month === t.month && e.day === t.day, oo = (e, t) => e.rocYear === t.rocYear && Math.ceil(e.month / 3) === t.quarter;
function so(e) {
	if (e === null) return null;
	let t = za.exec(N(e));
	if (!t) return null;
	let n = t.slice(1).map(Number), r = {
		rocYear: n[0],
		month: n[1],
		day: n[2],
		hour: n[3],
		minute: n[4]
	}, i = {
		rocYear: n[5],
		month: n[6],
		day: n[7],
		hour: n[8],
		minute: n[9]
	};
	for (let e of [r, i]) if (!ro(e) || e.hour > 23 || e.minute > 59) return null;
	return io(i) <= io(r) ? null : {
		start: r,
		end: i
	};
}
function co(e) {
	if (e === null) return null;
	let t = Ba.exec(N(e));
	if (!t) return null;
	let n = t.slice(1).map(Number), r = {
		rocYear: n[0],
		month: n[1],
		day: n[2]
	};
	return !ro(r) || n[3] < 1 || n[3] > 31 ? null : {
		start: r,
		endDay: n[3]
	};
}
function lo(e, t) {
	return t === null ? `${e} 讀法沒有回覆` : t.ok ? null : `${e} 讀法沒有可用的回覆（${t.detail}）`;
}
var uo = (e) => e === null ? null : P(e).replace(/:/g, ""), fo = (e) => e.summary_rows === null && e.hourly === null;
function po(e, t) {
	let n = e.a.hourly.hours, r = e.b.hourly.hours;
	if (n.length !== 24 || r.length !== 24) return t.push(`小時列不是 24 列（A ${n.length}、B ${r.length}）`), null;
	let i = [], a = -1, o = -1, s = -1;
	for (let e = 0; e < 24; e++) {
		let t = n[e], c = r[e], l = t === null ? null : Va.exec(N(t)), u = l ? Number(l[1]) : -1, d = l ? Number(l[2]) : -1;
		t !== null && c !== null && N(t) === N(c) && l !== null && u <= 23 && d === u + 1 && (e === 0 || u === a % 24) || i.push(e + 1), a = d, e === 0 && (o = u), e === 23 && (s = d % 24);
	}
	return i.length ? (t.push(`小時列兩次讀值不同、寫法不符或不連續：第 ${i.join("、")} 列`), null) : {
		firstStart: o,
		lastEnd: s
	};
}
function mo(e, t, n, r) {
	let i = Ta(e), a = i ? Fa.hourly : Fa.summary;
	for (let [e, n] of Object.entries(a)) for (let [i, a] of [["A", t.a], ["B", t.b]]) uo(a[e].label) !== P(n) && r.push(`${i} 讀法的「${n}」標籤不符`);
	let o = null, s = null;
	if (i) for (let e of ["report_no", "zone"]) [t.a, t.b].some((t) => t[e].label !== null || t[e].value !== null) && r.push(`逐時紀錄不該有「${e === "report_no" ? "報告編號" : "管制區標準類屬"}」，卻讀到內容`);
	else {
		let e = wi("報告編號", t.a.report_no.value, t.b.report_no.value, Ia, !1);
		e.ok ? o = e.out : r.push(e.reason);
		let n = Ti("管制區標準類屬", t.a.zone.value, t.b.zone.value, !1);
		n.ok && (s = Object.keys(ka).find((e) => P(n.out) === ka[e]) ?? null);
	}
	let c = Ti("現場編號", t.a.site_code.value, t.b.site_code.value, !1);
	c.ok || r.push(c.reason);
	let l = Ti(i ? "監測位置" : "檢測位置", t.a.location.value, t.b.location.value, !1);
	l.ok || r.push(l.reason);
	let u = t.a.period.value, d = t.b.period.value, f = i ? "監測日期" : "檢測日期/時間", p = null, m = null, h = null;
	if (u === null || d === null) r.push(`${f}是空白`);
	else if (N(u) !== N(d)) r.push(`${f}兩次讀值不同`);
	else if (!i) p = so(u), p ? m = p.start : r.push(`${f}的寫法無法解析（要像「年.月.日/時:分 至 年.月.日/時:分」，日期要存在、迄晚於起）`);
	else {
		let e = co(u);
		e ? (m = e.start, h = e.endDay) : r.push(`${f}的寫法無法解析（要像「年.月.日-日」，日期要存在）`);
	}
	m && !oo(m, n) && r.push(`起始日期不在選的期別內（${n.rocYear} 年第 ${n.quarter} 季）`);
	let g = i ? po(t, r) : null;
	return r.length || !c.ok || !l.ok || !m || !i && (!o || !p) || i && !g ? null : {
		siteCode: c.out,
		location: l.out,
		siteKey: P(c.out),
		locKey: P(l.out),
		periodKey: N(u),
		reportNo: o,
		window: p,
		zone: s,
		start: m,
		endDay: h,
		hours: g,
		labelsClass: e === "N2" ? eo(t.a) : null
	};
}
function ho(e, t, n) {
	let r = [], i = e === "N1" ? "check" : "write";
	if (e === "N1") {
		let a = n.a.summary_rows[t], o = n.b.summary_rows[t], s = wi(`第 ${t + 1} 列的值`, a.value, o.value, Ra, !1), c = Ti(`第 ${t + 1} 列的檢測方法`, a.method, o.method, !1, La);
		s.ok || r.push(s.reason), c.ok || r.push(c.reason);
		let l = s.ok && c.ok;
		return {
			index: t,
			layout: e,
			use: i,
			status: l ? "pass" : "manual",
			reasons: r,
			a: a.value,
			b: o.value,
			value: l && s.ok ? s.out : null,
			method: l && c.ok ? c.out : null
		};
	}
	let a = n.a.hourly.results[t], o = n.b.hourly.results[t], s = wi(`監測結果第 ${t + 1} 個的值`, a.value, o.value, Ra, !1);
	return s.ok || r.push(s.reason), {
		index: t,
		layout: e,
		use: i,
		status: s.ok ? "pass" : "manual",
		reasons: r,
		a: a.value,
		b: o.value,
		value: s.ok ? s.out : null,
		method: null
	};
}
var go = (e) => e === "N1" || e === "N2" ? [
	0,
	1,
	2
] : [0, 1];
function _o(e, t) {
	let n = [];
	for (let r of e.pages) {
		let i = {
			page: r.page,
			mode: r.mode,
			layout: null,
			status: "manual",
			reasons: [],
			identity: null,
			cells: [],
			station: null
		};
		if (r.mode === "skip") {
			n.push({
				...i,
				status: "skip",
				reasons: ["這頁沒有送出"]
			});
			continue;
		}
		let a = lo("A", r.a), o = lo("B", r.b);
		if (a || o) {
			n.push({
				...i,
				reasons: [a, o].filter((e) => !!e)
			});
			continue;
		}
		let s = {
			a: r.a.reply,
			b: r.b.reply
		}, c = [], l = [], u = to(s.a, c), d = to(s.b, l);
		if (!u && !d && fo(s.a) && fo(s.b)) {
			n.push({
				...i,
				status: "nodata",
				reasons: [Xa]
			});
			continue;
		}
		if (!u || !d || u !== d) {
			let e = u && d ? [`A、B 判定的版型不同（${u}／${d}）`] : [
				Xa,
				...c.map((e) => `A 讀法：${e}`),
				...l.map((e) => `B 讀法：${e}`)
			];
			n.push({
				...i,
				reasons: e
			});
			continue;
		}
		if (u === "N2" && eo(s.a) !== eo(s.b)) {
			n.push({
				...i,
				layout: u,
				reasons: [`A、B 讀到的監測結果時段標籤不是同一套（${eo(s.a) === "II" ? "第二類" : "第三類"}／${eo(s.b) === "II" ? "第二類" : "第三類"}）`]
			});
			continue;
		}
		let f = [], p = mo(u, s, e.period, f);
		if (!p) {
			n.push({
				...i,
				layout: u,
				reasons: f
			});
			continue;
		}
		let m = t?.get(r.page);
		if (m !== void 0) {
			n.push({
				...i,
				layout: u,
				identity: p,
				reasons: [m]
			});
			continue;
		}
		n.push({
			...i,
			layout: u,
			status: "ok",
			identity: p,
			cells: go(u).map((e) => ho(u, e, s))
		});
	}
	let r = /* @__PURE__ */ new Map();
	n.forEach((e, t) => {
		if (e.status !== "ok") return;
		let n = `${e.identity.siteKey}\u0000${e.identity.locKey}`;
		r.set(n, [...r.get(n) ?? [], t]);
	});
	let i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
	for (let e of r.values()) {
		let t = n[e[0]].identity;
		i.set(t.locKey, (i.get(t.locKey) ?? /* @__PURE__ */ new Set()).add(t.siteKey)), a.set(t.siteKey, (a.get(t.siteKey) ?? /* @__PURE__ */ new Set()).add(t.locKey));
	}
	let o = [], s = (e, t) => {
		let r = n[e];
		r.status = "manual", r.reasons.push(`站層級：${t}`);
	};
	for (let e of r.values()) {
		let t = o.length, r = n[e[0]].identity, c = {
			siteCode: r.siteCode,
			location: r.location,
			pages: {},
			status: "ok",
			reasons: [],
			window: null,
			windowPage: null,
			reportNo: null,
			zone: null,
			values: []
		};
		o.push(c);
		let l = {}, u = (e) => {
			c.reasons.includes(e) || c.reasons.push(e), c.status = "manual";
		};
		for (let r of e) {
			n[r].station = t;
			let e = n[r].layout;
			l[e] !== void 0 && u(`同一站有兩頁以上的 ${e} 版型`), l[e] = r, c.pages[e] = n[r].page;
		}
		if ((i.get(r.locKey)?.size ?? 0) > 1 && u("同一個測站名稱出現不同的現場編號（矛盾）"), (a.get(r.siteKey)?.size ?? 0) > 1 && u("同一個現場編號出現不同的測站名稱（矛盾）"), c.status === "ok" && l.N1 === void 0 && u("這一站沒有通過的噪音總表（N1），拿不到時間窗、方法與交叉檢查"), c.status === "ok") {
			let e = n[l.N1].identity, t = e.window;
			if (t.start.minute !== 0 || t.end.minute !== 0 || io(t.end) - io(t.start) !== 24 * 36e5) u("時間窗不是整點起訖的 24 小時");
			else {
				c.window = t, c.windowPage = n[l.N1].page, c.reportNo = e.reportNo, c.zone = e.zone, c.location = e.location, c.siteCode = e.siteCode;
				for (let r of ["N2", "V1"]) {
					let i = l[r];
					if (i === void 0) continue;
					let a = n[i].identity;
					!ao(a.start, t.start) || a.endDay !== t.end.day ? s(i, `${r} 的監測日期和噪音總表的時間窗不同`) : a.hours.firstStart !== t.start.hour || a.hours.lastEnd !== t.end.hour ? s(i, `${r} 的第一／最後一個小時格和噪音總表的時間窗不同`) : r === "N2" && (e.zone === null || a.labelsClass !== e.zone) && s(i, "N2 監測結果的時段標籤和噪音總表的管制區類屬對不上（或管制區讀不出、不是第二類／第三類）");
				}
			}
		}
		if (c.status === "manual") {
			e.forEach((e) => {
				n[e].status === "ok" && s(e, c.reasons[0]);
			}), c.values = Ha.map((e) => ({
				key: e,
				page: null,
				status: "manual",
				reasons: [`全站需人工：${c.reasons[0]}`],
				value: null,
				method: null,
				cross: "none"
			}));
			continue;
		}
		c.values = vo(n, l);
	}
	let c = {
		pass: 0,
		manual: 0,
		pagesOk: 0,
		pagesManual: 0,
		pagesSkipped: 0,
		pagesNoData: 0,
		stations: o.length
	};
	for (let e of n) e.status === "ok" ? c.pagesOk++ : e.status === "skip" ? c.pagesSkipped++ : e.status === "nodata" ? c.pagesNoData++ : c.pagesManual++;
	for (let e of o) for (let t of e.values) t.status === "pass" ? c.pass++ : c.manual++;
	return {
		pages: n,
		stations: o,
		totals: c
	};
}
function vo(e, t) {
	let n = (n) => {
		let r = t[n];
		return r !== void 0 && e[r].status === "ok" ? e[r] : null;
	}, r = (e, t) => n(e)?.cells.find((e) => e.index === t) ?? null, i = Ha.map((i) => {
		let a = Ga[i], o = n(a.layout), s = {
			key: i,
			page: o?.page ?? null,
			status: "manual",
			reasons: [],
			value: null,
			method: null,
			cross: "none"
		};
		if (!o) {
			let n = t[a.layout];
			return s.page = n === void 0 ? null : e[n].page, s.reasons.push(n === void 0 ? `沒有通過頁層級核對的 ${a.layout} 頁（來源頁）` : `來源頁（${a.layout}）需人工：${e[n].reasons[e[n].reasons.length - 1] ?? ""}`), s;
		}
		let c = r(a.layout, a.index);
		if (c.status !== "pass") return s.reasons.push(...c.reasons), s;
		let l = Ka[i], u = null;
		if (l) {
			let e = r("N1", l.index);
			if (!e || e.status !== "pass") return s.cross = "unavailable", s.reasons.push(`交叉檢查無法進行（噪音總表第 ${l.index + 1} 列的值或方法沒有通過核對）`), s;
			if (e.value !== c.value) return s.cross = "mismatch", s.reasons.push(`交叉檢查不一致（和噪音總表第 ${l.index + 1} 列的值不同）`), s;
			s.cross = "pass", u = e.method;
		}
		return s.status = "pass", s.value = c.value, s.method = u, s;
	}), a = i.filter((e) => e.status === "pass" && e.method !== null);
	if (new Set(a.map((e) => e.method)).size > 1) for (let e of a) e.status = "manual", e.value = null, e.method = null, e.reasons.push("噪音總表各列的檢測方法寫法不同，不能寫進同一張表");
	return i;
}
var yo = {
	sameDay: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一站（現場編號＋測站）同一天的報告（可能重複選檔）`,
	sameReport: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一個報告編號（同一份報告不該出現在兩個檔）`
};
function bo(e) {
	let t = e.map(() => /* @__PURE__ */ new Map());
	if (e.length < 2) return t;
	let n = [];
	e.forEach((e, t) => e.v.pages.forEach((e) => {
		let r = e.identity;
		if (!r) return;
		let i = r.start;
		n.push({
			f: t,
			page: e.page,
			day: `${r.siteKey}\u0000${r.locKey}\u0000${i.rocYear}.${i.month}.${i.day}`,
			report: r.reportNo === null ? null : N(r.reportNo).replace(/N$/, "")
		});
	}));
	let r = (e, n) => {
		t[e.f].has(e.page) || t[e.f].set(e.page, n);
	};
	for (let t = 0; t < n.length; t++) for (let i = t + 1; i < n.length; i++) {
		let a = n[t], o = n[i];
		a.f !== o.f && (a.day === o.day && (r(a, yo.sameDay(e[o.f].fileName, o.page)), r(o, yo.sameDay(e[a.f].fileName, a.page))), a.report !== null && a.report === o.report && (r(a, yo.sameReport(e[o.f].fileName, o.page)), r(o, yo.sameReport(e[a.f].fileName, a.page))));
	}
	return t;
}
//#endregion
//#region src/xdwread/readlog.ts
var xo = "edc-xdw-readlog", So = ["gw", "air"], Co = [
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
], wo = /sk-ant-/i, To = /^[0-9a-f]{64}$/, Eo = /^[A-Za-z0-9._:-]{1,100}$/, Do = /^[a-z_]{1,40}$/, Oo = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
function ko(e) {
	return typeof e == "string" ? wo.test(e) : Array.isArray(e) ? e.some(ko) : e && typeof e == "object" ? Object.entries(e).some(([e, t]) => wo.test(e) || ko(t)) : !1;
}
var Ao = (e) => !!e && typeof e == "object" && !Array.isArray(e), jo = (e, t = 0) => typeof e == "number" && Number.isInteger(e) && e >= t, Mo = (e) => typeof e == "number" && Number.isFinite(e), No = (e, t = 1e6) => typeof e == "string" && e.length <= t;
function Po(e, t, n) {
	let r = Object.keys(e), i = r.filter((e) => !t.includes(e)), a = t.filter((e) => !r.includes(e));
	if (i.length || a.length) throw Error(`${n}的欄位不對`);
}
function L(e, t) {
	if (!e) throw Error(t);
}
function Fo(e, t) {
	let n = `第 ${t + 1} 頁紀錄`;
	L(Ao(e), `${n}不是物件`), Po(e, [
		"page",
		"mode",
		"image",
		"reason"
	], n), L(jo(e.page, 1), `${n}的頁碼不對`), L(e.mode === "whole" || e.mode === "skip", `${n}的送出方式不對`), L(No(e.reason, 2e3), `${n}的原因不對`), L(e.mode === "skip" == e.reason.length > 0, `${n}：沒送的頁一定要有原因、送出的頁不可有原因`), e.image !== null && (L(Ao(e.image), `${n}的影像尺寸不對`), Po(e.image, ["w", "h"], `${n}的影像尺寸`), L(jo(e.image.w, 1) && jo(e.image.h, 1), `${n}的影像尺寸不對`)), L(e.mode === "skip" == (e.image === null), `${n}：沒送的頁不可有影像尺寸、送出的頁一定要有`);
}
function Io(e, t) {
	let n = `第 ${t + 1} 筆呼叫紀錄`;
	L(Ao(e), `${n}不是物件`), Po(e, [
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
	], n), L(jo(e.page, 1) && (e.scheme === "A" || e.scheme === "B") && jo(e.attempt, 1), `${n}的頁碼／讀法／次數不對`), L(No(e.requestedModel) && Eo.test(e.requestedModel), `${n}的模型名稱不對`), L(e.appliedModel === null || No(e.appliedModel) && Eo.test(e.appliedModel), `${n}的實際模型不對`), L(e.replyText === null || No(e.replyText, 2e5), `${n}的回覆不對`), L(e.stopReason === null || No(e.stopReason) && Do.test(e.stopReason), `${n}的停止原因不對`), e.usage !== null && (L(Ao(e.usage), `${n}的用量不對`), Po(e.usage, ["input", "output"], `${n}的用量`), L(jo(e.usage.input) && jo(e.usage.output), `${n}的用量不對`)), L(Mo(e.ms) && e.ms >= 0, `${n}的耗時不對`), e.error !== null && (L(Ao(e.error), `${n}的錯誤不對`), Po(e.error, [
		"kind",
		"status",
		"message"
	], `${n}的錯誤`), L(Co.includes(e.error.kind) && (e.error.status === null || jo(e.error.status, 100)) && No(e.error.message, 301), `${n}的錯誤型別不對`));
}
function Lo(e, t, n) {
	let r = `第 ${t + 1} 筆人工輸入紀錄`;
	L(Ao(e), `${r}不是物件`), Po(e, [
		"page",
		"index",
		"item",
		"raw",
		"preset",
		"source"
	], r), L(jo(e.page, 1) && jo(e.index, 0), `${r}的頁碼或列序號不對`);
	let i = n.find((t) => t.page === e.page);
	L(!!i && i.mode !== "skip", `${r}的頁不存在或沒送`), L(No(e.item, 100) && (ai.A[e.index] === e.item || ai.B[e.index] === e.item), `${r}的項目名稱不是版型在這個位置的預期名稱`), L(Ao(e.raw), `${r}的內容不對`), Po(e.raw, fa, `${r}的內容`);
	for (let t of fa) L(No(e.raw[t], 200), `${r}的內容不對`);
	L(e.preset === null || e.preset === "unmeasurable", `${r}的套用方式不對`), e.preset === "unmeasurable" && L(e.raw.result === "", `${r}：套用上一季寫法時檢測結果要空白`), L(e.source === "manual", `${r}的來源標記不對`);
}
var Ro = [
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
];
function zo(e) {
	Vo(e, Ao(e) && e.version === 4 ? 4 : Ao(e) && e.version === 5 ? 5 : 3);
}
var Bo = (e) => e.version === 5 && e.form === "noise" ? "noise" : e.version === 4 && e.form === "air" ? "air" : "gw";
function Vo(e, t) {
	L(Ao(e), "讀值紀錄不是 JSON 物件"), L(e.kind === xo, "這不是讀值紀錄檔"), L(e.version === t, "讀值紀錄版本不符（這一版只讀第 2、3、4、5 版）"), Po(e, t === 4 || t === 5 ? [
		...Ro,
		"manual",
		"form"
	] : t === 3 ? [...Ro, "manual"] : Ro, "讀值紀錄"), t === 4 && L(So.includes(e.form), "讀值紀錄的版型不對"), t === 5 && L(e.form === "noise", "讀值紀錄的版型不對"), L(No(e.fileName, 500) && e.fileName.length > 0, "讀值紀錄的檔名不對"), L(No(e.xdwSha256) && To.test(e.xdwSha256), "讀值紀錄的 SHA-256 格式不對"), L(No(e.createdAt) && Oo.test(e.createdAt), "讀值紀錄的時間格式不對"), L(Ao(e.period), "讀值紀錄的期別不對"), Po(e.period, ["rocYear", "quarter"], "讀值紀錄的期別"), L(jo(e.period.rocYear, 1) && jo(e.period.quarter, 1) && e.period.quarter <= 4, "讀值紀錄的期別不對"), L(No(e.category, 200), "讀值紀錄的類別不對"), L(Ao(e.agency), "讀值紀錄的機構不對"), Po(e.agency, ["code", "name"], "讀值紀錄的機構"), L(No(e.agency.code, 50) && No(e.agency.name, 200), "讀值紀錄的機構不對"), L(Array.isArray(e.pages) && Array.isArray(e.calls), "讀值紀錄的頁或呼叫不是陣列"), e.pages.forEach(Fo), e.calls.forEach(Io);
	let n = e.pages.map((e) => e.page);
	L(new Set(n).size === n.length, "讀值紀錄有重複的頁碼");
	for (let t of e.calls) {
		let n = e.pages.find((e) => e.page === t.page);
		L(!!n && n.mode !== "skip", "讀值紀錄有沒送的頁卻有呼叫紀錄");
	}
	if (t === 4 && e.form === "air" && L(Array.isArray(e.manual) && e.manual.length === 0, "空品的讀值紀錄不可有人工輸入"), t === 5 && L(Array.isArray(e.manual) && e.manual.length === 0, "噪音振動的讀值紀錄不可有人工輸入"), t === 3 || t === 4 && e.form === "gw") {
		L(Array.isArray(e.manual), "讀值紀錄的人工輸入不是陣列"), e.manual.forEach((t, n) => Lo(t, n, e.pages));
		let t = e.manual.map((e) => `${e.page}:${e.index}`);
		L(new Set(t).size === t.length, "讀值紀錄有重複的人工輸入列");
	}
	L(!ko(e), "讀值紀錄裡有疑似金鑰的字串，拒絕");
}
function Ho(e) {
	return zo(e), JSON.stringify(e, null, 2);
}
function Uo(e) {
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
		if (Ao(t) && t.kind === "edc-xdw-readlog" && t.version === 2) {
			Vo(t, 2);
			let e = {
				...t,
				version: 3,
				manual: []
			};
			return zo(e), {
				ok: !0,
				log: e
			};
		}
		zo(t);
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
function Wo(e, t) {
	return To.test(t) ? e.xdwSha256 === t ? null : "這份讀值紀錄不是這個 XDW 檔的（SHA-256 不同），拒絕載入" : "目前檔案的 SHA-256 格式不對";
}
function Go(e, t, n) {
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
	} : {
		ok: !0,
		text: r.replyText
	} : null;
}
function Ko(e, t, n) {
	let r = Go(e, t, n);
	return r === null ? null : r.ok ? Un(r.text) : r;
}
function qo(e, t, n) {
	let r = Go(e, t, n);
	return r === null ? null : r.ok ? sr(r.text) : r;
}
function Jo(e, t, n) {
	let r = Go(e, t, n);
	return r === null ? null : r.ok ? Tr(r.text) : r;
}
function Yo(e, t, n, r) {
	let i = e === "air" ? qo(t, n, r) : e === "noise" ? Jo(t, n, r) : Ko(t, n, r);
	return !!i && i.ok;
}
function Xo(e) {
	return {
		period: { ...e.period },
		pages: e.pages.map((t) => ({
			page: t.page,
			mode: t.mode,
			a: t.mode === "skip" ? null : Ko(e.calls, t.page, "A"),
			b: t.mode === "skip" ? null : Ko(e.calls, t.page, "B")
		}))
	};
}
var Zo = (e) => Pi(Xo(e));
function Qo(e) {
	return {
		period: { ...e.period },
		pages: e.pages.map((t) => ({
			page: t.page,
			mode: t.mode,
			a: t.mode === "skip" ? null : qo(e.calls, t.page, "A"),
			b: t.mode === "skip" ? null : qo(e.calls, t.page, "B")
		}))
	};
}
var $o = (e, t) => sa(Qo(e), t);
function es(e) {
	return {
		period: { ...e.period },
		pages: e.pages.map((t) => ({
			page: t.page,
			mode: t.mode,
			a: t.mode === "skip" ? null : Jo(e.calls, t.page, "A"),
			b: t.mode === "skip" ? null : Jo(e.calls, t.page, "B")
		}))
	};
}
var ts = (e, t) => _o(es(e), t);
function ns(e) {
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
function rs(e) {
	let t = {
		kind: xo,
		version: 3,
		fileName: e.fileName,
		xdwSha256: e.xdwSha256,
		createdAt: e.createdAt,
		period: { ...e.period },
		category: e.category,
		agency: { ...e.agency },
		pages: e.pages,
		calls: [],
		manual: []
	};
	return e.form === "air" ? {
		...t,
		version: 4,
		form: "air"
	} : e.form === "noise" ? {
		...t,
		version: 5,
		form: "noise"
	} : t;
}
var is = "edc-xdw-readlog-bundle", as = (e) => e.normalize("NFKC").toLowerCase();
function os(e) {
	L(Ao(e), "讀值紀錄包不是 JSON 物件"), L(e.kind === is, "這不是讀值紀錄包"), L(e.version === 1, "讀值紀錄包版本不符（這一版只讀第 1 版）"), Po(e, [
		"kind",
		"version",
		"createdAt",
		"logs"
	], "讀值紀錄包"), L(No(e.createdAt) && Oo.test(e.createdAt), "讀值紀錄包的時間格式不對"), L(Array.isArray(e.logs) && e.logs.length >= 2 && e.logs.length <= 10, "讀值紀錄包的檔數不對（要 2～10 份）"), e.logs.forEach((e, t) => {
		try {
			zo(e);
		} catch (e) {
			throw Error(`讀值紀錄包第 ${t + 1} 份：${e.message}`);
		}
	});
	let t = e.logs;
	L(new Set(t.map((e) => e.xdwSha256)).size === t.length, "讀值紀錄包裡有兩份是同一個 XDW（SHA-256 相同）"), L(new Set(t.map((e) => as(e.fileName))).size === t.length, "讀值紀錄包裡有兩份檔名相同");
	let n = t[0];
	L(t.every((e) => e.category === n.category && e.agency.code === n.agency.code && e.agency.name === n.agency.name && e.period.rocYear === n.period.rocYear && e.period.quarter === n.period.quarter), "讀值紀錄包裡各檔的類別、機構或期別不一致"), t.every((e) => Bo(e) === Bo(n)) || (L(t.some((e) => Bo(e) === "noise"), "讀值紀錄包裡同時有空品與地下水的紀錄"), L(!1, "讀值紀錄包裡混有不同版型（噪音振動與水質或空品）的紀錄")), L(!ko(e), "讀值紀錄包裡有疑似金鑰的字串，拒絕");
}
function ss(e, t) {
	return {
		kind: is,
		version: 1,
		createdAt: t,
		logs: [...e]
	};
}
function cs(e) {
	return os(e), JSON.stringify(e, null, 2);
}
function ls(e) {
	let t;
	try {
		t = JSON.parse(e);
	} catch {
		return {
			ok: !1,
			reason: "讀值紀錄不是 JSON"
		};
	}
	if (Ao(t) && t.kind === "edc-xdw-readlog-bundle") {
		try {
			os(t);
		} catch (e) {
			return {
				ok: !1,
				reason: e.message
			};
		}
		return {
			ok: !0,
			logs: t.logs,
			bundle: !0
		};
	}
	let n = Uo(e);
	return n.ok ? {
		ok: !0,
		logs: [n.log],
		bundle: !1
	} : n;
}
function us(e, t) {
	if (!t.length || t.some((e) => !To.test(e))) return {
		ok: !1,
		reason: "目前檔案的 SHA-256 格式不對"
	};
	if (e.length !== t.length) return {
		ok: !1,
		reason: t.length === 1 && e.length === 1 ? "這份讀值紀錄不是這個 XDW 檔的（SHA-256 不同），拒絕載入" : `讀值紀錄有 ${e.length} 個檔、這次選了 ${t.length} 個檔，對不上，拒絕載入`
	};
	if (t.length === 1) {
		let n = Wo(e[0], t[0]);
		return n ? {
			ok: !1,
			reason: n
		} : {
			ok: !0,
			logs: [e[0]]
		};
	}
	let n = [];
	for (let r of t) {
		let t = e.filter((e) => e.xdwSha256 === r);
		if (t.length !== 1) return {
			ok: !1,
			reason: "讀值紀錄包裡的檔和這次選的檔對不上（SHA-256 不同），拒絕載入"
		};
		n.push(t[0]);
	}
	return {
		ok: !0,
		logs: n
	};
}
function ds(e) {
	return Li(e.map((e) => ({
		fileName: e.fileName,
		v: Zo(e)
	})));
}
function fs(e) {
	if (e.some((e) => Bo(e) !== "air")) throw Error("不是空品的讀值紀錄（內部檢查）");
	let t = e.map((e) => $o(e)), n = da(e.map((e, n) => ({
		fileName: e.fileName,
		v: t[n]
	})));
	return e.map((e, r) => n[r].size ? $o(e, n[r]) : t[r]);
}
function ps(e) {
	if (e.some((e) => Bo(e) !== "noise")) throw Error("不是噪音振動的讀值紀錄（內部檢查）");
	let t = e.map((e) => ts(e)), n = bo(e.map((e, n) => ({
		fileName: e.fileName,
		v: t[n]
	})));
	return e.map((e, r) => n[r].size ? ts(e, n[r]) : t[r]);
}
//#endregion
//#region src/xdwread/reader.ts
var ms = qt[0], hs = qt[1], gs = 12e4, _s = 5e3, vs = "（回覆含疑似金鑰的字串，原文不保存）", ys = {
	noKey: "沒有 Claude 金鑰（尚未設定，或讀值途中被移除），已停止讀值。",
	rateLimited: "Claude 一直回覆「太頻繁或已達每月上限」，同一頁重試 3 次仍不行，已停止讀值。請過一段時間再重新選檔讀值。",
	auth: (e) => `${e}，已停止讀值。`,
	cancelled: "已中止讀值。",
	imageFail: (e) => `送出圖做不出來：${e}`
}, bs = (e) => ({
	...Cn(),
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
	readKey: () => fn(),
	...e
}), xs = class extends Error {
	text;
	why;
	constructor(e, t) {
		super(e), this.text = e, this.why = t;
	}
};
async function Ss(e, t, n) {
	if (!e.image || !e.box) throw Error("沒有送出圖");
	let r = await n.decode(e.image);
	if (r.width !== e.box.w || r.height !== e.box.h) throw Error(`送出圖尺寸 ${r.width}×${r.height} 與預覽 ${e.box.w}×${e.box.h} 不同`);
	let i = Ft(r.width, r.height);
	if (!i.ok) throw Error(i.reason);
	let a = t === "A" ? i.A : i.B, o = [];
	for (let e of a) o.push({ base64: await n.encode(It(r, e)) });
	return o;
}
async function Cs(e, t) {
	let n = e.form === "air" ? "air" : e.form === "noise" ? "noise" : "gw", r = n === "air" ? Gn : n === "noise" ? lr : jn, i = n === "air" ? sr : n === "noise" ? Tr : Un, a = e.pages.filter((e) => e.mode !== "skip");
	for (let e of a) if (!(e.image instanceof Blob) || !e.box) throw Error(`第 ${e.page} 頁要送出卻沒有送出圖`);
	let o = e.pages.map((e) => ({
		page: e.page,
		mode: e.mode,
		image: e.mode === "skip" || !e.box ? null : {
			w: e.box.w,
			h: e.box.h
		},
		reason: e.reason
	})), s = rs({
		fileName: e.fileName,
		xdwSha256: e.xdwSha256,
		createdAt: t.isoNow?.() ?? new Date(t.now()).toISOString(),
		period: e.period,
		category: e.category,
		agency: e.agency,
		pages: o,
		form: n
	}), c = [], l = new AbortController(), u = () => {
		d ||= new xs(ys.cancelled, "cancelled"), l.abort();
	}, d = null;
	e.signal?.aborted && u(), e.signal?.addEventListener("abort", u, { once: !0 });
	let f = (e) => {
		d ||= e, l.abort();
	}, p = "A", m = 0, h = 0, g = 0, _ = 0, v = 0, y = null, b = (n) => {
		n !== void 0 && (y = n);
		let r = t.now();
		try {
			e.onProgress?.({
				scheme: p,
				done: m,
				total: h,
				calls: g,
				inFlight: _,
				pausedUntil: v > r ? v : null,
				remainingMs: Math.max(0, v - r),
				usage: ns(s.calls),
				note: y
			});
		} catch {}
	}, x = async (e, n) => {
		let a = n === "A" ? ms : hs, o;
		try {
			o = await Ss(e, n, t);
		} catch (t) {
			c.push({
				page: e.page,
				scheme: n,
				text: ys.imageFail(t?.message || "未知錯誤")
			});
			return;
		}
		let u = 0, d = 0, p = !1, m = null, h = !1, x = 0;
		for (;;) {
			for (; !l.signal.aborted && v > t.now();) await t.sleep(v - t.now(), l.signal);
			if (l.signal.aborted) return;
			let c = t.readKey();
			if (!c) {
				f(new xs(ys.noKey, "stopped"));
				return;
			}
			u++, g++, _++, b();
			let S = t.now(), C;
			try {
				C = await Dn(c, a, o, r(o.length, m), {
					signal: l.signal,
					timeoutMs: t.timeoutMs ?? 12e4
				}, t);
			} catch (e) {
				C = {
					kind: "network",
					message: $t(e?.message, c)
				};
			} finally {
				_--;
			}
			let w = Math.max(0, t.now() - S), T = {
				page: e.page,
				scheme: n,
				attempt: u,
				requestedModel: a,
				appliedModel: null,
				replyText: null,
				stopReason: null,
				usage: null,
				ms: w,
				error: null
			}, E = (e, t, n = null) => {
				T.error = {
					kind: e,
					status: n,
					message: $t(t, c)
				};
			}, ee = "end", te = 0;
			if (C.kind === "ok") if (T.appliedModel = C.appliedModel, T.stopReason = C.stopReason, T.usage = { ...C.usage }, wo.test(C.text)) T.replyText = vs, E("secret_like", "回覆含疑似金鑰的字串，這次回覆作廢");
			else if (T.replyText = C.text, C.stopReason === "refusal") E("refused", "模型拒絕回答");
			else if (C.stopReason === "max_tokens") E("truncated", "回覆被截斷"), h || (h = !0, m = "json", ee = "retry");
			else {
				let e = i(C.text);
				if (!e.ok) if (e.kind === "empty") E("empty", "回覆是空的");
				else {
					let t = In(e.kind);
					t && !h && (h = !0, m = t, ee = "retry");
				}
			}
			else if (C.kind === "http") {
				let e = C.status;
				if (e === 429) {
					if (E("rate_limited", C.message, e), d >= 3) {
						s.calls.push(T), b(), f(new xs(ys.rateLimited, "stopped"));
						return;
					}
					d++;
					let n = Math.min(C.retryAfterMs ?? 6e4, gs);
					v = Math.max(v, t.now() + n), ee = "retry", y = `Claude 回覆太頻繁，暫停約 ${Math.ceil(n / 1e3)} 秒後自動續跑`;
				} else if (e === 401 || e === 403 || e === 404) {
					E("auth", C.message, e), s.calls.push(T), b(), f(new xs(ys.auth(C.message), "stopped"));
					return;
				} else e >= 500 ? (E("upstream_error", C.message, e), p || (p = !0, ee = "retry", te = _s)) : E("bad_request", C.message, e);
			} else C.kind === "network" ? (E("network", C.message), p || (p = !0, ee = "retry", te = _s)) : C.kind === "timeout" ? (E("timeout", C.message), x++, x <= 2 && (ee = "retry", y = `第 ${e.page} 頁 ${n} 讀法逾時，自動重送（第 ${x} 次）`)) : C.kind === "cancelled" ? E("cancelled", C.message) : E("format", C.message);
			if (s.calls.push(T), b(), C.kind === "cancelled" || l.signal.aborted || ee === "end" || te > 0 && (await t.sleep(te, l.signal), l.signal.aborted)) return;
		}
	}, S = async (e, t) => {
		p = e, m = 0, h = t.length, y = null, b();
		let n = 0;
		await Promise.all(Array.from({ length: Math.min(2, t.length) }, async () => {
			for (; !l.signal.aborted && n < t.length;) {
				let r = t[n++];
				await x(r, e), m++, b();
			}
		}));
	};
	try {
		!l.signal.aborted && !t.readKey() && f(new xs(ys.noKey, "stopped")), l.signal.aborted || await S("A", a), l.signal.aborted || await S("B", a.filter((e) => Yo(n, s.calls, e.page, "A")));
	} finally {
		e.signal?.removeEventListener("abort", u);
	}
	let C = d;
	Ho(s);
	let w = {
		status: C ? C.why : "done",
		stopText: C ? C.text : null,
		log: s,
		notes: c,
		verify: n === "gw" ? Zo(s) : null,
		airVerify: n === "air" ? $o(s) : null,
		noiseVerify: n === "noise" ? ts(s) : null
	};
	return b(C ? C.text : void 0), w;
}
//#endregion
//#region src/xdwread/sheet.ts
var ws = {
	site: "採樣地點：",
	time: "採樣時間：",
	category: "樣品特性：",
	agency: "採樣單位：",
	reportNo: "報告編號："
}, Ts = [
	"檢驗項目",
	"檢測值",
	"偵測極限",
	"單位",
	"檢測方法"
], Es = "以下空白", Ds = "無法量測", Os = "套用上一季寫法（無法量測）：原網站讀不到備註欄，要手動新增這一列", ks = (e) => `p${String(e).padStart(2, "0")}`;
function As(e) {
	let t = ui[P(e)];
	return t === void 0 ? e : t;
}
function js(e, t) {
	let n = P(e), r = P(t), i = di.find((e) => e.item === n && e.from === r);
	return i ? i.to : t;
}
var Ms = (e) => typeof e == "string";
function Ns(e, t, n) {
	let r = `第 ${e} 頁第 ${t + 1} 列`;
	if (!n || ![
		n.item,
		n.unit,
		n.result,
		n.mdl,
		n.method
	].every(Ms)) throw Error(`${r}：寫入內容不完整（內部檢查）`);
	if (!gi.test(n.result)) throw Error(`${r}：檢測結果的寫法不在允許清單內（內部檢查）`);
	if (n.mdl !== "" && !_i.test(n.mdl)) throw Error(`${r}：MDL 的寫法不在允許清單內（內部檢查）`);
	if (n.item.trim() === "") throw Error(`${r}：項目名稱空白（內部檢查）`);
}
function Ps(e, t) {
	let n = [], r = [], i = [], a = [], o = /* @__PURE__ */ new Set(), s = [], c = Array.isArray(t.manual) ? t.manual : [], l = /* @__PURE__ */ new Map();
	for (let e of c) {
		let t = e && typeof e == "object" ? `${e.page}:${e.index}` : "";
		if (!t || l.has(t)) throw Error("人工輸入有重複或不完整的列（內部檢查）");
		l.set(t, e);
	}
	let u = /* @__PURE__ */ new Set();
	for (let c of e.pages) {
		let e = Xs(c, t).sampleName;
		if (c.status === "skip") {
			a.push({
				page: c.page,
				index: null,
				sampleName: e,
				item: "",
				reason: c.reasons[0] ?? "這頁沒有送出"
			});
			continue;
		}
		let d = c.status === "ok" && c.mode === "whole" && c.identity !== null, f = [];
		!d && c.rows.length === 0 && a.push({
			page: c.page,
			index: null,
			sampleName: e,
			item: "",
			reason: c.reasons[0] ?? "整頁需人工輸入"
		});
		for (let t of c.rows) {
			let n = `${c.page}:${t.index}`, o = l.get(n);
			if (o) {
				u.add(n);
				let l = Sa(c, t, o);
				if (!l.ok) throw Error(`第 ${c.page} 頁第 ${t.index + 1} 列：人工輸入不合格（${l.reasons.join("；")}）（內部檢查）`);
				let d = l.cells;
				if (d.preset === "unmeasurable") {
					a.push({
						page: c.page,
						index: t.index,
						sampleName: e,
						item: t.expected,
						reason: Os,
						unmeasurable: {
							unit: d.unit,
							method: d.method
						}
					}), s.push({
						page: c.page,
						index: t.index,
						sampleName: e,
						item: d.item,
						cells: { ...d },
						inXlsx: !1
					});
					continue;
				}
				let p = {
					item: d.item,
					unit: d.unit,
					result: d.result,
					mdl: d.mdl,
					method: d.method
				};
				Ns(c.page, t.index, p);
				let m = As(p.item), h = js(p.item, p.unit);
				m !== p.item && r.push({
					page: c.page,
					index: t.index,
					from: p.item,
					to: m
				}), h !== p.unit && i.push({
					page: c.page,
					index: t.index,
					from: p.unit,
					to: h
				}), f.push({
					page: c.page,
					index: t.index,
					out: p,
					source: "manual",
					cells: {
						item: m,
						result: p.result,
						mdl: p.mdl,
						unit: h,
						method: p.method
					}
				}), s.push({
					page: c.page,
					index: t.index,
					sampleName: e,
					item: d.item,
					cells: { ...d },
					inXlsx: !0
				});
				continue;
			}
			if (!d || t.status !== "pass" || !t.out) {
				a.push({
					page: c.page,
					index: t.index,
					sampleName: e,
					item: t.expected,
					reason: t.reasons[0] ?? (d ? "需人工輸入" : c.reasons[0] ?? "整頁需人工輸入")
				});
				continue;
			}
			Ns(c.page, t.index, t.out);
			let p = As(t.out.item), m = js(t.out.item, t.out.unit);
			p !== t.out.item && r.push({
				page: c.page,
				index: t.index,
				from: t.out.item,
				to: p
			}), m !== t.out.unit && i.push({
				page: c.page,
				index: t.index,
				from: t.out.unit,
				to: m
			}), f.push({
				page: c.page,
				index: t.index,
				out: { ...t.out },
				source: "read",
				cells: {
					item: p,
					result: t.out.result,
					mdl: t.out.mdl,
					unit: m,
					method: t.out.method
				}
			});
		}
		if (!d || f.length === 0) continue;
		let p = c.identity, m = ks(c.page);
		if (o.has(m)) throw Error(`第 ${c.page} 頁重複（內部檢查）`);
		o.add(m);
		let h = [
			[ws.site, p.sampleName],
			[ws.time, p.sampleTime],
			[ws.category, t.category],
			[ws.agency, t.agency.name],
			[ws.reportNo, p.reportNo],
			[],
			[...Ts],
			...f.map((e) => [
				e.cells.item,
				e.cells.result,
				e.cells.mdl,
				e.cells.unit,
				e.cells.method
			]),
			[Es]
		];
		n.push({
			name: m,
			page: c.page,
			identity: {
				...p,
				date: { ...p.date }
			},
			rows: f,
			aoa: h
		});
	}
	if (u.size !== l.size) throw Error("人工輸入有對不到可輸入列的紀錄（內部檢查）");
	let d = n.flatMap((e) => e.rows), f = d.filter((e) => e.source === "manual").length;
	return {
		xdwFileName: t.fileName,
		category: t.category,
		agency: { ...t.agency },
		period: { ...t.period },
		sheets: n,
		total: d.length,
		itemRenames: r,
		unitRenames: i,
		excluded: a,
		readCount: d.length - f,
		manualIn: f,
		manual: s
	};
}
function Fs(e, t) {
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
var Is = (e) => String(e).padStart(2, "0");
function Ls(e, t) {
	return `${e.replace(/\.xdw$/i, "") || "XDW"}（Claude讀值 ${`${t.getFullYear()}${Is(t.getMonth() + 1)}${Is(t.getDate())}-${Is(t.getHours())}${Is(t.getMinutes())}${Is(t.getSeconds())}`}）.xlsx`;
}
//#endregion
//#region src/xdwread/manualview.ts
var R = {
	head: (e) => `人工輸入（不是 Claude 讀的；項目固定：${e}）`,
	fields: {
		result: "檢測結果",
		mdl: "MDL",
		unit: "單位",
		method: "方法"
	},
	item: "項目",
	mdlFixed: "（這頁沒有 MDL 欄，固定空白）",
	preset: "套用上一季寫法",
	unpreset: "取消套用",
	presetShown: `數值空白（${Ds}）`,
	presetNote: `套用後這一列不會放進 xlsx（原網站讀不到備註欄）；送出後確認畫面會寫出要在原網站表格手動新增的內容（數值空白、單位、方法、備註「${Ds}」）。`,
	check: (e) => `我已對照原頁確認這一列（項目：${e}）`,
	cannotCheck: "還不能勾選：",
	checked: "已確認：這一列會用你填的內容（狀態「人工輸入」）",
	locked: "送件中，暫時不能改",
	statusIn: "人工輸入",
	reasonIn: (e, t) => t ? `你確認的：${R.presetShown}／單位 ${e.unit.trim() || "（空白）"}／方法 ${e.method.trim() || "（空白）"}` : `你填的：結果 ${e.result.trim() || "（空白）"}／MDL ${e.mdl.trim() || "（空白）"}／單位 ${e.unit.trim() || "（空白）"}／方法 ${e.method.trim() || "（空白）"}`
}, Rs = (e, t) => `${e}:${t}`;
function zs(e, t, n = []) {
	let r = /* @__PURE__ */ new Map(), i = [], a = !1;
	t.manual = [];
	let o = new Map(n.map((e) => [Rs(e.page, e.index), e])), s = (t, n) => e.pages.includes(t) && t.rows[n.index] === n && ga(t, n);
	function c(e, t) {
		let n = Rs(e.page, t.index), i = r.get(n);
		if (!i) {
			let a = xa(e, t);
			i = {
				raw: { ...a.raw },
				preset: null,
				checked: !1,
				agreed: a.agreed,
				why: a.why
			};
			let s = o.get(n);
			if (s && s.raw && typeof s.raw == "object") {
				for (let e of fa) typeof s.raw[e] == "string" && (i.raw[e] = s.raw[e], i.agreed[e] = !1);
				i.preset = s.preset === "unmeasurable" && _a(t) ? "unmeasurable" : null;
			}
			r.set(n, i);
		}
		return i;
	}
	let l = (e, t) => {
		for (let n of i) try {
			n(e, t);
		} catch {}
	}, u = (e, n) => {
		t.manual = t.manual.filter((t) => !(t.page === e && t.index === n));
	}, d = (e, t, n) => {
		n.checked = !1, u(e.page, t.index);
	};
	function f(e, t) {
		if (!s(e, t)) return [F.notEditable];
		let n = c(e, t), r = e.tableType, i = [];
		for (let e of fa) {
			let t = ya(e, n.raw[e], r, n.preset);
			t && !i.includes(t) && i.push(t);
		}
		return i;
	}
	return {
		editable: s,
		state: c,
		setField(e, t, n, r) {
			if (a || !s(e, t)) return;
			let i = c(e, t);
			i.preset && (n === "result" || n === "mdl") || i.raw[n] !== r && (i.raw[n] = r, i.agreed[n] = !1, d(e, t, i), l(e.page, t.index));
		},
		setPreset(e, t, n) {
			if (a || !s(e, t) || !_a(t)) return;
			let r = c(e, t), i = n ? "unmeasurable" : null;
			r.preset !== i && (r.preset = i, n && (r.raw.result = "", r.raw.mdl = "", r.agreed.result = !1, r.agreed.mdl = !1), d(e, t, r), l(e.page, t.index));
		},
		setChecked(e, n, r) {
			if (a) return [R.locked];
			if (!s(e, n)) return [F.notEditable];
			let i = c(e, n);
			if (!r) return d(e, n, i), l(e.page, n.index), [];
			let o = Ca(e, n, i.raw, i.preset), f = Sa(e, n, o);
			return f.ok ? (u(e.page, n.index), t.manual.push(o), t.manual.sort((e, t) => e.page - t.page || e.index - t.index), i.checked = !0, l(e.page, n.index), []) : (d(e, n, i), l(e.page, n.index), f.reasons);
		},
		problems: f,
		confirmed: () => t.manual.length,
		isConfirmed: (e, n) => t.manual.some((t) => t.page === e && t.index === n),
		locked: () => a,
		setLocked(e) {
			a = e;
			for (let e of r.keys()) {
				let [t, n] = e.split(":").map(Number);
				l(t, n);
			}
		},
		onChange(e) {
			i.push(e);
		}
	};
}
function Bs(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
function Vs(e, t, n, r) {
	if (!t.editable(n, r)) return null;
	let i = n.tableType, a = r.expected, o = Bs(e, "div", "edc-man");
	o.dataset.page = String(n.page), o.dataset.row = String(r.index + 1), o.append(Bs(e, "div", "edc-man-head", R.head(a)));
	let s = Bs(e, "div", "edc-man-item", `${R.item}：${a}`);
	s.dataset.field = "item", o.append(s);
	let c = {}, l = {}, u = Bs(e, "div", "edc-man-grid");
	for (let i of fa) {
		let a = Bs(e, "label", "edc-man-field");
		a.dataset.field = i;
		let o = Bs(e, "input", "edc-man-input");
		o.type = "text", o.autocomplete = "off", o.spellcheck = !1, o.dataset.field = i, o.maxLength = 200, o.addEventListener("input", () => {
			try {
				t.setField(n, r, i, o.value);
			} catch {}
		}), o.addEventListener("click", (e) => e.stopPropagation());
		let s = Bs(e, "span", "edc-man-why");
		c[i] = o, l[i] = s, a.append(Bs(e, "span", "edc-man-label", R.fields[i]), o, s), u.append(a);
	}
	o.append(u);
	let d = null;
	_a(r) && (d = Bs(e, "button", "edc-xdw-btn edc-man-preset"), d.type = "button", d.addEventListener("click", (e) => {
		e.stopPropagation();
		try {
			t.setPreset(n, r, !t.state(n, r).preset);
		} catch {}
	}), o.append(d, Bs(e, "div", "edc-man-preset-note", R.presetNote)));
	let f = Bs(e, "label", "edc-man-checkline"), p = Bs(e, "input", "edc-man-check");
	p.type = "checkbox", p.addEventListener("click", (e) => e.stopPropagation()), p.addEventListener("change", () => {
		try {
			let e = t.setChecked(n, r, p.checked);
			e.length && (p.checked = !1, m.textContent = R.cannotCheck + e.join("；"));
		} catch {
			p.checked = !1;
		}
	}), f.append(p, Bs(e, "span", void 0, R.check(a)));
	let m = Bs(e, "div", "edc-man-msg");
	o.append(f, m), o.addEventListener("click", (e) => e.stopPropagation());
	let h = () => {
		let e = t.state(n, r), a = t.locked();
		for (let t of fa) {
			let n = c[t], r = t === "mdl" && i === "A", o = !!e.preset && (t === "result" || t === "mdl"), s = o && t === "result" ? R.presetShown : e.raw[t];
			n.value !== s && (n.value = s), n.readOnly = r || o || a, n.disabled = r || a, n.classList.toggle("edc-man-preset-on", o);
			let u = r || o ? null : ya(t, e.raw[t], i, e.preset), d = !o && !e.agreed[t] && e.raw[t] === "" && e.why[t] && e.why[t] !== F.agreed ? `（${e.why[t]}）` : "";
			l[t].textContent = r ? R.mdlFixed : [d, u ? `⚠ ${u}` : e.agreed[t] ? F.agreed : ""].filter(Boolean).join(" "), l[t].className = `edc-man-why${u ? " edc-man-bad" : ""}`, n.setAttribute("aria-invalid", String(!!u));
		}
		d && (d.textContent = e.preset ? R.unpreset : R.preset, d.disabled = a, d.setAttribute("aria-pressed", String(!!e.preset)));
		let s = t.problems(n, r);
		p.checked = t.isConfirmed(n.page, r.index), p.disabled = a || !p.checked && s.length > 0, m.textContent = a ? R.locked : p.checked ? R.checked : s.length ? R.cannotCheck + s.join("；") : "", m.className = `edc-man-msg${!p.checked && s.length ? " edc-man-bad" : ""}${p.checked ? " edc-man-ok" : ""}`, o.dataset.checked = String(p.checked);
	};
	return t.onChange((e, t) => {
		e === n.page && t === r.index && h();
	}), h(), o;
}
//#endregion
//#region src/xdwread/results.ts
var z = {
	counts: (e, t, n, r = 0, i = 0) => `通過 ${e}／${i > 0 ? `人工輸入 ${i}／` : ""}需人工 ${t}／${r > 0 ? `整頁沒有讀成功 ${r} 頁／` : ""}沒送 ${n} 頁`,
	pageByHand: "這頁不能在這個視窗輸入，要匯入後到原網站表格手動補。",
	allPass: (e, t) => `第 ${e.join("、")} 頁 整頁送出 頁層級檢查通過，共 ${t} 列全部通過`,
	warnPass: (e) => `這頁 ${e} 列全部通過`,
	hiddenPass: (e) => `其他 ${e} 列通過（按「顯示全部」可看）`,
	noAttn: "沒有需要注意的頁。",
	showAll: (e) => `顯示全部 ${e} 列（含通過）`,
	hideAll: "收起，只看需要注意的",
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
	batch: (e, t) => `全部 ${e} 個檔：${t}`,
	fileTitle: (e, t) => `檔 ${e}：${t}`,
	tokens: (e) => `token：A 輸入 ${e.A.input}／輸出 ${e.A.output}；B 輸入 ${e.B.input}／輸出 ${e.B.output}`
}, Hs = (e) => e.pages.filter((e) => e.status === "manual" && e.rows.length === 0).length, Us = (e, t = 0) => z.counts(e.totals.pass, e.totals.manual - t, e.totals.pagesSkipped, Hs(e), t);
function Ws(e) {
	let t = [], n = 0, r = 0, i = [];
	for (let a of [...e.pages].sort((e, t) => e.page - t.page)) {
		if (r += a.rows.length, a.status === "skip") {
			i.push({
				page: a,
				kind: "skip",
				rows: [],
				hiddenPass: 0
			});
			continue;
		}
		if (a.status === "manual") {
			i.push({
				page: a,
				kind: "manual",
				rows: [...a.rows],
				hiddenPass: 0
			});
			continue;
		}
		let e = a.rows.filter((e) => e.status !== "pass"), o = a.rows.length - e.length;
		e.length ? i.push({
			page: a,
			kind: "mixed",
			rows: e,
			hiddenPass: o
		}) : a.warnings.length ? i.push({
			page: a,
			kind: "warn-pass",
			rows: [],
			hiddenPass: o
		}) : (t.push(a.page), n += o);
	}
	return {
		allPass: t,
		allPassRows: n,
		pages: i,
		total: r
	};
}
var Gs = (e) => String(e).padStart(2, "0");
function Ks(e, t) {
	return `${e.replace(/\.xdw$/i, "") || "XDW"}（讀值紀錄 ${`${t.getFullYear()}${Gs(t.getMonth() + 1)}${Gs(t.getDate())}-${Gs(t.getHours())}${Gs(t.getMinutes())}${Gs(t.getSeconds())}`}）.json`;
}
function qs(e, t) {
	return `XDW讀值紀錄包（${e} 個檔 ${`${t.getFullYear()}${Gs(t.getMonth() + 1)}${Gs(t.getDate())}-${Gs(t.getHours())}${Gs(t.getMinutes())}${Gs(t.getSeconds())}`}）.json`;
}
function B(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var Js = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤", Ys = (e) => e == null || e === "" ? z.empty : e;
function Xs(e, t) {
	if (e.status === "ok" && e.identity) return {
		sampleName: e.identity.sampleName,
		reportNo: e.identity.reportNo,
		sampleTime: e.identity.sampleTime
	};
	let n = e.mode === "skip" ? null : Ko(t.calls, e.page, "A"), r = (e) => {
		if (!n || !n.ok) return z.notRead;
		let t = n.reply[e].value;
		return t === null || t.trim() === "" ? z.notRead : `${t}${z.unconfirmed}`;
	};
	return {
		sampleName: r("sample_name"),
		reportNo: r("report_no"),
		sampleTime: r("sample_time")
	};
}
function Zs(e) {
	let t = 0, n = 0, r = 0, i = 0, a = 0;
	for (let o of e) t += o.v.totals.pass, n += o.v.totals.manual - o.manualIn, r += o.v.totals.pagesSkipped, i += Hs(o.v), a += o.manualIn;
	return z.batch(e.length, z.counts(t, n, r, i, a));
}
function Qs(e, t) {
	let n = [], r = !1, i = t.length > 1, a = B(e, "div", "edc-res");
	a.id = "edcReadResults";
	let o = B(e, "div", "edc-res-counts");
	o.id = "edcReadCounts", a.append(o);
	let s = B(e, "div", "edc-res-attn");
	s.id = "edcReadAttn";
	let c = B(e, "div", "edc-res-all");
	c.id = "edcReadAllRows", c.hidden = !0;
	let l = 0, u = [], d = () => {
		let e = u.map((e) => e());
		o.textContent = i ? Zs(e) : Us(e[0].v, e[0].manualIn);
	};
	t.forEach((t, n) => {
		let a = p(t, i ? n : null);
		if (l += a.total, u.push(a.now), i) {
			let r = (r) => {
				let i = B(e, "div", r, z.fileTitle(n + 1, t.log.fileName));
				return i.dataset.file = String(n), i;
			}, i = B(e, "div", "edc-res-file");
			i.dataset.file = String(n), i.append(r("edc-res-file-title"), a.counts, ...a.attn), s.append(i);
			let o = B(e, "div", "edc-res-file");
			o.dataset.file = String(n), o.append(r("edc-res-file-title"), ...a.all), c.append(o);
		} else s.append(...a.attn), c.append(...a.all);
		t.store?.onChange(() => {
			try {
				r || (a.refresh(), d());
			} catch {}
		});
	}), d(), a.append(s);
	let f = B(e, "button", "edc-xdw-btn edc-res-showall", z.showAll(l));
	f.type = "button", f.id = "edcReadShowAll", f.setAttribute("aria-expanded", "false"), f.setAttribute("aria-controls", "edcReadAllRows"), f.addEventListener("click", () => {
		try {
			c.hidden = !c.hidden, f.setAttribute("aria-expanded", String(!c.hidden)), f.textContent = c.hidden ? z.showAll(l) : z.hideAll;
		} catch {}
	}), a.append(f, c);
	function p(t, i) {
		let { v: a, log: o, frag: s, store: c } = t, l = B(e, "div", "edc-res-counts edc-res-file-counts");
		i !== null && (l.dataset.file = String(i));
		let u = () => ({
			v: a,
			manualIn: c?.confirmed() ?? 0
		}), d = () => {
			l.textContent = Us(a, c?.confirmed() ?? 0);
		};
		d();
		let f = (e) => (i !== null && (e.dataset.file = String(i)), e), p = /* @__PURE__ */ new Map(), m = (e, t) => {
			if (!c) return;
			let n = c.isConfirmed(e.page, t.index), r = n ? c.state(e, t) : null;
			for (let i of p.get(`${e.page}:${t.index}`) ?? []) i.tr.classList.toggle("edc-res-manualin", n), i.st.textContent = n ? R.statusIn : t.status === "pass" ? z.pass : z.manual, i.why.textContent = n && r ? R.reasonIn(r.raw, r.preset) : t.reasons.join("；");
		}, h = null;
		c?.onChange((e, t) => {
			h = {
				page: e,
				index: t
			};
		});
		let g = () => {
			d();
			let e = h;
			if (!e) return;
			let t = a.pages.find((t) => t.page === e.page), n = t?.rows[e.index];
			t && n && m(t, n);
		}, _ = Ws(a), v = [];
		if (_.allPass.length) {
			let t = B(e, "div", "edc-res-allpass", z.allPass(_.allPass, _.allPassRows));
			i === null && (t.id = "edcReadAllPass"), v.push(f(t));
		}
		_.pages.length || v.push(B(e, "div", "edc-res-noattn", z.noAttn));
		for (let t of _.pages) {
			let n = b(t.page, "edc-res-attn-page");
			t.rows.length && n.append(x(t.page, t.rows, "edc-res-arow")), c && (t.kind === "manual" || t.kind === "skip") && n.append(B(e, "div", "edc-res-byhand", z.pageByHand)), t.kind === "warn-pass" ? n.append(B(e, "div", "edc-res-hidden-pass", z.warnPass(t.hiddenPass))) : t.hiddenPass > 0 && n.append(B(e, "div", "edc-res-hidden-pass", z.hiddenPass(t.hiddenPass))), v.push(n);
		}
		let y = [];
		for (let e of a.pages) {
			let t = b(e, "edc-res-page");
			e.rows.length && t.append(x(e, e.rows, "edc-res-row")), y.push(t);
		}
		return {
			counts: l,
			attn: v,
			all: y,
			total: _.total,
			refresh: g,
			now: u
		};
		function b(t, n) {
			let r = o.pages.find((e) => e.page === t.page) ?? null, i = B(e, "div", `${n} ${n}-${t.status}`);
			f(i), i.dataset.page = String(t.page), i.dataset.status = t.status;
			let a = B(e, "div", "edc-res-page-head");
			a.append(B(e, "strong", void 0, z.page(t.page)), B(e, "span", "edc-res-mode", t.mode === "whole" ? z.modeWhole : z.modeSkip));
			let s = t.status === "ok" ? z.pageOk : t.status === "manual" ? z.pageManual + (t.reasons.join("；") || "—") : z.pageSkip + (r?.reason || "—");
			if (a.append(B(e, "span", "edc-res-page-status", s)), i.append(a), t.status !== "skip") {
				let n = Xs(t, o), r = B(e, "ul", "edc-res-identity"), a = (t, n) => {
					let i = B(e, "li", void 0, `${z.labels[t]}：${n}`);
					i.dataset.field = t, r.append(i);
				};
				a("sampleName", n.sampleName), a("reportNo", n.reportNo), a("sampleTime", n.sampleTime), i.append(r);
			}
			for (let n of t.warnings) i.append(B(e, "div", "edc-res-warn", `⚠ ${n}`));
			return i;
		}
		function x(t, n, r) {
			let i = B(e, "table", "edc-res-table"), a = B(e, "tr");
			for (let t of z.cols) a.append(B(e, "th", void 0, t));
			let o = B(e, "thead");
			o.append(a);
			let s = B(e, "tbody");
			for (let e of n) s.append(...S(t, e, r));
			return i.append(o, s), i;
		}
		function S(t, n, r) {
			let i = B(e, "tr", `${r} edc-res-${n.status}`);
			f(i), i.dataset.page = String(t.page), i.dataset.row = String(n.index + 1), i.title = "點一下看五格對照與片段";
			let a = B(e, "td", "edc-res-status", n.status === "pass" ? z.pass : z.manual), o = B(e, "td", "edc-res-reason", n.reasons.join("；"));
			i.append(B(e, "td", void 0, n.expected), B(e, "td", void 0, n.a ? Ys(n.a.result) : z.none), B(e, "td", void 0, n.b ? Ys(n.b.result) : z.none), a, o);
			let s = `${t.page}:${n.index}`;
			p.set(s, [...p.get(s) ?? [], {
				tr: i,
				st: a,
				why: o,
				pr: t,
				r: n
			}]), m(t, n);
			let c = B(e, "tr", "edc-res-detail-row");
			c.hidden = !0;
			let l = B(e, "td");
			l.colSpan = z.cols.length, c.append(l);
			let u = !1;
			return i.addEventListener("click", () => {
				try {
					c.hidden = !c.hidden, !u && !c.hidden && (u = !0, l.append(C(t, n, r === "edc-res-arow")));
				} catch {}
			}), [i, c];
		}
		function C(t, n, i) {
			let a = B(e, "div", "edc-res-detail");
			f(a), a.dataset.page = String(t.page), a.dataset.row = String(n.index + 1);
			let o = B(e, "table", "edc-res-cmp"), s = B(e, "tr");
			s.append(B(e, "th", void 0, "欄位"), B(e, "th", void 0, "A"), B(e, "th", void 0, "B")), o.append(s);
			for (let t of Object.keys(z.fields)) {
				let r = B(e, "tr");
				r.append(B(e, "td", void 0, z.fields[t]), B(e, "td", void 0, n.a ? Ys(n.a[t]) : z.none), B(e, "td", void 0, n.b ? Ys(n.b[t]) : z.none)), o.append(r);
			}
			if (a.append(o), i && c) {
				let r = Vs(e, c, t, n);
				r && a.append(r);
			}
			let l = B(e, "div", "edc-res-frag");
			return a.append(l), w(t, n, l).catch((t) => {
				r || l.replaceChildren(B(e, "div", "edc-xdw-red", z.fragFail(Js(t))));
			}), a;
		}
		async function w(t, r, i) {
			let a = o.pages.find((e) => e.page === t.page) ?? null, c = s(t.page);
			if (!(a && c && c.mode === a.mode && c.image && c.box && a.image && a.image.w === c.box.w && a.image.h === c.box.h) || !c || !c.image || !c.box) {
				i.append(B(e, "div", "edc-res-frag-none", z.fragNone));
				return;
			}
			let l = B(e, "img", "edc-res-frag-img");
			l.alt = z.fragAlt(t.page, r.index + 1);
			let u = URL.createObjectURL(c.image);
			n.push(u), l.src = u, l.title = "點一下放大到原尺寸／縮回";
			let d = B(e, "div", "edc-res-frag-wrap");
			l.addEventListener("click", () => {
				try {
					l.classList.toggle("edc-res-frag-full"), d.classList.toggle("edc-res-frag-scroll");
				} catch {}
			}), d.append(l), i.append(B(e, "div", "edc-res-frag-note", z.fragWhole), d);
		}
	}
	return {
		element: a,
		dispose: () => {
			r = !0;
			for (let e of n) try {
				URL.revokeObjectURL(e);
			} catch {}
			n.length = 0;
		}
	};
}
//#endregion
//#region src/xdwread/results-noise.ts
var V = {
	counts: (e, t, n, r, i) => `通過 ${e}／需人工 ${t}／${n > 0 ? `整頁需人工 ${n} 頁／` : ""}${r > 0 ? `沒有資料 ${r} 頁／` : ""}沒送 ${i} 頁`,
	allPass: (e, t, n) => `${e} 站（第 ${t.join("、")} 頁）共 ${n} 個值全部通過`,
	noAttn: "沒有需要注意的站或頁。",
	noData: (e) => `沒有資料的頁（封面、目錄、聲明書等；不算需人工）：第 ${e.join("、")} 頁`,
	noLayout: "這個檔沒有任何一頁認得出噪音振動版型（可能選錯分頁或選錯檔），不會帶入任何值。",
	noManual: "噪音振動不提供在這個視窗人工輸入：需人工的值請匯入後到原網站表格手動補（確認畫面的提醒區會逐項列出）。",
	station: (e, t) => `測站 ${t}（現場編號 ${e}）`,
	stationPages: (e) => [
		"N1",
		"N2",
		"V1"
	].filter((t) => e[t] !== void 0).map((t) => `${$s[t]} 第 ${e[t]} 頁`).join("、"),
	stationOk: (e, t) => `站層級檢查通過；${e}／${t} 個值通過`,
	stationManual: "全站需人工：",
	hiddenPass: (e) => `其他 ${e} 個值通過（按「顯示全部」可看）`,
	page: (e) => `第 ${e} 頁`,
	layout: (e) => e ? $s[e] : "版型不明",
	pageOk: "頁層級檢查通過",
	pageManual: "整頁需人工輸入：",
	pageSkip: "沒送：",
	pageNoData: "沒有資料（不是噪音振動版型，不算需人工）",
	cols: [
		"項目",
		"來源頁",
		"A 值",
		"B 值",
		"狀態",
		"交叉檢查",
		"原因"
	],
	pageCols: [
		"頁",
		"版型",
		"狀態",
		"原因"
	],
	cross: {
		pass: "一致",
		mismatch: "不一致",
		unavailable: "無法檢查",
		none: "（沒有對照）"
	},
	showAll: (e) => `顯示全部 ${e} 個值與每一頁`,
	ids: {
		code: "現場編號",
		loc: "測站",
		period: "日期/時間",
		report: "報告編號"
	}
}, $s = {
	N1: "噪音總表",
	N2: "噪音逐時",
	V1: "振動逐時"
}, ec = (e) => V.counts(e.totals.pass, e.totals.manual, e.totals.pagesManual, e.totals.pagesNoData, e.totals.pagesSkipped);
function tc(e) {
	let t = {
		pass: 0,
		manual: 0,
		pagesManual: 0,
		pagesNoData: 0,
		pagesSkipped: 0
	};
	for (let n of e) for (let e of Object.keys(t)) t[e] += n.totals[e];
	return z.batch(e.length, V.counts(t.pass, t.manual, t.pagesManual, t.pagesNoData, t.pagesSkipped));
}
function nc(e) {
	let t = {
		allPassStations: [],
		allPassPages: [],
		allPassValues: 0,
		stations: [],
		pages: [],
		noData: [],
		anyLayout: e.pages.some((e) => e.layout !== null),
		total: 0
	};
	e.stations.forEach((e, n) => {
		t.total += e.values.length;
		let r = e.values.filter((e) => e.status !== "pass");
		e.status === "ok" && r.length === 0 ? (t.allPassStations.push(n), t.allPassPages.push(...Object.values(e.pages).filter((e) => e !== void 0)), t.allPassValues += e.values.length) : t.stations.push({
			index: n,
			st: e,
			manual: r,
			pass: e.values.length - r.length
		});
	}), t.allPassPages.sort((e, t) => e - t);
	for (let n of [...e.pages].sort((e, t) => e.page - t.page)) n.status === "nodata" ? t.noData.push(n.page) : (n.status === "skip" || n.status === "manual" && n.station === null) && t.pages.push(n);
	return t;
}
function rc(e, t, n) {
	let r = Ga[n], i = t.pages[r.layout];
	if (i === void 0) return null;
	let a = e.pages.find((e) => e.page === i)?.cells.find((e) => e.layout === r.layout && e.index === r.index && e.use === "write");
	return a ? {
		a: a.a,
		b: a.b
	} : null;
}
function H(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var ic = (e) => e == null || e === "" ? z.empty : e;
function ac(e, t) {
	if (e.identity && e.status === "ok") return {
		code: e.identity.siteCode,
		loc: e.identity.location,
		period: e.identity.periodKey
	};
	let n = e.mode === "skip" ? null : Jo(t.calls, e.page, "A"), r = (e) => {
		if (!n || !n.ok) return z.notRead;
		let t = n.reply[e].value;
		return t === null || t.trim() === "" ? z.notRead : `${t}${z.unconfirmed}`;
	};
	return {
		code: r("site_code"),
		loc: r("location"),
		period: r("period")
	};
}
function oc(e, t) {
	let n = t.length > 1, r = H(e, "div", "edc-res edc-res-noise");
	r.id = "edcReadResults";
	let i = H(e, "div", "edc-res-counts", n ? tc(t.map((e) => e.v)) : ec(t[0].v));
	i.id = "edcReadCounts";
	let a = H(e, "div", "edc-res-attn");
	a.id = "edcReadAttn";
	let o = H(e, "div", "edc-res-all");
	o.id = "edcReadAllRows", o.hidden = !0;
	let s = 0;
	t.forEach((t, r) => {
		let i = (e) => (n && (e.dataset.file = String(r)), e), c = nc(t.v);
		s += c.total;
		let f = [], p = [];
		if (!c.anyLayout) {
			let t = i(H(e, "div", "edc-xdw-red edc-noise-nolayout", V.noLayout));
			n || (t.id = "edcNoiseNoLayout"), f.push(t);
		}
		if (c.allPassStations.length) {
			let t = i(H(e, "div", "edc-res-allpass", V.allPass(c.allPassStations.length, c.allPassPages, c.allPassValues)));
			n || (t.id = "edcReadAllPass"), f.push(t);
		}
		for (let e of c.stations) f.push(l(t, r, e.index, e.st, e.manual, e.pass, !1));
		for (let e of c.pages) f.push(u(t, r, e));
		if (c.noData.length) {
			let t = i(H(e, "div", "edc-noise-nodata", V.noData(c.noData)));
			n || (t.id = "edcReadNoData"), f.push(t);
		}
		if (!c.stations.length && !c.pages.length && c.anyLayout && f.push(H(e, "div", "edc-res-noattn", V.noAttn)), t.v.totals.manual > 0 || t.v.totals.pagesManual > 0) {
			let t = i(H(e, "div", "edc-noise-nomanual", V.noManual));
			n || (t.id = "edcNoiseNoManual"), f.push(t);
		}
		if (t.v.stations.forEach((e, n) => p.push(l(t, r, n, e, e.values, 0, !0))), p.push(d(t, r)), n) {
			let n = () => {
				let n = H(e, "div", "edc-res-file-title", z.fileTitle(r + 1, t.log.fileName));
				return n.dataset.file = String(r), n;
			}, i = H(e, "div", "edc-res-file");
			i.dataset.file = String(r);
			let s = H(e, "div", "edc-res-counts edc-res-file-counts", ec(t.v));
			s.dataset.file = String(r), i.append(n(), s, ...f), a.append(i);
			let c = H(e, "div", "edc-res-file");
			c.dataset.file = String(r), c.append(n(), ...p), o.append(c);
		} else a.append(...f), o.append(...p);
	});
	let c = H(e, "button", "edc-xdw-btn edc-res-showall", V.showAll(s));
	c.type = "button", c.id = "edcReadShowAll", c.setAttribute("aria-expanded", "false"), c.setAttribute("aria-controls", "edcReadAllRows"), c.addEventListener("click", () => {
		try {
			o.hidden = !o.hidden, c.setAttribute("aria-expanded", String(!o.hidden)), c.textContent = o.hidden ? V.showAll(s) : z.hideAll;
		} catch {}
	}), r.append(i, a, c, o);
	function l(t, r, i, a, o, s, c) {
		let l = H(e, "section", c ? "edc-noise-station edc-noise-station-full" : "edc-noise-station");
		l.dataset.station = String(i), l.dataset.status = a.status, n && (l.dataset.file = String(r));
		let u = H(e, "div", "edc-noise-station-head");
		u.append(H(e, "strong", void 0, V.station(a.siteCode, a.location)), H(e, "span", "edc-noise-station-pages", `（${V.stationPages(a.pages)}）`)), l.append(u);
		let d = a.values.filter((e) => e.status === "pass").length;
		l.append(a.status === "ok" ? H(e, "div", "edc-res-page-status", V.stationOk(d, a.values.length)) : H(e, "div", "edc-res-page-status edc-xdw-red", V.stationManual + a.reasons.join("；")));
		let f = H(e, "table", "edc-res-table edc-noise-table"), p = H(e, "tr");
		for (let t of V.cols) p.append(H(e, "th", void 0, t));
		f.append(p);
		for (let i of o) {
			let o = H(e, "tr", c ? "edc-noise-row" : "edc-noise-arow");
			o.dataset.key = i.key, o.dataset.status = i.status, i.page !== null && (o.dataset.page = String(i.page)), n && (o.dataset.file = String(r));
			let s = rc(t.v, a, i.key);
			o.append(H(e, "td", void 0, i.key), H(e, "td", void 0, i.page === null ? z.none : String(i.page)), H(e, "td", void 0, ic(s?.a)), H(e, "td", void 0, ic(s?.b)), H(e, "td", i.status === "pass" ? "edc-res-pass" : "edc-res-manual", i.status === "pass" ? z.pass : z.manual), H(e, "td", void 0, V.cross[i.cross]), H(e, "td", void 0, i.reasons.join("；"))), f.append(o);
		}
		return l.append(f), s > 0 && l.append(H(e, "div", "edc-res-hiddenpass", V.hiddenPass(s))), l;
	}
	function u(t, r, i) {
		let a = H(e, "section", "edc-noise-page");
		a.dataset.page = String(i.page), a.dataset.status = i.status, n && (a.dataset.file = String(r));
		let o = H(e, "div", "edc-noise-page-head");
		if (o.append(H(e, "strong", void 0, V.page(i.page)), H(e, "span", void 0, ` ${V.layout(i.layout)}`)), a.append(o), a.append(H(e, "div", "edc-res-page-status edc-xdw-red", (i.status === "skip" ? V.pageSkip : V.pageManual) + i.reasons.join("；"))), i.status !== "skip") {
			let n = ac(i, t.log), r = H(e, "ul", "edc-res-identity");
			r.append(H(e, "li", void 0, `${V.ids.code}：${n.code}`), H(e, "li", void 0, `${V.ids.loc}：${n.loc}`), H(e, "li", void 0, `${V.ids.period}：${n.period}`)), a.append(r);
		}
		return a;
	}
	function d(t, r) {
		let i = H(e, "table", "edc-res-table edc-noise-pages"), a = H(e, "tr");
		for (let t of V.pageCols) a.append(H(e, "th", void 0, t));
		i.append(a);
		for (let a of [...t.v.pages].sort((e, t) => e.page - t.page)) {
			let t = H(e, "tr", "edc-noise-prow");
			t.dataset.page = String(a.page), t.dataset.status = a.status, n && (t.dataset.file = String(r));
			let o = a.status === "ok" ? V.pageOk : a.status === "nodata" ? V.pageNoData : a.status === "skip" ? V.pageSkip.replace("：", "") : V.pageManual.replace("：", "");
			t.append(H(e, "td", void 0, String(a.page)), H(e, "td", void 0, V.layout(a.layout)), H(e, "td", void 0, o), H(e, "td", void 0, a.status === "ok" || a.status === "nodata" ? "" : a.reasons.join("；"))), i.append(t);
		}
		return i;
	}
	return {
		element: r,
		dispose: () => {}
	};
}
//#endregion
//#region src/xdwread/sheet-noise.ts
var sc = (e) => String(e).padStart(2, "0"), cc = (e) => e.map((e) => `p${sc(e)}`).join("_"), lc = (e) => `${e.start.rocYear}.${sc(e.start.month)}.${sc(e.start.day)}`, uc = (e) => Array.from({ length: 24 }, (t, n) => {
	let r = (e.start.hour + n) % 24;
	return `${sc(r)}~${sc(r + 1)}`;
}), dc = 24 * 36e5, fc = (e) => Date.UTC(e.rocYear + 1911, e.month - 1, e.day, e.hour, e.minute);
function pc(e, t, n) {
	let r = `第 ${t + 1} 站`, i = n.window;
	if (!i || n.windowPage === null) throw Error(`${r}：沒有時間窗（內部檢查）`);
	if (i.start.minute !== 0 || i.end.minute !== 0 || fc(i.end) - fc(i.start) !== dc) throw Error(`${r}：時間窗不是整點 24 小時（內部檢查）`);
	let a = e.pages.find((e) => e.page === n.windowPage);
	if (!a || a.status !== "ok" || a.station !== t || a.layout !== "N1") throw Error(`${r}：時間窗來源頁沒有通過（內部檢查）`);
	if (typeof n.location != "string" || n.location.trim() === "") throw Error(`${r}：測站空白（內部檢查）`);
}
function mc() {
	return Array.from({ length: I.rows }, () => Array(I.cols).fill(""));
}
function hc(e, t, n, r) {
	let i = ([t, n], r) => {
		e[t][n] = r;
	};
	i(I.agencyCell, I.agencyLabel + t.agency.name), i(I.locationCell, I.locationLabel + n.location), i(I.dateCell, I.dateLabel + lc(r)), i(I.timeHeaderCell, I.timeHeader), uc(r).forEach((t, n) => {
		e[I.firstHourRow + n][I.hourCol] = t;
	});
}
function gc(e, t) {
	let n = [], r = [], i = /* @__PURE__ */ new Set();
	for (let t of e.pages) t.station === null && r.push({
		page: t.page,
		location: "",
		key: null,
		reason: t.reasons[0] ?? "整頁需人工"
	});
	return e.stations.forEach((a, o) => {
		let s = /* @__PURE__ */ new Map();
		for (let t of a.values) {
			if (a.status !== "ok" || t.status !== "pass") {
				r.push({
					page: t.page,
					location: a.location,
					key: t.key,
					reason: t.reasons[0] ?? a.reasons[0] ?? "需人工"
				});
				continue;
			}
			let n = `第 ${o + 1} 站 ${t.key}`, i = Ua.includes(t.key);
			if (typeof t.value != "string" || !Ra.test(t.value)) throw Error(`${n}：值的寫法不在允許清單內（內部檢查）`);
			if (i ? typeof t.method != "string" || !La.test(t.method) : t.method !== null) throw Error(`${n}：方法不符（內部檢查）`);
			let c = e.pages.find((e) => e.page === t.page);
			if (t.page === null || !c || c.status !== "ok" || c.station !== o || c.layout !== (i ? "N2" : "V1")) throw Error(`${n}：來源頁沒有通過（內部檢查）`);
			if (s.has(t.key)) throw Error(`${n}：同一個值出現兩次（內部檢查）`);
			s.set(t.key, {
				key: t.key,
				value: t.value,
				method: t.method,
				page: t.page
			});
		}
		if (a.status !== "ok" || s.size === 0) return;
		pc(e, o, a);
		let c = a.window, l = (e, r, l) => {
			let u = r.map((e) => s.get(e)).filter((e) => !!e);
			if (!u.length) return;
			let d = [.../* @__PURE__ */ new Set([...u.map((e) => e.page), a.windowPage])].sort((e, t) => e - t), f = cc(d);
			if (i.has(f)) throw Error("工作表名稱重複（內部檢查）");
			i.add(f);
			let p = mc();
			hc(p, t, a, c), l(p, u), n.push({
				name: f,
				kind: e,
				station: o,
				siteCode: a.siteCode,
				location: a.location,
				pages: d,
				window: c,
				values: u.map((e) => ({ ...e })),
				aoa: p
			});
		};
		l("noise", Ua, (e, t) => {
			if (a.zone === null) throw Error(`第 ${o + 1} 站：管制區類別不明，不能寫噪音表（內部檢查）`);
			let n = new Set(t.map((e) => e.method));
			if (e[I.methodCell[0]][I.methodCell[1]] = I.methodLabel + t[0].method, n.size !== 1) throw Error(`第 ${o + 1} 站：噪音三列的方法不同，不能寫進同一格（內部檢查）`);
			a.reportNo && (e[I.reportCell[0]][I.reportCell[1]] = I.reportLabel + a.reportNo);
			let r = Ma[a.zone];
			Ua.forEach((t, n) => {
				e[I.labelRow][n] = r[n], e[I.valueRow][n] = s.get(t)?.value ?? "";
			});
		}), l("vib", Wa, (e) => {
			Wa.forEach((t, n) => {
				e[I.labelRow + n][0] = qa[t], e[I.labelRow + n][1] = s.get(t)?.value ?? "";
			});
		});
	}), {
		...t,
		agency: { ...t.agency },
		period: { ...t.period },
		sheets: n,
		total: n.reduce((e, t) => e + t.values.length, 0),
		excluded: r
	};
}
function _c(e, t) {
	if (!e.sheets.length) throw Error("沒有任何通過核對的值，不能產生 xlsx");
	let n = t.utils.book_new();
	for (let r of e.sheets) {
		let e = t.utils.aoa_to_sheet(r.aoa.map((e) => e.map(String)));
		for (let t of Object.keys(e)) {
			if (t.startsWith("!")) continue;
			let n = e[t];
			if (String(n.v ?? "") === "") {
				delete e[t];
				continue;
			}
			n.t = "s", n.v = String(n.v), delete n.w, delete n.z;
		}
		t.utils.book_append_sheet(n, e, r.name);
	}
	let r = t.write(n, {
		type: "array",
		bookType: "xlsx"
	});
	return r instanceof Uint8Array ? r : new Uint8Array(r);
}
//#endregion
//#region src/xdwread/preflight-noise.ts
var vc = {
	noUpstream: "找不到原網站的 Excel 解析函式（原網站程式可能已更新），無法自我檢查",
	crashed: "原網站的解析函式在自我檢查時出錯",
	sheets: "原網站讀到的工作表和放進去的不一樣",
	tods: (e) => `工作表 ${e}：原網站讀出的時段（日間／晚間／夜間）和放進去的不一樣（多了、少了或重複）`,
	value: (e, t) => `工作表 ${e} 的 ${t}：原網站解析出的監測數值和讀到的不相符`,
	secondary: (e, t) => `工作表 ${e} 的 ${t}：原網站把它放進「其他測項」`,
	method: (e, t) => `工作表 ${e} 的 ${t}：原網站解析出的監測方法和預期不同`,
	fixed: (e, t) => `工作表 ${e} 的 ${t}：原網站給的單位代碼、檢測類別、音源發聲特性、管制標準或管制區不是預期的（原網站可能已更新）`,
	date: (e) => `工作表 ${e}：原網站解析出的日期或時間和讀到的時間窗不一樣`,
	site: (e) => `工作表 ${e}：原網站解析出的監測地點和讀到的測站不一樣`,
	agency: (e) => `工作表 ${e}：原網站解析出的檢測機構代碼和你選的不一樣`,
	siteCode: (e) => `工作表 ${e}：原網站讀到了測點編號或座標（不該有）`,
	stations: (e, t) => `整本：原網站分出的測站數 ${e} 個，應該是 ${t} 個`,
	wbAgency: "整本：原網站有檢測機構代碼空白的列",
	wbRows: (e, t) => `整本：原網站讀出 ${e} 列，應該是 ${t} 列`
}, yc = (e) => e == null ? "" : String(e), bc = (e) => String(e).padStart(2, "0"), xc = (e) => e.replace(/\.0$/, "");
function Sc(e) {
	let t = (e, t, n) => `${e}-${bc(t)}-${bc(n)}`, n = /* @__PURE__ */ new Date(Date.UTC(e.end.rocYear + 1911, e.end.month - 1, e.end.day, e.end.hour, e.end.minute) - 6e4);
	return {
		dateStart: t(e.start.rocYear + 1911, e.start.month, e.start.day),
		timeStart: `${bc(e.start.hour)}:${bc(e.start.minute)}:00`,
		dateEnd: t(n.getUTCFullYear(), n.getUTCMonth() + 1, n.getUTCDate()),
		timeEnd: `${bc(n.getUTCHours())}:${bc(n.getUTCMinutes())}:00`
	};
}
async function Cc(e, t, n) {
	let r = e?.ImportEngine?.readWorkbookGrids, i = e?.SmartParse?.parseSheet, a = e?.SmartParse?.parseWorkbook, o = e?.SmartParse?.extractMethodCode;
	if (typeof r != "function" || typeof i != "function" || typeof a != "function" || typeof o != "function") return {
		ok: !1,
		problems: [vc.noUpstream],
		rows: null
	};
	let s = [], c = {};
	try {
		let l = await r.call(e.ImportEngine, t), u = l && typeof l == "object" ? Object.keys(l) : [], d = n.sheets.map((e) => e.name);
		(u.length !== d.length || d.some((e) => !u.includes(e))) && s.push(vc.sheets);
		for (let t of n.sheets) {
			let r = l?.[t.name];
			if (!r) continue;
			let a = i.call(e.SmartParse, "noise", t.name, r, { allowAutoDetect: !1 }), u = Array.isArray(a) ? a : [];
			c[t.name] = u;
			let d = t.name, f = new Map(t.values.map((e) => [Ja[e.key], e])), p = u.map((e) => yc(e.監測時段));
			if (!u.length || p.length !== f.size || new Set(p).size !== p.length || p.some((e) => !f.has(e))) {
				s.push(vc.tods(d));
				continue;
			}
			let m = Sc(t.window), h = /* @__PURE__ */ new Set(), g = t.kind === "vib";
			for (let r of u) {
				let i = f.get(yc(r.監測時段)), a = i.key;
				yc(r.監測數值) !== xc(i.value) && s.push(vc.value(d, a)), r._secondaryItem === !0 && s.push(vc.secondary(d, a));
				let c = g ? Ya.vib.method : i.method ? o.call(e.SmartParse, i.method) : "\0";
				yc(r.監測方法) !== c && s.push(vc.method(d, a));
				let l = g ? [
					Ya.vib.unit,
					Ya.vib.category,
					a === "Lv10日" ? Ya.vib.featureDay : Ya.vib.featureNight,
					Ya.vib.standard,
					Ya.vib.zone
				] : [
					Ya.noise.unit,
					Ya.noise.category,
					Ya.noise.feature,
					Ya.noise.standard,
					Ya.noise.zone
				];
				[
					r.監測單位,
					r.檢測類別,
					r.音源發聲特性,
					r.管制標準,
					r.管制區
				].map(yc).some((e, t) => e !== l[t]) && s.push(vc.fixed(d, a)), (yc(r["日期(起)"]) !== m.dateStart || yc(r["時間(起)"]) !== m.timeStart || yc(r["日期(迄)"]) !== m.dateEnd || yc(r["時間(迄)"]) !== m.timeEnd) && h.add("date"), yc(r.監測地點).trim() !== t.location.trim() && h.add("site"), yc(r.檢測機構許可證號) !== n.agency.code && h.add("agency"), (yc(r._siteCode) !== "" || yc(r.座標系統) !== "" || yc(r["採樣座標-經度 X"]) !== "" || yc(r["採樣座標-緯度 Y"]) !== "") && h.add("siteCode");
			}
			h.has("date") && s.push(vc.date(d)), h.has("site") && s.push(vc.site(d)), h.has("agency") && s.push(vc.agency(d)), h.has("siteCode") && s.push(vc.siteCode(d));
		}
		let f = a.call(e.SmartParse, "noise", l), p = Array.isArray(f?.rows) ? f.rows : [], m = n.sheets.reduce((e, t) => e + t.values.length, 0);
		p.length !== m && s.push(vc.wbRows(p.length, m));
		let h = Object.keys(f?.sites ?? {}).length, g = new Set(n.sheets.map((e) => e.station)).size;
		h !== g && s.push(vc.stations(h, g)), p.some((e) => yc(e.檢測機構許可證號) === "") && s.push(vc.wbAgency);
	} catch {
		return {
			ok: !1,
			problems: [...s, vc.crashed],
			rows: Object.keys(c).length ? c : null
		};
	}
	return s.length ? {
		ok: !1,
		problems: s,
		rows: c
	} : {
		ok: !0,
		rows: c,
		total: Object.values(c).reduce((e, t) => e + t.length, 0)
	};
}
//#endregion
//#region src/xdwread/sheet-air.ts
var wc = (e) => String(e).padStart(2, "0"), Tc = (e) => e.map((e) => `p${wc(e)}`).join("_"), Ec = (e) => `${e.start.month}/${e.start.day} ~ ${e.end.month}/${e.end.day}`, Dc = (e) => [`${wc(e.start.hour)} ~ ${wc((e.start.hour + 1) % 24)}`, `${wc((e.end.hour + 23) % 24)} ~ ${wc(e.end.hour)}`];
function Oc(e) {
	let t = /^(\d{3})\.(\d{2})\.(\d{2})$/.exec(e);
	if (!t) throw Error("收樣日期寫法不符（內部檢查）");
	return `${t[1]}年${t[2]}月${t[3]}日`;
}
var kc = 24 * 36e5, Ac = (e) => Date.UTC(e.rocYear + 1911, e.month - 1, e.day, e.hour, e.minute);
function jc(e, t, n) {
	let r = `第 ${t + 1} 站`, i = n.window;
	if (!i || n.windowPage === null || !n.receiveDate) throw Error(`${r}：沒有時間窗或收樣日期（內部檢查）`);
	if (i.start.minute !== 0 || i.end.minute !== 0 || Ac(i.end) - Ac(i.start) !== kc) throw Error(`${r}：時間窗不是整點 24 小時（內部檢查）`);
	if (Number(n.receiveDate.split(".")[0]) !== i.start.rocYear) throw Error(`${r}：收樣日期的年和時間窗不同（內部檢查）`);
	let a = e.pages.find((e) => e.page === n.windowPage);
	if (!a || a.status !== "ok" || a.station !== t) throw Error(`${r}：時間窗來源頁沒有通過（內部檢查）`);
	if (typeof n.location != "string" || n.location.trim() === "") throw Error(`${r}：測站空白（內部檢查）`);
}
function Mc(e, t) {
	let n = [], r = [], i = /* @__PURE__ */ new Set();
	for (let t of e.pages) t.station === null && r.push({
		page: t.page,
		location: "",
		key: null,
		reason: t.reasons[0] ?? "整頁需人工"
	});
	return e.stations.forEach((a, o) => {
		let s = [];
		for (let t of a.values) {
			if (a.status !== "ok" || t.status !== "pass") {
				r.push({
					page: t.page,
					location: a.location,
					key: t.key,
					reason: t.reasons[0] ?? a.reasons[0] ?? "需人工"
				});
				continue;
			}
			let n = `第 ${o + 1} 站 ${t.key}`;
			if (typeof t.value != "string" || !Wr.test(t.value)) throw Error(`${n}：值的寫法不在允許清單內（內部檢查）`);
			if (typeof t.method != "string" || !Ur.test(t.method)) throw Error(`${n}：方法的寫法不在允許清單內（內部檢查）`);
			let i = e.pages.find((e) => e.page === t.page);
			if (t.page === null || !i || i.status !== "ok" || i.station !== o) throw Error(`${n}：來源頁沒有通過（內部檢查）`);
			s.push({
				key: t.key,
				value: t.value,
				method: t.method,
				page: t.page
			});
		}
		if (a.status !== "ok" || s.length === 0) return;
		if (new Set(s.map((e) => e.key)).size !== s.length) throw Error(`第 ${o + 1} 站：同一個項目出現兩次（內部檢查）`);
		jc(e, o, a);
		let c = a.window, l = [.../* @__PURE__ */ new Set([...s.map((e) => e.page), a.windowPage])].sort((e, t) => e - t), u = Tc(l);
		if (i.has(u)) throw Error("工作表名稱重複（內部檢查）");
		i.add(u);
		let d = new Map(s.map((e) => [e.key, e])), f = Array.from({ length: M.rows }, () => Array(M.cols).fill("")), p = ([e, t], n) => {
			f[e][t] = n;
		};
		p(M.titleCell, M.title), p(M.agencyCell, M.agencyLabel + t.agency.name), p(M.receiveCell, M.receiveLabel + Oc(a.receiveDate));
		let m = [a.reportNos.L1, a.reportNos.L2].filter((e) => !!e);
		p(M.reportCell, M.reportLabel + m.join("／")), M.header.forEach((e, t) => p([M.headerRow, M.headerFirstCol + t], e));
		let h = M.unitRow;
		p([h, Qr.location], a.location), p([h, Qr.time], Ec(c));
		let g = d.get("PM2.5");
		g && (p([h, Qr.pm25], g.value), p([h, Qr.method], g.method));
		let [_, v] = Dc(c);
		p([M.firstHourRow, M.hourCol], _), p([M.lastHourRow, M.hourCol], v);
		let y = d.get("TSP");
		y && p([M.firstHourRow, Qr.TSP], y.value), p([M.avgRow, 0], M.avgLabel);
		for (let e of $r) {
			let t = d.get(e);
			t && p([M.avgRow, Qr[e]], t.value);
		}
		let b = (e) => d.has(e) ? d.get(e).method : e === "THC" ? d.get("CH4")?.method ?? d.get("NMHC")?.method ?? null : null, x = ei.map((e) => [e, b(e)]).filter(([, e]) => e !== null).map(([e, t]) => `${e}:${t}`);
		x.length && p([M.methodRow, 0], M.methodPrefix + x.join("/")), n.push({
			name: u,
			station: o,
			siteCode: a.siteCode,
			location: a.location,
			pages: l,
			window: c,
			receiveDate: a.receiveDate,
			reportNos: m,
			values: Jr.filter((e) => d.has(e)).map((e) => ({ ...d.get(e) })),
			aoa: f
		});
	}), {
		...t,
		agency: { ...t.agency },
		period: { ...t.period },
		sheets: n,
		total: n.reduce((e, t) => e + t.values.length, 0),
		excluded: r
	};
}
function Nc(e, t) {
	if (!e.sheets.length) throw Error("沒有任何通過核對的值，不能產生 xlsx");
	let n = t.utils.book_new();
	for (let r of e.sheets) {
		let e = t.utils.aoa_to_sheet(r.aoa.map((e) => e.map(String)));
		for (let t of Object.keys(e)) {
			if (t.startsWith("!")) continue;
			let n = e[t];
			if (String(n.v ?? "") === "") {
				delete e[t];
				continue;
			}
			n.t = "s", n.v = String(n.v), delete n.w, delete n.z;
		}
		t.utils.book_append_sheet(n, e, r.name);
	}
	let r = t.write(n, {
		type: "array",
		bookType: "xlsx"
	});
	return r instanceof Uint8Array ? r : new Uint8Array(r);
}
//#endregion
//#region src/xdwread/preflight.ts
var Pc = {
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
	site: (e) => `第 ${e} 頁：原網站解析出的採樣地點和讀到的樣品名稱不一樣`,
	note: (e, t) => `第 ${e} 頁第 ${t} 列：原網站解析出的備註和預期的不一樣（應該是空白）`
}, Fc = (e) => "";
function Ic(e) {
	let t = /^(\d+)(?:\.(\d+))?$/.exec(e);
	if (!t) return null;
	let n = t[1].replace(/^0+(?=\d)/, ""), r = (t[2] ?? "").replace(/0+$/, "");
	return r ? `${n}.${r}` : n;
}
function Lc(e) {
	if (e === "ND") return {
		cmp: "ND",
		value: ""
	};
	if (e.startsWith("<")) {
		let t = Ic(e.slice(1));
		return t === null ? null : {
			cmp: "<",
			value: t
		};
	}
	let t = Ic(e);
	return t === null ? null : {
		cmp: "",
		value: t
	};
}
var Rc = (e) => e === "" ? "" : Ic(e), zc = (e) => e == null ? "" : String(e), Bc = (e) => String(e).padStart(2, "0");
async function Vc(e, t, n) {
	let r = e?.ImportEngine?.readWorkbookGrids, i = e?.SmartParse?.parseSheet;
	if (typeof r != "function" || typeof i != "function") return {
		ok: !1,
		problems: [Pc.noUpstream],
		rows: null
	};
	let a = [], o = {};
	try {
		let s = await r.call(e.ImportEngine, t), c = s && typeof s == "object" ? Object.keys(s) : [], l = n.sheets.map((e) => e.name);
		(c.length !== l.length || l.some((e) => !c.includes(e))) && a.push(Pc.sheets);
		for (let t of n.sheets) {
			let r = s?.[t.name];
			if (!r) continue;
			let c = i.call(e.SmartParse, "water", t.name, r, { allowAutoDetect: !1 }), l = Array.isArray(c) ? c : [];
			o[t.name] = l;
			let u = t.page;
			if (!l.length) {
				a.push(Pc.noRows(u));
				continue;
			}
			if (l.length !== t.rows.length) {
				a.push(Pc.count(u, t.rows.length, l.length));
				continue;
			}
			let d = t.identity.date, f = `${d.rocYear + 1911}-${Bc(d.month)}-${Bc(d.day)}`, p = `${Bc(d.hour)}:${Bc(d.minute)}`, m = /* @__PURE__ */ new Set();
			t.rows.forEach((e, r) => {
				let i = l[r], o = e.index + 1;
				zc(i.檢測項目) !== e.cells.item && a.push(Pc.item(u, o));
				let s = Lc(e.cells.result);
				(!s || zc(i.比較關係) !== s.cmp || zc(i.檢測數值) !== s.value) && a.push(Pc.value(u, o));
				let c = Rc(e.cells.mdl);
				(c === null || zc(i.檢測極限) !== c) && a.push(Pc.mdl(u, o)), zc(i.備註) !== Fc(e) && a.push(Pc.note(u, o)), zc(i.檢測類別) !== n.category.trim() && m.add("category"), zc(i.檢測機構許可證號) !== n.agency.code && m.add("agency");
				let d = zc(i["時間(起)"]);
				(zc(i["日期(起)"]) !== f || d !== `${p}:00`) && m.add("date"), zc(i.採樣地點).trim() !== t.identity.sampleName.trim() && m.add("site");
			}), m.has("category") && a.push(Pc.category(u)), m.has("agency") && a.push(Pc.agency(u)), m.has("date") && a.push(Pc.date(u)), m.has("site") && a.push(Pc.site(u));
		}
	} catch {
		return {
			ok: !1,
			problems: [...a, Pc.crashed],
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
//#region src/xdwread/preflight-air.ts
var Hc = {
	noUpstream: "找不到原網站的 Excel 解析函式（原網站程式可能已更新），無法自我檢查",
	crashed: "原網站的解析函式在自我檢查時出錯",
	sheets: "原網站讀到的工作表和放進去的不一樣",
	noRows: (e) => `工作表 ${e}：原網站沒有讀出任何列`,
	items: (e) => `工作表 ${e}：原網站讀出的項目和放進去的不一樣（多了、少了或重複）`,
	stat: (e, t) => `工作表 ${e} 的 ${t}：原網站把它當成日平均以外的統計值`,
	value: (e, t) => `工作表 ${e} 的 ${t}：原網站解析出的值和讀到的不相符`,
	method: (e, t) => `工作表 ${e} 的 ${t}：原網站解析出的檢測方法和讀到的不相符`,
	unit: (e, t) => `工作表 ${e} 的 ${t}：原網站給的單位代碼不是預期的（原網站可能已更新）`,
	note: (e, t) => `工作表 ${e} 的 ${t}：原網站解析出的備註不是空白`,
	date: (e) => `工作表 ${e}：原網站解析出的採樣日期或時間和讀到的時間窗不一樣`,
	site: (e) => `工作表 ${e}：原網站解析出的採樣地點和讀到的測站不一樣`,
	agency: (e) => `工作表 ${e}：原網站解析出的檢測機構代碼和你選的不一樣`,
	category: (e) => `工作表 ${e}：原網站解析出的檢測類別不是「${ti}」`
}, Uc = (e) => e == null ? "" : String(e), Wc = (e) => String(e).padStart(2, "0"), Gc = (e) => `${e.rocYear + 1911}-${Wc(e.month)}-${Wc(e.day)}`;
function Kc(e) {
	let t = /* @__PURE__ */ new Date(Date.UTC(e.end.rocYear + 1911, e.end.month - 1, e.end.day, e.end.hour, e.end.minute) - 6e4);
	return {
		dateStart: Gc(e.start),
		timeStart: `${Wc(e.start.hour)}:${Wc(e.start.minute)}:00`,
		dateEnd: `${t.getUTCFullYear()}-${Wc(t.getUTCMonth() + 1)}-${Wc(t.getUTCDate())}`,
		timeEnd: `${Wc(t.getUTCHours())}:${Wc(t.getUTCMinutes())}:00`
	};
}
async function qc(e, t, n) {
	let r = e?.ImportEngine?.readWorkbookGrids, i = e?.SmartParse?.parseSheet, a = e?.SmartParse?.extractMethodCode;
	if (typeof r != "function" || typeof i != "function" || typeof a != "function") return {
		ok: !1,
		problems: [Hc.noUpstream],
		rows: null
	};
	let o = [], s = {};
	try {
		let c = await r.call(e.ImportEngine, t), l = c && typeof c == "object" ? Object.keys(c) : [], u = n.sheets.map((e) => e.name);
		(l.length !== u.length || u.some((e) => !l.includes(e))) && o.push(Hc.sheets);
		for (let t of n.sheets) {
			let r = c?.[t.name];
			if (!r) continue;
			let l = i.call(e.SmartParse, "air", t.name, r, { allowAutoDetect: !1 }), u = Array.isArray(l) ? l : [];
			s[t.name] = u;
			let d = t.name;
			if (!u.length) {
				o.push(Hc.noRows(d));
				continue;
			}
			let f = new Map(t.values.map((e) => [ni[e.key], e])), p = u.map((e) => Uc(e.檢測項目));
			if (p.length !== f.size || new Set(p).size !== p.length || p.some((e) => !f.has(e))) {
				o.push(Hc.items(d));
				continue;
			}
			let m = Kc(t.window), h = /* @__PURE__ */ new Set();
			for (let r of u) {
				let i = f.get(Uc(r.檢測項目)), s = i.key;
				r._statKind !== "avg" && o.push(Hc.stat(d, s));
				let c = Ic(i.value);
				(c === null || Uc(r.比較關係) !== "" || Uc(r.檢測數值) !== c) && o.push(Hc.value(d, s)), (!i.method || Uc(r.檢測方法) !== a.call(e.SmartParse, i.method)) && o.push(Hc.method(d, s)), Uc(r["檢測濃度/質量單位"]) !== ri[s] && o.push(Hc.unit(d, s)), Uc(r.備註) !== "" && o.push(Hc.note(d, s)), (Uc(r["日期(起)"]) !== m.dateStart || Uc(r["時間(起)"]) !== m.timeStart || Uc(r["日期(迄)"]) !== m.dateEnd || Uc(r["時間(迄)"]) !== m.timeEnd) && h.add("date"), Uc(r.採樣地點).trim() !== t.location.trim() && h.add("site"), Uc(r.檢測機構許可證號) !== n.agency.code && h.add("agency"), Uc(r.檢測類別) !== "周界空氣品質" && h.add("category");
			}
			h.has("date") && o.push(Hc.date(d)), h.has("site") && o.push(Hc.site(d)), h.has("agency") && o.push(Hc.agency(d)), h.has("category") && o.push(Hc.category(d));
		}
	} catch {
		return {
			ok: !1,
			problems: [...o, Hc.crashed],
			rows: Object.keys(s).length ? s : null
		};
	}
	return o.length ? {
		ok: !1,
		problems: o,
		rows: s
	} : {
		ok: !0,
		rows: s,
		total: Object.values(s).reduce((e, t) => e + t.length, 0)
	};
}
//#endregion
//#region src/xdwread/submit.ts
var Jc = [
	"btnImport",
	"importFileInput",
	"btnImportStagedConfirm",
	"btnImportConfirm"
], U = {
	button: "送進匯入確認畫面",
	ready: "會先自我檢查（用原網站自己的解析程式試讀一次），相符才交給原網站的匯入確認畫面",
	why: {
		noLog: "還沒有讀值結果",
		noPass: "沒有任何通過核對或人工輸入確認的列，沒有東西可以送",
		busy: "送件中…",
		reading: "讀值進行中"
	},
	confirm: (e, t, n, r = 0) => {
		let i = [
			e > 0 ? `${e} 列沒有自動帶入` : "",
			r > 0 ? `${r} 列套用上一季寫法（不會放進 xlsx）` : "",
			t > 0 ? `${t} 頁整頁沒有讀成功` : "",
			n > 0 ? `${n} 頁沒送` : ""
		].filter(Boolean);
		return i.length ? `有 ${i.join("、")}，匯入後要手動補。要繼續嗎？` : null;
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
function Yc(e, t) {
	let n = wa(t.pages, Array.isArray(e.manual) ? e.manual : []);
	return t.totals.pass + n.ok - n.preset;
}
function Xc(e) {
	return e.reading ? U.why.reading : e.busy ? U.why.busy : !e.items || !e.items.length || e.items.some((e) => !e.log || !e.v) ? U.why.noLog : e.items.some((e) => Yc(e.log, e.v) > 0) ? null : U.why.noPass;
}
var Zc = (e) => e.pages.filter((e) => e.status === "manual" && e.rows.length === 0).length;
function Qc(e, t = []) {
	let n = wa(e.pages, Array.isArray(t) ? t : []), r = n.preset;
	return U.confirm(e.totals.manual - n.ok, Zc(e), e.totals.pagesSkipped, r);
}
function $c(e) {
	if (e.length === 1) return Qc(e[0].v, e[0].log.manual);
	let t = 0, n = 0, r = 0, i = 0;
	for (let { v: a, log: o } of e) {
		let e = wa(a.pages, Array.isArray(o.manual) ? o.manual : []);
		t += a.totals.manual - e.ok, n += Zc(a), r += a.totals.pagesSkipped, i += e.preset;
	}
	let a = U.confirm(t, n, r, i);
	return a === null ? null : `${e.length} 個檔裡${a}`;
}
function el(e) {
	return Jc.filter((t) => !e.getElementById(t));
}
var tl = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤", nl = (e) => !e || e.classList.contains("hidden"), rl = class extends Error {}, il = (e) => {
	try {
		return e.isCurrent();
	} catch {
		return !1;
	}
};
async function al(e, t) {
	let n = t.sleep ?? ((e) => new Promise((t) => setTimeout(t, e))), r = t.timeoutMs ?? 15e3;
	for (let i = 0; i <= r; i += 100) {
		if (!il(t)) throw new rl();
		try {
			if (e()) return !0;
		} catch {}
		await n(100);
	}
	if (!il(t)) throw new rl();
	try {
		return e();
	} catch {
		return !1;
	}
}
var ol = {
	file: (e, t) => `檔「${e}」：${t}`,
	preflightFile: (e) => `檔「${e}」：`,
	stagedCount: (e, t) => e > t ? `檔案沒有進到原網站的待匯入清單：原網站的待匯入清單裡不只這 ${t} 個檔，請關掉匯入視窗後再按一次` : `檔案沒有進到原網站的待匯入清單：清單裡少了這次的檔（${e}／${t}），請關掉匯入視窗後再按一次`,
	stagedName: "檔案沒有進到原網站的待匯入清單：清單裡的檔名和這次的 xlsx 對不上，請關掉匯入視窗後再按一次"
};
async function sl(e, t) {
	let n = e.length > 1, r = (e, t, n = []) => n.length ? {
		ok: !1,
		stage: e,
		messages: t,
		xlsx: n[0],
		xlsxList: n
	} : {
		ok: !1,
		stage: e,
		messages: t,
		xlsx: null
	}, i = Xc({
		items: e,
		busy: !1
	});
	if (i) return r("disabled", [i]);
	let a = $c(e);
	if (a !== null && !t.confirm(a)) return r("cancel", []);
	t.onStage?.(U.working);
	let o = [];
	for (let { v: t, log: i } of e) try {
		o.push(Ps(t, i));
	} catch (e) {
		return r("plan", [U.planFail(n ? ol.file(i.fileName, tl(e)) : tl(e))]);
	}
	let s = t.upstream(), c = s?.XLSX;
	if (!c || typeof c.write != "function" || !c.utils) return r("xlsx", [U.noXlsx]);
	let l = t.now(), u = [];
	for (let t = 0; t < e.length; t++) {
		if (o[t].total <= 0) continue;
		let i = Ls(e[t].log.fileName, l);
		try {
			u.push({
				i: t,
				x: {
					name: i,
					bytes: Fs(o[t], c)
				}
			});
		} catch (i) {
			return r("xlsx", [U.xlsxFail(n ? ol.file(e[t].log.fileName, tl(i)) : tl(i))], u.map((e) => e.x));
		}
	}
	let d = u.map((e) => e.x);
	if (!u.length) return r("disabled", [U.why.noPass]);
	let f = (e) => e.bytes.slice().buffer, p = /* @__PURE__ */ new Map(), m = [];
	for (let { i, x: a } of u) {
		let c = await Vc(s, {
			name: a.name,
			arrayBuffer: async () => f(a)
		}, o[i]);
		if (!il(t)) return t.clearPending(), r("cancel", []);
		c.ok ? p.set(i, c.rows) : n ? m.push(ol.preflightFile(e[i].log.fileName) + c.problems.join("；")) : m.push(...c.problems);
	}
	if (m.length) return r("preflight", [
		U.preflightHead,
		...m,
		U.fallback
	], d);
	let h = el(t.doc);
	if (h.length) return r("env", [U.missing(h), U.fallback], d);
	if (!t.waterReady()) return r("env", [U.notWater, U.fallback], d);
	if (!il(t)) return t.clearPending(), r("cancel", []);
	try {
		if (n) {
			let n = ss(e.map((e) => e.log), l.toISOString());
			t.download(new Blob([cs(n)], { type: "application/json" }), qs(e.length, l));
		} else t.download(new Blob([Ho(e[0].log)], { type: "application/json" }), Ks(e[0].log.fileName, l));
	} catch (e) {
		return r("log", [U.logFail(tl(e))], d);
	}
	t.onStage?.(U.sending);
	let g = d.map((e) => e.name), _ = g.join("、");
	t.setPending({ files: e.map((e, t) => {
		let n = u.find((e) => e.i === t);
		return {
			xdwFileName: e.log.fileName,
			fileName: n ? n.x.name : null,
			plan: o[t],
			preflightRows: n ? p.get(t) ?? {} : {}
		};
	}) });
	let v = t.doc, y = !1, b = () => {
		if (!il(t)) throw new rl();
	};
	try {
		b();
		let e = v.defaultView, r = e?.File ?? File, i = e?.DataTransfer ?? DataTransfer;
		if (v.getElementById("btnImport").click(), !await al(() => !nl(v.getElementById("importModal")), t)) throw Error(U.steps.modal);
		b();
		let a = v.getElementById("importFileInput");
		if (!a) throw Error(U.steps.staged);
		let o = new i();
		for (let e of d) o.items.add(new r([f(e)], e.name, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
		a.files = o.files, a.dispatchEvent(new Event("change", { bubbles: !0 }));
		let s = v.getElementById("btnImportStagedConfirm"), c = v.getElementById("importStagedList");
		if (!await al(() => !nl(s) && (!c || g.every((e) => (c.textContent ?? "").includes(e))), t)) throw Error(U.steps.staged);
		let l = c ? c.querySelectorAll(".staged-file-item") : null, u = l ? l.length : 0;
		if (n) {
			if (u !== d.length) throw Error(ol.stagedCount(u, d.length));
			let e = [...l ?? []].map((e) => (e.querySelector(".staged-file-name")?.textContent ?? "").replace(/^\s*📄\s*/u, "").trim());
			if (e.length !== g.length || e.some((e) => !g.includes(e)) || new Set(e).size !== e.length) throw Error(ol.stagedName);
		} else if (u !== 1) throw Error(U.steps.stagedNotOne(u));
		if (b(), s.click(), y = !0, !await al(() => {
			let e = t.importState(), n = v.getElementById("smartImportSummary");
			return !!e && e.label === _ && e.mode === "smart" && Array.isArray(e.rows) && !!n && (n.textContent ?? "") !== "";
		}, t)) throw Error(U.steps.preview);
	} catch (e) {
		return y || t.clearPending(), e instanceof rl ? r("cancel", []) : r("dom", [U.stepFail(tl(e)), U.fallback], d);
	}
	return il(t) ? (t.closeModal(), {
		ok: !0,
		fileName: _,
		plan: o[u[0].i],
		files: u.map((e) => ({
			fileName: e.x.name,
			plan: o[e.i]
		}))
	}) : r("cancel", []);
}
//#endregion
//#region src/xdwread/submit-air.ts
var cl = "你取消勾選，不送出", ll = {
	noPass: "沒有任何通過核對的值，沒有東西可以送",
	confirm: (e, t, n, r = 0) => {
		let i = [
			e > 0 ? `需人工 ${e} 個值` : "",
			t > 0 ? `${t} 頁整頁需人工` : "",
			n > 0 ? `${n} 頁沒送` : ""
		].filter(Boolean), a = r > 0 ? `你取消勾選 ${r} 頁（不送出）。` : "", o = i.length ? `${i.join("、")}，匯入後要手動補。` : "";
		return a || o ? `${a}${o}要繼續嗎？` : null;
	},
	notAir: "沒有送出：目前不在空品分頁或沒有選計畫（請先回到空品分頁、選好計畫再按一次）",
	notAirLog: "沒有送出：讀值紀錄不是空品的（內部檢查）"
}, ul = (e) => e.pages.filter((e) => e.status === "manual" && e.station === null).length;
function dl(e) {
	return e.reading ? U.why.reading : e.busy ? U.why.busy : !e.items || !e.items.length || e.items.some((e) => !e.log || !e.v) ? U.why.noLog : e.items.some((e) => e.v.totals.pass > 0) ? null : ll.noPass;
}
function fl(e) {
	let t = 0, n = 0, r = 0, i = 0;
	for (let { v: a, log: o } of e) {
		t += a.totals.manual, n += ul(a);
		let e = o.pages.filter((e) => e.mode === "skip" && e.reason === "你取消勾選，不送出").length;
		i += e, r += a.totals.pagesSkipped - e;
	}
	let a = ll.confirm(t, n, r, i);
	return a === null || e.length === 1 ? a : `${e.length} 個檔裡：${a}`;
}
var pl = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
async function ml(e, t) {
	let n = e.length > 1, r = (e, t, n = []) => n.length ? {
		ok: !1,
		stage: e,
		messages: t,
		xlsx: n[0],
		xlsxList: n
	} : {
		ok: !1,
		stage: e,
		messages: t,
		xlsx: null
	}, i = dl({
		items: e,
		busy: !1
	});
	if (i) return r("disabled", [i]);
	if (e.some((e) => Bo(e.log) !== "air" || e.log.manual.length !== 0)) return r("plan", [ll.notAirLog]);
	let a = fl(e);
	if (a !== null && !t.confirm(a)) return r("cancel", []);
	t.onStage?.(U.working);
	let o = [];
	for (let { v: t, log: i } of e) try {
		o.push(Mc(t, {
			fileName: i.fileName,
			agency: i.agency,
			period: i.period
		}));
	} catch (e) {
		return r("plan", [U.planFail(n ? ol.file(i.fileName, pl(e)) : pl(e))]);
	}
	let s = t.upstream(), c = s?.XLSX;
	if (!c || typeof c.write != "function" || !c.utils) return r("xlsx", [U.noXlsx]);
	let l = t.now(), u = [];
	for (let t = 0; t < e.length; t++) {
		if (o[t].total <= 0) continue;
		let i = Ls(e[t].log.fileName, l);
		try {
			u.push({
				i: t,
				x: {
					name: i,
					bytes: Nc(o[t], c)
				}
			});
		} catch (i) {
			return r("xlsx", [U.xlsxFail(n ? ol.file(e[t].log.fileName, pl(i)) : pl(i))], u.map((e) => e.x));
		}
	}
	let d = u.map((e) => e.x);
	if (!u.length) return r("disabled", [ll.noPass]);
	let f = (e) => e.bytes.slice().buffer, p = /* @__PURE__ */ new Map(), m = [];
	for (let { i, x: a } of u) {
		let c = await qc(s, {
			name: a.name,
			arrayBuffer: async () => f(a)
		}, o[i]);
		if (!il(t)) return t.clearPending(), r("cancel", []);
		c.ok ? p.set(i, c.rows) : n ? m.push(ol.preflightFile(e[i].log.fileName) + c.problems.join("；")) : m.push(...c.problems);
	}
	if (m.length) return r("preflight", [
		U.preflightHead,
		...m,
		U.fallback
	], d);
	let h = el(t.doc);
	if (h.length) return r("env", [U.missing(h), U.fallback], d);
	if (!t.airReady()) return r("env", [ll.notAir, U.fallback], d);
	if (!il(t)) return t.clearPending(), r("cancel", []);
	try {
		n ? t.download(new Blob([cs(ss(e.map((e) => e.log), l.toISOString()))], { type: "application/json" }), qs(e.length, l)) : t.download(new Blob([Ho(e[0].log)], { type: "application/json" }), Ks(e[0].log.fileName, l));
	} catch (e) {
		return r("log", [U.logFail(pl(e))], d);
	}
	t.onStage?.(U.sending);
	let g = d.map((e) => e.name), _ = g.join("、");
	t.setPending({
		air: !0,
		files: e.map((e, t) => {
			let n = u.find((e) => e.i === t);
			return {
				xdwFileName: e.log.fileName,
				fileName: n ? n.x.name : null,
				plan: o[t],
				preflightRows: n ? p.get(t) ?? {} : {},
				noData: e.v.pages.filter((e) => e.status === "nodata").map((e) => e.page)
			};
		})
	});
	let v = t.doc, y = !1, b = () => {
		if (!il(t)) throw new rl();
	};
	try {
		b();
		let e = v.defaultView, r = e?.File ?? File, i = e?.DataTransfer ?? DataTransfer;
		if (v.getElementById("btnImport").click(), !await al(() => !nl(v.getElementById("importModal")), t)) throw Error(U.steps.modal);
		b();
		let a = v.getElementById("importFileInput");
		if (!a) throw Error(U.steps.staged);
		let o = new i();
		for (let e of d) o.items.add(new r([f(e)], e.name, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
		a.files = o.files, a.dispatchEvent(new Event("change", { bubbles: !0 }));
		let s = v.getElementById("btnImportStagedConfirm"), c = v.getElementById("importStagedList");
		if (!await al(() => !nl(s) && (!c || g.every((e) => (c.textContent ?? "").includes(e))), t)) throw Error(U.steps.staged);
		let l = c ? c.querySelectorAll(".staged-file-item") : null, u = l ? l.length : 0;
		if (n) {
			if (u !== d.length) throw Error(ol.stagedCount(u, d.length));
			let e = [...l ?? []].map((e) => (e.querySelector(".staged-file-name")?.textContent ?? "").replace(/^\s*📄\s*/u, "").trim());
			if (e.length !== g.length || e.some((e) => !g.includes(e)) || new Set(e).size !== e.length) throw Error(ol.stagedName);
		} else if (u !== 1) throw Error(U.steps.stagedNotOne(u));
		if (b(), s.click(), y = !0, !await al(() => {
			let e = t.importState(), n = v.getElementById("smartImportSummary");
			return !!e && e.label === _ && e.mode === "smart" && Array.isArray(e.rows) && !!n && (n.textContent ?? "") !== "";
		}, t)) throw Error(U.steps.preview);
	} catch (e) {
		return y || t.clearPending(), e instanceof rl ? r("cancel", []) : r("dom", [U.stepFail(pl(e)), U.fallback], d);
	}
	return il(t) ? (t.closeModal(), {
		ok: !0,
		fileName: _,
		plans: o
	}) : r("cancel", []);
}
//#endregion
//#region src/xdwread/submit-noise.ts
var hl = {
	noPass: ll.noPass,
	confirm: ll.confirm,
	notNoise: "沒有送出：目前不在噪音分頁或沒有選計畫（請先回到噪音分頁、選好計畫再按一次）",
	notNoiseLog: "沒有送出：讀值紀錄不是噪音振動的（內部檢查）"
}, gl = (e) => e.pages.filter((e) => e.status === "manual" && e.station === null).length;
function _l(e) {
	return e.reading ? U.why.reading : e.busy ? U.why.busy : !e.items || !e.items.length || e.items.some((e) => !e.log || !e.v) ? U.why.noLog : e.items.some((e) => e.v.totals.pass > 0) ? null : hl.noPass;
}
function vl(e) {
	let t = 0, n = 0, r = 0, i = 0;
	for (let { v: a, log: o } of e) {
		t += a.totals.manual, n += gl(a);
		let e = o.pages.filter((e) => e.mode === "skip" && e.reason === "你取消勾選，不送出").length;
		i += e, r += a.totals.pagesSkipped - e;
	}
	let a = hl.confirm(t, n, r, i);
	return a === null || e.length === 1 ? a : `${e.length} 個檔裡：${a}`;
}
var yl = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
async function bl(e, t) {
	let n = e.length > 1, r = (e, t, n = []) => n.length ? {
		ok: !1,
		stage: e,
		messages: t,
		xlsx: n[0],
		xlsxList: n
	} : {
		ok: !1,
		stage: e,
		messages: t,
		xlsx: null
	}, i = _l({
		items: e,
		busy: !1
	});
	if (i) return r("disabled", [i]);
	if (e.some((e) => Bo(e.log) !== "noise" || e.log.manual.length !== 0)) return r("plan", [hl.notNoiseLog]);
	let a = vl(e);
	if (a !== null && !t.confirm(a)) return r("cancel", []);
	t.onStage?.(U.working);
	let o = [];
	for (let { v: t, log: i } of e) try {
		o.push(gc(t, {
			fileName: i.fileName,
			agency: i.agency,
			period: i.period
		}));
	} catch (e) {
		return r("plan", [U.planFail(n ? ol.file(i.fileName, yl(e)) : yl(e))]);
	}
	let s = t.upstream(), c = s?.XLSX;
	if (!c || typeof c.write != "function" || !c.utils) return r("xlsx", [U.noXlsx]);
	let l = t.now(), u = [];
	for (let t = 0; t < e.length; t++) {
		if (o[t].total <= 0) continue;
		let i = Ls(e[t].log.fileName, l);
		try {
			u.push({
				i: t,
				x: {
					name: i,
					bytes: _c(o[t], c)
				}
			});
		} catch (i) {
			return r("xlsx", [U.xlsxFail(n ? ol.file(e[t].log.fileName, yl(i)) : yl(i))], u.map((e) => e.x));
		}
	}
	let d = u.map((e) => e.x);
	if (!u.length) return r("disabled", [hl.noPass]);
	let f = (e) => e.bytes.slice().buffer, p = /* @__PURE__ */ new Map(), m = [];
	for (let { i, x: a } of u) {
		let c = await Cc(s, {
			name: a.name,
			arrayBuffer: async () => f(a)
		}, o[i]);
		if (!il(t)) return t.clearPending(), r("cancel", []);
		c.ok ? p.set(i, c.rows) : n ? m.push(ol.preflightFile(e[i].log.fileName) + c.problems.join("；")) : m.push(...c.problems);
	}
	if (m.length) return r("preflight", [
		U.preflightHead,
		...m,
		U.fallback
	], d);
	let h = el(t.doc);
	if (h.length) return r("env", [U.missing(h), U.fallback], d);
	if (!t.noiseReady()) return r("env", [hl.notNoise, U.fallback], d);
	if (!il(t)) return t.clearPending(), r("cancel", []);
	try {
		n ? t.download(new Blob([cs(ss(e.map((e) => e.log), l.toISOString()))], { type: "application/json" }), qs(e.length, l)) : t.download(new Blob([Ho(e[0].log)], { type: "application/json" }), Ks(e[0].log.fileName, l));
	} catch (e) {
		return r("log", [U.logFail(yl(e))], d);
	}
	t.onStage?.(U.sending);
	let g = d.map((e) => e.name), _ = g.join("、");
	t.setPending({
		noise: !0,
		files: e.map((e, t) => {
			let n = u.find((e) => e.i === t);
			return {
				xdwFileName: e.log.fileName,
				fileName: n ? n.x.name : null,
				plan: o[t],
				preflightRows: n ? p.get(t) ?? {} : {},
				noData: e.v.pages.filter((e) => e.status === "nodata").map((e) => e.page),
				zones: e.v.stations.map((e) => ({
					location: e.location,
					zone: e.zone
				}))
			};
		})
	});
	let v = t.doc, y = !1, b = () => {
		if (!il(t)) throw new rl();
	};
	try {
		b();
		let e = v.defaultView, r = e?.File ?? File, i = e?.DataTransfer ?? DataTransfer;
		if (v.getElementById("btnImport").click(), !await al(() => !nl(v.getElementById("importModal")), t)) throw Error(U.steps.modal);
		b();
		let a = v.getElementById("importFileInput");
		if (!a) throw Error(U.steps.staged);
		let o = new i();
		for (let e of d) o.items.add(new r([f(e)], e.name, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
		a.files = o.files, a.dispatchEvent(new Event("change", { bubbles: !0 }));
		let s = v.getElementById("btnImportStagedConfirm"), c = v.getElementById("importStagedList");
		if (!await al(() => !nl(s) && (!c || g.every((e) => (c.textContent ?? "").includes(e))), t)) throw Error(U.steps.staged);
		let l = c ? c.querySelectorAll(".staged-file-item") : null, u = l ? l.length : 0;
		if (n) {
			if (u !== d.length) throw Error(ol.stagedCount(u, d.length));
			let e = [...l ?? []].map((e) => (e.querySelector(".staged-file-name")?.textContent ?? "").replace(/^\s*📄\s*/u, "").trim());
			if (e.length !== g.length || e.some((e) => !g.includes(e)) || new Set(e).size !== e.length) throw Error(ol.stagedName);
		} else if (u !== 1) throw Error(U.steps.stagedNotOne(u));
		if (b(), s.click(), y = !0, !await al(() => {
			let e = t.importState(), n = v.getElementById("smartImportSummary");
			return !!e && e.label === _ && e.mode === "smart" && Array.isArray(e.rows) && !!n && (n.textContent ?? "") !== "";
		}, t)) throw Error(U.steps.preview);
	} catch (e) {
		return y || t.clearPending(), e instanceof rl ? r("cancel", []) : r("dom", [U.stepFail(yl(e)), U.fallback], d);
	}
	return il(t) ? (t.closeModal(), {
		ok: !0,
		fileName: _,
		plans: o
	}) : r("cancel", []);
}
//#endregion
//#region src/xdwread/results-air.ts
var W = {
	counts: (e, t, n, r, i) => `通過 ${e}／需人工 ${t}／${n > 0 ? `整頁需人工 ${n} 頁／` : ""}${r > 0 ? `沒有資料 ${r} 頁／` : ""}沒送 ${i} 頁`,
	allPass: (e, t, n) => `${e} 站（第 ${t.join("、")} 頁）共 ${n} 個值全部通過`,
	noAttn: "沒有需要注意的站或頁。",
	noData: (e) => `沒有資料的頁（封面、目錄、聲明書等；不算需人工）：第 ${e.join("、")} 頁`,
	noLayout: "這個檔沒有任何一頁認得出空品版型（可能選錯分頁或選錯檔），不會帶入任何值。",
	noManual: "空品不提供在這個視窗人工輸入：需人工的值請匯入後到原網站表格手動補（確認畫面的提醒區會逐項列出）。",
	station: (e, t) => `測站 ${t}（現場編號 ${e}）`,
	stationPages: (e) => [
		"L1",
		"L3",
		"L4",
		"L2"
	].filter((t) => e[t] !== void 0).map((t) => `${xl[t]} 第 ${e[t]} 頁`).join("、"),
	stationOk: (e, t) => `站層級檢查通過；${e}／${t} 個值通過`,
	stationManual: "全站需人工：",
	hiddenPass: (e) => `其他 ${e} 個值通過（按「顯示全部」可看）`,
	page: (e) => `第 ${e} 頁`,
	layout: (e) => e ? xl[e] : "版型不明",
	pageOk: "頁層級檢查通過",
	pageManual: "整頁需人工輸入：",
	pageSkip: "沒送：",
	pageNoData: "沒有資料（不是空品版型，不算需人工）",
	cols: [
		"項目",
		"來源頁",
		"A 值",
		"B 值",
		"狀態",
		"交叉檢查",
		"原因"
	],
	pageCols: [
		"頁",
		"版型",
		"狀態",
		"原因"
	],
	cross: {
		pass: "一致",
		mismatch: "不一致",
		unavailable: "無法檢查",
		none: "（沒有對照）"
	},
	showAll: (e) => `顯示全部 ${e} 個值與每一頁`,
	ids: {
		code: "現場編號",
		loc: "測站",
		period: "日期/時間",
		report: "報告編號"
	}
}, xl = {
	L1: "空品總表",
	L2: "PM2.5 總表",
	L3: "逐時(1/2)",
	L4: "逐時(2/2)"
}, Sl = (e) => W.counts(e.totals.pass, e.totals.manual, e.totals.pagesManual, e.totals.pagesNoData, e.totals.pagesSkipped);
function Cl(e) {
	let t = {
		pass: 0,
		manual: 0,
		pagesManual: 0,
		pagesNoData: 0,
		pagesSkipped: 0
	};
	for (let n of e) for (let e of Object.keys(t)) t[e] += n.totals[e];
	return z.batch(e.length, W.counts(t.pass, t.manual, t.pagesManual, t.pagesNoData, t.pagesSkipped));
}
function wl(e) {
	let t = {
		allPassStations: [],
		allPassPages: [],
		allPassValues: 0,
		stations: [],
		pages: [],
		noData: [],
		anyLayout: e.pages.some((e) => e.layout !== null),
		total: 0
	};
	e.stations.forEach((e, n) => {
		t.total += e.values.length;
		let r = e.values.filter((e) => e.status !== "pass");
		e.status === "ok" && r.length === 0 ? (t.allPassStations.push(n), t.allPassPages.push(...Object.values(e.pages).filter((e) => e !== void 0)), t.allPassValues += e.values.length) : t.stations.push({
			index: n,
			st: e,
			manual: r,
			pass: e.values.length - r.length
		});
	}), t.allPassPages.sort((e, t) => e - t);
	for (let n of [...e.pages].sort((e, t) => e.page - t.page)) n.status === "nodata" ? t.noData.push(n.page) : (n.status === "skip" || n.status === "manual" && n.station === null) && t.pages.push(n);
	return t;
}
function Tl(e, t, n) {
	let r = Yr.find((e) => e.key === n), i = t.pages[r.layout];
	if (i === void 0) return null;
	let a = e.pages.find((e) => e.page === i)?.cells.find((e) => e.layout === r.layout && e.name === r.name);
	return a ? {
		a: a.a,
		b: a.b
	} : null;
}
function G(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var El = (e) => e == null || e === "" ? z.empty : e;
function Dl(e, t) {
	if (e.identity && e.status === "ok") return {
		code: e.identity.siteCode,
		loc: e.identity.location,
		period: e.identity.periodKey
	};
	let n = e.mode === "skip" ? null : qo(t.calls, e.page, "A"), r = (e) => {
		if (!n || !n.ok) return z.notRead;
		let t = n.reply[e].value;
		return t === null || t.trim() === "" ? z.notRead : `${t}${z.unconfirmed}`;
	};
	return {
		code: r("site_code"),
		loc: r("location"),
		period: r("period")
	};
}
function Ol(e, t) {
	let n = t.length > 1, r = G(e, "div", "edc-res edc-res-air");
	r.id = "edcReadResults";
	let i = G(e, "div", "edc-res-counts", n ? Cl(t.map((e) => e.v)) : Sl(t[0].v));
	i.id = "edcReadCounts";
	let a = G(e, "div", "edc-res-attn");
	a.id = "edcReadAttn";
	let o = G(e, "div", "edc-res-all");
	o.id = "edcReadAllRows", o.hidden = !0;
	let s = 0;
	t.forEach((t, r) => {
		let i = (e) => (n && (e.dataset.file = String(r)), e), c = wl(t.v);
		s += c.total;
		let f = [], p = [];
		if (!c.anyLayout) {
			let t = i(G(e, "div", "edc-xdw-red edc-air-nolayout", W.noLayout));
			n || (t.id = "edcAirNoLayout"), f.push(t);
		}
		if (c.allPassStations.length) {
			let t = i(G(e, "div", "edc-res-allpass", W.allPass(c.allPassStations.length, c.allPassPages, c.allPassValues)));
			n || (t.id = "edcReadAllPass"), f.push(t);
		}
		for (let e of c.stations) f.push(l(t, r, e.index, e.st, e.manual, e.pass, !1));
		for (let e of c.pages) f.push(u(t, r, e));
		if (c.noData.length) {
			let t = i(G(e, "div", "edc-air-nodata", W.noData(c.noData)));
			n || (t.id = "edcReadNoData"), f.push(t);
		}
		if (!c.stations.length && !c.pages.length && c.anyLayout && f.push(G(e, "div", "edc-res-noattn", W.noAttn)), t.v.totals.manual > 0 || t.v.totals.pagesManual > 0) {
			let t = i(G(e, "div", "edc-air-nomanual", W.noManual));
			n || (t.id = "edcAirNoManual"), f.push(t);
		}
		if (t.v.stations.forEach((e, n) => p.push(l(t, r, n, e, e.values, 0, !0))), p.push(d(t, r)), n) {
			let n = () => {
				let n = G(e, "div", "edc-res-file-title", z.fileTitle(r + 1, t.log.fileName));
				return n.dataset.file = String(r), n;
			}, i = G(e, "div", "edc-res-file");
			i.dataset.file = String(r);
			let s = G(e, "div", "edc-res-counts edc-res-file-counts", Sl(t.v));
			s.dataset.file = String(r), i.append(n(), s, ...f), a.append(i);
			let c = G(e, "div", "edc-res-file");
			c.dataset.file = String(r), c.append(n(), ...p), o.append(c);
		} else a.append(...f), o.append(...p);
	});
	let c = G(e, "button", "edc-xdw-btn edc-res-showall", W.showAll(s));
	c.type = "button", c.id = "edcReadShowAll", c.setAttribute("aria-expanded", "false"), c.setAttribute("aria-controls", "edcReadAllRows"), c.addEventListener("click", () => {
		try {
			o.hidden = !o.hidden, c.setAttribute("aria-expanded", String(!o.hidden)), c.textContent = o.hidden ? W.showAll(s) : z.hideAll;
		} catch {}
	}), r.append(i, a, c, o);
	function l(t, r, i, a, o, s, c) {
		let l = G(e, "section", c ? "edc-air-station edc-air-station-full" : "edc-air-station");
		l.dataset.station = String(i), l.dataset.status = a.status, n && (l.dataset.file = String(r));
		let u = G(e, "div", "edc-air-station-head");
		u.append(G(e, "strong", void 0, W.station(a.siteCode, a.location)), G(e, "span", "edc-air-station-pages", `（${W.stationPages(a.pages)}）`)), l.append(u);
		let d = a.values.filter((e) => e.status === "pass").length;
		l.append(a.status === "ok" ? G(e, "div", "edc-res-page-status", W.stationOk(d, a.values.length)) : G(e, "div", "edc-res-page-status edc-xdw-red", W.stationManual + a.reasons.join("；")));
		let f = G(e, "table", "edc-res-table edc-air-table"), p = G(e, "tr");
		for (let t of W.cols) p.append(G(e, "th", void 0, t));
		f.append(p);
		for (let i of o) {
			let o = G(e, "tr", c ? "edc-air-row" : "edc-air-arow");
			o.dataset.key = i.key, o.dataset.status = i.status, i.page !== null && (o.dataset.page = String(i.page)), n && (o.dataset.file = String(r));
			let s = Tl(t.v, a, i.key);
			o.append(G(e, "td", void 0, i.key), G(e, "td", void 0, i.page === null ? z.none : String(i.page)), G(e, "td", void 0, El(s?.a)), G(e, "td", void 0, El(s?.b)), G(e, "td", i.status === "pass" ? "edc-res-pass" : "edc-res-manual", i.status === "pass" ? z.pass : z.manual), G(e, "td", void 0, W.cross[i.cross]), G(e, "td", void 0, i.reasons.join("；"))), f.append(o);
		}
		return l.append(f), s > 0 && l.append(G(e, "div", "edc-res-hiddenpass", W.hiddenPass(s))), l;
	}
	function u(t, r, i) {
		let a = G(e, "section", "edc-air-page");
		a.dataset.page = String(i.page), a.dataset.status = i.status, n && (a.dataset.file = String(r));
		let o = G(e, "div", "edc-air-page-head");
		if (o.append(G(e, "strong", void 0, W.page(i.page)), G(e, "span", void 0, ` ${W.layout(i.layout)}`)), a.append(o), a.append(G(e, "div", "edc-res-page-status edc-xdw-red", (i.status === "skip" ? W.pageSkip : W.pageManual) + i.reasons.join("；"))), i.status !== "skip") {
			let n = Dl(i, t.log), r = G(e, "ul", "edc-res-identity");
			r.append(G(e, "li", void 0, `${W.ids.code}：${n.code}`), G(e, "li", void 0, `${W.ids.loc}：${n.loc}`), G(e, "li", void 0, `${W.ids.period}：${n.period}`)), a.append(r);
		}
		return a;
	}
	function d(t, r) {
		let i = G(e, "table", "edc-res-table edc-air-pages"), a = G(e, "tr");
		for (let t of W.pageCols) a.append(G(e, "th", void 0, t));
		i.append(a);
		for (let a of [...t.v.pages].sort((e, t) => e.page - t.page)) {
			let t = G(e, "tr", "edc-air-prow");
			t.dataset.page = String(a.page), t.dataset.status = a.status, n && (t.dataset.file = String(r));
			let o = a.status === "ok" ? W.pageOk : a.status === "nodata" ? W.pageNoData : a.status === "skip" ? W.pageSkip.replace("：", "") : W.pageManual.replace("：", "");
			t.append(G(e, "td", void 0, String(a.page)), G(e, "td", void 0, W.layout(a.layout)), G(e, "td", void 0, o), G(e, "td", void 0, a.status === "ok" || a.status === "nodata" ? "" : a.reasons.join("；"))), i.append(t);
		}
		return i;
	}
	return {
		element: r,
		dispose: () => {}
	};
}
//#endregion
//#region src/xdwread/notice-air.ts
var kl = {
	title: (e, t, n) => `🟣 Claude 版 XDW 讀值（空品）：帶入 ${e} 筆（${t}／${n}）`,
	titleMulti: (e, t) => `🟣 Claude 版 XDW 讀值（空品）：帶入 ${e} 筆（${t.length} 個檔：${t.join("、")}）`,
	titleNote: "這些值由兩個模型各讀一次、兩次完全相同、而且和逐時表的交叉檢查一致才帶入；寫法轉換（去尾 0、單位與方法代碼、日期時間）由原網站的程式處理。請對照報告核對。（這段提醒只在網頁上，不會寫進匯出檔。）",
	fileHead: (e, t, n, r) => `檔 ${e}：${t}／${n}（帶入 ${r} 筆）`,
	fileNoRows: (e, t) => `檔 ${e}：${t} 沒有可帶入的值（沒有產生 xlsx，這個檔沒有交給原網站）`,
	excludedHead: (e, t) => `⚠️ 沒有帶入、要手動補：${[e ? `${e} 個值` : "", t ? `${t} 頁整頁` : ""].filter(Boolean).join("、")}`,
	excludedValue: (e, t, n, r) => `・${e === null ? "（沒有來源頁）" : `第 ${e} 頁`}｜${t}｜${n}｜${r}`,
	excludedPage: (e, t) => `・${e === null ? "（沒有頁碼）" : `第 ${e} 頁`}（整頁）｜${t}`,
	noData: (e) => `沒有資料的頁（封面、目錄、聲明書等；沒有帶入、不算需人工）：第 ${e.join("、")} 頁`,
	carriedHead: "原網站自己帶入的格（不是這次讀到的）",
	rowDiffHead: "⚠️ 下列格子和送進去的不一樣，請逐格核對",
	rowDiff: (e, t, n, r) => `・工作表 ${e}｜${t}｜${n}｜現在的值：${r}`,
	carried: (e, t, n, r) => `・${e}｜${t}｜${n}｜${r} 站——不是這次讀到的，是原網站從上一季帶入`,
	noCarried: "原網站沒有從上一季帶入任何格。",
	cannot: "無法確認原網站有沒有從上一季帶入內容，請逐欄核對",
	empty: "（空白）",
	fixed: {
		nox: "XDW 有 NOx、NO，依上一季習慣沒有帶入。",
		dateEnd: "日期(迄)／時間(迄) 是原網站的寫法：時間窗結束減 1 分（例如隔天 09:59）；上一季申報檔寫成同一天，請依申報規則確認。",
		mdl: "檢測極限沒有讀、沒有帶入（送出時留空）；若現在有值，是原網站從上一季帶入的（見上方）。",
		unit: "PM10、TSP、PM2.5 的單位是原網站預設的 127；上一季申報是 140，請依申報規則確認。",
		category: "檢測類別是原網站固定的「周界空氣品質」；上一季申報是「大氣環境」，請依申報規則確認。",
		missing: "臭氣、硫化氫、氨氣不在這份 XDW，仍要手動補。",
		pm25dup: "「PM2.5.5 氣象 data.xdw」與 A 檔的 PM2.5 頁相同，不要兩個都匯入。",
		cross: "總表和逐時表的交叉檢查不一致、或無法檢查（逐時表那一頁沒有通過核對）的值，一律沒有帶入（已列在上方「沒有帶入」）。"
	}
}, Al = [
	"nox",
	"dateEnd",
	"mdl",
	"unit",
	"category",
	"missing",
	"pm25dup",
	"cross"
], jl = (e) => !!e && typeof e == "object" && e.air === !0, Ml = (e) => e.files.filter((e) => e.fileName !== null).map((e) => e.fileName).join("、"), Nl = (e) => e == null ? "" : String(e), Pl = (e) => e === "" ? kl.empty : e;
function Fl(e, t) {
	if (t.length !== e.plan.total || t.some((e) => !e || typeof e != "object" || Nl(e._sourceSheet) === "")) return null;
	let n = /* @__PURE__ */ new Set(), r = [], i = /* @__PURE__ */ new Map();
	for (let a of e.plan.sheets) {
		let o = e.preflightRows[a.name];
		if (!Array.isArray(o) || o.length !== a.values.length) return null;
		for (let e of o) {
			let o = Nl(e.檢測項目), s = t.filter((e) => Nl(e._sourceSheet) === a.name && Nl(e.檢測項目) === o);
			if (s.length !== 1 || n.has(s[0])) return null;
			n.add(s[0]);
			let c = s[0];
			for (let t of [.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(c)])].filter((e) => !e.startsWith("_"))) {
				let n = Nl(e[t]), s = Nl(c[t]);
				if (n !== s) if (n === "" && s !== "") {
					let e = `${t}\u0000${o}\u0000${s}`, n = i.get(e);
					n ? n.n++ : i.set(e, {
						field: t,
						item: o,
						value: s,
						n: 1
					});
				} else r.push(kl.rowDiff(a.name, o, t, Pl(s)));
			}
		}
	}
	return n.size === t.length ? {
		rowDiffs: r,
		carried: [...i.values()].map((e) => kl.carried(e.field, e.item, e.value, e.n))
	} : null;
}
function Il(e) {
	let t = new Set(e.noData), n = e.plan.excluded.filter((e) => !(e.key === null && e.page !== null && t.has(e.page))), r = n.filter((e) => e.key !== null), i = n.filter((e) => e.key === null), a = [...r.map((e) => kl.excludedValue(e.page, e.location, e.key, e.reason)), ...i.map((e) => kl.excludedPage(e.page, e.reason))];
	return {
		excludedHead: a.length ? kl.excludedHead(r.length, i.length) : null,
		excluded: a,
		noData: e.noData.length ? kl.noData(e.noData) : null
	};
}
function Ll(e, t) {
	let n = e.files, r = n.length > 1, i = n.filter((e) => e.fileName !== null), a = i.reduce((e, t) => e + t.plan.total, 0), o = Array.isArray(t) ? t : null, s = new Set(i.map((e) => e.fileName)), c = !!o && o.length === a && o.every((e) => !!e && typeof e == "object" && (!r || s.has(Nl(e._sourceFile)))), l = n.map((e, t) => {
		let n = Il(e);
		if (e.fileName === null) return {
			head: kl.fileNoRows(t + 1, e.xdwFileName),
			noRows: !0,
			...n,
			cannotCompare: !1,
			rowDiffs: [],
			carried: []
		};
		let i = null;
		if (c) try {
			i = Fl(e, r ? o.filter((t) => Nl(t._sourceFile) === e.fileName) : o);
		} catch {
			i = null;
		}
		return {
			head: r ? kl.fileHead(t + 1, e.xdwFileName, e.fileName, e.plan.total) : null,
			noRows: !1,
			...n,
			cannotCompare: i === null,
			rowDiffs: i?.rowDiffs ?? [],
			carried: i?.carried ?? []
		};
	});
	return {
		title: r ? kl.titleMulti(a, n.map((e) => e.xdwFileName)) : kl.title(a, n[0].xdwFileName, n[0].fileName ?? ""),
		files: l,
		multi: r,
		fixed: Al.map((e) => ({
			key: e,
			text: kl.fixed[e]
		}))
	};
}
function Rl(e, t, n) {
	let r = (t, n, r) => {
		let i = e.createElement(t);
		return n != null && (i.textContent = n), r && (i.style.cssText = r), i;
	}, i = "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b", a = r("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #6a4c9c;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	a.id = n, a.dataset.edcForm = "air";
	let o = r("div", t.title, "font-weight:700;font-size:15px;color:#4b3172");
	o.dataset.edc = "title", a.append(o, r("div", kl.titleNote, "margin:2px 0 6px")), t.files.forEach((e, n) => {
		let o = a;
		if (t.multi) {
			o = r("div", null, "margin-top:10px;padding-top:6px;border-top:1px dashed #b9a7d6"), o.dataset.edc = "file", o.dataset.file = String(n + 1);
			let t = r("div", e.head, e.noRows ? "font-weight:700;color:#8a1f1b" : "font-weight:700;color:#4b3172");
			t.dataset.edc = e.noRows ? "file-norows" : "file-head", o.append(t), a.append(o);
		}
		if (e.excludedHead) {
			let t = r("div", null, i);
			t.dataset.edc = "excluded", t.append(r("div", e.excludedHead, "font-weight:700"), ...e.excluded.map((e) => r("div", e))), o.append(t);
		}
		if (e.noData) {
			let t = r("div", e.noData, "margin-top:6px");
			t.dataset.edc = "nodata", o.append(t);
		}
		if (e.noRows) return;
		let s = r("div", null, "margin-top:8px");
		if (s.dataset.edc = "carried", s.append(r("div", kl.carriedHead, "font-weight:700")), e.cannotCompare) {
			let e = r("div", kl.cannot, "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b;font-weight:700");
			e.dataset.edc = "cannot", s.append(e);
		} else {
			if (e.rowDiffs.length) {
				let t = r("div", null, i);
				t.dataset.edc = "row-diffs", t.append(r("div", kl.rowDiffHead, "font-weight:700"), ...e.rowDiffs.map((e) => r("div", e))), s.append(t);
			}
			for (let t of e.carried) {
				let e = r("div", t);
				e.dataset.edc = "grouped", s.append(e);
			}
			!e.rowDiffs.length && !e.carried.length && s.append(r("div", kl.noCarried));
		}
		o.append(s);
	});
	let s = r("div", null, "margin-top:8px");
	for (let e of t.fixed) {
		let t = r("div", `・${e.text}`);
		t.dataset.edc = `air-${e.key}`, s.append(t);
	}
	return a.append(s), a;
}
//#endregion
//#region src/xdwread/notice-noise.ts
var K = {
	title: (e, t, n) => `🟣 Claude 版 XDW 讀值（噪音振動）：帶入 ${e} 筆（${t}／${n}）`,
	titleMulti: (e, t) => `🟣 Claude 版 XDW 讀值（噪音振動）：帶入 ${e} 筆（${t.length} 個檔：${t.join("、")}）`,
	titleNote: "這些值由兩個模型各讀一次、兩次完全相同、而且噪音值和噪音總表的值一致才帶入；寫法轉換（去尾 0、單位與方法代碼、日期時間）由原網站的程式處理。請對照報告核對。（這段提醒只在網頁上，不會寫進匯出檔。）",
	fileHead: (e, t, n, r) => `檔 ${e}：${t}／${n}（帶入 ${r} 筆）`,
	fileNoRows: (e, t) => `檔 ${e}：${t} 沒有可帶入的值（沒有產生 xlsx，這個檔沒有交給原網站）`,
	excludedHead: (e, t) => `⚠️ 沒有帶入、要手動補：${[e ? `${e} 個值` : "", t ? `${t} 頁整頁` : ""].filter(Boolean).join("、")}`,
	excludedValue: (e, t, n, r) => `・${e === null ? "（沒有來源頁）" : `第 ${e} 頁`}｜${t}｜${n}｜${r}`,
	excludedPage: (e, t) => `・${e === null ? "（沒有頁碼）" : `第 ${e} 頁`}（整頁）｜${t}`,
	noData: (e) => `沒有資料的頁（封面、目錄、聲明書等；沒有帶入、不算需人工）：第 ${e.join("、")} 頁`,
	zoneHead: "管制區：外掛不自動帶入（原網站不讀報告上的管制區），請在確認畫面逐站選管制區。報告印的類別：",
	zone: (e, t) => t === null ? `・${e}：噪音總表的管制區沒有通過核對（讀不出或不是兩種已知寫法），請照報告選` : `・${e}：${Aa[t]}（報告原文「${ka[t]}」）`,
	carriedHead: "原網站自己帶入的格（不是這次讀到的）",
	rowDiffHead: "⚠️ 下列格子和送進去的不一樣，請逐格核對",
	rowDiff: (e, t, n, r) => `・工作表 ${e}｜${t}｜${n}｜現在的值：${r}`,
	carried: (e, t, n, r) => `・${e}｜${t}｜${n}｜${r} 列——不是這次讀到的，是原網站從上一季帶入`,
	noCarried: "原網站沒有從上一季帶入任何格。",
	cannot: "無法確認原網站有沒有從上一季帶入內容，請逐欄核對",
	empty: "（空白）",
	fixed: {
		vibTime: "振動的日夜時段照報告：日間 05~19、夜間 19~05（上一季華光報告是 07~21／21~07），沒有換算。",
		vib30: "振動 30.0 是偵測極限出具（報告註 2：低於 30 dB 以 30 dB 出具），照報告帶入、沒有加「<」。",
		vibMethod: "振動的監測方法 NIEA P204 是原網站的預設值，不是報告印的（外掛沒有寫振動方法）。",
		notCarried: "Ld、Ln、Ldn、Leq24、Lv10eq(24) 與逐時數值沒有帶入。",
		coords: "這份 XDW 沒有座標，外掛不帶座標：請照上一季的測站設定或手動補。",
		agency: "檢測機構是你在讀值視窗選的（報告上的機構名稱外掛不讀），請確認。",
		missing: "營建噪音（BN）與低頻噪音不在這份 XDW，仍走原本的 Excel 匯入。",
		cross: "噪音逐時表的 L日／L晚／L夜 和噪音總表不一致、或無法檢查（總表那一頁沒有通過核對）的值，一律沒有帶入（已列在上方「沒有帶入」）。"
	}
}, zl = [
	"vibTime",
	"vib30",
	"vibMethod",
	"notCarried",
	"coords",
	"agency",
	"missing",
	"cross"
], Bl = (e) => !!e && typeof e == "object" && e.noise === !0, Vl = (e) => e.files.filter((e) => e.fileName !== null).map((e) => e.fileName).join("、"), Hl = (e) => e == null ? "" : String(e), Ul = (e) => e === "" ? K.empty : e, Wl = (e) => `${Hl(e.檢測類別)}・${Hl(e.監測時段)}`;
function Gl(e, t) {
	if (t.length !== e.plan.total || t.some((e) => !e || typeof e != "object" || Hl(e._sourceSheet) === "")) return null;
	let n = /* @__PURE__ */ new Set(), r = [], i = /* @__PURE__ */ new Map();
	for (let a of e.plan.sheets) {
		let o = e.preflightRows[a.name];
		if (!Array.isArray(o) || o.length !== a.values.length) return null;
		for (let e of o) {
			let o = Wl(e), s = t.filter((e) => Hl(e._sourceSheet) === a.name && Wl(e) === o);
			if (s.length !== 1 || n.has(s[0])) return null;
			n.add(s[0]);
			let c = s[0];
			for (let t of [.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(c)])].filter((e) => !e.startsWith("_"))) {
				let n = Hl(e[t]), s = Hl(c[t]);
				if (n !== s) if (n === "" && s !== "") {
					let e = `${t}\u0000${o}\u0000${s}`, n = i.get(e);
					n ? n.n++ : i.set(e, {
						field: t,
						item: o,
						value: s,
						n: 1
					});
				} else r.push(K.rowDiff(a.name, o, t, Ul(s)));
			}
		}
	}
	return n.size === t.length ? {
		rowDiffs: r,
		carried: [...i.values()].map((e) => K.carried(e.field, e.item, e.value, e.n))
	} : null;
}
function Kl(e) {
	let t = new Set(e.noData), n = e.plan.excluded.filter((e) => !(e.key === null && e.page !== null && t.has(e.page))), r = n.filter((e) => e.key !== null), i = n.filter((e) => e.key === null), a = [...r.map((e) => K.excludedValue(e.page, e.location, e.key, e.reason)), ...i.map((e) => K.excludedPage(e.page, e.reason))];
	return {
		excludedHead: a.length ? K.excludedHead(r.length, i.length) : null,
		excluded: a,
		noData: e.noData.length ? K.noData(e.noData) : null,
		zones: e.zones.map((e) => K.zone(e.location, e.zone))
	};
}
function ql(e, t) {
	let n = e.files, r = n.length > 1, i = n.filter((e) => e.fileName !== null), a = i.reduce((e, t) => e + t.plan.total, 0), o = Array.isArray(t) ? t : null, s = new Set(i.map((e) => e.fileName)), c = !!o && o.length === a && o.every((e) => !!e && typeof e == "object" && (!r || s.has(Hl(e._sourceFile)))), l = n.map((e, t) => {
		let n = Kl(e);
		if (e.fileName === null) return {
			head: K.fileNoRows(t + 1, e.xdwFileName),
			noRows: !0,
			...n,
			cannotCompare: !1,
			rowDiffs: [],
			carried: []
		};
		let i = null;
		if (c) try {
			i = Gl(e, r ? o.filter((t) => Hl(t._sourceFile) === e.fileName) : o);
		} catch {
			i = null;
		}
		return {
			head: r ? K.fileHead(t + 1, e.xdwFileName, e.fileName, e.plan.total) : null,
			noRows: !1,
			...n,
			cannotCompare: i === null,
			rowDiffs: i?.rowDiffs ?? [],
			carried: i?.carried ?? []
		};
	});
	return {
		title: r ? K.titleMulti(a, n.map((e) => e.xdwFileName)) : K.title(a, n[0].xdwFileName, n[0].fileName ?? ""),
		files: l,
		multi: r,
		fixed: zl.map((e) => ({
			key: e,
			text: K.fixed[e]
		}))
	};
}
function Jl(e, t, n) {
	let r = (t, n, r) => {
		let i = e.createElement(t);
		return n != null && (i.textContent = n), r && (i.style.cssText = r), i;
	}, i = "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b", a = r("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #6a4c9c;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	a.id = n, a.dataset.edcForm = "noise";
	let o = r("div", t.title, "font-weight:700;font-size:15px;color:#4b3172");
	o.dataset.edc = "title", a.append(o, r("div", K.titleNote, "margin:2px 0 6px")), t.files.forEach((e, n) => {
		let o = a;
		if (t.multi) {
			o = r("div", null, "margin-top:10px;padding-top:6px;border-top:1px dashed #b9a7d6"), o.dataset.edc = "file", o.dataset.file = String(n + 1);
			let t = r("div", e.head, e.noRows ? "font-weight:700;color:#8a1f1b" : "font-weight:700;color:#4b3172");
			t.dataset.edc = e.noRows ? "file-norows" : "file-head", o.append(t), a.append(o);
		}
		if (e.excludedHead) {
			let t = r("div", null, i);
			t.dataset.edc = "excluded", t.append(r("div", e.excludedHead, "font-weight:700"), ...e.excluded.map((e) => r("div", e))), o.append(t);
		}
		if (e.noData) {
			let t = r("div", e.noData, "margin-top:6px");
			t.dataset.edc = "nodata", o.append(t);
		}
		if (e.zones.length) {
			let t = r("div", null, "margin-top:8px");
			t.dataset.edc = "zones", t.append(r("div", K.zoneHead, "font-weight:700"), ...e.zones.map((e) => {
				let t = r("div", e);
				return t.dataset.edc = "zone", t;
			})), o.append(t);
		}
		if (e.noRows) return;
		let s = r("div", null, "margin-top:8px");
		if (s.dataset.edc = "carried", s.append(r("div", K.carriedHead, "font-weight:700")), e.cannotCompare) {
			let e = r("div", K.cannot, "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b;font-weight:700");
			e.dataset.edc = "cannot", s.append(e);
		} else {
			if (e.rowDiffs.length) {
				let t = r("div", null, i);
				t.dataset.edc = "row-diffs", t.append(r("div", K.rowDiffHead, "font-weight:700"), ...e.rowDiffs.map((e) => r("div", e))), s.append(t);
			}
			for (let t of e.carried) {
				let e = r("div", t);
				e.dataset.edc = "grouped", s.append(e);
			}
			!e.rowDiffs.length && !e.carried.length && s.append(r("div", K.noCarried));
		}
		o.append(s);
	});
	let s = r("div", null, "margin-top:8px");
	for (let e of t.fixed) {
		let t = r("div", `・${e.text}`);
		t.dataset.edc = `noise-${e.key}`, s.append(t);
	}
	return a.append(s), a;
}
//#endregion
//#region src/xdwread/notice.ts
var Yl = "edcXdwImportNotice", q = {
	title: (e, t, n, r = 0) => `🟣 Claude 版 XDW 讀值：帶入 ${e} 筆${r > 0 ? `（Claude 讀值 ${e - r} 筆、人工輸入 ${r} 筆）` : ""}（${t}／${n}）`,
	manualHead: (e) => `✍️ 人工輸入 ${e} 列（不是 Claude 讀的，是你在讀值視窗輸入並確認的）`,
	manualRow: (e, t, n, r, i, a, o) => `・第 ${e} 頁｜${t}｜${n}｜你填的：結果 ${r}／MDL ${i}／單位 ${a}／方法 ${o}`,
	manualPreset: (e, t, n, r, i) => `・第 ${e} 頁｜${t}｜${n}｜你確認的：套用上一季寫法（數值空白、${Ds}）／單位 ${r}／方法 ${i}——沒有放進 xlsx，請照下方步驟手動新增`,
	presetStep: (e, t, n, r, i) => `・第 ${e} 頁｜${t}｜${n}｜請在原網站表格新增一列：數值空白、單位 ${r}、方法 ${i}、備註「${Ds}」`,
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
	empty: "（空白）",
	titleMulti: (e, t, n) => `🟣 Claude 版 XDW 讀值：帶入 ${e} 筆${t > 0 ? `（Claude 讀值 ${e - t} 筆、人工輸入 ${t} 筆）` : ""}（${n.length} 個檔：${n.join("、")}）`,
	fileHead: (e, t, n, r) => `檔 ${e}：${t}／${n}（帶入 ${r} 筆）`,
	fileNoRows: (e, t) => `檔 ${e}：${t} 沒有可帶入的列（沒有產生 xlsx，這個檔沒有交給原網站）`
};
function Xl(e) {
	return "files" in e ? e.files : [{
		xdwFileName: e.plan.xdwFileName,
		fileName: e.fileName,
		plan: e.plan,
		preflightRows: e.preflightRows
	}];
}
var Zl = (e) => Xl(e).filter((e) => e.fileName !== null).map((e) => e.fileName).join("、"), Ql = /* @__PURE__ */ new Set([
	"檢測數值",
	"比較關係",
	"檢測極限"
]), $l = /* @__PURE__ */ new Set([
	"日期(起)",
	"時間(起)",
	"日期(迄)",
	"時間(迄)",
	"採樣地點",
	"檢測類別",
	"檢測機構許可證號",
	"檢測項目"
]), eu = /* @__PURE__ */ new Set([
	"檢測濃度/質量單位",
	"其他檢測濃度/質量單位",
	"檢測方法"
]), tu = (e) => e == null ? "" : String(e), nu = (e) => e === "" ? q.empty : e;
function ru(e) {
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
function iu(e, t) {
	if (!Array.isArray(t)) return null;
	let n = t;
	if (n.length !== e.plan.total || n.some((e) => !e || typeof e != "object" || tu(e._sourceSheet) === "")) return null;
	let r = /* @__PURE__ */ new Set(), i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
	for (let t of e.plan.sheets) {
		let s = e.preflightRows[t.name];
		if (!Array.isArray(s) || s.length !== t.rows.length) return null;
		for (let e of s) {
			let s = tu(e.檢測項目), c = n.filter((e) => tu(e._sourceSheet) === t.name && tu(e.檢測項目) === s);
			if (c.length !== 1 || r.has(c[0])) return null;
			let l = c[0];
			r.add(l);
			let u = [.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(l)])].filter((e) => !e.startsWith("_"));
			for (let n of u) {
				let r = tu(e[n]), c = tu(l[n]);
				if (r !== c) if (Ql.has(n) || $l.has(n) || eu.has(n)) if (r === "" && c !== "" && (eu.has(n) || n === "檢測極限")) {
					let e = `${n}\u0000${s}\u0000${c}`, r = a.get(e);
					r ? r.pages.includes(t.page) || r.pages.push(t.page) : a.set(e, {
						field: n,
						item: s,
						value: c,
						pages: [t.page]
					});
				} else i.push(q.rowDiff(t.page, s, n, nu(c)));
				else r === "" ? o.set(n, (o.get(n) ?? 0) + 1) : i.push(q.rowDiff(t.page, s, n, nu(c)));
			}
		}
	}
	return r.size === n.length ? {
		rowDiffs: i,
		grouped: [...a.values()].map((e) => q.grouped(e.field, e.item, e.value, e.pages.sort((e, t) => e - t))),
		others: [...o.entries()].map(([e, t]) => q.otherField(e, t))
	} : null;
}
function au(e) {
	let t = e.excluded.filter((e) => e.index !== null), n = e.excluded.filter((e) => e.index === null), r = e.excluded.map((e) => e.index === null ? q.excludedPage(e.page, e.sampleName, e.reason) : e.unmeasurable ? q.presetStep(e.page, e.sampleName, e.item, nu(e.unmeasurable.unit), nu(e.unmeasurable.method)) : q.excludedRow(e.page, e.sampleName, e.item, e.reason)), i = (Array.isArray(e.manual) ? e.manual : []).map((e) => e.inXlsx ? q.manualRow(e.page, e.sampleName, e.item, nu(e.cells.result), nu(e.cells.mdl), nu(e.cells.unit), nu(e.cells.method)) : q.manualPreset(e.page, e.sampleName, e.item, nu(e.cells.unit), nu(e.cells.method)));
	return {
		manualHead: i.length ? q.manualHead(i.length) : null,
		manual: i,
		excludedHead: r.length ? q.excludedHead(t.length, n.length) : null,
		excluded: r
	};
}
function ou(e, t) {
	let n = Xl(e), r = n.filter((e) => e.fileName !== null), i = {
		generic: q.generic,
		itemRenames: ru(n.flatMap((e) => e.plan.itemRenames)).map((e) => q.itemRename(e.from, e.to, e.n)),
		unitRenames: ru(n.flatMap((e) => e.plan.unitRenames)).map((e) => q.unitRename(e.from, e.to, e.n)),
		mdlNote: q.mdlNote
	};
	if (n.length === 1) {
		let e = n[0], r = e.plan, a = null;
		try {
			a = iu(e, t);
		} catch {
			a = null;
		}
		return {
			title: q.title(r.total, r.xdwFileName, e.fileName ?? "", r.manualIn ?? 0),
			...au(r),
			cannotCompare: a === null,
			rowDiffs: a?.rowDiffs ?? [],
			grouped: a?.grouped ?? [],
			others: a?.others ?? [],
			files: [],
			...i
		};
	}
	let a = Array.isArray(t) ? t : null, o = new Set(r.map((e) => e.fileName)), s = r.reduce((e, t) => e + t.plan.total, 0), c = !!a && a.length === s && a.every((e) => !!e && typeof e == "object" && o.has(tu(e._sourceFile))), l = n.map((e, t) => {
		let n = au(e.plan);
		if (e.fileName === null) return {
			head: q.fileNoRows(t + 1, e.xdwFileName),
			noRows: !0,
			...n,
			cannotCompare: !1,
			rowDiffs: [],
			grouped: [],
			others: []
		};
		let r = null;
		if (c) try {
			r = iu(e, a.filter((t) => tu(t._sourceFile) === e.fileName));
		} catch {
			r = null;
		}
		return {
			head: q.fileHead(t + 1, e.xdwFileName, e.fileName, e.plan.total),
			noRows: !1,
			...n,
			cannotCompare: r === null,
			rowDiffs: r?.rowDiffs ?? [],
			grouped: r?.grouped ?? [],
			others: r?.others ?? []
		};
	});
	return {
		title: q.titleMulti(s, r.reduce((e, t) => e + (t.plan.manualIn ?? 0), 0), n.map((e) => e.xdwFileName)),
		manualHead: null,
		manual: [],
		excludedHead: null,
		excluded: [],
		cannotCompare: l.some((e) => e.cannotCompare),
		rowDiffs: [],
		grouped: [],
		others: [],
		files: l,
		...i
	};
}
var su = null, cu = !1, lu = /* @__PURE__ */ new WeakSet(), uu = null;
function du(e, t) {
	su = e, cu = !1, uu = t, gu(t);
}
function fu() {
	su = null, cu = !1;
	try {
		uu?.doc.getElementById(Yl)?.remove();
	} catch {}
}
function pu(e) {
	try {
		let t = e.getState();
		return t ? {
			label: tu(t.currentImportSourceLabel),
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
function mu() {
	let e = uu;
	if (!e) return null;
	let t = e.doc, n = t.getElementById(Yl), r = t.getElementById("smartImportSummary"), i = su;
	if (!i || !r) return n?.remove(), null;
	let a = pu(e), o = jl(i) ? Ml(i) : Bl(i) ? Vl(i) : Zl(i);
	if (a.ok && a.label !== "" && a.label !== o) return fu(), null;
	if (a.ok && a.label !== o || !r.textContent) return n?.remove(), null;
	cu = !0;
	let s = a.ok ? a.rows : void 0, c = jl(i) ? Rl(t, Ll(i, s), Yl) : Bl(i) ? Jl(t, ql(i, s), Yl) : hu(t, ou(i, s));
	return n ? n.replaceWith(c) : r.after(c), c;
}
function hu(e, t) {
	let n = (t, n, r) => {
		let i = e.createElement(t);
		return n != null && (i.textContent = n), r && (i.style.cssText = r), i;
	}, r = "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b", i = n("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #6a4c9c;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	i.id = Yl;
	let a = n("div", t.title, "font-weight:700;font-size:15px;color:#4b3172");
	a.dataset.edc = "title", i.append(a, n("div", q.titleNote, "margin:2px 0 6px"));
	let o = (e, t, i) => {
		if (t.manualHead) {
			let r = n("div", null, "margin-top:8px;padding:8px 12px;border:1px solid #9b7fc7;background:#efe8f8;border-radius:4px;color:#3d2766");
			r.dataset.edc = "manual", r.append(n("div", t.manualHead, "font-weight:700"), ...t.manual.map((e) => n("div", e))), e.append(r);
		}
		if (t.excludedHead) {
			let i = n("div", null, r);
			i.dataset.edc = "excluded", i.append(n("div", t.excludedHead, "font-weight:700"), ...t.excluded.map((e) => n("div", e))), e.append(i);
		}
		if (!i) return;
		let a = n("div", null, "margin-top:8px");
		if (a.dataset.edc = "carried", a.append(n("div", q.carriedHead, "font-weight:700")), t.cannotCompare) {
			let e = n("div", q.cannot, "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b;font-weight:700");
			e.dataset.edc = "cannot", a.append(e);
		} else {
			if (t.rowDiffs.length) {
				let e = n("div", null, r);
				e.dataset.edc = "row-diffs", e.append(n("div", q.rowDiffHead, "font-weight:700"), ...t.rowDiffs.map((e) => n("div", e))), a.append(e);
			}
			for (let e of t.grouped) {
				let t = n("div", e);
				t.dataset.edc = "grouped", a.append(t);
			}
			for (let e of t.others) {
				let t = n("div", e);
				t.dataset.edc = "others", a.append(t);
			}
			!t.rowDiffs.length && !t.grouped.length && !t.others.length && a.append(n("div", q.noCarried));
		}
		e.append(a);
	};
	t.files.length || o(i, t, !0), t.files.forEach((e, t) => {
		let r = n("div", null, "margin-top:10px;padding-top:6px;border-top:1px dashed #b9a7d6");
		r.dataset.edc = "file", r.dataset.file = String(t + 1);
		let a = n("div", e.head, e.noRows ? "font-weight:700;color:#8a1f1b" : "font-weight:700;color:#4b3172");
		a.dataset.edc = e.noRows ? "file-norows" : "file-head", r.append(a), o(r, e, !e.noRows), i.append(r);
	});
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
function gu(e) {
	if (typeof MutationObserver > "u") return;
	let t = e.doc, n = t.getElementById("smartImportSummary");
	n && !lu.has(n) && (lu.add(n), new MutationObserver(() => {
		try {
			mu();
		} catch {}
	}).observe(n, {
		childList: !0,
		characterData: !0,
		subtree: !0
	}));
	let r = t.getElementById("importModal");
	r && !lu.has(r) && (lu.add(r), new MutationObserver(() => {
		try {
			r.classList.contains("hidden") && su && cu && fu();
		} catch {}
	}).observe(r, {
		attributes: !0,
		attributeFilter: ["class"]
	}));
}
//#endregion
//#region src/xdwread/runview.ts
var J = {
	status: (e) => `${e.scheme} 讀法（${e.scheme === "A" ? ms : hs}）：已完成 ${e.done}／${e.total} 頁（已送出 ${e.calls} 次呼叫）`,
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
	loadedBundle: (e, t) => `已載入讀值紀錄包（${e} 個檔，${t}）；這次沒有送出任何東西。`,
	filePrefix: (e, t, n) => `檔 ${e}/${t}（${n}）：`,
	fileStopped: (e) => `第 ${e} 個檔停止，之後的檔沒有讀。`,
	fileCancelled: (e) => `中止在第 ${e} 個檔，之後的檔沒有讀。`,
	fileNote: (e, t) => `檔「${e}」${t}`,
	loadedTokens: "（紀錄裡的用量，這次沒有花額度）",
	wrongForm: (e, t) => `這份讀值紀錄是${e === "air" ? "空品" : e === "noise" ? "噪音振動" : "水質（地下水）"}的，目前是${t === "air" ? "空品" : t === "noise" ? "噪音" : "水質"}分頁，拒絕載入`,
	toImport: U.button,
	toImportNote: U.ready
};
function _u(e) {
	return e.map((e) => ns(e.calls)).reduce((e, t) => vu(e, t), {
		A: {
			input: 0,
			output: 0
		},
		B: {
			input: 0,
			output: 0
		}
	});
}
function vu(e, t) {
	return {
		A: {
			input: e.A.input + t.A.input,
			output: e.A.output + t.A.output
		},
		B: {
			input: e.B.input + t.B.input,
			output: e.B.output + t.B.output
		}
	};
}
var yu = (e, t) => e === null ? 0 : Math.max(0, Math.ceil((e - t) / 1e3));
function Y(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var bu = (e) => $t((e instanceof Error ? e.message : String(e)) || "未知錯誤", fn());
function xu(e, t, n) {
	let r = 0, i = !1, a = !1, o = null, s = null, c = null, l = [], u = [], d = [], f = [], p = [], m = () => {
		try {
			let e = n.form?.();
			return e === "air" ? "air" : e === "noise" ? "noise" : "gw";
		} catch {
			return "gw";
		}
	}, h = () => l.length && l.length === f.length ? l.map((e, t) => ({
		log: e,
		v: f[t]
	})) : null, g = () => l.length && l.length === p.length ? l.map((e, t) => ({
		log: e,
		v: p[t]
	})) : null, _ = !1, v = null, y = () => l.length && l.length === u.length ? l.map((e, t) => ({
		log: e,
		v: u[t]
	})) : null, b = Y(e, "div", "edc-read-run");
	b.id = "edcReadRun", b.hidden = !0;
	let x = Y(e, "div", "edc-read-run-status");
	x.id = "edcReadRunStatus", x.setAttribute("aria-live", "polite");
	let S = Y(e, "div", "edc-read-run-note");
	S.id = "edcReadRunNote";
	let C = Y(e, "div", "edc-read-pause");
	C.id = "edcReadPause", C.hidden = !0;
	let w = Y(e, "button", "edc-xdw-btn edc-read-abort", J.abort);
	w.type = "button", w.id = "edcReadAbort";
	let T = Y(e, "div", "edc-read-tokens");
	T.id = "edcReadTokens";
	let E = Y(e, "div", "edc-read-end");
	E.id = "edcReadEnd";
	let ee = Y(e, "div", "edc-read-notes");
	ee.id = "edcReadNotes", b.append(x, S, C, w, T, E, ee);
	let te = Y(e, "div", "edc-read-logbar"), D = Y(e, "button", "edc-xdw-btn edc-read-download", J.download);
	D.type = "button", D.id = "edcReadDownloadLog", D.hidden = !0;
	let ne = Y(e, "button", "edc-xdw-btn edc-read-load", J.load);
	ne.type = "button", ne.id = "edcReadLoadLog";
	let re = Y(e, "input");
	re.type = "file", re.accept = ".json,application/json", re.id = "edcReadLogFile", re.hidden = !0;
	let ie = Y(e, "span", "edc-read-load-why");
	ie.id = "edcReadLoadWhy", te.append(D, ne, re, ie);
	let ae = Y(e, "div", "edc-read-load-msg");
	ae.id = "edcReadLoadMsg";
	let O = Y(e, "div", "edc-read-results-slot"), oe = Y(e, "div", "edc-read-next");
	oe.hidden = !0;
	let se = Y(e, "button", "edc-xdw-btn edc-read-to-import", J.toImport);
	se.type = "button", se.id = "edcReadToImport", se.disabled = !0;
	let ce = Y(e, "span", "edc-read-next-note", J.toImportNote);
	ce.id = "edcReadToImportWhy", oe.append(se, ce);
	let k = Y(e, "div", "edc-read-submit-msg");
	k.id = "edcReadSubmitMsg", k.setAttribute("aria-live", "polite"), t.replaceChildren(b, te, ae, O, oe, k);
	let le = () => {
		s !== null && (clearInterval(s), s = null);
	}, ue = () => {
		let e = yu(c, Date.now());
		e > 0 ? (C.hidden = !1, C.textContent = J.pause(e)) : (C.hidden = !0, C.textContent = "", c = null, le());
	}, de = () => {
		let e = f.length ? dl({
			items: h(),
			busy: _,
			reading: i
		}) : p.length ? _l({
			items: g(),
			busy: _,
			reading: i
		}) : Xc({
			items: y(),
			busy: _,
			reading: i
		});
		se.disabled = e !== null, ce.textContent = e ?? J.toImportNote;
	}, fe = (t, n) => {
		let r = URL.createObjectURL(t), i = e.createElement("a");
		i.href = r, i.download = n, i.click(), setTimeout(() => {
			try {
				URL.revokeObjectURL(r);
			} catch {}
		}, 1e4);
	}, pe = (t) => ({
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
		download: fe,
		now: () => /* @__PURE__ */ new Date(),
		setPending: (t) => du(t, {
			doc: e,
			getState: () => typeof state < "u" ? state : void 0
		}),
		clearPending: fu,
		closeModal: () => {
			try {
				n.closeModal?.();
			} catch {}
		},
		onStage: (t) => {
			k.replaceChildren(Y(e, "div", "edc-read-submit-stage", t));
		}
	}), me = (t) => {
		let { waterReady: n, setPending: r, ...i } = pe(t);
		return {
			...i,
			upstream: () => ({
				ImportEngine: typeof ImportEngine < "u" ? ImportEngine : void 0,
				SmartParse: typeof SmartParse < "u" ? SmartParse : void 0,
				XLSX: typeof XLSX < "u" ? XLSX : void 0
			}),
			airReady: () => {
				try {
					return typeof state < "u" && !!state && state.currentTab === "air" && !!state.currentProjectId;
				} catch {
					return !1;
				}
			},
			setPending: (t) => du(t, {
				doc: e,
				getState: () => typeof state < "u" ? state : void 0
			})
		};
	}, he = (t) => {
		let { waterReady: n, setPending: r, ...i } = pe(t);
		return {
			...i,
			upstream: () => ({
				ImportEngine: typeof ImportEngine < "u" ? ImportEngine : void 0,
				SmartParse: typeof SmartParse < "u" ? SmartParse : void 0,
				XLSX: typeof XLSX < "u" ? XLSX : void 0
			}),
			noiseReady: () => {
				try {
					return typeof state < "u" && !!state && state.currentTab === "noise" && !!state.currentProjectId;
				} catch {
					return !1;
				}
			},
			setPending: (t) => du(t, {
				doc: e,
				getState: () => typeof state < "u" ? state : void 0
			})
		};
	}, ge = async () => {
		if (f.length) {
			await _e();
			return;
		}
		if (p.length) {
			await _e(!0);
			return;
		}
		let t = y();
		if (_ || !t) return;
		let n = r;
		_ = !0;
		for (let e of d) e.setLocked(!0);
		de(), k.replaceChildren();
		try {
			let i = await sl(t.map((e) => ({
				v: e.v,
				log: JSON.parse(JSON.stringify(e.log))
			})), pe(n));
			if (n !== r || i.ok) {
				n === r && k.replaceChildren();
				return;
			}
			if (i.stage === "cancel") {
				k.replaceChildren();
				return;
			}
			let a = Y(e, "div", "edc-xdw-red edc-read-submit-fail");
			a.append(...i.messages.map((t) => Y(e, "div", void 0, $t(t, fn())))), k.replaceChildren(a);
			let o = i.xlsxList ?? (i.xlsx ? [i.xlsx] : []);
			o.forEach((t, n) => {
				let r = Y(e, "button", "edc-xdw-btn edc-read-download-xlsx", o.length > 1 ? `${U.download}：${t.name}` : U.download);
				r.type = "button", n === 0 && (r.id = "edcReadDownloadXlsx"), r.dataset.name = t.name, r.addEventListener("click", () => {
					try {
						fe(new Blob([t.bytes.slice().buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), t.name);
					} catch {}
				}), k.append(r);
			});
		} catch (t) {
			n === r && k.replaceChildren(Y(e, "div", "edc-xdw-red edc-read-submit-fail", bu(t)));
		} finally {
			if (n === r) {
				_ = !1;
				for (let e of d) e.setLocked(!1);
				de();
			}
		}
	}, _e = async (t = !1) => {
		let n = t ? g() : h();
		if (_ || !n) return;
		let i = r;
		_ = !0, de(), k.replaceChildren();
		try {
			let a = n.map((e) => ({
				v: e.v,
				log: JSON.parse(JSON.stringify(e.log))
			})), o = t ? await bl(a, he(i)) : await ml(a, me(i));
			if (i !== r || o.ok) {
				i === r && k.replaceChildren();
				return;
			}
			if (o.stage === "cancel") {
				k.replaceChildren();
				return;
			}
			let s = Y(e, "div", "edc-xdw-red edc-read-submit-fail");
			s.append(...o.messages.map((t) => Y(e, "div", void 0, $t(t, fn())))), k.replaceChildren(s);
			let c = o.xlsxList ?? (o.xlsx ? [o.xlsx] : []);
			c.forEach((t, n) => {
				let r = Y(e, "button", "edc-xdw-btn edc-read-download-xlsx", c.length > 1 ? `${U.download}：${t.name}` : U.download);
				r.type = "button", n === 0 && (r.id = "edcReadDownloadXlsx"), r.dataset.name = t.name, r.addEventListener("click", () => {
					try {
						fe(new Blob([t.bytes.slice().buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), t.name);
					} catch {}
				}), k.append(r);
			});
		} catch (t) {
			i === r && k.replaceChildren(Y(e, "div", "edc-xdw-red edc-read-submit-fail", bu(t)));
		} finally {
			i === r && (_ = !1, de());
		}
	};
	se.addEventListener("click", () => {
		try {
			ge().catch(() => {});
		} catch {}
	});
	let ve = (t, r, i = []) => {
		u = t, f = [], p = [], l = r, v?.dispose(), d = t.map((e, t) => zs(e, r[t], i[t] ?? []));
		for (let e of d) e.onChange(() => {
			try {
				de();
			} catch {}
		});
		v = Qs(e, t.map((e, t) => ({
			v: e,
			log: r[t],
			frag: (e) => n.frag(t, e),
			store: d[t]
		}))), O.replaceChildren(v.element), oe.hidden = !1, D.hidden = !1, de();
	}, ye = (t, n) => {
		f = t, p = [], u = [], l = n, v?.dispose(), d = [], v = Ol(e, t.map((e, t) => ({
			v: e,
			log: n[t]
		}))), O.replaceChildren(v.element), oe.hidden = !1, D.hidden = !1, de();
	}, be = (t, n) => {
		p = t, f = [], u = [], l = n, v?.dispose(), d = [], v = oc(e, t.map((e, t) => ({
			v: e,
			log: n[t]
		}))), O.replaceChildren(v.element), oe.hidden = !1, D.hidden = !1, de();
	}, xe = () => {
		let e = i || a ? J.locked : n.canLoad();
		ne.disabled = e !== null, ie.textContent = e ?? J.loadHint;
	}, Se = () => {
		i = !1, a = !0, o = null, w.disabled = !0, w.hidden = !0, le(), c = null, C.hidden = !0, xe(), de(), n.changed();
	};
	w.addEventListener("click", () => {
		try {
			i && o && (w.disabled = !0, w.textContent = J.aborting, o.abort());
		} catch {}
	}), D.addEventListener("click", () => {
		try {
			if (!l.length) return;
			let t = /* @__PURE__ */ new Date(), n = l.length > 1 ? cs(ss(l, t.toISOString())) : Ho(l[0]), r = new Blob([n], { type: "application/json" }), i = URL.createObjectURL(r), a = e.createElement("a");
			a.href = i, a.download = l.length > 1 ? qs(l.length, t) : Ks(l[0].fileName, t), a.click(), setTimeout(() => {
				try {
					URL.revokeObjectURL(i);
				} catch {}
			}, 1e4);
		} catch (t) {
			E.append(Y(e, "div", "edc-xdw-red edc-read-error", J.downloadFail(bu(t))));
		}
	}), ne.addEventListener("click", () => {
		try {
			xe(), ne.disabled || (re.value = "", re.click());
		} catch {}
	}), re.addEventListener("change", () => {
		let t = r, o = re.files?.[0];
		o && (async () => {
			let s = i || a ? J.locked : n.canLoad();
			if (s) {
				ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject(s)));
				return;
			}
			let c = await o.text();
			if (t !== r) return;
			let l = ls(c);
			if (!l.ok) {
				ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject(l.reason)));
				return;
			}
			let u = n.shas();
			if (!u) {
				ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject("目前的檔案沒有 SHA-256，不能比對")));
				return;
			}
			let d = us(l.logs, u);
			if (!d.ok) {
				ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject(d.reason)));
				return;
			}
			let f = m(), p = d.logs.find((e) => Bo(e) !== f);
			if (p) {
				ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject(J.wrongForm(Bo(p), f))));
				return;
			}
			let h = d.logs.map((e) => e.manual), g = f === "gw" ? ds(d.logs) : [], _ = l.bundle ? JSON.parse(c).createdAt : d.logs[0].createdAt;
			ae.replaceChildren(Y(e, "div", "edc-read-loaded", d.logs.length > 1 ? J.loadedBundle(d.logs.length, _) : J.loaded(d.logs[0].fileName, _))), b.hidden = !1, x.textContent = "", S.textContent = "", w.hidden = !0, T.textContent = `${z.tokens(_u(d.logs))}${J.loadedTokens}`, E.replaceChildren(Y(e, "div", "edc-read-locked", J.locked)), f === "air" ? ye(fs(d.logs), d.logs) : f === "noise" ? be(ps(d.logs), d.logs) : ve(g, d.logs, h), Se();
		})().catch((n) => {
			t === r && ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject(bu(n))));
		});
	});
	let Ce = {
		async run(t) {
			if (i || a) return;
			let l = ++r;
			i = !0, o = new AbortController();
			let u = o.signal;
			b.hidden = !1, w.hidden = !1, w.disabled = !1, w.textContent = J.abort, x.textContent = J.starting, S.textContent = "", T.textContent = z.tokens({
				A: {
					input: 0,
					output: 0
				},
				B: {
					input: 0,
					output: 0
				}
			}), E.replaceChildren(), ee.replaceChildren(), ae.replaceChildren(), xe(), n.changed();
			let d = t.files.length, f = d > 1, p = t.form === "air" ? "air" : t.form === "noise" ? "noise" : "gw", m = [], h = [], g = null;
			for (let n = 0; n < d; n++) {
				let i = t.files[n];
				if (g || u.aborted) {
					m.push(rs({
						fileName: i.fileName,
						xdwSha256: i.xdwSha256,
						createdAt: (/* @__PURE__ */ new Date()).toISOString(),
						period: t.period,
						category: t.category,
						agency: t.agency,
						form: p,
						pages: i.pages.map((e) => ({
							page: e.page,
							mode: e.mode,
							image: e.mode === "whole" && e.box ? {
								w: e.box.w,
								h: e.box.h
							} : null,
							reason: e.reason
						}))
					})), g ||= {
						status: "cancelled",
						text: null,
						at: n
					};
					continue;
				}
				if (f && !i.pages.some((e) => e.mode === "whole")) {
					m.push(rs({
						fileName: i.fileName,
						xdwSha256: i.xdwSha256,
						createdAt: (/* @__PURE__ */ new Date()).toISOString(),
						period: t.period,
						category: t.category,
						agency: t.agency,
						form: p,
						pages: i.pages.map((e) => ({
							page: e.page,
							mode: e.mode,
							image: null,
							reason: e.reason
						}))
					}));
					continue;
				}
				let a = f ? J.filePrefix(n + 1, d, i.fileName) : "", o = _u(m), _ = (e) => {
					l === r && (x.textContent = a + J.status(e), S.textContent = e.note ?? "", T.textContent = z.tokens(vu(o, e.usage)), c = e.pausedUntil, ue(), c !== null && s === null && (s = setInterval(() => {
						try {
							ue();
						} catch {}
					}, 1e3)));
				}, v;
				try {
					let n = bs({
						decode: (t) => Vt(e, t),
						encode: (t) => Ut(e, t)
					});
					v = await Cs({
						fileName: i.fileName,
						xdwSha256: i.xdwSha256,
						period: t.period,
						category: t.category,
						agency: t.agency,
						pages: i.pages,
						form: p,
						signal: u,
						onProgress: _
					}, n);
				} catch (t) {
					if (l !== r) return;
					E.replaceChildren(Y(e, "div", "edc-xdw-red edc-read-error", J.crash(bu(t))), Y(e, "div", "edc-read-locked", J.locked)), Se();
					return;
				}
				if (l !== r) return;
				m.push(v.log);
				for (let e of v.notes) h.push(f ? J.fileNote(i.fileName, J.note(e)) : J.note(e));
				v.status !== "done" && (g = {
					status: v.status,
					text: v.stopText,
					at: n
				});
			}
			if (l !== r) return;
			T.textContent = z.tokens(_u(m));
			let _ = g ? g.status === "cancelled" ? J.cancelled : g.text ?? "" : J.done, v = f && g && g.at < d - 1 ? " " + (g.status === "stopped" ? J.fileStopped(g.at + 1) : J.fileCancelled(g.at + 1)) : "";
			E.replaceChildren(Y(e, "div", g?.status === "stopped" ? "edc-xdw-red edc-read-stop" : "edc-read-done-text", $t(_ + v, fn())), Y(e, "div", "edc-read-locked", J.locked)), ee.replaceChildren(...h.map((t) => Y(e, "div", "edc-xdw-red edc-read-note-item", $t(t, fn())))), p === "air" ? ye(fs(m), m) : p === "noise" ? be(ps(m), m) : ve(ds(m), m), Se();
		},
		busy: () => i,
		submitting: () => _,
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
			o = null, i = !1, a = !1, l = [], u = [], f = [], p = [], _ = !1, k.replaceChildren(), le(), c = null, v?.dispose(), v = null, d = [], b.hidden = !0, x.textContent = "", S.textContent = "", C.hidden = !0, T.textContent = "", E.replaceChildren(), ee.replaceChildren(), ae.replaceChildren(), O.replaceChildren(), oe.hidden = !0, D.hidden = !0, re.value = "", xe();
		},
		refreshLoad: xe
	};
	return xe(), Ce;
}
//#endregion
//#region src/xdwread/ui.ts
var Su = `${Ya.noise.category}／${Ya.vib.category}`, Cu = "edcXdwRead", X = {
	title: "Claude 讀值",
	notAvailable: "這個類別的自動讀值尚未提供",
	intro: "按『開始讀取』後，會送出的每一頁會整頁送到 Claude（Anthropic）讀取；兩個模型各讀一次，兩次讀到的字完全相同才會帶入。",
	waiting: "選檔後會自動準備每一頁，結果列在這裡。",
	preparing: (e, t) => `準備頁面 ${e}/${t}`,
	summary: (e, t) => t > 0 ? `會送出 ${e} 頁、不送 ${t} 頁（需人工輸入）` : `會送出 ${e} 頁`,
	summaryAir: (e, t) => t > 0 ? `會送出 ${e} 頁、不送 ${t} 頁` : `會送出 ${e} 頁`,
	ok: "會送出",
	allSend: (e, t, n) => n === 1 ? `第 ${e} 頁會送出` : `第 ${e}–${t} 頁全部會送出（共 ${n} 頁）`,
	restSend: (e) => `其餘 ${e} 頁會送出`,
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
	confirmFail: (e) => `確認失敗：${e}`,
	titleAir: "Claude 讀值（空品）",
	categoryAir: ti,
	categoryHintAir: `空品由原網站固定寫成「${ti}」，這格不能改`,
	pickHint: "封面、目錄、聲明書沒有資料，可以取消勾選（取消的頁不會送出）。",
	pickLabel: (e) => `第 ${e} 頁`,
	unpicked: cl,
	notReady: "目前不在水質或空品分頁、或沒有選計畫，沒有送出。",
	titleNoise: "Claude 讀值（噪音振動）",
	categoryNoise: Su,
	categoryHintNoise: `噪音振動由原網站固定寫成「${Ya.noise.category}」「${Ya.vib.category}」，這格不能改`,
	notReadyNoise: "目前不在噪音分頁或沒有選計畫，沒有送出。",
	formChanged: "選檔之後換了分頁，沒有送出。請在要匯入的分頁重新選檔。",
	fileCount: (e) => `共 ${e} 個檔`,
	fileTitle: (e, t) => `${e}（共 ${t} 頁）`,
	filePrefix: (e, t, n) => `檔 ${e}/${t}（${n}）：`,
	inconsistentFile: (e, t) => `送出前檢查不一致（檔「${e}」第 ${t} 頁），沒有送出。請重新選檔。`
};
function wu(e) {
	return e.reading ? X.why.reading : e.ended ? X.why.ended : e.preparing ? X.why.preparing : e.hasFile ? e.hasSha ? e.sendCount <= 0 ? X.why.none : e.hasKey ? e.category.trim() ? e.agency ? e.year ? e.quarter ? e.confirmed ? X.why.confirmed : null : X.why.quarter : X.why.year : X.why.agency : X.why.category : X.why.key : X.why.sha : X.why.noFile;
}
function Tu(e = /* @__PURE__ */ new Date()) {
	let t = e.getFullYear() - 1911;
	return [
		t - 2,
		t - 1,
		t,
		t + 1
	];
}
var Eu = (e) => e.image instanceof Blob && e.image.size > 0 && !!e.box;
function Du(e, t, n = !0) {
	if (e.length !== t) return e.length + 1;
	for (let t = 0; t < e.length; t++) {
		let n = e[t];
		if (n.page !== t + 1) return t + 1;
		if (n.mode === "whole") {
			if (!Eu(n) || n.box.x !== 0 || n.box.y !== 0 || n.reason !== "") return n.page;
		} else if (n.mode !== "skip" || n.image !== null || n.box !== null || !n.reason) return n.page;
	}
	return !n || e.some((e) => e.mode === "whole") ? null : 1;
}
function Ou(e) {
	if (!e.length) return {
		file: 0,
		page: 1
	};
	if (e.length === 1) {
		let t = Du(e[0].entries, e[0].pageCount);
		return t === null ? null : {
			file: 0,
			page: t
		};
	}
	for (let t = 0; t < e.length; t++) {
		let n = Du(e[t].entries, e[t].pageCount, !1);
		if (n !== null) return {
			file: t,
			page: n
		};
	}
	return e.some((e) => e.entries.some((e) => e.mode === "whole")) ? null : {
		file: 0,
		page: 1
	};
}
var ku = 1600;
function Au(e, t, n = ku) {
	let r = e > n ? n / e : 1;
	return r === 1 ? {
		w: e,
		h: t
	} : {
		w: Math.round(e * r),
		h: Math.round(t * r)
	};
}
var ju = (e, t) => Ft(e, t).ok;
function Mu(e, t, n) {
	let r = Au(t, n);
	return ju(r.w, r.h) ? null : Pu(e, X.noSize);
}
function Nu(e) {
	let t = [...e].sort((e, t) => e.page - t.page), n = t.filter((e) => e.mode !== "whole"), r = t.length - n.length;
	return t.length ? n.length ? {
		line: r > 0 ? X.restSend(r) : null,
		skips: n
	} : {
		line: X.allSend(t[0].page, t[t.length - 1].page, r),
		skips: n
	} : {
		line: null,
		skips: n
	};
}
var Pu = (e, t) => ({
	page: e,
	mode: "skip",
	image: null,
	box: null,
	reason: t
});
function Fu(e) {
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
function Iu() {
	try {
		return typeof state < "u" && !!state && state.currentTab === "water" && !!state.currentProjectId;
	} catch {
		return !1;
	}
}
function Lu() {
	try {
		return typeof state < "u" && !!state && state.currentTab === "air" && !!state.currentProjectId;
	} catch {
		return !1;
	}
}
function Ru() {
	try {
		return typeof state < "u" && !!state && state.currentTab === "noise" && !!state.currentProjectId;
	} catch {
		return !1;
	}
}
var zu = () => Iu() ? "gw" : Lu() ? "air" : Ru() ? "noise" : null;
function Bu() {
	try {
		return typeof AGENCY_CODES > "u" || !AGENCY_CODES ? [] : Object.entries(AGENCY_CODES).map(([e, t]) => ({
			code: String(e),
			name: String(t)
		}));
	} catch {
		return [];
	}
}
function Z(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var Vu = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
function Hu(e, t, n = {}) {
	let r = 0, i = null, a = [], o = /* @__PURE__ */ new Map(), s = !1, c = [], l = !1, u = [], d = null, f = null, p = n.onConfirm ?? ((e) => d ? d.run(e) : void 0), m = () => !!d && d.busy(), h = () => !!d && d.ended(), g = () => m() || h(), _ = () => c.flatMap((e) => e.entries), v = () => _().filter((e) => e.mode === "whole").length, y = () => c.length > 0 && c.every((e) => e.pageCount > 0 && e.entries.length === e.pageCount), b = () => ({
		preparing: s,
		hasFile: c.length > 0 && c.every((e) => e.pageCount > 0),
		sendCount: v(),
		hasKey: !!fn(),
		confirmed: l,
		hasSha: c.length > 0 && c.every((e) => !!e.sha),
		reading: m(),
		ended: h(),
		category: f?.category.value ?? "",
		agency: f?.agency.value ?? "",
		year: f?.year.value ?? "",
		quarter: f?.quarter.value ?? ""
	}), x = () => (i === "air" || i === "noise" ? X.summaryAir : X.summary)(v(), _().length - v()), S = () => {
		if (!f) return;
		let e = b(), t = wu(e);
		f.confirm.textContent = l || e.reading || e.ended ? X.confirmed : X.confirm(e.sendCount), f.confirm.disabled = t !== null, f.why.textContent = t ?? "", !s && y() && (f.summary.textContent = x()), f.fileCount.hidden = c.length < 2, f.fileCount.textContent = c.length >= 2 ? X.fileCount(c.length) : "";
		let n = g();
		for (let e of [
			f.category,
			f.agency,
			f.year,
			f.quarter
		]) e.disabled = n;
		for (let e of a) e.disabled = n || s;
		d?.refreshLoad();
	}, C = (t) => {
		f?.done.append(Z(e, "div", "edc-xdw-red edc-read-error", t));
	}, w = (t, n, r) => {
		let i = Z(e, "label", "edc-read-field");
		i.append(Z(e, "span", "edc-read-label", n));
		let a = Z(e, "select", "edc-read-input");
		a.id = t;
		let o = Z(e, "option", void 0, X.choose);
		o.value = "", a.append(o);
		for (let t of r) {
			let n = Z(e, "option", void 0, t.text);
			n.value = t.value, a.append(n);
		}
		return a.value = "", i.append(a), {
			wrap: i,
			sel: a
		};
	}, T = (e, t) => {
		let n = c[e]?.entries.find((e) => e.page === t);
		return n ? {
			mode: n.mode,
			image: n.image,
			box: n.box ? { ...n.box } : null
		} : null;
	}, E = () => {
		let r = i === "air", a = i === "noise", o = Z(e, "h3", "edc-read-title", r ? X.titleAir : a ? X.titleNoise : X.title), p = Z(e, "p", "edc-read-intro", X.intro);
		p.id = "edcReadIntro";
		let m = Z(e, "div", "edc-read-progress", X.waiting);
		m.id = "edcReadProgress", m.setAttribute("aria-live", "polite");
		let h = Z(e, "div", "edc-read-summary");
		h.id = "edcReadSummary";
		let g = Z(e, "div", "edc-read-pages");
		g.id = "edcReadPages";
		let _ = Z(e, "div", "edc-read-form");
		_.id = "edcReadForm";
		let v = Z(e, "label", "edc-read-field");
		v.append(Z(e, "span", "edc-read-label", X.category));
		let b = Z(e, "input", "edc-read-input");
		b.type = "text", b.id = "edcReadCategory", b.value = r ? X.categoryAir : a ? X.categoryNoise : X.categoryDefault, b.autocomplete = "off", (r || a) && (b.readOnly = !0), v.append(b, Z(e, "span", "edc-read-hint", r ? X.categoryHintAir : a ? X.categoryHintNoise : X.categoryHint)), u = Bu();
		let x = w("edcReadAgency", X.agency, u.map((e) => ({
			value: e.code,
			text: `${e.name}（${e.code}）`
		}))), C = w("edcReadYear", X.year, Tu().map((e) => ({
			value: String(e),
			text: `${e} 年`
		}))), E = w("edcReadQuarter", X.quarter, [
			1,
			2,
			3,
			4
		].map((e) => ({
			value: String(e),
			text: `第 ${e} 季`
		})));
		_.append(v, x.wrap, C.wrap, E.wrap);
		let te = Z(e, "div", "edc-read-confirm-row"), D = Z(e, "button", "edc-xdw-btn edc-read-confirm");
		D.type = "button", D.id = "edcReadConfirm";
		let ne = Z(e, "span", "edc-read-why-disabled");
		ne.id = "edcReadDisabledWhy", te.append(D, ne);
		let re = Z(e, "div", "edc-read-filecount");
		re.id = "edcReadFileCount", re.hidden = !0;
		let ie = Z(e, "div", "edc-read-done");
		ie.id = "edcReadDone", ie.setAttribute("aria-live", "polite");
		let ae = Z(e, "div", "edc-read-runslot");
		t.replaceChildren(o, p, m, h, g, _, te, re, ie, ae), f = {
			progress: m,
			summary: h,
			pages: g,
			category: b,
			agency: x.sel,
			year: C.sel,
			quarter: E.sel,
			confirm: D,
			why: ne,
			done: ie,
			fileCount: re
		}, d = xu(e, ae, {
			canLoad: () => s ? X.why.preparing : y() ? c.some((e) => !e.sha) ? X.why.sha : null : X.why.noFile,
			shas: () => c.length && c.every((e) => !!e.sha) ? c.map((e) => e.sha) : null,
			form: () => i ?? "gw",
			fileNames: () => c.map((e) => e.name),
			frag: T,
			changed: () => {
				try {
					S();
				} catch {}
			},
			closeModal: n.closeModal
		});
		let O = () => {
			try {
				l = !1, S();
			} catch {}
		};
		for (let e of [
			b,
			x.sel,
			C.sel,
			E.sel
		]) e.addEventListener("input", O), e.addEventListener("change", O);
		D.addEventListener("click", () => {
			try {
				ee().catch(() => {});
			} catch {}
		});
	}, ee = async () => {
		if (!f) return;
		if (wu(b()) !== null) {
			S();
			return;
		}
		if (i === "air" ? !Lu() : i === "noise" ? !Ru() : !Iu()) {
			C(i === "air" ? zu() === null ? X.notReady : X.formChanged : i === "noise" ? zu() === null ? X.notReadyNoise : X.formChanged : X.notWater);
			return;
		}
		let e = Ou(c);
		if (e !== null) {
			C(c.length > 1 ? X.inconsistentFile(c[e.file].name, e.page) : X.inconsistent(e.page));
			return;
		}
		let t;
		try {
			let e = c.map((e) => Fu({
				fileName: e.name,
				xdwSha256: e.sha ?? "",
				category: f.category.value,
				agencyCode: f.agency.value,
				agencies: u,
				year: f.year.value,
				quarter: f.quarter.value,
				entries: e.entries
			}));
			t = {
				files: e.map((e) => ({
					fileName: e.fileName,
					xdwSha256: e.xdwSha256,
					pages: e.pages
				})),
				category: e[0].category,
				agency: e[0].agency,
				period: e[0].period
			}, i === "air" ? t.form = "air" : i === "noise" && (t.form = "noise");
		} catch (e) {
			C(X.confirmFail(Vu(e)));
			return;
		}
		l = !0, S();
		try {
			await p(t);
		} catch (e) {
			C(X.confirmFail(Vu(e)));
		}
		S();
	}, te = () => {
		r++, s = !1, c = [], l = !1, a = [], o.clear();
		try {
			d?.reset();
		} catch {}
		f && (f.pages.replaceChildren(), f.summary.replaceChildren(), f.done.replaceChildren(), f.progress.textContent = X.waiting, S());
	}, D = () => {
		if (te(), i = zu(), t.hidden = !1, i) {
			E(), S();
			return;
		}
		f = null, d = null;
		let n = Z(e, "div", "edc-read-why", X.notAvailable);
		t.replaceChildren(n);
	}, ne = (t, n) => {
		let r = Z(e, "div", "edc-read-page " + (t.mode === "whole" ? "edc-read-page-ok" : "edc-read-page-bad"));
		n !== null && (r.dataset.file = String(n)), r.dataset.page = String(t.page), r.dataset.mode = t.mode;
		let i = Z(e, "div", "edc-read-page-head");
		return i.append(Z(e, "strong", void 0, `第 ${t.page} 頁`)), t.mode === "whole" ? i.append(Z(e, "span", "edc-read-ok", X.ok)) : i.append(Z(e, "span", "edc-read-bad", X.bad + t.reason)), r.append(i), r;
	}, re = async (e, t, n) => {
		let r = t.index + 1, i = Mu(r, t.width, t.height);
		if (i) return i;
		try {
			let i = await Dt(() => e.render(t.index, ku)), a = i.width, o = i.height, s = null;
			try {
				if (!n()) return null;
				ju(a, o) && (s = await Bt(i));
			} finally {
				i.width = 0, i.height = 0;
			}
			return ju(a, o) ? !s || s.size <= 0 ? Pu(r, X.pngFail) : {
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
			} : Pu(r, X.noSize);
		} catch (e) {
			return Pu(r, X.pageFail(Vu(e)));
		}
	}, ie = (t, n, r) => {
		let i = c[t], u = Z(e, "div", "edc-read-pick");
		u.dataset.file = String(t), n || (u.id = "edcReadPick"), u.append(Z(e, "div", "edc-read-pick-hint", X.pickHint));
		for (let n of i.entries.filter((e) => e.mode === "whole")) {
			let c = Z(e, "label", "edc-read-pick-item"), d = Z(e, "input");
			d.type = "checkbox", d.checked = !0, d.dataset.file = String(t), d.dataset.page = String(n.page), d.addEventListener("change", () => {
				try {
					if (g() || s) {
						S();
						return;
					}
					let e = `${t}:${n.page}`, a = i.entries.findIndex((e) => e.page === n.page);
					if (a < 0) return;
					!d.checked && i.entries[a].mode === "whole" ? (o.set(e, i.entries[a]), i.entries[a] = Pu(n.page, X.unpicked)) : d.checked && o.has(e) && (i.entries[a] = o.get(e), o.delete(e)), r && (r.textContent = Nu(i.entries).line ?? ""), l = !1, S();
				} catch {}
			}), c.append(d, Z(e, "span", void 0, X.pickLabel(n.page))), a.push(d), u.append(c);
		}
		return u;
	};
	return e.addEventListener("click", (e) => {
		try {
			let t = e.target;
			f && t && typeof t.closest == "function" && t.closest("#edcXdwConnect") && S();
		} catch {}
	}), {
		prepare: D,
		start: async (t, n) => {
			if (!i || !f) return;
			if (zu() !== i) {
				D();
				return;
			}
			te();
			let a = r, o = () => a === r && n(), l = t.length > 1;
			c = t.map((e) => ({
				name: e.fileName,
				sha: e.sha,
				pageCount: e.decoded.pages.length,
				entries: []
			})), s = !0, S();
			try {
				for (let n = 0; n < t.length; n++) {
					let r = t[n].decoded, a = c[n], s = f.pages;
					if (l) {
						s = Z(e, "div", "edc-read-file"), s.dataset.file = String(n);
						let t = Z(e, "div", "edc-read-file-title", X.fileTitle(a.name, a.pageCount));
						t.dataset.file = String(n), s.append(t), f.pages.append(s);
					}
					for (let e = 0; e < r.pages.length; e++) {
						if (!o() || !f) return;
						f.progress.textContent = (l ? X.filePrefix(n + 1, t.length, a.name) : "") + X.preparing(e + 1, a.pageCount);
						let i = await re(r, r.pages[e], o);
						if (!i || !o() || !f) return;
						a.entries.push(i), i.mode !== "whole" && s.append(ne(i, l ? n : null)), S(), await new Promise((e) => setTimeout(e, 0));
					}
					if (!o() || !f) return;
					let u = Nu(a.entries), d = null;
					u.line !== null && (d = Z(e, "div", "edc-read-pages-all", u.line), l ? (d.dataset.file = String(n), s.children[0].after(d)) : (d.id = "edcReadPagesAll", f.pages.prepend(d))), (i === "air" || i === "noise") && s.append(ie(n, l, d));
				}
				if (!o() || !f) return;
				f.progress.textContent = "", f.summary.textContent = x();
			} finally {
				a === r && (s = !1, S());
			}
		},
		reset: te,
		refresh: S,
		busy: m,
		submitting: () => !!d && d.submitting()
	};
}
//#endregion
//#region src/xdw/modal.ts
var Uu = "edcXdwModal", Q = {
	title: "📄 匯入檔案（XDW）",
	notice: "選檔後只在這台電腦解開。按下『開始讀取』之前，不會把任何內容傳出去；按下後，會送出的每一頁會整頁送到 Claude（Anthropic）讀取。",
	noticeOther: "選檔後只在這台電腦解開並預覽，不會把任何內容傳出去。這個類別的自動讀值尚未提供。",
	thumbsTitle: "原始頁面（只在這台電腦顯示，不會送出）",
	thumbsTitleWater: "原始頁面（按『開始讀取』後會整頁送到 Claude 讀取）",
	drop: "把 DocuWorks 的 .xdw 檔拖進這裡，或",
	pick: "選擇檔案",
	notXdw: "這不是 DocuWorks 的 .xdw 檔",
	oneFile: "一次只能放一個 .xdw 檔",
	tooMany: (e) => `一次最多 10 個 .xdw 檔（這次選了 ${e} 個），一個都沒有解開`,
	tooManyPages: (e) => `一次合計最多 60 頁（這批共 ${e} 頁），一個都沒有解開，請分批選檔`,
	batchBad: "這批檔有問題，整批都沒有解開（不會只讀其中幾個）：",
	badFile: (e, t) => `${e}：${t}`,
	sameName: (e, t) => `「${e}」和「${t}」檔名相同：同一個檔選了兩次`,
	sameSha: (e, t) => `「${e}」和「${t}」內容完全相同（SHA-256 相同）：同一個檔選了兩次`,
	noSha: (e) => `${e}：無法計算 SHA-256，不能判斷有沒有重複選檔`,
	decodeFail: (e, t) => `${e}：${t}`,
	fileHead: (e, t, n) => `檔 ${e}：${t}（共 ${n} 頁）`,
	batchCount: (e, t) => `${e} 個檔，共 ${t} 頁`,
	failTail: "這個檔目前讀不了，請先用人工輸入，並把這個檔交給 David。",
	warnTail: "這個檔可能不完整，請核對頁數。",
	decoding: "解開中…",
	busyLeave: "讀值進行中，關閉會中止，這次的結果不保留（可先下載讀值紀錄）",
	submitLeave: "正在把讀值交給原網站，現在關閉會中止。要關閉嗎？"
}, Wu = 1650;
function $(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var Gu = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
function Ku(e) {
	e.querySelectorAll("canvas").forEach((e) => {
		e.width = 0, e.height = 0, e.remove();
	});
}
function qu(e, t = (e) => Ot(e), n = (e) => kt(e)) {
	let r = null, i = 0, a = [], o = 0, s = () => {
		if (r && r.overlay.isConnected) return r;
		e.getElementById(Uu)?.remove();
		let t = $(e, "div", "edc-xdw-overlay");
		t.id = Uu, t.hidden = !0, t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-labelledby", "edcXdwTitle");
		let n = $(e, "div", "edc-xdw-dialog"), i = $(e, "div", "edc-xdw-head"), a = $(e, "h2", "edc-xdw-title", Q.title);
		a.id = "edcXdwTitle";
		let o = $(e, "button", "edc-xdw-close", "✕ 關閉");
		o.type = "button", o.id = "edcXdwClose", i.append(a, o);
		let s = $(e, "p", "edc-xdw-note", Q.notice);
		s.id = "edcXdwNotice";
		let u = $(e, "div", "edc-xdw-drop");
		u.id = "edcXdwDrop";
		let d = $(e, "input");
		d.type = "file", d.accept = ".xdw", d.id = "edcXdwFile", d.multiple = !0, d.hidden = !0;
		let f = $(e, "button", "edc-xdw-btn edc-xdw-pick", Q.pick);
		f.type = "button", f.id = "edcXdwPick", u.append(e.createTextNode(Q.drop), f, d);
		let p = $(e, "div", "edc-xdw-status");
		p.id = "edcXdwStatus", p.setAttribute("aria-live", "polite");
		let h = $(e, "div", "edc-xdw-errors");
		h.id = "edcXdwErrors", h.hidden = !0;
		let g = $(e, "h3", "edc-xdw-thumbs-title", Q.thumbsTitle);
		g.id = "edcXdwThumbsTitle", g.hidden = !0;
		let _ = $(e, "div", "edc-xdw-thumbs");
		_.id = "edcXdwThumbs";
		let v = $(e, "section", "edc-read");
		v.id = Cu, v.hidden = !0;
		let y = $(e, "section", "edc-xdw-connect");
		y.id = "edcXdwConnect", y.hidden = !0, n.append(i, s, u, p, h, g, _, v, y);
		let b = $(e, "div", "edc-xdw-zoom");
		b.id = "edcXdwZoom", b.hidden = !0;
		let x = $(e, "div", "edc-xdw-zoom-bar"), S = $(e, "span"), C = $(e, "button", "edc-xdw-close", "✕ 關閉放大");
		C.type = "button", C.id = "edcXdwZoomClose", x.append(S, C);
		let w = $(e, "div");
		w.id = "edcXdwZoomBody", b.append(x, w), t.append(n, b);
		let T = (e) => () => {
			try {
				Promise.resolve(e()).catch(() => {});
			} catch {}
		};
		return o.addEventListener("click", T(() => {
			c() && m.close();
		})), C.addEventListener("click", T(() => l())), f.addEventListener("click", T(() => d.click())), d.addEventListener("change", T(() => {
			let e = d.files;
			if (!(!e || !e.length)) {
				if (!c()) {
					d.value = "";
					return;
				}
				return m.handleFiles(Array.from(e));
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
				t && t.length && c() && m.handleFiles(Array.from(t)).catch(() => {});
			} catch {}
		}), (e.body ?? e.documentElement).append(t), r = {
			overlay: t,
			close: o,
			input: d,
			drop: u,
			status: p,
			errors: h,
			thumbs: _,
			connect: y,
			zoom: b,
			zoomTitle: S,
			zoomBody: w,
			note: s,
			thumbsTitle: g,
			read: Hu(e, v, { closeModal: () => m.close() })
		}, r;
	}, c = () => {
		try {
			if (!r) return !0;
			let t = r.read.busy() ? Q.busyLeave : r.read.submitting() ? Q.submitLeave : null;
			return t === null || (e.defaultView ?? window).confirm(t);
		} catch {
			return !1;
		}
	}, l = () => {
		o++, r && (r.zoom.hidden = !0, Ku(r.zoomBody), r.zoomBody.replaceChildren());
	}, u = () => {
		i++, l();
		let e = a;
		a = [];
		for (let t of e) t.close().catch(() => {});
		if (r) {
			try {
				r.read.reset();
			} catch {}
			r.thumbsTitle.hidden = !0, Ku(r.thumbs), r.thumbs.replaceChildren(), r.status.replaceChildren(), r.errors.replaceChildren(), r.errors.hidden = !0;
		}
	}, d = (t, n) => {
		if (!r) return;
		let i = $(e, "ul");
		for (let n of t) i.append($(e, "li", void 0, n));
		r.errors.replaceChildren(i, $(e, "div", "edc-xdw-red", n)), r.errors.hidden = !1;
	}, f = (t) => {
		r && r.status.replaceChildren($(e, "span", "edc-xdw-red", t));
	}, p = async (t, n, i, s = "") => {
		if (!r || !a.includes(t)) return;
		l();
		let c = ++o;
		r.zoomTitle.textContent = `${s}第 ${n + 1} 頁（原始 ${i.width}×${i.height}）`, r.zoomBody.replaceChildren($(e, "div", void 0, Q.decoding)), r.zoom.hidden = !1;
		try {
			let e = await Dt(() => t.render(n, Wu));
			if (c !== o || !a.includes(t)) {
				e.width = 0, e.height = 0;
				return;
			}
			e.id = "edcXdwZoomCanvas", r.zoomBody.replaceChildren(e);
		} catch (t) {
			if (c !== o) return;
			r.zoomBody.replaceChildren($(e, "div", "edc-xdw-thumb-bad", `第 ${n + 1} 頁無法顯示：${Gu(t)}`));
		}
	}, m = {
		open() {
			let e = s(), t = zu() !== null;
			e.note.textContent = t ? Q.notice : Q.noticeOther, e.thumbsTitle.textContent = t ? Q.thumbsTitleWater : Q.thumbsTitle;
			try {
				e.read.prepare();
			} catch {}
			e.overlay.hidden = !1;
			try {
				e.close.focus();
			} catch {}
		},
		close() {
			u(), r && (r.input.value = "", r.connect.querySelectorAll("input").forEach((e) => {
				e.value = "";
			}), r.overlay.hidden = !0);
		},
		getConnectSlot() {
			return s().connect;
		},
		async handleFiles(r) {
			let o = s();
			u();
			let c = i, l = Array.from(r);
			if (!l.length) return;
			if (l.length > 10) {
				f(Q.tooMany(l.length));
				return;
			}
			let m = l.length > 1, h = [];
			for (let e of l) {
				let t;
				try {
					t = new Uint8Array(await e.slice(0, 1).arrayBuffer());
				} catch (t) {
					if (c !== i) return;
					h.push(m ? Q.badFile(e.name, `${Q.notXdw}（${Gu(t)}）`) : `${Q.notXdw}（${Gu(t)}）`);
					continue;
				}
				if (c !== i) return;
				(!/\.xdw$/i.test(e.name) || t[0] !== 96) && h.push(m ? Q.badFile(e.name, Q.notXdw) : Q.notXdw);
			}
			for (let e = 0; e < l.length; e++) for (let t = e + 1; t < l.length; t++) as(l[e].name) === as(l[t].name) && h.push(Q.sameName(l[e].name, l[t].name));
			if (h.length) {
				if (!m) {
					f(h[0]);
					return;
				}
				o.status.replaceChildren($(e, "span", "edc-xdw-red", Q.batchBad)), d(h, "");
				return;
			}
			o.status.replaceChildren($(e, "span", void 0, `${m ? `${l.length} 個檔` : l[0].name}：${Q.decoding}`));
			let g = [], _ = [];
			try {
				for (let e of l) {
					let t = new Uint8Array(await e.arrayBuffer());
					if (c !== i) return;
					let n;
					try {
						n = await Wt(t);
					} catch {
						n = null;
					}
					if (c !== i) return;
					g.push(t), _.push(n);
				}
			} catch (t) {
				if (c !== i) return;
				o.status.replaceChildren($(e, "span", void 0, m ? Q.batchBad : l[0].name)), d([Gu(t)], Q.failTail);
				return;
			}
			if (m) {
				let t = [];
				for (let e = 0; e < l.length; e++) {
					_[e] === null && t.push(Q.noSha(l[e].name));
					for (let n = e + 1; n < l.length; n++) _[e] !== null && _[e] === _[n] && t.push(Q.sameSha(l[e].name, l[n].name));
				}
				if (t.length) {
					o.status.replaceChildren($(e, "span", "edc-xdw-red", Q.batchBad)), d(t, "");
					return;
				}
			}
			if (m) {
				let t = 0, r = [];
				for (let e = 0; e < l.length; e++) {
					try {
						t += await n(g[e]);
					} catch (t) {
						r.push(Q.decodeFail(l[e].name, Gu(t)));
					}
					if (c !== i) return;
				}
				if (r.length) {
					o.status.replaceChildren($(e, "span", "edc-xdw-red", Q.batchBad)), d(r, Q.failTail);
					return;
				}
				if (t > 60) {
					f(Q.tooManyPages(t));
					return;
				}
			}
			let v = [], y = () => {
				for (let e of v) e.close().catch(() => {});
			}, b = 0;
			for (let n = 0; n < l.length; n++) {
				let r;
				try {
					r = await t(g[n]);
				} catch (t) {
					if (g[n] = null, c !== i) {
						y();
						return;
					}
					if (y(), !m) {
						o.status.replaceChildren($(e, "span", void 0, l[0].name)), d([Gu(t)], Q.failTail);
						return;
					}
					o.status.replaceChildren($(e, "span", "edc-xdw-red", Q.batchBad)), d([Q.decodeFail(l[n].name, Gu(t))], Q.failTail);
					return;
				}
				if (g[n] = null, v.push(r), c !== i) {
					y();
					return;
				}
				if (b += r.pages.length, m && b > 60) {
					y(), f(Q.tooManyPages(b));
					return;
				}
			}
			a = v;
			let x = $(e, "span", void 0, m ? Q.batchCount(v.length, b) : `共 ${v[0].pages.length} 頁`);
			x.id = "edcXdwPageCount";
			let S = $(e, "span", "edc-xdw-red");
			S.id = "edcXdwBadCount", o.status.replaceChildren($(e, "span", void 0, m ? "" : `${l[0].name}　`), x, S);
			let C = v.flatMap((e, t) => e.warnings.flatMap((e) => e.split("；")).map((e) => e.trim()).filter(Boolean).map((e) => m ? `${l[t].name}：${e}` : e));
			C.length && d(C, Q.warnTail), o.thumbsTitle.hidden = !1;
			let w = v.map((t, n) => {
				if (m) {
					let r = $(e, "div", "edc-xdw-file-head", Q.fileHead(n + 1, l[n].name, t.pages.length));
					r.dataset.file = String(n), o.thumbs.append(r);
				}
				return t.pages.map((t) => {
					let r = $(e, "button", "edc-xdw-thumb");
					return r.type = "button", m && (r.dataset.file = String(n)), r.dataset.page = String(t.index + 1), r.append($(e, "div", "edc-xdw-thumb-cap", `第 ${t.index + 1} 頁・${Q.decoding}`)), o.thumbs.append(r), r;
				});
			}), T = 0;
			for (let t = 0; t < v.length; t++) {
				let n = v[t], r = m ? `檔 ${t + 1}：` : "";
				for (let a of n.pages) {
					if (c !== i) return;
					let o = w[t][a.index], s = `第 ${a.index + 1} 頁・原始 ${a.width}×${a.height}`;
					try {
						let t = await Dt(() => n.render(a.index, 220));
						if (c !== i) {
							t.width = 0, t.height = 0;
							return;
						}
						o.replaceChildren(t, $(e, "div", "edc-xdw-thumb-cap", s)), o.title = "點一下放大", o.addEventListener("click", () => {
							try {
								p(n, a.index, a, r).catch(() => {});
							} catch {}
						});
					} catch (n) {
						if (c !== i) return;
						T++;
						let s = $(e, "div", "edc-xdw-thumb edc-xdw-thumb-bad", `${r}第 ${a.index + 1} 頁無法顯示：${Gu(n)}`);
						m && (s.dataset.file = String(t)), s.dataset.page = String(a.index + 1), o.replaceWith(s), S.textContent = `其中 ${T} 頁無法顯示`;
					}
				}
			}
			if (c !== i) return;
			let E = v.map((e, t) => ({
				decoded: e,
				fileName: l[t].name,
				sha: _[t]
			}));
			try {
				await o.read.start(E, () => c === i && a === v);
			} catch {}
		}
	};
	return e.addEventListener("keydown", (e) => {
		try {
			if (e.key !== "Escape" || !r || r.overlay.hidden) return;
			r.zoom.hidden ? c() && m.close() : l();
		} catch {}
	}), m;
}
//#endregion
//#region src/claude/panel.ts
var Ju = {
	status: "edcClaudeStatus",
	input: "edcClaudeKeyInput",
	save: "edcClaudeSave",
	test: "edcClaudeTest",
	remove: "edcClaudeRemove",
	msg: "edcClaudeMsg",
	results: "edcClaudeResults",
	notice: "edcClaudeNotice"
};
function Yu(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
function Xu(e, t) {
	if (t.hidden = !1, t.querySelector("#" + Ju.status)) return Zu(e), !1;
	let n = Yu(e, "h3", "edc-xdw-connect-title", j.heading), r = Yu(e, "p", "edc-xdw-connect-note", j.notice);
	r.id = Ju.notice;
	let i = Yu(e, "div", "edc-xdw-connect-status");
	i.id = Ju.status, i.setAttribute("aria-live", "polite");
	let a = Yu(e, "div", "edc-xdw-connect-row"), o = Yu(e, "input", "edc-xdw-connect-input");
	o.type = "password", o.id = Ju.input, o.autocomplete = "off", o.spellcheck = !1, o.placeholder = j.placeholder, o.setAttribute("aria-label", j.placeholder), o.setAttribute("data-lpignore", "true");
	let s = (t, n, r = "edc-xdw-btn") => {
		let i = Yu(e, "button", r, n);
		return i.type = "button", i.id = t, i;
	}, c = s(Ju.save, j.save), l = s(Ju.test, j.test), u = s(Ju.remove, j.remove, "edc-xdw-close");
	a.append(o, c, l, u);
	let d = Yu(e, "div", "edc-xdw-connect-msg");
	d.id = Ju.msg, d.setAttribute("aria-live", "polite");
	let f = Yu(e, "ul", "edc-xdw-connect-results");
	f.id = Ju.results, t.replaceChildren(n, r, i, a, d, f);
	let p = (t, n = "ok") => {
		d.replaceChildren(Yu(e, "span", n === "red" ? "edc-xdw-red" : n === "gray" ? "edc-xdw-connect-gray" : "edc-xdw-connect-ok", t));
	}, m = [
		c,
		l,
		u
	], h = !1;
	return c.addEventListener("click", () => {
		try {
			if (h) return;
			let e = ln(o.value);
			if (o.value = "", f.replaceChildren(), !e) {
				p(j.badFormat, "red");
				return;
			}
			if (!pn(e)) {
				p(j.storageFail, "red");
				return;
			}
			p(j.savedOk);
		} catch {}
		try {
			Zu(e);
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
				let t = o.value !== "", n = fn();
				if (!n) {
					p(j.needKey, "red");
					return;
				}
				t && p(j.unsavedNote, "gray");
				for (let t of qt) {
					let r = Yu(e, "li", "edc-xdw-connect-gray", `${t}：${j.testing}`);
					f.append(r);
					let i = await cn(n, t);
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
			if (!t || !t.confirm(j.confirmRemove)) return;
			mn(), o.value = "", f.replaceChildren(), p(j.removed);
		} catch {}
		try {
			Zu(e);
		} catch {}
	}), Zu(e), !0;
}
function Zu(e) {
	let t = e.getElementById(Ju.status);
	if (!t) return;
	let n = fn();
	t.textContent = n ? j.saved(un(n)) : j.none, t.classList.toggle("edc-xdw-connect-has", !!n);
}
function Qu(e) {
	let t = e.getElementById(Ju.input);
	t && (t.value = ""), e.getElementById(Ju.msg)?.replaceChildren(), e.getElementById(Ju.results)?.replaceChildren();
}
//#endregion
//#region src/xdw/index.ts
var $u = null;
function ed(e = document) {
	return $u ||= qu(e), $u;
}
function td(e = document) {
	let t = ed(e);
	t.open();
	try {
		Xu(e, t.getConnectSlot()), Qu(e);
	} catch {}
}
function nd(e = document) {
	St(e, () => td(e));
}
//#endregion
//#region src/main.ts
function rd() {
	let e = t(document.title);
	e !== document.title && (document.title = e);
}
function id() {
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
function ad() {
	let e = document.getElementById("versionBadge");
	if (!e) return;
	let t = e.textContent ?? "", r = n(t, "v1.7");
	r !== t && (e.textContent = r);
}
function od() {
	try {
		rd(), id(), ad();
	} catch {}
}
var sd = !1;
function cd() {
	if (sd) return;
	let e = document.getElementById("versionBadge");
	!e || typeof MutationObserver > "u" || (sd = !0, new MutationObserver(() => {
		try {
			ad();
		} catch {}
	}).observe(e, {
		childList: !0,
		characterData: !0,
		subtree: !0
	}));
}
od(), cd(), document.readyState !== "complete" && document.addEventListener("DOMContentLoaded", () => {
	od(), cd();
}, { once: !0 });
function ld() {
	let e = ae();
	try {
		oe({
			SmartParse: typeof SmartParse < "u" ? SmartParse : void 0,
			ImportEngine: typeof ImportEngine < "u" ? ImportEngine : void 0,
			XLSX: typeof XLSX < "u" ? XLSX : void 0
		}, e), ct(e, typeof SmartParse < "u" ? SmartParse : void 0), pt(e, typeof SmartParse < "u" ? SmartParse : void 0);
	} catch (t) {
		e.mode = "failed", e.hash = "failed", e.errors.push("啟動失敗：" + String(t));
	}
	try {
		nt(e, {
			win: window,
			doc: document,
			getState: () => typeof state < "u" ? state : void 0,
			getCategories: () => typeof CATEGORIES < "u" ? CATEGORIES : void 0,
			getDataStore: () => typeof DataStore < "u" ? DataStore : void 0
		});
	} catch (t) {
		e.mode = "failed", e.hash = "failed", e.errors.push("提醒安裝失敗：" + String(t));
	}
	return e;
}
var ud = null;
try {
	ud = ld();
} catch {}
var dd = () => {
	try {
		ud && tt(ud, document);
	} catch {}
};
dd(), document.readyState === "loading" && document.addEventListener("DOMContentLoaded", dd, { once: !0 }), window.addEventListener("load", dd, { once: !0 });
try {
	Object.defineProperty(window, "__edcPage2Status", {
		configurable: !0,
		get: () => ud ? {
			mode: ud.mode,
			hash: ud.hash,
			wrapped: [...ud.wrapped],
			missing: [...ud.missing],
			errors: [...ud.errors]
		} : null
	});
} catch {}
try {
	nd(document);
} catch {}
//#endregion
