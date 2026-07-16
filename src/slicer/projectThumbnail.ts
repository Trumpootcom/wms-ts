const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 100;

export async function createProjectThumbnail(imageBlob: Blob): Promise<Blob | undefined> {
  const imageUrl = URL.createObjectURL(imageBlob);

  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not create project thumbnail."));
      image.src = imageUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = THUMBNAIL_WIDTH;
    canvas.height = THUMBNAIL_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const scale = Math.max(
      THUMBNAIL_WIDTH / image.naturalWidth,
      THUMBNAIL_HEIGHT / image.naturalHeight,
    );
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(
      image,
      (THUMBNAIL_WIDTH - width) / 2,
      (THUMBNAIL_HEIGHT - height) / 2,
      width,
      height,
    );

    return await new Promise<Blob | undefined>((resolve) =>
      canvas.toBlob((blob) => resolve(blob ?? undefined), "image/webp", 0.78),
    );
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
