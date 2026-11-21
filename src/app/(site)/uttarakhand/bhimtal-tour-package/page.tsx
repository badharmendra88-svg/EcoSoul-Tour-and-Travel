import { KumaonPackagePage, kumaonMetadata } from "@/components/KumaonPackage";

export const generateMetadata = () => kumaonMetadata("bhimtal");

export default function BhimtalTourPackagePage() {
  return <KumaonPackagePage id="bhimtal" />;
}
