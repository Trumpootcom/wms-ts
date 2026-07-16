export type LocalProject = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  blob: Blob;
  thumbnailBlob?: Blob;
};

export type LocalProjectSummary = Omit<LocalProject, "blob">;

const DATABASE_NAME = "wms-tool-suite";
const DATABASE_VERSION = 1;
const PROJECT_STORE = "projects";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROJECT_STORE)) {
        const store = database.createObjectStore(PROJECT_STORE, {
          keyPath: "id",
        });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runRequest<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PROJECT_STORE, mode);
    const request = operation(transaction.objectStore(PROJECT_STORE));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function listLocalProjects(): Promise<LocalProjectSummary[]> {
  const projects = await runRequest<LocalProject[]>("readonly", (store) =>
    store.getAll(),
  );

  return projects
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ id, name, createdAt, updatedAt, thumbnailBlob }) => ({
      id,
      name,
      createdAt,
      updatedAt,
      thumbnailBlob,
    }));
}

export function getLocalProject(id: string): Promise<LocalProject | undefined> {
  return runRequest<LocalProject | undefined>("readonly", (store) =>
    store.get(id),
  );
}

export async function saveLocalProject(
  blob: Blob,
  name: string,
  existingId?: string | null,
  thumbnailBlob?: Blob,
): Promise<LocalProject> {
  const now = new Date().toISOString();
  const existing = existingId ? await getLocalProject(existingId) : undefined;
  const project: LocalProject = {
    id: existing?.id ?? crypto.randomUUID(),
    name,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    blob,
    thumbnailBlob: thumbnailBlob ?? existing?.thumbnailBlob,
  };

  await runRequest<IDBValidKey>("readwrite", (store) => store.put(project));
  return project;
}

export async function renameLocalProject(id: string, name: string) {
  const project = await getLocalProject(id);
  if (!project) throw new Error("The local project no longer exists.");

  await runRequest<IDBValidKey>("readwrite", (store) =>
    store.put({ ...project, name, updatedAt: new Date().toISOString() }),
  );
}

export async function deleteLocalProject(id: string) {
  await runRequest<undefined>("readwrite", (store) => store.delete(id));
}

export async function requestPersistentProjectStorage(): Promise<void> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    // Persistence is a browser policy hint; IndexedDB still works if denied.
  }
}
