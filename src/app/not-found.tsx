import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SceneArt } from "@/components/SceneArt";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="container-page py-20 text-center">
        <SceneArt scene="mountain" className="mx-auto h-40 w-72 rounded-2xl" />
        <h1 className="h1 mt-8">This trail doesn&apos;t lead anywhere</h1>
        <p className="mt-3 text-slate-600">The page you&apos;re looking for has moved or doesn&apos;t exist.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/uttarakhand/tour-packages/" className="btn-outline">Browse packages</Link>
          <Link href="/contact/" className="btn-outline">Contact us</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
