import { useAuth } from "../hooks/useauth";
import { Navigate } from "react-router-dom";
import LoadingState from "../../../components/LoadingState";


const Protected = ({children}) => {
  const {loading,user} = useAuth()
  
  if(loading){
    return <LoadingState title="Preparing your UdaanX workspace" description="Checking your account..." />
  }
  if(!user){
    return <Navigate to = {'/login'}/>


  }
  return children
}

export default Protected