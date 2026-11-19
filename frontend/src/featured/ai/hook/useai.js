import {generateinterview,allreportfetch,getreportbyid,generateinterviewpdf as requestInterviewPdf} from "../services/ai.api.js";

import { useCallback, useContext } from "react";
import { Aicontext } from "../ai.context.jsx";

export function useAI() {
    const context = useContext(Aicontext);
    if(!context){
        throw new Error("useAI must be used within Aiprovider");
    }
    const {interviewreport, setInterviewreport, loading, setLoading, generating, setGenerating, reports, setReports} = context;    


    const generateinterviewreport = async ({selfdescription,jobdescription,resumeFile}) => {
        setGenerating(true);
        try {
            const result = await generateinterview({selfdescription,jobdescription,resumeFile});
            const report = result.interviewreport;
            setInterviewreport(report);
            return report;
        } finally {
            setGenerating(false);
        }
    }

    const fetchallreport = async () => {
        try {
            setLoading(true);
            const result = await allreportfetch();
            setReports(result.interviewreports);
        } catch (error) {
            console.error("Error fetching all reports:", error);
            throw error;
        } finally {
            setLoading(false);
        }

    }

    const fetchreportbyid = useCallback(async (id) => {
        setLoading(true);
        setInterviewreport(null);
        try {
            const result = await getreportbyid(id);
            setInterviewreport(result.interviewreport);
            return result.interviewreport;
        } finally {
            setLoading(false);
        }
    }, [setInterviewreport, setLoading]);

    const generateinterviewpdf = useCallback(async (id) => {
        setLoading(true);   
        try {
            const pdfBlob = await requestInterviewPdf(id);
            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `tailored_resume_${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error("Error generating interview report PDF:", error);
            throw error;
        }
        finally {
            setLoading(false);
        }
    }, [setLoading]);

    return {  
        interviewreport,
        setInterviewreport,
        loading,
        setLoading,
        generating,
        reports,
        setReports,
        generateinterviewreport,
        fetchallreport,
        fetchreportbyid,
        generateinterviewpdf
    }      
}
