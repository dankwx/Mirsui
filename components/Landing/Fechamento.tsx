import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import { ArrowRight } from 'lucide-react'

/**
 * Manifesto e chamada final na mesma seção.
 *
 * Eram duas seções, e as duas eram tipo grande centralizada — a página
 * terminava dizendo a mesma coisa duas vezes em dois blocos parecidos. Junto,
 * o manifesto vira o argumento e o botão vira a conclusão dele.
 */
export default function Fechamento() {
    return (
        <section className="bg-mir-bg">
            <div className="mx-auto w-full max-w-[1320px] px-5 py-28 sm:px-10 lg:py-40">
                {/* A primeira frase é o que a gente não é, então recua. A
                    segunda é a promessa, e fica em contraste cheio. Estava ao
                    contrário: o algoritmo brilhava e o Mirsui sumia. */}
                <p className="m-0 max-w-[19ch] font-display text-[clamp(36px,6vw,80px)] font-black leading-[1.02] tracking-[-0.05em] text-mir-text3">
                    O algoritmo te entrega o que já bombou.
                </p>
                <p className="m-0 mt-6 max-w-[19ch] font-display text-[clamp(36px,6vw,80px)] font-black leading-[1.02] tracking-[-0.05em] text-mir-text">
                    O Mirsui guarda o que você ouviu antes.
                </p>

                <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <AuthModalTrigger
                        mode="signup"
                        className="inline-flex items-center gap-2 rounded-full bg-mir-text px-8 py-4 text-[16px] font-bold text-mir-bg transition hover:brightness-105 active:translate-y-px"
                    >
                        Criar conta grátis
                        <ArrowRight className="h-[18px] w-[18px]" />
                    </AuthModalTrigger>
                    <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-mir-text3">
                        Grátis, sem cartão, sem algoritmo
                    </span>
                </div>
            </div>
        </section>
    )
}
