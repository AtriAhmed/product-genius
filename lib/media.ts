// Overload for File input
export function generateVideoPoster(
  videoSource: File,
  seekTimeSeconds?: number
): Promise<{ posterUrl: string; posterFile: File }>;

// Overload for URL input
export function generateVideoPoster(
  videoSource: string,
  seekTimeSeconds?: number
): Promise<{ posterUrl: string; posterFile: File }>;

// Overload for existing video element
export function generateVideoPoster(
  videoSource: HTMLVideoElement
): Promise<{ posterUrl: string; posterFile: File }>;

export function generateVideoPoster(
  videoSource: File | string | HTMLVideoElement,
  seekTimeSeconds?: number
): Promise<{ posterUrl: string; posterFile: File }> {
  return new Promise((resolve, reject) => {
    // If it's already a video element, capture directly from it
    if (videoSource instanceof HTMLVideoElement) {
      return captureFromVideoElement(videoSource, resolve, reject);
    }

    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    video.crossOrigin = "anonymous";
    video.muted = true;

    video.onloadedmetadata = () => {
      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Use provided seekTime or fallback to 1 second or 10% of video duration
      const seekTime = seekTimeSeconds ?? Math.min(1, video.duration * 0.1);
      video.currentTime = Math.min(seekTime, video.duration - 0.1);
    };

    video.onseeked = () => {
      try {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to generate poster blob"));
              return;
            }

            // Create File from blob
            const filename =
              videoSource instanceof File
                ? `${videoSource.name.split(".")[0]}_poster.jpg`
                : `video_poster_${Date.now()}.jpg`;

            const posterFile = new File([blob], filename, {
              type: "image/jpeg",
            });

            const posterUrl = URL.createObjectURL(posterFile);

            // Cleanup
            URL.revokeObjectURL(video.src);

            resolve({ posterUrl, posterFile });
          },
          "image/jpeg",
          0.8
        );
      } catch (error) {
        reject(error);
      }
    };

    video.onerror = () => {
      reject(new Error("Failed to load video for poster generation"));
    };

    // Load video based on source type
    if (videoSource instanceof File) {
      video.src = URL.createObjectURL(videoSource);
    } else if (typeof videoSource === "string") {
      video.src = videoSource;
    }

    video.load();
  });
}

// Helper function to capture from existing video element
function captureFromVideoElement(
  videoElement: HTMLVideoElement,
  resolve: (value: { posterUrl: string; posterFile: File }) => void,
  reject: (reason?: any) => void
) {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and create file
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to generate poster blob"));
          return;
        }

        const filename = `video_poster_${Date.now()}.jpg`;
        const posterFile = new File([blob], filename, { type: "image/jpeg" });
        const posterUrl = URL.createObjectURL(posterFile);

        resolve({ posterUrl, posterFile });
      },
      "image/jpeg",
      0.8
    );
  } catch (error) {
    reject(error);
  }
}
