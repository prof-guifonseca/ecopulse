# Inventário de dados do MVP EcoPulse

Este documento separa o que já é dado real/provedor, o que é cache/fallback e o que ainda é simulação controlada.

| Fluxo | Estado atual | Fonte principal | Fallback | Próximo passo |
| --- | --- | --- | --- | --- |
| Onboarding | Local-first realista | `ecopulse:user` + `ecopulse:simulation` | `new-user` local | Sincronizar perfil após login |
| Scanner | Barcode/manual + amostra real | `/api/products/lookup` via Open Food Facts | snapshot Open Food Facts Brasil e registro manual | Persistir `scan_results` no Supabase |
| Produtos | Provider aberto + snapshot real | Open Food Facts API v2 | snapshot versionado em `src/data/openFoodFactsProducts.ts` | Overrides editoriais de score |
| Mapa ESG | Real com fonte aberta | `/api/esg/places` via OSM/Overpass/Nominatim | snapshot oficial/curado de Londrina | Cache persistente e verificação comunitária |
| Visitas ESG | Evento auditável local/server | `/api/esg/visits` | Zustand/localStorage | Persistir visitas e confiança |
| Comunidade | Feed fixture com reações reais locais | `/api/community/reactions` + stores | posts curados | Feed derivado de eventos |
| Impacto | Estimado por eventos | `realImpact` + `/api/impact/me` | fórmulas locais | Separar estimado/verificado no perfil |
| Arena/avatar | Gamificação local | stores versionados | demo explícita | Não bloqueia MVP real |

## Contratos canônicos

- `EcoPulseEvent`: evento auditável para ações do usuário.
- `ProductLookupResult`: resultado normalizado de barcode/provider/cache/manual com evidências e confiança.
- `ScanResult`: scan persistível derivado de lookup.
- `EnvironmentalPoint`: ponto ESG único para OSM, cache, curadoria oficial e sugestões de usuário.
- `CommunityFeedItem`: item de feed preparado para sair de fixtures.
- `ImpactEntry`: métrica de impacto estimada ou verificada.

## Regras de honestidade

- `official` indica snapshot oficial/curado de Londrina.
- `cache` indica resultado reaproveitado.
- `provider` indica dado vindo de API externa ou backend configurado.
- `demo` indica fixture ou cenário explicitamente ativado.
- `simulation` fica restrito ao ledger/ciclo local legado, não aos dados visíveis de produtos/mapa.
- Dados sensíveis e tokens nunca são retornados pelas APIs públicas.
