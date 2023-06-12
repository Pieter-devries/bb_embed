// Import the Looker Embed SDK library
import { LookerEmbedSDK } from '@looker/embed-sdk'

export default function App() {

  const loadDashboard = () => {
    // Initialize (authentication) by cookieless login
    // First URL is the Looker instance to be used, second and third urls are for local server API (back-end)

    LookerEmbedSDK.initCookieless('bbplayground.cloud.looker.com', 'http://localhost:3000/acquire-embed-session', 'http://localhost:3000/generate-embed-tokens')

    // Once authentication completes, we create a dashboard with any ID from the Looker instance being used
    // The dashboard is attached to the "dashboard" div and it is built
    LookerEmbedSDK.createDashboardWithId(1)
      .appendTo('#dashboard')
      .withDynamicIFrameHeight()
      .build()
      .connect()
      .then(() => {
        console.log('Done')
      })
      .catch((error) => {
        console.error(error)
      })
  }

  // The component returned is the div where the dashboard will be rendered and a button with "Load Dashboard"
  // that when clicked will call the above function
  return (
    <div className="App">
      <div id="dashboard"></div>
      <button onClick={loadDashboard}>Load Dashboard</button>
    </div>
  )
}
