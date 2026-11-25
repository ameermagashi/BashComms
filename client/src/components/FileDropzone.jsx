import { useMemo, useRef, useState, useEffect } from 'react'

// 2300000 bytes becomes "2.2 MB"
function formatSize(bytes) {
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function FileDropzone({ label, hint, accept, kind, maxMB, file, onChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [problem, setProblem] = useState('')

  // A temporary address so we can preview the chosen file in the browser
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Check the file, then hand it to the form
  const pick = (selected) => {
    if (!selected) return

    if (!accept.split(',').includes(selected.type)) {
      setProblem('That file type is not allowed.')
      return
    }
    if (selected.size > maxMB * 1024 * 1024) {
      setProblem(`That file is too big. The maximum is ${maxMB} MB.`)
      return
    }

    setProblem('')
    onChange(selected)
  }

  const openPicker = () => inputRef.current.click()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  return (
    <div className="dz-field">
      <span className="dz-label">{label}</span>

      <div
        className={'dropzone' + (dragging ? ' dragging' : '') + (file ? ' has-file' : '')}
        onClick={() => !file && openPicker()}
        onKeyDown={(e) => !file && handleKeyDown(e)}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pick(e.dataTransfer.files[0])
        }}
        role={file ? undefined : 'button'}
        tabIndex={file ? -1 : 0}
      >
        {/* The real file input stays hidden. Our nice box opens it. */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            pick(e.target.files[0])
            e.target.value = '' // lets you pick the same file again later
          }}
        />

        {file ? (
          <>
            {kind === 'image' ? (
              <img className="dz-preview" src={previewUrl} alt="Preview" />
            ) : (
              <video className="dz-preview" src={previewUrl} controls muted />
            )}

            <div className="dz-info">
              <div className="dz-name">
                <strong>{file.name}</strong>
                <span className="dz-hint">{formatSize(file.size)}</span>
              </div>
              <div className="dz-actions">
                <button type="button" className="dz-btn" onClick={openPicker}>
                  Change
                </button>
                <button type="button" className="dz-btn remove" onClick={() => onChange(null)}>
                  Remove
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="dz-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 16V4" />
                <path d="M7 9l5-5 5 5" />
                <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
              </svg>
            </div>
            <p className="dz-title">
              Drag and drop a {kind} here, or <span>browse</span>
            </p>
            <p className="dz-hint">{hint}</p>
          </>
        )}
      </div>

      {problem && <p className="dz-error">{problem}</p>}
    </div>
  )
}

export default FileDropzone