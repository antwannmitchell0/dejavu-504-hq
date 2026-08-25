import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

export function useJoinUrl() {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(`${window.location.origin}/join`);
  }, []);
  return url;
}

export function QrBlock({
  size = 220,
  className,
  inverted = false,
}: {
  size?: number;
  className?: string;
  inverted?: boolean;
}) {
  const url = useJoinUrl();
  if (!url) {
    return (
      <div
        className={cn("animate-pulse rounded-lg bg-elevated", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className={cn("rounded-lg bg-accent p-3", className)}>
      <QRCodeSVG
        value={url}
        size={size}
        bgColor={inverted ? "#2b1520" : "#d4f03a"}
        fgColor={inverted ? "#d4f03a" : "#2b1520"}
        level="M"
        marginSize={1}
        title="Scan to join Deja Vu 504's inner circle"
      />
    </div>
  );
}
