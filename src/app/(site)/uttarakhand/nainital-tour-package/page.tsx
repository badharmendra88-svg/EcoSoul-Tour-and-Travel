import { KumaonPackagePage, kumaonMetadata } from "@/components/KumaonPackage";

export const generateMetadata = () => kumaonMetadata("nainital");

export default function NainitalTourPackagePage() {
  return <KumaonPackagePage id="nainital" />;
}
