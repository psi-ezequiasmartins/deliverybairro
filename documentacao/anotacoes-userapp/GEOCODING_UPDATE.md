# Atualização do Sistema de Geocodificação - DeliveryBairro

## Resumo das Mudanças

Foi implementado um sistema completo de geocodificação automática para garantir que todos os deliveries cadastrados possuam coordenadas geográficas (LATITUDE/LONGITUDE), permitindo que o UserApp liste corretamente os estabelecimentos dentro do raio de 3km da localização do usuário.

## Mudanças Implementadas

### 1. Frontend - DeliveryApp (Pre-Cadastro)

**Arquivo**: `DeliveryApp/src/site/pages/pre-cadastro.jsx`

**Mudanças**:
- Adicionado novo **Step 2** entre dados básicos e validação de código
- Formulário completo de endereço com:
  - Campo CEP com busca automática via ViaCEP API
  - Campos: Endereço, Número, Complemento, Bairro, Cidade, UF
  - Validação de campos obrigatórios
  - Máscaras de entrada para CEP
  - Interface responsiva e intuitiva

**Fluxo do Pré-Cadastro**:
1. **Step 1**: Dados básicos (nome, responsável, email, telefone, etc.)
2. **Step 2**: Endereço completo com busca por CEP *(NOVO)*
3. **Step 3**: Validação do código (email ou WhatsApp)
4. **Step 4**: Definição de senha e conclusão

### 2. Backend - Sistema de Geocodificação

**Arquivo**: `backend/src/routes.js`

**Funções Adicionadas**:

#### `geocodeAddress(endereco, numero, bairro, cidade, uf)`
- Converte endereço completo em coordenadas geográficas
- Utiliza API Nominatim do OpenStreetMap (gratuita, sem necessidade de API key)
- Retorna `{ latitude, longitude }` ou `null` em caso de falha
- User-Agent personalizado: `'DeliveryBairro/1.0'`

**Rotas Modificadas**:

#### `PUT /api/delivery/update-address/:id` *(NOVA)*
- Atualiza endereço do delivery após pré-cadastro
- Geocodifica automaticamente o endereço
- Gera e envia código de validação (email ou WhatsApp)
- **Parâmetros**:
  ```json
  {
    "CEP": "31000-000",
    "ENDERECO": "Rua Exemplo",
    "NUMERO": "123",
    "COMPLEMENTO": "Sala 1",
    "BAIRRO": "Centro",
    "CIDADE": "Belo Horizonte",
    "UF": "MG",
    "SEND_METHOD": "whatsapp" // ou "email"
  }
  ```

#### `PUT /api/update/delivery/:id` *(ATUALIZADA)*
- Atualização completa de dados do delivery
- **Geocodifica automaticamente quando endereço é alterado**
- Salva LATITUDE e LONGITUDE no banco

### 3. Backend - Service Layer

**Arquivo**: `backend/src/services/DeliveryApp/pedidosDeliveryService.js`

**Mudanças**:
- Adicionada função `geocodeAddress()` local
- Método `atualizarDadosDelivery()` atualizado para:
  - Verificar se há dados completos de endereço
  - Geocodificar automaticamente antes de salvar
  - Atualizar campos LATITUDE e LONGITUDE no banco

### 4. Endpoint Administrativo (NOVO)

**Rota**: `POST /api/admin/geocode-deliveries`

**Funcionalidade**:
- Processa todos os deliveries existentes que têm endereço mas não têm coordenadas
- Útil para reprocessar dados legados
- Retorna relatório completo de sucesso/falhas
- Implementa delay de 1 segundo entre requisições (boas práticas API Nominatim)

**Resposta**:
```json
{
  "message": "Processamento concluído",
  "total": 10,
  "success": 8,
  "failed": 2,
  "results": [
    {
      "id": 1,
      "nome": "Pizzaria Exemplo",
      "status": "success",
      "latitude": -19.9167,
      "longitude": -43.9345
    },
    // ...
  ]
}
```

## Como Usar

### Para Novos Cadastros

1. Acesse: `https://seu-dominio.com/pre-cadastro`
2. Preencha os dados básicos
3. **Preencha o endereço completo** (novo step)
   - Digite o CEP e clique em "BUSCAR"
   - Complete o número do estabelecimento
   - Adicione complemento se necessário
4. Receba o código de validação (WhatsApp ou Email)
5. Valide o código
6. Defina sua senha
7. Acesse o sistema

### Para Deliveries Existentes

#### Atualizar Endereço no Perfil
1. Acesse: DeliveryApp → Menu → Delivery (Perfil)
2. Altere qualquer campo de endereço
3. Clique em "Salvar Alterações"
4. **As coordenadas serão atualizadas automaticamente**

#### Reprocessar Deliveries Legados (Admin)

Execute via Postman, cURL ou similar:

```bash
curl -X POST https://seu-dominio.com/api/admin/geocode-deliveries \
  -H "Content-Type: application/json"
```

Ou via código:
```javascript
const response = await api.post('/api/admin/geocode-deliveries');
console.log(response.data);
```

## Estrutura do Banco de Dados

**Tabela**: `deliveries`

Campos utilizados para geocodificação:
- `CEP` - Código postal
- `ENDERECO` - Rua/Avenida
- `NUMERO` - Número do estabelecimento
- `COMPLEMENTO` - Complemento (opcional)
- `BAIRRO` - Bairro
- `CIDADE` - Cidade
- `UF` - Estado (2 letras)
- `LATITUDE` - Coordenada de latitude (DECIMAL)
- `LONGITUDE` - Coordenada de longitude (DECIMAL)

## API Utilizada

**Nominatim - OpenStreetMap**
- URL: `https://nominatim.openstreetmap.org/search`
- Gratuita e sem necessidade de chave de API
- Rate limit: ~1 requisição por segundo
- Documentação: https://nominatim.org/release-docs/latest/api/Search/

**Formato da requisição**:
```
GET https://nominatim.openstreetmap.org/search?q=ENDERECO_COMPLETO&format=json&limit=1
Headers: User-Agent: DeliveryBairro/1.0
```

## Alternativas de API (Futuro)

Se necessário maior precisão ou volume, considerar:

1. **Google Maps Geocoding API**
   - Mais precisa
   - Requer API Key e billing
   - Custo: $5 por 1000 requisições

2. **Mapbox Geocoding API**
   - Precisão similar ao Google
   - 100.000 requisições/mês gratuitas
   - Requer API Key

3. **Here Maps Geocoding API**
   - Boa precisão
   - 250.000 transações/mês gratuitas
   - Requer API Key

## Benefícios

✅ **UserApp agora lista corretamente os deliveries** baseado na localização
✅ **Cálculo de distância preciso** entre usuário e estabelecimento
✅ **Melhora na experiência do usuário** ao encontrar deliveries próximos
✅ **Processo automatizado** - não requer intervenção manual
✅ **Suporte a dados legados** - reprocessamento via endpoint admin
✅ **Validação em tempo real** durante cadastro e edição

## Monitoramento

### Logs a Observar

**Sucesso de Geocodificação**:
```
Endereço geocodificado: LAT=-19.9167, LON=-43.9345
```

**Falha de Geocodificação**:
```
Não foi possível geocodificar o endereço. Salvando sem coordenadas.
```

**Processamento em Lote**:
```
Delivery 1 (Pizzaria Exemplo) geocodificado com sucesso
Falha ao geocodificar delivery 5 (Restaurante XYZ)
```

## Resolução de Problemas

### Problema: Endereço não geocodificado

**Causas possíveis**:
1. Endereço incompleto ou incorreto
2. Endereço muito específico (ex: fazenda, área rural)
3. API Nominatim temporariamente indisponível
4. Rate limit excedido

**Soluções**:
1. Verificar se todos os campos obrigatórios estão preenchidos
2. Tentar novamente após alguns segundos
3. Ajustar o endereço para ser mais genérico (rua principal, não condomínio específico)
4. Executar o endpoint admin de reprocessamento

### Problema: UserApp não lista o delivery

**Verificações**:
1. Confirmar que LATITUDE e LONGITUDE não são NULL no banco
2. Verificar se CHV = '1' (ativo)
3. Confirmar que o delivery está a menos de 3km do usuário
4. Verificar logs do backend

**Query SQL para diagnóstico**:
```sql
SELECT DELIVERY_ID, DELIVERY_NOME, ENDERECO, NUMERO, BAIRRO, CIDADE, UF, 
       LATITUDE, LONGITUDE, CHV
FROM deliveries
WHERE LATITUDE IS NULL OR LONGITUDE IS NULL;
```

## Próximos Passos (Sugestões)

1. **Implementar cache de geocodificação** - evitar requisições duplicadas
2. **Adicionar retry automático** em caso de falha temporária
3. **Interface admin** para visualizar deliveries sem coordenadas
4. **Mapa de visualização** das coordenadas no perfil do delivery
5. **Validação de coordenadas** - verificar se estão dentro de limites razoáveis
6. **Notificação** quando geocodificação falhar

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

---

**Data de Implementação**: 24/11/2025
**Versão**: 1.0
**Desenvolvido por**: GitHub Copilot & PSI Software Team
