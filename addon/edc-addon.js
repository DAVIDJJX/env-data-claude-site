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
		hashRow: /* @__PURE__ */ new WeakMap(),
		paths: {
			autoDetect: "off",
			readFile: "off",
			prevPeriod: "off",
			oldData: "off"
		},
		genericHash: /* @__PURE__ */ new WeakMap(),
		prevLast: null
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
var ye = "edcItemHashNotice", be = "Claude 版提醒（項目名稱去 #）：", xe = (e) => `🟣 Claude 版：項目名稱開頭的「#」已去掉，共 ${e} 筆`, Se = "無法確認表格裡的舊資料是否帶「#」（讀不到目前的表格），請匯入後檢查表格裡的項目名稱有沒有「#」或重複。", Ce = "報告上項目名稱前面的「#」是檢驗室的標示（例如「依公告檢測方法分析」），申報的項目名稱不帶「#」。Claude 版在讀報告時已去掉，其餘欄位都照原網站的讀法。（這段提醒只在網頁上，不會寫進匯出檔。）", we = /* @__PURE__ */ new Set([
	"water",
	"geo",
	"air"
]), Te = "（版面猜測讀到的）", Ee = (e) => e == null ? "" : String(e), De = (e) => typeof e == "object" && !!e, Oe = (e) => T(e.trim()) ?? e.trim();
function ke(e, t) {
	let n = t.getState(), r = n?.smartResult?.rows;
	if (!n || !Array.isArray(r)) return null;
	let i = Ee(n.importCatKey), a = r.filter((t) => De(t) && e.hashRow.has(t)), o = /* @__PURE__ */ new Map(), s = 0;
	if (we.has(i)) for (let e of r) {
		if (!De(e) || !w(e.檢測項目)) continue;
		s++;
		let t = Ee(e.採樣地點), n = Ee(e.檢測項目), r = t + "\0" + n, i = o.get(r) ?? {
			station: t,
			item: n,
			count: 0
		};
		i.count++, o.set(r, i);
	}
	let c = Ee(n.importPeriod).trim(), l = new Set(r.filter(De).map((e) => Ee(e.檢測項目))), u = [];
	if (a.length || s || we.has(i)) try {
		let e = Ee(n.importProjectId) || Ee(n.currentProjectId), r = t.getDataStore?.();
		if (!r || typeof r.getData != "function" || !e) throw Error("讀不到 DataStore");
		let a = r.getData(e, i);
		if (!Array.isArray(a)) throw Error("getData 不是陣列");
		let o = /* @__PURE__ */ new Map();
		for (let e of a) {
			let t = Ee(De(e) ? e.檢測項目 : "");
			if (!w(t)) continue;
			let n = Oe(t);
			if (n === t.trim() || !l.has(n)) continue;
			let r = o.get(t) ?? {
				name: t,
				bare: n,
				count: 0,
				samePeriod: 0
			};
			r.count++, c && Ee(e._period).trim() === c && r.samePeriod++, o.set(t, r);
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
function Ae(e, t) {
	let n = new Set(t.rows.filter(De).map((e) => Ee(e.檢測項目))), r = [];
	return e.querySelectorAll("#smartImportMissingItemsWrap .missing-item-single").forEach((e) => {
		if (!e.checked) return;
		let t = Ee(e.dataset.identityKey).split("::")[0];
		w(t) && n.has(Oe(t)) && r.push(t);
	}), r;
}
var je = (e) => `第 ${e} 頁`;
function Me(e, t) {
	let n = t.doc, r = n.getElementById(ye), i = ke(e, t), a = n.getElementById("smartImportSummary");
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
		l.append(c("div", xe(i.stripped.length), "font-weight:700;font-size:15px")), l.append(c("div", Ce, "margin:2px 0 8px"));
		let n = new Set(i.stripped.map((e) => Ee(e._sourceFile))).size > 1, r = i.stripped.some((t) => e.hashRow.get(t).page >= 3), a = c("div", null, `${i.stripped.length > 8 ? "max-height:300px;overflow:auto;" : ""}background:#fff;border:1px solid #dce5ea;border-radius:4px`), o = c("table", null, "border-collapse:collapse;width:100%;font-size:13px"), s = c("thead"), u = c("tr");
		[
			"來源（工作表!儲存格）",
			"測站",
			"報告原文（項目）",
			"匯入後的項目",
			"狀態"
		].forEach((e, t) => u.append(c("th", e, `text-align:left;padding:5px 8px;background:#ece6f5;border-bottom:1px solid #dce5ea;position:sticky;top:0${t === 0 || t === 4 ? ";white-space:nowrap" : ""}`))), s.append(u), o.append(s);
		let d = c("tbody"), f = Ye(i.rows, t);
		i.stripped.forEach((t, i) => {
			let a = e.hashRow.get(t), o = Ee(t._sourceSheet), s = a.cell ? `${o}!${a.cell}` : `${o} 第 ${a.rowGuess ?? "?"} 列（位址未確認）`, l = `${n && Ee(t._sourceFile) ? Ee(t._sourceFile) + " / " : ""}${s}${r ? `（${je(a.page)}）` : ""}${a.via === "autodetect" ? Te : ""}`, u = c("tr");
			u.dataset.edcHashRow = String(i), [
				l,
				Ee(t.採樣地點),
				a.raw,
				Ee(t.檢測項目)
			].forEach((e, t) => u.append(c("td", e, `padding:4px 8px;border-bottom:1px solid #eef2f5${t === 0 ? ";white-space:nowrap" : ""}`)));
			let p = c("td", f ? f.has(t) ? He : Ue : We, "padding:4px 8px;border-bottom:1px solid #eef2f5;white-space:nowrap");
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
	} else if (s) {
		let e = c("div", null, u);
		e.dataset.edc = "hash-unknown", e.append(c("div", "⚠️ 無法確認表格裡的舊資料是否帶「#」（讀不到目前的表格），請匯入後檢查表格裡的項目名稱有沒有「#」或重複。按「確認匯入」時會先問。", "font-weight:700")), l.append(e);
	}
	let d = n.getElementById("edcPage2Notice") ?? a;
	return r ? r.replaceWith(l) : d.after(l), l;
}
function Ne(e, t) {
	let n = t.doc.getElementById(ye);
	if (!n) return;
	let r = ke(e, t);
	if (!r) return;
	let i = Ye(r.rows, t);
	n.querySelectorAll("tr[data-edc-hash-row]").forEach((e) => {
		let t = r.stripped[Number(e.dataset.edcHashRow)], n = e.querySelector("td[data-edc-status]");
		if (!n) return;
		let a = t && i ? i.has(t) ? He : Ue : We;
		n.textContent !== a && (n.textContent = a);
	});
}
function Pe(e, t) {
	let n = ke(e, t);
	if (!n) return null;
	let r = [];
	n.stillHashRows && r.push(`有 ${n.stillHashRows} 筆的項目名稱開頭仍是「#」，Claude 版沒有自動去掉，請匯入後在表格裡手動改。`);
	let i = Ae(t.doc, n);
	i.length && r.push(`下方『差異建議』仍勾選了 ${i.length} 項帶「#」的新增空白列（例：「${i[0]}」）；這次的項目已是去掉「#」的名字，確認後會多出這些空白列。`), n.old === null && (n.stripped.length || n.stillHashRows) && r.push(Se);
	let a = (n.old ?? []).filter((e) => e.samePeriod > 0);
	return a.length && r.push(`這一季已經有「${a[0].name}」等 ${a.reduce((e, t) => e + t.samePeriod, 0)} 筆帶「#」的舊資料，確認後不會被更新，表格會多出去掉「#」的同一筆。`), r.length ? `${be}${r.join("\n")}\n\n詳細請看確認畫面上的紅字。仍要匯入嗎？` : null;
}
//#endregion
//#region src/page2/notice.ts
var Fe = "edcPage2Notice", Ie = "Claude 版提醒（第 2 頁補讀）：", Le = "⚠️ Claude 版的第 2 頁補讀目前無法使用（原網站程式可能已更新）。這次匯入不會自動補第 2 頁，請對照報告手動核對。", Re = "edcPage2Banner", ze = "⚠️ Claude 版的第 2 頁補讀目前無法使用（原網站程式可能已更新）。匯入水質／地質報告時不會自動補第 2 頁，請對照報告手動核對。", Be = `${Ie}無法確認第 2 頁補讀的狀態（外掛檢查時出錯），請對照報告手動核對第 2 頁以後的值。\n\n仍要匯入嗎？`, Ve = "＊按確認匯入時，會依下方『檢測極限』的處理方式調整", He = "會匯入", Ue = "已取消（不會匯入）", We = "無法確認", Ge = /* @__PURE__ */ new Set(["water", "geo"]), Ke = (e) => e == null ? "" : String(e);
function qe(e, t) {
	let n = t.getState(), r = n?.smartResult?.rows;
	if (!n || !Array.isArray(r)) return null;
	let i = Ke(n.importCatKey);
	return {
		sum: ve(e, r),
		rows: r,
		catKey: i
	};
}
var Je = (e, t) => e.mode === "failed" && Ge.has(t);
function Ye(e, t) {
	try {
		let n = t.win.filterRowsBySelection, r = t.getState(), i = t.getCategories()?.[Ke(r?.importCatKey)];
		if (typeof n != "function" || !i || typeof i.itemField != "string") return null;
		let a = n.call(t.win, e, i.itemField);
		return Array.isArray(a) ? new Set(a) : null;
	} catch {
		return null;
	}
}
var Xe = (e) => `第 ${e} 頁`;
function Ze(e, t, n, r) {
	let i = Ke(e._sourceSheet), a = t.cell ? `${i}!${t.cell}` : `${i} 第 ${t.rowGuess ?? "?"} 列（位址未確認）`;
	return `${n && Ke(e._sourceFile) ? `${Ke(e._sourceFile)} / ` : ""}${a}${r ? `（${Xe(t.page)}）` : ""}`;
}
var Qe = (e) => {
	let t = Ke(e.檢測數值);
	return `${Ke(e.比較關係) ? Ke(e.比較關係) + " " : ""}${t || "（空白）"}`;
};
function $e(e) {
	let t = [];
	return e.file && t.push(e.file), t.push(`工作表「${e.sheet ?? "（不明）"}」`), e.page !== null && t.push(Xe(e.page)), e.headerRow !== null && t.push(`第 ${e.headerRow} 列起`), t.join("　");
}
function et(e, t) {
	let n = t.doc, r = n.getElementById(Fe), i = qe(e, t), a = n.getElementById("smartImportSummary");
	if (!i || !a) return r?.remove(), null;
	let { sum: o, rows: s, catKey: c } = i, l = Je(o, c), u = o.mode === "failed" ? [] : o.filled;
	if (!l && !u.length && !o.skipped.length && !o.mismatches.length && !o.upstreamRead.length) return r?.remove(), null;
	let d = (e, t, r) => {
		let i = n.createElement(e);
		return t != null && (i.textContent = t), r && (i.style.cssText = r), i;
	}, f = d("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #7a5fb0;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	f.id = Fe;
	let p = "margin-top:10px;padding:10px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b";
	if (l) {
		let e = d("div", null, p);
		e.dataset.edc = "failed", e.append(d("div", Le, "font-weight:700")), f.append(e);
	}
	let m = /* @__PURE__ */ new Set();
	for (let e of u) m.add(Ke(e._sourceFile));
	for (let e of [
		...o.skipped,
		...o.mismatches,
		...o.upstreamRead
	]) e.file && m.add(e.file);
	let h = m.size > 1;
	if (u.length) {
		let e = [...new Set(u.map((e) => e._edcPage2.page))].sort((e, t) => e - t), n = e[e.length - 1], r = n >= 3, i = r ? `🟣 Claude 版補讀：第 ${e[0]}～${n} 頁共 ${u.length} 筆（${e.map((e) => `${Xe(e)} ${u.filter((t) => t._edcPage2.page === e).length} 筆`).join("、")}）` : `🟣 Claude 版補讀：第 2 頁共 ${u.length} 筆`;
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
		let m = d("tbody"), g = Ye(s, t);
		u.forEach((e, t) => {
			let n = e._edcPage2, i = d("tr");
			i.dataset.edcRow = String(t), [
				Ze(e, n, h, r),
				Ke(e.採樣地點),
				Ke(e.檢測項目),
				n.raw,
				Qe(e),
				Ke(e.檢測極限) || "—"
			].forEach((e, t) => i.append(d("td", e, `padding:4px 8px;border-bottom:1px solid #eef2f5${t === 0 ? ";white-space:nowrap" : ""}`)));
			let a = d("td", tt(e, g), "padding:4px 8px;border-bottom:1px solid #eef2f5;white-space:nowrap");
			a.dataset.edcStatus = "", i.append(a), m.append(i);
		}), o.append(m), a.append(o), f.append(a);
		let _ = d("div", Ve, "margin-top:4px;font-size:12px;color:#5b6b78");
		_.dataset.edc = "limit-note", f.append(_);
	}
	if (o.upstreamRead.length && f.append(d("div", `原網站已讀到 ${o.upstreamRead.length} 個第 2 頁以後的區塊（Claude 版沒有重複補）。`, "margin-top:8px;color:#7a8791;font-size:13px")), !l && o.skipped.length) {
		let e = d("div", null, p);
		e.dataset.edc = "skipped", e.append(d("div", `⚠️ 有 ${o.skipped.length} 個第 2 頁區塊沒有自動補，請對照報告手動補上`, "font-weight:700")), o.skipped.forEach((t) => e.append(d("div", `・${$e(t)}：${t.reason}`))), f.append(e);
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
function tt(e, t) {
	return t ? t.has(e) ? He : Ue : We;
}
function nt(e, t) {
	let n = t.doc.getElementById(Fe);
	if (!n) return;
	let r = qe(e, t);
	if (!r) return;
	let i = r.sum.mode === "failed" ? [] : r.sum.filled, a = Ye(r.rows, t);
	n.querySelectorAll("tr[data-edc-row]").forEach((e) => {
		let t = i[Number(e.dataset.edcRow)], n = e.querySelector("td[data-edc-status]");
		if (!n) return;
		let r = t ? tt(t, a) : We;
		n.textContent !== r && (n.textContent = r);
	});
}
function rt(e, t) {
	if (!e.needsConfirm) return null;
	if (e.mode === "failed") return Ge.has(t) ? `${Ie}第 2 頁補讀目前無法使用（原網站程式可能已更新），這次匯入不會自動補第 2 頁。\n\n請對照報告手動核對。仍要匯入嗎？` : null;
	let n = [];
	return e.skipped.length && n.push(`有 ${e.skipped.length} 個第 2 頁區塊沒有自動補，請對照報告手動補上。`), e.mismatches.length && n.push(`第 2 頁以後的區塊對帳不符（${e.mismatches.length} 張工作表），可能有沒補也沒列出的區塊。`), `${Ie}${n.join("\n")}\n\n詳細請看確認畫面上的紅字。仍要匯入嗎？`;
}
function it(e, t) {
	let n = t.getElementById(Re);
	if (e.mode !== "failed") {
		n?.remove();
		return;
	}
	if (n || !t.body) return;
	let r = t.createElement("div");
	r.id = Re, r.setAttribute("role", "alert"), r.textContent = ze, r.style.cssText = "position:sticky;top:0;z-index:2147483000;margin:0;padding:8px 14px;background:#fdf1f0;border-bottom:2px solid #d9534f;color:#8a1f1b;font-weight:700;font-size:14px;line-height:1.5", t.body.prepend(r);
}
var at = [];
function ot(e) {
	at.includes(e) || at.push(e);
}
var st = [];
function ct(e) {
	st.includes(e) || st.push(e);
}
function lt(e, t) {
	let n = t.win, r = /* @__PURE__ */ new WeakSet(), i = !0, a = () => {
		let n = t.doc.getElementById("smartImportSummary");
		!n || r.has(n) || typeof MutationObserver > "u" || (r.add(n), new MutationObserver(() => {
			try {
				nt(e, t);
			} catch (t) {
				e.errors.push("更新狀態欄失敗：" + String(t));
			}
			try {
				Ne(e, t);
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
		for (let t of at) try {
			t();
		} catch (t) {
			e.errors.push("畫確認畫面前的外掛步驟失敗：" + String(t));
		}
		let r;
		try {
			r = o.apply(this, n);
		} finally {
			for (let t of st) try {
				t();
			} catch (t) {
				e.errors.push("畫確認畫面後的外掛步驟失敗：" + String(t));
			}
		}
		try {
			et(e, t), Me(e, t), a(), i = !0;
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
			let n = qe(e, t), r = [];
			if (n) {
				let e = rt(n.sum, n.catKey);
				e && r.push(e);
			}
			let o = Pe(e, t);
			o && r.push(o), a = r.length ? r.join("\n\n") : null;
		} catch (t) {
			e.errors.push("匯入前檢查失敗：" + String(t)), a = Be;
		}
		if (!(a !== null && !n.confirm(a))) return s.apply(this, r);
	}, e.wrapped.push("confirmSmartImport")) : e.missing.push("confirmSmartImport"), (!e.wrapped.includes("renderSmartImportPreview") || !e.wrapped.includes("confirmSmartImport")) && (e.mode = "failed", e.hash = "failed");
}
//#endregion
//#region src/xdwread/template-gw.ts
var ut = {
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
}, dt = {
	A: ut.A.length,
	B: ut.B.length
}, ft = {
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
}, pt = {
	report_no: "報告編號",
	sample_name: "樣品名稱",
	sample_time: "採樣時間"
}, mt = /^[A-Z]{2}\d{3}[A-Z]\d{4}N?$/, ht = {
	氫離子濃度指數: "pH",
	溶氧量: "溶氧"
}, gt = [{
	item: "導電度",
	from: "μmho/cm25°C",
	to: "μmho/cm"
}], _t = [
	"report_no",
	"sample_name",
	"sample_time"
], vt = [
	..._t,
	"permit",
	"receive_date",
	"columns",
	"rows"
], yt = [
	..._t,
	"columns",
	"rows"
], bt = ["label", "value"], xt = [
	"item",
	"unit",
	"result",
	"mdl",
	"method",
	"remark"
], St = [
	"item",
	"unit",
	"result",
	"mdl",
	"method"
];
function Ct(e) {
	return e === "not_json" || e === "extra_text" ? "json" : e === "shape" ? "shape" : null;
}
var wt = /^\s*```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```\s*$/, Tt = (e) => !!e && typeof e == "object" && !Array.isArray(e), Et = (e) => e === null || typeof e == "string";
function Dt(e, t, n) {
	let r = Object.keys(e).filter((e) => !t.includes(e));
	if (r.length) return `${n}多了不該有的鍵（${r.length} 個）`;
	let i = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t));
	return i.length ? `${n}缺少鍵：${i.join("、")}` : null;
}
function Ot(e, t = !1) {
	let n = t ? St : xt;
	if (!Tt(e)) return {
		ok: !1,
		detail: "最外層不是 JSON 物件"
	};
	let r = Dt(e, t ? yt : vt, "最外層");
	if (r) return {
		ok: !1,
		detail: r
	};
	for (let n of t ? _t : [
		..._t,
		"permit",
		"receive_date"
	]) {
		let t = e[n];
		if (!Tt(t)) return {
			ok: !1,
			detail: `${n} 不是物件`
		};
		let r = Dt(t, bt, `${n} `);
		if (r) return {
			ok: !1,
			detail: r
		};
		if (!Et(t.label) || !Et(t.value)) return {
			ok: !1,
			detail: `${n} 的 label／value 要是字串或 null`
		};
	}
	if (!Array.isArray(e.columns)) return {
		ok: !1,
		detail: "columns 不是陣列"
	};
	if (!e.columns.every(Et)) return {
		ok: !1,
		detail: "columns 裡要全是字串或 null"
	};
	if (!Array.isArray(e.rows)) return {
		ok: !1,
		detail: "rows 不是陣列"
	};
	for (let t = 0; t < e.rows.length; t++) {
		let r = e.rows[t];
		if (!Tt(r)) return {
			ok: !1,
			detail: `rows 第 ${t + 1} 列不是物件`
		};
		let i = Dt(r, n, `rows 第 ${t + 1} 列`);
		if (i) return {
			ok: !1,
			detail: i
		};
		for (let e of n) if (!Et(r[e])) return {
			ok: !1,
			detail: `rows 第 ${t + 1} 列的 ${e} 要是字串或 null`
		};
	}
	let i = (e) => ({
		label: e.label,
		value: e.value
	});
	return {
		ok: !0,
		reply: {
			report_no: i(e.report_no),
			sample_name: i(e.sample_name),
			sample_time: i(e.sample_time),
			permit: t ? {
				label: null,
				value: null
			} : i(e.permit),
			receive_date: t ? {
				label: null,
				value: null
			} : i(e.receive_date),
			columns: [...e.columns],
			rows: e.rows.map((e) => ({
				item: e.item,
				unit: e.unit,
				result: e.result,
				mdl: e.mdl,
				method: e.method,
				remark: t ? null : e.remark
			}))
		}
	};
}
function kt(e) {
	try {
		return {
			ok: !0,
			value: JSON.parse(e)
		};
	} catch {
		return { ok: !1 };
	}
}
function At(e, t = !1) {
	if (typeof e != "string" || e.trim() === "") return {
		ok: !1,
		kind: "empty",
		detail: "回覆是空的"
	};
	let n = e, r = !1, i = wt.exec(e);
	i && (n = i[1], r = !0);
	let a = kt(n.trim());
	if (a.ok) {
		let e = Ot(a.value, t);
		return e.ok ? {
			ok: !0,
			reply: e.reply,
			fenced: r
		} : {
			ok: !1,
			kind: "shape",
			detail: e.detail
		};
	}
	let o = e.indexOf("{"), s = e.lastIndexOf("}");
	return o >= 0 && s > o && kt(e.slice(o, s + 1)).ok ? {
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
//#region src/xdwread/verify.ts
var jt = "這一站只讀到 1 頁（另一頁沒有讀成功或沒送）", Mt = [
	"-",
	"－",
	"—",
	"–"
], A = (e) => e.replace(/\s+/gu, ""), j = (e) => e.normalize("NFKC").replace(/\s+/gu, ""), Nt = (e) => e === null ? null : j(e).replace(/:/g, ""), Pt = (e) => e !== null && Mt.includes(A(e)), Ft = (e) => e !== null && A(e) === "UNREADABLE", It = /^(?:ND|<\d+(?:\.\d+)?|\d+(?:\.\d+)?)$/, Lt = /^\d+(?:\.\d+)?$/, Rt = /^NIEA [A-Z]\d{3}\.\d{2}[A-Z]$/, zt = "NIEA W103";
function Bt(e, t) {
	if (e === null || t === null) return Jt(e === null && t === null ? "備註是空白" : "備註兩次讀值不同（一次空白）");
	let n = e.normalize("NFKC").trim(), r = t.normalize("NFKC").trim();
	return Ft(n) || Ft(r) ? Jt("備註有一次讀不清楚（UNREADABLE）") : n === "" || r === "" ? Jt("備註讀到空字串") : Pt(n) || Pt(r) ? Jt("備註是破折號（沒有內容）") : n === r ? /[\r\n\u2028\u2029]/u.test(n) ? Jt("備註有換行") : [...n].length > 60 ? Jt("備註超過 60 字") : {
		ok: !0,
		out: n
	} : Jt("備註兩次讀值不同");
}
var Vt = /^\s*(\d{3})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})(?:\s*~\s*(\d{2}):(\d{2}))?\s*$/u;
function Ht(e) {
	if (e === null) return null;
	let t = Vt.exec(e);
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
var Ut = /^\s*(\d{3})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})\s*$/u;
function Wt(e) {
	if (e === null) return null;
	let t = Ut.exec(e);
	if (!t) return null;
	let [n, r, i, a, o] = t.slice(1, 6).map(Number);
	return n < 1 || r < 1 || r > 12 || i < 1 || i > new Date(Date.UTC(n + 1911, r, 0)).getUTCDate() || a > 23 || o > 59 ? null : {
		rocYear: n,
		month: r,
		day: i,
		hour: a,
		minute: o
	};
}
var Gt = (e) => Date.UTC(e.rocYear + 1911, e.month - 1, e.day, e.hour, e.minute);
function Kt(e, t, n) {
	let r = (e) => ({
		ok: !1,
		reason: e
	});
	if (!e || !t) return r("沒有讀到「收樣日期」");
	if (Nt(e.label) !== "收樣日期" || Nt(t.label) !== "收樣日期") return r("沒有讀到「收樣日期」標籤");
	let i = e.value, a = t.value;
	if (i === null || a === null || A(i) === "" || A(a) === "") return r("收樣日期是空白");
	if (Ft(i) || Ft(a)) return r("收樣日期有一次讀不清楚（UNREADABLE）");
	if (Pt(i) || Pt(a)) return r("收樣日期是破折號");
	if (A(i) !== A(a)) return r("收樣日期兩次讀值不同");
	let o = Wt(i);
	return o ? Gt(o) < Gt(n) ? r("收樣時間早於採樣起始時間") : {
		ok: !0,
		raw: i,
		date: o
	} : r("收樣日期的寫法無法解析（要像「年.月.日 時:分」，日期要存在）");
}
var qt = (e, t) => e.rocYear === t.rocYear && Math.ceil(e.month / 3) === t.quarter, Jt = (e) => ({
	ok: !1,
	reason: e
});
function Yt(e, t, n, r) {
	if (Ft(t) || Ft(n)) return Jt(`${e}有一次讀不清楚（UNREADABLE）`);
	if (t !== null && A(t) === "" || n !== null && A(n) === "") return Jt(`${e}讀到空字串`);
	let i = t === null, a = n === null, o = Pt(t), s = Pt(n);
	if (i || a || o || s) return r ? i && a || o && s ? {
		ok: !0,
		out: ""
	} : Jt(`${e}兩次讀值不同（一次空白或破折號、一次不同）`) : Jt(i && a ? `${e}是空白` : o && s ? `${e}是破折號（沒有值）` : `${e}兩次讀值不同（空白／破折號）`);
}
function Xt(e, t, n, r, i) {
	let a = Yt(e, t, n, i);
	if (a) return a;
	let o = A(t);
	return o === A(n) ? r.test(o) ? {
		ok: !0,
		out: o
	} : Jt(`${e}的寫法不在允許清單內`) : Jt(`${e}兩次讀值不同`);
}
function Zt(e, t, n, r, i) {
	return Yt(e, t, n, r) || (j(t) === j(n) ? i && !i.test(t) ? Jt(`${e}的寫法不在允許清單內`) : {
		ok: !0,
		out: t
	} : Jt(`${e}兩次讀值不同`));
}
function Qt(e, t) {
	return t === null ? `${e} 讀法沒有回覆` : t.ok ? null : `${e} 讀法沒有可用的回覆（${t.detail}）`;
}
function $t(e, t) {
	let n = e.a.columns.length, r = e.b.columns.length, i = null;
	if (n === 5 && r === 5 ? i = "A" : n === 7 && r === 7 ? i = "B" : t.push(n === r ? `表格欄數 ${n} 不是版型的 5 欄或 7 欄` : `A、B 讀到的表格欄數不同（${n}／${r}）`), !i) return null;
	let a = ft[i];
	for (let [n, r] of [["A", e.a], ["B", e.b]]) r.columns.forEach((e, r) => {
		(e === null || j(e) !== j(a[r])) && t.push(`${n} 讀法的表頭第 ${r + 1} 欄欄名不符（應為「${a[r]}」）`);
	});
	return i;
}
function en(e, t, n, r) {
	for (let e of _t) for (let [n, i] of [["A", t.a], ["B", t.b]]) Nt(i[e].label) !== pt[e] && r.push(`${n} 讀法的「${pt[e]}」標籤不符`);
	let i = Xt("報告編號", t.a.report_no.value, t.b.report_no.value, mt, !1);
	i.ok ? e && i.out.endsWith("N") !== (e === "A") && r.push(e === "A" ? "報告編號結尾沒有 N，與 5 欄表格（A 型）不符" : "報告編號結尾有 N，與 7 欄表格（B 型）不符") : r.push(i.reason);
	let a = Zt("樣品名稱", t.a.sample_name.value, t.b.sample_name.value, !1);
	a.ok || r.push(a.reason);
	let o = t.a.sample_time.value, s = t.b.sample_time.value, c = null, l = Yt("採樣時間", o, s, !1);
	return l ? r.push(l.reason) : A(o) === A(s) ? (c = Ht(o)) ? qt(c, n) || r.push(`採樣日期不在選的期別內（${n.rocYear} 年第 ${n.quarter} 季）`) : r.push("採樣時間的寫法無法解析（要像「年.月.日 時:分~時:分」，日期要存在）") : r.push("採樣時間兩次讀值不同"), !i.ok || !a.ok || !c || r.length ? null : {
		reportNo: i.out,
		sampleName: a.out,
		sampleTime: o,
		date: c,
		receive: Kt(t.a.receive_date, t.b.receive_date, c)
	};
}
function tn(e, t, n, r) {
	let i = ut[e][t], a = [], o = Zt("項目名稱", n.item, r.item, !1);
	o.ok ? j(o.out) !== j(i) && a.push(`項目名稱與版型預期「${i}」不符`) : a.push(o.reason);
	let s = e === "A" && i === "水位", c = s && Pt(n.result) && Pt(r.result), l = c ? {
		ok: !0,
		out: ""
	} : Xt("檢測結果", n.result, r.result, It, !1);
	l.ok || a.push(l.reason);
	let u = c ? Bt(n.remark ?? null, r.remark ?? null) : null;
	u && !u.ok && a.push("檢測結果是破折號（沒有值），" + u.reason);
	let d;
	d = e === "A" ? n.mdl === null && r.mdl === null ? {
		ok: !0,
		out: ""
	} : Jt("5 欄表格沒有 MDL 欄，卻讀到 MDL 內容") : Xt("MDL", n.mdl, r.mdl, Lt, !0), d.ok || a.push(d.reason);
	let f = Zt("單位", n.unit, r.unit, !0);
	f.ok || a.push(f.reason);
	let p = Zt("檢驗方法", n.method, r.method, !0, Rt);
	p.ok || a.push(p.reason);
	let m = Pt(n.method) && Pt(r.method);
	if (c && p.ok && !m && a.push("沒有檢測結果的水位列，檢驗方法應是破折號"), a.length || !o.ok || !l.ok || !d.ok || !f.ok || !p.ok || u && !u.ok) return {
		index: t,
		expected: i,
		status: "manual",
		reasons: a,
		a: n,
		b: r,
		out: null
	};
	let h = {
		item: o.out,
		unit: f.out,
		result: l.out,
		mdl: d.out,
		method: p.out
	};
	return c && u?.ok ? (h.level = "remark", h.remark = u.out, h.method = "") : s && m && (h.level = "method", h.method = zt), {
		index: t,
		expected: i,
		status: "pass",
		reasons: [],
		a: n,
		b: r,
		out: h
	};
}
function nn(e, t, n, r) {
	let i = Math.max(t?.rows.length ?? 0, n?.rows.length ?? 0, e ? dt[e] : 0);
	return Array.from({ length: i }, (i, a) => ({
		index: a,
		expected: e ? ut[e][a] ?? "" : "",
		status: "manual",
		reasons: [r],
		a: t?.rows[a] ?? null,
		b: n?.rows[a] ?? null,
		out: null
	}));
}
function rn(e, t, n) {
	let r = (e, t) => e !== null && t !== null && !Ft(e) && !Pt(e) && j(e) !== "" && j(e) === j(t) ? j(e) : null, i = (e, t) => e !== null && t !== null && !Ft(e) && A(e) !== "" && A(e) === A(t) ? A(e) : null, a = r(n.a.sample_name.value, n.b.sample_name.value);
	return a ? {
		idx: e,
		name: a,
		type: t,
		time: i(n.a.sample_time.value, n.b.sample_time.value),
		report: i(n.a.report_no.value, n.b.report_no.value)
	} : null;
}
var an = (e, t) => e.endsWith("N") !== t.endsWith("N") && e.replace(/N$/, "") === t.replace(/N$/, "");
function on(e) {
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
		let s = Qt("A", i.a), c = Qt("B", i.b);
		if (s || c) {
			let e = [s, c].filter((e) => !!e), n = i.a?.ok ? i.a.reply : null, r = i.b?.ok ? i.b.reply : null;
			t.push({
				...o,
				tableType: null,
				reasons: e,
				rows: nn(null, n, r, "整頁需人工：" + e[0])
			});
			return;
		}
		let l = {
			a: i.a.reply,
			b: i.b.reply
		};
		n[a] = l;
		let u = [], d = $t(l, u);
		d && (l.a.rows.length !== dt[d] || l.b.rows.length !== dt[d]) && u.push(`表格列數不對（版型 ${dt[d]} 列，A 讀 ${l.a.rows.length}、B 讀 ${l.b.rows.length}）`);
		let f = en(d, l, e.period, u), p = rn(a, d, l);
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
			t.type && r.type && t.type === r.type && n.push("同一個樣品名稱出現兩頁相同型式的表格"), t.time && r.time && t.time !== r.time && n.push("同一站兩頁的採樣時間不同"), t.report && r.report && !an(t.report, r.report) && n.push("同一站兩頁的報告編號不是只差結尾 N");
		}
		if (n.length) {
			for (let r of e) t[r.idx].reasons.push(...n.map((e) => `站層級：${e}`));
			for (let n of e) t[n.idx].status = "manual", t[n.idx].identity = null;
			continue;
		}
		if (e.length === 1) {
			t[e[0].idx].warnings.push(jt);
			continue;
		}
		for (let [n, r] of [[e[0], e[1]], [e[1], e[0]]]) t[r.idx].status === "manual" && t[n.idx].warnings.push(r.time && r.report && r.type ? "同站另一頁需人工" : "同站另一頁需人工，無法交叉確認");
	}
	t.forEach((e, t) => {
		if (e.status === "skip" || e.rows.length) return;
		let r = n[t];
		if (!r) return;
		if (e.status === "manual") {
			e.rows = nn(e.tableType, r.a, r.b, "整頁需人工：" + e.reasons[0]);
			return;
		}
		let i = e.tableType;
		e.rows = r.a.rows.map((e, t) => tn(i, t, e, r.b.rows[t]));
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
var sn = {
	sameTime: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一站同一時間的報告（可能重複選檔）`,
	sameReport: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一個報告編號（同一份報告不該出現在兩個檔）`
};
function cn(e) {
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
function ln(e) {
	if (e.length < 2) return e.map((e) => e.v);
	let t = [];
	e.forEach((e, n) => e.v.pages.forEach((e, r) => {
		e.status !== "ok" || !e.identity || t.push({
			f: n,
			p: r,
			name: j(e.identity.sampleName),
			time: A(e.identity.sampleTime),
			report: A(e.identity.reportNo).replace(/N$/, "")
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
		a.name === o.name && a.time === o.time && (r(a, sn.sameTime(e[o.f].fileName, c)), r(o, sn.sameTime(e[a.f].fileName, s))), a.report === o.report && (r(a, sn.sameReport(e[o.f].fileName, c)), r(o, sn.sameReport(e[a.f].fileName, s)));
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
			totals: cn(r)
		};
	}) : e.map((e) => e.v);
}
//#endregion
//#region src/xdwread/notice-air.ts
var un = {
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
		mdl: "檢測極限沒有讀、沒有帶入（送出時留空）；若現在有值，是原網站從上一季帶入的（見上方）。",
		unit: "PM10、TSP、PM2.5 的單位是原網站預設的 127；上一季申報是 140，請依申報規則確認。",
		category: "檢測類別是原網站固定的「周界空氣品質」；上一季申報是「大氣環境」，請依申報規則確認。",
		missing: "臭氣、硫化氫、氨氣不在這份 XDW，仍要手動補。",
		pm25dup: "「PM2.5.5 氣象 data.xdw」與 A 檔的 PM2.5 頁相同，不要兩個都匯入。",
		cross: "總表和逐時表的交叉檢查不一致、或無法檢查（逐時表那一頁沒有通過核對）的值，一律沒有帶入（已列在上方「沒有帶入」）。"
	}
}, dn = [
	"nox",
	"mdl",
	"unit",
	"category",
	"missing",
	"pm25dup",
	"cross"
], fn = (e) => !!e && typeof e == "object" && e.air === !0, pn = (e) => e.files.filter((e) => e.fileName !== null).map((e) => e.fileName).join("、"), mn = (e) => e == null ? "" : String(e), hn = (e) => e === "" ? un.empty : e;
function gn(e, t) {
	if (t.length !== e.plan.total || t.some((e) => !e || typeof e != "object" || mn(e._sourceSheet) === "")) return null;
	let n = /* @__PURE__ */ new Set(), r = [], i = /* @__PURE__ */ new Map();
	for (let a of e.plan.sheets) {
		let o = e.preflightRows[a.name];
		if (!Array.isArray(o) || o.length !== a.values.length) return null;
		for (let e of o) {
			let o = mn(e.檢測項目), s = t.filter((e) => mn(e._sourceSheet) === a.name && mn(e.檢測項目) === o);
			if (s.length !== 1 || n.has(s[0])) return null;
			n.add(s[0]);
			let c = s[0];
			for (let t of [.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(c)])].filter((e) => !e.startsWith("_"))) {
				let n = mn(e[t]), s = mn(c[t]);
				if (n !== s) if (n === "" && s !== "") {
					let e = `${t}\u0000${o}\u0000${s}`, n = i.get(e);
					n ? n.n++ : i.set(e, {
						field: t,
						item: o,
						value: s,
						n: 1
					});
				} else r.push(un.rowDiff(a.name, o, t, hn(s)));
			}
		}
	}
	return n.size === t.length ? {
		rowDiffs: r,
		carried: [...i.values()].map((e) => un.carried(e.field, e.item, e.value, e.n))
	} : null;
}
function _n(e) {
	let t = new Set(e.noData), n = e.plan.excluded.filter((e) => !(e.key === null && e.page !== null && t.has(e.page))), r = n.filter((e) => e.key !== null), i = n.filter((e) => e.key === null), a = [...r.map((e) => un.excludedValue(e.page, e.location, e.key, e.reason)), ...i.map((e) => un.excludedPage(e.page, e.reason))];
	return {
		excludedHead: a.length ? un.excludedHead(r.length, i.length) : null,
		excluded: a,
		noData: e.noData.length ? un.noData(e.noData) : null
	};
}
function vn(e, t) {
	let n = e.files, r = n.length > 1, i = n.filter((e) => e.fileName !== null), a = i.reduce((e, t) => e + t.plan.total, 0), o = Array.isArray(t) ? t : null, s = new Set(i.map((e) => e.fileName)), c = !!o && o.length === a && o.every((e) => !!e && typeof e == "object" && (!r || s.has(mn(e._sourceFile)))), l = n.map((e, t) => {
		let n = _n(e);
		if (e.fileName === null) return {
			head: un.fileNoRows(t + 1, e.xdwFileName),
			noRows: !0,
			...n,
			cannotCompare: !1,
			rowDiffs: [],
			carried: []
		};
		let i = null;
		if (c) try {
			i = gn(e, r ? o.filter((t) => mn(t._sourceFile) === e.fileName) : o);
		} catch {
			i = null;
		}
		return {
			head: r ? un.fileHead(t + 1, e.xdwFileName, e.fileName, e.plan.total) : null,
			noRows: !1,
			...n,
			cannotCompare: i === null,
			rowDiffs: i?.rowDiffs ?? [],
			carried: i?.carried ?? []
		};
	});
	return {
		title: r ? un.titleMulti(a, n.map((e) => e.xdwFileName)) : un.title(a, n[0].xdwFileName, n[0].fileName ?? ""),
		files: l,
		multi: r,
		fixed: dn.map((e) => ({
			key: e,
			text: un.fixed[e]
		}))
	};
}
function yn(e, t, n) {
	let r = (t, n, r) => {
		let i = e.createElement(t);
		return n != null && (i.textContent = n), r && (i.style.cssText = r), i;
	}, i = "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b", a = r("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #6a4c9c;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	a.id = n, a.dataset.edcForm = "air";
	let o = r("div", t.title, "font-weight:700;font-size:15px;color:#4b3172");
	o.dataset.edc = "title", a.append(o, r("div", un.titleNote, "margin:2px 0 6px")), t.files.forEach((e, n) => {
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
		if (s.dataset.edc = "carried", s.append(r("div", un.carriedHead, "font-weight:700")), e.cannotCompare) {
			let e = r("div", un.cannot, "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b;font-weight:700");
			e.dataset.edc = "cannot", s.append(e);
		} else {
			if (e.rowDiffs.length) {
				let t = r("div", null, i);
				t.dataset.edc = "row-diffs", t.append(r("div", un.rowDiffHead, "font-weight:700"), ...e.rowDiffs.map((e) => r("div", e))), s.append(t);
			}
			for (let t of e.carried) {
				let e = r("div", t);
				e.dataset.edc = "grouped", s.append(e);
			}
			!e.rowDiffs.length && !e.carried.length && s.append(r("div", un.noCarried));
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
//#region src/xdwread/template-noise.ts
var bn = (e) => e === "N2" || e === "V1", xn = {
	N1: "檢測報告",
	N2: "監測數據逐時紀錄(噪音)",
	V1: "監測數據逐時紀錄(振動)"
}, Sn = [
	"L日監測值",
	"L晚監測值",
	"L夜監測值",
	"Ld監測值",
	"Ln監測值",
	"Leq24監測值"
], Cn = "管制區標準類屬", wn = {
	II: "第二類噪音管制區一般環境",
	III: "第三類噪音管制區一般環境"
}, Tn = [
	"Leq",
	"Lmax",
	"L5",
	"L10",
	"L50",
	"L90",
	"L95"
], En = {
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
}, Dn = [
	"LV(10)eq",
	"LVmax",
	"LV10(1)",
	"LV10(2)",
	"LV10(3)",
	"LV10(4)",
	"LV10(5)"
], On = [
	"LV(10)日(05~19)",
	"LV(10)夜(19~05)",
	"LV(10)eq(24)"
], kn = {
	summary: {
		report_no: "報告編號",
		site_code: "現場編號",
		location: "檢測位置",
		period: "檢測日期/時間",
		zone: Cn
	},
	hourly: {
		site_code: "現場編號",
		location: "監測位置",
		period: "監測日期"
	}
}, An = /^[A-Z]{2}\d{3}[A-Z]\d{4}N?$/, jn = /^NIEA [A-Z]\d{3}\.\d{2}[A-Z]$/, Mn = /^(?:0|[1-9]\d*)(?:\.\d)?$/, Nn = /^(\d{3})\.(\d{2})\.(\d{2})\/(\d{2}):(\d{2})至(\d{3})\.(\d{2})\.(\d{2})\/(\d{2}):(\d{2})$/, Pn = /^(\d{3})\.(\d{2})\.(\d{2})-(\d{2})$/, Fn = /^(\d{2}):00~(\d{2}):00$/, In = [
	"L日",
	"L晚",
	"L夜",
	"Lv10日",
	"Lv10夜"
], Ln = [
	"L日",
	"L晚",
	"L夜"
], Rn = ["Lv10日", "Lv10夜"], zn = {
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
}, Bn = {
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
}, M = {
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
}, Vn = {
	Lv10日: "Lv日(Lv10)=",
	Lv10夜: "Lv夜(Lv10)="
}, Hn = {
	L日: "日間",
	L晚: "晚間",
	L夜: "夜間",
	Lv10日: "日間",
	Lv10夜: "夜間"
}, N = {
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
}, Un = {
	II: "第2類",
	III: "第3類"
}, Wn = (e) => e == null ? "" : String(e);
function Gn(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.plan.sheets) {
		if (n.kind !== "noise" || !n.values.length) continue;
		let r = e.zones[n.station]?.zone ?? null;
		(r === "II" || r === "III") && t.set(n.name, Un[r]);
	}
	return t;
}
function Kn(e, t, n = (e) => Wn(e._sourceSheet)) {
	let r = [];
	for (let i of e) {
		if (!i || typeof i != "object") continue;
		let e = t.get(n(i));
		e !== void 0 && (Wn(i.檢測類別) !== N.noise.category || Wn(i.管制區) !== "" || r.push({
			row: i,
			field: "管制區",
			value: e
		}));
	}
	return r;
}
var qn = /* @__PURE__ */ new WeakSet(), Jn = (e) => !!e && typeof e == "object" && qn.has(e);
function Yn(e, t) {
	if (e.some((e) => Wn(e.row[e.field]) !== t(e)) || e.some((e) => e.field === "時間(迄)" && !Qn(e.row))) return 0;
	for (let t of e) t.row[t.field] = t.value, t.field === "時間(迄)" ? ($n(t.row), er.add(t.row)) : qn.add(t.row);
	return e.length;
}
var Xn = "日期(迄)", Zn = "時間(迄)", Qn = (e) => {
	let t = e && typeof e == "object" ? e._checkFields : void 0;
	return !!t && typeof t == "object" && t["時間(迄)"] === "報告只寫了採樣起始時間，沒有結束時間。時間(迄) 先填成和時間(起) 相同，請依實際採樣結束時間修改。";
};
function $n(e) {
	let t = e._checkFields;
	!t || t["時間(迄)"] !== "報告只寫了採樣起始時間，沒有結束時間。時間(迄) 先填成和時間(起) 相同，請依實際採樣結束時間修改。" || (delete t[Zn], Object.keys(t).length || delete e._checkFields);
}
var er = /* @__PURE__ */ new WeakSet(), tr = (e) => !!e && typeof e == "object" && er.has(e);
function nr(e, t, n = (e) => Wn(e._sourceSheet)) {
	let r = [];
	for (let i of t) {
		if (!i.ok) continue;
		let t = e.filter((e) => !!e && typeof e == "object" && n(e) === i.sheet);
		if (!(t.length === 0 || t.length !== i.rows) && t.every((e) => Wn(e["日期(起)"]) === i.startDate && Wn(e["時間(起)"]) === i.startTime && Wn(e["日期(迄)"]) === i.startDate && Wn(e["時間(迄)"]) === i.startTime && Qn(e))) for (let e of t) r.push({
			row: e,
			field: Xn,
			value: i.endDate,
			old: i.startDate
		}), r.push({
			row: e,
			field: Zn,
			value: i.endTime,
			old: i.startTime
		});
	}
	return r;
}
function rr(e, t, n, r) {
	if (!e || !t || typeof t != "object") return [];
	let i = t;
	if (i._memoryApplied || !Array.isArray(i.rows) || n === "" || n !== r) return [];
	let a = i.rows, o = [];
	if (e.kind === "noise") for (let t of e.files) {
		if (t.fileName === null) continue;
		let e = a.filter((e) => !!e && typeof e == "object" && Wn(e._sourceFile) === t.fileName);
		o.push(...Kn(e, Gn(t)));
	}
	else for (let t of e.files) {
		if (t.fileName === null) continue;
		let e = a.filter((e) => !!e && typeof e == "object" && Wn(e._sourceFile) === t.fileName);
		o.push(...ir(e, t.remarks)), o.push(...nr(e, t.ends ?? []));
	}
	return o;
}
function ir(e, t, n = (e) => Wn(e._sourceSheet)) {
	let r = [];
	for (let i of t) {
		let t = e.filter((e) => !!e && typeof e == "object" && n(e) === i.sheet && Wn(e.檢測項目) === "水位" && Wn(e.備註) === "未檢測" && Wn(e.檢測數值) === "" && Wn(e.檢測方法) === "");
		t.length === 1 && i.remark.trim() !== "" && r.push({
			row: t[0],
			field: "備註",
			value: i.remark
		});
	}
	return r;
}
var ar = "未檢測", or = (e) => e.old === void 0 ? e.field === "管制區" ? "" : ar : e.old, sr = "檢測方法", cr = /* @__PURE__ */ new Map(), lr = /* @__PURE__ */ new WeakMap(), ur = (e) => e && typeof e == "object" ? lr.get(e) ?? [] : [];
function dr(e, t) {
	if (!e || typeof e != "object" || cr.has(e)) return null;
	let n = Object.getOwnPropertyDescriptor(e, sr);
	if (!n || !("value" in n) || n.value !== "" || !n.writable || !n.configurable) return null;
	let r = "", i = lr.get(e) ?? [];
	lr.set(e, i), Object.defineProperty(e, sr, {
		configurable: !0,
		enumerable: n.enumerable,
		get: () => r,
		set: (e) => {
			t() ? r = e : i.push(Wn(e));
		}
	});
	let a = () => {
		cr.delete(e) && (Object.defineProperty(e, sr, {
			configurable: !0,
			enumerable: n.enumerable,
			writable: !0,
			value: r
		}), i.length && e._methodFromMemory === !0 && delete e._methodFromMemory);
	};
	return cr.set(e, a), a;
}
function fr() {
	let e = [...cr.values()];
	for (let t of e) try {
		t();
	} catch {}
	return cr.clear(), e.length;
}
//#endregion
//#region src/xdwread/notice-noise.ts
var P = {
	title: (e, t, n) => `🟣 Claude 版 XDW 讀值（噪音振動）：帶入 ${e} 筆（${t}／${n}）`,
	titleMulti: (e, t) => `🟣 Claude 版 XDW 讀值（噪音振動）：帶入 ${e} 筆（${t.length} 個檔：${t.join("、")}）`,
	titleNote: "這些值由兩個模型各讀一次、兩次完全相同、而且噪音值和噪音總表的值一致才帶入；寫法轉換（去尾 0、單位與方法代碼、日期時間）由原網站的程式處理。請對照報告核對。（這段提醒只在網頁上，不會寫進匯出檔。）",
	fileHead: (e, t, n, r) => `檔 ${e}：${t}／${n}（帶入 ${r} 筆）`,
	fileNoRows: (e, t) => `檔 ${e}：${t} 沒有可帶入的值（沒有產生 xlsx，這個檔沒有交給原網站）`,
	excludedHead: (e, t) => `⚠️ 沒有帶入、要手動補：${[e ? `${e} 個值` : "", t ? `${t} 頁整頁` : ""].filter(Boolean).join("、")}`,
	excludedValue: (e, t, n, r) => `・${e === null ? "（沒有來源頁）" : `第 ${e} 頁`}｜${t}｜${n}｜${r}`,
	excludedPage: (e, t) => `・${e === null ? "（沒有頁碼）" : `第 ${e} 頁`}（整頁）｜${t}`,
	noData: (e) => `沒有資料的頁（封面、目錄、聲明書等；沒有帶入、不算需人工）：第 ${e.join("、")} 頁`,
	zoneHead: "管制區已照報告帶入（噪音列；振動列照原網站填「無」）：",
	zone: (e, t, n) => t === null ? `・${e}：管制區沒有通過核對，沒有帶入，請在測站表選` : n ? `・${e}：${Un[t]}（報告原文「${wn[t]}」）` : `・${e}：這站的噪音值沒有帶入，管制區也沒有帶入（報告原文「${wn[t]}」）`,
	zoneSiteDiff: (e, t, n) => `⚠️ ${e}：測站表顯示的是原網站記住的「${t || "（空白）"}」；匯入的噪音列會是報告的「${n}」。不要改測站表這一格：改了會整站套用，振動列也會被改掉。`,
	carriedHead: "原網站自己帶入的格（不是這次讀到的）",
	rowDiffHead: "⚠️ 下列格子和送進去的不一樣，請逐格核對",
	rowDiff: (e, t, n, r) => `・工作表 ${e}｜${t}｜${n}｜現在的值：${r}`,
	carried: (e, t, n, r) => `・${e}｜${t}｜${n}｜${r} 列——不是這次讀到的，是原網站從上一季帶入`,
	noCarried: "原網站沒有從上一季帶入任何格。",
	cannot: "無法確認原網站有沒有從上一季帶入內容，請逐欄核對",
	empty: "（空白）",
	fixed: {
		vib30: "振動 30.0 是報告以偵測下限出具的值，照帶、沒有加「<」。",
		notCarried: "Ld、Ln、Ldn、Leq24、Lv10eq(24) 與逐時數值沒有帶入。",
		coords: "這份 XDW 沒有座標，外掛不帶座標：請照上一季的測站設定或手動補。",
		agency: "檢測機構是你在讀值視窗選的（報告上的機構名稱外掛不讀），請確認。",
		missing: "營建噪音（BN）與低頻噪音不在這份 XDW，仍走原本的 Excel 匯入。",
		cross: "噪音逐時表的 L日／L晚／L夜 和噪音總表不一致、或無法檢查（總表那一頁沒有通過核對）的值，一律沒有帶入（已列在上方「沒有帶入」）。"
	}
}, pr = [
	"vib30",
	"notCarried",
	"coords",
	"agency",
	"missing",
	"cross"
], mr = (e) => !!e && typeof e == "object" && e.noise === !0, hr = (e) => e.files.filter((e) => e.fileName !== null).map((e) => e.fileName).join("、"), gr = (e) => e == null ? "" : String(e), _r = (e) => e === "" ? P.empty : e, vr = (e) => `${gr(e.檢測類別)}・${gr(e.監測時段)}`;
function yr(e, t) {
	if (t.length !== e.plan.total || t.some((e) => !e || typeof e != "object" || gr(e._sourceSheet) === "")) return null;
	let n = /* @__PURE__ */ new Set(), r = [], i = /* @__PURE__ */ new Map();
	for (let a of e.plan.sheets) {
		let o = e.preflightRows[a.name];
		if (!Array.isArray(o) || o.length !== a.values.length) return null;
		for (let e of o) {
			let o = vr(e), s = t.filter((e) => gr(e._sourceSheet) === a.name && vr(e) === o);
			if (s.length !== 1 || n.has(s[0])) return null;
			n.add(s[0]);
			let c = s[0];
			for (let t of [.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(c)])].filter((e) => !e.startsWith("_"))) {
				let n = gr(e[t]), s = gr(c[t]);
				if (n !== s) if (n === "" && s !== "") {
					let e = `${t}\u0000${o}\u0000${s}`, n = i.get(e);
					n ? n.n++ : i.set(e, {
						field: t,
						item: o,
						value: s,
						n: 1
					});
				} else r.push(P.rowDiff(a.name, o, t, _r(s)));
			}
		}
	}
	return n.size === t.length ? {
		rowDiffs: r,
		carried: [...i.values()].map((e) => P.carried(e.field, e.item, e.value, e.n))
	} : null;
}
function br(e) {
	let t = new Set(e.noData), n = e.plan.excluded.filter((e) => !(e.key === null && e.page !== null && t.has(e.page))), r = n.filter((e) => e.key !== null), i = n.filter((e) => e.key === null), a = [...r.map((e) => P.excludedValue(e.page, e.location, e.key, e.reason)), ...i.map((e) => P.excludedPage(e.page, e.reason))], o = Gn(e), s = /* @__PURE__ */ new Map();
	for (let t of e.plan.sheets) {
		let e = o.get(t.name);
		e !== void 0 && s.set(t.station, e);
	}
	return {
		excludedHead: a.length ? P.excludedHead(r.length, i.length) : null,
		excluded: a,
		noData: e.noData.length ? P.noData(e.noData) : null,
		zones: e.zones.map((e, t) => P.zone(e.location, e.zone, s.has(t))),
		zoneFills: e.zones.flatMap((e, t) => s.has(t) ? [{
			location: e.location,
			value: s.get(t)
		}] : [])
	};
}
function xr(e, t) {
	let n = e.files, r = n.length > 1, i = n.filter((e) => e.fileName !== null), a = i.reduce((e, t) => e + t.plan.total, 0), o = Array.isArray(t) ? t : null, s = new Set(i.map((e) => e.fileName)), c = !!o && o.length === a && o.every((e) => !!e && typeof e == "object" && (!r || s.has(gr(e._sourceFile)))), l = n.map((e, t) => {
		let n = br(e);
		if (e.fileName === null) return {
			head: P.fileNoRows(t + 1, e.xdwFileName),
			noRows: !0,
			...n,
			cannotCompare: !1,
			rowDiffs: [],
			carried: []
		};
		let i = null;
		if (c) try {
			i = yr(e, r ? o.filter((t) => gr(t._sourceFile) === e.fileName) : o);
		} catch {
			i = null;
		}
		return {
			head: r ? P.fileHead(t + 1, e.xdwFileName, e.fileName, e.plan.total) : null,
			noRows: !1,
			...n,
			cannotCompare: i === null,
			rowDiffs: i?.rowDiffs ?? [],
			carried: i?.carried ?? []
		};
	});
	return {
		title: r ? P.titleMulti(a, n.map((e) => e.xdwFileName)) : P.title(a, n[0].xdwFileName, n[0].fileName ?? ""),
		files: l,
		multi: r,
		fixed: pr.map((e) => ({
			key: e,
			text: P.fixed[e]
		}))
	};
}
function Sr(e, t) {
	try {
		for (let n of Array.from(e.querySelectorAll("#smartSitesBody tr[data-site-key]"))) {
			if ((n.dataset.siteKey ?? "").trim() !== t.trim()) continue;
			let e = n.querySelector("[data-site-field=\"管制區\"]");
			return e ? e.value : null;
		}
	} catch {}
	return null;
}
function Cr(e, t, n) {
	let r = (t, n, r) => {
		let i = e.createElement(t);
		return n != null && (i.textContent = n), r && (i.style.cssText = r), i;
	}, i = "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b", a = r("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #6a4c9c;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	a.id = n, a.dataset.edcForm = "noise";
	let o = r("div", t.title, "font-weight:700;font-size:15px;color:#4b3172");
	o.dataset.edc = "title", a.append(o, r("div", P.titleNote, "margin:2px 0 6px")), t.files.forEach((n, o) => {
		let s = a;
		if (t.multi) {
			s = r("div", null, "margin-top:10px;padding-top:6px;border-top:1px dashed #b9a7d6"), s.dataset.edc = "file", s.dataset.file = String(o + 1);
			let e = r("div", n.head, n.noRows ? "font-weight:700;color:#8a1f1b" : "font-weight:700;color:#4b3172");
			e.dataset.edc = n.noRows ? "file-norows" : "file-head", s.append(e), a.append(s);
		}
		if (n.excludedHead) {
			let e = r("div", null, i);
			e.dataset.edc = "excluded", e.append(r("div", n.excludedHead, "font-weight:700"), ...n.excluded.map((e) => r("div", e))), s.append(e);
		}
		if (n.noData) {
			let e = r("div", n.noData, "margin-top:6px");
			e.dataset.edc = "nodata", s.append(e);
		}
		if (n.zones.length) {
			let t = r("div", null, "margin-top:8px");
			t.dataset.edc = "zones", t.append(r("div", P.zoneHead, "font-weight:700"), ...n.zones.map((e) => {
				let t = r("div", e);
				return t.dataset.edc = "zone", t;
			}));
			for (let i of n.zoneFills) {
				let n = Sr(e, i.location);
				if (n === null || n === i.value) continue;
				let a = r("div", P.zoneSiteDiff(i.location, n, i.value), "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b;font-weight:700");
				a.dataset.edc = "zone-site-diff", t.append(a);
			}
			s.append(t);
		}
		if (n.noRows) return;
		let c = r("div", null, "margin-top:8px");
		if (c.dataset.edc = "carried", c.append(r("div", P.carriedHead, "font-weight:700")), n.cannotCompare) {
			let e = r("div", P.cannot, "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b;font-weight:700");
			e.dataset.edc = "cannot", c.append(e);
		} else {
			if (n.rowDiffs.length) {
				let e = r("div", null, i);
				e.dataset.edc = "row-diffs", e.append(r("div", P.rowDiffHead, "font-weight:700"), ...n.rowDiffs.map((e) => r("div", e))), c.append(e);
			}
			for (let e of n.carried) {
				let t = r("div", e);
				t.dataset.edc = "grouped", c.append(t);
			}
			!n.rowDiffs.length && !n.carried.length && c.append(r("div", P.noCarried));
		}
		s.append(c);
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
var wr = "edcXdwImportNotice", F = {
	title: (e, t, n, r = 0) => `🟣 Claude 版 XDW 讀值：帶入 ${e} 筆${r > 0 ? `（Claude 讀值 ${e - r} 筆、人工輸入 ${r} 筆）` : ""}（${t}／${n}）`,
	manualHead: (e) => `✍️ 人工輸入 ${e} 列（不是 Claude 讀的，是你在讀值視窗輸入並確認的）`,
	manualRow: (e, t, n, r, i, a, o) => `・第 ${e} 頁｜${t}｜${n}｜你填的：結果 ${r}／MDL ${i}／單位 ${a}／方法 ${o}`,
	titleNote: "這些值由兩個模型各讀一次、兩次完全相同才帶入；寫法轉換（ND、<、去尾 0、單位與方法代碼）由原網站的程式處理。請對照報告核對。（這段提醒只在網頁上，不會寫進匯出檔。）",
	excludedHead: (e, t) => `⚠️ 沒有帶入、要手動補：${[e ? `${e} 列` : "", t ? `${t} 頁整頁` : ""].filter(Boolean).join("、")}`,
	excludedRow: (e, t, n, r) => `・第 ${e} 頁｜${t}｜${n}｜${r}`,
	excludedPage: (e, t, n) => `・第 ${e} 頁（整頁）｜${t}｜${n}`,
	levelStep: (e, t, n) => `・第 ${e} 頁｜${t}｜水位｜${n}；請在原網站表格手動新增一列：檢測數值空白、檢測方法空白、備註照報告備註欄原文`,
	levelHead: (e, t) => `水位：${[e ? `方法照報告空白（破折號）的 ${e} 列已帶 NIEA W103` : "", t ? `沒有量到水位的 ${t} 列已照報告備註帶入（檢測數值、檢測方法空白）` : ""].filter(Boolean).join("；")}`,
	levelRemark: (e, t, n) => `・第 ${e} 頁｜${t}｜備註「${n}」`,
	levelMethodKept: (e, t) => `這 ${e} 列的檢測方法照 David 的決定留空${t.length ? `（原網站的記憶值 ${t.join("、")} 沒有套用）` : ""}。`,
	endHead: (e, t) => `時間(迄)：已照報告的「收樣日期」帶入 ${e} 列（${t} 頁）；原網站「報告只寫了採樣起始時間」的提醒已拿掉`,
	endRow: (e, t, n, r, i) => `・第 ${e} 頁｜${t}｜收樣日期「${n}」→ 日期(迄) ${r}、時間(迄) ${i.slice(0, 5)}`,
	endMissHead: (e) => `⚠️ 這 ${e} 列的時間(迄) 沒有帶入收樣時間，請手動填（現在是和時間(起) 相同）`,
	endMissRow: (e, t, n, r) => `・第 ${e} 頁｜${t}｜${n} 列｜${r}`,
	endNotApplied: "確認畫面上沒有換成功（不是第一次畫、或原網站的寫法和預期不同）",
	endUnknown: "讀不到確認畫面的列，無法確認有沒有帶入",
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
function Tr(e) {
	return "files" in e ? e.files : [{
		xdwFileName: e.plan.xdwFileName,
		fileName: e.fileName,
		plan: e.plan,
		preflightRows: e.preflightRows
	}];
}
var Er = (e) => Tr(e).filter((e) => e.fileName !== null).map((e) => e.fileName).join("、"), Dr = /* @__PURE__ */ new Set([
	"檢測數值",
	"比較關係",
	"檢測極限"
]), Or = /* @__PURE__ */ new Set([
	"日期(起)",
	"時間(起)",
	"日期(迄)",
	"時間(迄)",
	"採樣地點",
	"檢測類別",
	"檢測機構許可證號",
	"檢測項目"
]), kr = /* @__PURE__ */ new Set([
	"檢測濃度/質量單位",
	"其他檢測濃度/質量單位",
	"檢測方法"
]), Ar = (e) => e == null ? "" : String(e), jr = (e) => e === "" ? F.empty : e;
function Mr(e) {
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
function Nr(e, t) {
	if (!Array.isArray(t)) return null;
	let n = t;
	if (n.length !== e.plan.total || n.some((e) => !e || typeof e != "object" || Ar(e._sourceSheet) === "")) return null;
	let r = /* @__PURE__ */ new Set(), i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
	for (let t of e.plan.sheets) {
		let s = e.preflightRows[t.name];
		if (!Array.isArray(s) || s.length !== t.rows.length) return null;
		for (let e of s) {
			let s = Ar(e.檢測項目), c = n.filter((e) => Ar(e._sourceSheet) === t.name && Ar(e.檢測項目) === s);
			if (c.length !== 1 || r.has(c[0])) return null;
			let l = c[0];
			r.add(l);
			let u = [.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(l)])].filter((e) => !e.startsWith("_"));
			for (let n of u) {
				let r = Ar(e[n]), c = Ar(l[n]);
				if (r !== c) if (Dr.has(n) || Or.has(n) || kr.has(n)) if (r === "" && c !== "" && (kr.has(n) || n === "檢測極限")) {
					let e = `${n}\u0000${s}\u0000${c}`, r = a.get(e);
					r ? r.pages.includes(t.page) || r.pages.push(t.page) : a.set(e, {
						field: n,
						item: s,
						value: c,
						pages: [t.page]
					});
				} else i.push(F.rowDiff(t.page, s, n, jr(c)));
				else r === "" ? o.set(n, (o.get(n) ?? 0) + 1) : i.push(F.rowDiff(t.page, s, n, jr(c)));
			}
		}
	}
	return r.size === n.length ? {
		rowDiffs: i,
		grouped: [...a.values()].map((e) => F.grouped(e.field, e.item, e.value, e.pages.sort((e, t) => e - t))),
		others: [...o.entries()].map(([e, t]) => F.otherField(e, t))
	} : null;
}
function Pr(e, t) {
	let n = Array.isArray(e.ends) ? e.ends : [], r = Array.isArray(t) ? t : null, i = [], a = [], o = 0, s = 0, c = 0;
	for (let e of n) {
		let t = e.ok ? null : e.reason;
		if (e.ok) if (!r) t = F.endUnknown;
		else {
			let n = r.filter((t) => !!t && typeof t == "object" && Ar(t._sourceSheet) === e.sheet);
			(!n.length || n.length !== e.rows || !n.every((t) => tr(t) && Ar(t["日期(迄)"]) === e.endDate && Ar(t["時間(迄)"]) === e.endTime)) && (t = F.endNotApplied);
		}
		t === null && e.ok ? (o += e.rows, s++, i.push(F.endRow(e.page, e.sampleName, e.raw, e.endDate, e.endTime))) : (c += e.rows, a.push(F.endMissRow(e.page, e.sampleName, e.rows, t ?? "")));
	}
	return {
		endHead: s ? F.endHead(o, s) : null,
		ends: i,
		endMissHead: c ? F.endMissHead(c) : null,
		endMiss: a
	};
}
function Fr(e, t = []) {
	let n = e.excluded.filter((e) => e.index !== null), r = e.excluded.filter((e) => e.index === null), i = e.excluded.map((e) => e.index === null ? F.excludedPage(e.page, e.sampleName, e.reason) : e.item === "水位" && /破折號/.test(e.reason) ? F.levelStep(e.page, e.sampleName, e.reason) : F.excludedRow(e.page, e.sampleName, e.item, e.reason)), a = (Array.isArray(e.manual) ? e.manual : []).map((e) => F.manualRow(e.page, e.sampleName, e.item, jr(e.cells.result), jr(e.cells.mdl), jr(e.cells.unit), jr(e.cells.method))), o = Array.isArray(e.levels) ? e.levels : [], s = o.filter((e) => e.kind === "method").length, c = o.filter((e) => e.kind === "remark"), l = c.length ? [...c.map((e) => F.levelRemark(e.page, e.sampleName, e.remark)), F.levelMethodKept(c.length, t)] : [];
	return {
		manualHead: a.length ? F.manualHead(a.length) : null,
		manual: a,
		excludedHead: i.length ? F.excludedHead(n.length, r.length) : null,
		excluded: i,
		levelHead: o.length ? F.levelHead(s, c.length) : null,
		levels: l
	};
}
function Ir(e, t) {
	if (!Array.isArray(e) || t === null) return [];
	let n = [];
	for (let r of e) if (!(!r || typeof r != "object" || Ar(r._sourceFile) !== t || !Jn(r) || Ar(r.檢測項目) !== "水位")) for (let e of ur(r)) e !== "" && !n.includes(e) && n.push(e);
	return n;
}
function Lr(e, t) {
	let n = Tr(e), r = n.filter((e) => e.fileName !== null), i = {
		generic: F.generic,
		itemRenames: Mr(n.flatMap((e) => e.plan.itemRenames)).map((e) => F.itemRename(e.from, e.to, e.n)),
		unitRenames: Mr(n.flatMap((e) => e.plan.unitRenames)).map((e) => F.unitRename(e.from, e.to, e.n)),
		mdlNote: F.mdlNote
	};
	if (n.length === 1) {
		let e = n[0], r = e.plan, a = null;
		try {
			a = Nr(e, t);
		} catch {
			a = null;
		}
		return {
			title: F.title(r.total, r.xdwFileName, e.fileName ?? "", r.manualIn ?? 0),
			...Fr(r, Ir(t, e.fileName)),
			...Pr(r, t),
			cannotCompare: a === null,
			rowDiffs: a?.rowDiffs ?? [],
			grouped: a?.grouped ?? [],
			others: a?.others ?? [],
			files: [],
			...i
		};
	}
	let a = Array.isArray(t) ? t : null, o = new Set(r.map((e) => e.fileName)), s = r.reduce((e, t) => e + t.plan.total, 0), c = !!a && a.length === s && a.every((e) => !!e && typeof e == "object" && o.has(Ar(e._sourceFile))), l = n.map((e, n) => {
		let r = {
			...Fr(e.plan, Ir(t, e.fileName)),
			...Pr(e.plan, e.fileName !== null && a ? a.filter((t) => !!t && typeof t == "object" && Ar(t._sourceFile) === e.fileName) : void 0)
		};
		if (e.fileName === null) return {
			head: F.fileNoRows(n + 1, e.xdwFileName),
			noRows: !0,
			...r,
			cannotCompare: !1,
			rowDiffs: [],
			grouped: [],
			others: []
		};
		let i = null;
		if (c) try {
			i = Nr(e, a.filter((t) => Ar(t._sourceFile) === e.fileName));
		} catch {
			i = null;
		}
		return {
			head: F.fileHead(n + 1, e.xdwFileName, e.fileName, e.plan.total),
			noRows: !1,
			...r,
			cannotCompare: i === null,
			rowDiffs: i?.rowDiffs ?? [],
			grouped: i?.grouped ?? [],
			others: i?.others ?? []
		};
	});
	return {
		title: F.titleMulti(s, r.reduce((e, t) => e + (t.plan.manualIn ?? 0), 0), n.map((e) => e.xdwFileName)),
		manualHead: null,
		manual: [],
		excludedHead: null,
		excluded: [],
		levelHead: null,
		levels: [],
		endHead: null,
		ends: [],
		endMissHead: null,
		endMiss: [],
		cannotCompare: l.some((e) => e.cannotCompare),
		rowDiffs: [],
		grouped: [],
		others: [],
		files: l,
		...i
	};
}
var Rr = null, zr = !1, Br = /* @__PURE__ */ new WeakSet(), Vr = null;
function Hr(e, t) {
	Rr = e, zr = !1, Vr = t, Yr(t);
}
function Ur() {
	Rr = null, zr = !1;
	try {
		Vr?.doc.getElementById(wr)?.remove();
	} catch {}
}
function Wr() {
	let e = Vr, t = Rr;
	if (!e || !t || fn(t)) return 0;
	let n = Kr(e);
	if (!n.ok) return 0;
	let r = e.getState(), i = mr(t) ? {
		kind: "noise",
		files: t.files
	} : {
		kind: "gw-level",
		files: Tr(t).map((e) => ({
			fileName: e.fileName,
			remarks: e.levelRemarks ?? [],
			ends: Array.isArray(e.plan.ends) ? e.plan.ends : []
		}))
	}, a = mr(t) ? hr(t) : Er(t), o = r?.smartResult, s = rr(i, o, n.label, a), c = Yn(s, or);
	if (c > 0 && o) for (let e of s) e.field === "備註" && dr(e.row, () => !!o._memoryApplied);
	return c;
}
function Gr() {
	return fr();
}
function Kr(e) {
	try {
		let t = e.getState();
		return t ? {
			label: Ar(t.currentImportSourceLabel),
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
function qr() {
	let e = Vr;
	if (!e) return null;
	let t = e.doc, n = t.getElementById(wr), r = t.getElementById("smartImportSummary"), i = Rr;
	if (!i || !r) return n?.remove(), null;
	let a = Kr(e), o = fn(i) ? pn(i) : mr(i) ? hr(i) : Er(i);
	if (a.ok && a.label !== "" && a.label !== o) return Ur(), null;
	if (a.ok && a.label !== o || !r.textContent) return n?.remove(), null;
	zr = !0;
	let s = a.ok ? a.rows : void 0, c = fn(i) ? yn(t, vn(i, s), wr) : mr(i) ? Cr(t, xr(i, s), wr) : Jr(t, Lr(i, s));
	return n ? n.replaceWith(c) : r.after(c), c;
}
function Jr(e, t) {
	let n = (t, n, r) => {
		let i = e.createElement(t);
		return n != null && (i.textContent = n), r && (i.style.cssText = r), i;
	}, r = "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b", i = n("div", null, "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #6a4c9c;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	i.id = wr;
	let a = n("div", t.title, "font-weight:700;font-size:15px;color:#4b3172");
	a.dataset.edc = "title", i.append(a, n("div", F.titleNote, "margin:2px 0 6px"));
	let o = (e, t, i) => {
		if (t.manualHead) {
			let r = n("div", null, "margin-top:8px;padding:8px 12px;border:1px solid #9b7fc7;background:#efe8f8;border-radius:4px;color:#3d2766");
			r.dataset.edc = "manual", r.append(n("div", t.manualHead, "font-weight:700"), ...t.manual.map((e) => n("div", e))), e.append(r);
		}
		if (t.excludedHead) {
			let i = n("div", null, r);
			i.dataset.edc = "excluded", i.append(n("div", t.excludedHead, "font-weight:700"), ...t.excluded.map((e) => n("div", e))), e.append(i);
		}
		if (t.levelHead) {
			let r = n("div", null, "margin-top:8px;padding:8px 12px;border:1px solid #6a8cae;background:#eef4fa;border-radius:4px;color:#24496e");
			r.dataset.edc = "level", r.append(n("div", t.levelHead, "font-weight:700"), ...t.levels.map((e, r) => {
				let i = n("div", e);
				return i.dataset.edc = r === t.levels.length - 1 && t.levels.length ? "level-note" : "level-row", i;
			})), e.append(r);
		}
		if (t.endMissHead) {
			let i = n("div", null, r);
			i.dataset.edc = "end-missing", i.append(n("div", t.endMissHead, "font-weight:700"), ...t.endMiss.map((e) => n("div", e))), e.append(i);
		}
		if (t.endHead) {
			let r = n("div", null, "margin-top:8px;padding:8px 12px;border:1px solid #6a8cae;background:#eef4fa;border-radius:4px;color:#24496e");
			r.dataset.edc = "end", r.append(n("div", t.endHead, "font-weight:700"), ...t.ends.map((e) => {
				let t = n("div", e);
				return t.dataset.edc = "end-row", t;
			})), e.append(r);
		}
		if (!i) return;
		let a = n("div", null, "margin-top:8px");
		if (a.dataset.edc = "carried", a.append(n("div", F.carriedHead, "font-weight:700")), t.cannotCompare) {
			let e = n("div", F.cannot, "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b;font-weight:700");
			e.dataset.edc = "cannot", a.append(e);
		} else {
			if (t.rowDiffs.length) {
				let e = n("div", null, r);
				e.dataset.edc = "row-diffs", e.append(n("div", F.rowDiffHead, "font-weight:700"), ...t.rowDiffs.map((e) => n("div", e))), a.append(e);
			}
			for (let e of t.grouped) {
				let t = n("div", e);
				t.dataset.edc = "grouped", a.append(t);
			}
			for (let e of t.others) {
				let t = n("div", e);
				t.dataset.edc = "others", a.append(t);
			}
			!t.rowDiffs.length && !t.grouped.length && !t.others.length && a.append(n("div", F.noCarried));
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
function Yr(e) {
	if (typeof MutationObserver > "u") return;
	let t = e.doc, n = t.getElementById("smartImportSummary");
	n && !Br.has(n) && (Br.add(n), new MutationObserver(() => {
		try {
			qr();
		} catch {}
	}).observe(n, {
		childList: !0,
		characterData: !0,
		subtree: !0
	}));
	let r = t.getElementById("importModal");
	r && !Br.has(r) && (Br.add(r), new MutationObserver(() => {
		try {
			r.classList.contains("hidden") && Rr && zr && Ur();
		} catch {}
	}).observe(r, {
		attributes: !0,
		attributeFilter: ["class"]
	}));
}
//#endregion
//#region src/page2/selftest.ts
var Xr = [
	"樣品編號\n檢驗項目",
	"",
	"EDC-SELFTEST",
	"偵測\n極限",
	"單位",
	"檢測方法"
], Zr = () => [
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
], Qr = "水溫";
function $r() {
	let e = [
		...Zr(),
		[...Xr],
		[
			"",
			"",
			"檢測值"
		],
		[
			Qr,
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
		...Zr(),
		[...Xr],
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
var ei = (e) => Array.isArray(e) ? e.map((e) => String(e?.檢測項目 ?? "")) : [];
function ti(e, t) {
	let n = (t, n) => (e.mode = t, t === "failed" && e.errors.push("自我測試：" + n), {
		status: t,
		detail: n
	});
	try {
		if (e.mode === "failed" || !e.originalParseLab) return n("failed", "找不到 SmartParse.parseLabItemTableSheet：" + e.missing.join("、"));
		let r = t;
		if (!r || typeof r.parseSheet != "function") return n("failed", "找不到 SmartParse.parseSheet");
		let i = ei(e.originalParseLab.call(r, $r(), "water"));
		if (!i.includes("水溫")) return n("failed", "原函式讀不到合成表的第 1 頁");
		if (i.includes("鐵")) return n("upstream-fixed", "原函式已經會讀第 2 頁");
		e.mode = "testing";
		let a = $r();
		e.selftestGrids.add(a);
		let o = r.parseSheet.call(r, "water", "__edc_selftest__", a, { allowAutoDetect: !1 }), s = ei(o), c = Array.isArray(o) && o.some((e) => e?.檢測項目 === "鐵" && typeof e?._edcPage2 == "object");
		return s.includes("水溫") && c ? n("active", "正常") : n("failed", `包裝後讀到的項目：${s.join("、") || "（沒有）"}`);
	} catch (e) {
		return n("failed", "丟例外：" + (e instanceof Error ? e.message : String(e)));
	}
}
var ni = ["#水溫", "＃ 鐵"], ri = ["水溫", "鐵"], ii = "#1自我測試站";
function ai() {
	let e = [
		["水質檢測報告"],
		[
			"",
			"",
			"",
			"",
			"採樣地點：",
			ii
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
		[...Xr],
		[
			"",
			"",
			"檢測值"
		],
		[
			ni[0],
			"",
			"20.0",
			"--",
			"℃",
			"NIEA W217.52A"
		],
		[
			ni[1],
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
function oi(e, t) {
	let n = (t, n) => (e.hash = t, t === "failed" && e.errors.push("去 # 自我測試：" + n), {
		status: t,
		detail: n
	});
	try {
		if (e.hash === "failed" || !e.originalParseLab) return n("failed", "找不到 SmartParse.parseLabItemTableSheet");
		let r = t;
		if (!r || typeof r.parseSheet != "function") return n("failed", "找不到 SmartParse.parseSheet");
		e.hash = "testing";
		let i = ai();
		e.selftestGrids.add(i);
		let a = r.parseSheet.call(r, "water", "__edc_selftest_hash__", i, { allowAutoDetect: !1 }), o = ei(a);
		return Array.isArray(a) && a.length === 2 && o[0] === ri[0] && o[1] === ri[1] && a.every((t) => t?.採樣地點 === "#1自我測試站" && e.hashRow.has(t)) ? n("active", "正常") : n("failed", `讀到的項目：${o.join("、") || "（沒有）"}`);
	} catch (e) {
		return n("failed", "丟例外：" + (e instanceof Error ? e.message : String(e)));
	}
}
//#endregion
//#region src/page2/hashpaths.ts
var si = "檢測項目", ci = (e) => typeof e == "object" && !!e, li = (e) => String(e ?? "").replace(/\s+/g, ""), ui = (e) => e instanceof Error ? e.message : String(e);
function di(e) {
	if (!Array.isArray(e)) return null;
	let t = e.find((e) => typeof e == "string" && li(e) === "檢測項目");
	return typeof t == "string" ? t : null;
}
function fi(e, t) {
	if (!ci(e) || !Array.isArray(e.rows)) return null;
	let n = di(e.headers);
	if (n === null) return null;
	let r = typeof e.usedSheet == "string" ? e.usedSheet : null, i = [], a = e.rows.map((e) => {
		if (!ci(e)) return e;
		let a = e[n];
		if (typeof a != "string" || !w(a)) return e;
		let o = T(a.trim());
		if (o === null) return e;
		let s = {
			...e,
			[n]: o
		};
		return i.push([s, {
			file: t,
			sheet: r,
			header: n,
			raw: a.trim(),
			stripped: o
		}]), s;
	});
	return i.length ? {
		out: {
			...e,
			rows: a
		},
		marks: i
	} : null;
}
function pi(e, t, n, r) {
	let i = [];
	if (!Array.isArray(e) || (e.forEach((e, a) => {
		Array.isArray(e) && e.forEach((e, o) => {
			if (typeof e != "string") return;
			let s = r(e);
			if (!w(s)) return;
			let c = n(s);
			if (!t.has(c)) return;
			let l = T(s);
			l !== null && i.push({
				r: a,
				c: o,
				raw: s,
				stripped: l,
				name: c
			});
		});
	}), !i.length)) return {
		grid: e,
		changed: i
	};
	let a = e.slice();
	a._hiddenCols = e._hiddenCols;
	let o = /* @__PURE__ */ new Set();
	for (let t of i) o.has(t.r) || (a[t.r] = e[t.r].slice(), o.add(t.r)), a[t.r][t.c] = t.stripped;
	return {
		grid: a,
		changed: i
	};
}
var mi = (e) => typeof e == "string" && w(e) && T(e.trim()) !== null;
function hi(e, t) {
	return !Array.isArray(t) || t.length !== e.length || !de(e, t) ? !1 : e.every((e, n) => {
		let r = t[n], i = e[si], a = r[si];
		return mi(i) ? a === T(String(i).trim()) : i === a;
	});
}
function gi(e, t) {
	try {
		_i(e, t);
	} catch (t) {
		e.errors.push("包 AutoDetect.parseSheet 失敗：" + ui(t));
	}
	try {
		yi(e, t);
	} catch (t) {
		e.errors.push("包 ImportEngine.readFile 失敗：" + ui(t));
	}
	try {
		bi(e, t);
	} catch (t) {
		e.errors.push("包 buildRowsFromPrevPeriod 失敗：" + ui(t));
	}
	e.wrapped.includes("AutoDetect.parseSheet") || (e.paths.autoDetect = "failed"), e.wrapped.includes("ImportEngine.readFile") || (e.paths.readFile = "failed"), e.wrapped.includes("buildRowsFromPrevPeriod") || (e.paths.prevPeriod = "failed");
}
function _i(e, t) {
	let n = t.AutoDetect, r = ci(n) ? n.parseSheet : void 0, i = t.SmartParse;
	if (!ci(n) || typeof r != "function" || !i || typeof i.normalizeItemName != "function" || typeof i.cellStr != "function") {
		e.missing.push("AutoDetect.parseSheet");
		return;
	}
	let a = r;
	n.parseSheet = function(...n) {
		let r = a.apply(this, n);
		if (e.paths.autoDetect !== "active" || e.hash !== "active") return r;
		try {
			if (!Array.isArray(r) || !r.length) return r;
			let [o, , s] = n, c = t.getCategories()?.[String(o)];
			if (!c || c.itemField !== "檢測項目") return r;
			let l = r, u = new Set(l.filter((e) => ci(e) && mi(e.檢測項目)).map((e) => String(e[si])));
			if (!u.size) return r;
			let d = (e) => i.normalizeItemName.call(i, e), f = pi(s, u, d, (e) => i.cellStr.call(i, e));
			if (!f.changed.length) return e.errors.push("版面猜測：項目開頭有 # 但找不到來源格，照原網站讀（不去 #）"), r;
			let p = a.apply(this, [
				n[0],
				n[1],
				f.grid,
				...n.slice(3)
			]);
			return hi(l, p) ? (vi(e, s, l, p, f.changed, d), p) : (e.errors.push("版面猜測：去 # 後其他欄位不同，照原網站讀（不去 #）"), r);
		} catch (t) {
			return e.errors.push("版面猜測去 # 失敗，照原網站讀（不去 #）：" + ui(t)), r;
		}
	}, e.wrapped.push("AutoDetect.parseSheet");
}
function vi(e, t, n, r, i, a) {
	let o = e.sheetOrigin.get(t) ?? null, s = /* @__PURE__ */ new Map();
	for (let e of i) {
		let t = a(e.stripped);
		s.set(t, [...s.get(t) ?? [], e]);
	}
	let c = /* @__PURE__ */ new Map();
	n.forEach((e, t) => {
		if (!mi(e.檢測項目)) return;
		let n = String(r[t][si]);
		c.set(n, [...c.get(n) ?? [], t]);
	});
	for (let [i, a] of c) {
		let c = s.get(i) ?? [];
		a.forEach((i, s) => {
			let l = c.length === a.length ? c[s] : void 0, u = null;
			if (l && o?.origin && o.ws) {
				let e = S(o.origin, l.r, l.c), n = o.ws[e];
				n && n.v === t[l.r][l.c] && (u = e);
			}
			e.hashRow.set(r[i], {
				raw: l ? l.raw : String(n[i][si]),
				stripped: String(r[i][si]),
				cell: u,
				rowGuess: l ? l.r + 1 + (o?.origin?.r ?? 0) : null,
				page: 1,
				via: "autodetect"
			});
		});
	}
}
function yi(e, t) {
	let n = t.ImportEngine, r = ci(n) ? n.readFile : void 0;
	if (!ci(n) || typeof r != "function") {
		e.missing.push("ImportEngine.readFile");
		return;
	}
	let i = r;
	n.readFile = async function(...t) {
		let n = await i.apply(this, t);
		if (e.paths.readFile !== "active") return n;
		try {
			let r = t[1];
			if (!Array.isArray(r) || !r.includes("檢測項目")) return n;
			let i = t[0], a = fi(n, ci(i) && typeof i.name == "string" ? i.name : null);
			if (!a) return n;
			for (let [t, n] of a.marks) e.genericHash.set(t, n);
			return a.out;
		} catch (t) {
			return e.errors.push("完成版去 # 失敗，照原網站讀（不去 #）：" + ui(t)), n;
		}
	}, e.wrapped.push("ImportEngine.readFile");
}
function bi(e, t) {
	let n = t.win, r = n.buildRowsFromPrevPeriod;
	if (typeof r != "function") {
		e.missing.push("buildRowsFromPrevPeriod");
		return;
	}
	let i = r;
	n.buildRowsFromPrevPeriod = function(...t) {
		let n = i.apply(this, t);
		if (e.paths.prevPeriod !== "active") return n;
		try {
			let r = t[1];
			if (!ci(r) || r.itemField !== "檢測項目" || !Array.isArray(n)) return n;
			let i = [];
			for (let e of n) !ci(e) || !mi(e.檢測項目) || i.push([e, T(String(e[si]).trim())]);
			let a = [...new Set(i.map(([e]) => String(e[si]).trim()))];
			for (let [e, t] of i) e[si] = t;
			return e.prevLast = {
				rows: i.length,
				names: a
			}, n;
		} catch (t) {
			return e.errors.push("用上一季建立去 # 失敗：" + ui(t)), n;
		}
	}, e.wrapped.push("buildRowsFromPrevPeriod");
}
//#endregion
//#region src/page2/hashpathsui.ts
var xi = "edcGenericHashNotice", Si = "edcPrevHashNote", Ci = (e) => `🟣 Claude 版：項目名稱開頭的「#」已去掉，共 ${e} 筆`, wi = "檔案「檢測項目」欄開頭的「#」是檢驗室的標示，申報的項目名稱不帶「#」。Claude 版讀檔時已去掉（只改這一欄的開頭），其餘欄位都照原網站的讀法。（這段提醒只在網頁上，不會寫進匯出檔。）", Ti = "這個檔的項目欄名稱不是『檢測項目』，開頭的 # 沒有去掉", Ei = `${be}無法確認項目名稱開頭的「#」（外掛檢查時出錯，或讀不到表格裡的舊資料），請匯入後檢查表格裡的項目名稱有沒有「#」或重複。\n\n仍要匯入嗎？`, Di = "⚠️ 無法檢查表格裡的舊資料是否帶「#」（讀不到表格），按「確認匯入」時會先問。", Oi = (e) => e == null ? "" : String(e), ki = (e) => typeof e == "object" && !!e, Ai = (e) => Oi(e).replace(/\s+/g, ""), ji = (e) => T(e.trim()) ?? e.trim();
function Mi(e, t, n, r) {
	let i = /* @__PURE__ */ new Map(), a = 0, o = /* @__PURE__ */ new Map(), s = 0, c = /* @__PURE__ */ new Set();
	for (let r of e) {
		if (!ki(r)) continue;
		let e = n(r);
		if (e) {
			a++;
			let t = JSON.stringify([
				e.file,
				e.sheet,
				e.raw,
				e.stripped
			]), n = i.get(t) ?? {
				file: e.file,
				sheet: e.sheet,
				raw: e.raw,
				stripped: e.stripped,
				count: 0
			};
			n.count++, i.set(t, n);
		}
		if (!t) continue;
		let l = Oi(r[t]).trim();
		l && c.add(l), w(l) && (s++, o.set(l, (o.get(l) ?? 0) + 1));
	}
	let l = [];
	if (r === null) l = null;
	else {
		let e = /* @__PURE__ */ new Map();
		for (let t of r) {
			let n = Oi(ki(t) ? t[si] : "").trim();
			if (!w(n)) continue;
			let r = ji(n);
			if (r === n || !c.has(r)) continue;
			let i = e.get(n) ?? {
				name: n,
				bare: r,
				count: 0
			};
			i.count++, e.set(n, i);
		}
		l = [...e.values()];
	}
	return {
		stripped: [...i.values()],
		strippedRows: a,
		mappedHeader: t,
		official: Ai(t) === si,
		still: [...o.entries()].map(([e, t]) => ({
			name: e,
			count: t
		})),
		stillRows: s,
		old: l
	};
}
function Ni(e, t) {
	let n = t.getState();
	if (!n) throw Error("讀不到 state");
	if (n.importMode !== "generic") return null;
	let r = Oi(n.importCatKey), i = t.getCategories();
	if (!i) throw Error("讀不到 CATEGORIES");
	let a = i[r];
	if (!a) throw Error("找不到類別 " + r);
	if (a.itemField !== "檢測項目") return null;
	let o = n.importParsed;
	if (!ki(o) || !Array.isArray(o.rows)) throw Error("讀不到 importParsed.rows");
	let s = t.doc.querySelector(`#mappingTableBody select[data-target-field="${si}"]`);
	if (!s) throw Error("找不到「檢測項目」的對應下拉");
	let c = Oi(s.value), l = null;
	try {
		let e = Oi(n.importProjectId) || Oi(n.currentProjectId), i = t.getDataStore?.();
		if (i && typeof i.getData == "function" && e) {
			let t = i.getData(e, r);
			Array.isArray(t) && (l = t);
		}
	} catch {
		l = null;
	}
	return Mi(o.rows, c, (t) => e.genericHash.get(t), l);
}
function Pi(e) {
	if (!e) return null;
	if (e.old === null) return Ei;
	let t = [];
	if (e.stillRows && t.push(e.official ? `有 ${e.stillRows} 筆的項目名稱開頭仍是「#」，Claude 版沒有自動去掉，請匯入後在表格裡手動改。` : `${Ti}（${e.stillRows} 筆，例：「${e.still[0].name}」），請匯入後在表格裡手動改。`), e.old && e.old.length) {
		let n = e.old[0];
		t.push(`表格裡現有資料的項目名稱還帶「#」（例：「${n.name}」${n.count} 筆），這次匯入的是「${n.bare}」，原網站會把兩者當成不同項目，確認後表格會同時有兩種寫法。`);
	}
	return t.length ? `${be}${t.join("\n")}\n\n詳細請看欄位對應畫面上的紅字。仍要匯入嗎？` : null;
}
function Fi(e) {
	return (t, n, r) => {
		let i = e.createElement(t);
		return n != null && (i.textContent = n), r && (i.style.cssText = r), i;
	};
}
var Ii = "margin:10px 0;padding:12px 14px;border:1px solid #b9a7d6;border-left:6px solid #7a5fb0;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6", Li = "margin-top:10px;padding:10px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b";
function Ri(e, t) {
	let n = t.doc, r = n.getElementById(xi), i = n.getElementById("genericImportItemsWrap"), a;
	try {
		a = Ni(e, t);
	} catch (e) {
		if (!i) return r?.remove(), null;
		let t = Fi(n), a = t("div", null, Ii);
		a.id = xi;
		let o = t("div", `⚠️ Claude 版無法確認項目名稱開頭的「#」（${String(e instanceof Error ? e.message : e)}），按「確認匯入」時會先問。`, Li);
		return o.dataset.edc = "generic-unknown", a.append(o), r ? r.replaceWith(a) : i.before(a), a;
	}
	let o = a?.old ?? [], s = a?.old === null;
	if (!a || !i || !a.strippedRows && !a.stillRows && !o.length && !s) return r?.remove(), null;
	let c = Fi(n), l = c("div", null, Ii);
	if (l.id = xi, a.strippedRows) {
		l.append(c("div", Ci(a.strippedRows), "font-weight:700;font-size:15px")), l.append(c("div", wi, "margin:2px 0 8px"));
		let e = c("div", null, `${a.stripped.length > 8 ? "max-height:300px;overflow:auto;" : ""}background:#fff;border:1px solid #dce5ea;border-radius:4px`), t = c("table", null, "border-collapse:collapse;width:100%;font-size:13px"), n = c("tr");
		[
			"檔名",
			"工作表",
			"檔案原文（項目）",
			"匯入後的項目",
			"筆數"
		].forEach((e) => n.append(c("th", e, "text-align:left;padding:5px 8px;background:#ece6f5;border-bottom:1px solid #dce5ea;position:sticky;top:0")));
		let r = c("thead");
		r.append(n), t.append(r);
		let i = c("tbody");
		a.stripped.forEach((e) => {
			let t = c("tr");
			t.dataset.edcGenericRow = "", [
				e.file ?? "—",
				e.sheet ?? "—",
				e.raw,
				e.stripped,
				String(e.count)
			].forEach((e) => t.append(c("td", e, "padding:4px 8px;border-bottom:1px solid #eef2f5"))), i.append(t);
		}), t.append(i), e.append(t), l.append(e);
	}
	if (a.stillRows) {
		let e = c("div", null, Li);
		e.dataset.edc = "generic-still", e.append(c("div", a.official ? `⚠️ 有 ${a.stillRows} 筆的項目名稱開頭仍是「#」，Claude 版沒有自動去掉，請匯入後在表格裡手動改：` : `⚠️ ${Ti}（目前對應的是「${a.mappedHeader}」欄），請匯入後在表格裡手動改：`, "font-weight:700")), a.still.forEach((t) => e.append(c("div", `・${t.name}（${t.count} 筆）`))), l.append(e);
	}
	if (o.length) {
		let e = c("div", null, Li);
		e.dataset.edc = "generic-old";
		let t = o[0];
		e.append(c("div", `⚠️ 表格裡現有資料的項目名稱還帶「#」（例：「${t.name}」${t.count} 筆），這次匯入的是「${t.bare}」，原網站會把兩者當成不同項目，確認後表格會同時有兩種寫法：`, "font-weight:700")), e.append(c("div", `・帶「#」的舊項目：${o.map((e) => `${e.name}（${e.count} 筆）`).join("、")}`)), e.append(c("div", "・舊資料不會被改；匯入後可以在分類頁上方按「去掉這些 #」處理（會先問、可復原），或手動刪改。")), l.append(e);
	}
	if (s) {
		let e = c("div", Di, Li);
		e.dataset.edc = "generic-unknown", l.append(e);
	}
	return r ? r.replaceWith(l) : i.before(l), l;
}
function zi(e, t, n, r, i) {
	let a = /* @__PURE__ */ new Set(), o = 0;
	for (let s of e) {
		if (!ki(s) || s._period !== t) continue;
		let e = Oi(s[i]).trim() || "（空白）", c = Oi(s.檢測項目).trim() || "（空白）";
		!n.has(e) || !r.has(c) || !w(c) || T(c) === null || (o++, a.add(c));
	}
	return {
		rows: o,
		names: [...a]
	};
}
function Bi(e, t) {
	let n = t.doc, r = n.getElementById(Si), i = n.getElementById("ppSummary"), a = n.getElementById("prevPeriodModal"), o = t.getState(), s = Oi(o?.currentTab), c = t.getCategories()?.[s], l = Oi(o?.currentProjectId), u = t.getDataStore?.();
	if (e.paths.prevPeriod !== "active" || !i || !a || c && c.itemField !== "檢測項目") return r?.remove(), null;
	if (!c || !l || !u || typeof u.getData != "function") throw Error("讀不到類別、計畫或表格");
	let d = Oi(n.querySelector("#ppSource")?.value), f = new Set([...a.querySelectorAll("[data-pp-loc]")].filter((e) => e.checked).map((e) => Oi(e.dataset.ppLoc))), p = new Set([...a.querySelectorAll("[data-pp-item]")].filter((e) => e.checked).map((e) => Oi(e.dataset.ppItem))), m = zi(u.getData(l, s), d, f, p, Oi(c.locationField));
	if (!m.rows) return r?.remove(), null;
	let h = Fi(n)("p", `🟣 Claude 版：新的一季項目名稱開頭的「#」會去掉，共 ${m.rows} 列（${m.names.map((e) => `${e}→${ji(e)}`).join("、")}）；上一季的資料不動。`, "margin:6px 0;padding:6px 10px;border-left:4px solid #7a5fb0;background:#f6f2fb;color:#2b3e4e;font-size:13px");
	return h.id = Si, r ? r.replaceWith(h) : i.after(h), h;
}
function Vi(e, t) {
	let n = t.doc, r = typeof MutationObserver < "u" ? MutationObserver : null;
	if (e.paths.autoDetect === "off" && (e.paths.autoDetect = e.wrapped.includes("renderSmartImportPreview") && e.wrapped.includes("confirmSmartImport") ? "active" : "failed"), e.paths.readFile === "off") {
		let i = n.getElementById("mappingTableBody"), a = n.getElementById("btnImportConfirm");
		if (!r || !i || !a || !n.getElementById("genericImportItemsWrap")) e.paths.readFile = "failed";
		else {
			let n = () => {
				try {
					Ri(e, t);
				} catch (t) {
					e.errors.push("畫完成版去 # 提醒失敗：" + String(t));
				}
			};
			new r(n).observe(i, { childList: !0 }), i.addEventListener("change", n), a.addEventListener("click", (n) => {
				let r = null;
				try {
					let n = t.getState();
					if (n && n.importMode !== "generic") return;
					r = Pi(Ni(e, t));
				} catch (t) {
					e.errors.push("完成版匯入前檢查失敗：" + String(t)), r = Ei;
				}
				r !== null && !t.win.confirm(r) && (n.stopImmediatePropagation(), n.preventDefault());
			}, !0), e.paths.readFile = "active";
		}
	}
	if (e.paths.prevPeriod === "off") {
		let i = n.getElementById("ppSummary");
		!r || !i || !n.getElementById("prevPeriodModal") ? e.paths.prevPeriod = "failed" : (e.paths.prevPeriod = "active", new r(() => {
			try {
				Bi(e, t);
			} catch (t) {
				e.paths.prevPeriod = "failed", n.getElementById(Si)?.remove(), e.errors.push("畫上一季去 # 說明失敗，停用：" + String(t));
			}
		}).observe(i, {
			childList: !0,
			characterData: !0,
			subtree: !0
		}));
	}
}
//#endregion
//#region src/page2/hashold.ts
var Hi = "edcHashOldBar", Ui = "edcHashOldBtn", Wi = "去掉這些 #", Gi = "Claude 版：去掉項目名稱開頭的「#」", Ki = (e) => `去掉項目名稱開頭的 #（${e} 筆）`, qi = "按下「去掉這些 #」之後、確定之前，表格內容被改過（可能是別的分頁），這次沒有改任何資料。請重新看過提醒列再按一次。", Ji = /* @__PURE__ */ new WeakMap(), Yi = /* @__PURE__ */ new Set([
	"water",
	"geo",
	"air"
]), Xi = (e) => e == null ? "" : String(e), Zi = (e) => typeof e == "object" && !!e;
function Qi(e, t) {
	let n = (e, t, n) => JSON.stringify([
		e,
		t,
		n
	]), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
	e.forEach((e, o) => {
		if (!Zi(e)) return;
		let s = Xi(e[si]).trim(), c = Xi(e._period).trim(), l = Xi(e[t]).trim(), u = w(s) ? T(s) : null;
		if (u === null) {
			r.add(n(c, l, s));
			return;
		}
		a.set(s, (a.get(s) ?? 0) + 1);
		let d = n(c, l, u), f = i.get(d) ?? {
			period: c,
			station: l,
			stripped: u,
			items: []
		};
		f.items.push({
			index: o,
			raw: s
		}), i.set(d, f);
	});
	let o = [], s = [];
	for (let [e, t] of i) {
		let n = [...new Set(t.items.map((e) => e.raw))], i = "";
		if (r.has(e) ? i = `同一季、同一測站已經有「${t.stripped}」` : n.length > 1 && (i = `同一季、同一測站有不同的「#」寫法（${n.join("、")}），去掉後會變成同一個項目`), i) {
			for (let e of n) s.push({
				period: t.period,
				station: t.station,
				raw: e,
				stripped: t.stripped,
				count: t.items.filter((t) => t.raw === e).length,
				reason: i
			});
			continue;
		}
		for (let e of t.items) o.push({
			index: e.index,
			raw: e.raw,
			stripped: t.stripped
		});
	}
	return o.sort((e, t) => e.index - t.index), {
		total: [...a.values()].reduce((e, t) => e + t, 0),
		names: [...a.entries()].map(([e, t]) => ({
			raw: e,
			count: t
		})),
		changes: o,
		conflicts: s
	};
}
function $i(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let t of e.changes) {
		let e = n.get(t.raw) ?? {
			stripped: t.stripped,
			n: 0
		};
		e.n++, n.set(t.raw, e);
	}
	let r = [...n.entries()].map(([e, t]) => `・${e} → ${t.stripped}（${t.n} 筆）`), i = e.conflicts.reduce((e, t) => e + t.count, 0);
	return `${Gi}（${t}，共 ${e.changes.length} 筆）：\n${r.join("\n")}` + (i ? `\n\n另有 ${i} 筆去掉後會和同一季、同一測站的既有項目重複，不會改，請人工處理（畫面上有紅字列出）。` : "") + "\n\n只改項目名稱開頭的「#」，其他欄位一格都不動。改完可以用原網站的「↩️ 復原上一步」還原；重新整理頁面後就不能復原。建議先按右上角「匯出備份」。\n\n要改嗎？";
}
function ea(e) {
	let t = e.getState(), n = Xi(t?.currentTab), r = Xi(t?.currentProjectId), i = e.getCategories()?.[n], a = e.getDataStore?.();
	return !Yi.has(n) || !r || !i || i.itemField !== "檢測項目" || !a || typeof a.getData != "function" ? null : {
		pid: r,
		catKey: n,
		cat: i,
		ds: a
	};
}
var ta = (e, t) => JSON.stringify([
	e.pid,
	e.catKey,
	t.names,
	t.changes.length,
	t.conflicts
]);
function na(e, t) {
	let n = t.doc, r = n.getElementById(Hi), i = n.getElementById("tabBody"), a = e.paths.oldData === "active" ? ea(t) : null, o = a && i ? Qi(a.ds.getData(a.pid, a.catKey), Xi(a.cat.locationField)) : null;
	if (!a || !i || !o || !o.total) return r?.remove(), null;
	let s = Ji.get(e) ?? "", c = ta(a, o) + s;
	if (r && r.dataset.edcSig === c && r.nextElementSibling === i) return r;
	let l = (e, t, r) => {
		let i = n.createElement(e);
		return t != null && (i.textContent = t), r && (i.style.cssText = r), i;
	}, u = l("div", null, "margin:10px 0;padding:10px 14px;border:1px solid #b9a7d6;border-left:6px solid #7a5fb0;background:#f6f2fb;border-radius:6px;color:#2b3e4e;font-size:14px;line-height:1.6");
	u.id = Hi, u.dataset.edcSig = c;
	let d = l("div", null, "display:flex;gap:12px;align-items:center;flex-wrap:wrap");
	if (d.append(l("span", `⚠️ Claude 版：這個類別有 ${o.total} 筆項目名稱開頭有「#」：${o.names.map((e) => `${e.raw} ${e.count} 筆`).join("、")}。原網站會把「${o.names[0].raw}」和「${T(o.names[0].raw) ?? ""}」當成不同項目。`, "font-weight:700")), o.changes.length) {
		let n = l("button", Wi);
		n.id = Ui, n.type = "button", n.className = "btn btn-primary btn-sm", n.addEventListener("click", () => ra(e, t)), d.append(n);
	}
	if (u.append(d), u.append(l("div", "只改表格裡項目名稱開頭的「#」，按之前會先問，可以用「↩️ 復原上一步」還原（重新整理頁面前）。項目記憶、測站歷史、記住的設定仍以帶「#」的名字記錄，不會跟著改。", "font-size:13px;color:#5b6b78")), s) {
		let e = l("div", "⚠️ " + s, "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b;font-weight:700");
		e.dataset.edc = "hash-old-abort", u.append(e);
	}
	if (o.conflicts.length) {
		let e = l("div", null, "margin-top:8px;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b");
		e.dataset.edc = "hash-old-conflict", e.append(l("div", `以下 ${o.conflicts.reduce((e, t) => e + t.count, 0)} 筆去掉「#」後會重複，按鈕不會改，請人工處理：`, "font-weight:700")), o.conflicts.forEach((t) => e.append(l("div", `・${t.period || "（沒有期別）"}／${t.station || "（沒有測站）"}／${t.raw}（${t.count} 筆）：${t.reason}`))), u.append(e);
	}
	return r ? r.replaceWith(u) : i.before(u), u;
}
function ra(e, t) {
	let n = t.win, r = ea(t);
	if (!r) return !1;
	let i = r.ds.getData(r.pid, r.catKey), a = JSON.stringify(i), o = Qi(i, Xi(r.cat.locationField));
	if (!o.changes.length || (Ji.delete(e), !n.confirm($i(o, Xi(r.cat.label) || r.catKey)))) return !1;
	let s = n.pushUndoSnapshot, c = n.renderContent, l = n.popUndoSnapshot;
	if (typeof s != "function" || typeof c != "function" || typeof r.ds.saveData != "function") return e.errors.push("去掉舊資料的 #：找不到上游的復原／存檔函式，沒有改"), n.alert("Claude 版：找不到原網站的「復原」或「存檔」功能（原網站可能已更新），這次沒有改任何資料。"), !1;
	let u = !1;
	try {
		let i = r.ds.getData(r.pid, r.catKey);
		if (JSON.stringify(i) !== a) {
			Ji.set(e, qi), e.errors.push("去掉舊資料的 #：表格在確認期間被改過，中止"), n.alert("Claude 版：按下「去掉這些 #」之後、確定之前，表格內容被改過（可能是別的分頁），這次沒有改任何資料。請重新看過提醒列再按一次。");
			try {
				na(e, t);
			} catch {}
			return !1;
		}
		s.call(n, r.pid, r.catKey, Ki(o.changes.length)), u = !0;
		for (let e of o.changes) i[e.index][si] = e.stripped;
		r.ds.saveData(r.pid, r.catKey, i);
	} catch (t) {
		if (u && typeof l == "function") try {
			l.call(n, r.pid, r.catKey);
		} catch {}
		return e.errors.push("去掉舊資料的 # 失敗：" + String(t)), n.alert("Claude 版：去掉「#」時出錯，這次沒有改任何資料。"), !1;
	}
	try {
		c.call(n);
	} catch (t) {
		e.errors.push("重畫失敗：" + String(t));
	}
	return !0;
}
function ia(e, t) {
	let n = t.doc.getElementById("content");
	if (typeof MutationObserver > "u" || !n) {
		e.paths.oldData = "failed";
		return;
	}
	e.paths.oldData = "active";
	let r = () => {
		try {
			na(e, t);
		} catch (t) {
			e.errors.push("畫舊資料 # 提醒失敗：" + String(t));
		}
	};
	new MutationObserver(r).observe(n, {
		childList: !0,
		subtree: !0
	}), r();
}
//#endregion
//#region src/xdw/button.ts
var aa = "edcBtnImportXdw", oa = "📄 匯入檔案（XDW）", sa = "掃描檔（DocuWorks .xdw）——Claude 版功能", ca = "edcXdwStyle", la = "\n.edc-xdw-btn{border:none;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;background:#6a4c9c;color:#fff;box-shadow:inset 0 0 0 1px #4b3172}\n.edc-xdw-btn:hover,.edc-xdw-btn:focus-visible{background:#57397f}\n.edc-xdw-btn:focus-visible{outline:2px solid #b9a7d6;outline-offset:2px}\n.edc-xdw-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2147482000;display:flex;align-items:center;justify-content:center}\n.edc-xdw-overlay[hidden]{display:none}\n.edc-xdw-dialog{background:#fff;color:#2b3e4e;width:min(1100px,94vw);max-height:92vh;overflow:auto;border-radius:10px;border-top:6px solid #6a4c9c;padding:16px 20px;box-shadow:0 10px 40px rgba(0,0,0,.3);font-size:14px;line-height:1.6}\n.edc-xdw-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}\n.edc-xdw-title{margin:0;font-size:18px;color:#4b3172}\n.edc-xdw-close{border:1px solid #c9bfdc;background:#f6f2fb;color:#4b3172;border-radius:6px;padding:4px 10px;font:inherit;font-size:13px;cursor:pointer}\n.edc-xdw-note{margin:0 0 10px;padding:8px 12px;background:#f6f2fb;border-left:5px solid #7a5fb0;border-radius:4px}\n.edc-xdw-drop{border:2px dashed #b9a7d6;border-radius:8px;padding:16px;text-align:center;background:#fbf9fe}\n.edc-xdw-drop.edc-xdw-drag{background:#ece6f5;border-color:#6a4c9c}\n.edc-xdw-pick{margin-left:6px}\n.edc-xdw-status{margin:10px 0 4px;font-weight:600}\n.edc-xdw-status .edc-xdw-red{margin-left:10px}\n.edc-xdw-red{color:#b3261e;font-weight:700}\n.edc-xdw-errors{margin:6px 0;padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px;color:#8a1f1b}\n.edc-xdw-errors[hidden]{display:none}\n.edc-xdw-errors ul{margin:4px 0 4px 18px;padding:0}\n.edc-xdw-thumbs{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}\n.edc-xdw-thumb{width:224px;border:1px solid #dce5ea;border-radius:6px;padding:4px;background:#fff;cursor:zoom-in;font:inherit;text-align:center;color:inherit}\n.edc-xdw-thumb canvas{display:block;width:220px;height:auto;background:#fff}\n.edc-xdw-thumb-cap{font-size:12px;color:#5b6b78;margin-top:2px}\n.edc-xdw-thumb-bad{cursor:default;border:2px solid #d9534f;background:#fdf1f0;color:#8a1f1b;padding:10px;min-height:120px;font-weight:700}\n.edc-xdw-zoom{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:2147482001;overflow:auto;padding:20px;text-align:center}\n.edc-xdw-zoom[hidden]{display:none}\n.edc-xdw-zoom-bar{position:sticky;top:0;display:flex;justify-content:center;gap:12px;align-items:center;color:#fff;margin-bottom:8px}\n.edc-xdw-zoom canvas{max-width:100%;height:auto;background:#fff}\n.edc-xdw-thumbs-title{margin:12px 0 4px;font-size:14px;color:#5b6b78;font-weight:600}\n.edc-xdw-thumbs-title[hidden]{display:none}\n.edc-read{margin-top:16px;padding:12px 14px;border:3px solid #6a4c9c;border-radius:8px;background:#f8f5fc}\n.edc-read[hidden]{display:none}\n.edc-read-title{margin:0 0 6px;font-size:18px;color:#4b3172}\n.edc-read-why{font-weight:600;color:#4a5866}\n.edc-read-intro{margin:0 0 8px;padding:6px 10px;background:#fff;border-left:5px solid #6a4c9c;border-radius:4px;font-weight:600}\n.edc-read-progress{font-weight:700;color:#4b3172;min-height:1.2em}\n.edc-read-summary{font-weight:700;font-size:15px;margin:4px 0 8px}\n.edc-read-pages{display:flex;flex-direction:column;gap:10px}\n.edc-read-page{background:#fff;border:1px solid #c9bfdc;border-radius:6px;padding:8px}\n.edc-read-page-bad{border:2px solid #d9534f;background:#fdf1f0}\n.edc-read-page-head{display:flex;flex-wrap:wrap;gap:10px;align-items:baseline;margin-bottom:4px}\n.edc-read-ok{color:#2e6b34;font-weight:700}\n.edc-read-pages-all{color:#2e6b34;font-weight:700}\n.edc-read-file{margin:6px 0;padding:4px 0 4px 8px;border-left:3px solid #b9c7d6}\n.edc-read-file-title{font-weight:700;color:#2b3e4e}\n.edc-read-filecount{margin:4px 0;color:#2b3e4e}\n.edc-read-pick-item{display:inline-flex;gap:4px;align-items:center;margin:2px 10px 2px 0}\n.edc-read-pick-nondata{background:#e9e9e9;color:#555;padding:1px 6px;border-radius:4px}\n.edc-read-pick-note-nondata{font-size:12px;color:#555}\n.edc-read-pick-note-unsure{font-size:12px;color:#8a5a00;font-weight:700}\n.edc-xdw-file-head{grid-column:1/-1;flex-basis:100%;width:100%;font-weight:700;margin:8px 0 2px;color:#2b3e4e}\n.edc-res-file{margin:10px 0;padding:6px 0 6px 10px;border-left:4px solid #6a8cae}\n.edc-res-file-title{font-weight:700;font-size:15px;color:#24496e;margin-bottom:4px}\n.edc-res-file-counts{margin:2px 0 6px}\n.edc-read-bad{color:#8a1f1b;font-weight:700}\n.edc-read-form{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin:12px 0 8px;padding-top:10px;border-top:1px solid #d8cdea}\n.edc-read-field{display:flex;flex-direction:column;gap:2px;font-size:13px}\n.edc-read-label{font-weight:700;color:#4b3172}\n.edc-read-input{padding:5px 8px;border:1px solid #b9a7d6;border-radius:6px;font:inherit;font-size:13px;max-width:320px}\n.edc-read-hint{font-size:12px;color:#8a5a00}\n.edc-read-confirm-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}\n.edc-read-confirm{font-size:14px;padding:8px 14px}\n.edc-read-confirm:disabled{opacity:.5;cursor:not-allowed}\n.edc-read-why-disabled{color:#8a1f1b;font-weight:600}\n.edc-read-done{margin-top:8px}\n.edc-read-done-item{padding:8px 10px;background:#fff;border:1px dashed #6a4c9c;border-radius:6px;margin-top:6px}\n.edc-read-done-head{font-weight:700;color:#4b3172}\n.edc-read-run{margin-top:10px;padding:8px 10px;background:#fff;border:1px solid #b9a7d6;border-radius:6px}\n.edc-read-run[hidden],.edc-read-pause[hidden],.edc-read-next[hidden],.edc-read-run [hidden],.edc-read-logbar [hidden],.edc-res [hidden]{display:none}\n.edc-read-run-status{font-weight:700;color:#4b3172}\n.edc-read-run-note{font-size:13px;color:#5b6b78;min-height:1.2em}\n.edc-read-pause{font-weight:700;color:#8a5a00}\n.edc-read-tokens{font-size:13px;color:#4a5866;margin-top:4px}\n.edc-read-end{margin-top:6px;font-weight:700}\n.edc-read-locked{color:#4a5866}\n.edc-read-logbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}\n.edc-read-load-why{font-size:12px;color:#5b6b78}\n.edc-read-logbar button:disabled{opacity:.5;cursor:not-allowed}\n.edc-res{margin-top:10px}\n.edc-res-counts{font-weight:700;font-size:15px;margin-bottom:6px}\n.edc-res-page{background:#fff;border:1px solid #c9bfdc;border-radius:6px;padding:8px;margin-top:8px}\n.edc-res-page-manual{border:2px solid #e0882b}\n.edc-res-page-skip{border:2px solid #d9534f;background:#fdf1f0}\n.edc-res-page-head{display:flex;flex-wrap:wrap;gap:10px;align-items:baseline}\n.edc-res-mode{color:#4b3172;font-weight:600}\n.edc-res-page-status{font-weight:600}\n.edc-res-identity{margin:4px 0 4px 18px;padding:0;font-size:13px}\n.edc-res-warn{color:#8a5a00;font-size:13px}\n.edc-res-table,.edc-res-cmp{border-collapse:collapse;font-size:13px;margin-top:4px}\n.edc-res-table th,.edc-res-table td,.edc-res-cmp th,.edc-res-cmp td{border:1px solid #d8cdea;padding:2px 6px;text-align:left}\n.edc-res-row,.edc-res-arow{cursor:pointer}\n.edc-res-attn-page{background:#fff;border:1px solid #c9bfdc;border-radius:6px;padding:8px;margin-top:8px}\n.edc-res-attn-page-manual{border:2px solid #e0882b}\n.edc-res-attn-page-skip{border:2px solid #d9534f;background:#fdf1f0}\n.edc-res-allpass{background:#eef7ef;border:1px solid #9fcca4;border-radius:6px;padding:6px 8px;color:#2e6b34;font-weight:600}\n.edc-res-noattn{color:#2e6b34;margin-top:6px}\n.edc-res-hidden-pass{font-size:13px;color:#5b6b78;margin-top:4px}\n.edc-res-showall{margin-top:10px}\n.edc-res-pass .edc-res-status{color:#2e6b34;font-weight:700}\n.edc-res-manual .edc-res-status{color:#b35a00;font-weight:700}\n.edc-res-manual{background:#fff4e6}\n.edc-res-manualin,.edc-res-manual.edc-res-manualin{background:#f1e9fb}\n.edc-res-manualin .edc-res-status{color:#6a4c9c;font-weight:700}\n.edc-res-byhand{font-size:13px;color:#8a1f1b;margin-top:4px}\n.edc-man{margin-top:8px;padding:8px 10px;border:1px solid #9b7fc7;border-left:5px solid #6a4c9c;background:#f8f4fd;border-radius:6px;cursor:default}\n.edc-man-head{font-weight:700;color:#4b3172}\n.edc-man-item{font-size:13px;margin:2px 0 4px}\n.edc-man-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px 12px}\n.edc-man-field{display:flex;flex-direction:column;font-size:13px}\n.edc-man-label{font-weight:600}\n.edc-man-input{font-size:14px;padding:3px 6px;border:1px solid #b9a7d6;border-radius:4px}\n.edc-man-input[aria-invalid=\"true\"]{border-color:#d9534f;background:#fdf1f0}\n.edc-man-input.edc-man-preset-on{background:#efe8f8;color:#4b3172}\n.edc-man-why{font-size:12px;color:#5b6b78}\n.edc-man-why.edc-man-bad,.edc-man-msg.edc-man-bad{color:#8a1f1b}\n.edc-man-preset{margin-top:6px}\n.edc-man-preset-note{font-size:12px;color:#5b6b78;margin-top:2px}\n.edc-man-checkline{display:flex;gap:6px;align-items:center;margin-top:8px;font-weight:600}\n.edc-man-msg{font-size:13px;margin-top:2px}\n.edc-man-msg.edc-man-ok{color:#4b3172}\n.edc-res-frag-img{display:block;max-width:100%;max-height:320px;width:auto;margin-top:4px;border:1px solid #b9a7d6;cursor:zoom-in}\n.edc-res-frag-img.edc-res-frag-full{max-width:none;max-height:none;cursor:zoom-out}\n.edc-res-frag-wrap.edc-res-frag-scroll{overflow:auto;max-height:70vh;max-width:100%}\n.edc-res-frag-note,.edc-res-frag-none{font-size:12px;color:#5b6b78}\n.edc-read-next{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}\n.edc-read-to-import:disabled{opacity:.5;cursor:not-allowed}\n.edc-read-next-note{font-size:13px;color:#5b6b78}\n.edc-read-submit-msg{margin-top:8px}\n.edc-read-submit-stage{font-weight:700;color:#4b3172}\n.edc-read-submit-fail{padding:8px 12px;border:1px solid #d9534f;background:#fdf1f0;border-radius:4px}\n.edc-read-download-xlsx{margin-top:6px}\n.edc-xdw-connect{margin-top:16px;padding-top:12px;border-top:1px solid #e3dcef}\n.edc-xdw-connect[hidden]{display:none}\n.edc-xdw-connect-title{margin:0 0 6px;font-size:16px;color:#4b3172}\n.edc-xdw-connect-note{margin:0 0 8px;font-size:13px;color:#4a5866}\n.edc-xdw-connect-status{font-weight:700;margin-bottom:6px;color:#5b6b78}\n.edc-xdw-connect-status.edc-xdw-connect-has{color:#2e6b34}\n.edc-xdw-connect-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.edc-xdw-connect-input{flex:1 1 280px;min-width:200px;padding:6px 8px;border:1px solid #b9a7d6;border-radius:6px;font:inherit;font-size:13px}\n.edc-xdw-connect-row button:disabled{opacity:.55;cursor:wait}\n.edc-xdw-connect-msg{min-height:1.4em;margin-top:6px}\n.edc-xdw-connect-results{margin:4px 0 0 18px;padding:0}\n.edc-xdw-connect-ok{color:#2e6b34;font-weight:600}\n.edc-xdw-connect-gray{color:#5b6b78}\n";
function ua(e) {
	if (e.getElementById("edcXdwStyle")) return;
	let t = e.createElement("style");
	t.id = ca, t.textContent = la, (e.head ?? e.documentElement).append(t);
}
function da(e, t) {
	let n = e.getElementById("btnImport"), r = e.getElementById(aa);
	if (!n || r && n.nextElementSibling === r) return !1;
	let i = r ?? fa(e, t);
	return n.after(i), !0;
}
function fa(e, t) {
	let n = e.createElement("button");
	return n.type = "button", n.id = aa, n.className = "edc-xdw-btn", n.textContent = oa, n.title = sa, n.addEventListener("click", (e) => {
		try {
			e.preventDefault(), t();
		} catch {}
	}), n;
}
function pa(e, t) {
	try {
		ua(e);
	} catch {}
	let n = () => {
		try {
			da(e, t);
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
var ma = [
	"pdfjsLib",
	"_pdfjsTestingUtils",
	"pdfjsWorker"
], ha = () => import("./edc-xdw.js"), ga = /* @__PURE__ */ new Map();
function _a(e, t) {
	for (let n of t) try {
		n.had ? e[n.k] !== n.v && (e[n.k] = n.v) : Object.prototype.hasOwnProperty.call(e, n.k) && delete e[n.k];
	} catch {}
}
async function va(e, t = globalThis) {
	let n = ga.get(t);
	n || (n = {
		depth: 0,
		snap: ma.map((e) => ({
			k: e,
			had: Object.prototype.hasOwnProperty.call(t, e),
			v: t[e]
		}))
	}, ga.set(t, n)), n.depth++;
	try {
		return await e();
	} finally {
		_a(t, n.snap), --n.depth === 0 && ga.delete(t);
	}
}
function ya(e, t = ha) {
	return va(async () => (await t()).decodeXdw(e));
}
function ba(e) {
	return va(async () => (await import("./edc-xdw.js")).countXdwPages(e));
}
var xa = 2576, Sa = 4784, Ca = (e, t) => Number.isInteger(e) && Number.isInteger(t) && e >= 1 && t >= 1;
function wa(e, t) {
	if (!Ca(e, t)) return `影像尺寸無效（${e}×${t}）`;
	if (Math.max(e, t) > 2576) return `影像長邊 ${Math.max(e, t)}px 超過上限 ${xa}px`;
	let n = Math.ceil(e / 28) * Math.ceil(t / 28);
	return n > 4784 ? `影像太大（${n} 個區塊，上限 ${Sa}）` : null;
}
function Ta(e, t, n = 3, r = 120) {
	if (!Ca(e, t)) throw Error(`影像尺寸無效（${e}×${t}），無法切圖`);
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
function Ea(e, t) {
	if (!Ca(e, t)) return {
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
	}], r = Ta(e, t);
	for (let e of [...n, ...r]) {
		let t = wa(e.w, e.h);
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
function Da(e, t) {
	if (!Ca(t.w, t.h) || !Number.isInteger(t.x) || !Number.isInteger(t.y) || t.x < 0 || t.y < 0 || t.x + t.w > e.width || t.y + t.h > e.height) throw Error("裁切範圍超出影像");
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
function Oa(e, t, n) {
	let r = e.createElement("canvas");
	return r.width = t, r.height = n, r;
}
var ka = (e) => {
	e.width = 0, e.height = 0;
};
async function Aa(e, t) {
	let n = Oa(e, t.width, t.height);
	try {
		let e = n.getContext("2d");
		return e ? (e.putImageData(new ImageData(t.data, t.width, t.height), 0, 0), await new Promise((e) => n.toBlob((t) => e(t), "image/png"))) : null;
	} finally {
		ka(n);
	}
}
function ja(e) {
	return new Promise((t) => {
		try {
			e.toBlob((e) => t(e), "image/png");
		} catch {
			t(null);
		}
	});
}
async function Ma(e, t) {
	let n = await createImageBitmap(t, {
		colorSpaceConversion: "none",
		premultiplyAlpha: "none"
	}), r = Oa(e, n.width, n.height);
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
		n.close(), ka(r);
	}
}
function Na(e) {
	let t = "";
	for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
	return btoa(t);
}
async function Pa(e, t) {
	let n = await Aa(e, t);
	if (!n || n.size <= 0) throw Error("PNG 編碼失敗");
	return Na(new Uint8Array(await n.arrayBuffer()));
}
async function Fa(e) {
	let t = globalThis.crypto?.subtle;
	if (!t) throw Error("這個瀏覽器不能計算 SHA-256");
	let n = new Uint8Array(await t.digest("SHA-256", e));
	return Array.from(n, (e) => e.toString(16).padStart(2, "0")).join("");
}
//#endregion
//#region src/xdwread/pageclass.ts
var Ia = "預設不送：看起來不是資料頁（封面、目錄、聲明書等）", La = 1e3, Ra = {
	nondataHlen: 14,
	nondataCross: 30,
	dataHlen: 18,
	dataCross: 35
};
function za(e, t) {
	return !Number.isFinite(e) || !Number.isFinite(t) ? "unsure" : e < Ra.nondataHlen && t < Ra.nondataCross ? "nondata" : e >= Ra.dataHlen && t >= Ra.dataCross ? "data" : "unsure";
}
function Ba(e, t, n, r, i, a) {
	let o = 0;
	for (; o < r;) {
		if (!e[n + o * i]) {
			o++;
			continue;
		}
		let s = o;
		for (; s < r && e[n + s * i];) s++;
		if (s - o >= a) for (let e = o; e < s; e++) t[n + e * i] = 1;
		o = s;
	}
}
function Va(e, t, n) {
	let r = new Uint8Array(e.length);
	for (let i = 0; i < n; i++) {
		let a = i * t;
		for (let o = 0; o < t; o++) {
			let s = a + o;
			(e[s] || o > 0 && e[s - 1] || o < t - 1 && e[s + 1] || i > 0 && e[s - t] || i < n - 1 && e[s + t]) && (r[s] = 1);
		}
	}
	return r;
}
function Ha(e, t, n) {
	let r = new Uint8Array(e.length), i = [], a = 0;
	for (let o = 0; o < e.length; o++) if (!(!e[o] || r[o])) for (a++, r[o] = 1, i.push(o); i.length;) {
		let a = i.pop(), o = a % t, s = (a - o) / t;
		o > 0 && e[a - 1] && !r[a - 1] && (r[a - 1] = 1, i.push(a - 1)), o < t - 1 && e[a + 1] && !r[a + 1] && (r[a + 1] = 1, i.push(a + 1)), s > 0 && e[a - t] && !r[a - t] && (r[a - t] = 1, i.push(a - t)), s < n - 1 && e[a + t] && !r[a + t] && (r[a + t] = 1, i.push(a + t));
	}
	return a;
}
function Ua(e, t, n) {
	if (!(t >= 3 && n >= 3) || e.length < t * n) throw Error("頁面圖太小");
	let r = t * n, i = new Uint8Array(r);
	for (let t = 0; t < r; t++) i[t] = +(e[t] < 200);
	let a = i.slice();
	for (let e = 0; e < n; e++) for (let n = 1; n < t - 1; n++) {
		let r = e * t + n;
		i[r - 1] && i[r + 1] && (a[r] = 1);
	}
	let o = a.slice();
	for (let e = 1; e < n - 1; e++) for (let n = 0; n < t; n++) {
		let r = e * t + n;
		(a[r - t] || a[r + t]) && (o[r] = 1);
	}
	let s = i.slice();
	for (let e = 0; e < n; e++) for (let n = 1; n < t - 1; n++) {
		let r = e * t + n;
		(i[r - 1] || i[r + 1]) && (s[r] = 1);
	}
	let c = s.slice();
	for (let e = 1; e < n - 1; e++) for (let n = 0; n < t; n++) {
		let r = e * t + n;
		s[r - t] && s[r + t] && (c[r] = 1);
	}
	let l = new Uint8Array(r), u = new Uint8Array(r);
	for (let e = 0; e < n; e++) Ba(o, l, e * t, t, 1, 40);
	for (let e = 0; e < t; e++) Ba(c, u, e, n, t, 40);
	let d = Math.floor(.03 * t);
	for (let e of [l, u]) for (let r = 0; r < n; r++) for (let i = 0; i < t; i++) (i < d || i >= t - d || r < d || r >= n - d) && (e[r * t + i] = 0);
	let f = 0;
	for (let e = 0; e < r; e++) f += l[e];
	let p = Va(Va(l, t, n), t, n), m = Va(Va(u, t, n), t, n), h = new Uint8Array(r);
	for (let e = 0; e < r; e++) h[e] = p[e] & m[e];
	return {
		hlen: Math.round(f / t * 10) / 10,
		cross: Ha(h, t, n)
	};
}
function Wa(e, t, n) {
	try {
		let r = Ua(e, t, n);
		return {
			kind: za(r.hlen, r.cross),
			hlen: r.hlen,
			cross: r.cross,
			changed: !1
		};
	} catch {
		return {
			kind: "unsure",
			hlen: null,
			cross: null,
			changed: !1
		};
	}
}
function Ga(e, t, n) {
	let r = new Uint8Array(t * n);
	for (let i = 0, a = 0; i < t * n; i++, a += 4) {
		let t = e[a + 3] / 255, n = (e[a] * 299 + e[a + 1] * 587 + e[a + 2] * 114) / 1e3;
		r[i] = Math.round(n * t + 255 * (1 - t));
	}
	return r;
}
function Ka(e, t) {
	let n = null;
	try {
		let r = La, i = Math.max(1, Math.round(t.height * La / t.width));
		n = e.createElement("canvas"), n.width = r, n.height = i;
		let a = n.getContext("2d", { willReadFrequently: !0 });
		if (!a) throw Error("no 2d");
		a.fillStyle = "#fff", a.fillRect(0, 0, r, i), a.imageSmoothingEnabled = !0, a.imageSmoothingQuality = "high", a.drawImage(t, 0, 0, r, i);
		let o = a.getImageData(0, 0, r, i).data;
		return Wa(Ga(o, r, i), r, i);
	} catch {
		return {
			kind: "unsure",
			hlen: null,
			cross: null,
			changed: !1
		};
	} finally {
		n && (n.width = 0, n.height = 0);
	}
}
//#endregion
//#region src/xdwread/template-air.ts
var qa = (e) => e === "L1" || e === "L2", Ja = {
	L1: "檢測報告",
	L2: "檢測報告",
	L3: "空氣品質監測逐時結果紀錄表(1/2)",
	L4: "空氣品質監測逐時結果紀錄表(2/2)"
}, Ya = "ppm", Xa = "μg/m3", Za = "最大小時平均值", Qa = "日平均值", $a = "8小時最大平均值", eo = "24小時值", to = [
	[
		"SO2",
		Ya,
		Za
	],
	[
		"SO2",
		Ya,
		Qa
	],
	[
		"NOx",
		Ya,
		Za
	],
	[
		"NOx",
		Ya,
		Qa
	],
	[
		"CO",
		Ya,
		Za
	],
	[
		"CO",
		Ya,
		Qa
	],
	[
		"CO",
		Ya,
		$a
	],
	[
		"O3",
		Ya,
		Za
	],
	[
		"O3",
		Ya,
		Qa
	],
	[
		"O3",
		Ya,
		$a
	],
	[
		"THC",
		Ya,
		Za
	],
	[
		"THC",
		Ya,
		Qa
	],
	[
		"PM10",
		Xa,
		Za
	],
	[
		"PM10",
		Xa,
		Qa
	],
	[
		"TSP",
		Xa,
		eo
	],
	[
		"NO2",
		Ya,
		Za
	],
	[
		"NO2",
		Ya,
		Qa
	]
], no = [[
	"PM2.5",
	Xa,
	eo
]], ro = [
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
], io = [
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
		Xa
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
		Xa
	]
], ao = {
	4: ["風向"],
	5: ["風速"],
	6: ["溫度"],
	7: ["相對濕度", "濕度"]
}, oo = (e) => e.normalize("NFKC").replace(/\s+/g, "").replace(/溼/g, "濕"), so = [
	"最大小時平均值",
	"最小小時平均值",
	"日平均值或最頻風向"
], co = { NOx: ["NOx", "NOX"] }, lo = {
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
}, uo = /^[A-Z]{2}\d{3}[A-Z]\d{4}N?$/, fo = /^\d{3}\.\d{2}\.\d{2}$/, po = /^NIEA [A-Z]\d{3}\.\d{2}[A-Z]$/, mo = /^\d+(?:\.\d+)?$/, ho = /^(\d{3})\.(\d{2})\.(\d{2})\/(\d{2}):(\d{2})至(\d{3})\.(\d{2})\.(\d{2})\/(\d{2}):(\d{2})$/, go = /^(\d{3})\.(\d{2})\.(\d{2})~(\d{3})\.(\d{2})\.(\d{2})$/, _o = /^(\d{2}):00~(\d{2}):00$/, vo = [
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
], yo = [
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
], bo = [
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
], xo = [
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
], I = {
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
}, So = {
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
}, Co = [
	"SO2",
	"NO2",
	"CO",
	"O3",
	"CH4",
	"NMHC",
	"THC",
	"PM10"
], wo = [
	"SO2",
	"NO2",
	"CO",
	"O3",
	"THC",
	"PM10",
	"TSP"
], To = "周界空氣品質", Eo = {
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
}, Do = {
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
}, Oo = {
	CH4: "THC",
	NMHC: "THC"
}, ko = "不是空品版型（封面、目錄、聲明書等沒有資料的頁也是這個結果）", Ao = (e, t) => {
	if (e === null) return !1;
	let n = j(e), r = co[t];
	return r ? r.includes(n) : n === j(t);
}, jo = (e, t) => e !== null && j(e) === j(t);
function Mo(e, t) {
	let n = e.summary_rows;
	return n.length === t.length && t.every(([e, t, r], i) => Ao(n[i].item, e) && jo(n[i].unit, t) && jo(n[i].stat, r));
}
var No = new Set([
	...[...to, ...no].map(([e]) => e),
	...ro.map(([e]) => e),
	...io.filter((e, t) => ao[t] === void 0).map(([e]) => e),
	...Object.values(co).flat(),
	"NO2",
	"NOx",
	"NO",
	"PM2.5"
].map((e) => oo(e).toUpperCase()));
function Po(e, t) {
	let n = ao[t];
	if (n === void 0 || e === null) return !1;
	let r = oo(e);
	if (r === "" || No.has(r.toUpperCase())) return !1;
	for (let [e, n] of Object.entries(ao)) if (Number(e) !== t && n.includes(r)) return !1;
	return n.includes(r);
}
function Fo(e, t) {
	let n = e.hourly.columns, r = t === io;
	return n.length === t.length && t.every(([e, t, i], a) => (r && ao[a] !== void 0 ? Po(n[a].item, a) : Ao(n[a].item, e)) && (t === null ? n[a].sub === null : jo(n[a].sub, t)) && jo(n[a].unit, i));
}
function Io(e, t) {
	let n = e.form_title === null ? "" : j(e.form_title);
	return e.summary_rows !== null && e.hourly === null ? n === j(Ja.L1) ? Mo(e, to) ? "L1" : Mo(e, no) ? "L2" : (t.push(`測項列的項目／單位／統計項不符版型（讀到 ${e.summary_rows.length} 列）`), null) : (t.push("標題不是「檢測報告」"), null) : e.hourly !== null && e.summary_rows === null ? n === j(Ja.L3) && Fo(e, ro) ? "L3" : n === j(Ja.L4) && Fo(e, io) ? "L4" : (t.push(`逐時表的標題或欄（項目／小字／單位）不符版型（讀到 ${e.hourly.columns.length} 欄）`), null) : (t.push(e.hourly === null ? "沒有測項表格也沒有逐時表格" : "測項表格與逐時表格兩個都有"), null);
}
var Lo = (e, t) => new Date(Date.UTC(e + 1911, t, 0)).getUTCDate(), Ro = (e) => e.rocYear >= 1 && e.month >= 1 && e.month <= 12 && e.day >= 1 && e.day <= Lo(e.rocYear, e.month), zo = (e) => Date.UTC(e.rocYear + 1911, e.month - 1, e.day), Bo = (e) => zo(e) + (e.hour * 60 + e.minute) * 6e4, Vo = (e, t) => e.rocYear === t.rocYear && e.month === t.month && e.day === t.day, Ho = (e, t) => e.rocYear === t.rocYear && Math.ceil(e.month / 3) === t.quarter;
function Uo(e) {
	if (e === null) return null;
	let t = ho.exec(A(e));
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
	for (let e of [r, i]) if (!Ro(e) || e.hour > 23 || e.minute > 59) return null;
	return Bo(i) <= Bo(r) ? null : {
		start: r,
		end: i
	};
}
function Wo(e) {
	if (e === null) return null;
	let t = go.exec(A(e));
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
	return !Ro(r) || !Ro(i) || zo(i) < zo(r) ? null : {
		start: r,
		end: i
	};
}
var Go = (e) => {
	let [t, n = ""] = e.split(".");
	return {
		n: BigInt(t + n),
		d: n.length
	};
};
function Ko(e, t, n) {
	if (!mo.test(e) || !mo.test(t)) return !1;
	let r = Go(e), i = Go(t);
	i.d += n;
	let a = Math.max(r.d, i.d), o = r.n * 10n ** BigInt(a - r.d), s = i.n * 10n ** BigInt(a - i.d), c = 10n ** BigInt(a - Math.min(r.d, i.d));
	return (o > s ? o - s : s - o) <= c;
}
function qo(e, t) {
	return t === null ? `${e} 讀法沒有回覆` : t.ok ? null : `${e} 讀法沒有可用的回覆（${t.detail}）`;
}
var Jo = (e) => e === null ? null : j(e).replace(/:/g, ""), Yo = (e) => e.summary_rows === null && e.hourly === null;
function Xo(e, t, n, r) {
	let i = qa(e), a = i ? lo.summary : lo.hourly;
	for (let [e, n] of Object.entries(a)) for (let [i, a] of [["A", t.a], ["B", t.b]]) Jo(a[e].label) !== n && r.push(`${i} 讀法的「${n}」標籤不符`);
	let o = null, s = null;
	if (i) {
		let e = Xt("報告編號", t.a.report_no.value, t.b.report_no.value, uo, !1);
		e.ok ? o = e.out : r.push(e.reason);
		let n = Xt("收樣日期", t.a.receive_date.value, t.b.receive_date.value, fo, !1);
		if (!n.ok) r.push(n.reason);
		else {
			let [e, t, i] = n.out.split(".").map(Number);
			Ro({
				rocYear: e,
				month: t,
				day: i
			}) ? s = n.out : r.push("收樣日期不是存在的日期");
		}
	} else for (let e of ["report_no", "receive_date"]) [t.a, t.b].some((t) => t[e].label !== null || t[e].value !== null) && r.push(`逐時紀錄表不該有「${e === "report_no" ? "報告編號" : "收樣日期"}」，卻讀到內容`);
	let c = Zt("現場編號", t.a.site_code.value, t.b.site_code.value, !1);
	c.ok || r.push(c.reason);
	let l = Zt(i ? "檢測位置" : "監測位置", t.a.location.value, t.b.location.value, !1);
	l.ok || r.push(l.reason);
	let u = t.a.period.value, d = t.b.period.value, f = null, p = null, m = i ? "檢測日期/時間" : "監測日期";
	u === null || d === null ? r.push(`${m}是空白`) : A(u) === A(d) ? i ? (f = Uo(u), f ? p = {
		start: f.start,
		end: f.end
	} : r.push(`${m}的寫法無法解析（要像「年.月.日/時:分 至 年.月.日/時:分」，日期要存在、迄晚於起）`)) : (p = Wo(u), p || r.push(`${m}的寫法無法解析（要像「年.月.日~年.月.日」，日期要存在）`)) : r.push(`${m}兩次讀值不同`), p && !Ho(p.start, n) && r.push(`起始日期不在選的期別內（${n.rocYear} 年第 ${n.quarter} 季）`);
	let h = null;
	return i || (h = Zo(t, r)), r.length || !c.ok || !l.ok || !p || i && (!o || !s || !f) || !i && !h ? null : {
		siteCode: c.out,
		location: l.out,
		siteKey: j(c.out),
		locKey: j(l.out),
		periodKey: A(u),
		reportNo: o,
		receiveDate: s,
		window: f,
		dates: p,
		hours: h
	};
}
function Zo(e, t) {
	let n = t.length, r = e.a.hourly.hours, i = e.b.hourly.hours, a = -1, o = -1;
	if (r.length !== 24 || i.length !== 24) t.push(`小時列不是 24 列（A ${r.length}、B ${i.length}）`);
	else {
		let e = [], n = -1;
		for (let t = 0; t < 24; t++) {
			let s = r[t], c = i[t], l = s === null ? null : _o.exec(A(s)), u = l ? Number(l[1]) : -1, d = l ? Number(l[2]) : -1;
			s !== null && c !== null && A(s) === A(c) && l !== null && u <= 23 && d <= 23 && (u + 1) % 24 === d && (t === 0 || u === n) || e.push(t + 1), n = d, t === 0 && (a = u), t === 23 && (o = d);
		}
		e.length && t.push(`小時列兩次讀值不同、寫法不符或不連續：第 ${e.join("、")} 列`);
	}
	for (let [n, r] of [["A", e.a], ["B", e.b]]) {
		let e = r.hourly;
		e.stats.length !== so.length || !e.stats.every((e, t) => jo(e.label, so[t])) ? t.push(`${n} 讀法的統計列標籤不符（要依序是 ${so.join("、")}）`) : e.stats.every((t) => t.values.length === e.columns.length) || t.push(`${n} 讀法的統計列值的個數和欄數不同`);
	}
	return t.length === n ? {
		firstStart: a,
		lastEnd: o
	} : null;
}
function Qo(e, t) {
	let n = {
		name: e.name,
		layout: e.layout,
		index: e.index,
		use: e.use
	}, r = [], i, a = null, o, s;
	if (qa(e.layout)) {
		let n = t.a.summary_rows[e.index], c = t.b.summary_rows[e.index];
		o = n.value, s = c.value, i = Xt(`${e.name} 的值`, n.value, c.value, mo, !1);
		let l = Zt(`${e.name} 的單位`, n.unit, c.unit, !1);
		a = Zt(`${e.name} 的檢測方法`, n.method, c.method, !1, po), l.ok || r.push(l.reason), a.ok || r.push(a.reason);
	} else o = t.a.hourly.stats[2].values[e.index], s = t.b.hourly.stats[2].values[e.index], i = Xt(`${e.name} 的日平均值`, o, s, mo, !1);
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
var $o = (e) => [...yo, ...bo].filter((t) => t.layout === e);
function es(e, t) {
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
			n.push(i.nondata ? {
				...a,
				status: "nodata",
				reasons: [Ia]
			} : {
				...a,
				status: "skip",
				reasons: ["這頁沒有送出"]
			});
			continue;
		}
		let o = qo("A", i.a), s = qo("B", i.b);
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
		let l = [], u = [], d = Io(c.a, l), f = Io(c.b, u);
		if (!d && !f && Yo(c.a) && Yo(c.b)) {
			n.push({
				...a,
				status: "nodata",
				reasons: [ko]
			});
			continue;
		}
		if (!d || !f || d !== f) {
			let e = d && f ? [`A、B 判定的版型不同（${d}／${f}）`] : [
				ko,
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
		let p = [], m = Xo(d, c, e.period, p);
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
			cells: $o(d).map((e) => Qo(e, c))
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
			e.forEach((e) => c(e, i.reasons[0])), ts(i, i.reasons[0]);
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
			if ((t.start.minute !== 0 || t.end.minute !== 0 || Bo(t.end) - Bo(t.start) !== 24 * 36e5) && u("時間窗不是整點起訖的 24 小時"), Number(e.receiveDate.split(".")[0]) !== t.start.rocYear && u("收樣日期的年和時間窗起始的年不同"), i.status === "ok") {
				i.window = t, i.windowPage = n[p].page, i.receiveDate = e.receiveDate, d !== void 0 && n[d].status === "ok" && (i.reportNos.L1 = n[d].identity.reportNo), f !== void 0 && n[f].status === "ok" && (i.reportNos.L2 = n[f].identity.reportNo), i.location = e.location, i.siteCode = e.siteCode;
				for (let e of ["L3", "L4"]) {
					let r = l[e];
					if (r === void 0) continue;
					let i = n[r].identity;
					!Vo(i.dates.start, t.start) || !Vo(i.dates.end, t.end) ? c(r, `${e} 的監測日期和總表的時間窗日期不同`) : (i.hours.firstStart !== t.start.hour || i.hours.lastEnd !== t.end.hour) && c(r, `${e} 的第一／最後一個小時格和總表的時間窗不同`);
				}
			}
		}
		if (i.status === "manual") {
			e.forEach((e) => {
				n[e].status === "ok" && c(e, i.reasons[0]);
			}), ts(i, i.reasons[0]);
			continue;
		}
		i.values = ns(n, l);
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
function ts(e, t) {
	e.values = vo.map((e) => ({
		key: e,
		page: null,
		status: "manual",
		reasons: [`全站需人工：${t}`],
		value: null,
		method: null,
		cross: "none"
	}));
}
function ns(e, t) {
	let n = (n) => {
		let r = t[n];
		return r !== void 0 && e[r].status === "ok" ? e[r] : null;
	}, r = (e, t) => n(e)?.cells.find((n) => n.name === t && n.layout === e) ?? null, i = [];
	for (let a of vo) {
		let o = yo.find((e) => e.key === a), s = n(o.layout), c = {
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
		if (!qa(o.layout)) {
			let e = Oo[a] ?? a, t = r("L1", e);
			if (!t || t.status !== "pass" || !t.method) {
				c.reasons.push(`方法來源（L1 的 ${e} 日平均列）沒有通過核對`);
				continue;
			}
			u = t.method;
		}
		let d = xo.find((e) => e.key === a);
		if (d) {
			let e = r(d.against.layout, d.against.name);
			if (!e || e.status !== "pass") {
				c.cross = "unavailable", c.reasons.push(`交叉檢查無法進行（${d.against.layout} 的 ${d.against.name} 日平均沒有通過核對）`);
				continue;
			}
			if (!Ko(l.value, e.value, d.shift)) {
				c.cross = "mismatch", c.reasons.push(`交叉檢查不一致（和 ${d.against.layout} 的 ${d.against.name} 日平均${d.shift ? "換算後" : ""}差超過末位 1）`);
				continue;
			}
			c.cross = "pass";
		}
		c.status = "pass", c.value = l.value, c.method = u;
	}
	return i;
}
var rs = {
	sameDay: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一站（現場編號＋測站）同一天的報告（可能重複選檔，例如 A 檔與 PM2.5 氣象檔）`,
	sameReport: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一個報告編號（同一份報告不該出現在兩個檔）`
};
function is(e) {
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
			report: r.reportNo === null ? null : A(r.reportNo).replace(/N$/, "")
		});
	}));
	let r = (e, n) => {
		t[e.f].has(e.page) || t[e.f].set(e.page, n);
	};
	for (let t = 0; t < n.length; t++) for (let i = t + 1; i < n.length; i++) {
		let a = n[t], o = n[i];
		a.f !== o.f && (a.day === o.day && (r(a, rs.sameDay(e[o.f].fileName, o.page)), r(o, rs.sameDay(e[a.f].fileName, a.page))), a.report !== null && a.report === o.report && (r(a, rs.sameReport(e[o.f].fileName, o.page)), r(o, rs.sameReport(e[a.f].fileName, a.page))));
	}
	return t;
}
//#endregion
//#region src/xdwread/manual.ts
var as = [
	"result",
	"mdl",
	"unit",
	"method"
], os = /sk-ant-/i, ss = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u, L = {
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
	presetRemoved: "「套用上一季寫法」已經拿掉（v1.8 起水位沒有量到的列由核對直接帶入備註）",
	agreed: "A、B 一致"
}, cs = (e) => e.status === "ok" && e.mode === "whole" && e.identity !== null && (e.tableType === "A" || e.tableType === "B");
function ls(e, t) {
	if (!cs(e) || t.status !== "manual") return !1;
	let n = ut[e.tableType][t.index];
	return n !== void 0 && n === t.expected;
}
var us = (e) => typeof e == "string";
function ds(e, t, n, r = null) {
	if (!us(t)) return L.notString;
	if (t.length > 200) return L.tooLong;
	if (os.test(t)) return L.secret;
	switch (e) {
		case "result": {
			let e = A(t);
			return r === "unmeasurable" ? e === "" ? null : L.presetFilled : e === "" ? L.resultBlank : It.test(e) ? null : L.result;
		}
		case "mdl": {
			let e = A(t);
			return r === "unmeasurable" ? e === "" ? null : L.presetFilled : n === "A" ? e === "" ? null : L.mdlA : e === "" || Lt.test(e) ? null : L.mdl;
		}
		case "unit": {
			let e = t.trim();
			return ss.test(t) ? L.unitCtrl : A(e) === "UNREADABLE" ? L.unitBad : e !== "" && Pt(e) ? L.unitDash : e.length > 30 ? L.unitLong : null;
		}
		case "method": {
			let e = t.trim();
			return ss.test(t) ? L.ctrl : e === "" || Rt.test(e) ? null : L.method;
		}
	}
}
var fs = (e, t) => e === "result" || e === "mdl" ? A(t) : t.trim();
function ps(e, t) {
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
	if (!ls(e, t) || !a || !t.a || !t.b) {
		for (let e of as) i[e] = L.notEditable;
		return {
			raw: n,
			agreed: r,
			why: i
		};
	}
	let o = t.a, s = t.b, c = {
		result: Xt("檢測結果", o.result, s.result, It, !1),
		mdl: a === "A" ? null : Xt("MDL", o.mdl, s.mdl, Lt, !0),
		unit: Zt("單位", o.unit, s.unit, !0),
		method: Zt("檢驗方法", o.method, s.method, !0, Rt)
	};
	for (let e of as) {
		let t = c[e];
		if (t === null) {
			i[e] = L.mdlA;
			continue;
		}
		if (!t.ok) {
			i[e] = t.reason;
			continue;
		}
		let o = ds(e, t.out, a);
		if (o) {
			i[e] = o;
			continue;
		}
		n[e] = t.out, r[e] = !0, i[e] = L.agreed;
	}
	return {
		raw: n,
		agreed: r,
		why: i
	};
}
function ms(e, t, n) {
	let r = [];
	if (!n || typeof n != "object") return {
		ok: !1,
		reasons: [L.notString]
	};
	if (!cs(e)) return {
		ok: !1,
		reasons: [L.pageNotOk]
	};
	if (!t || t.index !== n.index || n.page !== e.page) return {
		ok: !1,
		reasons: [L.notEditable]
	};
	if (t.status !== "manual") return {
		ok: !1,
		reasons: [L.rowPass]
	};
	if (!ls(e, t)) return {
		ok: !1,
		reasons: [L.notEditable]
	};
	let i = e.tableType;
	(n.item !== ut[i][n.index] || n.item !== t.expected) && r.push(L.item), n.source !== "manual" && r.push(L.source);
	let a = n.raw;
	if (!a || typeof a != "object" || !as.every((e) => us(a[e]))) return {
		ok: !1,
		reasons: [...r, L.notString]
	};
	let o = n.preset;
	o !== null && o !== "unmeasurable" && r.push(L.presetBad), o === "unmeasurable" && r.push(L.presetRemoved);
	for (let e of as) {
		let t = ds(e, a[e], i);
		t && !r.includes(t) && r.push(t);
	}
	return r.length ? {
		ok: !1,
		reasons: r
	} : {
		ok: !0,
		cells: {
			item: n.item,
			result: fs("result", a.result),
			mdl: fs("mdl", a.mdl),
			unit: fs("unit", a.unit),
			method: fs("method", a.method),
			preset: null
		}
	};
}
function hs(e, t, n, r) {
	let i = e.tableType;
	return {
		page: e.page,
		index: t.index,
		item: ut[i][t.index],
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
function gs(e, t) {
	let n = 0, r = 0;
	for (let i of t) {
		let t = e.find((e) => e.page === i.page);
		if (!t) continue;
		let a = ms(t, t.rows[i.index], i);
		a.ok && (n++, a.cells.preset && r++);
	}
	return {
		ok: n,
		preset: r
	};
}
//#endregion
//#region src/xdwread/schema-air.ts
var _s = [
	"report_no",
	"receive_date",
	"site_code",
	"location",
	"period"
], vs = [
	"form_title",
	..._s,
	"permit",
	"summary_rows",
	"hourly"
], ys = [
	"form_title",
	..._s,
	"summary_rows",
	"hourly"
], bs = ["label", "value"], xs = [
	"item",
	"unit",
	"stat",
	"value",
	"method"
], Ss = [
	"item",
	"sub",
	"unit"
], Cs = [
	"columns",
	"hours",
	"stats"
], ws = ["label", "values"], Ts = /^\s*```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```\s*$/, Es = (e) => !!e && typeof e == "object" && !Array.isArray(e), Ds = (e) => e === null || typeof e == "string";
function Os(e, t, n) {
	let r = Object.keys(e).filter((e) => !t.includes(e));
	if (r.length) return `${n}多了不該有的鍵（${r.length} 個）`;
	let i = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t));
	return i.length ? `${n}缺少鍵：${i.join("、")}` : null;
}
function ks(e) {
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
		if (!Es(r)) return {
			ok: !1,
			detail: `summary_rows 第 ${n + 1} 列不是物件`
		};
		let i = Os(r, xs, `summary_rows 第 ${n + 1} 列`);
		if (i) return {
			ok: !1,
			detail: i
		};
		for (let e of xs) if (!Ds(r[e])) return {
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
function As(e) {
	if (e === null) return {
		ok: !0,
		v: null
	};
	if (!Es(e)) return {
		ok: !1,
		detail: "hourly 不是物件或 null"
	};
	let t = Os(e, Cs, "hourly ");
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
		if (!Es(r)) return {
			ok: !1,
			detail: `hourly.columns 第 ${t + 1} 欄不是物件`
		};
		let i = Os(r, Ss, `hourly.columns 第 ${t + 1} 欄`);
		if (i) return {
			ok: !1,
			detail: i
		};
		for (let e of Ss) if (!Ds(r[e])) return {
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
	if (!e.hours.every(Ds)) return {
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
		if (!Es(n)) return {
			ok: !1,
			detail: `hourly.stats 第 ${t + 1} 列不是物件`
		};
		let i = Os(n, ws, `hourly.stats 第 ${t + 1} 列`);
		if (i) return {
			ok: !1,
			detail: i
		};
		if (!Ds(n.label)) return {
			ok: !1,
			detail: `hourly.stats 第 ${t + 1} 列的 label 要是字串或 null`
		};
		if (!Array.isArray(n.values) || !n.values.every(Ds)) return {
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
function js(e, t = !1) {
	if (!Es(e)) return {
		ok: !1,
		detail: "最外層不是 JSON 物件"
	};
	let n = Os(e, t ? ys : vs, "最外層");
	if (n) return {
		ok: !1,
		detail: n
	};
	if (!Ds(e.form_title)) return {
		ok: !1,
		detail: "form_title 要是字串或 null"
	};
	let r = {}, i = {
		label: null,
		value: null
	};
	for (let n of t ? _s : [..._s, "permit"]) {
		let t = e[n];
		if (!Es(t)) return {
			ok: !1,
			detail: `${n} 不是物件`
		};
		let a = Os(t, bs, `${n} `);
		if (a) return {
			ok: !1,
			detail: a
		};
		if (!Ds(t.label) || !Ds(t.value)) return {
			ok: !1,
			detail: `${n} 的 label／value 要是字串或 null`
		};
		let o = {
			label: t.label,
			value: t.value
		};
		n === "permit" ? i = o : r[n] = o;
	}
	let a = ks(e.summary_rows);
	if (!a.ok) return {
		ok: !1,
		detail: a.detail
	};
	let o = As(e.hourly);
	return o.ok ? {
		ok: !0,
		reply: {
			form_title: e.form_title,
			...r,
			permit: i,
			summary_rows: a.v,
			hourly: o.v
		}
	} : {
		ok: !1,
		detail: o.detail
	};
}
function Ms(e) {
	try {
		return {
			ok: !0,
			value: JSON.parse(e)
		};
	} catch {
		return { ok: !1 };
	}
}
function Ns(e, t = !1) {
	if (typeof e != "string" || e.trim() === "") return {
		ok: !1,
		kind: "empty",
		detail: "回覆是空的"
	};
	let n = e, r = !1, i = Ts.exec(e);
	i && (n = i[1], r = !0);
	let a = Ms(n.trim());
	if (a.ok) {
		let e = js(a.value, t);
		return e.ok ? {
			ok: !0,
			reply: e.reply,
			fenced: r
		} : {
			ok: !1,
			kind: "shape",
			detail: e.detail
		};
	}
	let o = e.indexOf("{"), s = e.lastIndexOf("}");
	return o >= 0 && s > o && Ms(e.slice(o, s + 1)).ok ? {
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
//#region src/xdwread/schema-noise.ts
var Ps = [
	"report_no",
	"site_code",
	"location",
	"period",
	"zone"
], Fs = [
	"form_title",
	...Ps,
	"permit",
	"summary_rows",
	"hourly"
], Is = [
	"form_title",
	...Ps,
	"summary_rows",
	"hourly"
], Ls = ["label", "value"], Rs = [
	"item",
	"unit",
	"stat",
	"value",
	"limit",
	"method"
], zs = ["item", "unit"], Bs = [
	"label",
	"value",
	"unit"
], Vs = [
	"columns",
	"hours",
	"results"
], Hs = /^\s*```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```\s*$/, Us = (e) => !!e && typeof e == "object" && !Array.isArray(e), Ws = (e) => e === null || typeof e == "string";
function Gs(e, t, n) {
	let r = Object.keys(e).filter((e) => !t.includes(e));
	if (r.length) return `${n}多了不該有的鍵（${r.length} 個）`;
	let i = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t));
	return i.length ? `${n}缺少鍵：${i.join("、")}` : null;
}
function Ks(e, t, n) {
	if (!Array.isArray(e)) return {
		ok: !1,
		detail: `${n} 不是陣列`
	};
	let r = [];
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		if (!Us(a)) return {
			ok: !1,
			detail: `${n} 第 ${i + 1} 個不是物件`
		};
		let o = Gs(a, t, `${n} 第 ${i + 1} 個`);
		if (o) return {
			ok: !1,
			detail: o
		};
		let s = {};
		for (let e of t) {
			if (!Ws(a[e])) return {
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
function qs(e) {
	if (e === null) return {
		ok: !0,
		v: null
	};
	if (!Us(e)) return {
		ok: !1,
		detail: "hourly 不是物件或 null"
	};
	let t = Gs(e, Vs, "hourly ");
	if (t) return {
		ok: !1,
		detail: t
	};
	let n = Ks(e.columns, zs, "hourly.columns");
	if (!n.ok) return n;
	if (!Array.isArray(e.hours) || !e.hours.every(Ws)) return {
		ok: !1,
		detail: "hourly.hours 要是字串或 null 的陣列"
	};
	let r = Ks(e.results, Bs, "hourly.results");
	return r.ok ? {
		ok: !0,
		v: {
			columns: n.v,
			hours: [...e.hours],
			results: r.v
		}
	} : r;
}
function Js(e, t = !1) {
	if (!Us(e)) return {
		ok: !1,
		detail: "最外層不是 JSON 物件"
	};
	let n = Gs(e, t ? Is : Fs, "最外層");
	if (n) return {
		ok: !1,
		detail: n
	};
	if (!Ws(e.form_title)) return {
		ok: !1,
		detail: "form_title 要是字串或 null"
	};
	let r = {}, i = {
		label: null,
		value: null
	};
	for (let n of t ? Ps : [...Ps, "permit"]) {
		let t = e[n];
		if (!Us(t)) return {
			ok: !1,
			detail: `${n} 不是物件`
		};
		let a = Gs(t, Ls, `${n} `);
		if (a) return {
			ok: !1,
			detail: a
		};
		if (!Ws(t.label) || !Ws(t.value)) return {
			ok: !1,
			detail: `${n} 的 label／value 要是字串或 null`
		};
		let o = {
			label: t.label,
			value: t.value
		};
		n === "permit" ? i = o : r[n] = o;
	}
	let a = null;
	if (e.summary_rows !== null) {
		let t = Ks(e.summary_rows, Rs, "summary_rows");
		if (!t.ok) return {
			ok: !1,
			detail: t.detail
		};
		a = t.v;
	}
	let o = qs(e.hourly);
	return o.ok ? {
		ok: !0,
		reply: {
			form_title: e.form_title,
			...r,
			permit: i,
			summary_rows: a,
			hourly: o.v
		}
	} : {
		ok: !1,
		detail: o.detail
	};
}
function Ys(e) {
	try {
		return {
			ok: !0,
			value: JSON.parse(e)
		};
	} catch {
		return { ok: !1 };
	}
}
function Xs(e, t = !1) {
	if (typeof e != "string" || e.trim() === "") return {
		ok: !1,
		kind: "empty",
		detail: "回覆是空的"
	};
	let n = e, r = !1, i = Hs.exec(e);
	i && (n = i[1], r = !0);
	let a = Ys(n.trim());
	if (a.ok) {
		let e = Js(a.value, t);
		return e.ok ? {
			ok: !0,
			reply: e.reply,
			fenced: r
		} : {
			ok: !1,
			kind: "shape",
			detail: e.detail
		};
	}
	let o = e.indexOf("{"), s = e.lastIndexOf("}");
	return o >= 0 && s > o && Ys(e.slice(o, s + 1)).ok ? {
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
//#region src/xdwread/verify-noise.ts
var Zs = "不是噪音振動版型（封面、目錄、聲明書等沒有資料的頁也是這個結果）", Qs = (e, t) => e !== null && j(e) === j(t), $s = (e, t) => e !== null && j(e).toUpperCase() === j(t).toUpperCase(), ec = /^L.{0,3}監測值$/u, tc = (e, t) => {
	if (e === null) return !1;
	if (Qs(e, Sn[t])) return !0;
	if (t >= 3) return !1;
	let n = j(e);
	return ec.test(n) ? !Sn.some((e, r) => r !== t && j(e).toUpperCase() === n.toUpperCase()) : !1;
};
function nc(e) {
	let t = e.hourly?.results;
	if (!t) return null;
	for (let e of ["II", "III"]) {
		let n = En[e];
		if (t.length === n.length && n.every((e, n) => Qs(t[n].label, e) && Qs(t[n].unit, "dB(A)"))) return e;
	}
	return null;
}
function rc(e, t) {
	let n = e.form_title === null ? "" : j(e.form_title);
	if (e.summary_rows !== null && e.hourly === null) {
		if (n !== j(xn.N1)) return t.push("標題不是「檢測報告」"), null;
		let r = e.summary_rows;
		return r.length === Sn.length && r.every((e, t) => Qs(e.item, "一般環境噪音") && Qs(e.unit, "dB(A)") && tc(e.stat, t)) ? "N1" : (t.push(`測項列的項目／單位／統計項不符版型（讀到 ${r.length} 列）`), null);
	}
	if (e.hourly !== null && e.summary_rows === null) {
		let r = e.hourly;
		if (n === j(xn.N2)) return r.columns.length === Tn.length && Tn.every((e, t) => Qs(r.columns[t].item, e) && Qs(r.columns[t].unit, "dB(A)")) && nc(e) ? "N2" : (t.push(`噪音逐時表的欄或監測結果（標籤／單位）不符版型（讀到 ${r.columns.length} 欄、${r.results.length} 個結果）`), null);
		if (n === j(xn.V1)) {
			let e = r.columns.length === Dn.length && Dn.every((e, t) => $s(r.columns[t].item, e) && Qs(r.columns[t].unit, "dB")), n = r.results.length === On.length && On.every((e, t) => $s(r.results[t].label, e) && Qs(r.results[t].unit, "dB"));
			return e && n ? "V1" : (t.push(`振動逐時表的欄或監測結果（標籤／單位）不符版型（讀到 ${r.columns.length} 欄、${r.results.length} 個結果）`), null);
		}
		return t.push("逐時表的標題不符版型"), null;
	}
	return t.push(e.hourly === null ? "沒有測項表格也沒有逐時表格" : "測項表格與逐時表格兩個都有"), null;
}
var ic = (e, t) => new Date(Date.UTC(e + 1911, t, 0)).getUTCDate(), ac = (e) => e.rocYear >= 1 && e.month >= 1 && e.month <= 12 && e.day >= 1 && e.day <= ic(e.rocYear, e.month), oc = (e) => Date.UTC(e.rocYear + 1911, e.month - 1, e.day, e.hour, e.minute), sc = (e, t) => e.rocYear === t.rocYear && e.month === t.month && e.day === t.day, cc = (e, t) => e.rocYear === t.rocYear && Math.ceil(e.month / 3) === t.quarter;
function lc(e) {
	if (e === null) return null;
	let t = Nn.exec(A(e));
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
	for (let e of [r, i]) if (!ac(e) || e.hour > 23 || e.minute > 59) return null;
	return oc(i) <= oc(r) ? null : {
		start: r,
		end: i
	};
}
function uc(e) {
	if (e === null) return null;
	let t = Pn.exec(A(e));
	if (!t) return null;
	let n = t.slice(1).map(Number), r = {
		rocYear: n[0],
		month: n[1],
		day: n[2]
	};
	return !ac(r) || n[3] < 1 || n[3] > 31 ? null : {
		start: r,
		endDay: n[3]
	};
}
function dc(e, t) {
	return t === null ? `${e} 讀法沒有回覆` : t.ok ? null : `${e} 讀法沒有可用的回覆（${t.detail}）`;
}
var fc = (e) => e === null ? null : j(e).replace(/:/g, ""), pc = (e) => e.summary_rows === null && e.hourly === null;
function mc(e, t) {
	let n = e.a.hourly.hours, r = e.b.hourly.hours;
	if (n.length !== 24 || r.length !== 24) return t.push(`小時列不是 24 列（A ${n.length}、B ${r.length}）`), null;
	let i = [], a = -1, o = -1, s = -1;
	for (let e = 0; e < 24; e++) {
		let t = n[e], c = r[e], l = t === null ? null : Fn.exec(A(t)), u = l ? Number(l[1]) : -1, d = l ? Number(l[2]) : -1;
		t !== null && c !== null && A(t) === A(c) && l !== null && u <= 23 && d === u + 1 && (e === 0 || u === a % 24) || i.push(e + 1), a = d, e === 0 && (o = u), e === 23 && (s = d % 24);
	}
	return i.length ? (t.push(`小時列兩次讀值不同、寫法不符或不連續：第 ${i.join("、")} 列`), null) : {
		firstStart: o,
		lastEnd: s
	};
}
function hc(e, t, n, r) {
	let i = bn(e), a = i ? kn.hourly : kn.summary;
	for (let [e, n] of Object.entries(a)) for (let [i, a] of [["A", t.a], ["B", t.b]]) fc(a[e].label) !== j(n) && r.push(`${i} 讀法的「${n}」標籤不符`);
	let o = null, s = null;
	if (i) for (let e of ["report_no", "zone"]) [t.a, t.b].some((t) => t[e].label !== null || t[e].value !== null) && r.push(`逐時紀錄不該有「${e === "report_no" ? "報告編號" : "管制區標準類屬"}」，卻讀到內容`);
	else {
		let e = Xt("報告編號", t.a.report_no.value, t.b.report_no.value, An, !1);
		e.ok ? o = e.out : r.push(e.reason);
		let n = Zt("管制區標準類屬", t.a.zone.value, t.b.zone.value, !1);
		n.ok && (s = Object.keys(wn).find((e) => j(n.out) === wn[e]) ?? null);
	}
	let c = Zt("現場編號", t.a.site_code.value, t.b.site_code.value, !1);
	c.ok || r.push(c.reason);
	let l = Zt(i ? "監測位置" : "檢測位置", t.a.location.value, t.b.location.value, !1);
	l.ok || r.push(l.reason);
	let u = t.a.period.value, d = t.b.period.value, f = i ? "監測日期" : "檢測日期/時間", p = null, m = null, h = null;
	if (u === null || d === null) r.push(`${f}是空白`);
	else if (A(u) !== A(d)) r.push(`${f}兩次讀值不同`);
	else if (!i) p = lc(u), p ? m = p.start : r.push(`${f}的寫法無法解析（要像「年.月.日/時:分 至 年.月.日/時:分」，日期要存在、迄晚於起）`);
	else {
		let e = uc(u);
		e ? (m = e.start, h = e.endDay) : r.push(`${f}的寫法無法解析（要像「年.月.日-日」，日期要存在）`);
	}
	m && !cc(m, n) && r.push(`起始日期不在選的期別內（${n.rocYear} 年第 ${n.quarter} 季）`);
	let g = i ? mc(t, r) : null;
	return r.length || !c.ok || !l.ok || !m || !i && (!o || !p) || i && !g ? null : {
		siteCode: c.out,
		location: l.out,
		siteKey: j(c.out),
		locKey: j(l.out),
		periodKey: A(u),
		reportNo: o,
		window: p,
		zone: s,
		start: m,
		endDay: h,
		hours: g,
		labelsClass: e === "N2" ? nc(t.a) : null
	};
}
function gc(e, t, n) {
	let r = [], i = e === "N1" ? "check" : "write";
	if (e === "N1") {
		let a = n.a.summary_rows[t], o = n.b.summary_rows[t], s = Xt(`第 ${t + 1} 列的值`, a.value, o.value, Mn, !1), c = Zt(`第 ${t + 1} 列的檢測方法`, a.method, o.method, !1, jn);
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
	let a = n.a.hourly.results[t], o = n.b.hourly.results[t], s = Xt(`監測結果第 ${t + 1} 個的值`, a.value, o.value, Mn, !1);
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
var _c = (e) => e === "N1" || e === "N2" ? [
	0,
	1,
	2
] : [0, 1];
function vc(e, t) {
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
			n.push(r.nondata ? {
				...i,
				status: "nodata",
				reasons: [Ia]
			} : {
				...i,
				status: "skip",
				reasons: ["這頁沒有送出"]
			});
			continue;
		}
		let a = dc("A", r.a), o = dc("B", r.b);
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
		}, c = [], l = [], u = rc(s.a, c), d = rc(s.b, l);
		if (!u && !d && pc(s.a) && pc(s.b)) {
			n.push({
				...i,
				status: "nodata",
				reasons: [Zs]
			});
			continue;
		}
		if (!u || !d || u !== d) {
			let e = u && d ? [`A、B 判定的版型不同（${u}／${d}）`] : [
				Zs,
				...c.map((e) => `A 讀法：${e}`),
				...l.map((e) => `B 讀法：${e}`)
			];
			n.push({
				...i,
				reasons: e
			});
			continue;
		}
		if (u === "N2" && nc(s.a) !== nc(s.b)) {
			n.push({
				...i,
				layout: u,
				reasons: [`A、B 讀到的監測結果時段標籤不是同一套（${nc(s.a) === "II" ? "第二類" : "第三類"}／${nc(s.b) === "II" ? "第二類" : "第三類"}）`]
			});
			continue;
		}
		let f = [], p = hc(u, s, e.period, f);
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
			cells: _c(u).map((e) => gc(u, e, s))
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
			if (t.start.minute !== 0 || t.end.minute !== 0 || oc(t.end) - oc(t.start) !== 24 * 36e5) u("時間窗不是整點起訖的 24 小時");
			else {
				c.window = t, c.windowPage = n[l.N1].page, c.reportNo = e.reportNo, c.zone = e.zone, c.location = e.location, c.siteCode = e.siteCode;
				for (let r of ["N2", "V1"]) {
					let i = l[r];
					if (i === void 0) continue;
					let a = n[i].identity;
					!sc(a.start, t.start) || a.endDay !== t.end.day ? s(i, `${r} 的監測日期和噪音總表的時間窗不同`) : a.hours.firstStart !== t.start.hour || a.hours.lastEnd !== t.end.hour ? s(i, `${r} 的第一／最後一個小時格和噪音總表的時間窗不同`) : r === "N2" && (e.zone === null || a.labelsClass !== e.zone) && s(i, "N2 監測結果的時段標籤和噪音總表的管制區類屬對不上（或管制區讀不出、不是第二類／第三類）");
				}
			}
		}
		if (c.status === "manual") {
			e.forEach((e) => {
				n[e].status === "ok" && s(e, c.reasons[0]);
			}), c.values = In.map((e) => ({
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
		c.values = yc(n, l);
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
function yc(e, t) {
	let n = (n) => {
		let r = t[n];
		return r !== void 0 && e[r].status === "ok" ? e[r] : null;
	}, r = (e, t) => n(e)?.cells.find((e) => e.index === t) ?? null, i = In.map((i) => {
		let a = zn[i], o = n(a.layout), s = {
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
		let l = Bn[i], u = null;
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
var bc = {
	sameDay: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一站（現場編號＋測站）同一天的報告（可能重複選檔）`,
	sameReport: (e, t) => `跨檔：檔「${e}」第 ${t} 頁有同一個報告編號（同一份報告不該出現在兩個檔）`
};
function xc(e) {
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
			report: r.reportNo === null ? null : A(r.reportNo).replace(/N$/, "")
		});
	}));
	let r = (e, n) => {
		t[e.f].has(e.page) || t[e.f].set(e.page, n);
	};
	for (let t = 0; t < n.length; t++) for (let i = t + 1; i < n.length; i++) {
		let a = n[t], o = n[i];
		a.f !== o.f && (a.day === o.day && (r(a, bc.sameDay(e[o.f].fileName, o.page)), r(o, bc.sameDay(e[a.f].fileName, a.page))), a.report !== null && a.report === o.report && (r(a, bc.sameReport(e[o.f].fileName, o.page)), r(o, bc.sameReport(e[a.f].fileName, a.page))));
	}
	return t;
}
//#endregion
//#region src/xdwread/readlog.ts
var Sc = "edc-xdw-readlog", Cc = [
	"gw",
	"air",
	"noise"
], wc = ["gw", "air"], Tc = [
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
], Ec = "自動送件失敗，備援下載的 xlsx 不含這一列，改人工輸入（備註照報告、檢測方法留空）", Dc = /sk-ant-/i, Oc = /^[0-9a-f]{64}$/, kc = /^[A-Za-z0-9._:-]{1,100}$/, Ac = /^[a-z_]{1,40}$/, jc = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
function Mc(e) {
	return typeof e == "string" ? Dc.test(e) : Array.isArray(e) ? e.some(Mc) : e && typeof e == "object" ? Object.entries(e).some(([e, t]) => Dc.test(e) || Mc(t)) : !1;
}
var R = (e) => !!e && typeof e == "object" && !Array.isArray(e), Nc = (e, t = 0) => typeof e == "number" && Number.isInteger(e) && e >= t, Pc = (e) => typeof e == "number" && Number.isFinite(e), Fc = (e, t = 1e6) => typeof e == "string" && e.length <= t;
function Ic(e, t, n) {
	let r = Object.keys(e), i = r.filter((e) => !t.includes(e)), a = t.filter((e) => !r.includes(e));
	if (i.length || a.length) throw Error(`${n}的欄位不對`);
}
function z(e, t) {
	if (!e) throw Error(t);
}
var Lc = [
	"data",
	"nondata",
	"unsure"
];
function Rc(e, t, n = !1) {
	let r = `第 ${t + 1} 頁紀錄`;
	z(R(e), `${r}不是物件`), Ic(e, n ? [
		"page",
		"mode",
		"image",
		"reason",
		"cls"
	] : [
		"page",
		"mode",
		"image",
		"reason"
	], r), n && e.cls !== null && (z(R(e.cls), `${r}的頁面判斷不對`), Ic(e.cls, [
		"kind",
		"hlen",
		"cross",
		"changed"
	], `${r}的頁面判斷`), z(Lc.includes(e.cls.kind) && (e.cls.hlen === null || Pc(e.cls.hlen)) && (e.cls.cross === null || Nc(e.cls.cross)) && typeof e.cls.changed == "boolean", `${r}的頁面判斷不對`)), z(Nc(e.page, 1), `${r}的頁碼不對`), z(e.mode === "whole" || e.mode === "skip", `${r}的送出方式不對`), z(Fc(e.reason, 2e3), `${r}的原因不對`), z(e.mode === "skip" == e.reason.length > 0, `${r}：沒送的頁一定要有原因、送出的頁不可有原因`), e.image !== null && (z(R(e.image), `${r}的影像尺寸不對`), Ic(e.image, ["w", "h"], `${r}的影像尺寸`), z(Nc(e.image.w, 1) && Nc(e.image.h, 1), `${r}的影像尺寸不對`)), z(e.mode === "skip" == (e.image === null), `${r}：沒送的頁不可有影像尺寸、送出的頁一定要有`);
}
function zc(e, t) {
	let n = `第 ${t + 1} 筆呼叫紀錄`;
	z(R(e), `${n}不是物件`), Ic(e, [
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
	], n), z(Nc(e.page, 1) && (e.scheme === "A" || e.scheme === "B") && Nc(e.attempt, 1), `${n}的頁碼／讀法／次數不對`), z(Fc(e.requestedModel) && kc.test(e.requestedModel), `${n}的模型名稱不對`), z(e.appliedModel === null || Fc(e.appliedModel) && kc.test(e.appliedModel), `${n}的實際模型不對`), z(e.replyText === null || Fc(e.replyText, 2e5), `${n}的回覆不對`), z(e.stopReason === null || Fc(e.stopReason) && Ac.test(e.stopReason), `${n}的停止原因不對`), e.usage !== null && (z(R(e.usage), `${n}的用量不對`), Ic(e.usage, ["input", "output"], `${n}的用量`), z(Nc(e.usage.input) && Nc(e.usage.output), `${n}的用量不對`)), z(Pc(e.ms) && e.ms >= 0, `${n}的耗時不對`), e.error !== null && (z(R(e.error), `${n}的錯誤不對`), Ic(e.error, [
		"kind",
		"status",
		"message"
	], `${n}的錯誤`), z(Tc.includes(e.error.kind) && (e.error.status === null || Nc(e.error.status, 100)) && Fc(e.error.message, 301), `${n}的錯誤型別不對`));
}
function Bc(e, t, n) {
	let r = `第 ${t + 1} 筆人工輸入紀錄`;
	z(R(e), `${r}不是物件`), Ic(e, [
		"page",
		"index",
		"item",
		"raw",
		"preset",
		"source"
	], r), z(Nc(e.page, 1) && Nc(e.index, 0), `${r}的頁碼或列序號不對`);
	let i = n.find((t) => t.page === e.page);
	z(!!i && i.mode !== "skip", `${r}的頁不存在或沒送`), z(Fc(e.item, 100) && (ut.A[e.index] === e.item || ut.B[e.index] === e.item), `${r}的項目名稱不是版型在這個位置的預期名稱`), z(R(e.raw), `${r}的內容不對`), Ic(e.raw, as, `${r}的內容`);
	for (let t of as) z(Fc(e.raw[t], 200), `${r}的內容不對`);
	z(e.preset === null || e.preset === "unmeasurable", `${r}的套用方式不對`), e.preset === "unmeasurable" && z(e.raw.result === "", `${r}：套用上一季寫法時檢測結果要空白`), z(e.source === "manual", `${r}的來源標記不對`);
}
var Vc = [
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
function Hc(e) {
	Wc(e, R(e) && e.version === 6 ? 6 : R(e) && e.version === 4 ? 4 : R(e) && e.version === 5 ? 5 : 3);
}
var Uc = (e) => e.version === 6 && e.form ? e.form : e.version === 5 && e.form === "noise" ? "noise" : e.version === 4 && e.form === "air" ? "air" : "gw";
function Wc(e, t) {
	z(R(e), "讀值紀錄不是 JSON 物件"), z(e.kind === Sc, "這不是讀值紀錄檔"), z(e.version === t, "讀值紀錄版本不符（這一版只讀第 2、3、4、5、6 版）");
	let n = t === 6 && Object.prototype.hasOwnProperty.call(e, "fallback");
	Ic(e, t === 4 || t === 5 || t === 6 ? [
		...Vc,
		"manual",
		"form",
		...n ? ["fallback"] : []
	] : t === 3 ? [...Vc, "manual"] : Vc, "讀值紀錄"), t === 6 && z(Cc.includes(e.form), "讀值紀錄的版型不對"), t === 4 && z(wc.includes(e.form), "讀值紀錄的版型不對"), t === 5 && z(e.form === "noise", "讀值紀錄的版型不對"), z(Fc(e.fileName, 500) && e.fileName.length > 0, "讀值紀錄的檔名不對"), z(Fc(e.xdwSha256) && Oc.test(e.xdwSha256), "讀值紀錄的 SHA-256 格式不對"), z(Fc(e.createdAt) && jc.test(e.createdAt), "讀值紀錄的時間格式不對"), z(R(e.period), "讀值紀錄的期別不對"), Ic(e.period, ["rocYear", "quarter"], "讀值紀錄的期別"), z(Nc(e.period.rocYear, 1) && Nc(e.period.quarter, 1) && e.period.quarter <= 4, "讀值紀錄的期別不對"), z(Fc(e.category, 200), "讀值紀錄的類別不對"), z(R(e.agency), "讀值紀錄的機構不對"), Ic(e.agency, ["code", "name"], "讀值紀錄的機構"), z(Fc(e.agency.code, 50) && Fc(e.agency.name, 200), "讀值紀錄的機構不對"), z(Array.isArray(e.pages) && Array.isArray(e.calls), "讀值紀錄的頁或呼叫不是陣列"), e.pages.forEach((e, n) => Rc(e, n, t === 6)), e.calls.forEach(zc);
	let r = e.pages.map((e) => e.page);
	z(new Set(r).size === r.length, "讀值紀錄有重複的頁碼");
	for (let t of e.calls) {
		let n = e.pages.find((e) => e.page === t.page);
		z(!!n && n.mode !== "skip", "讀值紀錄有沒送的頁卻有呼叫紀錄");
	}
	if (t === 4 && e.form === "air" && z(Array.isArray(e.manual) && e.manual.length === 0, "空品的讀值紀錄不可有人工輸入"), (t === 5 || t === 6 && e.form === "noise") && z(Array.isArray(e.manual) && e.manual.length === 0, "噪音振動的讀值紀錄不可有人工輸入"), t === 6 && e.form === "air" && z(Array.isArray(e.manual) && e.manual.length === 0, "空品的讀值紀錄不可有人工輸入"), t === 3 || (t === 4 || t === 6) && e.form === "gw") {
		z(Array.isArray(e.manual), "讀值紀錄的人工輸入不是陣列"), e.manual.forEach((t, n) => Bc(t, n, e.pages));
		let t = e.manual.map((e) => `${e.page}:${e.index}`);
		z(new Set(t).size === t.length, "讀值紀錄有重複的人工輸入列");
	}
	if (n) {
		z(e.form === "gw" && Array.isArray(e.fallback), "讀值紀錄的備援紀錄不對");
		let t = /* @__PURE__ */ new Set();
		for (let n of e.fallback) {
			z(R(n), "讀值紀錄的備援紀錄不對"), Ic(n, [
				"page",
				"index",
				"kind",
				"note"
			], "讀值紀錄的備援紀錄"), z(Nc(n.page, 1) && Nc(n.index, 0) && n.kind === "level-remark" && Fc(n.note, 200), "讀值紀錄的備援紀錄不對"), z(e.pages.some((e) => e.page === n.page && e.mode !== "skip"), "讀值紀錄的備援紀錄對不到有送的頁");
			let r = `${n.page}:${n.index}`;
			z(!t.has(r), "讀值紀錄的備援紀錄重複"), t.add(r);
		}
	}
	z(!Mc(e), "讀值紀錄裡有疑似金鑰的字串，拒絕");
}
function Gc(e) {
	return Hc(e), JSON.stringify(e, null, 2);
}
function Kc(e) {
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
		if (R(t) && t.kind === "edc-xdw-readlog" && t.version === 2) {
			Wc(t, 2);
			let e = {
				...t,
				version: 3,
				manual: []
			};
			return Hc(e), {
				ok: !0,
				log: e
			};
		}
		Hc(t);
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
function qc(e, t) {
	return Oc.test(t) ? e.xdwSha256 === t ? null : "這份讀值紀錄不是這個 XDW 檔的（SHA-256 不同），拒絕載入" : "目前檔案的 SHA-256 格式不對";
}
function Jc(e, t, n) {
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
function Yc(e, t, n, r = !1) {
	let i = Jc(e, t, n);
	return i === null ? null : i.ok ? At(i.text, r) : i;
}
function Xc(e, t, n, r = !1) {
	let i = Jc(e, t, n);
	return i === null ? null : i.ok ? Ns(i.text, r) : i;
}
function Zc(e, t, n, r = !1) {
	let i = Jc(e, t, n);
	return i === null ? null : i.ok ? Xs(i.text, r) : i;
}
function Qc(e, t, n, r) {
	let i = e === "air" ? Xc(t, n, r) : e === "noise" ? Zc(t, n, r) : Yc(t, n, r);
	return !!i && i.ok;
}
var $c = (e) => e.version !== 6;
function el(e) {
	let t = $c(e);
	return {
		period: { ...e.period },
		pages: e.pages.map((n) => ({
			page: n.page,
			mode: n.mode,
			a: n.mode === "skip" ? null : Yc(e.calls, n.page, "A", t),
			b: n.mode === "skip" ? null : Yc(e.calls, n.page, "B", t)
		}))
	};
}
var tl = (e) => on(el(e));
function nl(e) {
	return {
		period: { ...e.period },
		pages: e.pages.map((t) => ({
			page: t.page,
			mode: t.mode,
			nondata: t.mode === "skip" && t.reason === "預設不送：看起來不是資料頁（封面、目錄、聲明書等）",
			a: t.mode === "skip" ? null : Xc(e.calls, t.page, "A", $c(e)),
			b: t.mode === "skip" ? null : Xc(e.calls, t.page, "B", $c(e))
		}))
	};
}
var rl = (e, t) => es(nl(e), t);
function il(e) {
	return {
		period: { ...e.period },
		pages: e.pages.map((t) => ({
			page: t.page,
			mode: t.mode,
			nondata: t.mode === "skip" && t.reason === "預設不送：看起來不是資料頁（封面、目錄、聲明書等）",
			a: t.mode === "skip" ? null : Zc(e.calls, t.page, "A", $c(e)),
			b: t.mode === "skip" ? null : Zc(e.calls, t.page, "B", $c(e))
		}))
	};
}
var al = (e, t) => vc(il(e), t);
function ol(e) {
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
function sl(e) {
	let t = e.pages.map((e) => ({
		page: e.page,
		mode: e.mode,
		image: e.image,
		reason: e.reason,
		cls: e.cls ? { ...e.cls } : null
	}));
	return {
		kind: Sc,
		version: 6,
		form: e.form ?? "gw",
		fileName: e.fileName,
		xdwSha256: e.xdwSha256,
		createdAt: e.createdAt,
		period: { ...e.period },
		category: e.category,
		agency: { ...e.agency },
		pages: t,
		calls: [],
		manual: []
	};
}
var cl = "edc-xdw-readlog-bundle", ll = (e) => e.normalize("NFKC").toLowerCase();
function ul(e) {
	z(R(e), "讀值紀錄包不是 JSON 物件"), z(e.kind === cl, "這不是讀值紀錄包"), z(e.version === 1, "讀值紀錄包版本不符（這一版只讀第 1 版）"), Ic(e, [
		"kind",
		"version",
		"createdAt",
		"logs"
	], "讀值紀錄包"), z(Fc(e.createdAt) && jc.test(e.createdAt), "讀值紀錄包的時間格式不對"), z(Array.isArray(e.logs) && e.logs.length >= 2 && e.logs.length <= 10, "讀值紀錄包的檔數不對（要 2～10 份）"), e.logs.forEach((e, t) => {
		try {
			Hc(e);
		} catch (e) {
			throw Error(`讀值紀錄包第 ${t + 1} 份：${e.message}`);
		}
	});
	let t = e.logs;
	z(new Set(t.map((e) => e.xdwSha256)).size === t.length, "讀值紀錄包裡有兩份是同一個 XDW（SHA-256 相同）"), z(new Set(t.map((e) => ll(e.fileName))).size === t.length, "讀值紀錄包裡有兩份檔名相同");
	let n = t[0];
	z(t.every((e) => e.category === n.category && e.agency.code === n.agency.code && e.agency.name === n.agency.name && e.period.rocYear === n.period.rocYear && e.period.quarter === n.period.quarter), "讀值紀錄包裡各檔的類別、機構或期別不一致"), t.every((e) => Uc(e) === Uc(n)) || (z(t.some((e) => Uc(e) === "noise"), "讀值紀錄包裡同時有空品與地下水的紀錄"), z(!1, "讀值紀錄包裡混有不同版型（噪音振動與水質或空品）的紀錄")), z(!Mc(e), "讀值紀錄包裡有疑似金鑰的字串，拒絕");
}
function dl(e, t) {
	return {
		kind: cl,
		version: 1,
		createdAt: t,
		logs: [...e]
	};
}
function fl(e) {
	return ul(e), JSON.stringify(e, null, 2);
}
function pl(e) {
	let t;
	try {
		t = JSON.parse(e);
	} catch {
		return {
			ok: !1,
			reason: "讀值紀錄不是 JSON"
		};
	}
	if (R(t) && t.kind === "edc-xdw-readlog-bundle") {
		try {
			ul(t);
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
	let n = Kc(e);
	return n.ok ? {
		ok: !0,
		logs: [n.log],
		bundle: !1
	} : n;
}
function ml(e, t) {
	if (!t.length || t.some((e) => !Oc.test(e))) return {
		ok: !1,
		reason: "目前檔案的 SHA-256 格式不對"
	};
	if (e.length !== t.length) return {
		ok: !1,
		reason: t.length === 1 && e.length === 1 ? "這份讀值紀錄不是這個 XDW 檔的（SHA-256 不同），拒絕載入" : `讀值紀錄有 ${e.length} 個檔、這次選了 ${t.length} 個檔，對不上，拒絕載入`
	};
	if (t.length === 1) {
		let n = qc(e[0], t[0]);
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
function hl(e) {
	return ln(e.map((e) => ({
		fileName: e.fileName,
		v: tl(e)
	})));
}
function gl(e) {
	if (e.some((e) => Uc(e) !== "air")) throw Error("不是空品的讀值紀錄（內部檢查）");
	let t = e.map((e) => rl(e)), n = is(e.map((e, n) => ({
		fileName: e.fileName,
		v: t[n]
	})));
	return e.map((e, r) => n[r].size ? rl(e, n[r]) : t[r]);
}
function _l(e) {
	if (e.some((e) => Uc(e) !== "noise")) throw Error("不是噪音振動的讀值紀錄（內部檢查）");
	let t = e.map((e) => al(e)), n = xc(e.map((e, n) => ({
		fileName: e.fileName,
		v: t[n]
	})));
	return e.map((e, r) => n[r].size ? al(e, n[r]) : t[r]);
}
var vl = /^環境部國環檢證字第(\d{1,4})號$/, yl = (e) => e.normalize("NFKC").replace(/\s+/gu, "").replace(/[:：]/g, ""), bl = (e) => e.replace(/^0+(?=\d)/, "");
function xl(e, t) {
	if (!e || !t || e.label === null || t.label === null || e.value === null || t.value === null || yl(e.label) !== "環境部許可證字號" || yl(t.label) !== "環境部許可證字號") return null;
	let n = vl.exec(e.value.normalize("NFKC").replace(/\s+/gu, "")), r = vl.exec(t.value.normalize("NFKC").replace(/\s+/gu, ""));
	if (!n || !r) return null;
	let i = bl(n[1]);
	return i === bl(r[1]) ? i : null;
}
function Sl(e) {
	let t = Uc(e), n = $c(e), r = /* @__PURE__ */ new Set();
	for (let i of e.pages) {
		if (i.mode === "skip") continue;
		let a = (r) => {
			let a = t === "air" ? Xc(e.calls, i.page, r, n) : t === "noise" ? Zc(e.calls, i.page, r, n) : Yc(e.calls, i.page, r, n);
			return a && a.ok ? a.reply.permit ?? null : null;
		}, o = xl(a("A"), a("B"));
		o !== null && r.add(o);
	}
	return [...r].sort((e, t) => Number(e) - Number(t));
}
var Cl = {
	multi: (e, t) => `⚠️ 「${e}」報告上印了不同的檢測機構許可字號（第 ${t.map(wl).join("、")} 號），請確認讀值視窗選的檢測機構。`,
	diff: (e, t, n, r, i) => `⚠️ 「${e}」報告印的檢測機構許可字號是第 ${wl(t)} 號（${n === null ? `代碼表裡沒有第 ${wl(t)} 號` : `代碼表：${n}`}），你在讀值視窗選的是 ${r}（${i}）。`,
	notInTable: (e, t) => `⚠️ 「${e}」報告印的檢測機構許可字號是第 ${wl(t)} 號，代碼表裡沒有第 ${wl(t)} 號，請確認讀值視窗選的檢測機構。`,
	confirmTail: "要照你選的檢測機構送出嗎？（取消＝不送出，可以重新選檔、選對機構後再讀一次）"
}, wl = (e) => e.padStart(3, "0");
function Tl(e, t) {
	let n = Sl(e);
	if (!n.length) return null;
	if (n.length > 1) return Cl.multi(e.fileName, n);
	let r = n[0], i = bl(String(e.agency.code ?? "")), a = t ? t[r] ?? null : null;
	return r === i ? t && a === null ? Cl.notInTable(e.fileName, r) : null : Cl.diff(e.fileName, r, t ? a : null, e.agency.code, e.agency.name);
}
var El = (e, t) => e.map((e) => Tl(e, t)).filter((e) => e !== null);
function Dl(e, t) {
	let n = El(e, t);
	return n.length ? `${n.join("\n")}\n\n${Cl.confirmTail}` : null;
}
function Ol() {
	try {
		return typeof AGENCY_CODES < "u" && AGENCY_CODES ? AGENCY_CODES : null;
	} catch {
		return null;
	}
}
//#endregion
//#region src/claude/config.ts
var kl = "https://api.anthropic.com/v1/messages", Al = "2023-06-01", jl = ["claude-sonnet-5-5", "claude-haiku-5-5"], Ml = "edc_claude_api_key", Nl = 3e4, Pl = "請只回覆：OK", Fl = {
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
function Il(e, t) {
	return {
		url: kl,
		init: {
			method: "POST",
			headers: {
				"x-api-key": e,
				"anthropic-version": Al,
				"content-type": "application/json",
				"anthropic-dangerous-direct-browser-access": "true"
			},
			body: JSON.stringify({
				model: t,
				max_tokens: 8,
				messages: [{
					role: "user",
					content: Pl
				}]
			})
		}
	};
}
var Ll = "（已遮蔽）";
function Rl(e, t) {
	let n = typeof e == "string" ? e : e == null ? "" : String(e);
	return t && (n = n.split(t).join(Ll)), n = n.replace(/sk-ant-[^\s"'<>，。；）)]*/g, Ll), n = n.replace(/\s+/g, " ").trim(), n.length > 300 ? n.slice(0, 300) + "…" : n;
}
function zl(e) {
	return e === 401 ? "金鑰無效或已刪除" : e === 403 ? "這把金鑰沒有權限" : e === 404 ? "找不到這個模型" : e === 429 ? "請求太頻繁，或已達每月上限" : e >= 500 ? "Anthropic 服務暫時有問題" : `請求被拒（HTTP ${e}）`;
}
var Bl = "連不到 api.anthropic.com（可能被公司網路擋住）", Vl = "30 秒內沒有回應，請稍後再試", Hl = "回應格式不對（收到 HTTP 200，但內容不是預期的格式）", Ul = () => ({
	fetch: (e, t) => globalThis.fetch(e, t),
	setTimeout: (e, t) => globalThis.setTimeout(e, t),
	clearTimeout: (e) => globalThis.clearTimeout(e)
}), Wl = (e, t, n) => ({
	model: e,
	ok: !0,
	text: `${e}：✅ 成功（回傳模型 ${t}，用了 ${n} 個 token）`
}), Gl = (e, t, n = "") => ({
	model: e,
	ok: !1,
	text: `${e}：❌ ${t}${n ? `（${n}）` : ""}`
});
async function Kl(e, t, n = Ul()) {
	let r = new AbortController(), i = !1, a = n.setTimeout(() => {
		i = !0, r.abort();
	}, Nl);
	try {
		let a;
		try {
			let { url: i, init: o } = Il(e, t);
			a = await n.fetch(i, {
				...o,
				signal: r.signal,
				credentials: "omit",
				referrerPolicy: "no-referrer",
				cache: "no-store"
			});
		} catch {
			return Gl(t, i ? Vl : Bl);
		}
		let o = null, s = !1;
		try {
			o = await a.json(), s = !0;
		} catch {
			if (i) return Gl(t, Vl);
		}
		let c = o && typeof o == "object" ? o : {};
		if (!a.ok) {
			let n = Rl(c.error?.type, e), r = Rl(c.error?.message, e);
			return Gl(t, zl(a.status), [n, r].filter(Boolean).join("："));
		}
		let l = (e) => typeof e == "number" && Number.isFinite(e), u = c.usage?.input_tokens, d = c.usage?.output_tokens;
		return !s || !o || typeof o != "object" || Array.isArray(o) || typeof c.model != "string" || !c.model.trim() || !l(u) || !l(d) ? Gl(t, Hl) : Wl(t, Rl(c.model, e), u + d);
	} finally {
		n.clearTimeout(a);
	}
}
//#endregion
//#region src/claude/key.ts
function ql(e) {
	let t = String(e ?? "").trim();
	return !t.startsWith("sk-ant-") || /\s/.test(t) || t.length < 20 ? null : t;
}
function Jl(e) {
	return e.slice(-4);
}
var Yl = () => {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
};
function Xl(e = Yl()) {
	try {
		return e?.getItem(Ml) || null;
	} catch {
		return null;
	}
}
function Zl(e, t = Yl()) {
	try {
		return t ? (t.setItem(Ml, e), t.getItem(Ml) === e) : !1;
	} catch {
		return !1;
	}
}
function Ql(e = Yl()) {
	try {
		e?.removeItem(Ml);
	} catch {}
}
//#endregion
//#region src/claude/read.ts
var $l = 4096, eu = "120 秒內沒有回應", tu = "回應格式不對（收到 HTTP 200，但內容不是預期的格式）", nu = "已中止", ru = /^[A-Za-z0-9._:-]{1,100}$/, iu = /^[a-z_]{1,40}$/;
function au(e) {
	return {
		"x-api-key": e,
		"anthropic-version": Al,
		"content-type": "application/json",
		"anthropic-dangerous-direct-browser-access": "true"
	};
}
function ou(e, t, n) {
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
		max_tokens: $l,
		messages: [{
			role: "user",
			content: r
		}]
	});
}
var su = () => ({
	fetch: (e, t) => globalThis.fetch(e, t),
	setTimeout: (e, t) => globalThis.setTimeout(e, t),
	clearTimeout: (e) => globalThis.clearTimeout(e)
});
function cu(e) {
	if (e == null) return null;
	let t = e.trim();
	return /^\d+(?:\.\d+)?$/.test(t) ? Math.round(Number(t) * 1e3) : null;
}
var lu = (e) => typeof e == "number" && Number.isInteger(e) && e >= 0;
function uu(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return null;
	let t = e;
	if (typeof t.model != "string" || !ru.test(t.model) || !t.usage || typeof t.usage != "object" || !lu(t.usage.input_tokens) || !lu(t.usage.output_tokens) || !Array.isArray(t.content) || !(t.stop_reason === null || t.stop_reason === void 0 || typeof t.stop_reason == "string" && iu.test(t.stop_reason))) return null;
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
async function du(e, t, n, r, i = {}, a = su()) {
	if (i.signal?.aborted) return {
		kind: "cancelled",
		message: nu
	};
	let o = new AbortController(), s = !1, c = () => o.abort();
	i.signal?.addEventListener("abort", c, { once: !0 });
	let l = a.setTimeout(() => {
		s = !0, o.abort();
	}, i.timeoutMs ?? 12e4), u = () => s ? {
		kind: "timeout",
		message: eu
	} : i.signal?.aborted ? {
		kind: "cancelled",
		message: nu
	} : null;
	try {
		let i;
		try {
			i = await a.fetch(kl, {
				method: "POST",
				headers: au(e),
				body: ou(t, n, r),
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
			let t = s && typeof s == "object" ? s : {}, n = [Rl(t.error?.type, e), Rl(t.error?.message, e)].filter(Boolean).join("：");
			return {
				kind: "http",
				status: i.status,
				message: Rl(n ? `${zl(i.status)}（${n}）` : zl(i.status), e),
				retryAfterMs: cu(i.headers.get("retry-after"))
			};
		}
		let l = c ? uu(s) : null;
		return l ? {
			kind: "ok",
			...l
		} : {
			kind: "format",
			message: tu
		};
	} finally {
		a.clearTimeout(l), i.signal?.removeEventListener("abort", c);
	}
}
//#endregion
//#region src/xdwread/prompts/read-gw.txt?raw
var fu = "你是「掃描報表讀值員」。{{IMAGE_INTRO}}\n\n這一頁是地下水檢測報告。圖上只會用到：右上方的「報告編號」、「收樣日期」、「採樣時間」，左方的「樣品名稱」，標題下面的「環境部許可證字號」那一行，以及「檢驗結果」表格。圖上表格與這五格以外的內容一律不要抄（人名、簽章、單位名稱、地址、頁首頁尾等都不要抄，也不要寫進任何欄位）。\n\n工作規則（一定要遵守）：\n1. 只抄圖上「印刷」的字，原樣照抄成字串。不可四捨五入、不可換算單位、不可計算、不可猜、不可從常識或其他頁補值。保留印刷的小數位數（例如印 8.640 就寫 \"8.640\"）。\n2. 任何一格只要有一個字不確定，那一格就寫 \"UNREADABLE\"。\n3. 圖上那一格是空白，就寫 null。表上沒有 MDL 欄時，每一列的 mdl 都寫 null。\n4. 所有值都用字串或 null，不可以用數字型別（寫 \"97.31\"，不可寫 97.31）。\n5. 字元寫法（讓抄寫結果一致）：\n   - 微（micro）一律用希臘字母 μ；溫度單位用單一字元 ℃。\n   - 英文字母、數字、標點與符號（< . / : ~ 等）一律用半形。\n   - 印刷是一條橫線（不論長短）一律寫半形 \"-\"。\n   - 數字（檢測結果、MDL、報告編號）裡不要抄空白，例如印「6. 5」寫 \"6.5\"。\n   - 其他文字照印刷：字與字之間印刷上有空白才留一個半形空白，沒有就不要加。\n6. 不抄「管制值」欄的內容。「備註」欄要抄（見下面 remark）。\n\n要抄的內容：\n- report_no、sample_name、sample_time：三格各抄 {\"label\": 標籤原文, \"value\": 值原文}。標籤是格子左邊印的字（例如「報告編號」），值是標籤右邊的內容。\n- permit：頁面上方標題下面那一行「環境部許可證字號」：抄 {\"label\": \"環境部許可證字號\" 這幾個字原文, \"value\": 冒號右邊的字原文（例如「環境部國環檢證字第999號」，數字照印刷、不要補零也不要去零）}。這一頁沒有印這一行 → label 與 value 都寫 null。只抄這一行，不要從採樣單位等其他地方的括號抄。\n- receive_date：右上方「收樣日期」那一格：抄 {\"label\": \"收樣日期\" 這幾個字原文, \"value\": 冒號右邊的日期與時間原文（例如「100.01.01 15:30」）}。這一頁沒有印這一格 → label 與 value 都寫 null。不要和「採樣時間」「報告日期」弄混。\n- columns：「檢驗結果」表格表頭由左到右的全部欄名（包含不抄內容的「管制值」「備註」等欄），一欄一個字串。\n- rows：表格由上到下的每一列（不含表頭）：item（檢測項目）、unit（單位）、result（檢測結果）、mdl（MDL 欄；表上沒有這欄就寫 null）、method（檢驗方法）、remark（備註欄這一列的文字，原樣照抄；空白寫 null、一條橫線寫 \"-\"）。印 \"ND\" 就寫 \"ND\"，印 \"<0.0007\" 就寫 \"<0.0007\"。\n\n只輸出一個 JSON，不要有任何其他文字、說明或 markdown。鍵名固定，不要增加或減少任何鍵。格式如下（下面全是假的示範內容，不是這一頁的值）：\n{\n  \"report_no\": {\"label\": \"報告編號\", \"value\": \"XY999Z0000\"},\n  \"sample_name\": {\"label\": \"樣品名稱\", \"value\": \"示範測站\"},\n  \"sample_time\": {\"label\": \"採樣時間\", \"value\": \"100.01.01 08:00~ 08:30\"},\n  \"permit\": {\"label\": \"環境部許可證字號\", \"value\": \"環境部國環檢證字第999號\"},\n  \"receive_date\": {\"label\": \"收樣日期\", \"value\": \"100.01.01 15:30\"},\n  \"columns\": [\"檢測項目\", \"單位\", \"檢測結果\", \"MDL\", \"檢驗方法\"],\n  \"rows\": [\n    {\"item\": \"示範項目\", \"unit\": \"mg/L\", \"result\": \"98.76\", \"mdl\": \"0.0009\", \"method\": \"NIEA X000.00X\", \"remark\": null},\n    {\"item\": \"示範項目二\", \"unit\": \"-\", \"result\": \"-\", \"mdl\": null, \"method\": \"-\", \"remark\": \"示範備註文字\"}\n  ]\n}\n", pu = "\n\n上一次的回覆不是只有一個 JSON。這次只輸出 JSON，第一個字元必須是 {，最後一個字元必須是 }。", mu = "\n\n上一次的回覆結構不對。這次只輸出上面指定結構的一個 JSON：不要增加或減少任何鍵，所有值都用字串或 null（不可用數字型別）。";
function hu(e, t = null) {
	if (!Number.isInteger(e) || e < 1) throw Error("影像張數無效");
	let n = e === 1 ? "這次給你 1 張圖，是同一頁報告的內容。" : `這次給你 ${e} 張圖，是同一頁報告由上到下切成的 ${e} 條水平帶（相鄰兩條有部分重疊，重疊處是同一段內容，不要重複抄）。請把它們當成一整頁來讀。`, r = fu.replaceAll("{{IMAGE_INTRO}}", n);
	return t === "json" ? r + pu : t === "shape" ? r + mu : r;
}
//#endregion
//#region src/xdwread/prompts/read-air.txt?raw
var gu = "你是「掃描報表讀值員」。{{IMAGE_INTRO}}\n\n這一頁是空氣品質監測報告的其中一頁。它應該是下面兩種表單之一：\n（甲）「檢測報告」：上方有表頭區（報告編號、收樣日期…），下方有一個測項表格（左邊「測項（單位）」，中間有「現場編號」「檢測位置」「檢測日期/時間」三格），表格下方可能還有一個「備註：」表格。\n（乙）「空氣品質監測逐時結果紀錄表」：上方有現場編號、監測位置、監測日期，下方是逐時表格（左邊一欄是時間，一列一小時，最後三列是統計值）。\n如果這一頁兩種都不是，form_title 照抄頁面最上方的標題，其他鍵照下面規則能填就填、不能填就寫 null。\n\n工作規則（一定要遵守）：\n1. 只抄圖上「印刷」的字，原樣照抄成字串。不可四捨五入、不可換算單位（ppb 不可改成 ppm）、不可計算、不可猜、不可從常識或其他格、其他頁補值。保留印刷的小數位數（例如印 8.60 就寫 \"8.60\"，印 19.00 就寫 \"19.00\"）。\n2. 任何一格只要有一個字不確定，那一格就寫 \"UNREADABLE\"。\n3. 圖上那一格是空白，就寫 null。\n4. 所有值都用字串或 null，不可以用數字型別（寫 \"0.97\"，不可寫 0.97）。\n5. 字元寫法（讓抄寫結果一致）：\n   - 英文字母、數字、標點與符號（< . / : ~ * % 等）一律用半形；全形冒號「：」也寫成半形 \":\"。\n   - 下標、上標一律寫成一般字元：SO₂ 寫 \"SO2\"、O₃ 寫 \"O3\"、CH₄ 寫 \"CH4\"、PM₁₀ 寫 \"PM10\"、PM₂.₅ 寫 \"PM2.5\"、m³ 寫 \"m3\"。NOx 的 x 照印刷的大小寫。\n   - 微（micro）一律用希臘字母 μ；溫度單位用單一字元 ℃。\n   - 印刷是一條橫線（不論長短）一律寫半形 \"-\"；印刷是星號寫 \"*\"。\n   - 數字裡不要抄空白，例如印「0. 97」寫 \"0.97\"。\n   - 一格裡印成好幾行時，各行之間用一個半形空白連接。\n   - 其他文字照印刷：字與字之間不要自己加空白。\n6. 不抄（下面 permit 那一行除外）：人名、簽章、印章、單位名稱、地址、電話、文件編號、頁碼、「空氣品質標準」欄、「備註」表格裡的「測定條件（氣象條件）」那幾格、最下方「空氣污染物偵測極限值」那一行。這些內容也不要寫進任何欄位。\n\n要抄的內容（鍵名固定，不要增加或減少任何鍵）：\n- form_title：頁面最上方表單名稱那一行（不含單位名稱、不含文件編號那一行），例如「檢測報告」或「某某紀錄表(1/2)」。\n- report_no、receive_date、site_code、location、period：各抄 {\"label\": 標籤原文, \"value\": 值原文}。標籤是印在值左邊的字（去掉冒號），值是標籤右邊或旁邊那一格的內容。\n  - report_no＝「報告編號」；receive_date＝「收樣日期」。逐時紀錄表沒有這兩格 → label 與 value 都寫 null。\n  - site_code＝「現場編號」；location＝「檢測位置」或「監測位置」；period＝「檢測日期/時間」或「監測日期」。\n- permit：頁面上方標題下面那一行「環境部許可證字號」：抄 {\"label\": \"環境部許可證字號\" 這幾個字原文, \"value\": 冒號右邊的字原文（例如「環境部國環檢證字第999號」，數字照印刷、不要補零也不要去零）}。這一頁沒有印這一行 → label 與 value 都寫 null。只抄這一行，不要從採樣單位等其他地方的括號抄。\n- summary_rows：只有（甲）檢測報告才填，（乙）寫 null。測項表格由上到下的每一列，接著是「備註：」表格裡有測項與數值的列（不含測定條件、氣象那幾格）；每列：\n  - item：該列所屬的測項名稱（左邊「測項（單位）」格的上半，例如 \"SO2\"；一個測項跨好幾列時，每一列都寫同一個測項名稱）。\n  - unit：該測項的單位（同一格括號裡的字，不含括號；每一列都寫）。\n  - stat：統計項那一格（例如「日平均值」）。\n  - value：數值那一格（「空氣品質標準」左邊那一格）。\n  - method：「檢測方法編號」格（跨好幾列的合併格，該測項的每一列都寫同一個）。\n- hourly：只有（乙）逐時紀錄表才填，（甲）寫 null。內容是一個物件：\n  - columns：表頭「時間」以右由左到右的每一欄：{\"item\": 欄名（例如 \"SO2\"）, \"sub\": 欄名下方的小字（例如「8小時平均」，沒有就寫 null）, \"unit\": 該欄單位（例如 \"ppb\"）}。\n  - hours：由上到下每一個小時列的「時間」格原文（例如 \"10:00 ~ 11:00\"），一列一個字串，只抄時間格，不抄那一列的數值。\n  - stats：最下方三個統計列，由上到下，每列 {\"label\": 統計列左邊的字（印成兩行時用一個半形空白連接）, \"values\": 該列由左到右每一欄的值，欄數要和 columns 一樣}。某一欄是好幾列合併成一格的大格時，統計列那一格照印刷（印 \"*\" 就寫 \"*\"，有數字就寫數字）。\n\n只輸出一個 JSON，不要有任何其他文字、說明或 markdown。格式如下（下面全是假的示範內容，不是這一頁的值；沒用到的那一種寫 null）：\n{\n  \"form_title\": \"檢測報告\",\n  \"report_no\": {\"label\": \"報告編號\", \"value\": \"XY999Z0000\"},\n  \"receive_date\": {\"label\": \"收樣日期\", \"value\": \"100.01.02\"},\n  \"site_code\": {\"label\": \"現場編號\", \"value\": \"1000101XX-9\"},\n  \"location\": {\"label\": \"檢測位置\", \"value\": \"示範測站\"},\n  \"period\": {\"label\": \"檢測日期/時間\", \"value\": \"100.01.01/08:00 至 100.01.02/08:00\"},\n  \"permit\": {\"label\": \"環境部許可證字號\", \"value\": \"環境部國環檢證字第999號\"},\n  \"summary_rows\": [\n    {\"item\": \"示範測項\", \"unit\": \"ppm\", \"stat\": \"最大小時平均值\", \"value\": \"0.123\", \"method\": \"NIEA X000.00X\"},\n    {\"item\": \"示範測項\", \"unit\": \"ppm\", \"stat\": \"日平均值\", \"value\": \"0.045\", \"method\": \"NIEA X000.00X\"}\n  ],\n  \"hourly\": null\n}\n";
//#endregion
//#region src/xdwread/prompt-air.ts
function _u(e, t = null) {
	if (!Number.isInteger(e) || e < 1) throw Error("影像張數無效");
	let n = e === 1 ? "這次給你 1 張圖，是同一頁報告的內容。" : `這次給你 ${e} 張圖，是同一頁報告由上到下切成的 ${e} 條水平帶（相鄰兩條有部分重疊，重疊處是同一段內容，不要重複抄）。請把它們當成一整頁來讀。`, r = gu.replaceAll("{{IMAGE_INTRO}}", n);
	return t === "json" ? r + pu : t === "shape" ? r + mu : r;
}
//#endregion
//#region src/xdwread/prompts/read-noise.txt?raw
var vu = "你是「掃描報表讀值員」。{{IMAGE_INTRO}}\n\n這一頁是噪音振動監測報告的其中一頁。它應該是下面兩種表單之一：\n（甲）「檢測報告」：上方有表頭區（報告編號、收樣日期…），下方有一個測項表格（左邊「測項（單位）」，中間有「現場編號」「檢測位置」「檢測日期/時間」三格，右邊有「法規值」「檢測方法編號」），表格最下面一列是「管制區標準類屬」。\n（乙）「監測數據逐時紀錄」（標題括號裡寫「噪音」或「振動」）：上方有監測位置、監測日期、現場編號，下方是逐時表格（左邊一欄是時間，一列一小時，共 24 列），表格最下方有一個「監測結果」框。\n如果這一頁兩種都不是，form_title 照抄頁面最上方的標題，其他鍵照下面規則能填就填、不能填就寫 null。\n\n工作規則（一定要遵守）：\n1. 只抄圖上「印刷」的字，原樣照抄成字串。不可四捨五入、不可換算、不可計算、不可猜、不可從常識或其他格、其他頁補值。保留印刷的小數位數（例如印 30.0 就寫 \"30.0\"）。\n2. 任何一格只要有一個字不確定，那一格就寫 \"UNREADABLE\"。\n3. 圖上那一格是空白，就寫 null。\n4. 所有值都用字串或 null，不可以用數字型別（寫 \"54.2\"，不可寫 54.2）。\n5. 字元寫法（讓抄寫結果一致）：\n   - 英文字母、數字、標點與符號（( ) . / : ~ - 等）一律用半形；全形冒號「：」也寫成半形 \":\"，全形括號「（）」寫成半形 \"()\"。\n   - 下標、上標一律寫成一般字元，接在前一個字後面：L 下標 eq 寫 \"Leq\"、L 下標 max 寫 \"Lmax\"、L 下標 日 寫 \"L日\"、L 下標 d 寫 \"Ld\"、L 下標 V(10)eq 寫 \"LV(10)eq\"。英文字母照印刷的大小寫。\n   - 印刷是一條橫線（不論長短）一律寫半形 \"-\"。\n   - 數字裡不要抄空白，例如印「54. 2」寫 \"54.2\"；日期裡也不要抄空白，例如印「115. 08. 31-01」寫 \"115.08.31-01\"。\n   - 一格裡印成好幾行時，各行之間用一個半形空白連接。\n   - 其他文字照印刷：字與字之間不要自己加空白。\n6. 不抄（下面 permit 那一行除外）：人名、簽章、印章、單位名稱、地址、電話、文件編號、頁碼、表頭區除了報告編號以外的其他欄（計畫名稱、委託單位、案件編號、收樣日期、報告日期、樣品特性、採樣行程編號…）、「註」的文字、逐時表 24 列裡的數值。這些內容也不要寫進任何欄位。\n\n要抄的內容（鍵名固定，不要增加或減少任何鍵）：\n- form_title：頁面最上方表單名稱那一行（不含單位名稱、不含文件編號那一行），例如「檢測報告」或「某某紀錄(噪音)」。\n- report_no、site_code、location、period、zone：各抄 {\"label\": 標籤原文, \"value\": 值原文}。標籤是印在值左邊（或上方）的字（去掉冒號），值是標籤右邊或旁邊那一格的內容。\n  - report_no＝「報告編號」（表頭區）。逐時紀錄沒有這一格 → label 與 value 都寫 null。\n  - site_code＝「現場編號」；location＝「檢測位置」或「監測位置」；period＝「檢測日期/時間」或「監測日期」（印成好幾行就用一個半形空白連接）。\n  - zone＝測項表格最下面一列「管制區標準類屬」與它右邊的內容。逐時紀錄沒有這一列 → label 與 value 都寫 null。\n- permit：頁面上方標題下面那一行「環境部許可證字號」：抄 {\"label\": \"環境部許可證字號\" 這幾個字原文, \"value\": 冒號右邊的字原文（例如「環境部國環檢證字第999號」，數字照印刷、不要補零也不要去零）}。這一頁沒有印這一行 → label 與 value 都寫 null。只抄這一行，不要從採樣單位等其他地方的括號抄。\n- summary_rows：只有（甲）檢測報告才填，（乙）寫 null。「管制區標準類屬」以上、有數值的每一列，由上到下；每列：\n  - item：左邊「測項（單位）」格裡括號前面的測項名稱（一個測項跨好幾列時，每一列都寫同一個）。\n  - unit：同一格最外層括號裡的字（不含最外層括號；裡面的括號照抄，例如 \"dB(A)\"）。每一列都寫。\n  - stat：統計項那一格，連同下標與「監測值」三個字（例如 \"L日監測值\"、\"Ld監測值\"、\"Leq24監測值\"）。下標字很小，請照位置一列一列對齊抄；只有下標那一個字太小讀不出時，那個字寫成半形 \"?\"（例如 \"L?監測值\"），不要整格寫 \"UNREADABLE\"，也不要猜。\n  - value：數值那一格（「法規值」左邊那一格）。\n  - limit：「法規值」那一格（印一條橫線就寫 \"-\"）。\n  - method：「檢測方法編號」格（跨好幾列的合併格，每一列都寫同一個）。\n- hourly：只有（乙）逐時紀錄才填，（甲）寫 null。欄名與單位印在表格最上方、「監測結果」框印在表格最下方，中間隔著 24 個小時列；兩者都要抄。內容是一個物件：\n  - columns：表頭「時間」以右由左到右的每一欄：{\"item\": 欄名（照規則 5 寫下標，例如 \"Leq\"、\"L90\"、\"LV10(1)\"）, \"unit\": 欄名下面那一格的單位（例如 \"dB(A)\"、\"dB\"）}。\n  - hours：由上到下每一個小時列的「時間」格原文（例如 \"09:00~10:00\"），一列一個字串，只抄時間格，不抄那一列的數值。從表格第一列抄到最後一列，順序不可以調換。\n  - results：表格最下方「監測結果」框裡的每一個結果，先左欄由上到下、再右欄由上到下；每個 {\"label\": 結果的標籤（冒號左邊的字，包含括號裡的時段，例如 \"L日(06~20)\"、\"Ld(07~22)\"、\"Ldn\"）, \"value\": 標籤右邊的數值, \"unit\": 數值右邊的單位}。\n\n只輸出一個 JSON，不要有任何其他文字、說明或 markdown。格式如下（下面全是假的示範內容，不是這一頁的值；沒用到的那一種寫 null）：\n{\n  \"form_title\": \"示範紀錄(示範)\",\n  \"report_no\": {\"label\": null, \"value\": null},\n  \"site_code\": {\"label\": \"現場編號\", \"value\": \"1000101XX-9\"},\n  \"location\": {\"label\": \"監測位置\", \"value\": \"示範測站\"},\n  \"period\": {\"label\": \"監測日期\", \"value\": \"100.01.01-02\"},\n  \"zone\": {\"label\": null, \"value\": null},\n  \"permit\": {\"label\": null, \"value\": null},\n  \"summary_rows\": null,\n  \"hourly\": {\n    \"columns\": [{\"item\": \"X1\", \"unit\": \"dB\"}, {\"item\": \"X2\", \"unit\": \"dB\"}],\n    \"hours\": [\"10:00~11:00\", \"11:00~12:00\"],\n    \"results\": [{\"label\": \"示範(10~11)\", \"value\": \"12.3\", \"unit\": \"dB\"}]\n  }\n}\n";
//#endregion
//#region src/xdwread/prompt-noise.ts
function yu(e, t = null) {
	if (!Number.isInteger(e) || e < 1) throw Error("影像張數無效");
	let n = e === 1 ? "這次給你 1 張圖，是同一頁報告的內容。" : `這次給你 ${e} 張圖，是同一頁報告由上到下切成的 ${e} 條水平帶（相鄰兩條有部分重疊，重疊處是同一段內容，不要重複抄）。請把它們當成一整頁來讀。`, r = vu.replaceAll("{{IMAGE_INTRO}}", n);
	return t === "json" ? r + pu : t === "shape" ? r + mu : r;
}
//#endregion
//#region src/xdwread/reader.ts
var bu = jl[0], xu = jl[1], Su = 12e4, Cu = 5e3, wu = "（回覆含疑似金鑰的字串，原文不保存）", Tu = {
	noKey: "沒有 Claude 金鑰（尚未設定，或讀值途中被移除），已停止讀值。",
	rateLimited: "Claude 一直回覆「太頻繁或已達每月上限」，同一頁重試 3 次仍不行，已停止讀值。請過一段時間再重新選檔讀值。",
	auth: (e) => `${e}，已停止讀值。`,
	cancelled: "已中止讀值。",
	imageFail: (e) => `送出圖做不出來：${e}`
}, Eu = (e) => ({
	...su(),
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
	readKey: () => Xl(),
	...e
}), Du = class extends Error {
	text;
	why;
	constructor(e, t) {
		super(e), this.text = e, this.why = t;
	}
};
async function Ou(e, t, n) {
	if (!e.image || !e.box) throw Error("沒有送出圖");
	let r = await n.decode(e.image);
	if (r.width !== e.box.w || r.height !== e.box.h) throw Error(`送出圖尺寸 ${r.width}×${r.height} 與預覽 ${e.box.w}×${e.box.h} 不同`);
	let i = Ea(r.width, r.height);
	if (!i.ok) throw Error(i.reason);
	let a = t === "A" ? i.A : i.B, o = [];
	for (let e of a) o.push({ base64: await n.encode(Da(r, e)) });
	return o;
}
async function ku(e, t) {
	let n = e.form === "air" ? "air" : e.form === "noise" ? "noise" : "gw", r = n === "air" ? _u : n === "noise" ? yu : hu, i = n === "air" ? Ns : n === "noise" ? Xs : At, a = e.pages.filter((e) => e.mode !== "skip");
	for (let e of a) if (!(e.image instanceof Blob) || !e.box) throw Error(`第 ${e.page} 頁要送出卻沒有送出圖`);
	let o = e.pages.map((e) => ({
		page: e.page,
		mode: e.mode,
		image: e.mode === "skip" || !e.box ? null : {
			w: e.box.w,
			h: e.box.h
		},
		reason: e.reason,
		cls: e.cls ? { ...e.cls } : null
	})), s = sl({
		fileName: e.fileName,
		xdwSha256: e.xdwSha256,
		createdAt: t.isoNow?.() ?? new Date(t.now()).toISOString(),
		period: e.period,
		category: e.category,
		agency: e.agency,
		pages: o,
		form: n
	}), c = [], l = new AbortController(), u = () => {
		d ||= new Du(Tu.cancelled, "cancelled"), l.abort();
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
				usage: ol(s.calls),
				note: y
			});
		} catch {}
	}, x = async (e, n) => {
		let a = n === "A" ? bu : xu, o;
		try {
			o = await Ou(e, n, t);
		} catch (t) {
			c.push({
				page: e.page,
				scheme: n,
				text: Tu.imageFail(t?.message || "未知錯誤")
			});
			return;
		}
		let u = 0, d = 0, p = !1, m = null, h = !1, x = 0;
		for (;;) {
			for (; !l.signal.aborted && v > t.now();) await t.sleep(v - t.now(), l.signal);
			if (l.signal.aborted) return;
			let c = t.readKey();
			if (!c) {
				f(new Du(Tu.noKey, "stopped"));
				return;
			}
			u++, g++, _++, b();
			let S = t.now(), C;
			try {
				C = await du(c, a, o, r(o.length, m), {
					signal: l.signal,
					timeoutMs: t.timeoutMs ?? 12e4
				}, t);
			} catch (e) {
				C = {
					kind: "network",
					message: Rl(e?.message, c)
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
					message: Rl(t, c)
				};
			}, ee = "end", te = 0;
			if (C.kind === "ok") if (T.appliedModel = C.appliedModel, T.stopReason = C.stopReason, T.usage = { ...C.usage }, Dc.test(C.text)) T.replyText = wu, E("secret_like", "回覆含疑似金鑰的字串，這次回覆作廢");
			else if (T.replyText = C.text, C.stopReason === "refusal") E("refused", "模型拒絕回答");
			else if (C.stopReason === "max_tokens") E("truncated", "回覆被截斷"), h || (h = !0, m = "json", ee = "retry");
			else {
				let e = i(C.text);
				if (!e.ok) if (e.kind === "empty") E("empty", "回覆是空的");
				else {
					let t = Ct(e.kind);
					t && !h && (h = !0, m = t, ee = "retry");
				}
			}
			else if (C.kind === "http") {
				let e = C.status;
				if (e === 429) {
					if (E("rate_limited", C.message, e), d >= 3) {
						s.calls.push(T), b(), f(new Du(Tu.rateLimited, "stopped"));
						return;
					}
					d++;
					let n = Math.min(C.retryAfterMs ?? 6e4, Su);
					v = Math.max(v, t.now() + n), ee = "retry", y = `Claude 回覆太頻繁，暫停約 ${Math.ceil(n / 1e3)} 秒後自動續跑`;
				} else if (e === 401 || e === 403 || e === 404) {
					E("auth", C.message, e), s.calls.push(T), b(), f(new Du(Tu.auth(C.message), "stopped"));
					return;
				} else e >= 500 ? (E("upstream_error", C.message, e), p || (p = !0, ee = "retry", te = Cu)) : E("bad_request", C.message, e);
			} else C.kind === "network" ? (E("network", C.message), p || (p = !0, ee = "retry", te = Cu)) : C.kind === "timeout" ? (E("timeout", C.message), x++, x <= 2 && (ee = "retry", y = `第 ${e.page} 頁 ${n} 讀法逾時，自動重送（第 ${x} 次）`)) : C.kind === "cancelled" ? E("cancelled", C.message) : E("format", C.message);
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
		!l.signal.aborted && !t.readKey() && f(new Du(Tu.noKey, "stopped")), l.signal.aborted || await S("A", a), l.signal.aborted || await S("B", a.filter((e) => Qc(n, s.calls, e.page, "A")));
	} finally {
		e.signal?.removeEventListener("abort", u);
	}
	let C = d;
	Gc(s);
	let w = {
		status: C ? C.why : "done",
		stopText: C ? C.text : null,
		log: s,
		notes: c,
		verify: n === "gw" ? tl(s) : null,
		airVerify: n === "air" ? rl(s) : null,
		noiseVerify: n === "noise" ? al(s) : null
	};
	return b(C ? C.text : void 0), w;
}
//#endregion
//#region src/xdwread/manualview.ts
var Au = {
	head: (e) => `人工輸入（不是 Claude 讀的；項目固定：${e}）`,
	fields: {
		result: "檢測結果",
		mdl: "MDL",
		unit: "單位",
		method: "方法"
	},
	item: "項目",
	mdlFixed: "（這頁沒有 MDL 欄，固定空白）",
	check: (e) => `我已對照原頁確認這一列（項目：${e}）`,
	cannotCheck: "還不能勾選：",
	checked: "已確認：這一列會用你填的內容（狀態「人工輸入」）",
	locked: "送件中，暫時不能改",
	statusIn: "人工輸入",
	reasonIn: (e, t = null) => `你填的：結果 ${e.result.trim() || "（空白）"}／MDL ${e.mdl.trim() || "（空白）"}／單位 ${e.unit.trim() || "（空白）"}／方法 ${e.method.trim() || "（空白）"}`
}, ju = (e, t) => `${e}:${t}`;
function Mu(e, t, n = []) {
	let r = /* @__PURE__ */ new Map(), i = [], a = !1;
	t.manual = [];
	let o = new Map(n.map((e) => [ju(e.page, e.index), e])), s = (t, n) => e.pages.includes(t) && t.rows[n.index] === n && ls(t, n);
	function c(e, t) {
		let n = ju(e.page, t.index), i = r.get(n);
		if (!i) {
			let a = ps(e, t);
			i = {
				raw: { ...a.raw },
				preset: null,
				checked: !1,
				agreed: a.agreed,
				why: a.why
			};
			let s = o.get(n);
			if (s && s.raw && typeof s.raw == "object") for (let e of as) typeof s.raw[e] == "string" && (i.raw[e] = s.raw[e], i.agreed[e] = !1);
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
		if (!s(e, t)) return [L.notEditable];
		let n = c(e, t), r = e.tableType, i = [];
		for (let e of as) {
			let t = ds(e, n.raw[e], r, n.preset);
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
			i.raw[n] !== r && (i.raw[n] = r, i.agreed[n] = !1, d(e, t, i), l(e.page, t.index));
		},
		setChecked(e, n, r) {
			if (a) return [Au.locked];
			if (!s(e, n)) return [L.notEditable];
			let i = c(e, n);
			if (!r) return d(e, n, i), l(e.page, n.index), [];
			let o = hs(e, n, i.raw, i.preset), f = ms(e, n, o);
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
function Nu(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
function Pu(e, t, n, r) {
	if (!t.editable(n, r)) return null;
	let i = n.tableType, a = r.expected, o = Nu(e, "div", "edc-man");
	o.dataset.page = String(n.page), o.dataset.row = String(r.index + 1), o.append(Nu(e, "div", "edc-man-head", Au.head(a)));
	let s = Nu(e, "div", "edc-man-item", `${Au.item}：${a}`);
	s.dataset.field = "item", o.append(s);
	let c = {}, l = {}, u = Nu(e, "div", "edc-man-grid");
	for (let i of as) {
		let a = Nu(e, "label", "edc-man-field");
		a.dataset.field = i;
		let o = Nu(e, "input", "edc-man-input");
		o.type = "text", o.autocomplete = "off", o.spellcheck = !1, o.dataset.field = i, o.maxLength = 200, o.addEventListener("input", () => {
			try {
				t.setField(n, r, i, o.value);
			} catch {}
		}), o.addEventListener("click", (e) => e.stopPropagation());
		let s = Nu(e, "span", "edc-man-why");
		c[i] = o, l[i] = s, a.append(Nu(e, "span", "edc-man-label", Au.fields[i]), o, s), u.append(a);
	}
	o.append(u);
	let d = Nu(e, "label", "edc-man-checkline"), f = Nu(e, "input", "edc-man-check");
	f.type = "checkbox", f.addEventListener("click", (e) => e.stopPropagation()), f.addEventListener("change", () => {
		try {
			let e = t.setChecked(n, r, f.checked);
			e.length && (f.checked = !1, p.textContent = Au.cannotCheck + e.join("；"));
		} catch {
			f.checked = !1;
		}
	}), d.append(f, Nu(e, "span", void 0, Au.check(a)));
	let p = Nu(e, "div", "edc-man-msg");
	o.append(d, p), o.addEventListener("click", (e) => e.stopPropagation());
	let m = () => {
		let e = t.state(n, r), a = t.locked();
		for (let t of as) {
			let n = c[t], r = t === "mdl" && i === "A", o = e.raw[t];
			n.value !== o && (n.value = o), n.readOnly = r || a, n.disabled = r || a;
			let s = r ? null : ds(t, e.raw[t], i), u = !e.agreed[t] && e.raw[t] === "" && e.why[t] && e.why[t] !== L.agreed ? `（${e.why[t]}）` : "";
			l[t].textContent = r ? Au.mdlFixed : [u, s ? `⚠ ${s}` : e.agreed[t] ? L.agreed : ""].filter(Boolean).join(" "), l[t].className = `edc-man-why${s ? " edc-man-bad" : ""}`, n.setAttribute("aria-invalid", String(!!s));
		}
		let s = t.problems(n, r);
		f.checked = t.isConfirmed(n.page, r.index), f.disabled = a || !f.checked && s.length > 0, p.textContent = a ? Au.locked : f.checked ? Au.checked : s.length ? Au.cannotCheck + s.join("；") : "", p.className = `edc-man-msg${!f.checked && s.length ? " edc-man-bad" : ""}${f.checked ? " edc-man-ok" : ""}`, o.dataset.checked = String(f.checked);
	};
	return t.onChange((e, t) => {
		e === n.page && t === r.index && m();
	}), m(), o;
}
//#endregion
//#region src/xdwread/results.ts
var B = {
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
}, Fu = (e) => e.pages.filter((e) => e.status === "manual" && e.rows.length === 0).length, Iu = (e, t = 0) => B.counts(e.totals.pass, e.totals.manual - t, e.totals.pagesSkipped, Fu(e), t);
function Lu(e) {
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
var Ru = (e) => String(e).padStart(2, "0");
function zu(e, t) {
	return `${e.replace(/\.xdw$/i, "") || "XDW"}（讀值紀錄 ${`${t.getFullYear()}${Ru(t.getMonth() + 1)}${Ru(t.getDate())}-${Ru(t.getHours())}${Ru(t.getMinutes())}${Ru(t.getSeconds())}`}）.json`;
}
function Bu(e, t) {
	return `XDW讀值紀錄包（${e} 個檔 ${`${t.getFullYear()}${Ru(t.getMonth() + 1)}${Ru(t.getDate())}-${Ru(t.getHours())}${Ru(t.getMinutes())}${Ru(t.getSeconds())}`}）.json`;
}
function V(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var Vu = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤", Hu = (e) => e == null || e === "" ? B.empty : e;
function Uu(e, t) {
	if (e.status === "ok" && e.identity) return {
		sampleName: e.identity.sampleName,
		reportNo: e.identity.reportNo,
		sampleTime: e.identity.sampleTime
	};
	let n = e.mode === "skip" ? null : Yc(t.calls, e.page, "A", $c(t)), r = (e) => {
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
function Wu(e) {
	let t = 0, n = 0, r = 0, i = 0, a = 0;
	for (let o of e) t += o.v.totals.pass, n += o.v.totals.manual - o.manualIn, r += o.v.totals.pagesSkipped, i += Fu(o.v), a += o.manualIn;
	return B.batch(e.length, B.counts(t, n, r, i, a));
}
function Gu(e, t) {
	let n = [], r = !1, i = t.length > 1, a = V(e, "div", "edc-res");
	a.id = "edcReadResults";
	let o = V(e, "div", "edc-res-counts");
	o.id = "edcReadCounts", a.append(o);
	let s = V(e, "div", "edc-res-attn");
	s.id = "edcReadAttn";
	let c = V(e, "div", "edc-res-all");
	c.id = "edcReadAllRows", c.hidden = !0;
	let l = 0, u = [], d = () => {
		let e = u.map((e) => e());
		o.textContent = i ? Wu(e) : Iu(e[0].v, e[0].manualIn);
	};
	t.forEach((t, n) => {
		let a = p(t, i ? n : null);
		if (l += a.total, u.push(a.now), i) {
			let r = (r) => {
				let i = V(e, "div", r, B.fileTitle(n + 1, t.log.fileName));
				return i.dataset.file = String(n), i;
			}, i = V(e, "div", "edc-res-file");
			i.dataset.file = String(n), i.append(r("edc-res-file-title"), a.counts, ...a.attn), s.append(i);
			let o = V(e, "div", "edc-res-file");
			o.dataset.file = String(n), o.append(r("edc-res-file-title"), ...a.all), c.append(o);
		} else s.append(...a.attn), c.append(...a.all);
		t.store?.onChange(() => {
			try {
				r || (a.refresh(), d());
			} catch {}
		});
	}), d(), a.append(s);
	let f = V(e, "button", "edc-xdw-btn edc-res-showall", B.showAll(l));
	f.type = "button", f.id = "edcReadShowAll", f.setAttribute("aria-expanded", "false"), f.setAttribute("aria-controls", "edcReadAllRows"), f.addEventListener("click", () => {
		try {
			c.hidden = !c.hidden, f.setAttribute("aria-expanded", String(!c.hidden)), f.textContent = c.hidden ? B.showAll(l) : B.hideAll;
		} catch {}
	}), a.append(f, c);
	function p(t, i) {
		let { v: a, log: o, frag: s, store: c } = t, l = V(e, "div", "edc-res-counts edc-res-file-counts");
		i !== null && (l.dataset.file = String(i));
		let u = () => ({
			v: a,
			manualIn: c?.confirmed() ?? 0
		}), d = () => {
			l.textContent = Iu(a, c?.confirmed() ?? 0);
		};
		d();
		let f = (e) => (i !== null && (e.dataset.file = String(i)), e), p = /* @__PURE__ */ new Map(), m = (e, t) => {
			if (!c) return;
			let n = c.isConfirmed(e.page, t.index), r = n ? c.state(e, t) : null;
			for (let i of p.get(`${e.page}:${t.index}`) ?? []) i.tr.classList.toggle("edc-res-manualin", n), i.st.textContent = n ? Au.statusIn : t.status === "pass" ? B.pass : B.manual, i.why.textContent = n && r ? Au.reasonIn(r.raw, r.preset) : t.reasons.join("；");
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
		}, _ = Lu(a), v = [];
		if (_.allPass.length) {
			let t = V(e, "div", "edc-res-allpass", B.allPass(_.allPass, _.allPassRows));
			i === null && (t.id = "edcReadAllPass"), v.push(f(t));
		}
		_.pages.length || v.push(V(e, "div", "edc-res-noattn", B.noAttn));
		for (let t of _.pages) {
			let n = b(t.page, "edc-res-attn-page");
			t.rows.length && n.append(x(t.page, t.rows, "edc-res-arow")), c && (t.kind === "manual" || t.kind === "skip") && n.append(V(e, "div", "edc-res-byhand", B.pageByHand)), t.kind === "warn-pass" ? n.append(V(e, "div", "edc-res-hidden-pass", B.warnPass(t.hiddenPass))) : t.hiddenPass > 0 && n.append(V(e, "div", "edc-res-hidden-pass", B.hiddenPass(t.hiddenPass))), v.push(n);
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
			let r = o.pages.find((e) => e.page === t.page) ?? null, i = V(e, "div", `${n} ${n}-${t.status}`);
			f(i), i.dataset.page = String(t.page), i.dataset.status = t.status;
			let a = V(e, "div", "edc-res-page-head");
			a.append(V(e, "strong", void 0, B.page(t.page)), V(e, "span", "edc-res-mode", t.mode === "whole" ? B.modeWhole : B.modeSkip));
			let s = t.status === "ok" ? B.pageOk : t.status === "manual" ? B.pageManual + (t.reasons.join("；") || "—") : B.pageSkip + (r?.reason || "—");
			if (a.append(V(e, "span", "edc-res-page-status", s)), i.append(a), t.status !== "skip") {
				let n = Uu(t, o), r = V(e, "ul", "edc-res-identity"), a = (t, n) => {
					let i = V(e, "li", void 0, `${B.labels[t]}：${n}`);
					i.dataset.field = t, r.append(i);
				};
				a("sampleName", n.sampleName), a("reportNo", n.reportNo), a("sampleTime", n.sampleTime), i.append(r);
			}
			for (let n of t.warnings) i.append(V(e, "div", "edc-res-warn", `⚠ ${n}`));
			return i;
		}
		function x(t, n, r) {
			let i = V(e, "table", "edc-res-table"), a = V(e, "tr");
			for (let t of B.cols) a.append(V(e, "th", void 0, t));
			let o = V(e, "thead");
			o.append(a);
			let s = V(e, "tbody");
			for (let e of n) s.append(...S(t, e, r));
			return i.append(o, s), i;
		}
		function S(t, n, r) {
			let i = V(e, "tr", `${r} edc-res-${n.status}`);
			f(i), i.dataset.page = String(t.page), i.dataset.row = String(n.index + 1), i.title = "點一下看五格對照與片段";
			let a = V(e, "td", "edc-res-status", n.status === "pass" ? B.pass : B.manual), o = V(e, "td", "edc-res-reason", n.reasons.join("；"));
			i.append(V(e, "td", void 0, n.expected), V(e, "td", void 0, n.a ? Hu(n.a.result) : B.none), V(e, "td", void 0, n.b ? Hu(n.b.result) : B.none), a, o);
			let s = `${t.page}:${n.index}`;
			p.set(s, [...p.get(s) ?? [], {
				tr: i,
				st: a,
				why: o,
				pr: t,
				r: n
			}]), m(t, n);
			let c = V(e, "tr", "edc-res-detail-row");
			c.hidden = !0;
			let l = V(e, "td");
			l.colSpan = B.cols.length, c.append(l);
			let u = !1;
			return i.addEventListener("click", () => {
				try {
					c.hidden = !c.hidden, !u && !c.hidden && (u = !0, l.append(C(t, n, r === "edc-res-arow")));
				} catch {}
			}), [i, c];
		}
		function C(t, n, i) {
			let a = V(e, "div", "edc-res-detail");
			f(a), a.dataset.page = String(t.page), a.dataset.row = String(n.index + 1);
			let o = V(e, "table", "edc-res-cmp"), s = V(e, "tr");
			s.append(V(e, "th", void 0, "欄位"), V(e, "th", void 0, "A"), V(e, "th", void 0, "B")), o.append(s);
			for (let t of Object.keys(B.fields)) {
				let r = V(e, "tr");
				r.append(V(e, "td", void 0, B.fields[t]), V(e, "td", void 0, n.a ? Hu(n.a[t]) : B.none), V(e, "td", void 0, n.b ? Hu(n.b[t]) : B.none)), o.append(r);
			}
			if (a.append(o), i && c) {
				let r = Pu(e, c, t, n);
				r && a.append(r);
			}
			let l = V(e, "div", "edc-res-frag");
			return a.append(l), w(t, n, l).catch((t) => {
				r || l.replaceChildren(V(e, "div", "edc-xdw-red", B.fragFail(Vu(t))));
			}), a;
		}
		async function w(t, r, i) {
			let a = o.pages.find((e) => e.page === t.page) ?? null, c = s(t.page);
			if (!(a && c && c.mode === a.mode && c.image && c.box && a.image && a.image.w === c.box.w && a.image.h === c.box.h) || !c || !c.image || !c.box) {
				i.append(V(e, "div", "edc-res-frag-none", B.fragNone));
				return;
			}
			let l = V(e, "img", "edc-res-frag-img");
			l.alt = B.fragAlt(t.page, r.index + 1);
			let u = URL.createObjectURL(c.image);
			n.push(u), l.src = u, l.title = "點一下放大到原尺寸／縮回";
			let d = V(e, "div", "edc-res-frag-wrap");
			l.addEventListener("click", () => {
				try {
					l.classList.toggle("edc-res-frag-full"), d.classList.toggle("edc-res-frag-scroll");
				} catch {}
			}), d.append(l), i.append(V(e, "div", "edc-res-frag-note", B.fragWhole), d);
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
var H = {
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
	].filter((t) => e[t] !== void 0).map((t) => `${Ku[t]} 第 ${e[t]} 頁`).join("、"),
	stationOk: (e, t) => `站層級檢查通過；${e}／${t} 個值通過`,
	stationManual: "全站需人工：",
	hiddenPass: (e) => `其他 ${e} 個值通過（按「顯示全部」可看）`,
	page: (e) => `第 ${e} 頁`,
	layout: (e) => e ? Ku[e] : "版型不明",
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
}, Ku = {
	N1: "噪音總表",
	N2: "噪音逐時",
	V1: "振動逐時"
}, qu = (e) => H.counts(e.totals.pass, e.totals.manual, e.totals.pagesManual, e.totals.pagesNoData, e.totals.pagesSkipped);
function Ju(e) {
	let t = {
		pass: 0,
		manual: 0,
		pagesManual: 0,
		pagesNoData: 0,
		pagesSkipped: 0
	};
	for (let n of e) for (let e of Object.keys(t)) t[e] += n.totals[e];
	return B.batch(e.length, H.counts(t.pass, t.manual, t.pagesManual, t.pagesNoData, t.pagesSkipped));
}
function Yu(e) {
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
function Xu(e, t, n) {
	let r = zn[n], i = t.pages[r.layout];
	if (i === void 0) return null;
	let a = e.pages.find((e) => e.page === i)?.cells.find((e) => e.layout === r.layout && e.index === r.index && e.use === "write");
	return a ? {
		a: a.a,
		b: a.b
	} : null;
}
function U(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var Zu = (e) => e == null || e === "" ? B.empty : e;
function Qu(e, t) {
	if (e.identity && e.status === "ok") return {
		code: e.identity.siteCode,
		loc: e.identity.location,
		period: e.identity.periodKey
	};
	let n = e.mode === "skip" ? null : Zc(t.calls, e.page, "A", $c(t)), r = (e) => {
		if (!n || !n.ok) return B.notRead;
		let t = n.reply[e].value;
		return t === null || t.trim() === "" ? B.notRead : `${t}${B.unconfirmed}`;
	};
	return {
		code: r("site_code"),
		loc: r("location"),
		period: r("period")
	};
}
function $u(e, t) {
	let n = t.length > 1, r = U(e, "div", "edc-res edc-res-noise");
	r.id = "edcReadResults";
	let i = U(e, "div", "edc-res-counts", n ? Ju(t.map((e) => e.v)) : qu(t[0].v));
	i.id = "edcReadCounts";
	let a = U(e, "div", "edc-res-attn");
	a.id = "edcReadAttn";
	let o = U(e, "div", "edc-res-all");
	o.id = "edcReadAllRows", o.hidden = !0;
	let s = 0;
	t.forEach((t, r) => {
		let i = (e) => (n && (e.dataset.file = String(r)), e), c = Yu(t.v);
		s += c.total;
		let f = [], p = [];
		if (!c.anyLayout) {
			let t = i(U(e, "div", "edc-xdw-red edc-noise-nolayout", H.noLayout));
			n || (t.id = "edcNoiseNoLayout"), f.push(t);
		}
		if (c.allPassStations.length) {
			let t = i(U(e, "div", "edc-res-allpass", H.allPass(c.allPassStations.length, c.allPassPages, c.allPassValues)));
			n || (t.id = "edcReadAllPass"), f.push(t);
		}
		for (let e of c.stations) f.push(l(t, r, e.index, e.st, e.manual, e.pass, !1));
		for (let e of c.pages) f.push(u(t, r, e));
		if (c.noData.length) {
			let t = i(U(e, "div", "edc-noise-nodata", H.noData(c.noData)));
			n || (t.id = "edcReadNoData"), f.push(t);
		}
		if (!c.stations.length && !c.pages.length && c.anyLayout && f.push(U(e, "div", "edc-res-noattn", H.noAttn)), t.v.totals.manual > 0 || t.v.totals.pagesManual > 0) {
			let t = i(U(e, "div", "edc-noise-nomanual", H.noManual));
			n || (t.id = "edcNoiseNoManual"), f.push(t);
		}
		if (t.v.stations.forEach((e, n) => p.push(l(t, r, n, e, e.values, 0, !0))), p.push(d(t, r)), n) {
			let n = () => {
				let n = U(e, "div", "edc-res-file-title", B.fileTitle(r + 1, t.log.fileName));
				return n.dataset.file = String(r), n;
			}, i = U(e, "div", "edc-res-file");
			i.dataset.file = String(r);
			let s = U(e, "div", "edc-res-counts edc-res-file-counts", qu(t.v));
			s.dataset.file = String(r), i.append(n(), s, ...f), a.append(i);
			let c = U(e, "div", "edc-res-file");
			c.dataset.file = String(r), c.append(n(), ...p), o.append(c);
		} else a.append(...f), o.append(...p);
	});
	let c = U(e, "button", "edc-xdw-btn edc-res-showall", H.showAll(s));
	c.type = "button", c.id = "edcReadShowAll", c.setAttribute("aria-expanded", "false"), c.setAttribute("aria-controls", "edcReadAllRows"), c.addEventListener("click", () => {
		try {
			o.hidden = !o.hidden, c.setAttribute("aria-expanded", String(!o.hidden)), c.textContent = o.hidden ? H.showAll(s) : B.hideAll;
		} catch {}
	}), r.append(i, a, c, o);
	function l(t, r, i, a, o, s, c) {
		let l = U(e, "section", c ? "edc-noise-station edc-noise-station-full" : "edc-noise-station");
		l.dataset.station = String(i), l.dataset.status = a.status, n && (l.dataset.file = String(r));
		let u = U(e, "div", "edc-noise-station-head");
		u.append(U(e, "strong", void 0, H.station(a.siteCode, a.location)), U(e, "span", "edc-noise-station-pages", `（${H.stationPages(a.pages)}）`)), l.append(u);
		let d = a.values.filter((e) => e.status === "pass").length;
		l.append(a.status === "ok" ? U(e, "div", "edc-res-page-status", H.stationOk(d, a.values.length)) : U(e, "div", "edc-res-page-status edc-xdw-red", H.stationManual + a.reasons.join("；")));
		let f = U(e, "table", "edc-res-table edc-noise-table"), p = U(e, "tr");
		for (let t of H.cols) p.append(U(e, "th", void 0, t));
		f.append(p);
		for (let i of o) {
			let o = U(e, "tr", c ? "edc-noise-row" : "edc-noise-arow");
			o.dataset.key = i.key, o.dataset.status = i.status, i.page !== null && (o.dataset.page = String(i.page)), n && (o.dataset.file = String(r));
			let s = Xu(t.v, a, i.key);
			o.append(U(e, "td", void 0, i.key), U(e, "td", void 0, i.page === null ? B.none : String(i.page)), U(e, "td", void 0, Zu(s?.a)), U(e, "td", void 0, Zu(s?.b)), U(e, "td", i.status === "pass" ? "edc-res-pass" : "edc-res-manual", i.status === "pass" ? B.pass : B.manual), U(e, "td", void 0, H.cross[i.cross]), U(e, "td", void 0, i.reasons.join("；"))), f.append(o);
		}
		return l.append(f), s > 0 && l.append(U(e, "div", "edc-res-hiddenpass", H.hiddenPass(s))), l;
	}
	function u(t, r, i) {
		let a = U(e, "section", "edc-noise-page");
		a.dataset.page = String(i.page), a.dataset.status = i.status, n && (a.dataset.file = String(r));
		let o = U(e, "div", "edc-noise-page-head");
		if (o.append(U(e, "strong", void 0, H.page(i.page)), U(e, "span", void 0, ` ${H.layout(i.layout)}`)), a.append(o), a.append(U(e, "div", "edc-res-page-status edc-xdw-red", (i.status === "skip" ? H.pageSkip : H.pageManual) + i.reasons.join("；"))), i.status !== "skip") {
			let n = Qu(i, t.log), r = U(e, "ul", "edc-res-identity");
			r.append(U(e, "li", void 0, `${H.ids.code}：${n.code}`), U(e, "li", void 0, `${H.ids.loc}：${n.loc}`), U(e, "li", void 0, `${H.ids.period}：${n.period}`)), a.append(r);
		}
		return a;
	}
	function d(t, r) {
		let i = U(e, "table", "edc-res-table edc-noise-pages"), a = U(e, "tr");
		for (let t of H.pageCols) a.append(U(e, "th", void 0, t));
		i.append(a);
		for (let a of [...t.v.pages].sort((e, t) => e.page - t.page)) {
			let t = U(e, "tr", "edc-noise-prow");
			t.dataset.page = String(a.page), t.dataset.status = a.status, n && (t.dataset.file = String(r));
			let o = a.status === "ok" ? H.pageOk : a.status === "nodata" ? H.pageNoData : a.status === "skip" ? H.pageSkip.replace("：", "") : H.pageManual.replace("：", "");
			t.append(U(e, "td", void 0, String(a.page)), U(e, "td", void 0, H.layout(a.layout)), U(e, "td", void 0, o), U(e, "td", void 0, a.status === "ok" || a.status === "nodata" ? "" : a.reasons.join("；"))), i.append(t);
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
var ed = (e) => String(e).padStart(2, "0"), td = (e) => e.map((e) => `p${ed(e)}`).join("_"), nd = (e) => `${e.start.rocYear}.${ed(e.start.month)}.${ed(e.start.day)}`, rd = (e) => Array.from({ length: 24 }, (t, n) => {
	let r = (e.start.hour + n) % 24;
	return `${ed(r)}~${ed(r + 1)}`;
}), id = 24 * 36e5, ad = (e) => Date.UTC(e.rocYear + 1911, e.month - 1, e.day, e.hour, e.minute);
function od(e, t, n) {
	let r = `第 ${t + 1} 站`, i = n.window;
	if (!i || n.windowPage === null) throw Error(`${r}：沒有時間窗（內部檢查）`);
	if (i.start.minute !== 0 || i.end.minute !== 0 || ad(i.end) - ad(i.start) !== id) throw Error(`${r}：時間窗不是整點 24 小時（內部檢查）`);
	let a = e.pages.find((e) => e.page === n.windowPage);
	if (!a || a.status !== "ok" || a.station !== t || a.layout !== "N1") throw Error(`${r}：時間窗來源頁沒有通過（內部檢查）`);
	if (typeof n.location != "string" || n.location.trim() === "") throw Error(`${r}：測站空白（內部檢查）`);
}
function sd() {
	return Array.from({ length: M.rows }, () => Array(M.cols).fill(""));
}
function cd(e, t, n, r) {
	let i = ([t, n], r) => {
		e[t][n] = r;
	};
	i(M.agencyCell, M.agencyLabel + t.agency.name), i(M.locationCell, M.locationLabel + n.location), i(M.dateCell, M.dateLabel + nd(r)), i(M.timeHeaderCell, M.timeHeader), rd(r).forEach((t, n) => {
		e[M.firstHourRow + n][M.hourCol] = t;
	});
}
function ld(e, t) {
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
			let n = `第 ${o + 1} 站 ${t.key}`, i = Ln.includes(t.key);
			if (typeof t.value != "string" || !Mn.test(t.value)) throw Error(`${n}：值的寫法不在允許清單內（內部檢查）`);
			if (i ? typeof t.method != "string" || !jn.test(t.method) : t.method !== null) throw Error(`${n}：方法不符（內部檢查）`);
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
		od(e, o, a);
		let c = a.window, l = (e, r, l) => {
			let u = r.map((e) => s.get(e)).filter((e) => !!e);
			if (!u.length) return;
			let d = [.../* @__PURE__ */ new Set([...u.map((e) => e.page), a.windowPage])].sort((e, t) => e - t), f = td(d);
			if (i.has(f)) throw Error("工作表名稱重複（內部檢查）");
			i.add(f);
			let p = sd();
			cd(p, t, a, c), l(p, u), n.push({
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
		l("noise", Ln, (e, t) => {
			if (a.zone === null) throw Error(`第 ${o + 1} 站：管制區類別不明，不能寫噪音表（內部檢查）`);
			let n = new Set(t.map((e) => e.method));
			if (e[M.methodCell[0]][M.methodCell[1]] = M.methodLabel + t[0].method, n.size !== 1) throw Error(`第 ${o + 1} 站：噪音三列的方法不同，不能寫進同一格（內部檢查）`);
			a.reportNo && (e[M.reportCell[0]][M.reportCell[1]] = M.reportLabel + a.reportNo);
			let r = En[a.zone];
			Ln.forEach((t, n) => {
				e[M.labelRow][n] = r[n], e[M.valueRow][n] = s.get(t)?.value ?? "";
			});
		}), l("vib", Rn, (e) => {
			Rn.forEach((t, n) => {
				e[M.labelRow + n][0] = Vn[t], e[M.labelRow + n][1] = s.get(t)?.value ?? "";
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
function ud(e, t) {
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
var dd = {
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
}, fd = (e) => e == null ? "" : String(e), pd = (e) => String(e).padStart(2, "0"), md = (e) => e.replace(/\.0$/, "");
function hd(e) {
	let t = (e, t, n) => `${e}-${pd(t)}-${pd(n)}`, n = /* @__PURE__ */ new Date(Date.UTC(e.end.rocYear + 1911, e.end.month - 1, e.end.day, e.end.hour, e.end.minute) - 6e4);
	return {
		dateStart: t(e.start.rocYear + 1911, e.start.month, e.start.day),
		timeStart: `${pd(e.start.hour)}:${pd(e.start.minute)}:00`,
		dateEnd: t(n.getUTCFullYear(), n.getUTCMonth() + 1, n.getUTCDate()),
		timeEnd: `${pd(n.getUTCHours())}:${pd(n.getUTCMinutes())}:00`
	};
}
async function gd(e, t, n) {
	let r = e?.ImportEngine?.readWorkbookGrids, i = e?.SmartParse?.parseSheet, a = e?.SmartParse?.parseWorkbook, o = e?.SmartParse?.extractMethodCode;
	if (typeof r != "function" || typeof i != "function" || typeof a != "function" || typeof o != "function") return {
		ok: !1,
		problems: [dd.noUpstream],
		rows: null
	};
	let s = [], c = {};
	try {
		let l = await r.call(e.ImportEngine, t), u = l && typeof l == "object" ? Object.keys(l) : [], d = n.sheets.map((e) => e.name);
		(u.length !== d.length || d.some((e) => !u.includes(e))) && s.push(dd.sheets);
		for (let t of n.sheets) {
			let r = l?.[t.name];
			if (!r) continue;
			let a = i.call(e.SmartParse, "noise", t.name, r, { allowAutoDetect: !1 }), u = Array.isArray(a) ? a : [];
			c[t.name] = u;
			let d = t.name, f = new Map(t.values.map((e) => [Hn[e.key], e])), p = u.map((e) => fd(e.監測時段));
			if (!u.length || p.length !== f.size || new Set(p).size !== p.length || p.some((e) => !f.has(e))) {
				s.push(dd.tods(d));
				continue;
			}
			let m = hd(t.window), h = /* @__PURE__ */ new Set(), g = t.kind === "vib";
			for (let r of u) {
				let i = f.get(fd(r.監測時段)), a = i.key;
				fd(r.監測數值) !== md(i.value) && s.push(dd.value(d, a)), r._secondaryItem === !0 && s.push(dd.secondary(d, a));
				let c = g ? N.vib.method : i.method ? o.call(e.SmartParse, i.method) : "\0";
				fd(r.監測方法) !== c && s.push(dd.method(d, a));
				let l = g ? [
					N.vib.unit,
					N.vib.category,
					a === "Lv10日" ? N.vib.featureDay : N.vib.featureNight,
					N.vib.standard,
					N.vib.zone
				] : [
					N.noise.unit,
					N.noise.category,
					N.noise.feature,
					N.noise.standard,
					N.noise.zone
				];
				[
					r.監測單位,
					r.檢測類別,
					r.音源發聲特性,
					r.管制標準,
					r.管制區
				].map(fd).some((e, t) => e !== l[t]) && s.push(dd.fixed(d, a)), (fd(r["日期(起)"]) !== m.dateStart || fd(r["時間(起)"]) !== m.timeStart || fd(r["日期(迄)"]) !== m.dateEnd || fd(r["時間(迄)"]) !== m.timeEnd) && h.add("date"), fd(r.監測地點).trim() !== t.location.trim() && h.add("site"), fd(r.檢測機構許可證號) !== n.agency.code && h.add("agency"), (fd(r._siteCode) !== "" || fd(r.座標系統) !== "" || fd(r["採樣座標-經度 X"]) !== "" || fd(r["採樣座標-緯度 Y"]) !== "") && h.add("siteCode");
			}
			h.has("date") && s.push(dd.date(d)), h.has("site") && s.push(dd.site(d)), h.has("agency") && s.push(dd.agency(d)), h.has("siteCode") && s.push(dd.siteCode(d));
		}
		let f = a.call(e.SmartParse, "noise", l), p = Array.isArray(f?.rows) ? f.rows : [], m = n.sheets.reduce((e, t) => e + t.values.length, 0);
		p.length !== m && s.push(dd.wbRows(p.length, m));
		let h = Object.keys(f?.sites ?? {}).length, g = new Set(n.sheets.map((e) => e.station)).size;
		h !== g && s.push(dd.stations(h, g)), p.some((e) => fd(e.檢測機構許可證號) === "") && s.push(dd.wbAgency);
	} catch {
		return {
			ok: !1,
			problems: [...s, dd.crashed],
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
//#region src/xdwread/sheet.ts
var _d = {
	site: "採樣地點：",
	time: "採樣時間：",
	category: "樣品特性：",
	agency: "採樣單位：",
	reportNo: "報告編號："
}, vd = [
	"檢驗項目",
	"檢測值",
	"偵測極限",
	"單位",
	"檢測方法"
], yd = "以下空白", bd = (e) => String(e).padStart(2, "0"), xd = (e) => `${e.rocYear + 1911}-${bd(e.month)}-${bd(e.day)}`, Sd = (e) => `${bd(e.hour)}:${bd(e.minute)}:00`, Cd = (e) => `p${String(e).padStart(2, "0")}`;
function wd(e) {
	let t = ht[j(e)];
	return t === void 0 ? e : t;
}
function Td(e, t) {
	let n = j(e), r = j(t), i = gt.find((e) => e.item === n && e.from === r);
	return i ? i.to : t;
}
var Ed = (e) => typeof e == "string";
function Dd(e, t, n) {
	let r = `第 ${e} 頁第 ${t + 1} 列`;
	if (!n || ![
		n.item,
		n.unit,
		n.result,
		n.mdl,
		n.method
	].every(Ed)) throw Error(`${r}：寫入內容不完整（內部檢查）`);
	if (n.level !== void 0) {
		if (j(n.item) !== "水位") throw Error(`${r}：只有水位列可以用水位的寫法（內部檢查）`);
		if (n.level === "remark" && (n.result !== "" || n.method !== "" || !Ed(n.remark) || n.remark.trim() === "")) throw Error(`${r}：水位備註列的內容不對（內部檢查）`);
		if (n.level === "method" && n.method !== "NIEA W103") throw Error(`${r}：水位方法不對（內部檢查）`);
		if (n.level !== "remark" && n.level !== "method") throw Error(`${r}：水位寫法不對（內部檢查）`);
	}
	if (n.level !== "remark" && !It.test(n.result)) throw Error(`${r}：檢測結果的寫法不在允許清單內（內部檢查）`);
	if (n.mdl !== "" && !Lt.test(n.mdl)) throw Error(`${r}：MDL 的寫法不在允許清單內（內部檢查）`);
	if (n.item.trim() === "") throw Error(`${r}：項目名稱空白（內部檢查）`);
}
function Od(e, t) {
	let n = [], r = [], i = [], a = [], o = /* @__PURE__ */ new Set(), s = [], c = [], l = [], u = Array.isArray(t.manual) ? t.manual : [], d = /* @__PURE__ */ new Map();
	for (let e of u) {
		let t = e && typeof e == "object" ? `${e.page}:${e.index}` : "";
		if (!t || d.has(t)) throw Error("人工輸入有重複或不完整的列（內部檢查）");
		d.set(t, e);
	}
	let f = /* @__PURE__ */ new Set();
	for (let u of e.pages) {
		let e = Uu(u, t).sampleName;
		if (u.status === "skip") {
			a.push({
				page: u.page,
				index: null,
				sampleName: e,
				item: "",
				reason: u.reasons[0] ?? "這頁沒有送出"
			});
			continue;
		}
		let p = u.status === "ok" && u.mode === "whole" && u.identity !== null, m = [];
		!p && u.rows.length === 0 && a.push({
			page: u.page,
			index: null,
			sampleName: e,
			item: "",
			reason: u.reasons[0] ?? "整頁需人工輸入"
		});
		for (let t of u.rows) {
			let n = `${u.page}:${t.index}`, o = d.get(n);
			if (o) {
				f.add(n);
				let a = ms(u, t, o);
				if (!a.ok) throw Error(`第 ${u.page} 頁第 ${t.index + 1} 列：人工輸入不合格（${a.reasons.join("；")}）（內部檢查）`);
				let c = a.cells, l = {
					item: c.item,
					unit: c.unit,
					result: c.result,
					mdl: c.mdl,
					method: c.method
				};
				Dd(u.page, t.index, l);
				let d = wd(l.item), p = Td(l.item, l.unit);
				d !== l.item && r.push({
					page: u.page,
					index: t.index,
					from: l.item,
					to: d
				}), p !== l.unit && i.push({
					page: u.page,
					index: t.index,
					from: l.unit,
					to: p
				}), m.push({
					page: u.page,
					index: t.index,
					out: l,
					source: "manual",
					cells: {
						item: d,
						result: l.result,
						mdl: l.mdl,
						unit: p,
						method: l.method
					}
				}), s.push({
					page: u.page,
					index: t.index,
					sampleName: e,
					item: c.item,
					cells: { ...c },
					inXlsx: !0
				});
				continue;
			}
			if (!p || t.status !== "pass" || !t.out) {
				a.push({
					page: u.page,
					index: t.index,
					sampleName: e,
					item: t.expected,
					reason: t.reasons[0] ?? (p ? "需人工輸入" : u.reasons[0] ?? "整頁需人工輸入")
				});
				continue;
			}
			Dd(u.page, t.index, t.out);
			let l = wd(t.out.item), h = Td(t.out.item, t.out.unit);
			l !== t.out.item && r.push({
				page: u.page,
				index: t.index,
				from: t.out.item,
				to: l
			}), h !== t.out.unit && i.push({
				page: u.page,
				index: t.index,
				from: t.out.unit,
				to: h
			});
			let g = t.out.level === "remark" ? ar : t.out.result;
			m.push({
				page: u.page,
				index: t.index,
				out: { ...t.out },
				source: "read",
				cells: {
					item: l,
					result: g,
					mdl: t.out.mdl,
					unit: h,
					method: t.out.method
				}
			}), t.out.level && c.push({
				sheet: Cd(u.page),
				page: u.page,
				index: t.index,
				sampleName: e,
				kind: t.out.level,
				remark: t.out.level === "remark" ? t.out.remark ?? "" : ""
			});
		}
		if (!p || m.length === 0) continue;
		let h = u.identity, g = Cd(u.page);
		if (o.has(g)) throw Error(`第 ${u.page} 頁重複（內部檢查）`);
		o.add(g);
		let _ = [
			[_d.site, h.sampleName],
			[_d.time, h.sampleTime],
			[_d.category, t.category],
			[_d.agency, t.agency.name],
			[_d.reportNo, h.reportNo],
			[],
			[...vd],
			...m.map((e) => [
				e.cells.item,
				e.cells.result,
				e.cells.mdl,
				e.cells.unit,
				e.cells.method
			]),
			[yd]
		];
		n.push({
			name: g,
			page: u.page,
			identity: {
				...h,
				date: { ...h.date }
			},
			rows: m,
			aoa: _
		});
		let v = h.receive, y = {
			sheet: g,
			page: u.page,
			sampleName: e,
			rows: m.length,
			startDate: xd(h.date),
			startTime: Sd(h.date)
		};
		l.push(v && v.ok ? {
			...y,
			ok: !0,
			endDate: xd(v.date),
			endTime: Sd(v.date),
			raw: v.raw
		} : {
			...y,
			ok: !1,
			reason: v ? v.reason : "沒有核對收樣日期"
		});
	}
	if (f.size !== d.size) throw Error("人工輸入有對不到可輸入列的紀錄（內部檢查）");
	let p = n.flatMap((e) => e.rows), m = p.filter((e) => e.source === "manual").length;
	return {
		xdwFileName: t.fileName,
		category: t.category,
		agency: { ...t.agency },
		period: { ...t.period },
		sheets: n,
		total: p.length,
		itemRenames: r,
		unitRenames: i,
		excluded: a,
		readCount: p.length - m,
		manualIn: m,
		manual: s,
		levels: c.filter((e) => o.has(e.sheet)),
		ends: l
	};
}
function kd(e, t) {
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
function Ad(e, t) {
	return `${e.replace(/\.xdw$/i, "") || "XDW"}（Claude讀值 ${`${t.getFullYear()}${bd(t.getMonth() + 1)}${bd(t.getDate())}-${bd(t.getHours())}${bd(t.getMinutes())}${bd(t.getSeconds())}`}）.xlsx`;
}
function jd(e) {
	let t = e.levels.filter((e) => e.kind === "remark");
	if (!t.length) return {
		plan: e,
		removed: []
	};
	let n = (e, n) => n.source === "read" && n.out.level === "remark" && t.some((t) => t.sheet === e.name && t.index === n.index), r = [], i = 0;
	for (let t of e.sheets) {
		if (t.aoa.length !== 7 + t.rows.length + 1 || t.aoa[6].join("\0") !== vd.join("\0") || t.aoa[t.aoa.length - 1][0] !== "以下空白") throw Error(`第 ${t.page} 頁的 xlsx 內容和預期的形狀不同（內部檢查）`);
		let e = t.rows.map((e, n) => ({
			r: e,
			line: t.aoa[7 + n]
		})).filter((e) => !n(t, e.r));
		if (i += t.rows.length - e.length, e.length) {
			if (e.length === t.rows.length) {
				r.push(t);
				continue;
			}
			r.push({
				...t,
				rows: e.map((e) => e.r),
				aoa: [
					...t.aoa.slice(0, 7),
					...e.map((e) => e.line),
					t.aoa[t.aoa.length - 1]
				]
			});
		}
	}
	if (i !== t.length) throw Error("沒量到的水位列對不回 xlsx 的列（內部檢查）");
	let a = new Set(r.map((e) => e.name)), o = r.flatMap((e) => e.rows), s = o.filter((e) => e.source === "manual").length;
	return {
		plan: {
			...e,
			sheets: r,
			total: o.length,
			readCount: o.length - s,
			manualIn: s,
			levels: e.levels.filter((e) => e.kind !== "remark" && a.has(e.sheet)),
			ends: (e.ends ?? []).filter((e) => a.has(e.sheet)).map((e) => ({
				...e,
				rows: r.find((t) => t.name === e.sheet).rows.length
			}))
		},
		removed: t
	};
}
//#endregion
//#region src/xdwread/sheet-air.ts
var Md = (e) => String(e).padStart(2, "0"), Nd = (e) => e.map((e) => `p${Md(e)}`).join("_"), Pd = (e) => `${e.start.month}/${e.start.day} ~ ${e.end.month}/${e.end.day}`, Fd = (e) => [`${Md(e.start.hour)} ~ ${Md((e.start.hour + 1) % 24)}`, `${Md((e.end.hour + 23) % 24)} ~ ${Md(e.end.hour)}`];
function Id(e) {
	let t = /^(\d{3})\.(\d{2})\.(\d{2})$/.exec(e);
	if (!t) throw Error("收樣日期寫法不符（內部檢查）");
	return `${t[1]}年${t[2]}月${t[3]}日`;
}
var Ld = 24 * 36e5, Rd = (e) => Date.UTC(e.rocYear + 1911, e.month - 1, e.day, e.hour, e.minute);
function zd(e, t, n) {
	let r = `第 ${t + 1} 站`, i = n.window;
	if (!i || n.windowPage === null || !n.receiveDate) throw Error(`${r}：沒有時間窗或收樣日期（內部檢查）`);
	if (i.start.minute !== 0 || i.end.minute !== 0 || Rd(i.end) - Rd(i.start) !== Ld) throw Error(`${r}：時間窗不是整點 24 小時（內部檢查）`);
	if (Number(n.receiveDate.split(".")[0]) !== i.start.rocYear) throw Error(`${r}：收樣日期的年和時間窗不同（內部檢查）`);
	let a = e.pages.find((e) => e.page === n.windowPage);
	if (!a || a.status !== "ok" || a.station !== t) throw Error(`${r}：時間窗來源頁沒有通過（內部檢查）`);
	if (typeof n.location != "string" || n.location.trim() === "") throw Error(`${r}：測站空白（內部檢查）`);
}
function Bd(e, t) {
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
			if (typeof t.value != "string" || !mo.test(t.value)) throw Error(`${n}：值的寫法不在允許清單內（內部檢查）`);
			if (typeof t.method != "string" || !po.test(t.method)) throw Error(`${n}：方法的寫法不在允許清單內（內部檢查）`);
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
		zd(e, o, a);
		let c = a.window, l = [.../* @__PURE__ */ new Set([...s.map((e) => e.page), a.windowPage])].sort((e, t) => e - t), u = Nd(l);
		if (i.has(u)) throw Error("工作表名稱重複（內部檢查）");
		i.add(u);
		let d = new Map(s.map((e) => [e.key, e])), f = Array.from({ length: I.rows }, () => Array(I.cols).fill("")), p = ([e, t], n) => {
			f[e][t] = n;
		};
		p(I.titleCell, I.title), p(I.agencyCell, I.agencyLabel + t.agency.name), p(I.receiveCell, I.receiveLabel + Id(a.receiveDate));
		let m = [a.reportNos.L1, a.reportNos.L2].filter((e) => !!e);
		p(I.reportCell, I.reportLabel + m.join("／")), I.header.forEach((e, t) => p([I.headerRow, I.headerFirstCol + t], e));
		let h = I.unitRow;
		p([h, So.location], a.location), p([h, So.time], Pd(c));
		let g = d.get("PM2.5");
		g && (p([h, So.pm25], g.value), p([h, So.method], g.method));
		let [_, v] = Fd(c);
		p([I.firstHourRow, I.hourCol], _), p([I.lastHourRow, I.hourCol], v);
		let y = d.get("TSP");
		y && p([I.firstHourRow, So.TSP], y.value), p([I.avgRow, 0], I.avgLabel);
		for (let e of Co) {
			let t = d.get(e);
			t && p([I.avgRow, So[e]], t.value);
		}
		let b = (e) => d.has(e) ? d.get(e).method : e === "THC" ? d.get("CH4")?.method ?? d.get("NMHC")?.method ?? null : null, x = wo.map((e) => [e, b(e)]).filter(([, e]) => e !== null).map(([e, t]) => `${e}:${t}`);
		x.length && p([I.methodRow, 0], I.methodPrefix + x.join("/")), n.push({
			name: u,
			station: o,
			siteCode: a.siteCode,
			location: a.location,
			pages: l,
			window: c,
			receiveDate: a.receiveDate,
			reportNos: m,
			values: vo.filter((e) => d.has(e)).map((e) => ({ ...d.get(e) })),
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
function Vd(e, t) {
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
var Hd = {
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
	note: (e, t) => `第 ${e} 頁第 ${t} 列：原網站解析出的備註和預期的不一樣`,
	endTime: (e) => `第 ${e} 頁：原網站解析出的日期(迄)／時間(迄) 不是預期的「和起始相同＋提醒」，收樣時間沒辦法安全帶入`,
	method: (e, t) => `第 ${e} 頁第 ${t} 列：原網站解析出的水位檢測方法和預期的不一樣`
}, Ud = (e) => e.out.level === "remark" ? ar : "", Wd = (e) => e.out.level === "method" ? zt : e.out.level === "remark" ? "" : null;
function Gd(e) {
	let t = /^(\d+)(?:\.(\d+))?$/.exec(e);
	if (!t) return null;
	let n = t[1].replace(/^0+(?=\d)/, ""), r = (t[2] ?? "").replace(/0+$/, "");
	return r ? `${n}.${r}` : n;
}
function Kd(e) {
	if (e === "ND") return {
		cmp: "ND",
		value: ""
	};
	if (e.startsWith("<")) {
		let t = Gd(e.slice(1));
		return t === null ? null : {
			cmp: "<",
			value: t
		};
	}
	let t = Gd(e);
	return t === null ? null : {
		cmp: "",
		value: t
	};
}
var qd = (e) => e === "" ? "" : Gd(e), Jd = (e) => e == null ? "" : String(e), Yd = (e) => String(e).padStart(2, "0");
async function Xd(e, t, n) {
	let r = e?.ImportEngine?.readWorkbookGrids, i = e?.SmartParse?.parseSheet;
	if (typeof r != "function" || typeof i != "function") return {
		ok: !1,
		problems: [Hd.noUpstream],
		rows: null
	};
	let a = [], o = {};
	try {
		let s = await r.call(e.ImportEngine, t), c = s && typeof s == "object" ? Object.keys(s) : [], l = n.sheets.map((e) => e.name);
		(c.length !== l.length || l.some((e) => !c.includes(e))) && a.push(Hd.sheets);
		for (let t of n.sheets) {
			let r = s?.[t.name];
			if (!r) continue;
			let c = i.call(e.SmartParse, "water", t.name, r, { allowAutoDetect: !1 }), l = Array.isArray(c) ? c : [];
			o[t.name] = l;
			let u = t.page;
			if (!l.length) {
				a.push(Hd.noRows(u));
				continue;
			}
			if (l.length !== t.rows.length) {
				a.push(Hd.count(u, t.rows.length, l.length));
				continue;
			}
			let d = t.identity.date, f = `${d.rocYear + 1911}-${Yd(d.month)}-${Yd(d.day)}`, p = `${Yd(d.hour)}:${Yd(d.minute)}`, m = /* @__PURE__ */ new Set(), h = (n.ends ?? []).some((e) => e.sheet === t.name && e.ok);
			t.rows.forEach((e, r) => {
				let i = l[r], o = e.index + 1;
				Jd(i.檢測項目) !== e.cells.item && a.push(Hd.item(u, o));
				let s = e.out.level === "remark" ? e.cells.result === "未檢測" ? {
					cmp: "",
					value: ""
				} : null : Kd(e.cells.result);
				(!s || Jd(i.比較關係) !== s.cmp || Jd(i.檢測數值) !== s.value) && a.push(Hd.value(u, o));
				let c = qd(e.cells.mdl);
				(c === null || Jd(i.檢測極限) !== c) && a.push(Hd.mdl(u, o)), Jd(i.備註) !== Ud(e) && a.push(Hd.note(u, o));
				let d = Wd(e);
				d !== null && Jd(i.檢測方法) !== d && a.push(Hd.method(u, o)), Jd(i.檢測類別) !== n.category.trim() && m.add("category"), Jd(i.檢測機構許可證號) !== n.agency.code && m.add("agency");
				let g = Jd(i["時間(起)"]);
				if ((Jd(i["日期(起)"]) !== f || g !== `${p}:00`) && m.add("date"), Jd(i.採樣地點).trim() !== t.identity.sampleName.trim() && m.add("site"), h) {
					let e = i._checkFields;
					(Jd(i["日期(迄)"]) !== f || Jd(i["時間(迄)"]) !== `${p}:00` || !e || typeof e != "object" || e["時間(迄)"] !== "報告只寫了採樣起始時間，沒有結束時間。時間(迄) 先填成和時間(起) 相同，請依實際採樣結束時間修改。") && m.add("end");
				}
			}), m.has("category") && a.push(Hd.category(u)), m.has("agency") && a.push(Hd.agency(u)), m.has("date") && a.push(Hd.date(u)), m.has("site") && a.push(Hd.site(u)), m.has("end") && !m.has("date") && a.push(Hd.endTime(u));
		}
	} catch {
		return {
			ok: !1,
			problems: [...a, Hd.crashed],
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
var Zd = {
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
	category: (e) => `工作表 ${e}：原網站解析出的檢測類別不是「${To}」`
}, Qd = (e) => e == null ? "" : String(e), $d = (e) => String(e).padStart(2, "0"), ef = (e) => `${e.rocYear + 1911}-${$d(e.month)}-${$d(e.day)}`;
function tf(e) {
	let t = /* @__PURE__ */ new Date(Date.UTC(e.end.rocYear + 1911, e.end.month - 1, e.end.day, e.end.hour, e.end.minute) - 6e4);
	return {
		dateStart: ef(e.start),
		timeStart: `${$d(e.start.hour)}:${$d(e.start.minute)}:00`,
		dateEnd: `${t.getUTCFullYear()}-${$d(t.getUTCMonth() + 1)}-${$d(t.getUTCDate())}`,
		timeEnd: `${$d(t.getUTCHours())}:${$d(t.getUTCMinutes())}:00`
	};
}
async function nf(e, t, n) {
	let r = e?.ImportEngine?.readWorkbookGrids, i = e?.SmartParse?.parseSheet, a = e?.SmartParse?.extractMethodCode;
	if (typeof r != "function" || typeof i != "function" || typeof a != "function") return {
		ok: !1,
		problems: [Zd.noUpstream],
		rows: null
	};
	let o = [], s = {};
	try {
		let c = await r.call(e.ImportEngine, t), l = c && typeof c == "object" ? Object.keys(c) : [], u = n.sheets.map((e) => e.name);
		(l.length !== u.length || u.some((e) => !l.includes(e))) && o.push(Zd.sheets);
		for (let t of n.sheets) {
			let r = c?.[t.name];
			if (!r) continue;
			let l = i.call(e.SmartParse, "air", t.name, r, { allowAutoDetect: !1 }), u = Array.isArray(l) ? l : [];
			s[t.name] = u;
			let d = t.name;
			if (!u.length) {
				o.push(Zd.noRows(d));
				continue;
			}
			let f = new Map(t.values.map((e) => [Eo[e.key], e])), p = u.map((e) => Qd(e.檢測項目));
			if (p.length !== f.size || new Set(p).size !== p.length || p.some((e) => !f.has(e))) {
				o.push(Zd.items(d));
				continue;
			}
			let m = tf(t.window), h = /* @__PURE__ */ new Set();
			for (let r of u) {
				let i = f.get(Qd(r.檢測項目)), s = i.key;
				r._statKind !== "avg" && o.push(Zd.stat(d, s));
				let c = Gd(i.value);
				(c === null || Qd(r.比較關係) !== "" || Qd(r.檢測數值) !== c) && o.push(Zd.value(d, s)), (!i.method || Qd(r.檢測方法) !== a.call(e.SmartParse, i.method)) && o.push(Zd.method(d, s)), Qd(r["檢測濃度/質量單位"]) !== Do[s] && o.push(Zd.unit(d, s)), Qd(r.備註) !== "" && o.push(Zd.note(d, s)), (Qd(r["日期(起)"]) !== m.dateStart || Qd(r["時間(起)"]) !== m.timeStart || Qd(r["日期(迄)"]) !== m.dateEnd || Qd(r["時間(迄)"]) !== m.timeEnd) && h.add("date"), Qd(r.採樣地點).trim() !== t.location.trim() && h.add("site"), Qd(r.檢測機構許可證號) !== n.agency.code && h.add("agency"), Qd(r.檢測類別) !== "周界空氣品質" && h.add("category");
			}
			h.has("date") && o.push(Zd.date(d)), h.has("site") && o.push(Zd.site(d)), h.has("agency") && o.push(Zd.agency(d)), h.has("category") && o.push(Zd.category(d));
		}
	} catch {
		return {
			ok: !1,
			problems: [...o, Zd.crashed],
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
var rf = [
	"btnImport",
	"importFileInput",
	"btnImportStagedConfirm",
	"btnImportConfirm"
], W = {
	button: "送進匯入確認畫面",
	ready: "會先自我檢查（用原網站自己的解析程式試讀一次），相符才交給原網站的匯入確認畫面",
	why: {
		noLog: "還沒有讀值結果",
		noPass: "沒有任何通過核對或人工輸入確認的列，沒有東西可以送",
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
	fallbackHead: (e) => `⚠️ 下載的 xlsx 不含沒量到水位的 ${e} 列（報告備註原文與「檢測方法留空」只有自動送件帶得進去）；這幾列請手動輸入：`,
	fallbackRow: (e, t, n, r) => `・${e}｜第 ${t} 頁｜${n}｜水位｜備註「${r}」｜檢測數值空白、檢測方法留空`,
	fallbackLog: "讀值紀錄已記下這幾列改人工；按「下載這份 xlsx」時會一起下載讀值紀錄。",
	fallbackEndHead: "手動匯入這份檔時，時間(迄) 不會自動帶入收樣時間（原網站會填成和時間(起) 相同），請照下表修改：",
	fallbackEndRow: (e, t, n, r, i) => `・${e}｜第 ${t} 頁｜${n}｜日期(迄) ${r}｜時間(迄) ${i.slice(0, 5)}`,
	fallbackEndMiss: (e, t, n) => `・${e}｜第 ${t} 頁｜${n}｜收樣日期沒有通過核對，請看報告的收樣日期`,
	fallbackFail: (e) => `沒有提供下載：重新產生不含沒量到水位列的 xlsx 失敗（${e}）。請重新送件，或照報告在原網站手動輸入。`,
	download: "下載這份 xlsx",
	logFail: (e) => `讀值紀錄無法自動下載：${e}；沒有送出`,
	levelMethodLock: (e) => `第 ${e} 頁：沒量到的水位列「檢測方法留空、不套用原網站記憶」的自我檢查不符`,
	endFill: (e) => `第 ${e} 頁：時間(迄) 換成收樣日期的自我檢查不符（原網站解析出的列不是預期的樣子）`,
	levelFill: (e) => `第 ${e} 頁：水位備註換成報告原文的自我檢查不符（原網站解析出的那一列不是預期的樣子）`
};
function af(e, t) {
	let n = gs(t.pages, Array.isArray(e.manual) ? e.manual : []);
	return t.totals.pass + n.ok;
}
function of(e) {
	return e.reading ? W.why.reading : e.busy ? W.why.busy : !e.items || !e.items.length || e.items.some((e) => !e.log || !e.v) ? W.why.noLog : e.items.some((e) => af(e.log, e.v) > 0) ? null : W.why.noPass;
}
var sf = (e) => e.pages.filter((e) => e.status === "manual" && e.rows.length === 0).length;
function cf(e, t = []) {
	let n = gs(e.pages, Array.isArray(t) ? t : []);
	return W.confirm(e.totals.manual - n.ok, sf(e), e.totals.pagesSkipped);
}
function lf(e) {
	if (e.length === 1) return cf(e[0].v, e[0].log.manual);
	let t = 0, n = 0, r = 0;
	for (let { v: i, log: a } of e) {
		let e = gs(i.pages, Array.isArray(a.manual) ? a.manual : []);
		t += i.totals.manual - e.ok, n += sf(i), r += i.totals.pagesSkipped;
	}
	let i = W.confirm(t, n, r);
	return i === null ? null : `${e.length} 個檔裡${i}`;
}
function uf(e) {
	return rf.filter((t) => !e.getElementById(t));
}
var df = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤", ff = (e) => !e || e.classList.contains("hidden"), pf = class extends Error {}, mf = (e) => {
	try {
		return e.isCurrent();
	} catch {
		return !1;
	}
};
async function hf(e, t) {
	let n = t.sleep ?? ((e) => new Promise((t) => setTimeout(t, e))), r = t.timeoutMs ?? 15e3;
	for (let i = 0; i <= r; i += 100) {
		if (!mf(t)) throw new pf();
		try {
			if (e()) return !0;
		} catch {}
		await n(100);
	}
	if (!mf(t)) throw new pf();
	try {
		return e();
	} catch {
		return !1;
	}
}
var G = {
	file: (e, t) => `檔「${e}」：${t}`,
	preflightFile: (e) => `檔「${e}」：`,
	stagedCount: (e, t) => e > t ? `檔案沒有進到原網站的待匯入清單：原網站的待匯入清單裡不只這 ${t} 個檔，請關掉匯入視窗後再按一次` : `檔案沒有進到原網站的待匯入清單：清單裡少了這次的檔（${e}／${t}），請關掉匯入視窗後再按一次`,
	stagedName: "檔案沒有進到原網站的待匯入清單：清單裡的檔名和這次的 xlsx 對不上，請關掉匯入視窗後再按一次"
};
async function gf(e, t) {
	let n = e.length > 1, r = /* @__PURE__ */ new Map(), i = null, a = (t, n, a = []) => {
		if (!a.length) return {
			ok: !1,
			stage: t,
			messages: n,
			xlsx: null
		};
		let o = vf(a, r, i, e.map((e) => e.log.fileName));
		if (!o.ok) return {
			ok: !1,
			stage: t,
			messages: [...n.filter((e) => e !== W.fallback), o.message],
			xlsx: null,
			xlsxList: []
		};
		let s = {
			ok: !1,
			stage: t,
			messages: [...n, ...o.messages],
			xlsx: o.list[0] ?? null,
			xlsxList: o.list
		};
		return o.rows.length && (s.fallbackRows = o.rows), s;
	}, o = of({
		items: e,
		busy: !1
	});
	if (o) return a("disabled", [o]);
	let s = Dl(e.map((e) => e.log), t.agencyCodes ? t.agencyCodes() : Ol());
	if (s !== null && !t.confirm(s)) return a("cancel", []);
	let c = lf(e);
	if (c !== null && !t.confirm(c)) return a("cancel", []);
	t.onStage?.(W.working);
	let l = [];
	for (let { v: t, log: r } of e) try {
		l.push(Od(t, r));
	} catch (e) {
		return a("plan", [W.planFail(n ? G.file(r.fileName, df(e)) : df(e))]);
	}
	let u = t.upstream(), d = u?.XLSX;
	if (!d || typeof d.write != "function" || !d.utils) return a("xlsx", [W.noXlsx]);
	i = d;
	let f = t.now(), p = [];
	for (let t = 0; t < e.length; t++) {
		if (l[t].total <= 0) continue;
		let i = Ad(e[t].log.fileName, f);
		try {
			let e = {
				name: i,
				bytes: kd(l[t], d)
			};
			r.set(e, {
				plan: l[t],
				i: t
			}), p.push({
				i: t,
				x: e
			});
		} catch (r) {
			return a("xlsx", [W.xlsxFail(n ? G.file(e[t].log.fileName, df(r)) : df(r))], p.map((e) => e.x));
		}
	}
	let m = p.map((e) => e.x);
	if (!p.length) return a("disabled", [W.why.noPass]);
	let h = (e) => e.bytes.slice().buffer, g = /* @__PURE__ */ new Map(), _ = [];
	for (let { i: r, x: i } of p) {
		let o = await Xd(u, {
			name: i.name,
			arrayBuffer: async () => h(i)
		}, l[r]);
		if (!mf(t)) return t.clearPending(), a("cancel", []);
		o.ok ? g.set(r, o.rows) : n ? _.push(G.preflightFile(e[r].log.fileName) + o.problems.join("；")) : _.push(...o.problems);
	}
	if (_.length) return a("preflight", [
		W.preflightHead,
		..._,
		W.fallback
	], m);
	for (let [t, r] of g) {
		let i = l[t].levels.filter((e) => e.kind === "remark"), a = (l[t].ends ?? []).filter((e) => e.ok);
		if (!i.length && !a.length) continue;
		let o = Object.fromEntries(Object.entries(r).map(([e, t]) => [e, t.map((e) => {
			let t = { ...e };
			return e._checkFields && typeof e._checkFields == "object" && (t._checkFields = { ...e._checkFields }), t;
		})]));
		for (let r of a) {
			if (!r.ok) continue;
			let i = o[r.sheet] ?? [], a = nr(i, [r], () => r.sheet);
			a.length === r.rows * 2 && i.length === r.rows && Yn(a, or) === a.length && i.every((e) => e["日期(迄)"] === r.endDate && e["時間(迄)"] === r.endTime && !(e._checkFields && "時間(迄)" in e._checkFields)) || _.push((n ? G.preflightFile(e[t].log.fileName) : "") + W.endFill(r.page));
		}
		for (let r of i) {
			let i = ir(o[r.sheet] ?? [], [{
				sheet: r.sheet,
				remark: r.remark
			}], () => r.sheet);
			if (i.length !== 1) {
				_.push((n ? G.preflightFile(e[t].log.fileName) : "") + W.levelFill(r.page));
				continue;
			}
			i[0].row[i[0].field] = i[0].value, _f(i[0].row) || _.push((n ? G.preflightFile(e[t].log.fileName) : "") + W.levelMethodLock(r.page));
		}
		g.set(t, o);
	}
	if (_.length) return a("preflight", [
		W.preflightHead,
		..._,
		W.fallback
	], m);
	let v = uf(t.doc);
	if (v.length) return a("env", [W.missing(v), W.fallback], m);
	if (!t.waterReady()) return a("env", [W.notWater, W.fallback], m);
	if (!mf(t)) return t.clearPending(), a("cancel", []);
	try {
		if (n) {
			let n = dl(e.map((e) => e.log), f.toISOString());
			t.download(new Blob([fl(n)], { type: "application/json" }), Bu(e.length, f));
		} else t.download(new Blob([Gc(e[0].log)], { type: "application/json" }), zu(e[0].log.fileName, f));
	} catch (e) {
		return a("log", [W.logFail(df(e))], m);
	}
	t.onStage?.(W.sending);
	let y = m.map((e) => e.name), b = y.join("、");
	t.setPending({ files: e.map((e, t) => {
		let n = p.find((e) => e.i === t);
		return {
			xdwFileName: e.log.fileName,
			fileName: n ? n.x.name : null,
			plan: l[t],
			preflightRows: n ? g.get(t) ?? {} : {},
			levelRemarks: l[t].levels.filter((e) => e.kind === "remark").map((e) => ({
				sheet: e.sheet,
				remark: e.remark
			}))
		};
	}) });
	let x = t.doc, S = !1, C = () => {
		if (!mf(t)) throw new pf();
	};
	try {
		C();
		let e = x.defaultView, r = e?.File ?? File, i = e?.DataTransfer ?? DataTransfer;
		if (x.getElementById("btnImport").click(), !await hf(() => !ff(x.getElementById("importModal")), t)) throw Error(W.steps.modal);
		C();
		let a = x.getElementById("importFileInput");
		if (!a) throw Error(W.steps.staged);
		let o = new i();
		for (let e of m) o.items.add(new r([h(e)], e.name, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
		a.files = o.files, a.dispatchEvent(new Event("change", { bubbles: !0 }));
		let s = x.getElementById("btnImportStagedConfirm"), c = x.getElementById("importStagedList");
		if (!await hf(() => !ff(s) && (!c || y.every((e) => (c.textContent ?? "").includes(e))), t)) throw Error(W.steps.staged);
		let l = c ? c.querySelectorAll(".staged-file-item") : null, u = l ? l.length : 0;
		if (n) {
			if (u !== m.length) throw Error(G.stagedCount(u, m.length));
			let e = [...l ?? []].map((e) => (e.querySelector(".staged-file-name")?.textContent ?? "").replace(/^\s*📄\s*/u, "").trim());
			if (e.length !== y.length || e.some((e) => !y.includes(e)) || new Set(e).size !== e.length) throw Error(G.stagedName);
		} else if (u !== 1) throw Error(W.steps.stagedNotOne(u));
		if (C(), s.click(), S = !0, !await hf(() => {
			let e = t.importState(), n = x.getElementById("smartImportSummary");
			return !!e && e.label === b && e.mode === "smart" && Array.isArray(e.rows) && !!n && (n.textContent ?? "") !== "";
		}, t)) throw Error(W.steps.preview);
	} catch (e) {
		return S || t.clearPending(), e instanceof pf ? a("cancel", []) : a("dom", [W.stepFail(df(e)), W.fallback], m);
	}
	return mf(t) ? (t.closeModal(), {
		ok: !0,
		fileName: b,
		plan: l[p[0].i],
		files: p.map((e) => ({
			fileName: e.x.name,
			plan: l[e.i]
		}))
	}) : a("cancel", []);
}
function _f(e) {
	let t = { ...e }, n = !1, r = dr(t, () => n);
	if (!r) return !1;
	t[sr] = "NIEA W103";
	let i = t[sr] === "";
	n = !0, r();
	let a = Object.getOwnPropertyDescriptor(t, sr);
	return i && !!a && "value" in a && a.value === "" && a.writable === !0 && JSON.stringify(t) === JSON.stringify({ ...e });
}
function vf(e, t, n, r) {
	try {
		let i = [], a = [], o = [], s = [];
		for (let c of e) {
			let e = t.get(c);
			if (!e) throw Error("找不到這份 xlsx 的內容（內部檢查）");
			let { plan: l, removed: u } = jd(e.plan);
			if (l.total > 0) {
				let t = r[e.i] ?? e.plan.xdwFileName;
				for (let e of l.ends ?? []) s.push(e.ok ? W.fallbackEndRow(t, e.page, e.sampleName, e.endDate, e.endTime) : W.fallbackEndMiss(t, e.page, e.sampleName));
			}
			if (!u.length) {
				i.push(c);
				continue;
			}
			if (!n) throw Error("找不到原網站的 Excel 函式庫");
			for (let t of u) o.push({
				fileIndex: e.i,
				page: t.page,
				index: t.index
			}), a.push(W.fallbackRow(r[e.i] ?? e.plan.xdwFileName, t.page, t.sampleName, t.remark));
			l.total > 0 && i.push({
				name: c.name,
				bytes: kd(l, n)
			});
		}
		let c = o.length ? [
			W.fallbackHead(o.length),
			...a,
			W.fallbackLog
		] : [];
		return s.length && c.push(W.fallbackEndHead, ...s), {
			ok: !0,
			list: i,
			messages: c,
			rows: o
		};
	} catch (e) {
		return {
			ok: !1,
			message: W.fallbackFail(df(e))
		};
	}
}
//#endregion
//#region src/xdwread/submit-air.ts
var yf = "你取消勾選，不送出", bf = (e) => e === "你取消勾選，不送出" || e === "預設不送：看起來不是資料頁（封面、目錄、聲明書等）", xf = {
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
}, Sf = (e) => e.pages.filter((e) => e.status === "manual" && e.station === null).length;
function Cf(e) {
	return e.reading ? W.why.reading : e.busy ? W.why.busy : !e.items || !e.items.length || e.items.some((e) => !e.log || !e.v) ? W.why.noLog : e.items.some((e) => e.v.totals.pass > 0) ? null : xf.noPass;
}
function wf(e) {
	let t = 0, n = 0, r = 0, i = 0;
	for (let { v: a, log: o } of e) {
		t += a.totals.manual, n += Sf(a);
		let e = o.pages.filter((e) => e.mode === "skip" && e.reason === "你取消勾選，不送出").length;
		i += e, r += a.totals.pagesSkipped - e;
	}
	let a = xf.confirm(t, n, r, i);
	return a === null || e.length === 1 ? a : `${e.length} 個檔裡：${a}`;
}
var Tf = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
async function Ef(e, t) {
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
	}, i = Cf({
		items: e,
		busy: !1
	});
	if (i) return r("disabled", [i]);
	if (e.some((e) => Uc(e.log) !== "air" || e.log.manual.length !== 0)) return r("plan", [xf.notAirLog]);
	let a = Dl(e.map((e) => e.log), t.agencyCodes ? t.agencyCodes() : Ol());
	if (a !== null && !t.confirm(a)) return r("cancel", []);
	let o = wf(e);
	if (o !== null && !t.confirm(o)) return r("cancel", []);
	t.onStage?.(W.working);
	let s = [];
	for (let { v: t, log: i } of e) try {
		s.push(Bd(t, {
			fileName: i.fileName,
			agency: i.agency,
			period: i.period
		}));
	} catch (e) {
		return r("plan", [W.planFail(n ? G.file(i.fileName, Tf(e)) : Tf(e))]);
	}
	let c = t.upstream(), l = c?.XLSX;
	if (!l || typeof l.write != "function" || !l.utils) return r("xlsx", [W.noXlsx]);
	let u = t.now(), d = [];
	for (let t = 0; t < e.length; t++) {
		if (s[t].total <= 0) continue;
		let i = Ad(e[t].log.fileName, u);
		try {
			d.push({
				i: t,
				x: {
					name: i,
					bytes: Vd(s[t], l)
				}
			});
		} catch (i) {
			return r("xlsx", [W.xlsxFail(n ? G.file(e[t].log.fileName, Tf(i)) : Tf(i))], d.map((e) => e.x));
		}
	}
	let f = d.map((e) => e.x);
	if (!d.length) return r("disabled", [xf.noPass]);
	let p = (e) => e.bytes.slice().buffer, m = /* @__PURE__ */ new Map(), h = [];
	for (let { i, x: a } of d) {
		let o = await nf(c, {
			name: a.name,
			arrayBuffer: async () => p(a)
		}, s[i]);
		if (!mf(t)) return t.clearPending(), r("cancel", []);
		o.ok ? m.set(i, o.rows) : n ? h.push(G.preflightFile(e[i].log.fileName) + o.problems.join("；")) : h.push(...o.problems);
	}
	if (h.length) return r("preflight", [
		W.preflightHead,
		...h,
		W.fallback
	], f);
	let g = uf(t.doc);
	if (g.length) return r("env", [W.missing(g), W.fallback], f);
	if (!t.airReady()) return r("env", [xf.notAir, W.fallback], f);
	if (!mf(t)) return t.clearPending(), r("cancel", []);
	try {
		n ? t.download(new Blob([fl(dl(e.map((e) => e.log), u.toISOString()))], { type: "application/json" }), Bu(e.length, u)) : t.download(new Blob([Gc(e[0].log)], { type: "application/json" }), zu(e[0].log.fileName, u));
	} catch (e) {
		return r("log", [W.logFail(Tf(e))], f);
	}
	t.onStage?.(W.sending);
	let _ = f.map((e) => e.name), v = _.join("、");
	t.setPending({
		air: !0,
		files: e.map((e, t) => {
			let n = d.find((e) => e.i === t);
			return {
				xdwFileName: e.log.fileName,
				fileName: n ? n.x.name : null,
				plan: s[t],
				preflightRows: n ? m.get(t) ?? {} : {},
				noData: e.v.pages.filter((e) => e.status === "nodata").map((e) => e.page)
			};
		})
	});
	let y = t.doc, b = !1, x = () => {
		if (!mf(t)) throw new pf();
	};
	try {
		x();
		let e = y.defaultView, r = e?.File ?? File, i = e?.DataTransfer ?? DataTransfer;
		if (y.getElementById("btnImport").click(), !await hf(() => !ff(y.getElementById("importModal")), t)) throw Error(W.steps.modal);
		x();
		let a = y.getElementById("importFileInput");
		if (!a) throw Error(W.steps.staged);
		let o = new i();
		for (let e of f) o.items.add(new r([p(e)], e.name, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
		a.files = o.files, a.dispatchEvent(new Event("change", { bubbles: !0 }));
		let s = y.getElementById("btnImportStagedConfirm"), c = y.getElementById("importStagedList");
		if (!await hf(() => !ff(s) && (!c || _.every((e) => (c.textContent ?? "").includes(e))), t)) throw Error(W.steps.staged);
		let l = c ? c.querySelectorAll(".staged-file-item") : null, u = l ? l.length : 0;
		if (n) {
			if (u !== f.length) throw Error(G.stagedCount(u, f.length));
			let e = [...l ?? []].map((e) => (e.querySelector(".staged-file-name")?.textContent ?? "").replace(/^\s*📄\s*/u, "").trim());
			if (e.length !== _.length || e.some((e) => !_.includes(e)) || new Set(e).size !== e.length) throw Error(G.stagedName);
		} else if (u !== 1) throw Error(W.steps.stagedNotOne(u));
		if (x(), s.click(), b = !0, !await hf(() => {
			let e = t.importState(), n = y.getElementById("smartImportSummary");
			return !!e && e.label === v && e.mode === "smart" && Array.isArray(e.rows) && !!n && (n.textContent ?? "") !== "";
		}, t)) throw Error(W.steps.preview);
	} catch (e) {
		return b || t.clearPending(), e instanceof pf ? r("cancel", []) : r("dom", [W.stepFail(Tf(e)), W.fallback], f);
	}
	return mf(t) ? (t.closeModal(), {
		ok: !0,
		fileName: v,
		plans: s
	}) : r("cancel", []);
}
//#endregion
//#region src/xdwread/submit-noise.ts
var Df = {
	noPass: xf.noPass,
	confirm: xf.confirm,
	notNoise: "沒有送出：目前不在噪音分頁或沒有選計畫（請先回到噪音分頁、選好計畫再按一次）",
	notNoiseLog: "沒有送出：讀值紀錄不是噪音振動的（內部檢查）",
	zoneFill: (e) => `工作表 ${e}：管制區填值的自我檢查不符（噪音列應是報告的類別、振動列應是「無」）`
}, Of = (e) => e.pages.filter((e) => e.status === "manual" && e.station === null).length;
function kf(e) {
	return e.reading ? W.why.reading : e.busy ? W.why.busy : !e.items || !e.items.length || e.items.some((e) => !e.log || !e.v) ? W.why.noLog : e.items.some((e) => e.v.totals.pass > 0) ? null : Df.noPass;
}
function Af(e) {
	let t = 0, n = 0, r = 0, i = 0;
	for (let { v: a, log: o } of e) {
		t += a.totals.manual, n += Of(a);
		let e = o.pages.filter((e) => e.mode === "skip" && e.reason === "你取消勾選，不送出").length;
		i += e, r += a.totals.pagesSkipped - e;
	}
	let a = Df.confirm(t, n, r, i);
	return a === null || e.length === 1 ? a : `${e.length} 個檔裡：${a}`;
}
var jf = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
async function Mf(e, t) {
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
	}, i = kf({
		items: e,
		busy: !1
	});
	if (i) return r("disabled", [i]);
	if (e.some((e) => Uc(e.log) !== "noise" || e.log.manual.length !== 0)) return r("plan", [Df.notNoiseLog]);
	let a = Dl(e.map((e) => e.log), t.agencyCodes ? t.agencyCodes() : Ol());
	if (a !== null && !t.confirm(a)) return r("cancel", []);
	let o = Af(e);
	if (o !== null && !t.confirm(o)) return r("cancel", []);
	t.onStage?.(W.working);
	let s = [];
	for (let { v: t, log: i } of e) try {
		s.push(ld(t, {
			fileName: i.fileName,
			agency: i.agency,
			period: i.period
		}));
	} catch (e) {
		return r("plan", [W.planFail(n ? G.file(i.fileName, jf(e)) : jf(e))]);
	}
	let c = t.upstream(), l = c?.XLSX;
	if (!l || typeof l.write != "function" || !l.utils) return r("xlsx", [W.noXlsx]);
	let u = t.now(), d = [];
	for (let t = 0; t < e.length; t++) {
		if (s[t].total <= 0) continue;
		let i = Ad(e[t].log.fileName, u);
		try {
			d.push({
				i: t,
				x: {
					name: i,
					bytes: ud(s[t], l)
				}
			});
		} catch (i) {
			return r("xlsx", [W.xlsxFail(n ? G.file(e[t].log.fileName, jf(i)) : jf(i))], d.map((e) => e.x));
		}
	}
	let f = d.map((e) => e.x);
	if (!d.length) return r("disabled", [Df.noPass]);
	let p = (e) => e.bytes.slice().buffer, m = /* @__PURE__ */ new Map(), h = [];
	for (let { i, x: a } of d) {
		let o = await gd(c, {
			name: a.name,
			arrayBuffer: async () => p(a)
		}, s[i]);
		if (!mf(t)) return t.clearPending(), r("cancel", []);
		o.ok ? m.set(i, o.rows) : n ? h.push(G.preflightFile(e[i].log.fileName) + o.problems.join("；")) : h.push(...o.problems);
	}
	let g = (t) => e[t].v.stations.map((e) => ({
		location: e.location,
		zone: e.zone
	}));
	for (let [t, r] of m) {
		let i = Gn({
			plan: s[t],
			zones: g(t)
		}), a = {};
		for (let [o, c] of Object.entries(r)) {
			let r = c.map((e) => ({ ...e }));
			for (let e of Kn(r, i, () => o)) e.row[e.field] = e.value;
			let l = s[t].sheets.find((e) => e.name === o)?.kind === "vib" ? N.vib.zone : i.get(o) ?? N.noise.zone;
			r.some((e) => String(e.管制區 ?? "") !== l) && h.push(n ? G.preflightFile(e[t].log.fileName) + Df.zoneFill(o) : Df.zoneFill(o)), a[o] = r;
		}
		m.set(t, a);
	}
	if (h.length) return r("preflight", [
		W.preflightHead,
		...h,
		W.fallback
	], f);
	let _ = uf(t.doc);
	if (_.length) return r("env", [W.missing(_), W.fallback], f);
	if (!t.noiseReady()) return r("env", [Df.notNoise, W.fallback], f);
	if (!mf(t)) return t.clearPending(), r("cancel", []);
	try {
		n ? t.download(new Blob([fl(dl(e.map((e) => e.log), u.toISOString()))], { type: "application/json" }), Bu(e.length, u)) : t.download(new Blob([Gc(e[0].log)], { type: "application/json" }), zu(e[0].log.fileName, u));
	} catch (e) {
		return r("log", [W.logFail(jf(e))], f);
	}
	t.onStage?.(W.sending);
	let v = f.map((e) => e.name), y = v.join("、");
	t.setPending({
		noise: !0,
		files: e.map((e, t) => {
			let n = d.find((e) => e.i === t);
			return {
				xdwFileName: e.log.fileName,
				fileName: n ? n.x.name : null,
				plan: s[t],
				preflightRows: n ? m.get(t) ?? {} : {},
				noData: e.v.pages.filter((e) => e.status === "nodata").map((e) => e.page),
				zones: e.v.stations.map((e) => ({
					location: e.location,
					zone: e.zone
				}))
			};
		})
	});
	let b = t.doc, x = !1, S = () => {
		if (!mf(t)) throw new pf();
	};
	try {
		S();
		let e = b.defaultView, r = e?.File ?? File, i = e?.DataTransfer ?? DataTransfer;
		if (b.getElementById("btnImport").click(), !await hf(() => !ff(b.getElementById("importModal")), t)) throw Error(W.steps.modal);
		S();
		let a = b.getElementById("importFileInput");
		if (!a) throw Error(W.steps.staged);
		let o = new i();
		for (let e of f) o.items.add(new r([p(e)], e.name, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
		a.files = o.files, a.dispatchEvent(new Event("change", { bubbles: !0 }));
		let s = b.getElementById("btnImportStagedConfirm"), c = b.getElementById("importStagedList");
		if (!await hf(() => !ff(s) && (!c || v.every((e) => (c.textContent ?? "").includes(e))), t)) throw Error(W.steps.staged);
		let l = c ? c.querySelectorAll(".staged-file-item") : null, u = l ? l.length : 0;
		if (n) {
			if (u !== f.length) throw Error(G.stagedCount(u, f.length));
			let e = [...l ?? []].map((e) => (e.querySelector(".staged-file-name")?.textContent ?? "").replace(/^\s*📄\s*/u, "").trim());
			if (e.length !== v.length || e.some((e) => !v.includes(e)) || new Set(e).size !== e.length) throw Error(G.stagedName);
		} else if (u !== 1) throw Error(W.steps.stagedNotOne(u));
		if (S(), s.click(), x = !0, !await hf(() => {
			let e = t.importState(), n = b.getElementById("smartImportSummary");
			return !!e && e.label === y && e.mode === "smart" && Array.isArray(e.rows) && !!n && (n.textContent ?? "") !== "";
		}, t)) throw Error(W.steps.preview);
	} catch (e) {
		return x || t.clearPending(), e instanceof pf ? r("cancel", []) : r("dom", [W.stepFail(jf(e)), W.fallback], f);
	}
	return mf(t) ? (t.closeModal(), {
		ok: !0,
		fileName: y,
		plans: s
	}) : r("cancel", []);
}
//#endregion
//#region src/xdwread/results-air.ts
var K = {
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
	].filter((t) => e[t] !== void 0).map((t) => `${Nf[t]} 第 ${e[t]} 頁`).join("、"),
	stationOk: (e, t) => `站層級檢查通過；${e}／${t} 個值通過`,
	stationManual: "全站需人工：",
	hiddenPass: (e) => `其他 ${e} 個值通過（按「顯示全部」可看）`,
	page: (e) => `第 ${e} 頁`,
	layout: (e) => e ? Nf[e] : "版型不明",
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
}, Nf = {
	L1: "空品總表",
	L2: "PM2.5 總表",
	L3: "逐時(1/2)",
	L4: "逐時(2/2)"
}, Pf = (e) => K.counts(e.totals.pass, e.totals.manual, e.totals.pagesManual, e.totals.pagesNoData, e.totals.pagesSkipped);
function Ff(e) {
	let t = {
		pass: 0,
		manual: 0,
		pagesManual: 0,
		pagesNoData: 0,
		pagesSkipped: 0
	};
	for (let n of e) for (let e of Object.keys(t)) t[e] += n.totals[e];
	return B.batch(e.length, K.counts(t.pass, t.manual, t.pagesManual, t.pagesNoData, t.pagesSkipped));
}
function If(e) {
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
function Lf(e, t, n) {
	let r = yo.find((e) => e.key === n), i = t.pages[r.layout];
	if (i === void 0) return null;
	let a = e.pages.find((e) => e.page === i)?.cells.find((e) => e.layout === r.layout && e.name === r.name);
	return a ? {
		a: a.a,
		b: a.b
	} : null;
}
function q(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var Rf = (e) => e == null || e === "" ? B.empty : e;
function zf(e, t) {
	if (e.identity && e.status === "ok") return {
		code: e.identity.siteCode,
		loc: e.identity.location,
		period: e.identity.periodKey
	};
	let n = e.mode === "skip" ? null : Xc(t.calls, e.page, "A", $c(t)), r = (e) => {
		if (!n || !n.ok) return B.notRead;
		let t = n.reply[e].value;
		return t === null || t.trim() === "" ? B.notRead : `${t}${B.unconfirmed}`;
	};
	return {
		code: r("site_code"),
		loc: r("location"),
		period: r("period")
	};
}
function Bf(e, t) {
	let n = t.length > 1, r = q(e, "div", "edc-res edc-res-air");
	r.id = "edcReadResults";
	let i = q(e, "div", "edc-res-counts", n ? Ff(t.map((e) => e.v)) : Pf(t[0].v));
	i.id = "edcReadCounts";
	let a = q(e, "div", "edc-res-attn");
	a.id = "edcReadAttn";
	let o = q(e, "div", "edc-res-all");
	o.id = "edcReadAllRows", o.hidden = !0;
	let s = 0;
	t.forEach((t, r) => {
		let i = (e) => (n && (e.dataset.file = String(r)), e), c = If(t.v);
		s += c.total;
		let f = [], p = [];
		if (!c.anyLayout) {
			let t = i(q(e, "div", "edc-xdw-red edc-air-nolayout", K.noLayout));
			n || (t.id = "edcAirNoLayout"), f.push(t);
		}
		if (c.allPassStations.length) {
			let t = i(q(e, "div", "edc-res-allpass", K.allPass(c.allPassStations.length, c.allPassPages, c.allPassValues)));
			n || (t.id = "edcReadAllPass"), f.push(t);
		}
		for (let e of c.stations) f.push(l(t, r, e.index, e.st, e.manual, e.pass, !1));
		for (let e of c.pages) f.push(u(t, r, e));
		if (c.noData.length) {
			let t = i(q(e, "div", "edc-air-nodata", K.noData(c.noData)));
			n || (t.id = "edcReadNoData"), f.push(t);
		}
		if (!c.stations.length && !c.pages.length && c.anyLayout && f.push(q(e, "div", "edc-res-noattn", K.noAttn)), t.v.totals.manual > 0 || t.v.totals.pagesManual > 0) {
			let t = i(q(e, "div", "edc-air-nomanual", K.noManual));
			n || (t.id = "edcAirNoManual"), f.push(t);
		}
		if (t.v.stations.forEach((e, n) => p.push(l(t, r, n, e, e.values, 0, !0))), p.push(d(t, r)), n) {
			let n = () => {
				let n = q(e, "div", "edc-res-file-title", B.fileTitle(r + 1, t.log.fileName));
				return n.dataset.file = String(r), n;
			}, i = q(e, "div", "edc-res-file");
			i.dataset.file = String(r);
			let s = q(e, "div", "edc-res-counts edc-res-file-counts", Pf(t.v));
			s.dataset.file = String(r), i.append(n(), s, ...f), a.append(i);
			let c = q(e, "div", "edc-res-file");
			c.dataset.file = String(r), c.append(n(), ...p), o.append(c);
		} else a.append(...f), o.append(...p);
	});
	let c = q(e, "button", "edc-xdw-btn edc-res-showall", K.showAll(s));
	c.type = "button", c.id = "edcReadShowAll", c.setAttribute("aria-expanded", "false"), c.setAttribute("aria-controls", "edcReadAllRows"), c.addEventListener("click", () => {
		try {
			o.hidden = !o.hidden, c.setAttribute("aria-expanded", String(!o.hidden)), c.textContent = o.hidden ? K.showAll(s) : B.hideAll;
		} catch {}
	}), r.append(i, a, c, o);
	function l(t, r, i, a, o, s, c) {
		let l = q(e, "section", c ? "edc-air-station edc-air-station-full" : "edc-air-station");
		l.dataset.station = String(i), l.dataset.status = a.status, n && (l.dataset.file = String(r));
		let u = q(e, "div", "edc-air-station-head");
		u.append(q(e, "strong", void 0, K.station(a.siteCode, a.location)), q(e, "span", "edc-air-station-pages", `（${K.stationPages(a.pages)}）`)), l.append(u);
		let d = a.values.filter((e) => e.status === "pass").length;
		l.append(a.status === "ok" ? q(e, "div", "edc-res-page-status", K.stationOk(d, a.values.length)) : q(e, "div", "edc-res-page-status edc-xdw-red", K.stationManual + a.reasons.join("；")));
		let f = q(e, "table", "edc-res-table edc-air-table"), p = q(e, "tr");
		for (let t of K.cols) p.append(q(e, "th", void 0, t));
		f.append(p);
		for (let i of o) {
			let o = q(e, "tr", c ? "edc-air-row" : "edc-air-arow");
			o.dataset.key = i.key, o.dataset.status = i.status, i.page !== null && (o.dataset.page = String(i.page)), n && (o.dataset.file = String(r));
			let s = Lf(t.v, a, i.key);
			o.append(q(e, "td", void 0, i.key), q(e, "td", void 0, i.page === null ? B.none : String(i.page)), q(e, "td", void 0, Rf(s?.a)), q(e, "td", void 0, Rf(s?.b)), q(e, "td", i.status === "pass" ? "edc-res-pass" : "edc-res-manual", i.status === "pass" ? B.pass : B.manual), q(e, "td", void 0, K.cross[i.cross]), q(e, "td", void 0, i.reasons.join("；"))), f.append(o);
		}
		return l.append(f), s > 0 && l.append(q(e, "div", "edc-res-hiddenpass", K.hiddenPass(s))), l;
	}
	function u(t, r, i) {
		let a = q(e, "section", "edc-air-page");
		a.dataset.page = String(i.page), a.dataset.status = i.status, n && (a.dataset.file = String(r));
		let o = q(e, "div", "edc-air-page-head");
		if (o.append(q(e, "strong", void 0, K.page(i.page)), q(e, "span", void 0, ` ${K.layout(i.layout)}`)), a.append(o), a.append(q(e, "div", "edc-res-page-status edc-xdw-red", (i.status === "skip" ? K.pageSkip : K.pageManual) + i.reasons.join("；"))), i.status !== "skip") {
			let n = zf(i, t.log), r = q(e, "ul", "edc-res-identity");
			r.append(q(e, "li", void 0, `${K.ids.code}：${n.code}`), q(e, "li", void 0, `${K.ids.loc}：${n.loc}`), q(e, "li", void 0, `${K.ids.period}：${n.period}`)), a.append(r);
		}
		return a;
	}
	function d(t, r) {
		let i = q(e, "table", "edc-res-table edc-air-pages"), a = q(e, "tr");
		for (let t of K.pageCols) a.append(q(e, "th", void 0, t));
		i.append(a);
		for (let a of [...t.v.pages].sort((e, t) => e.page - t.page)) {
			let t = q(e, "tr", "edc-air-prow");
			t.dataset.page = String(a.page), t.dataset.status = a.status, n && (t.dataset.file = String(r));
			let o = a.status === "ok" ? K.pageOk : a.status === "nodata" ? K.pageNoData : a.status === "skip" ? K.pageSkip.replace("：", "") : K.pageManual.replace("：", "");
			t.append(q(e, "td", void 0, String(a.page)), q(e, "td", void 0, K.layout(a.layout)), q(e, "td", void 0, o), q(e, "td", void 0, a.status === "ok" || a.status === "nodata" ? "" : a.reasons.join("；"))), i.append(t);
		}
		return i;
	}
	return {
		element: r,
		dispose: () => {}
	};
}
//#endregion
//#region src/xdwread/runview.ts
var J = {
	status: (e) => `${e.scheme} 讀法（${e.scheme === "A" ? bu : xu}）：已完成 ${e.done}／${e.total} 頁（已送出 ${e.calls} 次呼叫）`,
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
	toImport: W.button,
	toImportNote: W.ready
};
function Vf(e) {
	return e.map((e) => ol(e.calls)).reduce((e, t) => Hf(e, t), {
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
function Hf(e, t) {
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
var Uf = (e, t) => e === null ? 0 : Math.max(0, Math.ceil((e - t) / 1e3));
function Y(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var Wf = (e) => Rl((e instanceof Error ? e.message : String(e)) || "未知錯誤", Xl());
function Gf(e, t, n) {
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
		let e = Uf(c, Date.now());
		e > 0 ? (C.hidden = !1, C.textContent = J.pause(e)) : (C.hidden = !0, C.textContent = "", c = null, le());
	}, de = () => {
		let e = f.length ? Cf({
			items: h(),
			busy: _,
			reading: i
		}) : p.length ? kf({
			items: g(),
			busy: _,
			reading: i
		}) : of({
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
		setPending: (t) => Hr(t, {
			doc: e,
			getState: () => typeof state < "u" ? state : void 0
		}),
		clearPending: Ur,
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
			setPending: (t) => Hr(t, {
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
			setPending: (t) => Hr(t, {
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
			for (let e of l) e.fallback !== void 0 && delete e.fallback;
			let i = await gf(t.map((e) => ({
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
			a.append(...i.messages.map((t) => Y(e, "div", void 0, Rl(t, Xl())))), k.replaceChildren(a);
			let o = i.fallbackRows ?? [];
			o.length && l.forEach((e, t) => {
				let n = o.filter((e) => e.fileIndex === t);
				if (!n.length) return;
				let r = Array.isArray(e.fallback) ? e.fallback : [], i = n.filter((e) => !r.some((t) => t.page === e.page && t.index === e.index)).map((e) => ({
					page: e.page,
					index: e.index,
					kind: "level-remark",
					note: Ec
				}));
				e.fallback = [...r, ...i];
			});
			let s = i.xlsxList ?? (i.xlsx ? [i.xlsx] : []);
			s.forEach((t, n) => {
				let r = Y(e, "button", "edc-xdw-btn edc-read-download-xlsx", s.length > 1 ? `${W.download}：${t.name}` : W.download);
				r.type = "button", n === 0 && (r.id = "edcReadDownloadXlsx"), r.dataset.name = t.name, r.addEventListener("click", () => {
					try {
						fe(new Blob([t.bytes.slice().buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), t.name);
					} catch {}
					if (o.length) try {
						D.click();
					} catch {}
				}), k.append(r);
			});
		} catch (t) {
			n === r && k.replaceChildren(Y(e, "div", "edc-xdw-red edc-read-submit-fail", Wf(t)));
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
			})), o = t ? await Mf(a, he(i)) : await Ef(a, me(i));
			if (i !== r || o.ok) {
				i === r && k.replaceChildren();
				return;
			}
			if (o.stage === "cancel") {
				k.replaceChildren();
				return;
			}
			let s = Y(e, "div", "edc-xdw-red edc-read-submit-fail");
			s.append(...o.messages.map((t) => Y(e, "div", void 0, Rl(t, Xl())))), k.replaceChildren(s);
			let c = o.xlsxList ?? (o.xlsx ? [o.xlsx] : []);
			c.forEach((t, n) => {
				let r = Y(e, "button", "edc-xdw-btn edc-read-download-xlsx", c.length > 1 ? `${W.download}：${t.name}` : W.download);
				r.type = "button", n === 0 && (r.id = "edcReadDownloadXlsx"), r.dataset.name = t.name, r.addEventListener("click", () => {
					try {
						fe(new Blob([t.bytes.slice().buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), t.name);
					} catch {}
				}), k.append(r);
			});
		} catch (t) {
			i === r && k.replaceChildren(Y(e, "div", "edc-xdw-red edc-read-submit-fail", Wf(t)));
		} finally {
			i === r && (_ = !1, de());
		}
	};
	se.addEventListener("click", () => {
		try {
			ge().catch(() => {});
		} catch {}
	});
	let ve = (t) => {
		try {
			let n = El(t, Ol());
			if (!n.length) return;
			let r = Y(e, "div", "edc-xdw-red edc-read-permit");
			r.id = "edcReadPermitWarn";
			for (let t of n) r.append(Y(e, "div", void 0, t));
			O.prepend(r);
		} catch {}
	}, ye = (t, r, i = []) => {
		u = t, f = [], p = [], l = r, v?.dispose(), d = t.map((e, t) => Mu(e, r[t], i[t] ?? []));
		for (let e of d) e.onChange(() => {
			try {
				de();
			} catch {}
		});
		v = Gu(e, t.map((e, t) => ({
			v: e,
			log: r[t],
			frag: (e) => n.frag(t, e),
			store: d[t]
		}))), O.replaceChildren(v.element), ve(r), oe.hidden = !1, D.hidden = !1, de();
	}, be = (t, n) => {
		f = t, p = [], u = [], l = n, v?.dispose(), d = [], v = Bf(e, t.map((e, t) => ({
			v: e,
			log: n[t]
		}))), O.replaceChildren(v.element), ve(n), oe.hidden = !1, D.hidden = !1, de();
	}, xe = (t, n) => {
		p = t, f = [], u = [], l = n, v?.dispose(), d = [], v = $u(e, t.map((e, t) => ({
			v: e,
			log: n[t]
		}))), O.replaceChildren(v.element), ve(n), oe.hidden = !1, D.hidden = !1, de();
	}, Se = () => {
		let e = i || a ? J.locked : n.canLoad();
		ne.disabled = e !== null, ie.textContent = e ?? J.loadHint;
	}, Ce = () => {
		i = !1, a = !0, o = null, w.disabled = !0, w.hidden = !0, le(), c = null, C.hidden = !0, Se(), de(), n.changed();
	};
	w.addEventListener("click", () => {
		try {
			i && o && (w.disabled = !0, w.textContent = J.aborting, o.abort());
		} catch {}
	}), D.addEventListener("click", () => {
		try {
			if (!l.length) return;
			let t = /* @__PURE__ */ new Date(), n = l.length > 1 ? fl(dl(l, t.toISOString())) : Gc(l[0]), r = new Blob([n], { type: "application/json" }), i = URL.createObjectURL(r), a = e.createElement("a");
			a.href = i, a.download = l.length > 1 ? Bu(l.length, t) : zu(l[0].fileName, t), a.click(), setTimeout(() => {
				try {
					URL.revokeObjectURL(i);
				} catch {}
			}, 1e4);
		} catch (t) {
			E.append(Y(e, "div", "edc-xdw-red edc-read-error", J.downloadFail(Wf(t))));
		}
	}), ne.addEventListener("click", () => {
		try {
			Se(), ne.disabled || (re.value = "", re.click());
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
			let l = pl(c);
			if (!l.ok) {
				ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject(l.reason)));
				return;
			}
			let u = n.shas();
			if (!u) {
				ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject("目前的檔案沒有 SHA-256，不能比對")));
				return;
			}
			let d = ml(l.logs, u);
			if (!d.ok) {
				ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject(d.reason)));
				return;
			}
			let f = m(), p = d.logs.find((e) => Uc(e) !== f);
			if (p) {
				ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject(J.wrongForm(Uc(p), f))));
				return;
			}
			let h = d.logs.map((e) => e.manual), g = f === "gw" ? hl(d.logs) : [], _ = l.bundle ? JSON.parse(c).createdAt : d.logs[0].createdAt;
			ae.replaceChildren(Y(e, "div", "edc-read-loaded", d.logs.length > 1 ? J.loadedBundle(d.logs.length, _) : J.loaded(d.logs[0].fileName, _))), b.hidden = !1, x.textContent = "", S.textContent = "", w.hidden = !0, T.textContent = `${B.tokens(Vf(d.logs))}${J.loadedTokens}`, E.replaceChildren(Y(e, "div", "edc-read-locked", J.locked)), f === "air" ? be(gl(d.logs), d.logs) : f === "noise" ? xe(_l(d.logs), d.logs) : ye(g, d.logs, h), Ce();
		})().catch((n) => {
			t === r && ae.replaceChildren(Y(e, "div", "edc-xdw-red", J.loadReject(Wf(n))));
		});
	});
	let we = {
		async run(t) {
			if (i || a) return;
			let l = ++r;
			i = !0, o = new AbortController();
			let u = o.signal;
			b.hidden = !1, w.hidden = !1, w.disabled = !1, w.textContent = J.abort, x.textContent = J.starting, S.textContent = "", T.textContent = B.tokens({
				A: {
					input: 0,
					output: 0
				},
				B: {
					input: 0,
					output: 0
				}
			}), E.replaceChildren(), ee.replaceChildren(), ae.replaceChildren(), Se(), n.changed();
			let d = t.files.length, f = d > 1, p = t.form === "air" ? "air" : t.form === "noise" ? "noise" : "gw", m = [], h = [], g = null;
			for (let n = 0; n < d; n++) {
				let i = t.files[n];
				if (g || u.aborted) {
					m.push(sl({
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
							reason: e.reason,
							cls: e.cls ? { ...e.cls } : null
						}))
					})), g ||= {
						status: "cancelled",
						text: null,
						at: n
					};
					continue;
				}
				if (f && !i.pages.some((e) => e.mode === "whole")) {
					m.push(sl({
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
							reason: e.reason,
							cls: e.cls ? { ...e.cls } : null
						}))
					}));
					continue;
				}
				let a = f ? J.filePrefix(n + 1, d, i.fileName) : "", o = Vf(m), _ = (e) => {
					l === r && (x.textContent = a + J.status(e), S.textContent = e.note ?? "", T.textContent = B.tokens(Hf(o, e.usage)), c = e.pausedUntil, ue(), c !== null && s === null && (s = setInterval(() => {
						try {
							ue();
						} catch {}
					}, 1e3)));
				}, v;
				try {
					let n = Eu({
						decode: (t) => Ma(e, t),
						encode: (t) => Pa(e, t)
					});
					v = await ku({
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
					E.replaceChildren(Y(e, "div", "edc-xdw-red edc-read-error", J.crash(Wf(t))), Y(e, "div", "edc-read-locked", J.locked)), Ce();
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
			T.textContent = B.tokens(Vf(m));
			let _ = g ? g.status === "cancelled" ? J.cancelled : g.text ?? "" : J.done, v = f && g && g.at < d - 1 ? " " + (g.status === "stopped" ? J.fileStopped(g.at + 1) : J.fileCancelled(g.at + 1)) : "";
			E.replaceChildren(Y(e, "div", g?.status === "stopped" ? "edc-xdw-red edc-read-stop" : "edc-read-done-text", Rl(_ + v, Xl())), Y(e, "div", "edc-read-locked", J.locked)), ee.replaceChildren(...h.map((t) => Y(e, "div", "edc-xdw-red edc-read-note-item", Rl(t, Xl())))), p === "air" ? be(gl(m), m) : p === "noise" ? xe(_l(m), m) : ye(hl(m), m), Ce();
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
			o = null, i = !1, a = !1, l = [], u = [], f = [], p = [], _ = !1, k.replaceChildren(), le(), c = null, v?.dispose(), v = null, d = [], b.hidden = !0, x.textContent = "", S.textContent = "", C.hidden = !0, T.textContent = "", E.replaceChildren(), ee.replaceChildren(), ae.replaceChildren(), O.replaceChildren(), oe.hidden = !0, D.hidden = !0, re.value = "", Se();
		},
		refreshLoad: Se
	};
	return Se(), we;
}
//#endregion
//#region src/xdwread/ui.ts
var Kf = `${N.noise.category}／${N.vib.category}`, qf = "edcXdwRead", X = {
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
	categoryAir: To,
	categoryHintAir: `空品由原網站固定寫成「${To}」，這格不能改`,
	pickHint: "已預設不送看起來不是資料頁的頁（封面、目錄、聲明書等）；需要的話可以勾回來。取消勾選的頁不會送出。",
	nondata: Ia,
	pickNondata: "預設不送：看起來不是資料頁（封面、目錄、聲明書等）",
	pickUnsure: "看不出來是不是資料頁，預設送出；不需要可以取消",
	pickLabel: (e) => `第 ${e} 頁`,
	unpicked: yf,
	notReady: "目前不在水質或空品分頁、或沒有選計畫，沒有送出。",
	titleNoise: "Claude 讀值（噪音振動）",
	categoryNoise: Kf,
	categoryHintNoise: `噪音振動由原網站固定寫成「${N.noise.category}」「${N.vib.category}」，這格不能改`,
	notReadyNoise: "目前不在噪音分頁或沒有選計畫，沒有送出。",
	formChanged: "選檔之後換了分頁，沒有送出。請在要匯入的分頁重新選檔。",
	fileCount: (e) => `共 ${e} 個檔`,
	fileTitle: (e, t) => `${e}（共 ${t} 頁）`,
	filePrefix: (e, t, n) => `檔 ${e}/${t}（${n}）：`,
	inconsistentFile: (e, t) => `送出前檢查不一致（檔「${e}」第 ${t} 頁），沒有送出。請重新選檔。`
};
function Jf(e) {
	return e.reading ? X.why.reading : e.ended ? X.why.ended : e.preparing ? X.why.preparing : e.hasFile ? e.hasSha ? e.sendCount <= 0 ? X.why.none : e.hasKey ? e.category.trim() ? e.agency ? e.year ? e.quarter ? e.confirmed ? X.why.confirmed : null : X.why.quarter : X.why.year : X.why.agency : X.why.category : X.why.key : X.why.sha : X.why.noFile;
}
function Yf(e = /* @__PURE__ */ new Date()) {
	let t = e.getFullYear() - 1911;
	return [
		t - 2,
		t - 1,
		t,
		t + 1
	];
}
var Xf = (e) => e.image instanceof Blob && e.image.size > 0 && !!e.box;
function Zf(e, t, n = !0) {
	if (e.length !== t) return e.length + 1;
	for (let t = 0; t < e.length; t++) {
		let n = e[t];
		if (n.page !== t + 1) return t + 1;
		if (n.mode === "whole") {
			if (!Xf(n) || n.box.x !== 0 || n.box.y !== 0 || n.reason !== "") return n.page;
		} else if (n.mode !== "skip" || n.image !== null || n.box !== null || !n.reason) return n.page;
	}
	return !n || e.some((e) => e.mode === "whole") ? null : 1;
}
function Qf(e) {
	if (!e.length) return {
		file: 0,
		page: 1
	};
	if (e.length === 1) {
		let t = Zf(e[0].entries, e[0].pageCount);
		return t === null ? null : {
			file: 0,
			page: t
		};
	}
	for (let t = 0; t < e.length; t++) {
		let n = Zf(e[t].entries, e[t].pageCount, !1);
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
var $f = 1600;
function ep(e, t, n = $f) {
	let r = e > n ? n / e : 1;
	return r === 1 ? {
		w: e,
		h: t
	} : {
		w: Math.round(e * r),
		h: Math.round(t * r)
	};
}
var tp = (e, t) => Ea(e, t).ok;
function np(e, t, n) {
	let r = ep(t, n);
	return tp(r.w, r.h) ? null : ip(e, X.noSize);
}
function rp(e) {
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
var ip = (e, t) => ({
	page: e,
	mode: "skip",
	image: null,
	box: null,
	reason: t
});
function ap(e) {
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
			reason: e.reason,
			cls: e.cls ? { ...e.cls } : null
		}))
	};
}
function op() {
	try {
		return typeof state < "u" && !!state && state.currentTab === "water" && !!state.currentProjectId;
	} catch {
		return !1;
	}
}
function sp() {
	try {
		return typeof state < "u" && !!state && state.currentTab === "air" && !!state.currentProjectId;
	} catch {
		return !1;
	}
}
function cp() {
	try {
		return typeof state < "u" && !!state && state.currentTab === "noise" && !!state.currentProjectId;
	} catch {
		return !1;
	}
}
var lp = () => op() ? "gw" : sp() ? "air" : cp() ? "noise" : null;
function up() {
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
var dp = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
function fp(e, t, n = {}) {
	let r = 0, i = null, a = [], o = /* @__PURE__ */ new Map(), s = !1, c = [], l = !1, u = [], d = null, f = null, p = n.onConfirm ?? ((e) => d ? d.run(e) : void 0), m = () => !!d && d.busy(), h = () => !!d && d.ended(), g = () => m() || h(), _ = () => c.flatMap((e) => e.entries), v = () => _().filter((e) => e.mode === "whole").length, y = () => c.length > 0 && c.every((e) => e.pageCount > 0 && e.entries.length === e.pageCount), b = () => ({
		preparing: s,
		hasFile: c.length > 0 && c.every((e) => e.pageCount > 0),
		sendCount: v(),
		hasKey: !!Xl(),
		confirmed: l,
		hasSha: c.length > 0 && c.every((e) => !!e.sha),
		reading: m(),
		ended: h(),
		category: f?.category.value ?? "",
		agency: f?.agency.value ?? "",
		year: f?.year.value ?? "",
		quarter: f?.quarter.value ?? ""
	}), x = () => {
		let e = _().filter((e) => e.mode !== "whole");
		return (i === "air" || i === "noise" || e.every((e) => bf(e.reason)) ? X.summaryAir : X.summary)(v(), e.length);
	}, S = () => {
		if (!f) return;
		let e = b(), t = Jf(e);
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
		b.type = "text", b.id = "edcReadCategory", b.value = r ? X.categoryAir : a ? X.categoryNoise : X.categoryDefault, b.autocomplete = "off", (r || a) && (b.readOnly = !0), v.append(b, Z(e, "span", "edc-read-hint", r ? X.categoryHintAir : a ? X.categoryHintNoise : X.categoryHint)), u = up();
		let x = w("edcReadAgency", X.agency, u.map((e) => ({
			value: e.code,
			text: `${e.name}（${e.code}）`
		}))), C = w("edcReadYear", X.year, Yf().map((e) => ({
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
		}, d = Gf(e, ae, {
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
		if (Jf(b()) !== null) {
			S();
			return;
		}
		if (i === "air" ? !sp() : i === "noise" ? !cp() : !op()) {
			C(i === "air" ? lp() === null ? X.notReady : X.formChanged : i === "noise" ? lp() === null ? X.notReadyNoise : X.formChanged : X.notWater);
			return;
		}
		let e = Qf(c);
		if (e !== null) {
			C(c.length > 1 ? X.inconsistentFile(c[e.file].name, e.page) : X.inconsistent(e.page));
			return;
		}
		let t;
		try {
			let e = c.map((e) => ap({
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
			C(X.confirmFail(dp(e)));
			return;
		}
		l = !0, S();
		try {
			await p(t);
		} catch (e) {
			C(X.confirmFail(dp(e)));
		}
		S();
	}, te = () => {
		r++, s = !1, c = [], l = !1, a = [], o.clear();
		try {
			d?.reset();
		} catch {}
		f && (f.pages.replaceChildren(), f.summary.replaceChildren(), f.done.replaceChildren(), f.progress.textContent = X.waiting, S());
	}, D = () => {
		if (te(), i = lp(), t.hidden = !1, i) {
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
	}, re = async (t, n, r) => {
		let i = n.index + 1, a = np(i, n.width, n.height);
		if (a) return a;
		try {
			let a = await va(() => t.render(n.index, $f)), o = a.width, s = a.height, c = null, l = null;
			try {
				if (!r()) return null;
				tp(o, s) && (c = await ja(a), l = Ka(e, a));
			} finally {
				a.width = 0, a.height = 0;
			}
			return tp(o, s) ? !c || c.size <= 0 ? ip(i, X.pngFail) : {
				page: i,
				mode: "whole",
				image: c,
				box: {
					x: 0,
					y: 0,
					w: o,
					h: s
				},
				reason: "",
				cls: l
			} : ip(i, X.noSize);
		} catch (e) {
			return ip(i, X.pageFail(dp(e)));
		}
	}, ie = (t, n, r) => {
		let i = c[t], u = Z(e, "div", "edc-read-pick");
		u.dataset.file = String(t), n || (u.id = "edcReadPick"), u.append(Z(e, "div", "edc-read-pick-hint", X.pickHint));
		for (let n of i.entries.filter((e) => e.mode === "whole" || o.has(`${t}:${e.page}`))) {
			let c = n.cls?.kind ?? null, d = Z(e, "label", "edc-read-pick-item" + (c === "nondata" ? " edc-read-pick-nondata" : c === "unsure" ? " edc-read-pick-unsure" : ""));
			d.dataset.cls = c ?? "";
			let f = Z(e, "input");
			f.type = "checkbox";
			let p = n.mode === "whole";
			f.checked = p, f.dataset.file = String(t), f.dataset.page = String(n.page), f.addEventListener("change", () => {
				try {
					if (g() || s) {
						S();
						return;
					}
					let e = `${t}:${n.page}`, a = i.entries.findIndex((e) => e.page === n.page);
					if (a < 0) return;
					let c = (o.get(e) ?? i.entries[a]).cls ?? null;
					c && (c.changed = f.checked !== p), !f.checked && i.entries[a].mode === "whole" ? (o.set(e, i.entries[a]), i.entries[a] = {
						...ip(n.page, c?.kind === "nondata" ? X.nondata : X.unpicked),
						cls: c
					}) : f.checked && o.has(e) && (i.entries[a] = o.get(e), o.delete(e)), r && (r.textContent = rp(i.entries).line ?? ""), l = !1, S();
				} catch {}
			}), d.append(f, Z(e, "span", void 0, X.pickLabel(n.page))), c === "nondata" ? d.append(Z(e, "span", "edc-read-pick-note edc-read-pick-note-nondata", X.pickNondata)) : c === "unsure" && d.append(Z(e, "span", "edc-read-pick-note edc-read-pick-note-unsure", X.pickUnsure)), a.push(f), u.append(d);
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
			if (lp() !== i) {
				D();
				return;
			}
			te();
			let a = r, l = () => a === r && n(), u = t.length > 1;
			c = t.map((e) => ({
				name: e.fileName,
				sha: e.sha,
				pageCount: e.decoded.pages.length,
				entries: []
			})), s = !0, S();
			try {
				for (let n = 0; n < t.length; n++) {
					let r = t[n].decoded, i = c[n], a = f.pages;
					if (u) {
						a = Z(e, "div", "edc-read-file"), a.dataset.file = String(n);
						let t = Z(e, "div", "edc-read-file-title", X.fileTitle(i.name, i.pageCount));
						t.dataset.file = String(n), a.append(t), f.pages.append(a);
					}
					for (let e = 0; e < r.pages.length; e++) {
						if (!l() || !f) return;
						f.progress.textContent = (u ? X.filePrefix(n + 1, t.length, i.name) : "") + X.preparing(e + 1, i.pageCount);
						let s = await re(r, r.pages[e], l);
						if (!s || !l() || !f) return;
						s.mode === "whole" && s.cls?.kind === "nondata" && (o.set(`${n}:${s.page}`, s), s = {
							...ip(s.page, X.nondata),
							cls: s.cls
						}), i.entries.push(s), s.mode !== "whole" && !o.has(`${n}:${s.page}`) && a.append(ne(s, u ? n : null)), S(), await new Promise((e) => setTimeout(e, 0));
					}
					if (!l() || !f) return;
					let s = rp(i.entries), d = null;
					s.line !== null && (d = Z(e, "div", "edc-read-pages-all", s.line), u ? (d.dataset.file = String(n), a.children[0].after(d)) : (d.id = "edcReadPagesAll", f.pages.prepend(d))), a.append(ie(n, u, d));
				}
				if (!l() || !f) return;
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
var pp = "edcXdwModal", Q = {
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
}, mp = 1650;
function $(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
var hp = (e) => (e instanceof Error ? e.message : String(e)) || "未知錯誤";
function gp(e) {
	e.querySelectorAll("canvas").forEach((e) => {
		e.width = 0, e.height = 0, e.remove();
	});
}
function _p(e, t = (e) => ya(e), n = (e) => ba(e)) {
	let r = null, i = 0, a = [], o = 0, s = () => {
		if (r && r.overlay.isConnected) return r;
		e.getElementById(pp)?.remove();
		let t = $(e, "div", "edc-xdw-overlay");
		t.id = pp, t.hidden = !0, t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-labelledby", "edcXdwTitle");
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
		v.id = qf, v.hidden = !0;
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
			read: fp(e, v, { closeModal: () => m.close() })
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
		o++, r && (r.zoom.hidden = !0, gp(r.zoomBody), r.zoomBody.replaceChildren());
	}, u = () => {
		i++, l();
		let e = a;
		a = [];
		for (let t of e) t.close().catch(() => {});
		if (r) {
			try {
				r.read.reset();
			} catch {}
			r.thumbsTitle.hidden = !0, gp(r.thumbs), r.thumbs.replaceChildren(), r.status.replaceChildren(), r.errors.replaceChildren(), r.errors.hidden = !0;
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
			let e = await va(() => t.render(n, mp));
			if (c !== o || !a.includes(t)) {
				e.width = 0, e.height = 0;
				return;
			}
			e.id = "edcXdwZoomCanvas", r.zoomBody.replaceChildren(e);
		} catch (t) {
			if (c !== o) return;
			r.zoomBody.replaceChildren($(e, "div", "edc-xdw-thumb-bad", `第 ${n + 1} 頁無法顯示：${hp(t)}`));
		}
	}, m = {
		open() {
			let e = s(), t = lp() !== null;
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
					h.push(m ? Q.badFile(e.name, `${Q.notXdw}（${hp(t)}）`) : `${Q.notXdw}（${hp(t)}）`);
					continue;
				}
				if (c !== i) return;
				(!/\.xdw$/i.test(e.name) || t[0] !== 96) && h.push(m ? Q.badFile(e.name, Q.notXdw) : Q.notXdw);
			}
			for (let e = 0; e < l.length; e++) for (let t = e + 1; t < l.length; t++) ll(l[e].name) === ll(l[t].name) && h.push(Q.sameName(l[e].name, l[t].name));
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
						n = await Fa(t);
					} catch {
						n = null;
					}
					if (c !== i) return;
					g.push(t), _.push(n);
				}
			} catch (t) {
				if (c !== i) return;
				o.status.replaceChildren($(e, "span", void 0, m ? Q.batchBad : l[0].name)), d([hp(t)], Q.failTail);
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
						r.push(Q.decodeFail(l[e].name, hp(t)));
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
						o.status.replaceChildren($(e, "span", void 0, l[0].name)), d([hp(t)], Q.failTail);
						return;
					}
					o.status.replaceChildren($(e, "span", "edc-xdw-red", Q.batchBad)), d([Q.decodeFail(l[n].name, hp(t))], Q.failTail);
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
						let t = await va(() => n.render(a.index, 220));
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
						let s = $(e, "div", "edc-xdw-thumb edc-xdw-thumb-bad", `${r}第 ${a.index + 1} 頁無法顯示：${hp(n)}`);
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
var vp = {
	status: "edcClaudeStatus",
	input: "edcClaudeKeyInput",
	save: "edcClaudeSave",
	test: "edcClaudeTest",
	remove: "edcClaudeRemove",
	msg: "edcClaudeMsg",
	results: "edcClaudeResults",
	notice: "edcClaudeNotice"
};
function yp(e, t, n, r) {
	let i = e.createElement(t);
	return n && (i.className = n), r !== void 0 && (i.textContent = r), i;
}
function bp(e, t) {
	if (t.hidden = !1, t.querySelector("#" + vp.status)) return xp(e), !1;
	let n = yp(e, "h3", "edc-xdw-connect-title", Fl.heading), r = yp(e, "p", "edc-xdw-connect-note", Fl.notice);
	r.id = vp.notice;
	let i = yp(e, "div", "edc-xdw-connect-status");
	i.id = vp.status, i.setAttribute("aria-live", "polite");
	let a = yp(e, "div", "edc-xdw-connect-row"), o = yp(e, "input", "edc-xdw-connect-input");
	o.type = "password", o.id = vp.input, o.autocomplete = "off", o.spellcheck = !1, o.placeholder = Fl.placeholder, o.setAttribute("aria-label", Fl.placeholder), o.setAttribute("data-lpignore", "true");
	let s = (t, n, r = "edc-xdw-btn") => {
		let i = yp(e, "button", r, n);
		return i.type = "button", i.id = t, i;
	}, c = s(vp.save, Fl.save), l = s(vp.test, Fl.test), u = s(vp.remove, Fl.remove, "edc-xdw-close");
	a.append(o, c, l, u);
	let d = yp(e, "div", "edc-xdw-connect-msg");
	d.id = vp.msg, d.setAttribute("aria-live", "polite");
	let f = yp(e, "ul", "edc-xdw-connect-results");
	f.id = vp.results, t.replaceChildren(n, r, i, a, d, f);
	let p = (t, n = "ok") => {
		d.replaceChildren(yp(e, "span", n === "red" ? "edc-xdw-red" : n === "gray" ? "edc-xdw-connect-gray" : "edc-xdw-connect-ok", t));
	}, m = [
		c,
		l,
		u
	], h = !1;
	return c.addEventListener("click", () => {
		try {
			if (h) return;
			let e = ql(o.value);
			if (o.value = "", f.replaceChildren(), !e) {
				p(Fl.badFormat, "red");
				return;
			}
			if (!Zl(e)) {
				p(Fl.storageFail, "red");
				return;
			}
			p(Fl.savedOk);
		} catch {}
		try {
			xp(e);
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
				let t = o.value !== "", n = Xl();
				if (!n) {
					p(Fl.needKey, "red");
					return;
				}
				t && p(Fl.unsavedNote, "gray");
				for (let t of jl) {
					let r = yp(e, "li", "edc-xdw-connect-gray", `${t}：${Fl.testing}`);
					f.append(r);
					let i = await Kl(n, t);
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
			if (!t || !t.confirm(Fl.confirmRemove)) return;
			Ql(), o.value = "", f.replaceChildren(), p(Fl.removed);
		} catch {}
		try {
			xp(e);
		} catch {}
	}), xp(e), !0;
}
function xp(e) {
	let t = e.getElementById(vp.status);
	if (!t) return;
	let n = Xl();
	t.textContent = n ? Fl.saved(Jl(n)) : Fl.none, t.classList.toggle("edc-xdw-connect-has", !!n);
}
function Sp(e) {
	let t = e.getElementById(vp.input);
	t && (t.value = ""), e.getElementById(vp.msg)?.replaceChildren(), e.getElementById(vp.results)?.replaceChildren();
}
//#endregion
//#region src/xdw/index.ts
var Cp = null;
function wp(e = document) {
	return Cp ||= _p(e), Cp;
}
function Tp(e = document) {
	let t = wp(e);
	t.open();
	try {
		bp(e, t.getConnectSlot()), Sp(e);
	} catch {}
}
function Ep(e = document) {
	pa(e, () => Tp(e));
}
//#endregion
//#region src/main.ts
function Dp() {
	let e = t(document.title);
	e !== document.title && (document.title = e);
}
function Op() {
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
function kp() {
	let e = document.getElementById("versionBadge");
	if (!e) return;
	let t = e.textContent ?? "", r = n(t, "v1.9");
	r !== t && (e.textContent = r);
}
function Ap() {
	try {
		Dp(), Op(), kp();
	} catch {}
}
var jp = !1;
function Mp() {
	if (jp) return;
	let e = document.getElementById("versionBadge");
	!e || typeof MutationObserver > "u" || (jp = !0, new MutationObserver(() => {
		try {
			kp();
		} catch {}
	}).observe(e, {
		childList: !0,
		characterData: !0,
		subtree: !0
	}));
}
Ap(), Mp(), document.readyState !== "complete" && document.addEventListener("DOMContentLoaded", () => {
	Ap(), Mp();
}, { once: !0 });
function Np() {
	let e = ae();
	try {
		oe({
			SmartParse: typeof SmartParse < "u" ? SmartParse : void 0,
			ImportEngine: typeof ImportEngine < "u" ? ImportEngine : void 0,
			XLSX: typeof XLSX < "u" ? XLSX : void 0
		}, e), ti(e, typeof SmartParse < "u" ? SmartParse : void 0), oi(e, typeof SmartParse < "u" ? SmartParse : void 0);
	} catch (t) {
		e.mode = "failed", e.hash = "failed", e.errors.push("啟動失敗：" + String(t));
	}
	let t = {
		win: window,
		doc: document,
		getState: () => typeof state < "u" ? state : void 0,
		getCategories: () => typeof CATEGORIES < "u" ? CATEGORIES : void 0,
		getDataStore: () => typeof DataStore < "u" ? DataStore : void 0
	};
	try {
		ot(() => {
			Wr();
		}), ct(() => {
			Gr();
		}), lt(e, t);
	} catch (t) {
		e.mode = "failed", e.hash = "failed", e.errors.push("提醒安裝失敗：" + String(t));
	}
	try {
		gi(e, {
			AutoDetect: typeof AutoDetect < "u" ? AutoDetect : void 0,
			ImportEngine: typeof ImportEngine < "u" ? ImportEngine : void 0,
			SmartParse: typeof SmartParse < "u" ? SmartParse : void 0,
			win: t.win,
			getCategories: t.getCategories
		}), Vi(e, t);
	} catch (t) {
		e.paths = {
			...e.paths,
			autoDetect: "failed",
			readFile: "failed",
			prevPeriod: "failed"
		}, e.errors.push("S8a 去 # 安裝失敗：" + String(t));
	}
	try {
		ia(e, t);
	} catch (t) {
		e.paths.oldData = "failed", e.errors.push("S8a2 提醒列安裝失敗：" + String(t));
	}
	return e;
}
var Pp = null;
try {
	Pp = Np();
} catch {}
var Fp = () => {
	try {
		Pp && it(Pp, document);
	} catch {}
};
Fp(), document.readyState === "loading" && document.addEventListener("DOMContentLoaded", Fp, { once: !0 }), window.addEventListener("load", Fp, { once: !0 });
try {
	Object.defineProperty(window, "__edcPage2Status", {
		configurable: !0,
		get: () => Pp ? {
			mode: Pp.mode,
			hash: Pp.hash,
			paths: { ...Pp.paths },
			wrapped: [...Pp.wrapped],
			missing: [...Pp.missing],
			errors: [...Pp.errors]
		} : null
	});
} catch {}
try {
	Ep(document);
} catch {}
//#endregion
