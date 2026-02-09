import lumaLogoWhite from "@/assets/luma-logo-white.png";

export function SidebarHeader() {
  return (
    <div className="p-6">
      <img 
        src={lumaLogoWhite} 
        alt="Luma" 
        className="h-8 w-auto"
      />
    </div>
  );
}
