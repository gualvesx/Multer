const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("uploads"));

// Configuração do banco de dados
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "localhost" // Substitua pelo nome real
});

// Configuração do Multer
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// Rota para upload
app.post("/upload", upload.single("avatar"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const { originalname, filename, path: filepath, mimetype, size } = req.file;

    // Inserir no banco de dados
    const sql = "INSERT INTO imagens (nome_arquivo, caminho, mime_type, tamanho) VALUES (?, ?, ?, ?)";
    db.query(sql, [originalname, filename, mimetype, size], (err, result) => {
        if (err) {
            console.error(err);
            // Remove o arquivo se falhar ao inserir no banco
            fs.unlinkSync(filepath);
            return res.status(500).json({ error: "Erro ao salvar no banco de dados" });
        }
        
        res.json({ 
            message: "Arquivo enviado com sucesso!",
            id: result.insertId,
            caminho: `/uploads/${filename}`
        });
    });
});

// Rota para servir imagens
app.get('/imagem/:id', (req, res) => {
    const sql = "SELECT caminho, mime_type FROM imagens WHERE id = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send("Imagem não encontrada");
        }
        
        const imagePath = path.join(__dirname, 'uploads', results[0].caminho);
        res.type(results[0].mime_type).sendFile(imagePath);
    });
});

app.listen(3000, () => console.log("Servidor rodando..."));