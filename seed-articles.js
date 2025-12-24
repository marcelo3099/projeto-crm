const Database = require('better-sqlite3');

const db = new Database('sqlite.db');
db.pragma('foreign_keys = ON');

console.log('📚 Creating knowledge base articles...');

const articles = [
    {
        title: 'Como Criar um Novo Contato',
        slug: 'criar-contato',
        category: 'contatos',
        content: '# Como Criar um Novo Contato\n\nOs **Contatos** são a base do seu CRM. Cada pessoa ou empresa que demonstra interesse nos seus serviços imobiliários deve ser cadastrada como um contato.\n\n## Quando criar um contato?\n\n- Quando alguém preenche um formulário no seu site\n- Quando entra em contato via Instagram\n- Quando você conhece alguém pessoalmente\n- Quando recebe uma indicação\n\n## Informações básicas\n\n- **Nome**: Nome completo do cliente\n- **E-mail**: Para comunicação por e-mail\n- **Telefone/WhatsApp**: Principal canal de contato\n- **Empresa**: Se for pessoa jurídica\n\n## Contatos Duplicados\n\nO sistema identifica automaticamente contatos duplicados por **e-mail** ou **telefone**. Se a mesma pessoa preencher múltiplos formulários, todos os negócios serão vinculados ao mesmo contato.\n\n## Dica Profissional\n\nMantenha sempre os dados atualizados! Um contato bem cadastrado facilita o acompanhamento e aumenta suas chances de fechamento.'
    },
    {
        title: 'Entendendo Negócios (Deals)',
        slug: 'entender-negocios',
        category: 'negocios',
        content: `# Entendendo Negócios (Deals)

Um **Negócio** representa uma oportunidade de venda específica. Um contato pode ter **múltiplos negócios** simultaneamente.

## Exemplo Prático

João Silva (contato) pode ter:
- Negócio 1: Compra de apartamento (R$ 500.000)
- Negócio 2: Venda do imóvel atual (R$ 300.000)

## Informações de um Negócio

- **Título**: Descrição curta (ex: "Compra - Apt 2 Quartos")
- **Valor**: Valor estimado do negócio
- **Pipeline**: Em qual funil está (Vendas, Locação, etc)
- **Stage/Etapa**: Em que fase está (Qualificação, Proposta, etc)
- **Notas**: Informações sobre preferências e requisitos

## Por que separar Contato e Negócio?

Isso permite:
- Rastrear múltiplas oportunidades por pessoa
- Histórico completo de relacionamento
- Métricas precisas de conversão
- Melhor organização do funil de vendas`
    },
    {
        title: 'Tipos de Negócio Imobiliário',
        slug: 'tipos-negocio',
        category: 'qualificacao',
        content: `# Tipos de Negócio Imobiliário

Entender o tipo de negócio ajuda a direcionar melhor seu atendimento.

## Compra
Cliente busca adquirir um imóvel para morar ou investir.
**Foco**: Localização, financiamento, documentação

## Venda
Cliente quer vender seu imóvel atual.
**Foco**: Avaliação, marketing, timing do mercado

## Locação
Interesse em alugar imóvel (inquilino) ou disponibilizar para locação (proprietário).
**Foco**: Contrato, garantias, gestão

## Investimento
Cliente busca imóveis para rentabilidade.
**Foco**: ROI, valorização, potencial de locação`
    },
    {
        title: 'Faixas de Investimento',
        slug: 'faixas-investimento',
        category: 'qualificacao',
        content: `# Faixas de Investimento

Conhecer o poder de compra ajuda a mostrar imóveis adequados.

## Até R$ 300.000
- Apartamentos compactos
- Imóveis em bairros periféricos
- Primeira moradia
- Programa Minha Casa Minha Vida

## R$ 300.000 - R$ 500.000
- Apartamentos de 2-3 quartos
- Bairros intermediários
- Bom equilíbrio custo-benefício

## R$ 500.000 - R$ 1.000.000
- Imóveis de médio-alto padrão
- Bairros nobres
- Maior área e acabamento

## Acima de R$ 1.000.000
- Alto padrão
- Coberturas, casas de luxo
- Bairros premium
- Diferenciais exclusivos`
    },
    {
        title: 'Perfis de Investidor',
        slug: 'perfis-investidor',
        category: 'qualificacao',
        content: `# Perfis de Investidor Imobiliário

## Primeira Vez (Iniciante)
**Características:**
- Pouca ou nenhuma experiência
- Mais inseguro, precisa de orientação
- Foco em moradia própria

**Como atender:**
- Educar sobre o processo
- Explicar financiamento em detalhes
- Acompanhamento próximo

## Experiente
**Características:**
- Já comprou/vendeu antes
- Conhece o mercado
- Decisões mais rápidas

**Como atender:**
- Informações diretas e objetivas
- Foco em diferenciais
- Negociação profissional

## Investidor Profissional
**Características:**
- Múltiplos imóveis
- Foco em rentabilidade
- Decisões baseadas em números

**Como atender:**
- Análise de ROI
- Dados de mercado
- Oportunidades exclusivas`
    },
    {
        title: 'Formas de Pagamento e Financiamento',
        slug: 'formas-pagamento',
        category: 'qualificacao',
        content: `# Formas de Pagamento

## À Vista
**Vantagens:**
- Maior poder de negociação
- Sem juros
- Processo mais rápido

**Desvantagens:**
- Necessita capital disponível

## Financiamento (Entrada 20%)
- Entrada: 20% do valor
- Restante: Financiamento bancário
- Prazo: Até 35 anos
- Taxa: Varia conforme banco e perfil

## Financiamento (Entrada 30%+)
- Melhores condições de juros
- Aprovação mais fácil
- Parcelas menores

## FGTS
- Pode ser usado como entrada
- Reduz valor financiado
- Abate parcelas
- Consultar saldo disponível`
    },
    {
        title: 'Vantagens do Primeiro Imóvel',
        slug: 'primeiro-imovel',
        category: 'qualificacao',
        content: `# Vantagens de Comprar o Primeiro Imóvel

## Benefícios Financeiros

### 1. Patrimônio Próprio
- Para de "pagar aluguel para outros"
- Construção de patrimônio
- Valorização ao longo do tempo

### 2. Acesso a Programas Governamentais
- Minha Casa Minha Vida
- Casa Verde Amarela
- Taxas de juros reduzidas

### 3. Uso do FGTS
- Entrada facilitada
- Amortização de parcelas
- Quitação antecipada

## Benefícios Pessoais

- **Estabilidade**: Sua família tem um lar
- **Liberdade**: Reforme como quiser
- **Planejamento**: Sabe quanto pagará por 30 anos

## Imposto de Renda

Isenção de IR na venda do primeiro imóvel (valor até R$ 440.000) se reinvestir em outro em 180 dias.`
    },
    {
        title: 'Como Usar Formulários de Captação',
        slug: 'usar-formularios',
        category: 'formularios',
        content: `# Como Usar Formulários de Captação

Os formulários são sua ferramenta principal para captar e qualificar leads automaticamente.

## 1. Criando um Formulário

1. Acesse **Formulários** no menu
2. Clique em **Novo Formulário**
3. Configure:
   - Nome do formulário
   - URL (slug)
   - Pipeline de destino

## 2. Configurando Etapas

### Etapa 1: Contato
Campos essenciais:
- Nome
- WhatsApp
- E-mail

### Etapa 2: Qualificação
Informações sobre o negócio:
- Tipo de interesse
- Faixa de investimento
- Nível de experiência
- Capital disponível

## 3. Onde Usar o Link

- **Instagram Bio**: Link direto no perfil
- **Landing Pages**: Botão de ação
- **Anúncios**: Destino de campanha
- **WhatsApp**: Envie para contatos

## 4. O que Acontece Após Submissão

1. Contato é salvo automaticamente
2. Negócio criado e vinculado ao contato
3. Adicionado à primeira etapa da pipeline
4. Você recebe notificação (se configurado)

## 5. Múltiplos Formulários

Crie formulários específicos:
- Um para compradores
- Um para vendedores
- Um para investidores

Cada um direciona para a pipeline certa!`
    },
    {
        title: 'Gerenciando Pipelines e Funil de Vendas',
        slug: 'gerenciar-pipelines',
        category: 'pipelines',
        content: `# Gerenciando Pipelines e Funil de Vendas

## O que é uma Pipeline?

Uma **Pipeline** é o caminho que seu lead percorre até fechar negócio.

## Etapas Típicas (Stages)

### 1. Novo Lead
Acabou de entrar, sem qualificação

### 2. Qualificação
Verificando se tem perfil adequado

### 3. Proposta
Enviando opções de imóveis

### 4. Negociação
Discutindo valores e condições

### 5. Fechado
Negócio concluído!

## Movendo Negócios

(Próxima funcionalidade: Drag & Drop)
Arraste os cards entre as colunas conforme avança no processo

## Múltiplas Pipelines

Você pode ter:
- Pipeline de Vendas
- Pipeline de Locação
- Pipeline de Investimentos

Cada uma com suas próprias etapas!`
    }
];

const insert = db.prepare(`
    INSERT INTO knowledge_articles (title, content, slug, category)
    VALUES (?, ?, ?, ?)
`);

articles.forEach(article => {
    insert.run(article.title, article.content, article.slug, article.category);
    console.log(`✅ ${article.title}`);
});

db.close();

console.log('🎉 Knowledge base articles created!');
