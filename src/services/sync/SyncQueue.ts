// Offline order sync queue
// Stores ops in IndexedDB when offline, flushes on reconnect

export interface SyncOp {
  id: string
  type: "create_order" | "update_order" | "void_item"
  payload: unknown
  clientTimestamp: number
  retries: number
}

export class SyncQueue {
  private dbName = "pos-sync-queue"

  async enqueue(op: Omit<SyncOp, "id" | "retries">) {
    // TODO: write to IndexedDB
    console.log("Queued op:", op)
  }

  async flush(onSync: (op: SyncOp) => Promise<void>) {
    // TODO: read from IndexedDB, call onSync for each
    // Handle conflicts: last-write-wins with clientTimestamp
  }
}

export const syncQueue = new SyncQueue()
