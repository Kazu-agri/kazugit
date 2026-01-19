(() => {
  const prevLi = document.getElementById("prev-item");
  const nextLi = document.getElementById("next-item");

  // ナビが無いページでは何もしない
  if (!prevLi || !nextLi) return;

  // 例: "/homepage/notes/20260118.html" -> "20260118.html"
  const currentFile = (() => {
    const path = window.location.pathname;
    const last = path.split("/").pop() || "";
    return decodeURIComponent(last);
  })();

  function safeText(v) {
    return (v === null || v === undefined) ? "" : String(v);
  }

  function toTime(dateStr) {
    const t = Date.parse(dateStr);
    return Number.isFinite(t) ? t : 0;
  }

  function normalizeUrl(url) {
    // posts.json が "notes/xxxx.html" でも "xxxx.html" でも吸収
    return safeText(url).replace(/^notes\//, "");
  }

  function makeLink(label, href) {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    return a;
  }

  function setEmpty(li, text) {
    li.innerHTML = "";
    const s = document.createElement("span");
    s.className = "sub";
    s.textContent = text;
    li.appendChild(s);
  }

  (async () => {
    try {
      const res = await fetch("./posts.json", { cache: "no-store" });
      if (!res.ok) throw new Error("posts.json not found");

      const posts = await res.json();
      if (!Array.isArray(posts)) throw new Error("posts.json format invalid");

      // 正規化＆日付で昇順（古い→新しい）に並べる：前=古い、次=新しい
      const list = posts
        .map(p => ({
          date: safeText(p.date),
          title: safeText(p.title),
          url: normalizeUrl(p.url)
        }))
        .sort((a, b) => toTime(a.date) - toTime(b.date));

      const i = list.findIndex(p => p.url === currentFile);
      if (i < 0) {
        setEmpty(prevLi, "（一覧に未登録）");
        setEmpty(nextLi, "（一覧に未登録）");
        return;
      }

      const prev = i > 0 ? list[i - 1] : null;
      const next = i < list.length - 1 ? list[i + 1] : null;

      // prev
      prevLi.innerHTML = "← 前の記事：";
      if (prev) {
        prevLi.appendChild(makeLink(prev.title || "(no title)", prev.url));
      } else {
        prevLi.appendChild(document.createTextNode(" "));
        const s = document.createElement("span");
        s.className = "sub";
        s.textContent = "（これが最初）";
        prevLi.appendChild(s);
      }

      // next
      nextLi.innerHTML = "次の記事 →：";
      if (next) {
        nextLi.appendChild(makeLink(next.title || "(no title)", next.url));
      } else {
        nextLi.appendChild(document.createTextNode(" "));
        const s = document.createElement("span");
        s.className = "sub";
        s.textContent = "（これが最新）";
        nextLi.appendChild(s);
      }
    } catch (e) {
      setEmpty(prevLi, "（読み込み失敗）");
      setEmpty(nextLi, "（読み込み失敗）");
    }
  })();
})();
