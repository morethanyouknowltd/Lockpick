export default function clamp(val: number, min: number = 0, max: number = 0) {
  return Math.min(max, Math.max(val, min))
}
