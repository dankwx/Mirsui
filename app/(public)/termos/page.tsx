import type { Metadata } from 'next'
import LegalDoc, { LegalSection } from '@/components/Legal/LegalDoc'

export const metadata: Metadata = {
    title: 'Termos de Uso - Mirsui',
    description:
        'As regras de convivência da cena. Ao criar uma conta, ouvir, reivindicar ou disputar o Faro, você concorda com estes Termos de Uso da Mirsui.',
}

const TICKER =
    '  TERMOS DE USO  ✦  O CONTRATO ENTRE VOCÊ E A CENA  ✦  LEIA ANTES DE REIVINDICAR  ✦  Nº 047  ✦  VERSÃO 2.0  ✦  '

const SECTIONS: LegalSection[] = [
    {
        id: 'aceitacao',
        num: '01',
        title: 'Aceitação destes termos',
        paras: [
            'A Mirsui é um arquivo musical curatorial — um lugar pra ouvir cedo, reivindicar faixas antes da cena lotar e provar que você ouviu. Estes Termos formam o contrato entre você e a Mirsui.',
            'Ao criar uma conta, navegar pelo acervo ou disputar o Faro, você declara que leu, entendeu e concorda com tudo o que está aqui. Se não concordar com algum ponto, simplesmente não use a plataforma.',
        ],
    },
    {
        id: 'conta',
        num: '02',
        title: 'Sua conta',
        paras: [
            'Você precisa ter pelo menos 16 anos para criar uma conta. Os dados que você informa no cadastro devem ser verdadeiros e mantidos atualizados.',
        ],
        items: [
            'Você é o único responsável por tudo que acontece na sua conta, inclusive por manter sua senha em segredo.',
            'Uma conta pertence a uma pessoa — nada de perfis compartilhados pra inflar Faro.',
            'Avise a gente na hora se desconfiar de acesso não autorizado.',
        ],
    },
    {
        id: 'reivindicar',
        num: '03',
        title: 'Reivindicações e o Faro',
        paras: [
            'Reivindicar uma faixa é registrar publicamente que você a ouviu enquanto a janela ainda estava aberta. O Faro é o placar que mede quão cedo e com que consistência você acerta.',
            'O cálculo do Faro, os pesos e os critérios de ranking podem ser ajustados a qualquer momento para preservar a justiça da disputa. Reivindicações são definitivas: uma vez registrada, a antecedência fica gravada no acervo.',
        ],
        items: [
            'É proibido automatizar reivindicações com bots, scripts ou qualquer truque pra burlar o tempo.',
            'Contas que manipulam o Faro de forma artificial podem ter pontuação zerada ou ser encerradas.',
            'O Faro é mérito de escuta, não item negociável: não pode ser vendido, transferido ou trocado.',
        ],
    },
    {
        id: 'conteudo',
        num: '04',
        title: 'Conteúdo e curadoria',
        paras: [
            'A música, capas e metadados pertencem aos seus respectivos artistas, gravadoras e detentores de direitos. A Mirsui organiza, contextualiza e cura — não reivindica propriedade sobre as obras.',
            'O que você escreve (notas, listas, comentários) continua seu. Mas, ao publicar na Mirsui, você nos dá uma licença não exclusiva pra exibir esse conteúdo dentro da plataforma.',
        ],
    },
    {
        id: 'conduta',
        num: '05',
        title: 'Conduta na cena',
        paras: ['A cena funciona porque as pessoas se respeitam. Algumas coisas não rolam aqui:'],
        items: [
            'Assédio, discurso de ódio, ameaças ou qualquer forma de violência contra outros ouvintes.',
            'Spam, propaganda não autorizada ou tentativas de desviar gente pra fora da plataforma.',
            'Tentar invadir, sobrecarregar ou fazer engenharia reversa de qualquer parte do sistema.',
            'Subir conteúdo que viole direitos de terceiros ou a lei.',
        ],
    },
    {
        id: 'propriedade',
        num: '06',
        title: 'Nossa propriedade intelectual',
        paras: [
            'A marca Mirsui, o logo, o nome, a identidade visual, a interface e o conceito de Faro são nossos. Você não pode copiar, revender ou usar comercialmente esses elementos sem autorização por escrito.',
            'Curtir a vibe e se inspirar é uma coisa. Clonar a plataforma é outra.',
        ],
    },
    {
        id: 'encerramento',
        num: '07',
        title: 'Suspensão e encerramento',
        paras: [
            'Você pode encerrar sua conta quando quiser, pelas configurações do perfil. A gente pode suspender ou encerrar contas que violem estes Termos, manipulem o Faro ou ameacem a integridade da cena.',
            'Em casos graves, o encerramento é imediato e sem aviso prévio. Nos demais, avisamos com antecedência sempre que possível.',
        ],
    },
    {
        id: 'garantias',
        num: '08',
        title: 'Garantias e responsabilidade',
        paras: [
            'A Mirsui é fornecida "como está". Fazemos o nosso melhor pra manter tudo no ar e funcionando, mas não garantimos que a plataforma será ininterrupta ou livre de erros.',
            'Na máxima medida permitida pela lei, não nos responsabilizamos por danos indiretos decorrentes do uso ou da indisponibilidade do serviço.',
        ],
    },
    {
        id: 'alteracoes',
        num: '09',
        title: 'Alterações destes termos',
        paras: [
            'A cena muda e os Termos acompanham. Quando fizermos mudanças relevantes, avisamos por aqui ou por e-mail com antecedência razoável.',
            'Continuar usando a Mirsui depois de uma atualização significa que você concorda com a nova versão. A data de vigência no topo sempre mostra a versão em vigor.',
        ],
    },
    {
        id: 'foro',
        num: '10',
        title: 'Lei aplicável e foro',
        paras: [
            'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de São Paulo/SP para dirimir qualquer questão, com renúncia a qualquer outro, por mais privilegiado que seja.',
        ],
    },
]

export default function TermosPage() {
    return (
        <LegalDoc
            tickerText={TICKER}
            docIndex="DOCUMENTO LEGAL · 01 DE 02"
            crossLabel="PRIVACIDADE →"
            crossHref="/privacidade"
            title={
                <>
                    Termos
                    <br />
                    de uso
                </>
            }
            intro="As regras de convivência da cena. Ao criar uma conta, ouvir, reivindicar ou disputar o Faro, você concorda com tudo que está aqui embaixo."
            badges={['VIGÊNCIA · 18 JUN 2026', 'VERSÃO 2.0', 'LEITURA · ~6 MIN']}
            sections={SECTIONS}
            contact={{
                eyebrow: 'DÚVIDAS SOBRE OS TERMOS?',
                title: 'Fala com a gente.',
                desc: 'A cena é pequena e a porta tá aberta. Responde rápido, na real.',
                email: 'contato@mirsui.com',
            }}
        />
    )
}
