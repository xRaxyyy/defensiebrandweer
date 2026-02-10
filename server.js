const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000; // Gebruik environment variable voor port
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Maak uploads directory aan als deze niet bestaat
if (!fsSync.existsSync(UPLOADS_DIR)) {
    fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log('Uploads directory aangemaakt:', UPLOADS_DIR);
}

// Configureer multer voor afbeelding uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + ext;
        console.log('Bestand opslaan als:', filename);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Alleen afbeeldingen zijn toegestaan (JPEG, PNG, GIF, WebP, SVG)!'));
        }
    }
});

// Middleware
const corsOptions = {
    origin: '*', // Of specifieke origins voor productie
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper functie om data te lezen
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Als het bestand niet bestaat, maak het aan met lege data
        console.log('Data file not found, creating new one...');
        const initialData = {
            locations: [],
            equipment: []
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
}

// Helper functie om data te schrijven
async function writeData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('Data succesvol opgeslagen in', DATA_FILE);
    } catch (error) {
        console.error('Error writing data file:', error);
        throw error;
    }
}

// NIEUW: Upload afbeelding endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        console.log('Upload request ontvangen');
        
        if (!req.file) {
            console.log('Geen bestand in request');
            return res.status(400).json({ 
                success: false, 
                error: 'Geen bestand geüpload' 
            });
        }
        
        // Maak URL dynamisch gebaseerd op request host
        const protocol = req.protocol;
        const host = req.get('host');
        const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        
        console.log('Afbeelding succesvol geüpload:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            url: imageUrl
        });
        
        res.json({ 
            success: true, 
            imageUrl: imageUrl,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Upload mislukt', 
            details: error.message 
        });
    }
});

// NIEUW: Verwijder afbeelding endpoint
app.delete('/api/upload/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(UPLOADS_DIR, filename);
        
        console.log('Verwijder afbeelding aanvraag:', filename);
        
        if (fsSync.existsSync(filePath)) {
            await fs.unlink(filePath);
            console.log('Afbeelding succesvol verwijderd:', filename);
            
            // Verwijder ook uit data.json als deze gebruikt wordt
            const data = await readData();
            let updated = false;
            
            // Check in locations
            data.locations = data.locations.map(location => {
                if (location.imageUrl && location.imageUrl.includes(filename)) {
                    location.imageUrl = 'https://via.placeholder.com/800x600?text=Afbeelding+Verwijderd';
                    updated = true;
                }
                return location;
            });
            
            // Check in equipment
            data.equipment = data.equipment.map(item => {
                if (item.imageUrl && item.imageUrl.includes(filename)) {
                    item.imageUrl = 'https://via.placeholder.com/800x600?text=Afbeelding+Verwijderd';
                    updated = true;
                }
                return item;
            });
            
            if (updated) {
                await writeData(data);
                console.log('Data.json bijgewerkt na verwijderen afbeelding');
            }
            
            res.json({ 
                success: true, 
                message: 'Afbeelding verwijderd',
                filename: filename
            });
        } else {
            console.log('Bestand niet gevonden:', filename);
            res.status(404).json({ 
                success: false, 
                error: 'Bestand niet gevonden' 
            });
        }
    } catch (error) {
        console.error('Verwijder error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Verwijderen mislukt',
            details: error.message
        });
    }
});

// NIEUW: Cleanup oude afbeeldingen
app.get('/api/cleanup', async (req, res) => {
    try {
        const data = await readData();
        const files = await fs.readdir(UPLOADS_DIR);
        
        // Verzamel alle gebruikte afbeeldings URLs
        const usedImages = new Set();
        
        data.locations.forEach(loc => {
            if (loc.imageUrl && loc.imageUrl.includes('/uploads/')) {
                const filename = path.basename(loc.imageUrl);
                usedImages.add(filename);
            }
        });
        
        data.equipment.forEach(eq => {
            if (eq.imageUrl && eq.imageUrl.includes('/uploads/')) {
                const filename = path.basename(eq.imageUrl);
                usedImages.add(filename);
            }
        });
        
        // Verwijder ongebruikte afbeeldingen
        const deletedFiles = [];
        
        for (const file of files) {
            if (!usedImages.has(file)) {
                const filePath = path.join(UPLOADS_DIR, file);
                await fs.unlink(filePath);
                deletedFiles.push(file);
                console.log('Verwijderd ongebruikte afbeelding:', file);
            }
        }
        
        res.json({
            success: true,
            message: `Cleanup voltooid. ${deletedFiles.length} bestanden verwijderd.`,
            deletedFiles: deletedFiles,
            totalUsed: usedImages.size,
            totalFound: files.length
        });
        
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Cleanup mislukt',
            details: error.message
        });
    }
});

// GET alle items van een type
app.get('/api/:type', async (req, res) => {
    try {
        console.log(`GET /api/${req.params.type}`);
        const data = await readData();
        const items = data[req.params.type] || [];
        
        console.log(`Aantal ${req.params.type}:`, items.length);
        res.json(items);
    } catch (error) {
        console.error('Error in GET /api/:type:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// GET specifiek item
app.get('/api/:type/:id', async (req, res) => {
    try {
        console.log(`GET /api/${req.params.type}/${req.params.id}`);
        const data = await readData();
        const items = data[req.params.type] || [];
        const item = items.find(i => i.id === req.params.id);
        
        if (!item) {
            console.log('Item niet gevonden:', req.params.id);
            return res.status(404).json({ 
                error: 'Item not found' 
            });
        }
        
        console.log('Item gevonden:', item.name || item.id);
        res.json(item);
    } catch (error) {
        console.error('Error in GET /api/:type/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// POST nieuw item
app.post('/api/:type', async (req, res) => {
    try {
        console.log(`POST /api/${req.params.type} - Body keys:`, Object.keys(req.body));
        
        const data = await readData();
        const newItem = {
            ...req.body,
            id: req.body.id || `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        data[req.params.type] = data[req.params.type] || [];
        data[req.params.type].push(newItem);

        await writeData(data);
        console.log(`Item toegevoegd aan ${req.params.type}:`, {
            id: newItem.id,
            name: newItem.name,
            imageUrl: newItem.imageUrl
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error in POST /api/:type:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// PUT update item
app.put('/api/:type/:id', async (req, res) => {
    try {
        console.log(`PUT /api/${req.params.type}/${req.params.id}`);
        
        const data = await readData();
        const items = data[req.params.type] || [];
        const index = items.findIndex(i => i.id === req.params.id);

        if (index === -1) {
            console.log('Item niet gevonden voor update:', req.params.id);
            return res.status(404).json({ 
                error: 'Item not found' 
            });
        }

        const updatedItem = {
            ...items[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        items[index] = updatedItem;
        data[req.params.type] = items;
        await writeData(data);

        console.log('Item bijgewerkt:', {
            id: updatedItem.id,
            name: updatedItem.name
        });
        res.json(updatedItem);
    } catch (error) {
        console.error('Error in PUT /api/:type/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// DELETE item
app.delete('/api/:type/:id', async (req, res) => {
    try {
        console.log(`DELETE /api/${req.params.type}/${req.params.id}`);
        
        const data = await readData();
        const items = data[req.params.type] || [];
        const filteredItems = items.filter(i => i.id !== req.params.id);

        if (items.length === filteredItems.length) {
            console.log('Item niet gevonden voor verwijdering:', req.params.id);
            return res.status(404).json({ 
                error: 'Item not found' 
            });
        }

        data[req.params.type] = filteredItems;
        await writeData(data);

        console.log(`Item verwijderd uit ${req.params.type}:`, req.params.id);
        res.json({ 
            success: true,
            message: 'Item deleted successfully',
            id: req.params.id
        });
    } catch (error) {
        console.error('Error in DELETE /api/:type/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        endpoints: [
            '/api/locations',
            '/api/equipment',
            '/api/upload',
            '/api/health',
            '/api/info'
        ],
        environment: process.env.NODE_ENV || 'development'
    });
});

// NIEUW: Server info endpoint
app.get('/api/info', async (req, res) => {
    try {
        const data = await readData();
        const files = await fs.readdir(UPLOADS_DIR);
        const protocol = req.protocol;
        const host = req.get('host');
        
        res.json({
            server: {
                uptime: process.uptime(),
                nodeVersion: process.version,
                platform: process.platform,
                environment: process.env.NODE_ENV || 'development',
                port: PORT
            },
            data: {
                locations: data.locations.length,
                equipment: data.equipment.length,
                dataFile: DATA_FILE
            },
            uploads: {
                count: files.length,
                directory: UPLOADS_DIR,
                totalSize: await calculateDirectorySize(UPLOADS_DIR)
            },
            paths: {
                uploadsUrl: `${protocol}://${host}/uploads/`,
                apiBase: `${protocol}://${host}/api/`,
                serverUrl: `${protocol}://${host}`
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper om directory grootte te berekenen
async function calculateDirectorySize(dir) {
    try {
        const files = await fs.readdir(dir);
        let totalSize = 0;
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);
            totalSize += stats.size;
        }
        
        return formatBytes(totalSize);
    } catch (error) {
        return '0 B';
    }
}

// Helper om bytes te formatteren
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 404 handler voor API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Serveer index.html voor root path
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fsSync.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Defensiebrandweer NL API Server</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    h1 { color: #333; }
                    .endpoint { background: #f4f4f4; padding: 10px; margin: 5px 0; border-left: 4px solid #007bff; }
                </style>
            </head>
            <body>
                <h1>🚀 DEFENSIEBRANDWEER NL API SERVER</h1>
                <p>Server is actief op poort: ${PORT}</p>
                <h2>Beschikbare endpoints:</h2>
                <div class="endpoint">GET <a href="/api/health">/api/health</a> - Server status</div>
                <div class="endpoint">GET <a href="/api/info">/api/info</a> - Server informatie</div>
                <div class="endpoint">GET <a href="/api/locations">/api/locations</a> - Alle locaties</div>
                <div class="endpoint">GET <a href="/api/equipment">/api/equipment</a> - Alle materieel</div>
                <p>Gebruik POST /api/upload voor het uploaden van afbeeldingen</p>
            </body>
            </html>
        `);
    }
});

// Start server
app.listen(PORT, () => {
    const serverUrl = `http://localhost:${PORT}`;
    console.log(`
╔══════════════════════════════════════════════════════╗
║        🚀 DEFENSIEBRANDWEER NL API SERVER           ║
╚══════════════════════════════════════════════════════╝
`);
    console.log(`🌐 Server URL:  ${serverUrl}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Data file:   ${DATA_FILE}`);
    console.log(`📸 Uploads dir: ${UPLOADS_DIR}`);
    console.log(`🔧 CORS:        Enabled`);
    console.log(`📊 Belangrijke endpoints:`);
    console.log(`   • GET  ${serverUrl}/api/health     - Server status`);
    console.log(`   • GET  ${serverUrl}/api/info       - Server info`);
    console.log(`   • GET  ${serverUrl}/api/locations  - Locaties`);
    console.log(`   • GET  ${serverUrl}/api/equipment  - Materieel`);
    console.log(`   • POST ${serverUrl}/api/upload     - Upload afbeelding`);
    console.log(`
💡 Tips voor GitHub deployment:
   • Voeg .gitignore toe met: node_modules/, uploads/, data.json
   • Maak package.json klaar voor productie
   • Zorg voor CORS configuratie
`);
    console.log(`──────────────────────────────────────────────`);
});