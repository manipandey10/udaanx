import {RouterProvider} from "react-router-dom";
import {router} from "./app.routes.jsx";
import { AuthProvider } from "./featured/auth/AuthProvider.jsx";
import {Aiprovider} from "./featured/ai/ai.context.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Aiprovider>
        <RouterProvider router={router} />
      </Aiprovider>
    </AuthProvider>
  )
}

export default App
