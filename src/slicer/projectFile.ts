import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import type {
  GridColor,
  GridMode,
  GridSize,
  ImageAdjustments,
  SliceOrientation,
  SliceSize,
} from "./types.ts";
import { getSliceContentBox, getSlicePreset } from "./slicePresets.ts";

export const WMS_PROJECT_EXTENSION = "wmsts";
export const WMS_PROJECT_MIME_TYPE = "application/vnd.trumpoot.wmsts+zip";

export type SavedMapSettings = {
  printedWidthIn: number;
  printedHeightIn: number;
  maintainAspectRatio: boolean;
  gridMode: GridMode;
  gridPerspectiveAngle: number;
  gridRotation: number;
  gridColor: GridColor;
  gridSizeIn: GridSize;
  gridPhaseX: number;
  gridPhaseY: number;
  gridLineThickness: number;
  sliceSize: SliceSize;
  sliceOrientation: SliceOrientation;
  pageSetup: {
    paper: {
      presetId: "letter" | "ledger";
      widthIn: number;
      heightIn: number;
    };
    contentBox: {
      presetId: string;
      widthIn: number;
      heightIn: number;
      marginLeftIn: number;
      marginRightIn: number;
      marginTopIn: number;
      marginBottomIn: number;
    };
  };
  imageAdjustments: ImageAdjustments;
  imageZoom: number;
  imageOffsetX: number;
  imageOffsetY: number;
  exportDpi: number;
};

type SavedProjectJson = {
  schemaVersion: 1;
  app: "wms-tool-suite";
  project: {
    name: string;
    createdAt: string;
    savedAt: string;
    activeMapId: string;
    maps: Array<{
      id: string;
      name: string;
      imagePath: string;
      imageMimeType: string;
      sourcePixelWidth: number;
      sourcePixelHeight: number;
      settings: SavedMapSettings;
    }>;
  };
};

export type CreateProjectFileArgs = {
  projectName: string;
  mapName: string;
  imageBlob: Blob;
  imageFileName: string;
  sourcePixelWidth: number;
  sourcePixelHeight: number;
  settings: SavedMapSettings;
};

export type OpenedProjectFile = {
  projectName: string;
  mapName: string;
  imageBlob: Blob;
  imageFileName: string;
  sourcePixelWidth: number;
  sourcePixelHeight: number;
  settings: SavedMapSettings;
};

function getFileExtension(fileName: string, mimeType: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension;
  }

  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

function sanitizeFileName(value: string): string {
  const safe = value
    .trim()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safe || "wms-map";
}

function toBlobPart(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

function getProjectJson(zipEntries: Record<string, Uint8Array>): SavedProjectJson {
  const projectBytes = zipEntries["project.json"];

  if (!projectBytes) {
    throw new Error("This project file does not contain project.json.");
  }

  const parsed = JSON.parse(strFromU8(projectBytes)) as SavedProjectJson;

  if (parsed.schemaVersion !== 1 || parsed.app !== "wms-tool-suite") {
    throw new Error("This project file is not a supported WMS project.");
  }

  if (!parsed.project?.maps?.length) {
    throw new Error("This project does not contain a saved map.");
  }

  return parsed;
}

export function buildSavedPageSetup(
  sliceSize: SliceSize,
  sliceOrientation: SliceOrientation,
): SavedMapSettings["pageSetup"] {
  const preset = getSlicePreset(sliceSize);
  const contentSize = getSliceContentBox(sliceSize, sliceOrientation);

  return {
    paper: {
      presetId: preset.paper.presetId,
      widthIn: preset.paper.widthIn,
      heightIn: preset.paper.heightIn,
    },
    contentBox: {
      presetId: preset.contentBox.presetId,
      widthIn: contentSize.widthIn,
      heightIn: contentSize.heightIn,
      marginLeftIn: preset.contentBox.marginLeftIn,
      marginRightIn: preset.contentBox.marginRightIn,
      marginTopIn: preset.contentBox.marginTopIn,
      marginBottomIn: preset.contentBox.marginBottomIn,
    },
  };
}

export async function createProjectFile({
  projectName,
  mapName,
  imageBlob,
  imageFileName,
  sourcePixelWidth,
  sourcePixelHeight,
  settings,
}: CreateProjectFileArgs): Promise<Blob> {
  const mapId = "map-001";
  const extension = getFileExtension(imageFileName, imageBlob.type);
  const imagePath = `images/${mapId}.${extension}`;
  const now = new Date().toISOString();

  const projectJson: SavedProjectJson = {
    schemaVersion: 1,
    app: "wms-tool-suite",
    project: {
      name: projectName,
      createdAt: now,
      savedAt: now,
      activeMapId: mapId,
      maps: [
        {
          id: mapId,
          name: mapName,
          imagePath,
          imageMimeType: imageBlob.type || "application/octet-stream",
          sourcePixelWidth,
          sourcePixelHeight,
          settings,
        },
      ],
    },
  };

  const imageBytes = new Uint8Array(await imageBlob.arrayBuffer());
  const zipBytes = zipSync(
    {
      "project.json": strToU8(JSON.stringify(projectJson, null, 2)),
      [imagePath]: imageBytes,
    },
    { level: 6 },
  );

  return new Blob([toBlobPart(zipBytes)], { type: WMS_PROJECT_MIME_TYPE });
}

export async function openProjectFile(file: Blob): Promise<OpenedProjectFile> {
  const zipBytes = new Uint8Array(await file.arrayBuffer());
  const zipEntries = unzipSync(zipBytes);
  const projectJson = getProjectJson(zipEntries);
  const activeMap =
    projectJson.project.maps.find(
      (map) => map.id === projectJson.project.activeMapId,
    ) ?? projectJson.project.maps[0];

  const imageBytes = zipEntries[activeMap.imagePath];
  if (!imageBytes) {
    throw new Error("This project is missing its saved image file.");
  }

  const imageBlob = new Blob([toBlobPart(imageBytes)], {
    type: activeMap.imageMimeType || "application/octet-stream",
  });

  return {
    projectName: projectJson.project.name,
    mapName: activeMap.name,
    imageBlob,
    imageFileName: `${sanitizeFileName(activeMap.name)}.${getFileExtension(
      activeMap.imagePath,
      activeMap.imageMimeType,
    )}`,
    sourcePixelWidth: activeMap.sourcePixelWidth,
    sourcePixelHeight: activeMap.sourcePixelHeight,
    settings: activeMap.settings,
  };
}

export function getProjectDownloadFileName(projectName: string): string {
  return `${sanitizeFileName(projectName)}.${WMS_PROJECT_EXTENSION}`;
}
