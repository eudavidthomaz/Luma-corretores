import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OTIMIZAÇÃO: Usar Lovable AI Gateway para billing unificado
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Conteúdo do contrato é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[enhance-contract] Processing contract, length:', content.length);

    const systemPrompt = `Você é um assistente especializado em contratos de prestação de serviços fotográficos no Brasil.

Analise o contrato fornecido e faça as seguintes melhorias:

1. **VARIÁVEIS MÁGICAS**: Identifique dados que devem ser preenchidos pelo cliente e substitua por variáveis no formato {{variavel}}:
   - Nome do cliente → {{nome_cliente}}
   - CPF → {{cpf}}
   - RG → {{rg}}
   - Endereço completo → {{endereco}}
   - Cidade → {{cidade}}
   - Estado/UF → {{estado}}
   - CEP → {{cep}}
   - Telefone → {{telefone}}
   - E-mail → {{email}}
   - Data do evento → {{data_evento}}
   - Local do evento → {{local_evento}}
   - Horário do evento → {{horario_evento}}
   - Valor total → {{valor_total}}
   - Data de assinatura → {{data_assinatura}}

2. **ITENS DA PROPOSTA**: Se o contrato não tiver uma seção para listar os serviços contratados, adicione uma cláusula com:
   {{itens_proposta}}
   (Esta variável será automaticamente substituída pela lista de serviços da proposta)

3. **FORMATAÇÃO**: Melhore a estrutura visual usando:
   - Títulos claros para cada cláusula
   - Numeração de cláusulas (CLÁUSULA 1ª, CLÁUSULA 2ª, etc.)
   - Parágrafos bem organizados

4. **GRAMÁTICA E ORTOGRAFIA**: Corrija erros gramaticais e ortográficos.

5. **TERMOS JURÍDICOS**: Mantenha a formalidade jurídica apropriada para contratos brasileiros.

REGRAS IMPORTANTES:
- NÃO adicione explicações ou comentários
- NÃO remova cláusulas importantes do contrato original
- PRESERVE a estrutura geral e intenção do contrato
- Retorne APENAS o contrato melhorado, pronto para uso

Se o texto parecer muito curto ou incompleto, ainda assim faça as melhorias possíveis e adicione uma estrutura básica de contrato de prestação de serviços fotográficos.`;

    const userPrompt = `Melhore o seguinte contrato de prestação de serviços fotográficos:

${content}

---

Retorne o contrato completo e melhorado:`;

    // OTIMIZAÇÃO: Usar Lovable AI Gateway para billing centralizado
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[enhance-contract] Lovable AI Gateway error:', response.status, errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('[enhance-contract] Invalid Gateway response:', JSON.stringify(data));
      throw new Error('Resposta inválida da API');
    }

    const enhancedContent = data.choices[0].message.content;
    
    console.log('[enhance-contract] Contract enhanced successfully, new length:', enhancedContent.length);

    return new Response(
      JSON.stringify({ enhanced_content: enhancedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[enhance-contract] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar contrato';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
