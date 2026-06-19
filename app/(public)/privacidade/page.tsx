import type { Metadata } from 'next'
import LegalDoc, { LegalPromise, LegalSection } from '@/components/Legal/LegalDoc'

export const metadata: Metadata = {
    title: 'Política de Privacidade - Mirsui',
    description:
        'O que a Mirsui coleta, por que, e o controle que você tem sobre tudo. Política de privacidade em português claro, conforme a LGPD.',
}

const TICKER =
    '  POLÍTICA DE PRIVACIDADE  ✦  SEUS DADOS, SUAS REGRAS  ✦  NADA DE VENDER SEU GOSTO  ✦  Nº 047  ✦  CONFORME A LGPD  ✦  '

const PROMISES: LegalPromise[] = [
    {
        tag: '01',
        title: 'A gente nunca vende',
        desc: 'Seu gosto, suas reivindicações e seu Faro não viram produto pra terceiros. Ponto.',
    },
    {
        tag: '02',
        title: 'Você no controle',
        desc: 'Acesse, exporte ou apague seus dados quando quiser, direto pelo perfil.',
    },
    {
        tag: '03',
        title: 'Só o necessário',
        desc: 'Coletamos o mínimo pra cena funcionar — e nada além disso.',
    },
]

const SECTIONS: LegalSection[] = [
    {
        id: 'coletamos',
        num: '01',
        title: 'O que coletamos',
        paras: [
            'Pra Mirsui funcionar, a gente guarda algumas informações — sempre o mínimo necessário:',
        ],
        items: [
            'Dados de conta: nome de usuário, e-mail e senha (criptografada, a gente nunca a vê).',
            'Atividade na cena: faixas que você ouve, reivindica e salva, mais o histórico que alimenta seu Faro.',
            'Dados técnicos: tipo de dispositivo, navegador e endereço IP, usados pra segurança e estabilidade.',
            'Conteúdo que você cria: notas, listas e comentários publicados na plataforma.',
        ],
    },
    {
        id: 'porque',
        num: '02',
        title: 'Por que coletamos',
        paras: ['Cada dado tem um propósito claro e direto:'],
        items: [
            'Manter sua conta funcionando e protegida.',
            'Calcular o Faro, montar rankings e mostrar a cena ao vivo.',
            'Personalizar recomendações e o acervo de acordo com sua escuta.',
            'Detectar fraude, manipulação de Faro e abusos.',
        ],
    },
    {
        id: 'base-legal',
        num: '03',
        title: 'Base legal (LGPD)',
        paras: [
            'Tratamos seus dados com fundamento na execução do contrato (oferecer a plataforma), no seu consentimento (quando aplicável), no legítimo interesse (segurança e melhoria do serviço) e no cumprimento de obrigações legais.',
            'Você pode retirar o consentimento a qualquer momento, sem que isso afete a legalidade do tratamento feito antes.',
        ],
    },
    {
        id: 'compartilhamento',
        num: '04',
        title: 'Com quem compartilhamos',
        paras: [
            'A gente não vende seus dados. Pessoas físicas nunca recebem suas informações sem você saber. O compartilhamento se limita ao indispensável:',
        ],
        items: [
            'Prestadores de infraestrutura (hospedagem, e-mail, análise) que operam sob contrato e sigilo.',
            'Autoridades, quando exigido por lei ou ordem judicial.',
            'Informações públicas por natureza — como seu nome de usuário e posição no Faro — que já são visíveis na cena.',
        ],
    },
    {
        id: 'cookies',
        num: '05',
        title: 'Cookies e rastreamento',
        paras: [
            'Usamos cookies essenciais pra manter você logado e lembrar suas preferências. Usamos também medições de uso, em formato agregado, pra entender o que funciona na plataforma.',
            'Não usamos cookies de publicidade de terceiros. Você pode gerenciar cookies pelo seu navegador, mas alguns são necessários pra Mirsui funcionar.',
        ],
    },
    {
        id: 'retencao',
        num: '06',
        title: 'Por quanto tempo guardamos',
        paras: [
            'Mantemos seus dados enquanto sua conta existir. Se você encerrar a conta, apagamos ou anonimizamos suas informações pessoais num prazo razoável — exceto o que a lei nos obriga a reter.',
            'Reivindicações e o histórico de Faro associados a um perfil ativo fazem parte do acervo público da cena e permanecem registrados enquanto a conta estiver ativa.',
        ],
    },
    {
        id: 'direitos',
        num: '07',
        title: 'Seus direitos',
        paras: [
            'Pela LGPD, você tem controle real sobre seus dados. A qualquer momento, você pode:',
        ],
        items: [
            'Confirmar a existência de tratamento e acessar seus dados.',
            'Corrigir informações incompletas ou desatualizadas.',
            'Solicitar a exportação ou a exclusão dos seus dados.',
            'Revogar consentimento e se opor a determinados tratamentos.',
        ],
    },
    {
        id: 'seguranca',
        num: '08',
        title: 'Segurança e contato',
        paras: [
            'Protegemos seus dados com criptografia, controle de acesso e boas práticas de segurança. Nenhum sistema é 100% infalível, mas tratamos seus dados como se fossem nossos.',
            'Dúvidas, pedidos ou denúncias relacionadas a privacidade? Fale com nosso encarregado de dados pelo e-mail privacidade@mirsui.fm. Esta política pode ser atualizada — sempre avisamos por aqui quando houver mudança relevante.',
        ],
    },
]

export default function PrivacidadePage() {
    return (
        <LegalDoc
            tickerText={TICKER}
            docIndex="DOCUMENTO LEGAL · 02 DE 02"
            crossLabel="TERMOS →"
            crossHref="/termos"
            title={
                <>
                    Política de
                    <br />
                    privacidade
                </>
            }
            intro="Seu gosto musical é a coisa mais íntima que você nos dá. Aqui está, em português claro, o que coletamos, por que, e o controle que você tem sobre tudo."
            badges={['VIGÊNCIA · 18 JUN 2026', 'CONFORME A LGPD', 'LEITURA · ~5 MIN']}
            promises={PROMISES}
            sections={SECTIONS}
            contact={{
                eyebrow: 'QUER VER, EXPORTAR OU APAGAR?',
                title: 'Seus dados estão a um e-mail de distância.',
                desc: 'Pedidos de acesso, correção ou exclusão são respondidos em até 15 dias.',
                email: 'privacidade@mirsui.fm',
            }}
        />
    )
}
