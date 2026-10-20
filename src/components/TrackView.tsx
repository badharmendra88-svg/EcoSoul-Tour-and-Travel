"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function TrackPackageView({ packageId }: { packageId: string }) {
  useEffect(() => {
    track("view_package", { package_id: packageId });
  }, [packageId]);
  return null;
}
