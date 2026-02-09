import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProposalAction {
  action: "view" | "approve" | "request_changes" | "sign" | "upload_receipt";
  data?: Record<string, unknown>;
}

// deno-lint-ignore no-explicit-any
type SupabaseClientAny = SupabaseClient<any, "public", any>;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // GET: Fetch proposal data
    if (req.method === "GET") {
      return await handleGetProposal(supabaseAdmin, token);
    }

    // POST: Handle actions
    if (req.method === "POST") {
      const body = await req.json() as ProposalAction;
      const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
      const userAgent = req.headers.get("user-agent") || "unknown";

      switch (body.action) {
        case "view":
          return await handleViewProposal(supabaseAdmin, token);
        case "approve":
          return await handleApproveProposal(supabaseAdmin, token);
        case "request_changes":
          return await handleRequestChanges(supabaseAdmin, token, body.data?.notes as string);
        case "sign":
          return await handleSignContract(supabaseAdmin, token, body.data, clientIp, userAgent);
        case "upload_receipt":
          return await handleUploadReceipt(supabaseAdmin, token, body.data);
        default:
          return new Response(
            JSON.stringify({ error: "Ação inválida" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
      }
    }

    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in proposal-public:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// =====================================================
// GET: Fetch proposal with items and profile
// =====================================================
async function handleGetProposal(supabase: SupabaseClientAny, token: string) {
  // Validate token format
  if (!isValidUUID(token)) {
    return new Response(
      JSON.stringify({ error: "Token inválido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  // Fetch proposal
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select(`
      id,
      title,
      client_name,
      client_email,
      status,
      valid_until,
      total_amount,
      discount_amount,
      contract_content,
      contract_file_url,
      required_fields,
      payment_info,
      payment_config_id,
      use_manual_total,
      change_request_notes,
      created_at,
      sent_at,
      viewed_at,
      approved_at,
      profile_id,
      proposal_type,
      cover_video_url,
      revision_limit,
      delivery_formats,
      estimated_duration_min,
      project_format,
      reference_links,
      soundtrack_links
    `)
    .eq("public_token", token)
    .neq("status", "draft")
    .maybeSingle();

  if (proposalError) {
    console.error("Error fetching proposal:", proposalError);
    return new Response(
      JSON.stringify({ error: "Erro ao buscar proposta" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!proposal) {
    return new Response(
      JSON.stringify({ error: "Proposta não encontrada" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check if expired
  if (proposal.valid_until && new Date(String(proposal.valid_until)) < new Date()) {
    return new Response(
      JSON.stringify({ error: "Proposta expirada", expired: true }),
      { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Fetch proposal items
  const { data: items, error: itemsError } = await supabase
    .from("proposal_items")
    .select("*")
    .eq("proposal_id", String(proposal.id))
    .order("order_index", { ascending: true });

  if (itemsError) {
    console.error("Error fetching items:", itemsError);
  }

  // Fetch photographer profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      id,
      business_name,
      avatar_url,
      minisite_avatar_url,
      slug,
      whatsapp_number
    `)
    .eq("id", String(proposal.profile_id))
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  // Fetch contract if signed
  let contract = null;
  if (proposal.status === "signed" || proposal.status === "paid") {
    const { data: contractData } = await supabase
      .from("contracts")
      .select("*")
      .eq("proposal_id", String(proposal.id))
      .maybeSingle();
    contract = contractData;
  }

  // Fetch payment config if exists
  let paymentConfig = null;
  if (proposal.payment_config_id) {
    const { data: configData } = await supabase
      .from("payment_configs")
      .select("*")
      .eq("id", String(proposal.payment_config_id))
      .maybeSingle();
    paymentConfig = configData;
  }

  return new Response(
    JSON.stringify({
      proposal,
      items: items || [],
      profile,
      contract,
      payment_config: paymentConfig,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// =====================================================
// VIEW: Mark proposal as viewed
// =====================================================
async function handleViewProposal(supabase: SupabaseClientAny, token: string) {
  const { data: proposal, error: fetchError } = await supabase
    .from("proposals")
    .select("id, status, viewed_at")
    .eq("public_token", token)
    .maybeSingle();

  if (fetchError || !proposal) {
    return new Response(
      JSON.stringify({ error: "Proposta não encontrada" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Only update if not already viewed
  if (!proposal.viewed_at && proposal.status === "sent") {
    const { error: updateError } = await supabase
      .from("proposals")
      .update({
        status: "viewed",
        viewed_at: new Date().toISOString(),
      })
      .eq("id", String(proposal.id));

    if (updateError) {
      console.error("Error updating proposal:", updateError);
    }
  }

  return new Response(
    JSON.stringify({ success: true, message: "Visualização registrada" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// =====================================================
// APPROVE: Client approves proposal
// =====================================================
async function handleApproveProposal(supabase: SupabaseClientAny, token: string) {
  const { data: proposal, error: fetchError } = await supabase
    .from("proposals")
    .select("id, status")
    .eq("public_token", token)
    .maybeSingle();

  if (fetchError || !proposal) {
    return new Response(
      JSON.stringify({ error: "Proposta não encontrada" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Only allow approval from certain statuses
  const allowedStatuses = ["sent", "viewed", "changes_requested"];
  if (!allowedStatuses.includes(String(proposal.status))) {
    return new Response(
      JSON.stringify({ error: "Esta proposta não pode ser aprovada no status atual" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { error: updateError } = await supabase
    .from("proposals")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", String(proposal.id));

  if (updateError) {
    console.error("Error approving proposal:", updateError);
    return new Response(
      JSON.stringify({ error: "Erro ao aprovar proposta" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: "Proposta aprovada!" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// =====================================================
// REQUEST CHANGES: Client requests modifications
// =====================================================
async function handleRequestChanges(
  supabase: SupabaseClientAny,
  token: string,
  notes?: string
) {
  const { data: proposal, error: fetchError } = await supabase
    .from("proposals")
    .select("id, status")
    .eq("public_token", token)
    .maybeSingle();

  if (fetchError || !proposal) {
    return new Response(
      JSON.stringify({ error: "Proposta não encontrada" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { error: updateError } = await supabase
    .from("proposals")
    .update({
      status: "changes_requested",
      change_request_notes: notes || "",
    })
    .eq("id", String(proposal.id));

  if (updateError) {
    console.error("Error requesting changes:", updateError);
    return new Response(
      JSON.stringify({ error: "Erro ao solicitar alteração" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: "Solicitação de alteração enviada" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// =====================================================
// SIGN: Create contract with signature
// =====================================================
async function handleSignContract(
  supabase: SupabaseClientAny,
  token: string,
  data: Record<string, unknown> | undefined,
  clientIp: string,
  userAgent: string
) {
  if (!data) {
    return new Response(
      JSON.stringify({ error: "Dados da assinatura são obrigatórios" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { clientData, signedContent, signatureBase64 } = data as {
    clientData: Record<string, unknown>;
    signedContent: string;
    signatureBase64: string;
  };

  if (!clientData || !signatureBase64) {
    return new Response(
      JSON.stringify({ error: "Dados incompletos para assinatura (clientData e signatureBase64 são obrigatórios)" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Fetch proposal
  const { data: proposal, error: fetchError } = await supabase
    .from("proposals")
    .select("id, status, profile_id, lead_id, contract_file_url")
    .eq("public_token", token)
    .maybeSingle();

  if (fetchError || !proposal) {
    return new Response(
      JSON.stringify({ error: "Proposta não encontrada" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (proposal.status !== "approved") {
    return new Response(
      JSON.stringify({ error: "A proposta precisa estar aprovada para assinar" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Se não há signedContent mas há contract_file_url, criar um resumo básico
  let finalSignedContent = signedContent;
  if (!finalSignedContent && proposal.contract_file_url) {
    const fileName = proposal.contract_file_url.split('/').pop() || 'contrato.pdf';
    finalSignedContent = `Contrato assinado referente ao arquivo: ${fileName}\n\nDados do cliente:\n${JSON.stringify(clientData, null, 2)}`;
  }
  
  if (!finalSignedContent || finalSignedContent.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: "Conteúdo do contrato assinado é obrigatório" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validar tamanho da assinatura (máximo 1MB)
  const base64Data = signatureBase64.includes(",") ? signatureBase64.split(",")[1] : signatureBase64;
  const signatureSize = (base64Data.length * 3) / 4; // Aproximação do tamanho em bytes
  
  if (signatureSize > 1024 * 1024) {
    return new Response(
      JSON.stringify({ error: "Assinatura muito grande. Tamanho máximo: 1MB" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Validar formato base64
  try {
    atob(base64Data);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Formato de assinatura inválido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Upload signature image to storage
  const signatureFileName = `${proposal.profile_id}/signatures/${proposal.id}_${Date.now()}.png`;
  const signatureBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

  const { error: uploadError } = await supabase.storage
    .from("proposal-files")
    .upload(signatureFileName, signatureBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading signature:", uploadError);
    // Mensagem de erro mais específica
    const errorMsg = uploadError.message?.includes("duplicate") 
      ? "Erro: Assinatura já existe. Tente novamente."
      : "Erro ao salvar assinatura. Verifique as permissões do storage.";
    return new Response(
      JSON.stringify({ error: errorMsg, details: uploadError.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get signature URL
  const { data: urlData } = supabase.storage
    .from("proposal-files")
    .getPublicUrl(signatureFileName);

  if (!urlData?.publicUrl) {
    console.error("Error getting signature URL");
    return new Response(
      JSON.stringify({ error: "Erro ao obter URL da assinatura" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Create contract
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .insert({
      proposal_id: proposal.id,
      signed_content: finalSignedContent.trim(),
      client_data: clientData,
      signature_image_url: urlData.publicUrl,
      signature_image_path: signatureFileName,
      client_ip: clientIp,
      user_agent: userAgent,
      signed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (contractError) {
    console.error("Error creating contract:", contractError);
    // Mensagem de erro mais específica
    let errorMsg = "Erro ao criar contrato";
    if (contractError.code === "23505") {
      errorMsg = "Erro: Contrato já existe para esta proposta";
    } else if (contractError.code === "23503") {
      errorMsg = "Erro: Referência inválida (proposta não encontrada)";
    }
    return new Response(
      JSON.stringify({ error: errorMsg, details: contractError.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  if (!contract) {
    return new Response(
      JSON.stringify({ error: "Contrato criado mas nenhum dado retornado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Update proposal status
  const { error: updateError } = await supabase
    .from("proposals")
    .update({ status: "signed" })
    .eq("id", String(proposal.id));

  if (updateError) {
    console.error("Error updating proposal status:", updateError);
  }

  // Update lead status to "convertido" if linked
  if (proposal.lead_id) {
    const { error: leadUpdateError } = await supabase
      .from("leads")
      .update({ status: "convertido" })
      .eq("id", String(proposal.lead_id));

    if (leadUpdateError) {
      console.error("Error updating lead status:", leadUpdateError);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Contrato assinado com sucesso!",
      contract,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// =====================================================
// UPLOAD RECEIPT: Client uploads payment proof
// =====================================================
async function handleUploadReceipt(
  supabase: SupabaseClientAny,
  token: string,
  data: Record<string, unknown> | undefined
) {
  if (!data) {
    return new Response(
      JSON.stringify({ error: "Dados do comprovante são obrigatórios" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { fileBase64, fileName, notes } = data as {
    fileBase64: string;
    fileName: string;
    notes?: string;
  };

  if (!fileBase64 || !fileName) {
    return new Response(
      JSON.stringify({ error: "Arquivo do comprovante é obrigatório" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Fetch proposal
  const { data: proposal, error: fetchError } = await supabase
    .from("proposals")
    .select("id, status, profile_id")
    .eq("public_token", token)
    .maybeSingle();

  if (fetchError || !proposal) {
    return new Response(
      JSON.stringify({ error: "Proposta não encontrada" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (proposal.status !== "signed") {
    return new Response(
      JSON.stringify({ error: "O contrato precisa estar assinado para enviar comprovante" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Upload receipt file
  const receiptFileName = `${proposal.profile_id}/receipts/${proposal.id}_${Date.now()}_${fileName}`;
  const base64Data = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
  const fileBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

  const { error: uploadError } = await supabase.storage
    .from("proposal-files")
    .upload(receiptFileName, fileBuffer, {
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading receipt:", uploadError);
    return new Response(
      JSON.stringify({ error: "Erro ao salvar comprovante" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get receipt URL
  const { data: urlData } = supabase.storage
    .from("proposal-files")
    .getPublicUrl(receiptFileName);

  // Create receipt record
  const { data: receipt, error: receiptError } = await supabase
    .from("payment_receipts")
    .insert({
      proposal_id: proposal.id,
      file_url: urlData.publicUrl,
      file_path: receiptFileName,
      file_name: fileName,
      notes: notes || "",
      uploaded_by: "client",
    })
    .select()
    .single();

  if (receiptError) {
    console.error("Error creating receipt:", receiptError);
    return new Response(
      JSON.stringify({ error: "Erro ao registrar comprovante" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Update proposal status to paid
  const { error: updateError } = await supabase
    .from("proposals")
    .update({ status: "paid" })
    .eq("id", String(proposal.id));

  if (updateError) {
    console.error("Error updating proposal status:", updateError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Comprovante enviado com sucesso!",
      receipt,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
