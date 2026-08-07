import app from './app.js'
import './database/conection.database.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Servidor andando en http://localhost:${PORT}`))
