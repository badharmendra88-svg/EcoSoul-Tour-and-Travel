import { KumaonPackagePage, kumaonMetadata } from "@/components/KumaonPackage";

export const generateMetadata = () => kumaonMetadata("ranikhet");

export default function RanikhetTourPackagePage() {
  return <KumaonPackagePage id="ranikhet" />;
}
