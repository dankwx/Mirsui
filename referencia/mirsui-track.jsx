// Mirsui — Faixa (track) · redesenhada na direção Acervo
const { useState } = React;

const M = window.MIRSUI;
const U = M.user;
const ini = M.initials;

// ---- dados da faixa (mock; em produção viriam da API) ----
const TRACK = {
  title: "Cemitério",
  artist: "Yung Buda",
  album: "Cemitério",
  year: 2021,
  released: "23 abr 2021",
  duration: "4:48",
  tone: "#1b2026", // capa-placeholder fria, como a arte azul do túmulo
  trending: true,
  plays: "2.1B",
  popularity: 14,
  spec: [
    { k: "Gênero", v: "Synthpop · R&B" },
    { k: "Gravadora", v: "XO, Republic" },
    { k: "Produção", v: "The Weeknd, Max Martin" },
    { k: "BPM", v: "171" },
    { k: "Tom", v: "F♯ menor" },
  ],
};

// reivindicações iniciais (cronológico — quem cravou primeiro)
const CLAIMERS = [
  { handle: "displayoo", name: "displayoo", when: "jun 2024", ord: 1 },
  { handle: "dankwx130", name: "dankwx130", when: "há 1 mês", ord: 2 },
];

/* ---------- primitivos (mesma linguagem do app) ---------- */
function Glyph({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" fill="var(--acc)" />
    </svg>
  );
}
function I({ d, size = 16, fill = "none", w = 1.8, style, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill={fill === "none" ? "none" : "currentColor"} stroke={fill === "none" ? "currentColor" : "none"}
      strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}
const IC = {
  play: "M7 4.5v15l13-7.5z",
  pause: ["M8 5v14", "M16 5v14"],
  heart: "M12 20.5 4.3 12.9a4.6 4.6 0 0 1 6.5-6.5l1.2 1.2 1.2-1.2a4.6 4.6 0 1 1 6.5 6.5z",
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M21 21l-4.3-4.3"],
  share: ["M18 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M6 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M18 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M8.2 10.9l7.6-4.3", "M8.2 13.1l7.6 4.3"],
  msg: "M21 12a8 8 0 0 1-11.2 7.3L4 21l1.7-5.8A8 8 0 1 1 21 12Z",
  spotify: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M7.5 10c3-.8 6-.5 8.5 1", "M8 13c2.4-.6 4.7-.3 6.6 1", "M8.6 15.6c1.8-.4 3.4-.2 4.9.8"],
  yt: ["M22 12c0-2.2-.2-3.4-.5-4-.3-.6-.9-1-1.5-1.2C18.6 6.5 12 6.5 12 6.5s-6.6 0-8 .3c-.6.2-1.2.6-1.5 1.2-.3.6-.5 1.8-.5 4s.2 3.4.5 4c.3.6.9 1 1.5 1.2 1.4.3 8 .3 8 .3s6.6 0 8-.3c.6-.2 1.2-.6 1.5-1.2.3-.6.5-1.8.5-4Z", "M10.2 14.7V9.3l4.6 2.7z"],
  back: ["M19 12H5", "M11 18l-6-6 6-6"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3.5 2"],
  crown: "M4 18h16M5 8l3.5 3L12 6l3.5 5L19 8l-1.5 10H6.5z",
  spark: "M12 3v6m0 6v6m9-9h-6m-6 0H3m13.5-6.5L13 9m-2 6-4.5 4.5m13 0L15 15m-2-6L7.5 4.5",
  arrowup: ["M12 19V5", "M6 11l6-6 6 6"],
};

function Cover({ tone, size }) {
  return (
    <div className="cover-art" style={{ "--tone": tone }}>
      <span className="cover-ini" style={size ? { fontSize: size } : undefined}>{ini(TRACK.artist)}</span>
    </div>
  );
}

/* ---------- preview (limpo, sem embed pesado) ---------- */
function Preview() {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="card prev">
      <button className={"prev-play" + (playing ? " on" : "")} onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pausar" : "Tocar prévia"}>
        <I d={playing ? IC.pause : IC.play} size={20} fill={playing ? "none" : "x"} w={2} />
      </button>
      <div className="prev-mid">
        <div className="prev-top">
          <span className="prev-eyebrow mono">Prévia · 0:30</span>
          <span className="prev-time mono">{playing ? "0:12" : "0:00"} / {TRACK.duration}</span>
        </div>
        <div className="wave" aria-hidden="true">
          {WAVE.map((h, i) => (
            <span key={i} className={"wb" + (playing && i < 14 ? " lit" : "")} style={{ height: h + "%" }} />
          ))}
        </div>
      </div>
      <div className="prev-links">
        <a href="#" className="b b-ghost"><I d={IC.spotify} size={15} /> Spotify</a>
        <a href="#" className="b b-ghost"><I d={IC.yt} size={15} fill="x" /> YouTube</a>
      </div>
    </section>
  );
}
const WAVE = [30,52,40,68,46,80,58,90,70,55,84,48,62,38,72,50,88,42,60,34,76,52,66,44,82,38,58,48,70,40,86,50,62,36,74,46,54,42];

/* ---------- timeline (corrida pelo claim) ---------- */
function Timeline({ claimers, youClaimed }) {
  const rows = [
    { kind: "release", when: TRACK.released, title: "Lançada", note: `"${TRACK.album}" sai no mundo` },
    ...claimers.map((c) => ({
      kind: "claim", when: c.when, ord: c.ord,
      title: c.ord === 1 ? "1º a reivindicar" : `${c.ord}º a reivindicar`,
      who: c.name, first: c.ord === 1,
    })),
  ];
  return (
    <section className="block">
      <div className="bhead">
        <div className="btitle"><h3>A corrida pelo claim</h3><span className="ct">{claimers.length} reivindicações</span></div>
        <span className="bhint mono">quem cravou antes do algoritmo</span>
      </div>
      <ol className="tl">
        {rows.map((r, i) => (
          <li className={"tl-row" + (r.first ? " first" : "")} key={i}>
            <span className="tl-when mono">{r.when}</span>
            <span className="tl-mark"><span className="tl-dot" /></span>
            <div className="tl-body">
              <div className="tl-title">
                {r.title}
                {r.first && <span className="tl-badge mono"><I d={IC.crown} size={11} /> primeiro hipster</span>}
              </div>
              {r.kind === "claim"
                ? <div className="tl-note">por <a href="Mirsui - Perfil.html" className="lnk">@{r.who}</a></div>
                : <div className="tl-note">{r.note}</div>}
            </div>
          </li>
        ))}
        <li className={"tl-row ghost" + (youClaimed ? " done" : "")}>
          <span className="tl-when mono">{youClaimed ? "agora" : "—"}</span>
          <span className="tl-mark"><span className="tl-dot" /></span>
          <div className="tl-body">
            <div className="tl-title">{youClaimed ? `${claimers.length + 1}º a reivindicar` : "Próximo da fila"}</div>
            <div className="tl-note">{youClaimed ? <>por <a href="Mirsui - Perfil.html" className="lnk">@{U.handle}</a> · você cravou</> : "reivindique e marque seu lugar na linha do tempo"}</div>
          </div>
        </li>
      </ol>
    </section>
  );
}

/* ---------- App ---------- */
function TrackApp() {
  const [claimed, setClaimed] = useState(false);
  const claimers = claimed ? [...CLAIMERS, { handle: U.handle, name: U.name, when: "agora", ord: CLAIMERS.length + 1, you: true }] : CLAIMERS;
  const total = claimers.length;

  return (
    <React.Fragment>
      {/* NAV */}
      <div className="nav-bar">
        <nav className="nav wrap">
          <div className="logo"><Glyph /> Mirsui</div>
          <div className="links">
            <a href="Mirsui - Home.html">Início</a>
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

      {/* HERO */}
      <header className="track-hero">
        <div className="th-halo" style={{ "--tone": TRACK.tone }} aria-hidden="true" />
        <div className="wrap th-grid">
          <a href="Mirsui - Home.html" className="th-back mono"><I d={IC.back} size={14} /> voltar</a>
          <div className="th-cover"><Cover tone={TRACK.tone} size="84px" /></div>
          <div className="th-info">
            <div className="th-tags">
              {TRACK.trending && <span className="tag-hot"><I d={IC.arrowup} size={12} w={2.2} /> Em alta</span>}
              <span className="th-genre mono">{TRACK.spec[0].v}</span>
            </div>
            <h1 className="th-title">{TRACK.title}</h1>
            <a href="#" className="th-artist">{TRACK.artist}</a>
            <div className="th-meta mono">
              <span>{TRACK.album}</span><span className="dot">·</span>
              <span>{TRACK.year}</span><span className="dot">·</span>
              <span className="th-dur"><I d={IC.clock} size={13} /> {TRACK.duration}</span>
            </div>

            <div className="th-actions">
              <button className={"b " + (claimed ? "b-ghost" : "b-acc") + " b-claim"} onClick={() => setClaimed((c) => !c)}>
                <I d={IC.heart} size={16} fill={claimed ? "none" : "x"} /> {claimed ? "Reivindicada" : "Reivindicar"}
              </button>
              <button className="b b-ghost icon" aria-label="Comentar"><I d={IC.msg} size={16} /></button>
              <button className="b b-ghost icon" aria-label="Compartilhar"><I d={IC.share} size={16} /></button>
            </div>

            <p className="th-hook">
              {claimed
                ? <><span className="early-dot" /> Você é o <b>{total}º</b> a reivindicar <span className="dot mono">·</span> entrou pra história dessa faixa</>
                : <><span className="early-dot" /> <b>{total}</b> já reivindicaram <span className="dot mono">·</span> seja o <b>{total + 1}º</b> antes de virar mainstream</>}
            </p>
          </div>
        </div>
      </header>

      <div className="wrap"><div className="rule" /></div>

      {/* CORPO */}
      <div className="wrap track-grid">
        <main className="track-main">
          <Preview />
          <Timeline claimers={claimers} youClaimed={claimed} />
        </main>

        <aside className="rail">
          {/* Ficha técnica */}
          <section className="rail-card">
            <span className="rail-title">Ficha técnica</span>
            <dl className="spec">
              {TRACK.spec.map((s) => (
                <div className="spec-row" key={s.k}>
                  <dt>{s.k}</dt><dd>{s.v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Reivindicações */}
          <section className="rail-card">
            <div className="rail-head">
              <span className="rail-title">Reivindicações</span>
              <span className="rail-sub">{total} no total</span>
            </div>
            <ol className="claimers">
              {claimers.map((c) => (
                <li className={"claimer" + (c.you ? " you" : "")} key={c.handle}>
                  <span className={"cl-rank mono" + (c.ord === 1 ? " gold" : "")}>{c.ord === 1 ? <I d={IC.crown} size={13} /> : String(c.ord).padStart(2, "0")}</span>
                  <div className="r-av cl-av">{c.name.slice(0, 1).toUpperCase()}</div>
                  <div className="cl-meta">
                    <span className="cl-name">{c.name}{c.you && <span className="cl-you">você</span>}</span>
                    <span className="cl-when mono">{c.ord === 1 ? "primeiro hipster" : "reivindicou"} · {c.when}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Números */}
          <section className="rail-card">
            <span className="rail-title">Números</span>
            <div className="nums">
              <div className="ws"><span className="ws-n">{total}</span><span className="ws-l">reivindicações</span></div>
              <div className="ws"><span className="ws-n">{TRACK.popularity}</span><span className="ws-l">popularidade</span></div>
              <div className="ws hero"><span className="ws-n">{TRACK.plays}</span><span className="ws-l">reproduções</span></div>
            </div>
          </section>
        </aside>
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<TrackApp />);
