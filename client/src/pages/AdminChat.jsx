import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import AdminTabs from '../components/AdminTabs'
import ChatBox from '../components/ChatBox'
import { formatDate } from '../utils/format'

function AdminChat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  // The list of customers: load now, then every 6 seconds
  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await api.get('/chat/conversations')
        if (!active) return
        setConversations(res.data)
        // Open the first conversation automatically
        setSelectedId((current) => current ?? res.data[0]?.customer_id ?? null)
        setError('')
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Could not load the chats.')
      }
    }

    load()
    const timer = setInterval(load, 6000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  // The messages of the chosen customer: load now, then every 4 seconds
  useEffect(() => {
    if (!selectedId) return
    let active = true

    const load = async () => {
      try {
        const res = await api.get(`/chat/conversations/${selectedId}`)
        if (active) setMessages(res.data)
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Could not load the messages.')
      }
    }

    load()
    const timer = setInterval(load, 4000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [selectedId])

  const handleSelect = (customerId) => {
    setMessages([])
    setSelectedId(customerId)
  }

  const handleSend = async (body) => {
    const res = await api.post(`/chat/conversations/${selectedId}`, { body })
    setMessages((previous) => [...previous, res.data])
  }

  const selected = conversations.find((c) => c.customer_id === selectedId)

  return (
    <main className="container page">
      <h1 className="page-title">Admin dashboard</h1>
      <p className="page-sub">Answer your customers' questions.</p>

      <AdminTabs />

      {error && <div className="error-box">{error}</div>}

      {conversations.length === 0 ? (
        <p className="empty-note">No customer has written yet.</p>
      ) : (
        <div className="chat-layout">
          <div className="conversation-list">
            {conversations.map((c) => (
              <button
                key={c.customer_id}
                className={
                  'conversation-item' + (c.customer_id === selectedId ? ' active' : '')
                }
                onClick={() => handleSelect(c.customer_id)}
              >
                <span className="conversation-name">{c.name}</span>
                <span className="conversation-last">{c.last_message}</span>
                <span className="small-muted">{formatDate(c.last_time)}</span>
              </button>
            ))}
          </div>

          <div>
            {selected && (
              <p className="chat-title">
                Chat with <strong>{selected.name}</strong> ({selected.email})
              </p>
            )}
            <ChatBox
              messages={messages}
              myId={user.id}
              onSend={handleSend}
              emptyText="No messages yet."
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminChat