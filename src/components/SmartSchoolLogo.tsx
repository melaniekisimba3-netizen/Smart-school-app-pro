import React, { useState, useEffect } from "react";
import { SMARTSCHOOL_OFFICIAL_LOGO, SMARTSCHOOL_OFFICIAL_LOGO_FALLBACK } from "../constants/branding";
import { safeLocalStorage } from "../utils/safeStorage";

export interface SmartSchoolLogoProps {
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "hero";
  className?: string;
  imgClassName?: string;
  showLabel?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  alt?: string;
  withRing?: boolean;
  withShadow?: boolean;
}

const SIZE_MAP: Record<string, { img: string; text: string; sub: string }> = {
  xs: { img: "h-6 w-6 min-w-[24px]", text: "text-xs", sub: "text-[8px]" },
  sm: { img: "h-8 w-8 min-w-[32px]", text: "text-sm", sub: "text-[9px]" },
  md: { img: "h-10 w-10 min-w-[40px]", text: "text-base", sub: "text-[10px]" },
  lg: { img: "h-12 w-12 min-w-[48px]", text: "text-lg", sub: "text-[11px]" },
  xl: { img: "h-16 w-16 min-w-[64px]", text: "text-xl", sub: "text-xs" },
  "2xl": { img: "h-20 w-20 min-w-[80px]", text: "text-2xl", sub: "text-sm" },
  "3xl": { img: "h-28 w-28 min-w-[112px]", text: "text-3xl", sub: "text-base" },
  hero: { img: "h-32 w-32 sm:h-40 sm:w-40 min-w-[128px]", text: "text-3xl sm:text-4xl", sub: "text-xs sm:text-sm" },
};

export const SmartSchoolLogo: React.FC<SmartSchoolLogoProps> = ({
  src,
  size = "md",
  className = "",
  imgClassName = "",
  showLabel = false,
  showSubtitle = false,
  subtitle = "FRED-TECH • RDC",
  alt = "SmartSchool RDC — FRED-TECH Logo Officiel",
  withRing = false,
  withShadow = false,
}) => {
  const getInitialLogo = () => {
    if (src) return src;
    const cachedBranding = safeLocalStorage.getItem("smartschool_platform_branding_cache");
    if (cachedBranding) {
      try {
        const parsed = JSON.parse(cachedBranding);
        if (parsed.logoUrl && parsed.logoUrl.trim()) return parsed.logoUrl;
      } catch (e) {
        console.error(e);
      }
    }
    const cachedPlatformLogo = safeLocalStorage.getItem("smartschool_platform_logo_url");
    if (cachedPlatformLogo && cachedPlatformLogo.trim()) return cachedPlatformLogo;

    return SMARTSCHOOL_OFFICIAL_LOGO;
  };

  const [imgSrc, setImgSrc] = useState<string>(getInitialLogo);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  useEffect(() => {
    if (src && src.trim()) {
      setImgSrc(src);
      setLoadFailed(false);
    }
  }, [src]);

  useEffect(() => {
    const handleBrandingUpdated = (e: any) => {
      if (e.detail && e.detail.logoUrl && e.detail.logoUrl.trim()) {
        setImgSrc(e.detail.logoUrl);
        setLoadFailed(false);
      }
    };

    window.addEventListener("smartschool_branding_updated", handleBrandingUpdated);
    return () => {
      window.removeEventListener("smartschool_branding_updated", handleBrandingUpdated);
    };
  }, []);

  const handleImageError = () => {
    if (imgSrc !== SMARTSCHOOL_OFFICIAL_LOGO_FALLBACK) {
      setImgSrc(SMARTSCHOOL_OFFICIAL_LOGO_FALLBACK);
    } else {
      setLoadFailed(true);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`relative shrink-0 flex items-center justify-center rounded-full overflow-hidden aspect-square ${
          sizeConfig.img
        } ${
          withRing
            ? "p-1 bg-gradient-to-tr from-amber-400 via-blue-600 to-amber-500 shadow-md ring-2 ring-white dark:ring-slate-900"
            : ""
        } ${withShadow ? "shadow-lg shadow-blue-900/15 dark:shadow-black/40" : ""}`}
      >
        {!loadFailed && imgSrc && imgSrc.trim() !== "" ? (
          <img
            src={imgSrc}
            alt={alt}
            onError={handleImageError}
            referrerPolicy="no-referrer"
            className={`h-full w-full object-contain rounded-full bg-white dark:bg-slate-900 ${imgClassName}`}
            loading="eager"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 flex flex-col items-center justify-center text-white p-1">
            <span className="font-black text-[9px] tracking-tighter text-amber-400">SMART</span>
            <span className="font-extrabold text-[7px] text-blue-200 -mt-0.5">RDC</span>
          </div>
        )}
      </div>

      {(showLabel || showSubtitle) && (
        <div className="flex flex-col min-w-0 text-left">
          {showLabel && (
            <span
              className={`font-black tracking-tight text-slate-900 dark:text-white leading-tight ${sizeConfig.text}`}
            >
              SmartSchool <span className="text-amber-600 dark:text-amber-400">RDC</span>
            </span>
          )}
          {showSubtitle && (
            <span
              className={`font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mt-0.5 ${sizeConfig.sub}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};


