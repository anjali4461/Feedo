import React, { useState, useEffect } from 'react'
import '../../styles/profile.css'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import ReelFeed from '../../components/ReelFeed'

const Profile = () => {
    const { id } = useParams()
    const [ profile, setProfile ] = useState(null)
    const [ videos, setVideos ] = useState([])
    const [ showReels, setShowReels ] = useState(false)
    const [ activeReelId, setActiveReelId ] = useState(null)

    useEffect(() => {
        api.get(`/api/food-partner/${id}`)
            .then(response => {
                setProfile(response.data.foodPartner)
                setVideos(response.data.foodPartner.foodItems)
            })
    }, [ id ])

    async function likeVideo(item) {
        const response = await api.post('/api/food/like', { foodId: item._id })

        setVideos((previousVideos) => previousVideos.map((video) => (
            video._id === item._id
                ? { ...video, likeCount: Math.max(0, (video.likeCount ?? 0) + (response.data.like ? 1 : -1)) }
                : video
        )))
    }

    async function saveVideo(item) {
        const response = await api.post('/api/food/save', { foodId: item._id })

        setVideos((previousVideos) => previousVideos.map((video) => (
            video._id === item._id
                ? { ...video, savesCount: Math.max(0, (video.savesCount ?? 0) + (response.data.save ? 1 : -1)) }
                : video
        )))
    }

    if (showReels) {
        return (
            <div className="profile-reels-view">
                <button
                    className="profile-reels-back"
                    type="button"
                    onClick={() => setShowReels(false)}
                >
                    Back to store
                </button>
                <ReelFeed
                    items={videos}
                    onLike={likeVideo}
                    onSave={saveVideo}
                    initialItemId={activeReelId}
                    emptyMessage="This store has no food reels yet."
                />
            </div>
        )
    }


    return (
        <main className="profile-page">
            <section className="profile-header">
                <div className="profile-meta">

                    <img className="profile-avatar" src="https://images.unsplash.com/photo-1754653099086-3bddb9346d37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0Nnx8fGVufDB8fHx8fA%3D%3D" alt="" />

                    <div className="profile-info">
                        <h1 className="profile-pill profile-business" title="Business name">
                            {profile?.name}
                        </h1>
                        <p className="profile-pill profile-address" title="Address">
                            {profile?.address}
                        </p>
                    </div>
                </div>

                <div className="profile-stats" role="list" aria-label="Stats">
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">total meals</span>
                        <span className="profile-stat-value">{profile?.totalMeals ?? 0}</span>
                    </div>
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">customer served</span>
                        <span className="profile-stat-value">{profile?.customersServed ?? 0}</span>
                    </div>
                </div>
            </section>

            <hr className="profile-sep" />

            <section className="profile-grid" aria-label="Videos">
                {videos.map((v) => (
                    <button
                        key={v._id}
                        className="profile-grid-item"
                        type="button"
                        onClick={() => {
                            setActiveReelId(v._id)
                            setShowReels(true)
                        }}
                        aria-label={`Watch ${v.name || 'food'} reels`}
                    >
                        <video
                            className="profile-grid-video"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            src={v.video}
                            muted
                            playsInline
                            preload="metadata"
                        />
                    </button>
                ))}
            </section>
        </main>
    )
}

export default Profile