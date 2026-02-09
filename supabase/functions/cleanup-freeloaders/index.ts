import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLEANUP-FREELOADERS] ${step}${detailsStr}`);
};

interface TargetUser {
  id: string;
  plan: string;
  business_name: string;
}

interface Gallery {
  id: string;
}

interface Story {
  id: string;
}

interface GalleryPhoto {
  file_path: string;
}

interface StoryChapter {
  media_url: string;
}

interface CarouselPhoto {
  file_url: string;
  thumbnail_url: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started - CLEANUP FREELOADERS");

    // Verificar autorização (apenas admin pode executar)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verificar se o usuário que está chamando é admin (opcional - adicione sua lógica)
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    logStep("Authorized user", { userId: user.id, email: user.email });

    // Planos que serão deletados
    const FREELOADER_PLANS = ['free', 'trial', 'pending', 'canceled'];

    // Buscar usuários a serem deletados (excluindo pagantes)
    const { data: targetUsers, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, plan, business_name")
      .in("plan", FREELOADER_PLANS);

    if (fetchError) {
      logStep("Error fetching target users", { error: fetchError.message });
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const users = targetUsers as TargetUser[] | null;
    logStep("Found freeloader users to delete", { count: users?.length || 0 });

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No freeloaders found to delete",
          deleted: 0,
          storageFreed: "0 MB"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const results = {
      usersDeleted: 0,
      galleriesDeleted: 0,
      storiesDeleted: 0,
      filesDeleted: 0,
      errors: [] as string[],
      deletedUsers: [] as { id: string; plan: string; businessName: string }[]
    };

    for (const targetUser of users) {
      logStep(`Processing user: ${targetUser.business_name}`, { 
        userId: targetUser.id, 
        plan: targetUser.plan 
      });

      try {
        // 1. Buscar galerias do usuário
        const { data: galleries } = await supabaseAdmin
          .from("galleries")
          .select("id")
          .eq("profile_id", targetUser.id);

        const galleryIds = (galleries as Gallery[] | null)?.map(g => g.id) || [];

        // 2. Deletar fotos do storage (gallery-photos)
        if (galleryIds.length > 0) {
          const { data: galleryPhotos } = await supabaseAdmin
            .from("gallery_photos")
            .select("file_path")
            .in("gallery_id", galleryIds);

          const photosList = galleryPhotos as GalleryPhoto[] | null;
          if (photosList && photosList.length > 0) {
            const filePaths = photosList.map(p => p.file_path);
            logStep(`Deleting ${filePaths.length} gallery photos from storage`, { userId: targetUser.id });

            const { error: storageError } = await supabaseAdmin
              .storage
              .from("gallery-photos")
              .remove(filePaths);

            if (storageError) {
              logStep("Error deleting gallery photos", { error: storageError.message });
            } else {
              results.filesDeleted += filePaths.length;
            }
          }
          results.galleriesDeleted += galleryIds.length;
        }

        // 3. Buscar stories do usuário
        const { data: stories } = await supabaseAdmin
          .from("stories")
          .select("id")
          .eq("profile_id", targetUser.id);

        const storyIds = (stories as Story[] | null)?.map(s => s.id) || [];

        // 4. Deletar media dos stories (portfolio-media)
        if (storyIds.length > 0) {
          const { data: chapters } = await supabaseAdmin
            .from("story_chapters")
            .select("media_url")
            .in("story_id", storyIds);

          const chaptersList = chapters as StoryChapter[] | null;
          if (chaptersList && chaptersList.length > 0) {
            const mediaPaths = chaptersList
              .map(c => {
                if (c.media_url.includes("/portfolio-media/")) {
                  return c.media_url.split("/portfolio-media/")[1];
                }
                return null;
              })
              .filter(Boolean) as string[];

            if (mediaPaths.length > 0) {
              logStep(`Deleting ${mediaPaths.length} story media from storage`, { userId: targetUser.id });

              const { error: storyStorageError } = await supabaseAdmin
                .storage
                .from("portfolio-media")
                .remove(mediaPaths);

              if (storyStorageError) {
                logStep("Error deleting story media", { error: storyStorageError.message });
              } else {
                results.filesDeleted += mediaPaths.length;
              }
            }
          }
          results.storiesDeleted += storyIds.length;
        }

        // 5. Deletar fotos do carrossel do minisite
        const { data: carouselPhotos } = await supabaseAdmin
          .from("minisite_carousel_photos")
          .select("file_url, thumbnail_url")
          .eq("profile_id", targetUser.id);

        const carouselList = carouselPhotos as CarouselPhoto[] | null;
        if (carouselList && carouselList.length > 0) {
          const carouselPaths = carouselList
            .flatMap(p => {
              const paths: string[] = [];
              if (p.file_url.includes("/portfolio-media/")) {
                paths.push(p.file_url.split("/portfolio-media/")[1]);
              }
              if (p.thumbnail_url.includes("/portfolio-media/")) {
                paths.push(p.thumbnail_url.split("/portfolio-media/")[1]);
              }
              return paths;
            })
            .filter(Boolean);

          if (carouselPaths.length > 0) {
            logStep(`Deleting ${carouselPaths.length} carousel photos from storage`, { userId: targetUser.id });

            await supabaseAdmin
              .storage
              .from("portfolio-media")
              .remove(carouselPaths);

            results.filesDeleted += carouselPaths.length;
          }
        }

        // 6. Deletar thumbnails de galerias
        const { data: thumbFiles } = await supabaseAdmin
          .storage
          .from("gallery-thumbnails")
          .list(targetUser.id);

        if (thumbFiles && thumbFiles.length > 0) {
          logStep(`Deleting ${thumbFiles.length} gallery thumbnails`, { userId: targetUser.id });

          await supabaseAdmin
            .storage
            .from("gallery-thumbnails")
            .remove(thumbFiles.map(f => `${targetUser.id}/${f.name}`));

          results.filesDeleted += thumbFiles.length;
        }

        // 7. DELETAR USUÁRIO DO AUTH (isso deve fazer cascade para todas as tabelas)
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
          targetUser.id
        );

        if (deleteAuthError) {
          logStep("Error deleting user from auth", { 
            userId: targetUser.id, 
            error: deleteAuthError.message 
          });
          results.errors.push(`Failed to delete user ${targetUser.id}: ${deleteAuthError.message}`);
        } else {
          results.usersDeleted++;
          results.deletedUsers.push({
            id: targetUser.id,
            plan: targetUser.plan,
            businessName: targetUser.business_name
          });
          logStep(`Successfully deleted user: ${targetUser.business_name}`, { 
            userId: targetUser.id,
            plan: targetUser.plan
          });
        }

      } catch (userError) {
        const errorMsg = userError instanceof Error ? userError.message : String(userError);
        logStep(`Error processing user ${targetUser.id}`, { error: errorMsg });
        results.errors.push(`Error processing ${targetUser.id}: ${errorMsg}`);
      }
    }

    logStep("Cleanup completed", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleanup completed. ${results.usersDeleted} users deleted.`,
        ...results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("FATAL ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
