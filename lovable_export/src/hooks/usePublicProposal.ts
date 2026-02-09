import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProposalProfile {
  id: string;
  business_name: string;
  avatar_url: string | null;
  minisite_avatar_url: string | null;
  whatsapp_number: string | null;
}

interface ProposalItem {
  id: string;
  name?: string;
  description: string;
  details?: string;
  quantity: number;
  unit_price: number;
  show_price?: boolean;
  order_index: number;
  category?: string | null;
}

export interface PaymentConfigData {
  payment_type: string | null;
  pix_key: string | null;
  pix_key_type: string | null;
  pix_holder_name: string | null;
  bank_name: string | null;
  bank_agency: string | null;
  bank_account: string | null;
  account_holder: string | null;
  account_document: string | null;
  payment_link_url: string | null;
  additional_instructions: string | null;
}

export interface PublicProposal {
  id: string;
  title: string;
  client_name: string | null;
  client_email: string | null;
  status: string;
  valid_until: string | null;
  total_amount: number;
  discount_amount: number;
  contract_content: string | null;
  contract_file_url: string | null;
  required_fields: string[];
  payment_info: string | null;
  payment_config: PaymentConfigData | null;
  use_manual_total: boolean;
  created_at: string;
  profile: ProposalProfile;
  items: ProposalItem[];
  is_expired: boolean;
  // Video-specific fields
  proposal_type?: string;
  cover_video_url?: string | null;
  revision_limit?: number;
  delivery_formats?: string[];
  estimated_duration_min?: number | null;
  project_format?: string | null;
  reference_links?: Array<{ url: string; title: string; description?: string }>;
  soundtrack_links?: Array<{ url: string; title: string; artist?: string }>;
}

interface ApiResponse {
  proposal: {
    id: string;
    title: string;
    client_name: string | null;
    client_email: string | null;
    status: string;
    valid_until: string | null;
    total_amount: number;
    discount_amount: number;
    contract_content: string | null;
    contract_file_url: string | null;
    required_fields: string[];
    payment_info: string | null;
    payment_config_id: string | null;
    use_manual_total: boolean;
    created_at: string;
    // Video-specific fields
    proposal_type?: string;
    cover_video_url?: string | null;
    revision_limit?: number;
    delivery_formats?: string[];
    estimated_duration_min?: number | null;
    project_format?: string | null;
    reference_links?: Array<{ url: string; title: string; description?: string }>;
    soundtrack_links?: Array<{ url: string; title: string; artist?: string }>;
  };
  items: ProposalItem[];
  profile: ProposalProfile;
  contract: Contract | null;
  payment_config: PaymentConfigData | null;
}

export interface Contract {
  id: string;
  signed_content: string;
  client_data: Record<string, string>;
  signature_image_url: string | null;
  signed_at: string;
}

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proposal-public`;

export function usePublicProposal(token?: string) {
  return useQuery({
    queryKey: ["public-proposal", token],
    queryFn: async () => {
      if (!token) return null;
      
      const response = await fetch(`${FUNCTION_URL}?token=${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Proposta não encontrada");
      }
      
      // Transformar resposta aninhada para estrutura plana
      const data: ApiResponse = await response.json();
      
      // Achatar estrutura para match com interface PublicProposal
      const proposal: PublicProposal = {
        ...data.proposal,
        profile: data.profile,
        items: data.items || [],
        payment_config: data.payment_config || null,
        use_manual_total: data.proposal.use_manual_total || false,
        is_expired: false,
        // Video-specific fields (explícitos para garantir propagação)
        proposal_type: data.proposal.proposal_type || 'photo',
        cover_video_url: data.proposal.cover_video_url || null,
        revision_limit: data.proposal.revision_limit || 3,
        delivery_formats: data.proposal.delivery_formats || [],
        estimated_duration_min: data.proposal.estimated_duration_min || null,
        project_format: data.proposal.project_format || null,
        reference_links: data.proposal.reference_links || [],
        soundtrack_links: data.proposal.soundtrack_links || [],
      };
      
      return proposal;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useMarkProposalViewed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch(`${FUNCTION_URL}?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: "view" }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao marcar como visualizada");
      }
      
      return response.json();
    },
    onSuccess: (_, token) => {
      queryClient.invalidateQueries({ queryKey: ["public-proposal", token] });
    },
  });
}

export function useApproveProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch(`${FUNCTION_URL}?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: "approve" }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao aprovar proposta");
      }
      
      return response.json();
    },
    onSuccess: (_, token) => {
      queryClient.invalidateQueries({ queryKey: ["public-proposal", token] });
    },
  });
}

export function useRequestChanges() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ token, notes }: { token: string; notes: string }) => {
      const response = await fetch(`${FUNCTION_URL}?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: "request_changes", data: { notes } }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao solicitar alteração");
      }
      
      return response.json();
    },
    onSuccess: (_, { token }) => {
      queryClient.invalidateQueries({ queryKey: ["public-proposal", token] });
    },
  });
}

export interface SignProposalData {
  token: string;
  clientData: Record<string, string>;
  signedContent: string;
  signatureBase64: string;
}

export function useSignProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ token, clientData, signedContent, signatureBase64 }: SignProposalData) => {
      const response = await fetch(`${FUNCTION_URL}?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: "sign",
          data: {
            clientData,
            signedContent,
            signatureBase64,
          },
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao assinar contrato");
      }
      
      return response.json() as Promise<{ success: boolean; contract: Contract }>;
    },
    onSuccess: (_, { token }) => {
      queryClient.invalidateQueries({ queryKey: ["public-proposal", token] });
    },
  });
}

export function useUploadReceipt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ token, fileBase64, fileName, notes }: { 
      token: string; 
      fileBase64: string; 
      fileName: string;
      notes?: string;
    }) => {
      const response = await fetch(`${FUNCTION_URL}?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: "upload_receipt",
          data: {
            fileBase64,
            fileName,
            notes,
          },
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao enviar comprovante");
      }
      
      return response.json();
    },
    onSuccess: (_, { token }) => {
      queryClient.invalidateQueries({ queryKey: ["public-proposal", token] });
    },
  });
}
