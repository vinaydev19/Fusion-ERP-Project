import { getAllInvoices } from "@/redux/invoiceSlice"
import { INVOICES_API_END_POINT } from "@/utils/constants"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"


const useGetInvoices = () => {
    const dispatch = useDispatch()
    const { refresh } = useSelector((state) => state.invoices);
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await axios.get(`${INVOICES_API_END_POINT}/get-all-invoice`, {
                    withCredentials: true,
                })
                console.log(res);
                dispatch(getAllInvoices(res.data.data))
            } catch (error) {
                console.error("Error fetching invoice:", error);
                console.log(error);
            }
        }
        fetchInvoices()
    }, [refresh])
}

export default useGetInvoices