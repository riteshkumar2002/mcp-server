import Home from './Home'
import { HOME_PAGE_URL } from './config'

export type DynamicDataType = {
  setLoading?: (loading: boolean) => void
}

export const getServiceHolder = (pageName: string, templateName?: string) => {
  return {
    getService: async (store: any, dynamicData?: DynamicDataType) => {
      const navigator = store?.navigate
      const service = myService(store, dynamicData?.setLoading)
      if (pageName === 'Home') {
        let pageData: any = undefined
        try {
          dynamicData?.setLoading?.(true)
          const response = await fetch(HOME_PAGE_URL)
          if (response.ok) {
            pageData = await response.json()
          } else {
            console.error('Failed to load home schema:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('Error fetching home schema:', error)
        } finally {
          dynamicData?.setLoading?.(false)
        }
        return Home(store, dynamicData, pageData)
      }
      return { navigator, ...service }
    }
  }
}

const myService = (store: any, setLoading?: (loading: boolean) => void) => {
  return {
    setLoading,
    navigate: store?.navigate,
    store
  }
}
