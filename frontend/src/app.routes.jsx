import { createBrowserRouter } from "react-router-dom";
import Login from "./featured/auth/pages/Login.jsx";
import Register from "./featured/auth/pages/Register.jsx";
import VerifyEmail from "./featured/auth/pages/VerifyEmail.jsx";
import Protected from "./featured/auth/components/Protected.jsx";
import Home from "./featured/ai/pages/home.jsx";
import Interview from "./featured/ai/pages/interview.jsx";


export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },{
    path:"/",
    element:<Protected><Home/></Protected>
  },
  {
    path:"/interview/:interviewId",
    element:<Protected><Interview/></Protected>
  },
  {
    path:"/report/:interviewId",
    element:<Protected><Interview/></Protected>
  }
]);