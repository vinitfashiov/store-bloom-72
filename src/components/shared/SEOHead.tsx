import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
    title: string;
    description: string;
    canonicalUrl?: string;
    type?: 'website' | 'article' | 'product';
    image?: string;
    schema?: string; // JSON-LD string
}

export default function SEOHead({
    title,
    description,
    canonicalUrl,
    type = 'website',
    image = 'https://storekriti.com/og-image.jpg', // Default OG Image
    schema
}: SEOHeadProps) {
    const location = useLocation();
    const siteUrl = 'https://storekriti.com';
    const currentUrl = canonicalUrl || `${siteUrl}${location.pathname}`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {schema}
                </script>
            )}
        </Helmet>
    );
}
