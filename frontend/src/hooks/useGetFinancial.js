import { getAllFinancials } from "@/redux/financialSlice"
import { FINANCIALS_API_END_POINT } from "@/utils/constants"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"


const useGetFinancials = () => {
    const dispatch = useDispatch()
    const { refresh } = useSelector((state) => state.financial);
    useEffect(() => {
        const fetchFinancials = async () => {
            try {
                const res = await axios.get(`${FINANCIALS_API_END_POINT}/get-all-financial`, {
                    withCredentials: true,
                })
                console.log(res);
                dispatch(getAllFinancials(res.data.data))
            } catch (error) {
                console.error("Error fetching financials:", error);
                console.log(error);
            }
        }
        fetchFinancials()
    }, [refresh])
}

export default useGetFinancials