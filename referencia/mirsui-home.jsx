// Mirsui — Home (direção Acervo) · feed da cena, estilo activity editorial
const { useState, useMemo } = React;

const M = window.MIRSUI;
const U = M.user;
const ini = M.initials;

const TONES = ["#241f1a", "#1c2320", "#27201f", "#1b2026", "#231d27", "#202420", "#2a201b", "#1a2326", "#25211c", "#1d2126", "#26211f", "#1f231d"];
function tone(artist) {
  let h = 0;
  for (let i = 0; i < artist.length; i++) h = (h * 31 + artist.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}
const ORD = ["", "1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª", "9ª", "10ª", "11ª", "12ª"];
const ordLabel = (n) => (ORD[n] ? ORD[n] : `${n}ª`);

/* ---------- primitivos ---------- */
function Glyph({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" fill="var(--acc)" />
    </svg>
  );
}
function Cover({ artist, tone: tn }) {
  return (
    <div className="cover-art" style={{ "--tone": tn || tone(artist) }}>
      <span className="cover-ini">{ini(artist)}</span>
    </div>
  );
}
function I({ d, size = 16, fill = "none", w = 1.8, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill === "none" ? "none" : "currentColor"}
      stroke={fill === "none" ? "currentColor" : "none"} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}
const IC = {
  play: "M7 4.5v15l13-7.5z",
  heart: "M12 20.5 4.3 12.9a4.6 4.6 0 0 1 6.5-6.5l1.2 1.2 1.2-1.2a4.6 4.6 0 1 1 6.5 6.5z",
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M21 21l-4.3-4.3"],
  plus: ["M12 5v14", "M5 12h14"],
};

/* ---------- Item do feed ---------- */
function FeedItem({ item, saved, onSave }) {
  const t = item.track;
  return (
    <article className="fi">
      <div className="fi-cover"><Cover artist={t.artist} tone={t.tone} /></div>
      <div className="fi-main">
        <div className="fi-who">
          <div className="av">{item.user.name.slice(0, 1)}</div>
          <span><b>{item.user.name}</b> salvou</span>
          <span className="sep">·</span>
          <span className="time">{item.timeago}</span>
        </div>
        <h3 className="fi-title">{t.title}</h3>
        <div className="fi-artist">{t.artist}</div>
        <div className="fi-foot">
          <span className={"ord" + (t.early ? " early" : "")}>
            {t.early && <span className="early-dot" />}
            <span className="num">{ordLabel(item.ordinal)}</span> a salvar
          </span>
          <span className="fi-count">{item.also} também têm</span>
          <div className="fi-actions">
            <button className={"b " + (saved ? "b-ghost" : "b-acc")} onClick={onSave}>
              <I d={saved ? IC.heart : IC.plus} size={14} fill={saved ? "x" : "none"} />
              {saved ? "Salva" : "Salvar"}
            </button>
            <button className="b b-ghost icon" aria-label="Tocar prévia"><I d={IC.play} size={14} fill="x" /></button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- Rail ---------- */
function Rail() {
  return (
    <aside className="rail">
      <section className="rail-card">
        <div className="rail-head">
          <span className="rail-title">Subindo na cena</span>
          <span className="rail-sub">semana</span>
        </div>
        <p className="rail-note">Ainda dá tempo de salvar antes de virar tendência.</p>
        <ol className="rising">
          {M.rising.map((r) => (
            <li className="rise" key={r.rank}>
              <span className="rise-rank">{String(r.rank).padStart(2, "0")}</span>
              <div className="rise-cover"><Cover artist={r.artist} tone={r.tone} /></div>
              <div className="rise-meta">
                <span className="rise-title">{r.title}</span>
                <span className="rise-artist">{r.artist}</span>
              </div>
              <span className="rise-adds">+{r.adds}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rail-card">
        <span className="rail-title">Sua semana</span>
        <div className="week">
          <div className="ws"><span className="ws-n">{String(M.week.carimbos).padStart(2, "0")}</span><span className="ws-l">salvas</span></div>
          <div className="ws hero"><span className="ws-n">{String(M.week.early).padStart(2, "0")}</span><span className="ws-l">antecipada</span></div>
        </div>
      </section>
    </aside>
  );
}

/* ---------- App ---------- */
function HomeApp() {
  const [tab, setTab] = useState("cena");
  const [saved, setSaved] = useState({});

  const feed = useMemo(
    () => (tab === "seguindo" ? M.feed.filter((f) => f.following) : M.feed),
    [tab]
  );

  return (
    <React.Fragment>
      <div className="nav-bar">
        <nav className="nav wrap">
          <div className="logo"><Glyph /> Mirsui</div>
          <div className="links">
            <a href="#" className="on">Início</a>
            <a href="Mirsui - Perfil.html">Acervo</a>
            <a href="#">Descobrir</a>
          </div>
          <div className="nav-right">
            <label className="search">
              <I d={IC.search} size={15} />
              <input placeholder="buscar faixa, artista…" />
            </label>
            <a href="Mirsui - Perfil.html" className="me-chip">
              <div className="av">{U.name.slice(0, 2).toLowerCase()}</div>
              <span className="nm">{U.name}</span>
            </a>
          </div>
        </nav>
      </div>

      <header className="home-head wrap">
        <span className="eyebrow">Agora</span>
        <h1 className="home-title">A cena, salvando em tempo real</h1>
        <p className="home-sub">Quem ouviu primeiro o quê — e o que ainda dá tempo de você salvar antes de virar tendência.</p>
        <div className="home-tabs">
          <button className={"home-tab" + (tab === "cena" ? " on" : "")} onClick={() => setTab("cena")}>Da cena</button>
          <button className={"home-tab" + (tab === "seguindo" ? " on" : "")} onClick={() => setTab("seguindo")}>De quem você segue</button>
        </div>
      </header>

      <div className="home-grid wrap">
        <div className="feed">
          {feed.length === 0 ? (
            <div className="empty">Você ainda não segue ninguém salvando.</div>
          ) : (
            feed.map((item) => (
              <FeedItem key={item.id} item={item} saved={!!saved[item.id]}
                onSave={() => setSaved((m) => ({ ...m, [item.id]: !m[item.id] }))} />
            ))
          )}
        </div>
        <Rail />
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<HomeApp />);
