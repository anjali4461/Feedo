import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import axios from 'axios'
import ReelFeed from '../../components/ReelFeed'
import { useNavigate } from 'react-router-dom'

const Saved = () => {
    const [ videos, setVideos ] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        axios.get("https://feedo-wolw.onrender.com/api/food/save", { withCredentials: true })
            .then(response => {
                const savedFoods = response.data.savedFoods.map((item) => ({
                    _id: item.food._id,
                    video: item.food.video,
                    description: item.food.description,
                    likeCount: item.food.likeCount,
                    savesCount: item.food.savesCount,
                    commentsCount: item.food.commentsCount,
                    foodPartner: item.food.foodPartner,
                }))
                setVideos(savedFoods)
            })
                .catch(error => {
                    setVideos([])
                if (error.response?.status === 401) {
                    navigate('/user/login')
                } else {
                    console.error(error.response?.data?.message || "Unable to load saved foods", error)
                }
                })
    }, [ navigate ])

    const removeSaved = async (item) => {
        try {
            await axios.post("https://feedo-wolw.onrender.com/api/food/save", { foodId: item._id }, { withCredentials: true })
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: Math.max(0, (v.savesCount ?? 1) - 1) } : v))
        } catch {
            // noop
        }
    }

    return (
        <ReelFeed
            items={videos}
            onSave={removeSaved}
            emptyMessage="No saved videos yet."
        />
    )
}

export default Saved