export const addNotAlreadyIn = <A, B>(obj: A & Partial<B>, parent: B): A & B => {
  for (const key in parent) {
    if (!(key in obj)) {
      ;(obj as any)[key] = parent[key]
    }
  }
  return obj as A & B
}
