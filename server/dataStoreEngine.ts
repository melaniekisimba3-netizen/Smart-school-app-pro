import express from "express";
import path from "path";
import fs from "fs";

export const dataRouter = express.Router();

const STORAGE_ROOT = path.join(process.cwd(), "data", "storage");

// Ensure base storage root exists
if (!fs.existsSync(STORAGE_ROOT)) {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function getCollectionFilePath(schoolId: string, collectionName: string): string {
  const safeSchool = sanitizeId(schoolId || "global");
  const safeCol = sanitizeId(collectionName);
  const dir = path.join(STORAGE_ROOT, safeSchool);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, `${safeCol}.json`);
}

/**
 * GET /api/data/:schoolId/:collection
 * Read records for a tenant collection
 */
dataRouter.get("/:schoolId/:collection", (req, res) => {
  try {
    const { schoolId, collection } = req.params;
    const filePath = getCollectionFilePath(schoolId, collection);
    if (!fs.existsSync(filePath)) {
      return res.json({ success: true, data: [] });
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return res.json({ success: true, data: Array.isArray(data) ? data : [] });
  } catch (err: any) {
    console.error(`Error reading ${req.params.schoolId}/${req.params.collection}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/data/:schoolId/:collection
 * Overwrite / Save entire records array for a tenant collection
 * Protected by Zero-Data-Loss: Prevents wiping non-empty files with empty arrays unless explicitly confirmed
 */
dataRouter.post("/:schoolId/:collection", (req, res) => {
  try {
    const { schoolId, collection } = req.params;
    const { data, allowEmptyOverride } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ success: false, error: "data must be an array" });
    }
    const filePath = getCollectionFilePath(schoolId, collection);

    // Zero-Data-Loss Guard: if data is empty and not explicitly allowed, preserve existing populated store
    if (data.length === 0 && !allowEmptyOverride && fs.existsSync(filePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (Array.isArray(existing) && existing.length > 0) {
          console.warn(`[Zero-Data-Loss Protection] Preserved existing ${existing.length} records in ${schoolId}/${collection}.json against empty payload.`);
          return res.json({ success: true, count: existing.length, preservedAgainstEmptyOverwrite: true });
        }
      } catch (e) {}
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return res.json({ success: true, count: data.length });
  } catch (err: any) {
    console.error(`Error writing ${req.params.schoolId}/${req.params.collection}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/data/:schoolId/:collection/item
 * Upsert a single item in the collection
 */
dataRouter.post("/:schoolId/:collection/item", (req, res) => {
  try {
    const { schoolId, collection } = req.params;
    const { item } = req.body;
    if (!item || !item.id) {
      return res.status(400).json({ success: false, error: "item with an id is required" });
    }
    const filePath = getCollectionFilePath(schoolId, collection);
    let list: any[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        list = JSON.parse(raw);
        if (!Array.isArray(list)) list = [];
      } catch (e) {
        list = [];
      }
    }
    const idx = list.findIndex(x => x.id === item.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...item, updatedAt: new Date().toISOString() });
    }
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
    return res.json({ success: true, item: list[idx >= 0 ? idx : 0] });
  } catch (err: any) {
    console.error(`Error upserting item in ${req.params.schoolId}/${req.params.collection}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/data/:schoolId/:collection/item/:itemId
 * Delete an item from collection
 */
dataRouter.delete("/:schoolId/:collection/item/:itemId", (req, res) => {
  try {
    const { schoolId, collection, itemId } = req.params;
    const filePath = getCollectionFilePath(schoolId, collection);
    if (!fs.existsSync(filePath)) {
      return res.json({ success: true, deleted: false });
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    let list: any[] = JSON.parse(raw);
    if (!Array.isArray(list)) list = [];
    const beforeCount = list.length;
    list = list.filter(x => x.id !== itemId);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
    return res.json({ success: true, deleted: list.length < beforeCount });
  } catch (err: any) {
    console.error(`Error deleting item ${req.params.itemId}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/data/backup/all
 * Full export of all persistent stores for disaster recovery
 */
dataRouter.get("/backup/all", (req, res) => {
  try {
    const backup: Record<string, any> = {};
    if (fs.existsSync(STORAGE_ROOT)) {
      const schools = fs.readdirSync(STORAGE_ROOT);
      for (const school of schools) {
        const schoolDir = path.join(STORAGE_ROOT, school);
        if (fs.statSync(schoolDir).isDirectory()) {
          backup[school] = {};
          const files = fs.readdirSync(schoolDir);
          for (const file of files) {
            if (file.endsWith(".json")) {
              const colName = file.replace(".json", "");
              try {
                const content = JSON.parse(fs.readFileSync(path.join(schoolDir, file), "utf-8"));
                backup[school][colName] = content;
              } catch (e) {}
            }
          }
        }
      }
    }
    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      backup
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
