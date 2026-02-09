/**
 * Default contract templates for different proposal types
 */

export const DEFAULT_PHOTO_CONTRACT = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: {{nome_cliente}}
CPF: {{cpf}}
RG: {{rg}}
Endereço: {{endereco}}, {{cidade}} - {{estado}}, CEP: {{cep}}
Telefone: {{telefone}}
E-mail: {{email}}

CONTRATADO: [Nome do Corretor/Imobiliária]

CLÁUSULA 1ª - DO OBJETO
O presente contrato tem por objeto a prestação de serviços fotográficos profissionais, conforme especificado nos itens abaixo.

{{itens_proposta}}

CLÁUSULA 2ª - DO EVENTO
Data: {{data_evento}}
Local: {{local_evento}}
Horário: {{horario_evento}}

CLÁUSULA 3ª - DO VALOR E PAGAMENTO
Valor total: {{valor_total}}
Forma de pagamento: Conforme acordado entre as partes.

CLÁUSULA 4ª - DA ENTREGA
O material será entregue em até 30 dias após a realização do evento, em formato digital de alta resolução.

CLÁUSULA 5ª - DOS DIREITOS AUTORAIS
O CONTRATADO detém os direitos autorais sobre as imagens produzidas. O CONTRATANTE recebe licença de uso para fins pessoais e não comerciais.

CLÁUSULA 6ª - DO FORO
Fica eleito o foro da comarca do CONTRATADO para dirimir quaisquer questões oriundas deste contrato.

{{cidade}}, {{data_assinatura}}

___________________________
CONTRATANTE: {{nome_cliente}}

___________________________
CONTRATADO`;

export const DEFAULT_VIDEO_CONTRACT = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO AUDIOVISUAL

CONTRATANTE: {{nome_cliente}}
CPF: {{cpf}}
RG: {{rg}}
Endereço: {{endereco}}, {{cidade}} - {{estado}}, CEP: {{cep}}
Telefone: {{telefone}}
E-mail: {{email}}

CONTRATADO: [Nome do Videomaker/Produtora]

CLÁUSULA 1ª - DO OBJETO
O presente contrato tem por objeto a prestação de serviços de produção audiovisual profissional, conforme especificado nos itens abaixo.

{{itens_proposta}}

CLÁUSULA 2ª - DO PROJETO
Data do evento/captação: {{data_evento}}
Local: {{local_evento}}
Duração estimada do vídeo final: {{estimated_duration}} minutos
Formatos de entrega: {{delivery_formats}}

CLÁUSULA 3ª - DO VALOR E PAGAMENTO
Valor total: {{valor_total}}
Forma de pagamento: Conforme acordado entre as partes.

CLÁUSULA 4ª - DAS REVISÕES E ALTERAÇÕES
O presente projeto contempla {{revision_limit}} rodadas de alteração inclusas no valor contratado.
Considera-se "rodada de alteração" o conjunto de ajustes solicitados pelo CONTRATANTE em uma única comunicação.
Rodadas de alteração adicionais serão cobradas separadamente, mediante orçamento prévio.

PARÁGRAFO ÚNICO: Alterações de escopo, como mudança de roteiro, adição de cenas não previstas ou alteração significativa do conceito criativo, não são consideradas "rodadas de alteração" e serão tratadas como adendos contratuais com custos adicionais.

CLÁUSULA 5ª - DOS ARQUIVOS BRUTOS (RAW)
O presente contrato NÃO inclui a entrega dos arquivos brutos de câmera (RAW, LOG ou equivalentes). O CONTRATANTE receberá exclusivamente o material finalizado e editado nos formatos especificados.

PARÁGRAFO ÚNICO: Caso o CONTRATANTE deseje obter os arquivos brutos, deverá solicitar mediante orçamento adicional, que será avaliado pelo CONTRATADO.

CLÁUSULA 6ª - DOS DIREITOS AUTORAIS E TRILHA SONORA
O CONTRATADO detém os direitos autorais sobre a obra audiovisual produzida.
A trilha sonora utilizada na edição é licenciada para o uso específico neste projeto, sendo de responsabilidade do CONTRATADO garantir que as músicas utilizadas possuam licenciamento adequado.

PARÁGRAFO ÚNICO: Caso o CONTRATANTE deseje utilizar músicas específicas não incluídas em bibliotecas de stock, os custos de licenciamento adicional serão de responsabilidade do CONTRATANTE.

CLÁUSULA 7ª - DA ENTREGA
O material será entregue em até 45 dias úteis após a aprovação do roteiro/conceito final, nos seguintes formatos:
{{delivery_formats}}

CLÁUSULA 8ª - DO USO DE DRONE E IMAGENS AÉREAS
Caso o projeto inclua captação com drone (aeronave remotamente pilotada), o CONTRATANTE declara-se ciente de que:
a) A captação está sujeita a condições climáticas favoráveis;
b) É necessária autorização do proprietário do local para voos em propriedade privada;
c) Áreas restritas pela ANAC podem impossibilitar a captação aérea;
d) O CONTRATADO possui habilitação e seguro para operação de drones.

CLÁUSULA 9ª - DO FORO
Fica eleito o foro da comarca do CONTRATADO para dirimir quaisquer questões oriundas deste contrato.

{{cidade}}, {{data_assinatura}}

___________________________
CONTRATANTE: {{nome_cliente}}

___________________________
CONTRATADO`;

/**
 * Default items for video proposals
 */
export const DEFAULT_VIDEO_ITEMS = [
  {
    name: "Pré-Produção",
    details: "Roteiro, storyboard, reunião de alinhamento criativo e visita técnica ao local",
    category: "pre_production",
    quantity: 1,
    unit_price: 0,
    show_price: false,
  },
  {
    name: "Diária de Captação",
    details: "Até 8 horas de gravação com equipamento profissional (câmera 4K, iluminação, áudio)",
    category: "production",
    quantity: 1,
    unit_price: 2500,
    show_price: true,
  },
  {
    name: "Edição e Pós-Produção",
    details: "Montagem, color grading e sound design com trilha licenciada",
    category: "post_production",
    quantity: 1,
    unit_price: 1500,
    show_price: true,
  },
];

/**
 * Video-specific contract variables
 */
export const videoContractVariables = [
  { key: "revision_limit", label: "Rodadas de Revisão", placeholder: "3", isSpecial: true },
  { key: "delivery_formats", label: "Formatos de Entrega", placeholder: "16:9, 9:16", isSpecial: true },
  { key: "estimated_duration", label: "Duração Estimada (min)", placeholder: "3", isSpecial: true },
  { key: "project_format", label: "Formato do Projeto", placeholder: "4K Horizontal", isSpecial: true },
];

/**
 * Item categories for video proposals
 */
export const itemCategories = [
  { value: "pre_production", label: "📝 Pré-Produção", description: "Roteiro, Storyboard, Locação" },
  { value: "production", label: "🎬 Produção", description: "Diárias, Equipamento, Equipe" },
  { value: "post_production", label: "🎨 Pós-Produção", description: "Edição, Color, Áudio, VFX" },
];

/**
 * Delivery format options
 */
export const deliveryFormatOptions = [
  { value: "16:9", label: "16:9 Horizontal", description: "YouTube, TV, Cinema" },
  { value: "9:16", label: "9:16 Vertical", description: "Reels, TikTok, Stories" },
  { value: "1:1", label: "1:1 Quadrado", description: "Feed Instagram" },
  { value: "4:5", label: "4:5 Portrait", description: "Posts Instagram" },
];
