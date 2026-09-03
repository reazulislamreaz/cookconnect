import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center font-poppins">
      <p className="text-5xl font-bold text-brand">404</p>
      <p className="mt-3 text-lg font-medium text-gray-900">Page introuvable</p>
      <p className="mt-1 text-sm text-gray-500">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
