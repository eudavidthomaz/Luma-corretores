import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  profileId: string;
  sessionId?: string; // Legacy, kept for compatibility
  browserFingerprint?: string; // NEW: Persistent browser ID
  instagramId?: string; // NEW: Instagram sender ID
  source?: 'site' | 'instagram' | 'whatsapp'; // NEW: Channel source
  conversationHistory?: Array<{ role: string; content: string }>;
  previousState?: {
    phase?: string;
    collected_data?: Record<string, unknown>;
    heat_level?: string;
  };
}

interface ParsedAIResponse {
  messages: string[];
  message?: string;
  conversation_state?: {
    phase?: string;
    collected_data?: Record<string, unknown>;
    heat_level?: string;
  };
  show_story?: string | null;
  lead_summary?: unknown;
}

interface CategoryFromDB {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  group: { name: string; slug: string }[] | null;
}

// Lead from DB with all fields
interface ExistingLead {
  id: string;
  name: string | null;
  whatsapp: string | null;
  email: string | null;
  service_type: string | null;
  event_date: string | null;
  heat_level: string | null;
  last_interaction_at: string | null;
  browser_fingerprint: string | null;
  instagram_id: string | null;
}

// Result of lead lookup
interface LeadLookupResult {
  lead: ExistingLead | null;
  isNew: boolean;
  matchedBy: 'instagram_id' | 'browser_fingerprint' | 'whatsapp' | 'email' | null;
  merged?: boolean;
}

// Helper to calculate lead data completeness
function calculateCompleteness(data: Record<string, unknown>): number {
  const fields = ['name', 'whatsapp', 'service_type', 'event_date', 'event_location'];
  const filled = fields.filter(f => data[f] && data[f] !== null && data[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}

// Find existing lead by channel identifiers (priority: instagram > browser > whatsapp > email)
// deno-lint-ignore no-explicit-any
async function findExistingLead(
  supabase: any,
  profileId: string,
  identifiers: {
    instagram_id?: string;
    browser_fingerprint?: string;
    whatsapp?: string;
    email?: string;
  }
): Promise<LeadLookupResult> {
  const { instagram_id, browser_fingerprint, whatsapp, email } = identifiers;
  
  // 1. Try instagram_id first (most reliable)
  if (instagram_id) {
    const { data } = await supabase
      .from("leads")
      .select("id, name, whatsapp, email, service_type, event_date, heat_level, last_interaction_at, browser_fingerprint, instagram_id")
      .eq("profile_id", profileId)
      .eq("instagram_id", instagram_id)
      .maybeSingle();
    
    if (data) {
      console.log("Lead found by instagram_id:", data.id);
      return { lead: data as ExistingLead, isNew: false, matchedBy: 'instagram_id' };
    }
  }
  
  // 2. Try browser_fingerprint
  if (browser_fingerprint) {
    const { data } = await supabase
      .from("leads")
      .select("id, name, whatsapp, email, service_type, event_date, heat_level, last_interaction_at, browser_fingerprint, instagram_id")
      .eq("profile_id", profileId)
      .eq("browser_fingerprint", browser_fingerprint)
      .maybeSingle();
    
    if (data) {
      console.log("Lead found by browser_fingerprint:", data.id);
      return { lead: data as ExistingLead, isNew: false, matchedBy: 'browser_fingerprint' };
    }
  }
  
  // 3. Try whatsapp (cross-channel merge opportunity!)
  if (whatsapp) {
    const { data } = await supabase
      .from("leads")
      .select("id, name, whatsapp, email, service_type, event_date, heat_level, last_interaction_at, browser_fingerprint, instagram_id")
      .eq("profile_id", profileId)
      .eq("whatsapp", whatsapp)
      .maybeSingle();
    
    if (data) {
      console.log("Lead found by whatsapp - potential merge:", data.id);
      // MERGE: Add new channel identifier to existing lead
      const updateData: Record<string, string> = {};
      if (instagram_id && !data.instagram_id) updateData.instagram_id = instagram_id;
      if (browser_fingerprint && !data.browser_fingerprint) updateData.browser_fingerprint = browser_fingerprint;
      
      if (Object.keys(updateData).length > 0) {
        await supabase.from("leads").update(updateData).eq("id", data.id);
        console.log("Merged identifiers into lead:", updateData);
      }
      
      return { lead: data as ExistingLead, isNew: false, matchedBy: 'whatsapp', merged: Object.keys(updateData).length > 0 };
    }
  }
  
  // 4. Try email (also merge opportunity)
  if (email) {
    const { data } = await supabase
      .from("leads")
      .select("id, name, whatsapp, email, service_type, event_date, heat_level, last_interaction_at, browser_fingerprint, instagram_id")
      .eq("profile_id", profileId)
      .eq("email", email)
      .maybeSingle();
    
    if (data) {
      console.log("Lead found by email - potential merge:", data.id);
      const updateData: Record<string, string> = {};
      if (instagram_id && !data.instagram_id) updateData.instagram_id = instagram_id;
      if (browser_fingerprint && !data.browser_fingerprint) updateData.browser_fingerprint = browser_fingerprint;
      
      if (Object.keys(updateData).length > 0) {
        await supabase.from("leads").update(updateData).eq("id", data.id);
        console.log("Merged identifiers into lead:", updateData);
      }
      
      return { lead: data as ExistingLead, isNew: false, matchedBy: 'email', merged: Object.keys(updateData).length > 0 };
    }
  }
  
  // No existing lead found
  return { lead: null, isNew: true, matchedBy: null };
}

// Format date for display
function formatLastInteraction(isoDate: string | null): string {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semana(s) atrás`;
  return `${Math.floor(diffDays / 30)} mês(es) atrás`;
}

// Map category strings to valid category IDs or slugs
function mapToValidCategory(
  category: string | undefined, 
  validCategories: CategoryFromDB[]
): { id: string | null; slug: string | null } {
  if (!category) return { id: null, slug: null };
  
  const normalized = category.toLowerCase().trim();
  
  // Common aliases
  const aliases: Record<string, string> = {
    'casamentos': 'casamento',
    'eventos': 'aniversario-adulto',
    'pré-wedding': 'pre-wedding',
    'prewedding': 'pre-wedding',
    'pre wedding': 'pre-wedding',
    'familia': 'familia-lifestyle',
    'corporativo': 'retrato-corporativo',
    'moda': 'moda-editorial',
    'evento': 'aniversario-adulto',
  };
  
  const targetSlug = aliases[normalized] || normalized;
  
  // Find category by slug or name
  const found = validCategories.find(
    cat => cat.slug === targetSlug || cat.name.toLowerCase() === normalized
  );
  
  if (found) {
    return { id: found.id, slug: found.slug };
  }
  
  return { id: null, slug: null };
}

// ============================================
// NAME VALIDATION: Blacklist & Sanitization
// ============================================

// BLACKLIST: Common greetings that should NEVER be saved as names
const GREETING_BLACKLIST = new Set([
  'oi', 'ola', 'olá', 'hello', 'hi', 'hey', 'bom dia', 'boa tarde', 
  'boa noite', 'e ai', 'eai', 'eae', 'opa', 'opaa', 'salve', 'fala',
  'ou', 'oii', 'oie', 'oiii', 'hii', 'helloo', 'olar', 'oiee',
  'ok', 'sim', 'não', 'nao', 'obrigado', 'obrigada', 'vlw', 'valeu',
  'blz', 'beleza', 'td bem', 'tudo bem', 'test', 'teste', 'ols',
  'bom', 'boa', 'tudo', 'nada', 'legal', 'massa', 'show', 'top',
  'opa', 'ei', 'ae', 'iae', 'eae', 'fala', 'salve', 'suave', 'de boa',
  'iae', 'eai', 'e ai', 'iai', 'oie', 'oiie', 'oii', 'oiii'
]);

// Validate if a string is a valid name (not a greeting or gibberish)
function isValidName(name: string | null | undefined): boolean {
  if (!name || typeof name !== 'string') return false;
  
  const normalized = name.toLowerCase().trim();
  
  // Reject if in blacklist
  if (GREETING_BLACKLIST.has(normalized)) {
    console.log(`Name rejected (blacklist): "${name}"`);
    return false;
  }
  
  // Reject if too short (less than 2 chars)
  if (normalized.length < 2) {
    console.log(`Name rejected (too short): "${name}"`);
    return false;
  }
  
  // Reject if it's just repeated characters (aaa, bbb)
  if (/^(.)\1+$/.test(normalized)) {
    console.log(`Name rejected (repeated chars): "${name}"`);
    return false;
  }
  
  // Reject if contains only consonants or only vowels
  const vowels = (normalized.match(/[aeiouáàâãéèêíïóôõöúç]/gi) || []).length;
  if (vowels === 0 || vowels === normalized.length) {
    console.log(`Name rejected (vowel check): "${name}"`);
    return false;
  }
  
  return true;
}

// Fix duplicated names like "MariaMaria" → "Maria"
function sanitizeName(name: string | null | undefined): string | null {
  if (!name || typeof name !== 'string') return null;
  
  const trimmed = name.trim();
  if (trimmed.length < 4) return trimmed;
  
  // Check if name is duplicated (MariaMaria, BiaBia, etc)
  const half = Math.floor(trimmed.length / 2);
  const firstHalf = trimmed.substring(0, half);
  const secondHalf = trimmed.substring(half);
  
  if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
    // Return first half with proper capitalization
    const fixed = firstHalf.charAt(0).toUpperCase() + firstHalf.slice(1).toLowerCase();
    console.log(`Name sanitized (duplicate): "${name}" → "${fixed}"`);
    return fixed;
  }
  
  return trimmed;
}

// ============================================
// CONTACT EXTRACTION: WhatsApp, Email, Instagram
// ============================================

// Extract contact info from message
function extractContactFromMessage(message: string): { whatsapp?: string; email?: string } {
  const result: { whatsapp?: string; email?: string } = {};
  
  // Phone patterns (Brazilian format)
  const phonePatterns = [
    /(\+?55\s?)?(\(?\d{2}\)?[\s-]?)(\d{4,5}[\s-]?\d{4})/g,
    /\d{2}\s?\d{4,5}[\s-]?\d{4}/g,
  ];
  
  for (const pattern of phonePatterns) {
    const match = message.match(pattern);
    if (match) {
      result.whatsapp = match[0].replace(/\D/g, '');
      break;
    }
  }
  
  // Email pattern
  const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0];
  }
  
  return result;
}

// Extract Instagram handle from message (@username)
function extractInstagramFromMessage(message: string): string | null {
  // Match @username patterns (Instagram usernames: 1-30 chars, letters, numbers, periods, underscores)
  const instagramPattern = /@([a-zA-Z0-9_.]{1,30})/g;
  const matches = message.match(instagramPattern);
  
  if (!matches || matches.length === 0) return null;
  
  // Get the first valid handle (remove the @)
  const handle = matches[0].substring(1).toLowerCase();
  
  // Filter out common false positives (email domains)
  const invalidHandles = new Set([
    'gmail', 'hotmail', 'outlook', 'yahoo', 'email', 'mail', 'icloud',
    'live', 'msn', 'aol', 'protonmail', 'zoho', 'uol', 'bol', 'terra'
  ]);
  if (invalidHandles.has(handle)) {
    console.log(`Instagram handle rejected (email domain): @${handle}`);
    return null;
  }
  
  // Must be at least 3 chars
  if (handle.length < 3) {
    console.log(`Instagram handle rejected (too short): @${handle}`);
    return null;
  }
  
  console.log(`Instagram handle detected: @${handle}`);
  return handle;
}

// Extract date from message (Brazilian formats: DD/MM/YYYY, DD-MM-YYYY, DD/MM, or "dia X de MÊS")
function extractDateFromMessage(message: string): string | null {
  // Months map for natural language
  const months: Record<string, string> = {
    janeiro: '01', fevereiro: '02', março: '03', marco: '03',
    abril: '04', maio: '05', junho: '06', julho: '07',
    agosto: '08', setembro: '09', outubro: '10', novembro: '11', dezembro: '12'
  };
  
  // Try natural language format first: "dia 10 de Janeiro"
  const extensoRegex = /(?:dia\s+)?(\d{1,2})\s+(?:de\s+)?(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+(?:de\s+)?(\d{4}))?/i;
  const extensoMatch = message.toLowerCase().match(extensoRegex);
  if (extensoMatch) {
    const [, day, month, year] = extensoMatch;
    const fullYear = year || new Date().getFullYear().toString();
    console.log(`Date detected (extenso): day=${day}, month=${month}, year=${fullYear}`);
    return `${fullYear}-${months[month]}-${day.padStart(2, '0')}`;
  }
  
  // Fallback to numeric format: DD/MM/YYYY or DD-MM-YYYY
  const dateRegex = /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/;
  const match = message.match(dateRegex);
  if (match) {
    const [, day, month, year] = match;
    const fullYear = year ? (year.length === 2 ? `20${year}` : year) : new Date().getFullYear().toString();
    console.log(`Date detected (numeric): day=${day}, month=${month}, year=${fullYear}`);
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return null;
}

// Check calendar availability via the check-availability function
async function checkCalendarAvailability(date: string, userId: string): Promise<{ available: boolean; calendar_connected: boolean; busy_slots?: Array<{ start: string; end: string }> }> {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return { available: true, calendar_connected: false };
    }
    
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/check-availability`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ date, user_id: userId }),
      }
    );
    
    if (!response.ok) {
      console.error("check-availability error:", response.status);
      return { available: true, calendar_connected: false };
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error checking availability:", error);
    return { available: true, calendar_connected: false };
  }
}

// Extract messages from partial/truncated JSON
function extractMessagesFromPartialJson(content: string): string[] | null {
  // Try to find "messages": [...] even in incomplete JSON
  const messagesMatch = content.match(/"messages"\s*:\s*\[\s*([\s\S]*?)\]/);
  if (messagesMatch) {
    try {
      const messagesArray = JSON.parse(`[${messagesMatch[1]}]`);
      if (Array.isArray(messagesArray) && messagesArray.length > 0) {
        return messagesArray.filter(m => typeof m === 'string' && m.length > 0);
      }
    } catch {}
  }
  
  // Fallback: Extract individual quoted strings from messages array
  const messagesArrayMatch = content.match(/"messages"\s*:\s*\[([\s\S]*?)(?:\]|$)/);
  if (messagesArrayMatch) {
    const messages: string[] = [];
    const quotedStrings = messagesArrayMatch[1].match(/"([^"\\]|\\.)*"/g);
    if (quotedStrings) {
      quotedStrings.forEach(str => {
        try {
          const parsed = JSON.parse(str);
          if (parsed && typeof parsed === 'string' && parsed.length > 0) {
            messages.push(parsed);
          }
        } catch {}
      });
    }
    if (messages.length > 0) return messages;
  }
  
  return null;
}

// Remove JSON (complete or truncated) from text
function removeJsonFromText(text: string): string {
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/\{[\s\S]*?(?:\}|$)/g, "") // Remove JSON with or without closing }
    .replace(/"[^"]*"\s*:/g, "")        // Remove JSON keys
    .replace(/[\[\]\{\}]/g, "")          // Remove stray brackets
    .replace(/\s+/g, " ")                // Normalize whitespace
    .trim();
}

// Check if a string looks like JSON content
function looksLikeJson(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return trimmed.startsWith('{') || 
         trimmed.startsWith('[') ||
         trimmed.includes('"messages"') ||
         trimmed.includes('"phase"') ||
         trimmed.includes('"conversation_state"') ||
         trimmed.includes('"collected_data"');
}

// ROBUST JSON EXTRACTOR - handles mixed content, embedded JSON, etc.
function extractJsonFromContent(content: string): ParsedAIResponse | null {
  if (!content || typeof content !== 'string') return null;
  
  const cleanedContent = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  
  // Try 1: Direct parse
  try {
    const parsed = JSON.parse(cleanedContent);
    if (parsed && typeof parsed === 'object' && (parsed.messages || parsed.message)) {
      return parsed as ParsedAIResponse;
    }
  } catch {}
  
  // Try 2: Find JSON object with "messages" key
  const jsonWithMessagesMatch = cleanedContent.match(/\{[\s\S]*"messages"\s*:\s*\[[\s\S]*?\][\s\S]*\}/);
  if (jsonWithMessagesMatch) {
    try {
      const parsed = JSON.parse(jsonWithMessagesMatch[0]);
      if (parsed.messages) return parsed as ParsedAIResponse;
    } catch {}
  }
  
  // Try 3: Find the LAST complete JSON object (most likely to be correct)
  let depth = 0;
  let startIndex = -1;
  let lastValidJson: ParsedAIResponse | null = null;
  
  for (let i = 0; i < cleanedContent.length; i++) {
    if (cleanedContent[i] === '{') {
      if (depth === 0) startIndex = i;
      depth++;
    } else if (cleanedContent[i] === '}') {
      depth--;
      if (depth === 0 && startIndex !== -1) {
        const jsonCandidate = cleanedContent.substring(startIndex, i + 1);
        try {
          const parsed = JSON.parse(jsonCandidate);
          if (parsed && typeof parsed === 'object' && (parsed.messages || parsed.message)) {
            lastValidJson = parsed as ParsedAIResponse;
          }
        } catch {}
        startIndex = -1;
      }
    }
  }
  
  if (lastValidJson) return lastValidJson;
  
  return null;
}

interface ChapterResult {
  id: string;
  order_index: number;
  narrative_text: string | null;
  media_url: string;
  media_type: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, profileId, sessionId, browserFingerprint, instagramId, source = 'site', conversationHistory = [], previousState } = await req.json() as ChatRequest;
    
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!GOOGLE_AI_API_KEY && !LOVABLE_API_KEY) throw new Error("No AI API key configured (GOOGLE_AI_API_KEY or LOVABLE_API_KEY)");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials not configured");
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // ==========================================
    // PLAN CHECK: Block free users from using Luma
    // ==========================================
    const { data: profilePlan } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", profileId)
      .single();
    
    const plansWithLumaAccess = ['trial', 'lite', 'pro', 'ultra', 'enterprise'];
    if (!profilePlan || !plansWithLumaAccess.includes(profilePlan.plan)) {
      console.log(`🚫 Luma Chat blocked for plan: ${profilePlan?.plan || 'unknown'}`);
      return new Response(
        JSON.stringify({ 
          error: "Luma Chat não disponível para este plano",
          code: "PLAN_NOT_ALLOWED" 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // ==========================================
    // CROSS-CHANNEL MEMORY: Find existing lead
    // ==========================================
    const extractedContact = extractContactFromMessage(message);
    
    const leadLookup = await findExistingLead(supabase, profileId, {
      instagram_id: instagramId,
      browser_fingerprint: browserFingerprint,
      whatsapp: extractedContact.whatsapp || (previousState?.collected_data?.whatsapp as string | undefined),
      email: extractedContact.email || (previousState?.collected_data?.email as string | undefined),
    });
    
    const existingLead = leadLookup.lead;
    const isReturningCustomer = !leadLookup.isNew && existingLead !== null;
    
    // Build returning customer context for personalized greetings
    let returningCustomerContext = "";
    if (isReturningCustomer && existingLead) {
      console.log(`🎯 Returning customer! Lead ID: ${existingLead.id}, matched by: ${leadLookup.matchedBy}, merged: ${leadLookup.merged || false}`);
      const lastInteraction = formatLastInteraction(existingLead.last_interaction_at);
      const customerName = existingLead.name || null;
      
      returningCustomerContext = `
## 🎯 CLIENTE RETORNANDO - MEMÓRIA ATIVA
${customerName ? `Nome: ${customerName}` : 'Nome: ainda não informado'}
Última conversa: ${lastInteraction}
Interesse: ${existingLead.service_type || 'não identificado'}
${existingLead.event_date ? `Data do evento: ${existingLead.event_date}` : ''}
Heat level anterior: ${existingLead.heat_level || 'cold'}

INSTRUÇÕES IMPORTANTES:
${customerName ? `- Cumprimente usando o nome: "${customerName}"` : '- NÃO temos o nome ainda, pergunte normalmente'}
- Faça referência ao contexto anterior se relevante
- NÃO pergunte informações que já temos
${existingLead.service_type ? `- Exemplo: "Oi${customerName ? ` ${customerName}` : ''}! Que bom te ver de novo. Da última vez conversamos sobre ${existingLead.service_type}."` : ''}
`;
    }
    
    // Fetch categories from database
    const { data: dbCategories } = await supabase
      .from("categories")
      .select("id, slug, name, color, group:category_groups(name, slug)")
      .eq("is_active", true)
      .order("order_index");
    
    const categories: CategoryFromDB[] = dbCategories || [];
    
    // Generate dynamic category labels
    const categoryLabels: Record<string, string> = {};
    for (const cat of categories) {
      categoryLabels[cat.slug] = cat.name;
      categoryLabels[cat.id] = cat.name;
    }
    
    // Group categories for the prompt
    const categoriesByGroup: Record<string, string[]> = {};
    for (const cat of categories) {
      const groupName = cat.group?.[0]?.name || "Outros";
      if (!categoriesByGroup[groupName]) {
        categoriesByGroup[groupName] = [];
      }
      categoriesByGroup[groupName].push(cat.name);
    }
    
    const categoriesForPrompt = Object.entries(categoriesByGroup)
      .map(([group, cats]) => `${group}: ${cats.join(", ")}`)
      .join("\n");
    
    // Fetch profile info
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, niche, bio, ai_context, whatsapp_number, pricing_packages")
      .eq("id", profileId)
      .single();
    
    const studioName = profile?.business_name || "Estúdio";
    const studioNiche = profile?.niche || "Fotografia";
    const aiContext = profile?.ai_context || "";
    const whatsappNumber = profile?.whatsapp_number || "";
    const pricingPackages = profile?.pricing_packages as { packages: Array<{ name: string; price: string; description: string; services: string[] }>; allow_luma_share: boolean } | null;
    
    // Build pricing context
    let pricingInfo = "NENHUM PREÇO CONFIGURADO - Você NÃO pode mencionar valores.";
    if (pricingPackages?.allow_luma_share && pricingPackages.packages.length > 0) {
      pricingInfo = pricingPackages.packages.map(pkg => 
        `${pkg.name}: ${pkg.price} - ${pkg.description}`
      ).join("\n");
    }
    
    // Fetch available stories with category info
    const { data: availableStories } = await supabase
      .from("stories")
      .select("id, title, category, category_id")
      .eq("profile_id", profileId)
      .eq("is_published", true)
      .limit(10);
    
    const storiesList = availableStories?.map((s: { id: string; title: string; category: string; category_id: string | null }) => {
      // Prefer category_id label, fallback to legacy enum
      const catLabel = s.category_id ? categoryLabels[s.category_id] : categoryLabels[s.category] || s.category;
      return `"${s.title}" (${catLabel}) ID:${s.id}`;
    }).join(", ") || "Nenhuma história cadastrada.";
    
    // NOTE: extractedContact already defined above (line 457) for cross-channel lookup
    
    // Extract date from message and check availability
    const detectedDate = extractDateFromMessage(message);
    let availabilityContext = "";
    
    if (detectedDate) {
      console.log("Date detected in message:", detectedDate);
      const availability = await checkCalendarAvailability(detectedDate, profileId);
      
      if (availability.calendar_connected) {
        if (availability.available) {
          availabilityContext = `\n## DISPONIBILIDADE VERIFICADA\nData ${detectedDate}: DISPONÍVEL ✓\nVocê pode confirmar que esta data está livre!`;
        } else {
          availabilityContext = `\n## DISPONIBILIDADE VERIFICADA\nData ${detectedDate}: OCUPADA ✗\nSugira datas alternativas próximas.`;
        }
        console.log("Availability context:", availabilityContext);
      } else {
        console.log("Calendar not connected, skipping availability check");
      }
    }
    
    // Merge previous state with any newly extracted data
    const previousCollectedData = previousState?.collected_data || {};
    const shownStories = (previousCollectedData.shown_stories as unknown as string[]) || [];
    const questionsAsked = (previousCollectedData.questions_asked as unknown as string[]) || [];
    
    const mergedCollectedData: Record<string, unknown> = {
      ...previousCollectedData,
      ...(extractedContact.whatsapp ? { whatsapp: extractedContact.whatsapp } : {}),
      ...(extractedContact.email ? { email: extractedContact.email } : {}),
      ...(detectedDate ? { date: detectedDate } : {}),
      shown_stories: shownStories,
      questions_asked: questionsAsked,
    };

    // Filter stories not shown yet
    const availableStoriesNotShown = availableStories?.filter(
      (s: { id: string }) => !shownStories.includes(s.id)
    ) || [];
    
    const storiesListFiltered = availableStoriesNotShown.map((s: { id: string; title: string; category: string; category_id: string | null }) => {
      const catLabel = s.category_id ? categoryLabels[s.category_id] : categoryLabels[s.category] || s.category;
      return `"${s.title}" (${catLabel}) ID:${s.id}`;
    }).join(", ") || "Todas as histórias já foram mostradas.";

    // LUMA SYSTEM PROMPT v5.2 - WITH CROSS-CHANNEL MEMORY
    const systemPrompt = `Você é LUMA, assistente virtual do ${studioName} (${studioNiche}).

RETORNE APENAS JSON VÁLIDO. NENHUM TEXTO ANTES OU DEPOIS DO JSON.
${returningCustomerContext}
## ESTADO ATUAL DA CONVERSA
Fase: ${previousState?.phase || 'abertura'}
Dados coletados: ${JSON.stringify(mergedCollectedData)}
Heat: ${previousState?.heat_level || 'cold'}
Histórias já mostradas: ${shownStories.length > 0 ? shownStories.join(', ') : 'Nenhuma'}
Perguntas já feitas: ${questionsAsked.length > 0 ? questionsAsked.join(', ') : 'Nenhuma'}

## CATEGORIAS DISPONÍVEIS (para identificar o interesse do cliente)
${categoriesForPrompt}

## HISTÓRIAS DISPONÍVEIS (NÃO REPITA as já mostradas)
${storiesListFiltered}

## PREÇOS (só mencione se configurado)
${pricingInfo}

## INSTRUÇÕES DO FOTÓGRAFO
${aiContext || "Sem instruções específicas."}
${availabilityContext}

## NATURALIDADE NA CONVERSA (CRÍTICO!)

1. VARIE suas expressões - PROIBIDO usar sempre "Excelente!", "Com certeza!", "Perfeito!", "Maravilha!"
2. Para respostas curtas do cliente ("ok", "sim", "legal", "ah", "hm"):
   - CONTINUE o fluxo naturalmente SEM adjetivos exagerados
   - Ex: cliente diz "ok" → você responde "Me conta, qual a data do evento?" (direto, sem "Ótimo!")
3. Use o nome do cliente de forma ESPORÁDICA, não em toda frase (máximo 1x a cada 3 mensagens)
4. Evite emojis em excesso (máximo 1 por mensagem, ou nenhum)
5. Tom: profissional e simpático, como uma atendente real experiente
6. NÃO comece frases com "Que" (ex: "Que lindo!", "Que maravilha!") - muito artificial

## ANTI-INSISTÊNCIA (CRÍTICO!)

1. Se você já perguntou algo 2x e o cliente não respondeu diretamente → MUDE de assunto
2. Se o cliente recusar dar WhatsApp: "Sem problemas! Posso ajudar de outra forma?"
3. NÃO repita a mesma pergunta com palavras diferentes
4. Se o cliente está evitando uma resposta, PROSSIGA sem ela
5. Verifique "Perguntas já feitas" acima antes de perguntar algo

## REGRAS FUNDAMENTAIS

1. PRIMEIRA MENSAGEM = PERGUNTAR NOME
   Se não sabe o nome do cliente, sua PRIMEIRA resposta deve perguntar: "Qual seu nome?"

2. NUNCA REPITA PERGUNTAS
   Verifique o histórico e os dados coletados. Se já sabe o nome, USE-O. Se já sabe o serviço, NÃO pergunte de novo.

3. HISTÓRIAS/PORTFÓLIO = SOMENTE COM PERMISSÃO
   - NUNCA sugira ver portfólio automaticamente
   - PERGUNTE se o cliente quer ver
   - Se aceitar, retorne "show_story": "ID_DA_HISTORIA" (escolha uma que NÃO está em "Histórias já mostradas")
   - APENAS 1 história por vez

4. COLETA DE CONTATO = VIA CONVERSA
   - Quando lead estiver quente, pergunte: "Posso pegar seu WhatsApp para enviar o orçamento?"
   - NUNCA mencione formulários externos

5. FLUXO OBRIGATÓRIO
   Nome → Serviço → Data → Local → (Portfólio se pedir) → Contato → Handoff

6. TODA RESPOSTA TERMINA COM PERGUNTA
   Sempre termine com "?" ou opção A/B para avançar a conversa.

7. PREÇOS
   - SÓ mencione se estiver na seção PREÇOS acima
   - Se não configurado: "Os valores variam por projeto. Me conta os detalhes que consigo um orçamento?"

8. DISPONIBILIDADE NA AGENDA
   - Se a seção DISPONIBILIDADE VERIFICADA aparecer, USE essa informação
   - Se DISPONÍVEL: confirme "Verifiquei a agenda e [data] está disponível!"
   - Se OCUPADA: diga "Infelizmente [data] já está reservada. Que tal verificarmos outras datas próximas?"

9. CAPTURA DO INSTAGRAM (ABORDAGEM "STALKER DO BEM")
   - Só peça o @ quando heat_level for "warm" ou "hot"
   - Frases naturais sugeridas:
     * "Posso te seguir no Insta? Qual seu @?"
     * "Me passa seu @ que te mando umas referências!"
     * "Prefere WhatsApp ou Instagram pra continuar a conversa?"
   - Se o cliente mencionar um @ na conversa, você NÃO precisa extrair - o sistema faz isso automaticamente
   - NUNCA insista se o cliente não quiser compartilhar
   - Salve em collected_data.instagram_id quando obtiver

## FORMATO DE RESPOSTA (JSON PURO)

{
  "messages": ["Mensagem 1", "Mensagem 2 com pergunta?"],
  "conversation_state": {
    "phase": "abertura|descoberta|qualificacao|proposta|fechamento|handoff",
    "collected_data": {
      "name": "nome ou null",
      "service_type": "tipo ou null",
      "date": "data ou null",
      "location": "local ou null",
      "whatsapp": "telefone ou null",
      "email": "email ou null",
      "shown_stories": ["id1", "id2"],
      "questions_asked": ["nome", "servico", "data"]
    },
    "heat_level": "cold|warm|hot"
  },
  "show_story": null,
  "lead_summary": null
}

IMPORTANTE:
- "messages" é array de 1-3 strings curtas
- "show_story" = null (padrão) ou ID de UMA história quando cliente aceitar ver
- Mantenha collected_data atualizado com TODOS os dados que já sabe
- Atualize "shown_stories" quando mostrar uma história
- Atualize "questions_asked" quando fizer uma pergunta importante
- A última mensagem DEVE ter "?" no final

WhatsApp do estúdio: ${whatsappNumber || "não configurado"}`;

    // AI Messages for API call
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-16),
      { role: "user", content: message }
    ];

    // Helper function to call Google AI Studio
    async function callGoogleAI(messages: Array<{role: string; content: string}>, apiKey: string) {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google AI error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    }

    // Helper function to call Lovable AI (fallback)
    async function callLovableAI(messages: Array<{role: string; content: string}>, apiKey: string) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    }

    // Try Google AI first, fallback to Lovable AI
    let aiData;
    let usedProvider = "google";

    if (GOOGLE_AI_API_KEY) {
      try {
        console.log("Tentando Google AI Studio...");
        aiData = await callGoogleAI(aiMessages, GOOGLE_AI_API_KEY);
        console.log("Google AI respondeu com sucesso");
      } catch (googleError) {
        console.error("Google AI falhou:", googleError instanceof Error ? googleError.message : googleError);
        usedProvider = "lovable_fallback";
      }
    }

    // Fallback to Lovable AI if Google failed or not configured
    if (!aiData && LOVABLE_API_KEY) {
      try {
        console.log("Usando Lovable AI como fallback...");
        aiData = await callLovableAI(aiMessages, LOVABLE_API_KEY);
        console.log("Lovable AI respondeu com sucesso");
        usedProvider = "lovable_fallback";
      } catch (lovableError) {
        console.error("Lovable AI também falhou:", lovableError instanceof Error ? lovableError.message : lovableError);
        
        // Return rate limit error if both failed
        return new Response(JSON.stringify({ 
          messages: ["Estou um pouco ocupada agora. Pode tentar novamente em alguns segundos?"],
          error: "Both AI providers failed" 
        }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!aiData) {
      throw new Error("Nenhum provedor de IA disponível");
    }

    console.log(`Provider usado: ${usedProvider}`);
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    console.log(`Response length: ${rawContent.length} chars, provider: ${usedProvider}`);
    
    // Check for truncation
    const finishReason = aiData.choices?.[0]?.finish_reason;
    if (finishReason === 'length' || finishReason === 'MAX_TOKENS') {
      console.warn(`⚠️ Response truncated! finish_reason: ${finishReason}`);
    }
    
    console.log("Raw AI response:", rawContent.substring(0, 500));
    
    // ROBUST JSON PARSING
    let parsedResponse: ParsedAIResponse | null = extractJsonFromContent(rawContent);
    
    // If parsing failed, try partial extraction then clean fallback
    if (!parsedResponse || !parsedResponse.messages || parsedResponse.messages.length === 0) {
      console.log("JSON parse failed, attempting partial extraction...");
      
      // STEP 1: Try to extract messages from partial/truncated JSON
      const partialMessages = extractMessagesFromPartialJson(rawContent);
      
      if (partialMessages && partialMessages.length > 0) {
        console.log(`Extracted ${partialMessages.length} messages from partial JSON`);
        parsedResponse = {
          messages: partialMessages,
          conversation_state: {
            phase: previousState?.phase || "qualificacao",
            collected_data: mergedCollectedData,
            heat_level: previousState?.heat_level || "warm"
          },
          show_story: null,
          lead_summary: null
        };
      } else {
        // STEP 2: Try to extract clean text without JSON
        const cleanedText = removeJsonFromText(rawContent);
        
        if (cleanedText && cleanedText.length >= 10 && !looksLikeJson(cleanedText)) {
          console.log("Using cleaned text as fallback");
          parsedResponse = {
            messages: [cleanedText],
            conversation_state: {
              phase: previousState?.phase || "abertura",
              collected_data: mergedCollectedData,
              heat_level: previousState?.heat_level || "cold"
            },
            show_story: null,
            lead_summary: null
          };
        } else {
          // STEP 3: Use completely clean fallback - NEVER return JSON
          console.log("Using clean fallback message");
          const name = mergedCollectedData.name;
          const fallbackMessage = name 
            ? `${name}, tive um pequeno lapso! O que você estava me contando?`
            : "Desculpa, tive um lapso! Pode repetir?";
          
          parsedResponse = {
            messages: [fallbackMessage],
            conversation_state: {
              phase: previousState?.phase || "abertura",
              collected_data: mergedCollectedData,
              heat_level: previousState?.heat_level || "cold"
            },
            show_story: null,
            lead_summary: null
          };
        }
      }
    }

    // Ensure messages is an array
    if (parsedResponse?.message && !parsedResponse?.messages) {
      parsedResponse.messages = [parsedResponse.message];
    }
    if (!parsedResponse || !Array.isArray(parsedResponse.messages) || parsedResponse.messages.length === 0) {
      if (!parsedResponse) {
        parsedResponse = { messages: ["Olá! Sou a Luma ✨ Qual seu nome?"] };
      } else {
        parsedResponse.messages = ["Olá! Sou a Luma ✨ Qual seu nome?"];
      }
    }
    
    // RIGOROUS ANTI-LEAKAGE FILTER - NEVER return JSON to user
    parsedResponse.messages = parsedResponse.messages.map((msg: string) => {
      if (typeof msg !== 'string') return null;
      
      // If the message looks like JSON, discard it completely
      if (looksLikeJson(msg)) {
        console.warn("Discarding JSON-like message:", msg.substring(0, 100));
        return null;
      }
      
      // Remove any remaining JSON fragments
      const cleaned = removeJsonFromText(msg);
      return cleaned.length > 0 ? cleaned : null;
    }).filter((msg): msg is string => msg !== null && msg.length > 0);
    
    // Final safety net - ensure we always have a clean message
    if (parsedResponse.messages.length === 0) {
      const name = mergedCollectedData.name;
      parsedResponse.messages = [
        name ? `${name}, tive um lapso! Pode repetir?` : "Tive um lapso! Pode repetir?"
      ];
    }

    // Merge collected data properly
    const currentCollectedData: Record<string, unknown> = {
      ...mergedCollectedData,
      ...(parsedResponse?.conversation_state?.collected_data || {})
    };
    
    // ============================================
    // NAME EXTRACTION WITH VALIDATION
    // ============================================
    const aiDetectedName = parsedResponse?.conversation_state?.collected_data?.name as string | undefined;
    
    // VALIDATE and SANITIZE any AI-detected name
    if (aiDetectedName) {
      const sanitized = sanitizeName(aiDetectedName);
      if (isValidName(sanitized)) {
        currentCollectedData.name = sanitized;
        console.log(`AI-detected name accepted: "${sanitized}"`);
      } else {
        console.warn(`Rejected invalid name from AI: "${aiDetectedName}"`);
        // Don't set name - Luma will ask again
      }
    } else if (!currentCollectedData.name) {
      // Fallback: try regex detection from explicit patterns ONLY
      // REMOVED: Single word pattern that captured greetings like "Oi", "Olá"
      const namePatterns = [
        /(?:meu nome é|me chamo|sou o|sou a|pode me chamar de)\s+([A-Za-záàâãéèêíïóôõöúç]+)/i,
        /(?:é|sou)\s+([A-Z][a-záàâãéèêíïóôõöúç]+)\s*[,!.?]/i, // "É Maria!" or "Sou João."
      ];
      
      for (const pattern of namePatterns) {
        const match = message.match(pattern);
        if (match) {
          const candidate = sanitizeName(match[1]);
          if (isValidName(candidate)) {
            currentCollectedData.name = candidate;
            console.log(`Regex-detected name accepted: "${candidate}"`);
            break;
          }
        }
      }
    }
    
    // ============================================
    // INSTAGRAM EXTRACTION FROM MESSAGE
    // ============================================
    const detectedInstagram = extractInstagramFromMessage(message);
    if (detectedInstagram && !currentCollectedData.instagram_id) {
      currentCollectedData.instagram_id = detectedInstagram;
      console.log(`Instagram saved to collected_data: @${detectedInstagram}`);
    }

    // Handle story display
    let currentStory = null;
    let currentChapters: ChapterResult[] = [];
    
    if (parsedResponse.show_story && typeof parsedResponse.show_story === 'string' && parsedResponse.show_story !== 'null') {
      const storyId = parsedResponse.show_story;
      
      // Fetch story and chapters
      const { data: story } = await supabase
        .from("stories")
        .select("id, title, category")
        .eq("id", storyId)
        .eq("profile_id", profileId)
        .eq("is_published", true)
        .single();
      
      if (story) {
        const { data: chapters } = await supabase
          .from("story_chapters")
          .select("id, order_index, narrative_text, media_url, media_type")
          .eq("story_id", storyId)
          .order("order_index", { ascending: true });
        
        if (chapters && chapters.length > 0) {
          currentStory = story;
          currentChapters = chapters;
          console.log("Story loaded:", story.title, "with", chapters.length, "chapters");
        }
      }
    }

    // Determine heat level and phase
    const heatLevel = parsedResponse.conversation_state?.heat_level || previousState?.heat_level || "cold";
    const phase = parsedResponse.conversation_state?.phase || previousState?.phase || "abertura";

    // Try to map service_type to a category
    let interestCategoryId: string | null = null;
    if (currentCollectedData.service_type && typeof currentCollectedData.service_type === 'string') {
      const mapped = mapToValidCategory(currentCollectedData.service_type, categories);
      interestCategoryId = mapped.id;
    }

    // Progressive lead creation/update
    let leadCreated = false;
    let leadUpdated = false;
    
    // Use cross-channel memory: prefer existing lead found via findExistingLead
    const leadToUpdate = existingLead || null;
    
    if (sessionId || browserFingerprint || instagramId) {
      try {
        const hasMinimalData = currentCollectedData.service_type || 
                               currentCollectedData.name || 
                               currentCollectedData.whatsapp;
        
        if (hasMinimalData || leadToUpdate) {
          const leadData: Record<string, unknown> = {
            profile_id: profileId,
            session_id: sessionId || null,
            browser_fingerprint: browserFingerprint || null,
            // Instagram: prefer extracted from message, fallback to param
            instagram_id: (currentCollectedData.instagram_id as string) || instagramId || null,
            source: source || 'site',
            name: currentCollectedData.name || null,
            whatsapp: currentCollectedData.whatsapp || null,
            email: currentCollectedData.email || null,
            service_type: currentCollectedData.service_type || null,
            event_date: currentCollectedData.date || null,
            event_location: currentCollectedData.location || null,
            heat_level: heatLevel,
            conversation_phase: phase,
            last_interaction_at: new Date().toISOString(),
          };
          
          // Add category ID if we mapped it
          if (interestCategoryId) {
            leadData.interest_category_id = interestCategoryId;
          }
          
          leadData.data_completeness = calculateCompleteness(leadData);
          
          // Determine status
          if (heatLevel === 'hot' || phase === 'fechamento' || phase === 'handoff') {
            leadData.status = 'pronto';
          } else if (heatLevel === 'warm' || phase === 'qualificacao' || phase === 'proposta') {
            leadData.status = 'engajado';
          } else if (phase === 'descoberta') {
            leadData.status = 'qualificando';
          } else {
            leadData.status = 'novo';
          }
          
          if (leadToUpdate) {
            // Update existing lead found via cross-channel memory
            const updateFields: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(leadData)) {
              if (value !== null && key !== 'profile_id') {
                updateFields[key] = value;
              }
            }
            
            const { error: updateError } = await supabase
              .from("leads")
              .update(updateFields)
              .eq("id", leadToUpdate.id);
            
            if (!updateError) {
              leadUpdated = true;
              console.log("Lead updated (cross-channel):", leadToUpdate.id);
            } else {
              console.error("Error updating lead:", updateError);
            }
          } else {
            // Check if lead exists by session_id (fallback)
            const { data: sessionLead } = await supabase
              .from("leads")
              .select("id")
              .eq("session_id", sessionId)
              .eq("profile_id", profileId)
              .maybeSingle();
            
            if (sessionLead) {
              const updateFields: Record<string, unknown> = {};
              for (const [key, value] of Object.entries(leadData)) {
                if (value !== null && key !== 'profile_id' && key !== 'session_id') {
                  updateFields[key] = value;
                }
              }
              
              const { error: updateError } = await supabase
                .from("leads")
                .update(updateFields)
                .eq("id", sessionLead.id);
              
              if (!updateError) {
                leadUpdated = true;
                console.log("Lead updated (session):", sessionLead.id);
              } else {
                console.error("Error updating lead:", updateError);
              }
            } else if (hasMinimalData) {
              const { error: insertError, data: newLead } = await supabase
                .from("leads")
                .insert(leadData)
                .select("id")
                .single();
              
              if (!insertError && newLead) {
                leadCreated = true;
                console.log("Lead created:", newLead.id);
                
                console.log("New lead created successfully");
              } else if (insertError) {
                console.error("Error creating lead:", insertError);
              }
            }
          }
        }
      } catch (leadError) {
        console.error("Error in lead processing:", leadError);
      }
    }

    // Save conversation messages with lead_id for unified history
    const currentLeadId = existingLead?.id || null;
    
    if (sessionId && profileId) {
      try {
        await supabase.from("conversation_messages").insert({
          session_id: sessionId,
          profile_id: profileId,
          lead_id: currentLeadId,
          role: "user",
          content: message,
        });
        
        const assistantContent = parsedResponse.messages.join("\n\n");
        if (assistantContent) {
          await supabase.from("conversation_messages").insert({
            session_id: sessionId,
            profile_id: profileId,
            lead_id: currentLeadId,
            role: "assistant",
            content: assistantContent,
          });
        }
      } catch (msgError) {
        console.error("Error saving messages:", msgError);
      }
    }

    const responsePayload = {
      messages: parsedResponse.messages,
      message: parsedResponse.messages.join(" "),
      conversation_state: {
        phase,
        collected_data: currentCollectedData,
        heat_level: heatLevel
      },
      current_story: currentStory,
      current_chapters: currentChapters,
      show_story_id: currentStory?.id || null,
      heat_level: heatLevel,
      phase: phase,
      lead_created: leadCreated,
      lead_updated: leadUpdated,
    };

    console.log("Response:", JSON.stringify({ 
      messages: responsePayload.messages,
      phase,
      heat_level: heatLevel,
      show_story_id: responsePayload.show_story_id,
      lead_created: leadCreated,
      lead_updated: leadUpdated
    }));

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in chat-luma:", error);
    return new Response(JSON.stringify({ 
      messages: ["Desculpe, tive um problema técnico. Pode tentar novamente? 🙏"],
      message: "Desculpe, tive um problema técnico. Pode tentar novamente? 🙏",
      conversation_state: {
        phase: "abertura",
        collected_data: {},
        heat_level: "cold"
      },
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
