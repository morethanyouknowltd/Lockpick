export default function IdStore<T extends { id: string }, D = any>() {
  const store = new Map<string, T>()
  return {
    get: (id: string) => store.get(id),
    set: (id: string, data: T) => store.set(id, data),
    delete: (id: string) => store.delete(id),
    update: (id: string, data: Partial<T>) => {
      const oldData = store.get(id)
      if (oldData) {
        const newData = { ...oldData, ...data }
        store.set(id, newData)
      }

      return oldData
    },
    has: (id: string) => store.has(id),
    clear: () => store.clear(),
    getAll: () => store.values(),
    getAllIds: () => store.keys(),
  }
}
