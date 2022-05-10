/**
 * @name Ensure Unique Names
 * @id ensure-unique-names.modwig
 * @description Ensures all tracks have unique names, working better with modwig.
 * @category global
 * @noReload
 */

packetManager.listen('rename-all.ensure-unique-names.modwig', packet => {
  let existingNames = {}
  let renamedCount = 0
  let alltracknames = []
  tracks.forEach(thisTrack => {
    let name = thisTrack.name().get()
    while (name in existingNames && name !== '') {
      log(`${name} was in existing names`)
      const searchRes = /[0-9]+/.exec(name)
      let nextI = parseInt(searchRes ? searchRes[0] : 0, 10) + 1
      name = name.split(/[0-9]+/)[0] + nextI
      log(`Changed to ${name}`)
    }
    existingNames[name] = true
    if (thisTrack.name().get() !== name) {
      thisTrack.name().set(name)
      renamedCount++
    }
    alltracknames.push(name)
  })

  showMessage(`Renamed ${renamedCount} tracks`)
  function sharedStart(array) {
    var A = array.concat().sort(),
      a1 = A[0],
      a2 = A[A.length - 1],
      L = a1.length,
      i = 0
    while (i < L && a1.charAt(i) === a2.charAt(i)) i++
    return a1.substring(0, i)
  }

  // Find common start of all tracks and remove if possible
  let commonStart = sharedStart(alltracknames)
  if (commonStart.length > 0) {
    tracks.forEach(thisTrack => {
      let name = thisTrack.name().get()
      if (name.startsWith(commonStart)) {
        name = name.substring(commonStart.length)
        thisTrack.name().set(name)
      }
    })
  }
})
