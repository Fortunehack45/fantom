
'use client';

interface VideoPlayerProps {
    url: string;
}

const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (urlObj.hostname.includes('tiktok.com')) {
            // Note: TikTok embeds are tricky and may not always work due to their policies.
            // This is a common approach but might require more advanced solutions if it fails.
            const videoId = urlObj.pathname.split('/').pop();
            return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
        if (urlObj.hostname.includes('facebook.com')) {
            return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
        }
    } catch (e) {
        console.error("Invalid video URL", e);
        return null;
    }
    return null;
};


export function VideoPlayer({ url }: VideoPlayerProps) {
    const embedUrl = getVideoEmbedUrl(url);

    if (!embedUrl) {
        return (
            <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Invalid or unsupported video URL.</p>
            </div>
        );
    }
    
    return (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-md bg-black">
            <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="Embedded Video"
            ></iframe>
        </div>
    );
}
