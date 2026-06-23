'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, signup } from '../../app/auth/actions'
import { createClient } from '@/utils/supabase/client'
import { capture } from '@/lib/posthog'

type AuthMode = 'login' | 'signup'

interface LoginModalProps {
    trigger: React.ReactNode
    onLogin?: (email: string, password: string) => void
    defaultMode?: AuthMode
}

/* ---------- estilos (injetados uma vez) ---------- */
const AUTH_CSS = `
.au-scrim{
  --line:rgba(236,232,224,.085); --line2:rgba(236,232,224,.15);
  --fill1:rgba(236,232,224,.035); --fill2:rgba(236,232,224,.07);
  --text:#ece8e0; --text2:#9b958b; --text3:#6a655c;
  --acc:#84b86a; --acc-soft:rgba(132,184,106,.14); --on-acc:#0e1408;
  --mono:var(--font-space-grotesk),'Space Grotesk',system-ui,sans-serif;
  position:fixed; inset:0; z-index:200; display:grid; place-items:center;
  padding:24px; overflow:auto;
  background:rgba(8,7,6,0); backdrop-filter:blur(0px);
  transition:background .42s ease, backdrop-filter .42s ease;
  font-family:var(--font-hanken),system-ui,sans-serif;
}
.au-scrim *{ box-sizing:border-box; }
.au-scrim.show{ background:rgba(8,7,6,.62); backdrop-filter:blur(7px); }

.au-card{
  position:relative; width:100%; max-width:416px;
  background:linear-gradient(180deg, #1d1915, #161310);
  border:1px solid var(--line2); border-radius:20px;
  padding:38px 36px 30px; margin:auto; color:var(--text);
  box-shadow:0 32px 80px -24px rgba(0,0,0,.7), 0 2px 0 rgba(236,232,224,.04) inset;
  opacity:0; transform:translateY(20px) scale(.965);
  transition:opacity .44s cubic-bezier(.16,1,.3,1), transform .44s cubic-bezier(.16,1,.3,1);
}
.au-scrim.show .au-card{ opacity:1; transform:translateY(0) scale(1); }

.au-glow{
  position:absolute; left:50%; top:-40px; transform:translateX(-50%);
  width:280px; height:160px; pointer-events:none; z-index:0;
  background:radial-gradient(closest-side, var(--acc-soft), transparent 72%);
  filter:blur(14px); opacity:0; transition:opacity .6s ease .1s;
}
.au-scrim.show .au-glow{ opacity:.9; }

.au-close{
  position:absolute; top:16px; right:16px; z-index:3;
  width:34px; height:34px; display:grid; place-items:center; cursor:pointer;
  border-radius:50%; border:1px solid transparent; background:transparent;
  color:var(--text3); transition:color .14s, background .14s, border-color .14s;
}
.au-close:hover{ color:var(--text); background:var(--fill1); border-color:var(--line); }

.au-inner{ position:relative; z-index:2; }

.au-mark{
  display:grid; place-items:center; width:60px; height:60px; margin:0 auto;
  border-radius:16px; border:1px solid var(--line); background:var(--fill1);
  transform:rotate(-16deg) scale(.8); opacity:0;
  transition:transform .55s cubic-bezier(.16,1,.3,1) .06s, opacity .5s ease .06s;
}
.au-scrim.show .au-mark{ transform:rotate(0) scale(1); opacity:1; }

.au-head{ text-align:center; margin-top:18px; }
.au-eyebrow{
  font-family:var(--mono); font-size:10.5px; letter-spacing:.22em; text-transform:uppercase;
  color:var(--acc);
}
.au-title{ margin:9px 0 0; font-size:24px; font-weight:800; letter-spacing:-.03em; line-height:1.05; }
.au-sub{ margin:8px 0 0; font-size:13.5px; line-height:1.5; color:var(--text2); }

.au-swap{ animation:auFade .4s cubic-bezier(.16,1,.3,1) both; }
@keyframes auFade{ from{ opacity:0; transform:translateY(7px); } to{ opacity:1; transform:translateY(0); } }

.au-oauth{
  display:flex; align-items:center; justify-content:center; gap:10px; width:100%; cursor:pointer;
  margin-top:24px; padding:12px 16px; border-radius:11px;
  border:1px solid var(--line2); background:var(--fill1); color:var(--text);
  font-size:14px; font-weight:600;
  transition:background .14s, border-color .14s, transform .1s;
}
.au-oauth:hover{ background:var(--fill2); border-color:var(--text3); }
.au-oauth:active{ transform:translateY(1px); }
.au-oauth:disabled{ opacity:.6; cursor:default; }

.au-div{ display:flex; align-items:center; gap:14px; margin:20px 0 4px; color:var(--text3); }
.au-div::before, .au-div::after{ content:""; height:1px; flex:1; background:var(--line); }
.au-div span{ font-family:var(--mono); font-size:10px; letter-spacing:.16em; text-transform:uppercase; }

.au-form{ display:flex; flex-direction:column; gap:12px; margin-top:16px; }

.au-collapse{
  display:grid; grid-template-rows:0fr; opacity:0;
  transition:grid-template-rows .42s cubic-bezier(.16,1,.3,1), opacity .32s ease, margin .42s ease;
  margin-bottom:-12px;
}
.au-collapse.open{ grid-template-rows:1fr; opacity:1; margin-bottom:0; }
.au-collapse > div{ overflow:hidden; }

.au-field{ display:flex; flex-direction:column; gap:6px; }
.au-field label{
  font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--text3);
}
.au-input{
  width:100%; padding:12px 14px; border-radius:11px;
  border:1px solid var(--line2); background:var(--fill1); color:var(--text);
  font-family:inherit; font-size:14.5px; outline:none;
  transition:border-color .16s, background .16s, box-shadow .16s;
}
.au-input::placeholder{ color:var(--text3); }
.au-input:focus{ border-color:var(--acc); background:var(--fill2); box-shadow:0 0 0 3px var(--acc-soft); }

.au-row{ display:flex; align-items:center; justify-content:space-between; margin-top:2px; }
.au-check{ display:flex; align-items:center; gap:8px; font-size:12.5px; color:var(--text2); cursor:pointer; user-select:none; }
.au-check input{ width:15px; height:15px; accent-color:var(--acc); cursor:pointer; }
.au-forgot{ font-size:12.5px; font-weight:600; color:var(--text2); transition:color .14s; background:none; border:0; cursor:pointer; }
.au-forgot:hover{ color:var(--acc); }

.au-submit{
  width:100%; margin-top:18px; padding:13px 16px; border-radius:12px; border:0; cursor:pointer;
  background:var(--acc); color:var(--on-acc); font-size:15px; font-weight:700;
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  transition:filter .14s, transform .1s;
}
.au-submit:hover{ filter:brightness(1.07); }
.au-submit:active{ transform:translateY(1px); }
.au-submit:disabled{ opacity:.6; cursor:default; }
.au-submit svg{ transition:transform .18s ease; }
.au-submit:hover svg{ transform:translateX(3px); }

.au-msg{
  margin-top:14px; padding:10px 13px; border-radius:11px; font-size:12.5px; line-height:1.45;
  animation:auFade .3s ease both;
}
.au-msg.err{ border:1px solid rgba(220,120,110,.3); background:rgba(220,120,110,.12); color:#f0c4bf; }
.au-msg.ok{ border:1px solid var(--acc-soft); background:var(--acc-soft); color:#cfe5be; }

.au-fine{
  margin-top:14px; text-align:center; font-size:11.5px; line-height:1.5; color:var(--text3);
}
.au-fine a{ color:var(--text2); text-decoration:underline; text-underline-offset:2px; cursor:pointer; }
.au-fine a:hover{ color:var(--text); }

.au-foot{
  margin-top:22px; padding-top:18px; border-top:1px solid var(--line);
  text-align:center; font-size:13.5px; color:var(--text2);
}
.au-foot button{
  border:0; background:transparent; color:var(--acc); font-weight:700; font-size:13.5px; cursor:pointer;
}
.au-foot button:hover{ text-decoration:underline; text-underline-offset:3px; }

@media (max-width:440px){ .au-card{ padding:34px 24px 26px; border-radius:18px; } }
@media (prefers-reduced-motion: reduce){
  .au-card, .au-mark, .au-glow, .au-scrim, .au-swap, .au-collapse{ transition:none !important; animation:none !important; }
}
`

function injectAuthCSS() {
    if (typeof document === 'undefined') return
    if (document.getElementById('mirsui-auth-css')) return
    const el = document.createElement('style')
    el.id = 'mirsui-auth-css'
    el.textContent = AUTH_CSS
    document.head.appendChild(el)
}

/* ---------- Magatama "joia" ---------- */
const MG_PATH = 'M50 10 A40 40 0 0 1 50 90 A20 20 0 0 0 50 50 A20 20 0 0 1 50 10 Z'
function Magatama({ size = 30 }: { size?: number }) {
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
            <path d={MG_PATH} fill="var(--text)" />
            <circle cx="50" cy="30" r="7" fill="var(--acc)" />
        </svg>
    )
}
function ArrowIco({ size = 16 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
        </svg>
    )
}
function GoogleIco() {
    return (
        <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
            <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3.1 0 5.9 1.2 8 3.1l5.7-5.7A20 20 0 1 0 24 44c11 0 19.5-8 19.5-20 0-1.3-.1-2.3-.4-3.5z"
            />
            <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7A20 20 0 0 0 6.3 14.7z"
            />
            <path
                fill="#4CAF50"
                d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5C9.6 39.6 16.3 44 24 44z"
            />
            <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C39.9 36 43.5 30.6 43.5 24c0-1.3-.1-2.3-.9-3.5z"
            />
        </svg>
    )
}

/* ---------- copy por modo ---------- */
const COPY = {
    signup: {
        eyebrow: 'Comece agora',
        title: 'Crie sua conta',
        sub: 'Grátis, sem cartão. Carimba o que ouvir e prova que chegou primeiro.',
        oauth: 'Criar conta com Google',
        submit: 'Criar conta',
        footQ: 'Já tem conta?',
        footA: 'Entrar',
    },
    login: {
        eyebrow: 'Bem-vindo de volta',
        title: 'Entrar no Mirsui',
        sub: 'Continue de onde parou e siga cavando a cena.',
        oauth: 'Entrar com Google',
        submit: 'Entrar',
        footQ: 'Ainda não tem conta?',
        footA: 'Criar conta',
    },
} as const

const LoginModal: React.FC<LoginModalProps> = ({
    trigger,
    onLogin,
    defaultMode = 'login',
}) => {
    const [open, setOpen] = useState(false)
    const [render, setRender] = useState(false)
    const [show, setShow] = useState(false)
    const [mode, setMode] = useState<AuthMode>(defaultMode)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const emailRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const resetFeedback = () => {
        setError(null)
        setStatus(null)
    }

    const openModal = () => {
        setMode(defaultMode)
        resetFeedback()
        setOpen(true)
    }
    const close = useCallback(() => setOpen(false), [])

    useEffect(() => {
        injectAuthCSS()
    }, [])

    // ciclo de montagem / animação
    useEffect(() => {
        let t1: ReturnType<typeof setTimeout>
        let t2: ReturnType<typeof setTimeout>
        if (open) {
            setRender(true)
            t1 = setTimeout(() => {
                setShow(true)
                emailRef.current?.focus({ preventScroll: true })
            }, 24)
        } else {
            setShow(false)
            t2 = setTimeout(() => setRender(false), 460)
        }
        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
        }
    }, [open])

    // esc + trava de scroll
    useEffect(() => {
        if (!render) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close()
        }
        document.addEventListener('keydown', onKey)
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = prev
        }
    }, [render, close])

    const switchMode = (next: AuthMode) => {
        setMode(next)
        resetFeedback()
    }

    const handleGoogle = async () => {
        resetFeedback()
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/confirm`,
                },
            })
            if (error) throw error
        } catch (err) {
            console.error('Google OAuth error:', err)
            setError('Não foi possível entrar com o Google. Tente novamente.')
            setLoading(false)
        }
    }

    const handleForgot = async () => {
        resetFeedback()
        if (!email) {
            setError('Digite seu e-mail primeiro.')
            return
        }
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/confirm`,
            })
            if (error) throw error
            setStatus(
                'Se o e-mail estiver cadastrado, você receberá um link em instantes.'
            )
        } catch (err) {
            console.error('Password reset error:', err)
            setError('Erro ao enviar e-mail de recuperação.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        resetFeedback()
        setLoading(true)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        try {
            if (mode === 'signup') {
                formData.append('username', name)
                const result = await signup(formData)
                if (result?.error) {
                    setError(result.error)
                } else {
                    capture('user_signed_up', { method: 'email' })
                    router.push(
                        `/auth/check-email?email=${encodeURIComponent(email)}`
                    )
                    close()
                }
                return
            }

            const result = await login(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                capture('user_logged_in', { method: 'email' })
                onLogin?.(email, password)
                setStatus('Login realizado com sucesso.')
                close()
                router.refresh()
            }
        } catch (err) {
            console.error('Authentication error', err)
            setError('Ocorreu um erro inesperado. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const isSignup = mode === 'signup'
    const c = COPY[mode]

    const modal =
        render && typeof document !== 'undefined'
            ? createPortal(
                  <div
                      className={'au-scrim' + (show ? ' show' : '')}
                      onMouseDown={(e) => {
                          if (e.target === e.currentTarget) close()
                      }}
                  >
                      <div
                          className="au-card"
                          role="dialog"
                          aria-modal="true"
                          aria-label={c.title}
                      >
                          <div className="au-glow" aria-hidden="true" />
                          <button
                              className="au-close"
                              onClick={close}
                              aria-label="Fechar"
                              type="button"
                          >
                              <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                              >
                                  <path d="M6 6l12 12M18 6L6 18" />
                              </svg>
                          </button>

                          <div className="au-inner">
                              <div className="au-mark">
                                  <Magatama size={30} />
                              </div>

                              <div className="au-head au-swap" key={mode}>
                                  <div className="au-eyebrow">{c.eyebrow}</div>
                                  <h2 className="au-title">{c.title}</h2>
                                  <p className="au-sub">{c.sub}</p>
                              </div>

                              <button
                                  className="au-oauth"
                                  type="button"
                                  onClick={handleGoogle}
                                  disabled={loading}
                              >
                                  <GoogleIco /> {c.oauth}
                              </button>

                              <div className="au-div">
                                  <span>ou com e-mail</span>
                              </div>

                              <form className="au-form" onSubmit={handleSubmit}>
                                  <div
                                      className={
                                          'au-collapse' + (isSignup ? ' open' : '')
                                      }
                                  >
                                      <div>
                                          <div className="au-field">
                                              <label htmlFor="au-name">Nome</label>
                                              <input
                                                  className="au-input"
                                                  id="au-name"
                                                  type="text"
                                                  placeholder="Como te chamam"
                                                  autoComplete="name"
                                                  tabIndex={isSignup ? 0 : -1}
                                                  value={name}
                                                  onChange={(e) =>
                                                      setName(e.target.value)
                                                  }
                                                  required={isSignup}
                                              />
                                          </div>
                                      </div>
                                  </div>

                                  <div className="au-field">
                                      <label htmlFor="au-email">E-mail</label>
                                      <input
                                          ref={emailRef}
                                          className="au-input"
                                          id="au-email"
                                          type="email"
                                          placeholder="voce@email.com"
                                          autoComplete="email"
                                          value={email}
                                          onChange={(e) =>
                                              setEmail(e.target.value)
                                          }
                                          required
                                      />
                                  </div>

                                  <div className="au-field">
                                      <label htmlFor="au-pass">Senha</label>
                                      <input
                                          className="au-input"
                                          id="au-pass"
                                          type="password"
                                          placeholder={
                                              isSignup
                                                  ? 'Crie uma senha'
                                                  : 'Sua senha'
                                          }
                                          autoComplete={
                                              isSignup
                                                  ? 'new-password'
                                                  : 'current-password'
                                          }
                                          value={password}
                                          onChange={(e) =>
                                              setPassword(e.target.value)
                                          }
                                          required
                                      />
                                  </div>

                                  {!isSignup && (
                                      <div className="au-row">
                                          <label className="au-check">
                                              <input type="checkbox" /> Manter
                                              conectado
                                          </label>
                                          <button
                                              type="button"
                                              className="au-forgot"
                                              onClick={handleForgot}
                                          >
                                              Esqueci a senha
                                          </button>
                                      </div>
                                  )}

                                  <button
                                      className="au-submit"
                                      type="submit"
                                      disabled={loading}
                                  >
                                      {loading ? 'Aguarde…' : c.submit}{' '}
                                      <ArrowIco size={16} />
                                  </button>
                              </form>

                              {error && (
                                  <div className="au-msg err">{error}</div>
                              )}
                              {status && (
                                  <div className="au-msg ok">{status}</div>
                              )}

                              {isSignup && (
                                  <p className="au-fine">
                                      Ao criar conta, você concorda com os{' '}
                                      <Link href="/termos" target="_blank">
                                          Termos
                                      </Link>{' '}
                                      e a{' '}
                                      <Link href="/privacidade" target="_blank">
                                          Privacidade
                                      </Link>
                                      .
                                  </p>
                              )}

                              <div className="au-foot">
                                  {c.footQ}{' '}
                                  <button
                                      type="button"
                                      onClick={() =>
                                          switchMode(
                                              isSignup ? 'login' : 'signup'
                                          )
                                      }
                                  >
                                      {c.footA}
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>,
                  document.body
              )
            : null

    return (
        <>
            <span
                onClick={openModal}
                style={{ display: 'contents' }}
                role="presentation"
            >
                {trigger}
            </span>
            {modal}
        </>
    )
}

export default LoginModal
