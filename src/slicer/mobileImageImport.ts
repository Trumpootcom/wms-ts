type PreparedImage = {
  blob: Blob;
  width: number;
  height: number;
  rotated: boolean;
};

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load the selected image."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, sourceType: string) {
  const outputType = ["image/jpeg", "image/png", "image/webp"].includes(sourceType)
    ? sourceType
    : "image/png";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Could not rotate the selected image.")),
      outputType,
      0.92,
    );
  });
}

export async function prepareMobileImage(file: File): Promise<PreparedImage> {
  const image = await loadImage(file);
  const isMobile = window.matchMedia("(max-width: 720px)").matches;

  if (!isMobile || image.naturalWidth <= image.naturalHeight) {
    return {
      blob: file,
      width: image.naturalWidth,
      height: image.naturalHeight,
      rotated: false,
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalHeight;
  canvas.height = image.naturalWidth;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot rotate the selected image.");

  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(Math.PI / 2);
  context.drawImage(
    image,
    -image.naturalWidth / 2,
    -image.naturalHeight / 2,
  );

  return {
    blob: await canvasToBlob(canvas, file.type),
    width: canvas.width,
    height: canvas.height,
    rotated: true,
  };
}
