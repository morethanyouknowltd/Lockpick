import { debounce } from 'lodash'
import { useEffect, useState } from 'react'
import { ReactNative } from '../../core/helpers/conditionalImports'
import { config } from '../../core/helpers/config'

export default function () {
  if (config.isNative) {
    const { Dimensions } = ReactNative
    const { width, height } = Dimensions.get('screen')
    const minEstimatedHeight = 568
    const wiggleRoom = 844 - minEstimatedHeight
    const smaller = Math.max(0, 844 - height) / wiggleRoom

    return {
      width,
      height,
      smaller,
    }
  } else {
    // We don't follow this advice ⬇️  maybe should read...

    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/

    // We ignore the above advice.. is it a big deal?
    const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    })
    useEffect(() => {
      // Handler to call on window resize
      const handleResize = debounce(() => {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, 250)
      // Add event listener
      window.addEventListener('resize', handleResize)
      // Call handler right away so state gets updated with initial window size
      handleResize()
      // Remove event listener on cleanup
      return () => window.removeEventListener('resize', handleResize)
    }, []) // Empty array ensures that effect is only run on mount
    return windowSize
  }
}
