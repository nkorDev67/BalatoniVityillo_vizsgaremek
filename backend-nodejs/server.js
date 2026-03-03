require('dotenv').config();
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const felujitasRoutes = require('./routes/felujitasRoutes')
const app = express()

app.use(cors())
app.use(express.json())

// általános útvonalak
app.use('/api/felujitas', felujitasRoutes)
app.use('/api/auth', authRoutes)

// admin-specifikus végpontok (ellenőrizni fogjuk a token->isAdmin közben)
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server fut: http://localhost:${PORT}`)
})

