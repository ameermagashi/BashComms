import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import ChatBox from '../components/ChatBox'

function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  // Load the messages now, then check again every 4 seconds
  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await api.get('/chat/my')
        if (active) {
          setMessages(res.data)
          setError('')
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Could not load the chat.')
      }
    }

    load()
    const timer = setInterval(load, 4000)

    // Stop checking when the customer leaves the page
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  const handleSend = async (body) => {
    const res = await api.post('/chat/my', { body })
    setMessages((previous) => [...previous, res.data])
  }

  return (
    <main className="container page">
      <h1 className="page-title">Chat with the shop</h1>
      <p className="page-sub">Ask a question about a product or an order. We reply here.</p>

      {error && <div className="error-box">{error}</div>}

      <ChatBox
        messages={messages}
        myId={user.id}
        onSend={handleSend}
        emptyText="No messages yet. Say hello!"
      />
    </main>
  )
}

export default Chat