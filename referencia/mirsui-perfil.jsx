// Mirsui — Perfil (direção Acervo · Letterboxd) — página de produção
const { useState, useMemo } = React;

const M = window.MIRSUI;
const U = M.user;
const TRACKS = M.tracks;
const ini = M.initials;

// ---- derivados (dado honesto) ----
const earlyCount = TRACKS.filter((t) => t.early).length;
const favCount = TRACKS.filter((t) => t.fav).length;
const favTracks = TRACKS.filter((t) => t.fav).slice(0, 4);
const artistCount = new Set(TRACKS.map((t) => t.artist.split(",")[0].trim())).size;

const MES = { jan: "jan", fev: "fev", mar: "mar", abr: "abr", mai: "mai", jun: "jun", jul: "jul", ago: "ago", set: "set", out: "out", nov: "nov", dez: "dez" };
const when = (t) => `${MES[t.month] || t.month} ${t.year}`;

// tom estável a partir do nome do artista
const TONES = ["#241f1a", "#1c2320", "#27201f", "#1b2026", "#231d27", "#202420", "#2a201b", "#1a2326", "#25211c", "#1d2126", "#26211f", "#1f231d"];
function tone(artist) {
  let h = 0;
  for (let i = 0; i < artist.length; i++) h = (h * 31 + artist.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

/* ---------- primitivos ---------- */
function Glyph({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" fill="var(--acc)" />
    </svg>
  );
}
function Cover({ artist }) {
  return (
    <div className="cover-art" style={{ "--tone": tone(artist) }}>
      <span className="cover-ini">{ini(artist)}</span>
    </div>
  );
}
function I({ d, size = 16, fill = "none", w = 1.8, style, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill === "none" ? "none" : "currentColor"}
      stroke={fill === "none" ? "currentColor" : "none"} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}
const IC = {
  play: "M7 4.5v15l13-7.5z",
  heart: "M12 20.5 4.3 12.9a4.6 4.6 0 0 1 6.5-6.5l1.2 1.2 1.2-1.2a4.6 4.6 0 1 1 6.5 6.5z",
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M21 21l-4.3-4.3"],
  pencil: ["M4 20l1-4L16 5l3 3L8 19l-4 1Z", "M14 7l3 3"],
  share: ["M18 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M6 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M18 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M8.2 10.9l7.6-4.3", "M8.2 13.1l7.6 4.3"],
  flag: ["M5 21V4", "M5 4h11l-2 3 2 3H5"],
  chev: "M6 9l6 6 6-6",
};

const FILTERS = [
  { id: "all", label: "Tudo" },
  { id: "early", label: "Antecipadas" },
  { id: "fav", label: "Favoritas" },
];

function Perfil() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  const list = useMemo(() => {
    let l = TRACKS.slice();
    if (filter === "early") l = l.filter((t) => t.early);
    if (filter === "fav") l = l.filter((t) => t.fav);
    if (sort === "recent") l.sort((a, b) => b.ym - a.ym);
    else if (sort === "old") l.sort((a, b) => a.ym - b.ym);
    else if (sort === "az") l.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "artist") l.sort((a, b) => a.artist.localeCompare(b.artist));
    return l;
  }, [filter, sort]);

  return (
    <React.Fragment>
      {/* NAV */}
      <div className="nav-bar">
        <nav className="nav wrap">
          <div className="logo"><Glyph /> Mirsui</div>
          <div className="links">
            <a href="Mirsui - Home.html">Início</a>
            <a href="#" className="on">Acervo</a>
            <a href="#">Descobrir</a>
          </div>
          <div className="nav-right">
            <label className="search">
              <I d={IC.search} size={15} />
              <input placeholder="buscar faixa, artista…" />
            </label>
          </div>
        </nav>
      </div>

      {/* HEADER */}
      <header className="head wrap">
        <div className="av">{U.name.slice(0, 2).toLowerCase()}</div>
        <div className="hid">
          <h1 className="name">{U.name} <span className="handle">@{U.handle}</span></h1>
          <p className="bio">{U.bio}</p>
          <div className="statline">
            <div className="st"><span className="n">{TRACKS.length}</span><span className="l">faixas</span></div>
            <div className="st"><span className="n"><em>{earlyCount}</em></span><span className="l">antecipadas</span></div>
            <div className="st"><span className="n">{artistCount}</span><span className="l">artistas</span></div>
            <div className="st"><span className="n">{U.followers}</span><span className="l">seguidores</span></div>
            <div className="st"><span className="n">{U.following}</span><span className="l">seguindo</span></div>
          </div>
        </div>
        <div className="head-act">
          <button className="b b-acc"><I d={IC.pencil} size={15} /> Editar perfil</button>
          <button className="b b-ghost"><I d={IC.share} size={15} /> Compartilhar</button>
        </div>
      </header>

      <div className="wrap"><div className="rule" /></div>

      {/* FAVORITAS */}
      <section className="block wrap">
        <div className="bhead">
          <div className="btitle"><h3>Favoritas</h3><span className="ct">{favCount} faixas</span></div>
        </div>
        <div className="favs">
          {favTracks.map((t) => (
            <a href="#" className="fav" key={t.id}>
              <div className="cover-wrap">
                <Cover artist={t.artist} />
                <div className="fav-badge"><I d={IC.heart} size={13} fill="x" /></div>
              </div>
              <div className="ftt">{t.title}</div>
              <div className="far">{t.artist}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ACERVO */}
      <section className="block-wide wrap">
        <div className="bhead">
          <div className="btitle">
            <h3>Acervo salvo</h3>
            <span className="ct">{list.length} {list.length === 1 ? "faixa" : "faixas"}{filter === "all" ? ` · ${earlyCount} antecipadas` : ""}</span>
          </div>
          <div className="controls">
            <div className="filters">
              {FILTERS.map((f) => (
                <button key={f.id} className={"filter" + (filter === f.id ? " on" : "")} onClick={() => setFilter(f.id)}>{f.label}</button>
              ))}
            </div>
            <div className="sort">
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
                <option value="recent">Mais recentes</option>
                <option value="old">Mais antigas</option>
                <option value="az">Título A–Z</option>
                <option value="artist">Artista A–Z</option>
              </select>
              <I d={IC.chev} size={14} className="chev" />
            </div>
          </div>
        </div>

        <div className="wall">
          {list.length === 0 && <div className="empty">nenhuma faixa neste filtro</div>}
          {list.map((t) => (
            <a href="#" className="poster" key={t.id}>
              <div className="cover-wrap">
                <Cover artist={t.artist} />
                {t.early && <span className="ear-tab"><I d={IC.flag} size={9} /> early</span>}
                <button className="play" onClick={(e) => e.preventDefault()} aria-label="Tocar"><I d={IC.play} size={16} fill="x" /></button>
              </div>
              <div className="pname">{t.title}</div>
              <div className="part">{t.artist}</div>
              <div className="pwhen">salvo {when(t)}</div>
            </a>
          ))}
        </div>
      </section>
    </React.Fragment>
  );
}

// chev precisa receber className — ajuste leve do componente I acima via wrapper
ReactDOM.createRoot(document.getElementById("root")).render(<Perfil />);
