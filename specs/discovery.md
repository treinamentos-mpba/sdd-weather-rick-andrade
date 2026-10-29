# Análise de Discovery — Aplicação de Previsão do Tempo

> Esta análise parte de um briefing inicial. As personas, probabilidades e metas sugeridas são hipóteses para validação, não resultados de pesquisa com usuários nem compromissos aprovados.

## Contexto

A empresa solicitou uma aplicação para consulta meteorológica. O briefing menciona busca de cidades, clima atual, previsão de cinco dias, alternância entre Celsius e Fahrenheit e uso em dispositivos móveis.

O problema e o público não foram validados por pesquisa. Para destravar o MVP, a especificação adota objetivos, público-alvo, conteúdo de dados e metas de qualidade como baseline v1; essas escolhas são hipóteses operacionais, não resultados de discovery com usuários.

## Decisões

| Decisão | Justificativa | Perguntas que resolve e limites |
|---|---|---|
| Usar Open-Meteo como fonte de dados, sem API key. | Evita exigir uma chave de API e reduz a configuração inicial e o gerenciamento de segredos. | Resolve qual provedor usar e se é necessária uma API key. Permanecem em aberto cobertura, limites de uso, termos, frequência de atualização e disponibilidade. |
| Definir “5 dias” como hoje mais os quatro dias seguintes. | Torna explícito que o dia atual faz parte do período solicitado. | Resolve se hoje está incluído na janela de cinco dias. Permanecem em aberto granularidade diária ou horária e o fuso horário usado para determinar “hoje”. |
| Usar Celsius como unidade padrão. | Define uma apresentação inicial consistente com a experiência em pt-BR. | Resolve qual unidade apresentar inicialmente. Permanecem em aberto quais temperaturas são convertidas e se a preferência escolhida será mantida no navegador. |
| Não exigir autenticação nem persistir dados no servidor. | Mantém o fluxo de consulta sem conta e evita armazenar dados de usuário no backend. | Resolve a necessidade de login, contas e persistência de dados no servidor. Permanecem em aberto o uso de armazenamento local no navegador, histórico/favoritos e eventual telemetria. |
| Usar pt-BR como idioma da interface. | Define o idioma-base para textos e interação do produto. | Resolve o idioma inicial da UI. Permanecem em aberto outras localidades, formatos regionais e convenções de data/hora. |

## Personas (Hipóteses)

| Persona | Objetivo principal | Contexto de uso | Métrica de sucesso da persona |
|---|---|---|---|
| Marina, usuária da rotina | Consultar rapidamente o clima da cidade onde está para decidir o que vestir ou levar. | Principalmente no celular, pela manhã ou antes de sair. | Encontrar a cidade correta e entender o clima atual em até 30 segundos. |
| Rafael, planejador de viagem | Consultar a previsão de cinco dias para um destino e usar a unidade de temperatura de sua preferência. | Principalmente no desktop durante o planejamento; pode conferir pelo celular. | Encontrar e interpretar a previsão do destino na unidade desejada, sem conversões manuais. |
| Lúcia, usuária de tecnologia assistiva | Consultar o clima atual e a previsão sem depender de ajuda de outra pessoa. | Celular ou desktop, com leitor de tela e navegação por teclado. | Buscar uma cidade e compreender os dados sem bloqueios de acessibilidade ou assistência externa. |

As métricas acima são proxies iniciais. Devem ser validadas com pesquisa e testes com usuários; a persona de tecnologia assistiva é uma hipótese para orientar a investigação de acessibilidade.

## Requisitos Funcionais

- Permitir que o usuário busque uma cidade.
- Exibir o clima atual da cidade selecionada.
- Exibir a previsão do tempo para cinco dias da cidade selecionada.
- Permitir alternar a unidade de temperatura entre Celsius e Fahrenheit.
- Associar os dados meteorológicos à cidade escolhida pelo usuário.
- Comunicar estados de carregamento, ausência de resultados e falha de consulta; os detalhes de recuperação ainda precisam ser definidos.

O suporte a dispositivos móveis é tratado como requisito não-funcional de responsividade. A decisão não confirma a criação de aplicativos nativos.

## Requisitos Não-Funcionais

- **Responsividade:** permitir o uso em dispositivos móveis e telas menores. Larguras, orientações e dispositivos suportados precisam ser acordados.
- **Acessibilidade:** garantir que busca e informações meteorológicas possam ser usadas por teclado e tecnologias assistivas. O padrão e o nível de conformidade precisam ser acordados.
- **Desempenho:** estabelecer metas mensuráveis para carregamento e exibição dos dados, inclusive em redes móveis.
- **Disponibilidade:** estabelecer uma meta de disponibilidade e o comportamento esperado quando o provedor meteorológico estiver indisponível.
- **Compatibilidade:** definir navegadores e versões suportados.
- **Atualização dos dados:** definir a frequência aceitável, como informar o horário da última atualização e como sinalizar dados possivelmente desatualizados.

As metas quantitativas adotadas para o baseline v1 estão em `specs/weather-app-spec.md` e devem ser verificadas em pré-release.

## Riscos

Probabilidades preliminares, sujeitas a revisão quando o provedor, a arquitetura e o escopo forem definidos.

| Risco | Tipo | Probabilidade | Impacto | Estratégia de mitigação |
|---|---|---|---|---|
| Indisponibilidade, lentidão ou limite de uso do Open-Meteo | Técnico | Média | Alto: consultas podem falhar ou demorar, impedindo o uso principal. | Validar limites, termos e disponibilidade do Open-Meteo; configurar timeout, tentativas controladas, cache e mensagens de erro úteis. |
| Dados desatualizados, incompletos ou com precisão variável por região | Técnico / Produto | Média | Alto: o usuário pode tomar decisões com base em informação incorreta ou antiga. | Definir requisitos de cobertura e atualização; exibir horário da última atualização e sinalizar dados indisponíveis ou antigos. |
| Seleção de cidade errada em buscas com nomes iguais ou semelhantes | Produto | Alta | Alto: os dados exibidos não correspondem à localização pretendida. | Mostrar país e região nos resultados e usar identificadores geográficos para diferenciar cidades. |
| Interpretações diferentes de “clima atual” ou da granularidade da previsão de cinco dias | Produto | Média | Alto: funcionalidades e critérios de aceite podem divergir das expectativas dos usuários. | O período foi definido como hoje mais quatro dias; definir fuso horário, granularidade e dados exibidos antes da especificação. |
| Escopo móvel indefinido entre web responsiva e aplicativo nativo | Produto / Técnico | Média | Alto: pode causar retrabalho, atrasos e diferenças de custo e arquitetura. | Confirmar plataforma e dispositivos prioritários antes de estimar a solução. |
| Desempenho ruim em redes móveis ou dispositivos de menor capacidade | Técnico | Média | Alto: aumenta o abandono e pode impedir consultas em condições comuns de uso. | Definir metas de performance; otimizar carregamento e requisições; testar com dispositivos e redes móveis simuladas. |
| Datas ou previsões apresentadas no fuso horário incorreto | Técnico / Produto | Média | Médio/Alto: a previsão diária pode parecer deslocada para a cidade consultada. | Usar o fuso horário da localização; definir o que conta como cada dia; testar limites de data e mudanças de horário. |
| Barreiras de acessibilidade na busca ou leitura da previsão | Produto / Técnico | Média | Alto: alguns usuários podem não conseguir completar tarefas essenciais. | Definir critérios de acessibilidade e testar teclado, leitor de tela, foco e contraste. |
| Restrições de licença, cobertura ou cota do provedor descobertas tardiamente | Técnico / Operacional | Baixa/Média | Alto: pode exigir troca de API, limitar regiões atendidas ou elevar custos. | Revisar termos, atribuição, cobertura e limites antes da seleção; monitorar uso e avaliar alternativa. |
| Unidade de temperatura aplicada de forma inconsistente ou não preservada | Produto / Técnico | Média | Médio: gera confusão e reduz a confiança nos dados. | Definir escopo, unidade padrão e persistência da preferência; testar clima atual e previsão. |

## Perguntas em Aberto
> Esta tabela registra as perguntas levantadas no discovery inicial. As respostas adotadas para o baseline v1 estão consolidadas em **Decisões posteriores para o MVP** ao final deste documento.

| Pergunta | Impacto de seguir sem resposta |
|---|---|
| Qual problema de negócio o app deve resolver e como será medido o sucesso? | Sem resultado e métrica, será difícil priorizar funcionalidades ou avaliar o produto. |
| Quem são os usuários e em quais situações consultarão o clima? | A interface, o conteúdo e os fluxos podem não atender às necessidades prioritárias. |
| Quais critérios de busca serão aceitos: cidade, país, região ou código postal? | O escopo da busca e a escolha do serviço de geocodificação ficam indefinidos. |
| Como diferenciar cidades homônimas? | Usuários podem selecionar uma localização incorreta e receber dados irrelevantes. |
| A busca sugere resultados enquanto o usuário digita ou somente após confirmação? | Comportamento, latência percebida e tratamento de consultas incompletas ficam indefinidos. |
| O app consulta uma cidade por vez ou permite alternar entre várias? Favoritos ou histórico devem ser mantidos localmente no navegador? | Sem persistência no servidor, ainda é preciso definir se há estado local e por quanto tempo; isso altera escopo, privacidade e interface. |
| O app deve solicitar geolocalização ou a cidade será sempre escolhida manualmente? | Afeta permissões, privacidade e experiência inicial. |
| Quais dados compõem o clima atual além da temperatura? | O contrato da API, o layout e os critérios de aceite não podem ser fechados. |
| Com que frequência os dados serão atualizados e como será indicada a hora da observação? | Dados atrasados ou horários ambíguos podem ser confundidos com informações em tempo real. |
| A previsão de hoje mais quatro dias será diária ou horária, e qual fuso horário define a mudança de dia? | Sem granularidade e fuso definidos, a janela pode ser apresentada de modo inconsistente para diferentes cidades. |
| Quais métricas a previsão exibirá? | O nível de detalhe, os dados necessários e a complexidade visual permanecem indefinidos. |
| A alternância entre Celsius e Fahrenheit afeta o clima atual e a previsão? A escolha será mantida localmente no navegador? | Sem escopo definido, unidades podem ficar inconsistentes; sem decisão de persistência local, a preferência pode se perder entre visitas. |
| “Usar em dispositivos móveis” significa web responsiva ou também aplicativos nativos? Quais telas e orientações priorizar? | Afeta arquitetura, custo, cronograma e critérios de compatibilidade. |
| Além da UI em pt-BR, quais regiões e convenções locais devem ser suportadas? | Datas, unidades e formatos podem ser inadequados para usuários de outras localidades. |
| A cobertura, os termos, a atribuição e os limites de uso do Open-Meteo atendem ao produto? | Cobertura insuficiente, restrições ou limites podem bloquear a solução ou exigir mudança de provedor. |
| Quais são as metas de desempenho, inclusive em redes móveis lentas? | Não será possível medir se a experiência é rápida o suficiente. |
| Qual disponibilidade mensal é esperada e o que fazer quando o provedor falhar? | Não se consegue definir requisitos operacionais, fallback ou expectativas durante falhas. |
| Quais padrões e tecnologias assistivas devem ser suportados? | Acessibilidade pode ser tratada tarde, exigindo retrabalho ou deixando usuários sem acesso. |
| Como tratar cidade não encontrada, erro de rede, limite de API e dados desatualizados? | Fluxos de falha podem deixar o usuário sem explicação ou caminho de recuperação. |
| Deve haver uso offline ou cache? Como sinalizar a idade de dados em cache? | Informações antigas podem ser confundidas com atuais ou o usuário pode ficar sem dados numa falha temporária. |
| Quais navegadores e versões precisam ser suportados? | O app pode funcionar no desenvolvimento e falhar nos navegadores dos usuários. |
| Haverá armazenamento local de buscas, localização ou favoritos? Por quanto tempo e para qual finalidade? | A decisão de não persistir no servidor não define retenção no dispositivo; sem essa definição, privacidade e comportamento entre sessões permanecem ambíguos. |

## Suposições

- O escopo inicial é uma aplicação web acessível por navegador; aplicativo nativo não foi confirmado.
- O usuário selecionará uma cidade pela busca; geolocalização não está confirmada.
- Os dados virão do Open-Meteo, sem API key.
- A janela de previsão será hoje e os quatro dias seguintes.
- Celsius será a unidade inicial, com possibilidade de alternar para Fahrenheit.
- A aplicação não exigirá autenticação nem persistirá dados no servidor.
- A interface será apresentada inicialmente em pt-BR.
- A previsão de cinco dias será associada à cidade selecionada.
- As personas e suas métricas são hipóteses iniciais, não resultados de pesquisa.
- Metas de qualidade, preferências persistidas e detalhes da previsão serão acordados antes da especificação final.
- Metas de qualidade, preferências persistidas e detalhes da previsão estão definidos como baseline v1 na especificação; personas seguem como hipóteses até validação.

## Decisões posteriores para o MVP

- **Plataforma:** web responsiva; aplicativos nativos ficam fora do escopo.
- **Busca:** envio explícito por nome da cidade, sem autocomplete; não consultar com input vazio; candidatos selecionáveis precisam ter coordenadas.
- **Localização:** mostrar cidade, região e país quando disponíveis; usar coordenadas selecionadas nas consultas; sem geolocalização automática ou cidades favoritas.
- **Dados:** clima atual inclui temperatura, código de condição e horário retornado; previsão diária inclui data, condição e temperaturas mínima/máxima.
- **Previsão:** hoje e os quatro dias seguintes, no fuso IANA retornado pelo provedor.
- **Unidades:** Celsius inicial; alternância aplica-se a todas as temperaturas atuais e previstas, arredondadas ao inteiro mais próximo após conversão; preferência dura somente enquanto a página está aberta.
- **Persistência:** sem autenticação, persistência de usuário no servidor ou navegador, telemetria, cookies não essenciais ou modo offline.
- **Qualidade:** viewport de 320–1920 CSS px, WCAG 2.2 AA, LCP de até 2,5 s p75 em perfil móvel 4G, renderização de dados de até 500 ms p95, timeout de 8 s, disponibilidade de 99,5% mensal e suporte às duas versões estáveis mais recentes dos navegadores definidos na spec.
- **Objetivo de validação:** em teste pré-release, pelo menos 8 de 10 participantes (cinco de consulta diária e cinco de planejamento de viagem) devem, em até 60 s e sem ajuda do moderador, selecionar uma cidade, identificar temperatura/condição atual e localizar mínima/máxima para um dia indicado; personas não são pesquisa validada.
- **Release:** verificar termos, atribuição, cobertura e limites do Open-Meteo e confirmar os campos/fuso com respostas reais antes da publicação.
