async function main() {
  // Login
  const loginResp = await fetch('https://kanzon-be.vercel.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fakhri@gmail.com', password: 'fakhri123' }),
  })
  const loginData = await loginResp.json()
  const token = loginData.data.accessToken
  console.log('Token obtained')

  // Find task
  const boardResp = await fetch('https://kanzon-be.vercel.app/api/boards?projectId=5719ad2c-9d7c-4bb3-b90d-c91053609d57', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const boardData = await boardResp.json()
  const boards = boardData.data ?? []
  const columns = boards.flatMap(b => b.columns ?? [])
  console.log('Columns count:', columns.length)
  const tasks = columns.flatMap(c => c.tasks ?? [])
  let taskId = tasks[0]?.id
  if (!taskId) {
    if (!columns[0]) {
      console.error('No columns found, cannot create task')
      process.exit(1)
    }
    // Create a task
    const createResp = await fetch('https://kanzon-be.vercel.app/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Blob Upload Test', columnId: columns[0].id, priority: 'MEDIUM' }),
    })
    const createData = await createResp.json()
    taskId = createData.data.id
    console.log('Created task:', taskId)
  } else {
    console.log('Using existing task:', taskId)
  }

  // Upload to blob
  const pngBytes = Buffer.from([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
    0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222,
    0, 0, 0, 12, 73, 68, 65, 84, 8, 215, 99, 248, 207, 0, 0, 0, 2,
    0, 1, 227, 39, 45, 154, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
  ])
  const formData = new FormData()
  formData.append('file', new Blob([pngBytes], { type: 'image/png' }), 'test-blob.png')

  const uploadResp = await fetch(`https://kanzon-be.vercel.app/api/tasks/${taskId}/attachments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const uploadData = await uploadResp.json()
  console.log('Upload response:', JSON.stringify(uploadData, null, 2))

  // Verify file is accessible
  if (uploadData.data?.url) {
    const fileResp = await fetch(uploadData.data.url, { method: 'HEAD' })
    console.log('File accessible:', fileResp.status, fileResp.headers.get('content-type'))
  }
}

main().catch(console.error)