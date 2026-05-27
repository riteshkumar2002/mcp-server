import { useMemo } from 'react'
// import AppWithoutRouter from './AppWithoutRouter'
import { getServiceHolder } from './serviceHolder'
import {AppWithoutRouter} from 'impaktapps-jsonforms';
import { getAppTheme } from './Theme';

export default function App() {
  const serviceHolder = useMemo(() => getServiceHolder('Home'), [])
  const navigationHolder = {
    useParams: () => ({}),
    useNavigate: () => (to: string) => {
      if (typeof to === 'string') window.location.href = to
    },
    useLocation: () => ({ pathname: window.location.pathname, search: window.location.search, hash: window.location.hash }),
    useSearchParams: () => {
      const params = new URLSearchParams(window.location.search)
      return [params, (next: URLSearchParams | string) => {
        const q = typeof next === 'string' ? next : next.toString()
        const url = `${window.location.pathname}${q ? `?${q}` : ''}`
        window.history.pushState({}, '', url)
      }]
    }
  }

  return (
    <AppWithoutRouter
      dateFormat="YYYY-MM-DD"
      serviceHolder={serviceHolder}
      styleTheme={getAppTheme()}
      navigationHolder={navigationHolder}
      permissions={
["*:*:W"]}
      locale="en"
      timeZone="UTC"
      dateTimeFormat="YYYY-MM-DDTHH:mm:ss"
      serverDateTimeFormat="YYYY-MM-DDTHH:mm:ssZ"
    />
  )
}
