# Especificação de Produto — Weather App
> **Status:** baseline v1 definida para implementação do MVP. Os limites operacionais abaixo são decisões adotadas para destravar o trabalho; o release público ainda exige a verificação externa dos termos e limites do Open-Meteo.

## Overview

Aplicação web responsiva em pt-BR, sem autenticação, para pessoas que consultam o clima de uma cidade ou planejam atividades e viagens. Permite buscar e selecionar uma cidade, ver condições atuais e previsão diária de cinco datas (hoje + quatro dias), e alternar temperaturas entre Celsius e Fahrenheit. A fonte é Open-Meteo, sem API key; aplicativos nativos ficam fora do MVP.

O objetivo do MVP é permitir que a pessoa obtenha dados úteis para uma cidade sem assistência. No teste pré-release, pelo menos 8 de 10 participantes (cinco usuários de consulta diária e cinco de planejamento de viagem) devem, em até 60 s e sem ajuda do moderador, selecionar uma cidade, identificar temperatura/condição atual e localizar mínima/máxima para um dia indicado na previsão. Este é um critério de usabilidade, não telemetria em produção.

## Functional Requirements

- **FR-01 — Pesquisar cidade:** aceitar busca enviada explicitamente por nome de cidade; remover espaços periféricos, preservar acentos e pontuação válida; não consultar geocoding para input vazio.
- **FR-02 — Selecionar cidade:** apresentar candidatos com nome da cidade e região administrativa e país quando retornados; só permitir seleção de candidatos com coordenadas válidas; usar as coordenadas selecionadas em todas as consultas meteorológicas.
- **FR-03 — Clima atual:** exibir cidade selecionada, temperatura atual, condição meteorológica e horário local dos dados. Temperatura, código de condição e horário são os campos mínimos para considerar o bloco atual completo.
- **FR-04 — Previsão:** exibir cinco entradas diárias: hoje e os quatro dias seguintes no fuso horário IANA retornado para a localização. Cada entrada inclui data, condição e temperaturas mínima/máxima; campo meteorológico ausente aparece como indisponível.
- **FR-05 — Unidade:** iniciar em Celsius; converter todas as temperaturas atuais e previstas quando a pessoa alternar para Fahrenheit ou Celsius; converter a partir dos valores Celsius sem arredondamento intermediário e arredondar somente para exibição ao inteiro mais próximo.
- **FR-06 — Estados de consulta:** exibir estados distintos de carregamento, sem resultados e erro; chamadas externas expiram em 8 s; permitir retry manual após timeout ou falha recuperável, sem retry automático.
- **FR-07 — Acesso anônimo:** permitir o fluxo de busca e consulta sem login, cadastro ou credenciais.

## User Stories

- **US-01 (FR-01, FR-02):** Como Marina, quero pesquisar e selecionar minha cidade para consultar dados da localização correta.
- **US-02 (FR-03):** Como Marina, quero ver a temperatura e a condição atual para decidir o que vestir ou levar.
- **US-03 (FR-04):** Como Rafael, quero ver a previsão diária de hoje e dos quatro dias seguintes para planejar uma viagem.
- **US-04 (FR-05):** Como Rafael, quero alternar a unidade de temperatura para interpretar os dados sem conversão manual.
- **US-05 (FR-01, FR-02, FR-03, FR-04):** Como Lúcia, quero pesquisar, selecionar a cidade e ler os dados com teclado e leitor de tela para consultar o clima sem ajuda.
- **US-06 (FR-06):** Como Marina, quero entender quando há carregamento, ausência de resultado ou falha para saber como prosseguir.
- **US-07 (FR-07):** Como Marina, quero consultar o clima sem criar conta para evitar etapas desnecessárias.

Personas são hipóteses do discovery, não segmentos validados. A meta de validação de usabilidade vigente é a definida no Overview: 8 de 10 participantes completam o fluxo em até 60 segundos.

## Acceptance Criteria

- **AC-01a — FR-01:** Given o campo contém somente espaços; When a pessoa envia a busca; Then nenhuma chamada de geocoding ocorre e a UI solicita uma cidade.
- **AC-01b — FR-01:** Given a busca contém `  L'Haÿ-les-Roses  `; When a pessoa envia; Then espaços periféricos são removidos, acento, apóstrofo e hífen são preservados, e a consulta termina sem erro de codificação.
- **AC-01c — FR-01:** Given a pessoa informa uma cidade e envia a busca; When o geocoding retorna candidatos; Then cada candidato aparece como opção e pode ser alcançado e selecionado por teclado.
- **AC-02 — FR-02:** Given existem dois candidatos homônimos com coordenadas distintas; When a pessoa seleciona um; Then a localização apresentada corresponde à opção e as consultas usam exatamente suas coordenadas.
- **AC-03 — FR-03:** Given a API retorna temperatura, código de condição e horário para a cidade selecionada; When a resposta é renderizada; Then a UI mostra cidade, temperatura na unidade ativa, condição em pt-BR e horário local. Qualquer campo ausente é marcado como indisponível; sem temperatura, todo o bloco atual é marcado como indisponível.
- **AC-04 — FR-04:** Given a API retorna fuso `T` e data local atual `D`; When uma resposta diária válida é renderizada; Then há exatamente cinco entradas em ordem, com datas `D` a `D+4`, cada uma com condição e mínima/máxima ou indicação explícita de campo indisponível.
- **AC-05a — FR-05:** Given a unidade não foi alterada; When uma temperatura de `20 °C` é exibida; Then a UI mostra `20 °C`.
- **AC-05b — FR-05:** Given o valor interno é `20 °C`; When a pessoa seleciona Fahrenheit; Then a UI mostra `68 °F` para esse valor e atualiza todos os outros valores de temperatura atuais e previstos.
- **AC-05c — FR-05:** Given o valor interno é `-10 °C`; When a pessoa seleciona Fahrenheit; Then a UI mostra `14 °F`, confirmando conversão antes do arredondamento.
- **AC-06a — FR-06:** Given uma chamada externa está pendente; When a busca começa; Then a UI mostra loading e o expõe como status acessível.
- **AC-06b — FR-06:** Given o geocoding retorna lista vazia; When a resposta é recebida; Then a UI informa “Nenhuma cidade encontrada” e não envia chamada de previsão.
- **AC-06c — FR-06:** Given uma chamada externa não responde em 8 s ou retorna falha; When o timeout/erro ocorre; Then a UI encerra loading, informa a falha sem exibir dados inválidos e oferece retry manual; nenhuma repetição automática ocorre.
- **AC-07 — FR-07:** Given a pessoa não tem sessão; When pesquisa, seleciona uma cidade e consulta o clima; Then conclui o fluxo sem login, cadastro ou credenciais.

## Traceability Matrix

| User Story | FRs | Acceptance Criteria | NFRs relevantes |
|---|---|---|---|
| US-01 — Encontrar minha cidade | FR-01, FR-02 | AC-01a, AC-01b, AC-01c, AC-02 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-07, NFR-10 |
| US-02 — Ver o clima atual | FR-03, FR-05 | AC-03, AC-05a, AC-05b, AC-05c | NFR-01, NFR-02, NFR-03, NFR-04, NFR-06, NFR-07, NFR-09, NFR-10 |
| US-03 — Planejar os próximos dias | FR-04, FR-05 | AC-04, AC-05b, AC-05c | NFR-01, NFR-02, NFR-03, NFR-04, NFR-06, NFR-07, NFR-10 |
| US-04 — Escolher minha unidade | FR-05 | AC-05a, AC-05b, AC-05c | NFR-01, NFR-02, NFR-03, NFR-08 |
| US-05 — Consultar com tecnologia assistiva | FR-01, FR-02, FR-03, FR-04 | AC-01c, AC-02, AC-03, AC-04, AC-06a | NFR-02, NFR-03, NFR-07, NFR-10 |
| US-06 — Entender o estado da consulta | FR-06 | AC-06a, AC-06b, AC-06c | NFR-01, NFR-03, NFR-05, NFR-06, NFR-10 |
| US-07 — Consultar sem criar conta | FR-07 | AC-07 | NFR-08 |

## Non-Functional Requirements

Baseline v1 para implementar e validar o MVP:

- **NFR-01 — Idioma:** textos e datas seguem pt-BR; condições meteorológicas usam rótulos em português.
- **NFR-02 — Responsividade:** sem rolagem horizontal ou controles inacessíveis em viewports de 320 a 1920 CSS px, em orientação retrato ou paisagem.
- **NFR-03 — Acessibilidade:** WCAG 2.2 AA; fluxo principal operável por teclado, foco visível, nomes acessíveis para controles e anúncio dos estados de consulta.
- **NFR-04 — Performance:** LCP ≤ 2,5 s no percentil 75 em perfil móvel 4G; renderização dos dados ≤ 500 ms no percentil 95 após resposta da API.
- **NFR-05 — Timeout:** chamadas ao geocoding e à previsão expiram em 8 s; retry é manual e único por ação do usuário.
- **NFR-06 — Disponibilidade:** disponibilidade mensal do app ≥ 99,5%, medida no endpoint de hospedagem por monitor externo; falhas do Open-Meteo são contabilizadas separadamente.
- **NFR-07 — Compatibilidade:** suportar as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari no momento do release.
- **NFR-08 — Dados e privacidade:** sem autenticação, persistência no servidor, armazenamento local, telemetria ou cookies não essenciais; a unidade volta a Celsius ao recarregar a página.
- **NFR-09 — Atualidade:** exibir o horário retornado para os dados atuais; se estiver mais de 2 h atrasado em relação ao relógio atual, sinalizar “Dados desatualizados”. Não afirmar atualização em tempo real.
- **NFR-10 — Dependência externa:** consumir Open-Meteo sem API key. Antes do release público, validar termos de uso, atribuição, cobertura e limites de requisição.

## Edge Cases

- **Input vazio/espaços:** não chamar geocoding; manter o campo editável e informar que é necessário digitar uma cidade.
- **Caracteres especiais:** remover espaços periféricos, preservar acentos, apóstrofos, hífens e `&`; a consulta não deve falhar por codificação.
- **Cidade inexistente/geocoding vazio:** informar “Nenhuma cidade encontrada”; não afirmar inexistência fora da cobertura do provedor nem chamar a previsão.
- **Homônimos:** exibir região e país quando disponíveis; consultar as coordenadas do candidato selecionado.
- **Falha/timeout/limite de API:** encerrar loading, manter a busca disponível, comunicar a falha e oferecer retry manual; nunca substituir dados por zeros ou previsão falsa.
- **Resposta parcial:** exibir campos válidos; rotular campo ausente como indisponível. Sem temperatura atual válida, não exibir condição como se a consulta estivesse completa; sem data ou temperatura mínima/máxima de um dia, marcar esse dia como indisponível.
- **Virada de dia/fuso:** usar o fuso da cidade selecionada para calcular `hoje` e a sequência de cinco datas.
- **Conversão:** converter valores negativos e decimais antes do arredondamento; aplicar a unidade ativa a todas as temperaturas atuais e previstas.
- **Respostas fora de ordem:** somente a resposta da consulta mais recente pode atualizar a tela; respostas de buscas anteriores devem ser descartadas.
- **Sem conexão:** mostrar estado de erro e retry; não há garantia de modo offline ou cache no MVP.

## Assumptions

- Plataforma do MVP: aplicação web responsiva; aplicativos nativos não fazem parte do escopo.
- Busca enviada explicitamente por nome de cidade, sem autocomplete; candidatos mostram cidade, região e país quando disponíveis e exigem coordenadas válidas.
- Clima atual: temperatura, código de condição e horário retornado. Previsão diária: data, código de condição e temperaturas mínima/máxima.
- A previsão contém hoje e os quatro dias seguintes no fuso IANA retornado pelo provedor.
- Todas as temperaturas atuais e previstas são convertidas; arredondamento ocorre somente para exibição, ao inteiro mais próximo.
- A unidade selecionada vale até a página ser recarregada; não há armazenamento local.
- Não há login, persistência no servidor, telemetria, cookies não essenciais ou modo offline no MVP.
- Público prioritário inicial: pessoas consultando clima local e viajantes planejando atividades; personas continuam hipóteses até validação.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Limites, cobertura ou indisponibilidade do Open-Meteo | Média | Alto: consulta principal pode falhar. | Validar termos/cobertura antes do release; monitorar falhas; aplicar timeout e retry manual; avaliar provedor alternativo se necessário. |
| Contrato ou campos do provedor diferirem do baseline | Média | Alto: telas e testes podem exigir retrabalho. | Validar campos e amostras reais antes de congelar os critérios de aceite. |
| Cidades homônimas selecionadas incorretamente | Média | Alto: todos os dados podem pertencer a outro local. | Exibir metadados de desambiguação e validar as coordenadas usadas em cada consulta. |
| Metas do baseline v1 não serem atingidas em hospedagem/dispositivos reais | Média | Alto: experiência ou disponibilidade abaixo do esperado. | Medir NFRs em pré-release e bloquear publicação quando critérios WCAG, performance ou disponibilidade não forem atendidos. |

## Out of Scope

- Aplicativos nativos iOS/Android.
- Cadastro, login, autenticação ou persistência de usuário no servidor.
- Geolocalização automática, favoritos, histórico ou múltiplas cidades salvas.
- Alertas, notificações, mapas, radar ou previsão horária.
- Armazenamento local, telemetria e funcionamento offline.
- Idiomas além de pt-BR.

## Open Questions

Nenhuma pergunta de escopo bloqueia a implementação do MVP com o baseline v1 desta especificação.

**Validações obrigatórias antes do release público:**

- Confirmar termos de uso, atribuição, cobertura geográfica e limites vigentes do Open-Meteo.
- Executar teste de integração com respostas reais para confirmar coordenadas, campos mínimos, fuso e timestamp.
- Medir NFRs no ambiente de hospedagem e executar avaliação de acessibilidade e usabilidade contra os critérios definidos.
