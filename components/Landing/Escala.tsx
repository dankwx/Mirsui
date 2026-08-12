import { dataPorExtenso } from './landingHelpers'
import type { ObservatorioNaLanding } from '@/utils/observatoryService'

/**
 * O número do Observatório.
 *
 * É o dado mais forte da página e vivia num subtítulo de 15px no meio do site.
 * Aqui ele é a seção inteira.
 *
 * Fala de escala e nunca de duração. A série tem poucos dias: "medindo todo
 * dia desde X" é verdade e vai envelhecer bem numa legenda, mas como manchete
 * prometeria um histórico que ainda não existe.
 */
export default function Escala({
    observatorio,
}: {
    observatorio: ObservatorioNaLanding
}) {
    const desde = dataPorExtenso(observatorio.desde)

    return (
        <section className="border-b border-mir-line bg-mir-bg">
            {/* Tudo numa coluna à esquerda, com o lado direito vazio de
                propósito. A explicação chegou a ficar num parágrafo flutuando à
                direita da manchete: é o arranjo que toda página gerada usa, e
                aqui ele não tinha motivo nenhum — o vazio ao lado de um número
                deste tamanho trabalha mais do que texto. */}
            <div className="mx-auto w-full max-w-[1320px] px-5 py-24 sm:px-10 lg:py-32">
                <span className="block font-display text-[clamp(72px,15vw,190px)] font-black leading-[0.82] tracking-[-0.055em] tabular-nums text-mir-text">
                    {observatorio.medidas.toLocaleString('pt-BR')}
                </span>
                <span className="mt-5 block text-[clamp(20px,2.6vw,32px)] font-bold leading-[1.15] tracking-[-0.03em] text-mir-text2">
                    faixas sob medição diária.
                </span>

                <p className="mt-9 max-w-[54ch] text-[15.5px] leading-[1.6] text-mir-text3">
                    O Observatório mede o catálogo toda noite, tenha alguém
                    salvado a faixa ou não. É assim que dá pra ver o que ainda
                    está no subsolo, e não só o que já estourou.
                </p>
                {desde && (
                    <p className="mt-4 font-mono text-[12px] tabular-nums text-mir-text3/75">
                        medindo desde {desde}
                    </p>
                )}
            </div>
        </section>
    )
}
