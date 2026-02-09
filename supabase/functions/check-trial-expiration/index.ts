import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-TRIAL-EXPIRATION] ${step}${detailsStr}`);
};

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
  id: string;
  file_url: string;
  thumbnail_url: string;
  order_index: number;
}

interface ExpiredTrial {
  id: string;
  trial_ends_at: string;
  business_name: string;
}

// deno-lint-ignore no-explicit-any
async function cleanupUserData(supabaseClient: SupabaseClient<any>, userId: string) {
  logStep("Starting cleanup for user", { userId });

  try {
    // 1. Get all galleries for this user (to delete photos from storage later)
    const { data: galleries } = await supabaseClient
      .from("galleries")
      .select("id")
      .eq("profile_id", userId);

    const galleryIds = (galleries as Gallery[] | null)?.map(g => g.id) || [];
    logStep("Found galleries to delete", { count: galleryIds.length });

    // 2. Get all stories for this user (to delete chapters and storage)
    const { data: stories } = await supabaseClient
      .from("stories")
      .select("id")
      .eq("profile_id", userId);

    const storyIds = (stories as Story[] | null)?.map(s => s.id) || [];
    logStep("Found stories to delete", { count: storyIds.length });

    // 3. Delete gallery_favorites for user's galleries
    if (galleryIds.length > 0) {
      const { error: favError } = await supabaseClient
        .from("gallery_favorites")
        .delete()
        .in("gallery_id", galleryIds);
      if (favError) logStep("Error deleting gallery favorites", { error: favError.message });
    }

    // 4. Delete gallery_photos records
    if (galleryIds.length > 0) {
      const { data: galleryPhotos } = await supabaseClient
        .from("gallery_photos")
        .select("file_path")
        .in("gallery_id", galleryIds);

      // Delete from storage
      const photosList = galleryPhotos as GalleryPhoto[] | null;
      if (photosList && photosList.length > 0) {
        const filePaths = photosList.map(p => p.file_path);
        logStep("Deleting gallery photos from storage", { count: filePaths.length });
        
        const { error: storageError } = await supabaseClient
          .storage
          .from("gallery-photos")
          .remove(filePaths);
        if (storageError) logStep("Error deleting gallery photos from storage", { error: storageError.message });
      }

      // Delete records
      const { error: photosError } = await supabaseClient
        .from("gallery_photos")
        .delete()
        .in("gallery_id", galleryIds);
      if (photosError) logStep("Error deleting gallery_photos records", { error: photosError.message });
    }

    // 5. Delete galleries
    const { error: galleriesError } = await supabaseClient
      .from("galleries")
      .delete()
      .eq("profile_id", userId);
    if (galleriesError) logStep("Error deleting galleries", { error: galleriesError.message });

    // 6. Delete story_chapters and their media
    if (storyIds.length > 0) {
      const { data: chapters } = await supabaseClient
        .from("story_chapters")
        .select("media_url")
        .in("story_id", storyIds);

      // Delete media from storage (portfolio-media bucket)
      const chaptersList = chapters as StoryChapter[] | null;
      if (chaptersList && chaptersList.length > 0) {
        const mediaPaths = chaptersList
          .map(c => {
            // Extract path from URL if it's a full URL
            const url = c.media_url;
            if (url.includes("/portfolio-media/")) {
              return url.split("/portfolio-media/")[1];
            }
            return null;
          })
          .filter(Boolean) as string[];

        if (mediaPaths.length > 0) {
          logStep("Deleting story media from storage", { count: mediaPaths.length });
          const { error: storyStorageError } = await supabaseClient
            .storage
            .from("portfolio-media")
            .remove(mediaPaths);
          if (storyStorageError) logStep("Error deleting story media", { error: storyStorageError.message });
        }
      }

      // Delete chapter records
      const { error: chaptersError } = await supabaseClient
        .from("story_chapters")
        .delete()
        .in("story_id", storyIds);
      if (chaptersError) logStep("Error deleting story_chapters", { error: chaptersError.message });
    }

    // 7. Delete story_views
    if (storyIds.length > 0) {
      const { error: viewsError } = await supabaseClient
        .from("story_views")
        .delete()
        .in("story_id", storyIds);
      if (viewsError) logStep("Error deleting story_views", { error: viewsError.message });
    }

    // 8. Delete stories
    const { error: storiesError } = await supabaseClient
      .from("stories")
      .delete()
      .eq("profile_id", userId);
    if (storiesError) logStep("Error deleting stories", { error: storiesError.message });

    // 9. Delete leads
    const { error: leadsError } = await supabaseClient
      .from("leads")
      .delete()
      .eq("profile_id", userId);
    if (leadsError) logStep("Error deleting leads", { error: leadsError.message });

    // 10. Delete conversation_messages
    const { error: messagesError } = await supabaseClient
      .from("conversation_messages")
      .delete()
      .eq("profile_id", userId);
    if (messagesError) logStep("Error deleting conversation_messages", { error: messagesError.message });

    // 11. Clean up minisite_carousel_photos (keep only first 10 for free plan)
    const { data: carouselPhotos } = await supabaseClient
      .from("minisite_carousel_photos")
      .select("id, file_url, thumbnail_url, order_index")
      .eq("profile_id", userId)
      .order("order_index", { ascending: true });

    const carouselList = carouselPhotos as CarouselPhoto[] | null;
    if (carouselList && carouselList.length > 10) {
      const photosToDelete = carouselList.slice(10);
      const idsToDelete = photosToDelete.map(p => p.id);
      
      logStep("Trimming carousel photos to free limit", { 
        total: carouselList.length, 
        deleting: photosToDelete.length 
      });

      // Delete from storage
      const carouselPaths = photosToDelete
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
        await supabaseClient
          .storage
          .from("portfolio-media")
          .remove(carouselPaths);
      }

      // Delete records
      await supabaseClient
        .from("minisite_carousel_photos")
        .delete()
        .in("id", idsToDelete);
    }

    // 12. Clean up gallery thumbnails storage
    const { data: thumbFiles } = await supabaseClient
      .storage
      .from("gallery-thumbnails")
      .list(userId);

    if (thumbFiles && thumbFiles.length > 0) {
      logStep("Deleting gallery thumbnails", { count: thumbFiles.length });
      await supabaseClient
        .storage
        .from("gallery-thumbnails")
        .remove(thumbFiles.map(f => `${userId}/${f.name}`));
    }

    logStep("Cleanup completed for user", { userId });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error during cleanup", { userId, error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find and convert expired trials to free
    const { data: expiredTrials, error: fetchError } = await supabaseClient
      .from("profiles")
      .select("id, trial_ends_at, business_name")
      .eq("plan", "trial")
      .lt("trial_ends_at", new Date().toISOString());

    if (fetchError) {
      logStep("Error fetching expired trials", { error: fetchError.message });
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    const trialsList = expiredTrials as ExpiredTrial[] | null;
    logStep("Found expired trials", { count: trialsList?.length || 0 });

    const results = {
      converted: 0,
      cleaned: 0,
      errors: [] as string[]
    };

    if (trialsList && trialsList.length > 0) {
      for (const trial of trialsList) {
        logStep("Processing expired trial", { 
          userId: trial.id, 
          businessName: trial.business_name,
          expiredAt: trial.trial_ends_at 
        });

        // First, clean up the user's data
        const cleanupResult = await cleanupUserData(supabaseClient, trial.id);
        if (cleanupResult.success) {
          results.cleaned++;
        } else {
          results.errors.push(`Cleanup failed for ${trial.id}: ${cleanupResult.error}`);
        }

        // Then, convert to free plan
        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({ plan: "free" })
          .eq("id", trial.id);

        if (updateError) {
          logStep("Error converting trial to free", { userId: trial.id, error: updateError.message });
          results.errors.push(`Conversion failed for ${trial.id}: ${updateError.message}`);
        } else {
          results.converted++;
          logStep("Successfully converted trial to free", { userId: trial.id });
        }
      }
    }

    logStep("Function completed", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...results
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-trial-expiration", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
