import {createContext, useState} from "react";
export const Aicontext = createContext();
export const Aiprovider = ({children}) => {
    const [interviewreport, setInterviewreport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [reports, setReports] = useState([]);

    return(
        <Aicontext.Provider value={{interviewreport, setInterviewreport, loading, setLoading, generating, setGenerating, reports, setReports}}>
            {children}
        </Aicontext.Provider>
    )

} 