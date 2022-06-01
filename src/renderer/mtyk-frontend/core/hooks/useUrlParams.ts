import { omit } from 'lodash'
import { useLocation, useRouter } from 'mtyk-frontend/core/hooks/routerHooks'
import { config } from '../helpers/config'

export default function useUrlParams() {
  // Router doensn't exist in react preview
  const router = useRouter()
  const location = useLocation()
  const getCurrParams = () => {
    if (config.isNative) {
      // react native
      const sParams = new URLSearchParams(location.search)
      let params: any = {}
      sParams.forEach((value, key) => {
        params[key] = value
      })
      return params
    } else {
      // next.js
      return router.query
    }
  }

  const params = getCurrParams()
  const genUrl = (params: any) => {
    const str = new URLSearchParams(params).toString()
    return router.pathname + '?' + str
  }

  return {
    params,
    setParam(param: string, value: any) {
      if (String(value) === 'undefined' || String(value) === 'null') {
        let pWithout = omit(params, [param])
        router.push(genUrl(pWithout))
      } else {
        router.push(
          genUrl({
            ...params,
            [param]: value,
          })
        )
      }
    },
    setParams(params: any) {
      router.push(genUrl(params))
    },
  }
}
