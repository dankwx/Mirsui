import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import { ArrowRight } from 'lucide-react'

/**
 * Manifesto e chamada final na mesma seção.
 *
 * A primeira frase é o que a gente não é, então recua. A segunda é a
 * promessa, em contraste cheio, e o botão é a conclusão dela.
 */
export default function Fechamento() {
    return (
        <section>
            <div className="mx-auto w-full max-w-[1320px] px-5 py-24 sm:px-10 lg:py-36">
                <p className="m-0 max-w-[18ch] font-display text-[clamp(38px,6.4vw,92px)] font-black leading-[0.96] tracking-[-0.055em] text-mir-text3">
                    O algoritmo te entrega o que já bombou.
                </p>
                <p className="m-0 mt-5 max-w-[18ch] font-display text-[clamp(38px,6.4vw,92px)] font-black leading-[0.96] tracking-[-0.055em] text-mir-text">
                    O Mirsui guarda o que você ouviu antes.
                </p>

                <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <AuthModalTrigger
                        mode="signup"
                        className="inline-flex items-center gap-2 rounded-full bg-mir-text px-8 py-4 text-[16px] font-bold text-mir-bg transition hover:brightness-105 active:translate-y-px"
                    >
                        Criar conta
                        <ArrowRight className="h-[18px] w-[18px]" />
                    </AuthModalTrigger>
                    <span className="text-[14px] text-mir-text3">
                        Grátis, sem cartão, sem algoritmo.
                    </span>
                </div>
            </div>
        </section>
    )
}
