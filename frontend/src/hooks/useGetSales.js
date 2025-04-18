import { getAllsales } from "@/redux/saleSlice"
import { SALES_API_END_POINT } from "@/utils/constants"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"


const useGetSales = () => {
    const dispatch = useDispatch()
    const { refresh } = useSelector((state) => state.sale);
    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await axios.get(`${SALES_API_END_POINT}/get-all-sale`, {
                    withCredentials: true,
                })
                console.log(res);
                dispatch(getAllsales(res.data.data))
            } catch (error) {
                console.error("Error fetching sales:", error);
                console.log(error);
            }
        }
        fetchSales()
    }, [refresh])
}

export default useGetSales