# Backlog de Tarefas — Weather App

Tarefas derivadas de [plans/weather-app-plan.md](../plans/weather-app-plan.md) e rastreadas aos requisitos de [specs/weather-app-spec.md](../specs/weather-app-spec.md). Concluir dependências antes de iniciar cada tarefa dependente.

Os IDs originais foram preservados; subtarefas usam os próximos IDs disponíveis e aparecem junto à entrega correspondente, em ordem de dependência.

Para cada tarefa do tipo `Test`, executar a suíte/arquivo correspondente com o script adequado do `package.json`; o critério só passa com código de saída zero. Validações manuais/de release devem registrar o resultado observado.

## Matriz de rastreabilidade FR → Tarefas

| Requisito da spec | Tarefas de implementação | Tarefas de teste/validação |
|---|---|---|
| FR-01 — Pesquisar cidade | T-08, T-10, T-12, T-21 | T-11, T-13, T-22, T-23 |
| FR-02 — Selecionar cidade | T-01, T-09, T-10, T-12, T-14, T-16, T-21 | T-11, T-13, T-15, T-17, T-22, T-23 |
| FR-03 — Clima atual | T-01, T-04, T-05, T-14, T-16, T-18, T-41 | T-15, T-17, T-30, T-31, T-34, T-23 |
| FR-04 — Previsão | T-01, T-04, T-05, T-14, T-16, T-19, T-41 | T-15, T-17, T-30, T-31, T-34, T-23 |
| FR-05 — Unidade | T-03, T-16, T-18, T-19, T-20, T-41 | T-06, T-17, T-23, T-35 |
| FR-06 — Estados de consulta | T-07, T-10, T-12, T-14, T-16, T-21, T-32, T-33, T-41 | T-11, T-13, T-15, T-17, T-23, T-36 |
| FR-07 — Acesso anônimo | T-02, T-21, T-41 | T-23 |

Todos os requisitos funcionais FR-01 a FR-07 têm pelo menos uma tarefa de implementação e uma tarefa de teste/validação correspondente. **Requisitos funcionais sem tarefa: nenhum.**

## Prioridade e tamanho

Prioridade: **P0** é necessário para obter as fatias funcionais do MVP; **P1** é gate de qualidade/release previsto na spec; **P2** seria melhoria adiável sem bloquear a spec. Tamanho relativo: **P** é uma mudança isolada; **M** envolve serviço, hook ou feature delimitada; **G** envolve fluxo integrado, múltiplos ambientes ou validação externa.

| Prioridade | Tamanho | Tarefas |
|---|---|---|
| P0 | P | T-02, T-03, T-06, T-07, T-08, T-32, T-33, T-35, T-36, T-40 |
| P0 | M | T-01, T-04, T-05, T-09, T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19, T-20, T-21, T-22, T-29, T-30, T-31, T-34, T-41 |
| P1 | P | T-38 |
| P1 | M | T-24, T-25, T-27 |
| P1 | G | T-23, T-26, T-28, T-37, T-39 |

**P2:** nenhuma tarefa. O backlog atual só contém trabalho necessário ao MVP ou gates de release definidos na spec; não há melhoria opcional que deva ser priorizada sobre esses itens.

## Sequência por fatias verticais

| Ordem | Fatia e tarefas | Resultado demonstrável |
|---|---|---|
| 1 — P0 | T-01, T-02, T-07, T-08, T-09, T-10, T-11, T-12, T-13, T-21, T-22, T-29, T-32, T-33, T-36, T-40 | Busca explícita retorna cidades; a pessoa seleciona uma, vê loading/vazio/erro e conclui o fluxo sem login. É a primeira entrega visível, sem esperar o Forecast. |
| 2 — P0 | T-03, T-04, T-05, T-06, T-14, T-15, T-16, T-17, T-18, T-19, T-20, T-30, T-31, T-34, T-35, T-41 | Depois da seleção, a tela mostra clima atual, cinco dias locais e alternância °C/°F, com testes unitários/de componentes. |
| 3 — P1 | T-23, T-24, T-25, T-26, T-27, T-28, T-37, T-38, T-39 | Fluxos E2E desktop/mobile, acessibilidade, integração e condições do provedor, métricas operacionais, compatibilidade e usabilidade passam pelos gates antes do release público. |

Dentro de cada fatia, respeitar as dependências listadas em cada tarefa; tarefas independentes podem ser executadas em paralelo. Não adiar gates P1 para um release público.

## Entrega 1 — Base e contratos

### T-01 — Definir os tipos de domínio e DTOs Open-Meteo
- **Tipo:** Data
- **Descrição:** Criar contratos TypeScript para `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `Unit`, `WeatherError` e os payloads externos consumidos pelos serviços.
- **Critérios de aceite:**
  - `City` contém `id`, `name`, `latitude`, `longitude` e `admin1`, `country`, `timezone` opcionais; `CurrentWeather` contém `temperatureC`, `weatherCode`, `observedAt`; `ForecastDay` contém `date`, `weatherCode`, `temperatureMinC`, `temperatureMaxC`.
  - `WeatherData` contém `city`, `timezone`, `current`, `forecast`; `Unit` é exatamente `"celsius" | "fahrenheit"`; `WeatherError` tem variantes `timeout`, `network`, `api` e `invalid-response`.
  - Temperaturas, código WMO, data e horário potencialmente ausentes aceitam `null`; nenhum tipo usa zero como sentinela.
  - DTOs Open-Meteo ficam separados dos modelos de domínio; `WeatherData.forecast` é `ForecastDay[]` e o serviço, não o tipo, garante cinco entradas em runtime.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`, `src/types/open-meteo.ts`.
- **Requisitos:** FR-02, FR-03, FR-04, FR-05, FR-06.

### T-02 — Criar o shell responsivo da aplicação
- **Tipo:** UI
- **Descrição:** Preparar o bootstrap React/Vite e a composição mínima da aplicação.
- **Critérios de aceite:**
  - `main.tsx` monta o root React e renderiza `App`; `pnpm build` termina com código zero.
  - O fluxo inicial não apresenta campos ou etapas de login e não usa armazenamento local, telemetria ou cookies não essenciais.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.
- **Requisitos:** FR-07, NFR-08.

### T-29 — Aplicar estilos globais e layout responsivo
- **Tipo:** UI
- **Descrição:** Definir a base visual Tailwind dark glassmorphism e os limites responsivos da página.
- **Critérios de aceite:**
  - O CSS global define fundo escuro da página e pelo menos uma superfície de conteúdo translúcida com `backdrop-filter`.
  - O breakpoint/layout base mantém os componentes dentro da largura do viewport; a medição de overflow em 320 CSS px é verificada em T-24.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/styles/index.css`, `src/main.tsx`.
- **Requisitos:** NFR-02.

### T-40 — Declarar o idioma principal do documento
- **Tipo:** UI
- **Descrição:** Configurar o idioma do documento HTML para pt-BR.
- **Critérios de aceite:**
  - `document.documentElement.lang` é exatamente `pt-BR` no app servido pelo Vite.
  - `pnpm build` termina com código zero.
- **Dependências:** T-02.
- **Arquivos prováveis:** `index.html`.
- **Requisitos:** NFR-01, NFR-03.

### T-03 — Implementar conversão e formatação de temperatura
- **Tipo:** Data
- **Descrição:** Criar função pura que deriva a temperatura de exibição a partir do valor canônico em Celsius e da unidade ativa.
- **Critérios de aceite:**
  - `20 °C` é formatado como `20 °C`; `20 °C` convertido resulta em `68 °F`; `-10 °C` resulta em `14 °F`.
  - Valor decimal é convertido antes do arredondamento e o resultado exibido é o inteiro mais próximo.
  - `null` é formatado como indisponível, nunca como `0 °C` ou `0 °F`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Requisitos:** FR-05, AC-05a, AC-05b, AC-05c.

### T-04 — Mapear códigos WMO para condições em pt-BR
- **Tipo:** Data
- **Descrição:** Implementar conversão pura de códigos WMO em rótulos meteorológicos compreensíveis.
- **Critérios de aceite:**
  - Todos os códigos WMO listados no contrato do Forecast API têm um rótulo em português: `0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99`.
  - Entrada `null` ou código fora dessa lista retorna o estado/rótulo indisponível.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weather-codes.ts`.
- **Requisitos:** FR-03, FR-04, NFR-01.

### T-05 — Implementar formatação de datas, horários e atualidade
- **Tipo:** Data
- **Descrição:** Criar funções puras de apresentação pt-BR que recebem explicitamente o fuso IANA da cidade e verificam a idade do dado atual.
- **Critérios de aceite:**
  - Uma data diária `YYYY-MM-DD` e um horário local de observação são formatados usando exatamente o fuso IANA recebido, independentemente do fuso do navegador.
  - Dado com idade maior que 2 horas é marcado como desatualizado; dado com idade igual ou menor que 2 horas não recebe essa marca.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/formatters.ts`.
- **Requisitos:** FR-03, FR-04, NFR-01, NFR-09.

### T-06 — Testar conversão de temperatura
- **Tipo:** Test
- **Descrição:** Cobrir conversão e arredondamento de temperatura com Vitest.
- **Critérios de aceite:**
  - Vitest verifica `20 °C → 20 °C`, `20 °C → 68 °F`, `-10 °C → 14 °F` e `20.4 °C → 69 °F`.
  - Entrada `null` retorna indisponibilidade; valor decimal é convertido antes do arredondamento.
- **Dependências:** T-03.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.
- **Requisitos:** FR-05, AC-05a, AC-05b, AC-05c.

### T-30 — Testar rótulos de condições meteorológicas
- **Tipo:** Test
- **Descrição:** Cobrir o mapeamento de códigos WMO e o comportamento para códigos ausentes ou desconhecidos.
- **Critérios de aceite:**
  - Um teste parametrizado verifica rótulo não vazio em pt-BR para cada um dos 28 códigos WMO definidos em T-04.
  - Casos `null` e `999` retornam o estado/rótulo indisponível.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/lib/weather-codes.test.ts`.
- **Requisitos:** FR-03, FR-04, NFR-01.

### T-31 — Testar formatação de data, horário e atualidade
- **Tipo:** Test
- **Descrição:** Cobrir formatação com locale/fuso fixos e a regra de dado atual desatualizado.
- **Critérios de aceite:**
  - Com fixture `2026-10-29` e locale `pt-BR`, a data é `29/10/2026`; horário `2026-10-29T14:00` no fuso `America/Sao_Paulo` é exibido como `14:00`, mesmo com fuso do navegador diferente.
  - Com relógio fake, 2 h exatas não é stale e 2 h + 1 ms é stale.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/lib/formatters.test.ts`.
- **Requisitos:** FR-03, FR-04, NFR-01, NFR-09.

## Entrega 2 — Busca e seleção de cidade

### T-07 — Criar apresentação reutilizável de loading
- **Tipo:** UI
- **Descrição:** Implementar a apresentação acessível do estado de loading.
- **Critérios de aceite:**
  - Renderização expõe exatamente uma região com `role="status"` e texto de carregamento não vazio.
- **Dependências:** T-02, T-29.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`.
- **Requisitos:** FR-06, AC-06a, NFR-03.

### T-32 — Criar apresentação acessível do estado vazio
- **Tipo:** UI
- **Descrição:** Implementar mensagem reutilizável de ausência de resultados.
- **Critérios de aceite:**
  - Para busca sem resultados, renderiza o texto `Nenhuma cidade encontrada` dentro de uma região anunciável (`role="status"`).
  - Não renderiza indicador de loading nem botão de retry nesse estado.
- **Dependências:** T-02, T-29.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Requisitos:** FR-06, AC-06b, NFR-03.

### T-33 — Criar apresentação acessível do estado de erro
- **Tipo:** UI
- **Descrição:** Implementar mensagem reutilizável de erro com ação de retry manual.
- **Critérios de aceite:**
  - Erro renderiza mensagem amigável e botão com nome acessível `Tentar novamente`.
  - Ativar o botão por teclado chama o callback de retry uma vez; renderizar o estado não chama o callback.
- **Dependências:** T-02, T-29.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Requisitos:** FR-06, AC-06c, NFR-03, NFR-05.

### T-08 — Implementar formulário de busca explícita
- **Tipo:** UI
- **Descrição:** Criar campo e envio explícito de busca por cidade, sem autocomplete.
- **Critérios de aceite:**
  - Campo possui label associado e formulário envia pelo botão ou Enter.
  - Submeter `  L'Haÿ-les-Roses  ` chama o callback com `L'Haÿ-les-Roses`, preservando acento, apóstrofo e hífen.
  - Submeter somente espaços mostra validação de input e não chama o callback de busca.
- **Dependências:** T-02, T-07, T-29, T-32.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`.
- **Requisitos:** FR-01, AC-01a, AC-01b, NFR-03.

### T-09 — Implementar lista acessível de cidades candidatas
- **Tipo:** UI
- **Descrição:** Apresentar candidatos do geocoding e permitir seleção inequívoca por teclado ou ponteiro.
- **Critérios de aceite:**
  - Cada opção renderiza `name` e, quando presentes, `admin1` e `country`.
  - Selecionar uma opção chama o callback com o mesmo `id`, `latitude` e `longitude` recebidos.
  - Todas as opções são alcançáveis e selecionáveis por teclado, com foco visível.
- **Dependências:** T-01, T-07, T-29, T-32.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Requisitos:** FR-02, AC-01c, AC-02, NFR-03.

### T-10 — Implementar serviço de geocoding
- **Tipo:** Data
- **Descrição:** Encapsular a chamada à Open-Meteo Geocoding API e normalizar candidatos válidos para `City`.
- **Critérios de aceite:**
  - URL contém `name`, `count=10`, `language=pt` e `format=json`; consulta com acento/apóstrofo é transmitida via `URLSearchParams`.
  - Descarta resultado sem nome, latitude não finita/fora de `[-90, 90]` ou longitude não finita/fora de `[-180, 180]`.
  - Após 8 s rejeita com `kind: "timeout"`; também propaga cancelamento e distingue `network`, `api` e `invalid-response`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/geocoding.ts`.
- **Requisitos:** FR-01, FR-02, FR-06, AC-01b, AC-02, NFR-05.

### T-11 — Testar serviço de geocoding
- **Tipo:** Test
- **Descrição:** Cobrir a construção da requisição e a normalização com `fetch` mockado.
- **Critérios de aceite:**
  - Vitest verifica URL/parâmetros, mapeamento de um resultado e descarte dos quatro casos inválidos: nome ausente, latitude fora da faixa, longitude fora da faixa e coordenada não numérica.
  - Testes separados verificam lista vazia, HTTP não-2xx, JSON inválido, rejeição de rede, timeout em 8 s e cancelamento.
  - Busca `L'Haÿ-les-Roses` aparece sem perda no parâmetro `name` decodificado.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/services/geocoding.test.ts`.
- **Requisitos:** FR-01, FR-02, FR-06, AC-01b, AC-06c.

### T-12 — Orquestrar busca e seleção no hook
- **Tipo:** UI
- **Descrição:** Implementar `useWeather` para controlar consulta, candidatos, cidade selecionada e estados de busca.
- **Critérios de aceite:**
  - Hook transita de `idle` para `loading` e depois para `success`, `empty` ou `error` conforme o resultado de geocoding.
  - Busca vazia não chama `searchCities`; lista vazia não chama o serviço de forecast.
  - Duas buscas consecutivas resolvidas em ordem inversa deixam na tela apenas os candidatos da segunda busca.
- **Dependências:** T-01, T-10.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Requisitos:** FR-01, FR-02, FR-06, AC-01a, AC-01c, AC-02, AC-06b.

### T-13 — Testar busca e seleção no hook
- **Tipo:** Test
- **Descrição:** Testar transições do hook com serviço de geocoding substituído por mock.
- **Critérios de aceite:**
  - Testes com mocks verificam os cinco estados de busca e que input vazio não chama o mock.
  - Selecionar uma fixture chama o serviço de forecast com latitude/longitude idênticas à fixture.
  - Uma busca antiga resolvida por último não altera o estado da busca mais recente.
- **Dependências:** T-11, T-12.
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.tsx`.
- **Requisitos:** FR-01, FR-02, FR-06, AC-01a, AC-02, AC-06a, AC-06b, AC-06c.

### T-21 — Compor busca e seleção na aplicação
- **Tipo:** UI
- **Descrição:** Conectar formulário de busca, estados de geocoding e lista de cidades em `App` para entregar a primeira fatia funcional.
- **Critérios de aceite:**
  - Enviar uma cidade exibe os candidatos; selecionar um exibe a cidade escolhida sem exigir login.
  - Busca vazia, loading, lista vazia e erro de geocoding renderizam os estados correspondentes.
  - Lista vazia não solicita forecast; retry do erro inicia uma nova busca somente após ação explícita.
- **Dependências:** T-02, T-07, T-08, T-09, T-10, T-12, T-29, T-32, T-33, T-40.
- **Arquivos prováveis:** `src/App.tsx`.
- **Requisitos:** FR-01, FR-02, FR-06, FR-07, AC-01a, AC-01c, AC-02, AC-06a, AC-06b, AC-06c.

### T-22 — Testar componentes de busca e candidatos
- **Tipo:** Test
- **Descrição:** Cobrir formulário de busca e lista de cidades com Vitest e Testing Library.
- **Critérios de aceite:**
  - Testes verificam submissão por botão e Enter; input com espaços não chama o callback e `L'Haÿ-les-Roses` chega aparado e sem perda de caracteres.
  - Resultado exibe nome/região/país disponíveis; seleção por teclado chama callback com `id` e coordenadas da opção.
- **Dependências:** T-08, T-09.
- **Arquivos prováveis:** `tests/components/CitySearch.test.tsx`, `tests/components/CityResults.test.tsx`.
- **Requisitos:** FR-01, FR-02, AC-01a, AC-01c, AC-02, NFR-03.

### T-36 — Testar os componentes de estado
- **Tipo:** Test
- **Descrição:** Cobrir apresentação acessível de loading, vazio e erro.
- **Critérios de aceite:**
  - Loading e vazio expõem `role="status"`; erro expõe mensagem e botão acessível `Tentar novamente`.
  - Apenas o componente de erro renderiza o botão; renderizar não chama retry e ativá-lo chama o callback uma vez.
- **Dependências:** T-07, T-32, T-33.
- **Arquivos prováveis:** `tests/components/states/states.test.tsx`.
- **Requisitos:** FR-06, AC-06a, AC-06b, AC-06c, NFR-03.

## Entrega 3 — Forecast e apresentação do clima

### T-14 — Implementar serviço de forecast
- **Tipo:** Data
- **Descrição:** Consultar e normalizar clima atual e cinco datas diárias da cidade selecionada.
- **Critérios de aceite:**
  - Request envia a latitude/longitude do `City`, `current=temperature_2m,weather_code`, `daily=weather_code,temperature_2m_min,temperature_2m_max`, `timezone=auto`, `forecast_days=5` e `temperature_unit=celsius`.
  - Resposta com cinco datas gera cinco `ForecastDay` na ordem de `daily.time`; cada propriedade é mapeada pelo mesmo índice.
  - Campos ausentes nos arrays viram `null`; arrays de comprimentos diferentes ou JSON sem estrutura exigida rejeitam com `invalid-response`.
  - Chamada expira em 8 s com `timeout`, aceita `AbortSignal` e não repete request automaticamente.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/forecast.ts`.
- **Requisitos:** FR-02, FR-03, FR-04, FR-06, AC-02, AC-03, AC-04, AC-06c, NFR-05.

### T-15 — Testar serviço de forecast
- **Tipo:** Test
- **Descrição:** Validar parâmetros, mapeamento e falhas do Forecast API com fixtures e `fetch` mockado.
- **Critérios de aceite:**
  - Fixture de sucesso verifica coordenadas e todos os parâmetros da request, além de cinco datas mapeadas na ordem recebida.
  - Fixtures separadas verificam temperatura atual `null`, campo diário `null`, código WMO `null` e arrays de comprimentos diferentes rejeitados como `invalid-response`.
  - Testes verificam HTTP não-2xx, payload de erro, JSON inválido, rejeição de rede, timeout em 8 s e cancelamento sem retry automático.
- **Dependências:** T-14.
- **Arquivos prováveis:** `tests/unit/services/forecast.test.ts`.
- **Requisitos:** FR-02, FR-03, FR-04, FR-06, AC-02, AC-03, AC-04, AC-06c.

### T-16 — Integrar consulta meteorológica ao hook
- **Tipo:** UI
- **Descrição:** Ao selecionar cidade, consultar forecast e coordenar estado, timeout, retry manual e proteção contra respostas fora de ordem.
- **Critérios de aceite:**
  - Selecionar cidade chama forecast uma vez com as coordenadas selecionadas e muda estado para `loading`.
  - Resposta válida muda estado para `success`; timeout ou falha termina em `error`, sem deixar loading ativo.
  - Retry manual inicia exatamente uma nova chamada; alternar unidade não aumenta a contagem de chamadas.
  - Ao resolver duas consultas em ordem inversa, apenas a seleção mais recente permanece em `weather`.
- **Dependências:** T-12, T-14.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Requisitos:** FR-02, FR-03, FR-04, FR-05, FR-06, AC-02, AC-06a, AC-06c.

### T-17 — Testar consulta e estados de forecast no hook
- **Tipo:** Test
- **Descrição:** Cobrir seleção, consulta de forecast, erros e concorrência usando serviços mockados.
- **Critérios de aceite:**
  - Vitest verifica `loading → success` e `loading → error`, incluindo timeout e resposta parcial.
  - Um retry manual aumenta em exatamente um a contagem de chamadas; não há chamada automática.
  - Duas promises resolvidas fora de ordem deixam apenas a cidade mais recente no estado; mudar unidade mantém a contagem de requests.
- **Dependências:** T-13, T-15, T-16.
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.tsx`.
- **Requisitos:** FR-02, FR-03, FR-04, FR-05, FR-06, AC-02, AC-03, AC-04, AC-06a, AC-06c.

### T-18 — Exibir condições atuais
- **Tipo:** UI
- **Descrição:** Renderizar cidade, temperatura, condição e horário local, incluindo dados desatualizados e indisponíveis.
- **Critérios de aceite:**
  - Renderiza nome da cidade, temperatura com unidade, rótulo pt-BR do código WMO e horário da observação formatado no fuso da cidade.
  - Com `temperatureC: null`, apresenta o bloco atual inteiro como indisponível; com código/horário `null`, marca cada campo como indisponível.
  - Dado com idade maior que 2 h exibe `Dados desatualizados`; com idade de 2 h ou menos, não exibe esse aviso.
- **Dependências:** T-03, T-04, T-05, T-07, T-16.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Requisitos:** FR-03, FR-05, AC-03, NFR-01, NFR-09.

### T-19 — Exibir previsão diária de cinco datas
- **Tipo:** UI
- **Descrição:** Renderizar previsão local em ordem, com condição, mínima e máxima para cada dia.
- **Critérios de aceite:**
  - DOM contém exatamente cinco itens na ordem dos cinco `ForecastDay` recebidos, com datas locais no fuso informado.
  - Cada item exibe data e mínima/máxima; `null` resulta em texto de indisponibilidade no campo correspondente e não desloca valores de outro índice.
  - Código WMO `null` marca condição indisponível; temperaturas seguem unidade ativa.
- **Dependências:** T-03, T-04, T-05, T-07, T-16.
- **Arquivos prováveis:** `src/components/DailyForecast.tsx`.
- **Requisitos:** FR-04, FR-05, AC-04, AC-05b, NFR-01.

### T-20 — Implementar controle e derivação da unidade
- **Tipo:** UI
- **Descrição:** Criar controle acessível Celsius/Fahrenheit e conectar a unidade ao estado de apresentação.
- **Critérios de aceite:**
  - Estado inicial é Celsius; selecionar Fahrenheit atualiza temperatura atual e todos os valores mínimo/máximo.
  - Para valores internos `20 °C` e `-10 °C`, exibe `68 °F` e `14 °F`, arredondando somente na apresentação.
  - Alternância mantém os dados armazenados em Celsius e a contagem de chamadas de serviço inalterada; recarregar restaura Celsius.
- **Dependências:** T-03, T-16, T-18, T-19.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`, `src/App.tsx`.
- **Requisitos:** FR-05, AC-05a, AC-05b, AC-05c, NFR-08.

### T-41 — Compor clima atual, previsão e unidade na aplicação
- **Tipo:** UI
- **Descrição:** Conectar os dados meteorológicos e o controle de unidade à busca já composta em `App`.
- **Critérios de aceite:**
  - Selecionar cidade exibe condições atuais e exatamente cinco dias de previsão.
  - Estados `loading`, `error` e `success` de forecast renderizam os componentes correspondentes; erros oferecem retry manual.
  - Controle de unidade atualiza clima atual e previsão sem uma nova chamada de serviço.
- **Dependências:** T-16, T-18, T-19, T-20, T-21.
- **Arquivos prováveis:** `src/App.tsx`.
- **Requisitos:** FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, AC-02, AC-03, AC-04, AC-05b, NFR-03.

### T-34 — Testar componentes de clima atual e previsão
- **Tipo:** Test
- **Descrição:** Cobrir a apresentação dos dados meteorológicos e campos indisponíveis.
- **Critérios de aceite:**
  - Testes assertam cidade, temperatura/unidade, condição, horário local, valores `null`, bloco indisponível e aviso acima de 2 h.
  - Teste da previsão asserta cinco itens ordenados e marcações indisponíveis para data, mínima/máxima ou código WMO ausentes.
- **Dependências:** T-18, T-19.
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`, `tests/components/DailyForecast.test.tsx`.
- **Requisitos:** FR-03, FR-04, AC-03, AC-04, NFR-09.

### T-35 — Testar o controle de unidade
- **Tipo:** Test
- **Descrição:** Verificar acessibilidade e alternância de Celsius/Fahrenheit no componente.
- **Critérios de aceite:**
  - Testes assertam estado inicial Celsius, operação por teclado e exibição `20 °C → 68 °F` e `-10 °C → 14 °F`.
  - Spies dos serviços mantêm a mesma contagem de chamadas antes e depois da alternância.
- **Dependências:** T-20.
- **Arquivos prováveis:** `tests/components/TemperatureUnitToggle.test.tsx`.
- **Requisitos:** FR-05, AC-05a, AC-05b, AC-05c, NFR-03.

## Entrega 4 — E2E, acessibilidade e release

### T-23 — Cobrir o fluxo principal com Playwright
- **Tipo:** Test
- **Descrição:** Criar E2E determinísticos interceptando as APIs Open-Meteo.
- **Critérios de aceite:**
  - Sem etapa de login ou cadastro, com rotas interceptadas, completa busca, seleção de homônimo, renderização de cinco dias e alternância de unidade.
  - Asserts verificam que resposta de geocoding vazia gera zero requests de forecast e que erro/timeout só repete após clicar retry.
  - Request de forecast contém latitude/longitude do candidato selecionado; o fluxo também completa por teclado.
- **Dependências:** T-22, T-34, T-35, T-36, T-41.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`.
- **Requisitos:** FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, AC-01c, AC-02, AC-04, AC-05b, AC-06b, AC-06c.

### T-24 — Verificar responsividade nos viewports alvo
- **Tipo:** Test
- **Descrição:** Validar o fluxo principal em viewports desktop e mobile.
- **Critérios de aceite:**
  - Playwright executa em 1280×800, 320×740 e 844×390.
  - Em cada viewport, Playwright completa busca, seleção de cidade, exibição do clima atual e cinco dias de previsão, e alternância de unidade.
  - Em cada viewport, `document.documentElement.scrollWidth <= document.documentElement.clientWidth`; campo de busca e botão de envio permanecem visíveis e operáveis.
- **Dependências:** T-23.
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`, `playwright.config.ts`.
- **Requisitos:** NFR-02.

### T-37 — Revisar acessibilidade WCAG do fluxo principal
- **Tipo:** Test
- **Descrição:** Fazer avaliação manual focada em teclado, foco, nomes acessíveis e anúncio de estados.
- **Critérios de aceite:**
  - Checklist registra resultado para busca, seleção, consulta e retry por teclado; todos mantêm indicador de foco visível.
  - Cada controle do fluxo tem nome acessível e loading/erro/vazio é anunciado; não há falha WCAG 2.2 AA aberta no fluxo principal no registro final.
- **Dependências:** T-23, T-41.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`; registro da avaliação WCAG.
- **Requisitos:** NFR-03, NFR-07.

### T-25 — Testar integração real com Open-Meteo
- **Tipo:** Test
- **Descrição:** Confirmar o contrato dos serviços usando respostas reais controladas do Open-Meteo.
- **Critérios de aceite:**
  - Teste opt-in de release recebe HTTP 200 para Geocoding e Forecast, normaliza `City`, produz cinco datas, timezone não vazio e `current.time` parseável.
  - Teste não roda na suíte unitária padrão e registra falha sem mascarar limite/indisponibilidade do provedor.
- **Dependências:** T-14.
- **Arquivos prováveis:** `tests/integration/open-meteo.test.ts`.
- **Requisitos:** NFR-10.

### T-38 — Verificar termos e limites do Open-Meteo
- **Tipo:** Infra
- **Descrição:** Confirmar as condições de uso e operação do provedor antes do release público.
- **Critérios de aceite:**
  - Registro contém URL e data da consulta, texto de atribuição exigido, cobertura geográfica e limite de requisições informado pelo provedor.
  - Cada item recebe resultado confirmado/pendente; qualquer item pendente bloqueia release público.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** Registro de validação do provedor, sem alteração obrigatória no código.
- **Requisitos:** NFR-10.

### T-26 — Medir performance do build
- **Tipo:** Test
- **Descrição:** Medir os alvos de performance no build candidato ao release.
- **Critérios de aceite:**
  - Relatório identifica perfil móvel 4G, quantidade de amostras e percentis medidos.
  - LCP p75 é ≤ 2,5 s e renderização p95 após resposta da API é ≤ 500 ms; qualquer valor acima falha o gate.
- **Dependências:** T-24, T-41.
- **Arquivos prováveis:** `tests/performance/weather-app.perf.spec.ts`; configuração de medição, se necessária.
- **Requisitos:** NFR-04.

### T-39 — Verificar compatibilidade dos navegadores suportados
- **Tipo:** Test
- **Descrição:** Executar os fluxos principais nas versões de navegador definidas para o release.
- **Critérios de aceite:**
  - Matriz registra versão executada de Chrome, Edge, Firefox e Safari e cobre as duas versões estáveis mais recentes de cada um.
  - Busca, seleção, previsão e alternância de unidade passam em cada navegador; falha em qualquer combinação bloqueia o gate.
- **Dependências:** T-23.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/weather-app.spec.ts`.
- **Requisitos:** NFR-07.

### T-27 — Configurar verificação de disponibilidade do app
- **Tipo:** Infra
- **Descrição:** Preparar monitoramento do endpoint de hospedagem para o SLO de disponibilidade do app.
- **Critérios de aceite:**
  - Monitor externo consulta o endpoint de hospedagem e produz histórico suficiente para calcular disponibilidade mensal; alvo é ≥ 99,5%.
  - Falha do endpoint do app e falha da chamada Open-Meteo são registradas como sinais separados.
- **Dependências:** T-41.
- **Arquivos prováveis:** configuração do ambiente de hospedagem e do monitor externo.
- **Requisitos:** NFR-06.

### T-28 — Validar usabilidade do fluxo principal
- **Tipo:** Test
- **Descrição:** Executar o teste moderado pré-release com os dois perfis de participantes definidos na spec.
- **Critérios de aceite:**
  - Dez participantes (cinco de consulta diária e cinco de planejamento de viagem) executam sem ajuda a mesma tarefa: selecionar cidade, identificar condição/temperatura atual e localizar mínima/máxima do dia indicado.
  - Cada conclusão tem tempo registrado; o gate passa se ao menos 8/10 concluem em até 60 segundos. Registrar falhas e tempos individuais.
- **Dependências:** T-24, T-41.
- **Arquivos prováveis:** Roteiro e registro do teste de usabilidade como artefatos de validação pré-release; nenhum arquivo de código obrigatório.
- **Requisitos:** Critério de usabilidade do Overview da spec.