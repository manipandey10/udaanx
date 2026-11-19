import api from "../../../services/api";

export const generateinterview = async ({  selfdescription, jobdescription ,resumeFile}) => {
    const formdata = new FormData();
    formdata.append("resume", resumeFile);
    formdata.append("selfdescription", selfdescription);
    formdata.append("jobdescription", jobdescription);

    const response = await api.post("/interview/report", formdata);
    return response.data;
}
  
export const allreportfetch = async () => {
    const response = await api.get("/interview/allreport/fetch");
    return response.data;
}
 
export const getreportbyid = async (id) => {
    const response = await api.get(`/interview/report/${id}`);
    return response.data;
}

export const generateinterviewpdf = async (id) => {
    const response = await api.post(`/interview/report/pdf/${id}`,null, {
        responseType: 'blob', // Important for handling binary data
    });
    return response.data;
}