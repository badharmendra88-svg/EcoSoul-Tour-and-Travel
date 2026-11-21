import { KumaonPackagePage, kumaonMetadata } from "@/components/KumaonPackage";

export const generateMetadata = () => kumaonMetadata("almora");

export default function AlmoraTourPackagePage() {
  return <KumaonPackagePage id="almora" />;
}
