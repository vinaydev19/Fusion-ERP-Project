import { getAllProducts } from "@/redux/productSlice"
import { PRODUCTS_API_END_POINT } from "@/utils/constants"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"


const useGetProducts = () => {
    const dispatch = useDispatch()
    const { refresh } = useSelector((state) => state.product);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${PRODUCTS_API_END_POINT}/get-all-product`, {
                    withCredentials: true,
                })
                console.log(res);
                dispatch(getAllProducts(res.data.data))
            } catch (error) {
                console.error("Error fetching products:", error);
                console.log(error);
            }
        }
        fetchProducts()
    }, [refresh])
}

export default useGetProducts