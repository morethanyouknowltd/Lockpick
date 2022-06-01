export default function logForMod(mod, ...rest) {
  if (mod.logger) {
    mod.logger.log(...rest)
  } else {
    console.log(...rest)
  }
}
