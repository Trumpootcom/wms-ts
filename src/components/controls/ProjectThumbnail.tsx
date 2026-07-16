import { useEffect, useMemo } from "react";
import { theme } from "../../theme.ts";

export default function ProjectThumbnail({ blob, name }: { blob?: Blob; name: string }) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url ? (
    <img src={url} alt="" style={{ width: "64px", height: "44px", display: "block", objectFit: "cover", borderRadius: "4px" }} />
  ) : (
    <div
      aria-label={`${name} has no thumbnail`}
      style={{ width: "64px", height: "44px", display: "grid", placeItems: "center", borderRadius: "4px", background: theme.control.resetBackground, color: theme.panel.mutedText, fontSize: "20px" }}
    >
      ◫
    </div>
  );
}
