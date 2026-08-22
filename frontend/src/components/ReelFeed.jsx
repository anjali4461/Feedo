import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

// Reusable feed for vertical reels
// Props:
// - items: Array of video items { _id, video, description, likeCount, savesCount, commentsCount, comments, foodPartner }
// - onLike: (item) => void | Promise<void>
// - onSave: (item) => void | Promise<void>
// - emptyMessage: string
const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.', initialItemId }) => {
  const videoRefs = useRef(new Map())
  const navigate = useNavigate()
  const [commentsByFood, setCommentsByFood] = useState({})
  const [commentCounts, setCommentCounts] = useState({})
  const [activeCommentsId, setActiveCommentsId] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [commentError, setCommentError] = useState('')
  const emojis = [ '❤️', '😋', '🔥', '👏', '😍', '🤤' ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => { /* ignore autoplay errors */ })
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )

    videoRefs.current.forEach((vid) => observer.observe(vid))

    if (initialItemId) {
      const initialVideo = videoRefs.current.get(initialItemId)
      initialVideo?.closest('.reel')?.scrollIntoView({ block: 'start' })
    }

    return () => observer.disconnect()
  }, [items, initialItemId])

  const setVideoRef = (id) => (el) => {
    if (!el) { videoRefs.current.delete(id); return }
    videoRefs.current.set(id, el)
  }

  async function openComments(item) {
    setActiveCommentsId(item._id)
    setCommentText('')
    setEditingCommentId(null)
    setCommentError('')

    if (commentsByFood[item._id]) return

    try {
      const response = await api.get(`/api/food/${item._id}/comments`)
      setCommentsByFood((previous) => ({ ...previous, [item._id]: response.data.comments }))
      setCommentCounts((previous) => ({ ...previous, [item._id]: response.data.comments.length }))
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/user/login')
        return
      }
      setCommentError(error.response?.data?.message || 'Unable to load comments')
    }
  }

  function closeComments() {
    setActiveCommentsId(null)
    setCommentText('')
    setEditingCommentId(null)
    setCommentError('')
  }

  function addEmoji(emoji) {
    setCommentText((previous) => previous + emoji)
  }

  async function submitComment(event, foodId) {
    event.preventDefault()
    const text = commentText.trim()
    if (!text) return

    try {
      const isEditing = Boolean(editingCommentId)
      const url = isEditing
        ? `/api/food/comments/${editingCommentId}`
        : `/api/food/${foodId}/comments`
      const response = isEditing
        ? await api.patch(url, { text })
        : await api.post(url, { text })
      const savedComment = response.data.comment

      setCommentsByFood((previous) => {
        const currentComments = previous[foodId] || []
        return {
          ...previous,
          [foodId]: isEditing
            ? currentComments.map((comment) => comment._id === savedComment._id ? savedComment : comment)
            : [ savedComment, ...currentComments ]
        }
      })
      if (!isEditing) {
        setCommentCounts((previous) => ({ ...previous, [foodId]: (previous[foodId] || 0) + 1 }))
      }
      setCommentText('')
      setEditingCommentId(null)
      setCommentError('')
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/user/login')
        return
      }
      setCommentError(error.response?.data?.message || 'Unable to save comment')
    }
  }

  function startEditing(comment) {
    setEditingCommentId(comment._id)
    setCommentText(comment.text)
    setCommentError('')
  }

  async function removeComment(foodId, commentId) {
    try {
      await api.delete(`/api/food/comments/${commentId}`)
      setCommentsByFood((previous) => ({
        ...previous,
        [foodId]: (previous[foodId] || []).filter((comment) => comment._id !== commentId)
      }))
      setCommentCounts((previous) => ({ ...previous, [foodId]: Math.max(0, (previous[foodId] || 1) - 1) }))
      if (editingCommentId === commentId) {
        setEditingCommentId(null)
        setCommentText('')
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/user/login')
        return
      }
      setCommentError(error.response?.data?.message || 'Unable to delete comment')
    }
  }

  return (
    <div className="reels-page">
      <div className="reels-feed" role="list">
        {items.length === 0 && (
          <div className="empty-state">
            <p>{emptyMessage}</p>
          </div>
        )}

        {items.map((item) => (
          <section key={item._id} className="reel" role="listitem">
            <video
              ref={setVideoRef(item._id)}
              className="reel-video"
              src={item.video}
              muted
              playsInline
              loop
              preload="metadata"
            />

            <div className="reel-overlay">
              <div className="reel-overlay-gradient" aria-hidden="true" />
              <div className="reel-actions">
                <div className="reel-action-group">
                  <button
                    onClick={onLike ? () => onLike(item) : undefined}
                    className="reel-action"
                    aria-label="Like"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{item.likeCount ?? item.likesCount ?? item.likes ?? 0}</div>
                </div>

                <div className="reel-action-group">
                  <button
                    className="reel-action"
                    onClick={onSave ? () => onSave(item) : undefined}
                    aria-label="Bookmark"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{item.savesCount ?? item.bookmarks ?? item.saves ?? 0}</div>
                </div>

                <div className="reel-action-group">
                  <button className="reel-action" onClick={() => openComments(item)} aria-label="Comments">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{commentCounts[item._id] ?? item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0)}</div>
                </div>
              </div>

              <div className="reel-content">
                <p className="reel-description" title={item.description}>{item.description}</p>
                {item.foodPartner && (
                  <div className="reel-cta-row">
                    <Link className="reel-btn" to={"/food-partner/" + item.foodPartner} aria-label="Visit store">Visit store</Link>
                    <Link className="reel-btn reel-order-btn" to={"/order/" + item._id} aria-label={`Order ${item.name || 'this food'}`}>Order now</Link>
                  </div>
                )}
              </div>
            </div>

            {activeCommentsId === item._id && (
              <aside className="comments-panel" aria-label="Comments">
                <div className="comments-panel-header">
                  <strong>Comments</strong>
                  <button type="button" className="comments-close" onClick={closeComments} aria-label="Close comments">×</button>
                </div>

                <div className="comments-list">
                  {(commentsByFood[item._id] || []).length === 0 && !commentError && (
                    <p className="comments-empty">Be the first to comment.</p>
                  )}
                  {(commentsByFood[item._id] || []).map((comment) => (
                    <article className="comment-item" key={comment._id}>
                      <div>
                        <strong>{comment.user?.fullName || 'User'}</strong>
                        <p>{comment.text}</p>
                      </div>
                      {comment.isOwner && (
                        <div className="comment-controls">
                          <button type="button" onClick={() => startEditing(comment)}>Edit</button>
                          <button type="button" onClick={() => removeComment(item._id, comment._id)}>Delete</button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>

                {commentError && <p className="comments-error" role="alert">{commentError}</p>}
                <form className="comment-form" onSubmit={(event) => submitComment(event, item._id)}>
                  <div className="emoji-row" aria-label="Add emoji">
                    {emojis.map((emoji) => (
                      <button type="button" key={emoji} onClick={() => addEmoji(emoji)} aria-label={`Add ${emoji}`}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="comment-input-row">
                    <input
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      placeholder={editingCommentId ? 'Edit your comment' : 'Add a comment'}
                      maxLength={500}
                      aria-label="Comment text"
                    />
                    <button type="submit">{editingCommentId ? 'Save' : 'Post'}</button>
                  </div>
                  {editingCommentId && (
                    <button type="button" className="comment-cancel" onClick={() => { setEditingCommentId(null); setCommentText('') }}>
                      Cancel edit
                    </button>
                  )}
                </form>
              </aside>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

export default ReelFeed