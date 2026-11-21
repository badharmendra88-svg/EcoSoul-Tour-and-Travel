import { KumaonPackagePage, kumaonMetadata } from "@/components/KumaonPackage";

export const generateMetadata = () => kumaonMetadata("mukteshwar");

export default function MukteshwarTourPackagePage() {
  return <KumaonPackagePage id="mukteshwar" />;
}
