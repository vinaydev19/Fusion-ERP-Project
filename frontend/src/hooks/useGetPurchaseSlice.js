import { getAllPurchases } from "@/redux/purchaseSlice";
import { PURCHASES_API_END_POINT } from "@/utils/constants";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";


const useGetPurchases = () => {
    const dispatch = useDispatch()
    const { refresh } = useSelector((state) => state.purchases);
    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const res = await axios.get(`${PURCHASES_API_END_POINT}/get-all-purchase`, {
                    withCredentials: true,
                })
                dispatch(getAllPurchases(res.data.data))
            } catch (error) {
                console.error("Error fetching deliveries:", error);
            }
        }
        fetchPurchases()
    }, [refresh])
}

export default useGetPurchases 