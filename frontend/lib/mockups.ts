/** Client-side Canvas mockup compositing for design previews. */

export interface MockupConfig {
  template: string;
  designArea: { x: number; y: number; width: number; height: number };
  label: string;
  productType: string;
  price: number;
  blend?: "screen" | "normal";
}

export const MOCKUP_CONFIGS: MockupConfig[] = [
  {
    template: "/mockups/shirt-template.png",
    designArea: { x: 262, y: 230, width: 500, height: 450 },
    label: "T-Shirt",
    productType: "shirt",
    price: 29.99,
    blend: "screen",
  },
  {
    template: "/mockups/sticker-template.png",
    designArea: { x: 270, y: 210, width: 470, height: 530 },
    label: "Sticker",
    productType: "sticker",
    price: 3.50,
    blend: "normal",
  },
  {
    template: "/mockups/print-template.png",
    designArea: { x: 225, y: 225, width: 575, height: 500 },
    label: "Art Print",
    productType: "print",
    price: 12.99,
    blend: "normal",
  },
];

/**
 * Composite a design image onto a photorealistic product template.
 * For shirts: uses screen blending so designs look printed on fabric.
 * For stickers/prints: direct paste into the blank area.
 */
export function generateMockup(
  designDataUrl: string,
  config: MockupConfig
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not supported"));

    const templateImg = new window.Image();
    const designImg = new window.Image();

    templateImg.crossOrigin = "anonymous";
    designImg.crossOrigin = "anonymous";

    let loaded = 0;
    const onBothLoaded = () => {
      loaded++;
      if (loaded < 2) return;

      // Draw photorealistic template as base
      ctx.drawImage(templateImg, 0, 0, 1024, 1024);

      const { x, y, width, height } = config.designArea;

      // Maintain aspect ratio within the bounding box
      const scale = Math.min(width / designImg.width, height / designImg.height);
      const dw = designImg.width * scale;
      const dh = designImg.height * scale;
      const dx = x + (width - dw) / 2;
      const dy = y + (height - dh) / 2;

      if (config.blend === "screen") {
        // Screen blend: makes light colors on dark fabric look printed
        ctx.globalCompositeOperation = "screen";
      }

      ctx.drawImage(designImg, dx, dy, dw, dh);

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";

      resolve(canvas.toDataURL("image/png"));
    };

    templateImg.onload = onBothLoaded;
    designImg.onload = onBothLoaded;
    templateImg.onerror = () => reject(new Error(`Failed to load template: ${config.template}`));
    designImg.onerror = () => reject(new Error("Failed to load design image"));

    templateImg.src = config.template;
    designImg.src = designDataUrl;
  });
}
