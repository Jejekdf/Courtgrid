import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";

const BASE_URL = "https://courtgrid-one.vercel.app";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  locale?: string;
}

// Visual breadcrumb nav + JSON-LD BreadcrumbList for Google rich results.
// The first item is always injected by the caller (Home / Beranda).
export default function Breadcrumb({ items, locale = "id" }: BreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const fullUrl = item.href
        ? `${BASE_URL}${item.href === "/" ? `/${locale}` : `/${locale}${item.href}`}`
        : undefined;

      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        ...(fullUrl ? { item: fullUrl } : {}),
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-600">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight className="size-3.5 text-zinc-500 shrink-0" aria-hidden="true" />
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-zinc-950 transition-colors font-medium min-h-11 inline-flex items-center py-2 px-1 rounded-md"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "text-zinc-950 font-medium min-h-11 inline-flex items-center py-2 px-1" : "min-h-11 inline-flex items-center py-2 px-1"}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
