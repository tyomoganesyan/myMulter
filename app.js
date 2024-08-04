const express = require('express')
const app = express()
const body_parser = require('body-parser')
const fs = require('fs')
const path = require('path')
const PORT = 3000
app.use(body_parser.json())

app.use(express.raw({ type: 'multipart/form-data', limit: '10mb' }));

const filePath = path.join(__dirname, 'public/uploads')

app.get('/', (req, res) => {
    res.json({ message: 'hello world' })
})

app.post('/', (req, res) => {

    const boundary = req.headers['content-type'].split('boundary=')[1]

    if (!boundary) {
        return res.status(400).send('Boundary not found');
    }   

    const body = req.body.toString()
    const parts = body.split(`--${boundary}`);
   
    parts.forEach(part => {

        if (part.includes('Content-Disposition')) {
            const content = part.split('\r\n\r\n')[1];
            const data = content.split('\n\r\n').join('').trim()
            if (!data) {
                return res.status(500).json({ message: "Failed to upload files" })
            }
            const fileName = path.join(filePath, Date.now() + '.txt')
            fs.writeFile(fileName, data, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Upload failed" })
                }
            })
            res.json({ message: 'Files uploaded successfully' })
        }
    })
})


app.listen(PORT, () => {
    console.log('Server is listening to http://localhost:3000')
})