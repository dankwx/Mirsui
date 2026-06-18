// Mirsui — Landing (deslogado) · direção imersiva/fotográfica, menos explicação
const { useMemo, useState, useCallback } = React;
const AuthModal = window.AuthModal;

// contexto simples p/ abrir o modal de auth de qualquer botão
const AuthCtx = React.createContext(() => {});
const useAuth = () => React.useContext(AuthCtx);

const M = window.MIRSUI;
const ini = M.initials;

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
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
  flag: ["M5 21V4", "M5 4h11l-2 3 2 3H5"],
  trend: ["M3 17l6-6 4 4 7-7", "M17 8h4v4"],
};

/* ---------- Nav flutuante ---------- */
function Nav() {
  const openAuth = useAuth();
  return (
    <div className="lp-nav">
      <nav className="nav wrap">
        <div className="logo"><Glyph /> Mirsui</div>
        <div className="links">
          <a href="#cena">A cena</a>
          <a href="#manifesto">Sobre</a>
        </div>
        <div className="nav-right">
          <button className="b b-light" onClick={() => openAuth("login")}>Entrar</button>
          <button className="b b-acc" onClick={() => openAuth("signup")}>Criar conta</button>
        </div>
      </nav>
    </div>
  );
}

/* ---------- Ticker ao vivo ---------- */
function Ticker() {
  // monta o feed de carimbos a partir dos dados reais (duplicado p/ loop perfeito)
  const items = useMemo(() => {
    const base = M.feed.map((f) => ({
      who: f.user.name,
      track: f.track.title,
      artist: f.track.artist,
      ago: f.timeago.replace("há ", ""),
    }));
    // intercala uns "agora" pra dar sensação de tempo real
    base[0].ago = "agora";
    base[1].ago = "há 1 min";
    return [...base, ...base];
  }, []);
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-lead"><span className="live-dot" /> ao vivo</div>
      <div className="ticker-track">
        {items.map((it, i) => (
          <span className="ti" key={i}>
            <span className="early-dot" />
            <b>{it.who}</b> carimbou <span className="tk">{it.track}</span> — {it.artist}
            <span className="ago">· {it.ago}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const openAuth = useAuth();
  return (
    <header className="hero">
      <div className="hero-photo" aria-hidden="true"></div>
      <div className="hero-grain" aria-hidden="true"></div>
      <Nav />
      <div className="hero-inner wrap">
        <span className="hero-kick"><span className="live-dot" /> A cena, ao vivo</span>
        <h1>Você ouviu primeiro.</h1>
        <p className="hero-sub">Cave som antes de todo mundo. Carimba, e fica registrado que a descoberta foi sua.</p>
        <div className="hero-cta">
          <button className="b b-acc" onClick={() => openAuth("signup")}>Criar conta grátis <I d={IC.arrow} size={16} /></button>
          <button className="b b-light" onClick={() => openAuth("login")}>Já tenho conta</button>
        </div>
      </div>
      <Ticker />
    </header>
  );
}

/* ---------- Subindo na cena (wall horizontal) ---------- */
function Wall() {
  // ordena por carimbos da semana p/ virar "ranking", usa o acervo todo p/ volume
  const list = useMemo(() => {
    const adds = {};
    M.rising.forEach((r) => { adds[r.title] = r.adds; });
    return M.tracks
      .map((t) => ({ ...t, adds: adds[t.title] || 2 + ((t.id * 7) % 11) }))
      .sort((a, b) => b.adds - a.adds);
  }, []);
  return (
    <section className="wall-sec" id="cena">
      <div className="wrap">
        <div className="wall-head">
          <div className="sec-head">
            <span className="eyebrow"><span className="early-dot" /> Subindo na cena</span>
            <h2>O que tá sendo carimbado agora.</h2>
            <p className="sh-sub">Ainda dá tempo de salvar antes de virar tendência.</p>
          </div>
          <a href="Mirsui - Home.html" className="b b-solid">Explorar tudo <I d={IC.arrow} size={15} /></a>
        </div>
        <div className="hwall">
          {list.map((t, i) => (
            <a href="Mirsui - Home.html" className="poster" key={t.id}>
              <div className="cover-wrap">
                <span className="rank-chip">#{String(i + 1).padStart(2, "0")}</span>
                {t.early && <span className="ear-tab"><I d={IC.flag} size={9} /> early</span>}
                <Cover artist={t.artist} tone={t.tone} />
                <button className="play" onClick={(e) => e.preventDefault()} aria-label="Ouvir prévia"><I d={IC.play} size={16} fill="x" /></button>
              </div>
              <div className="ptt">{t.title}</div>
              <div className="par">{t.artist}</div>
              <div className="padds"><I d={IC.trend} size={12} /> +{t.adds} essa semana</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Manifesto ---------- */
function Manifesto() {
  return (
    <section className="manifesto wrap" id="manifesto">
      <p>O algoritmo te entrega o que já bombou. O Mirsui guarda o que você ouviu <em>antes</em>.</p>
      <div className="sig">Mirsui — acervo de quem ouve primeiro</div>
    </section>
  );
}

/* ---------- CTA final ---------- */
function EndCTA() {
  const openAuth = useAuth();
  return (
    <section className="endcta wrap">
      <h2>Entra e começa a cavar.</h2>
      <p>Som novo todo dia. Carimba o que você curtir e monta o histórico de quem ouviu antes.</p>
      <div><button className="b b-acc" onClick={() => openAuth("signup")}>Criar conta grátis <I d={IC.arrow} size={16} /></button></div>
      <div className="fine">Grátis · sem cartão · sem algoritmo</div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Foot() {
  const cols = [
    { h: "Plataforma", links: ["A cena", "Descobrir", "Acervo"] },
    { h: "Mirsui", links: ["Sobre", "Privacidade", "Contato"] },
  ];
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="logo"><Glyph size={20} /> Mirsui</div>
            <p>Acervo coletivo de descoberta musical. Para quem ouve primeiro e tem como provar.</p>
          </div>
          <div className="foot-cols">
            {cols.map((c) => (
              <div className="fcol" key={c.h}>
                <h5>{c.h}</h5>
                {c.links.map((l) => <a href="#" key={l}>{l}</a>)}
              </div>
            ))}
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 Mirsui · Rio de Janeiro</span>
          <div className="foot-soc">
            <a href="#">Instagram</a>
            <a href="#">X</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  const [auth, setAuth] = useState({ open: false, mode: "signup" });
  const openAuth = useCallback((mode) => setAuth({ open: true, mode }), []);
  const closeAuth = useCallback(() => setAuth((a) => ({ ...a, open: false })), []);
  const switchAuth = useCallback((mode) => setAuth({ open: true, mode }), []);
  return (
    <AuthCtx.Provider value={openAuth}>
      <Hero />
      <Wall />
      <Manifesto />
      <EndCTA />
      <Foot />
      <AuthModal open={auth.open} mode={auth.mode} onClose={closeAuth} onSwitch={switchAuth} />
    </AuthCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Landing />);
