import React, { useEffect, useState } from 'react'
import api from '../../services/api';
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'
import { Link } from 'react-router-dom'

const Home = () => {
    const [ videos, setVideos ] = useState([])
    const [ requiresLogin, setRequiresLogin ] = useState(false)
    // Autoplay behavior is handled inside ReelFeed

    useEffect(() => {
        api.get('/api/food')
            .then(response => {

                console.log(response.data);

                setVideos(response.data.foodItems)
            })
            .catch(error => {
                if (error.response?.status === 401) {
                    setRequiresLogin(true)
                } else {
                    console.error(error.response?.data?.message || "Unable to load food items", error)
                }
            })
    }, [])

    // Using local refs within ReelFeed; keeping map here for dependency parity if needed

    async function likeVideo(item) {

        const response = await api.post('/api/food/like', { foodId: item._id })

        if(response.data.like){
            console.log("Video liked");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v))
        }else{
            console.log("Video unliked");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v))
        }
        
    }

    async function saveVideo(item) {
        const response = await api.post('/api/food/save', { foodId: item._id })
        
        if(response.data.save){
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v))
        }else{
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount - 1 } : v))
        }
    }

    if (requiresLogin) {
        return (
            <main className="home-login-state">
                <div className="home-login-panel">
                    <h1>Discover your next favorite meal</h1>
                    <p>Sign in to watch food reels, save meals, and join the conversation.</p>
                    <Link className="home-login-button" to="/user/login">User login</Link>
                </div>
            </main>
        )
    }

    return (
        <ReelFeed
            items={videos}
            onLike={likeVideo}
            onSave={saveVideo}
            emptyMessage="No videos available."
        />
    )
}

export default Home