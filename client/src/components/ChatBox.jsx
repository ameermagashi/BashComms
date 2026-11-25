import { useEffect, useRef, useState } from 'react'
import { formatDate } from '../utils/format'

function ChatBox({ messages, myId, onSend, emptyText }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)

  // Scroll down to the newest message when a new one arrives
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    setSending(true)
    setError('')
    try {
      await onSend(text.trim())
      setText('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-box">
      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 && <p className="chat-empty">{emptyText}</p>}

        {messages.map((msg) => {
          const mine = msg.sender_id === myId
          return (
            <div key={msg.id} className={'bubble ' + (mine ? 'mine' : 'theirs')}>
              {!mine && (
                <div className="bubble-sender">
                  {msg.sender_name}
                  {msg.sender_role === 'admin' ? ' (Shop)' : ''}
                </div>
              )}
              <div>{msg.body}</div>
              <div className="bubble-meta">{formatDate(msg.created_at)}</div>
            </div>
          )
        })}
      </div>

      {error && <div className="error-box chat-error">{error}</div>}

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default ChatBox