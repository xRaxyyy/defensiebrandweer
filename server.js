const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
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
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serveer alle bestanden
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper functies
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('Data file niet gevonden, maak nieuwe aan...');
        const initialData = {
            locations: [],
            equipment: [],
            settings: {
                siteTitle: "DEFENSIEBRANDWEER NL",
                siteDescription: "Database van militaire brandweerkazernes en materieel"
            }
        };
        await writeData(initialData);
        return initialData;
    }
}

async function writeData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data file:', error);
        throw error;
    }
}

// ==================== UPLOAD ENDPOINTS ====================

// Upload afbeelding
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'Geen bestand geüpload' 
            });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        
        console.log('Afbeelding geüpload:', req.file.filename);
        
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

// Verwijder afbeelding
app.delete('/api/upload/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(UPLOADS_DIR, filename);
        
        if (fsSync.existsSync(filePath)) {
            await fs.unlink(filePath);
            console.log('Afbeelding verwijderd:', filename);
            
            // Verwijder ook uit data.json als deze gebruikt wordt
            const data = await readData();
            let updated = false;
            
            // Check in locations
            data.locations = data.locations.map(location => {
                if (location.imageUrl && location.imageUrl.includes(filename)) {
                    location.imageUrl = '';
                    updated = true;
                }
                return location;
            });
            
            // Check in equipment
            data.equipment = data.equipment.map(item => {
                if (item.imageUrl && item.imageUrl.includes(filename)) {
                    item.imageUrl = '';
                    updated = true;
                }
                return item;
            });
            
            if (updated) {
                await writeData(data);
            }
            
            res.json({ 
                success: true, 
                message: 'Afbeelding verwijderd',
                filename: filename
            });
        } else {
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

// Cleanup ongebruikte afbeeldingen
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

// ==================== LOCATIES ENDPOINTS ====================

// GET alle locaties
app.get('/api/locations', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.locations || []);
    } catch (error) {
        console.error('Error in GET /api/locations:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// GET specifieke locatie
app.get('/api/locations/:id', async (req, res) => {
    try {
        const data = await readData();
        const location = data.locations.find(l => l.id === req.params.id);
        
        if (!location) {
            return res.status(404).json({ 
                error: 'Locatie niet gevonden' 
            });
        }
        
        res.json(location);
    } catch (error) {
        console.error('Error in GET /api/locations/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// POST nieuwe locatie
app.post('/api/locations', async (req, res) => {
    try {
        const data = await readData();
        const newLocation = {
            ...req.body,
            id: req.body.id || `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (!data.locations) data.locations = [];
        data.locations.push(newLocation);
        
        await writeData(data);
        
        console.log('Nieuwe locatie toegevoegd:', newLocation.name);
        res.status(201).json(newLocation);
    } catch (error) {
        console.error('Error in POST /api/locations:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// PUT update locatie
app.put('/api/locations/:id', async (req, res) => {
    try {
        const data = await readData();
        const index = data.locations.findIndex(l => l.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ 
                error: 'Locatie niet gevonden' 
            });
        }
        
        data.locations[index] = {
            ...data.locations[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeData(data);
        
        console.log('Locatie bijgewerkt:', data.locations[index].name);
        res.json(data.locations[index]);
    } catch (error) {
        console.error('Error in PUT /api/locations/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// DELETE locatie
app.delete('/api/locations/:id', async (req, res) => {
    try {
        const data = await readData();
        const filtered = data.locations.filter(l => l.id !== req.params.id);
        
        if (filtered.length === data.locations.length) {
            return res.status(404).json({ 
                error: 'Locatie niet gevonden' 
            });
        }
        
        const deletedLocation = data.locations.find(l => l.id === req.params.id);
        data.locations = filtered;
        
        await writeData(data);
        
        console.log('Locatie verwijderd:', deletedLocation?.name || req.params.id);
        res.json({ 
            success: true, 
            message: 'Locatie verwijderd',
            id: req.params.id 
        });
    } catch (error) {
        console.error('Error in DELETE /api/locations/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// ==================== EQUIPMENT ENDPOINTS ====================

// GET alle equipment
app.get('/api/equipment', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.equipment || []);
    } catch (error) {
        console.error('Error in GET /api/equipment:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// GET specifiek equipment
app.get('/api/equipment/:id', async (req, res) => {
    try {
        const data = await readData();
        const equipment = data.equipment.find(e => e.id === req.params.id);
        
        if (!equipment) {
            return res.status(404).json({ 
                error: 'Materieel niet gevonden' 
            });
        }
        
        res.json(equipment);
    } catch (error) {
        console.error('Error in GET /api/equipment/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// POST nieuw equipment
app.post('/api/equipment', async (req, res) => {
    try {
        const data = await readData();
        const newEquipment = {
            ...req.body,
            id: req.body.id || `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (!data.equipment) data.equipment = [];
        data.equipment.push(newEquipment);
        
        await writeData(data);
        
        console.log('Nieuw materieel toegevoegd:', newEquipment.name);
        res.status(201).json(newEquipment);
    } catch (error) {
        console.error('Error in POST /api/equipment:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// PUT update equipment
app.put('/api/equipment/:id', async (req, res) => {
    try {
        const data = await readData();
        const index = data.equipment.findIndex(e => e.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ 
                error: 'Materieel niet gevonden' 
            });
        }
        
        data.equipment[index] = {
            ...data.equipment[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeData(data);
        
        console.log('Materieel bijgewerkt:', data.equipment[index].name);
        res.json(data.equipment[index]);
    } catch (error) {
        console.error('Error in PUT /api/equipment/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// DELETE equipment
app.delete('/api/equipment/:id', async (req, res) => {
    try {
        const data = await readData();
        const filtered = data.equipment.filter(e => e.id !== req.params.id);
        
        if (filtered.length === data.equipment.length) {
            return res.status(404).json({ 
                error: 'Materieel niet gevonden' 
            });
        }
        
        const deletedEquipment = data.equipment.find(e => e.id === req.params.id);
        data.equipment = filtered;
        
        await writeData(data);
        
        console.log('Materieel verwijderd:', deletedEquipment?.name || req.params.id);
        res.json({ 
            success: true, 
            message: 'Materieel verwijderd',
            id: req.params.id 
        });
    } catch (error) {
        console.error('Error in DELETE /api/equipment/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// ==================== GENERIC ENDPOINTS (voor dashboard) ====================

// Generic GET endpoint voor elk type
app.get('/api/:type', async (req, res) => {
    try {
        const data = await readData();
        const items = data[req.params.type] || [];
        res.json(items);
    } catch (error) {
        console.error('Error in GET /api/:type:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// Generic GET specifiek item
app.get('/api/:type/:id', async (req, res) => {
    try {
        const data = await readData();
        const items = data[req.params.type] || [];
        const item = items.find(i => i.id === req.params.id);
        
        if (!item) {
            return res.status(404).json({ 
                error: 'Item not found' 
            });
        }
        
        res.json(item);
    } catch (error) {
        console.error('Error in GET /api/:type/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// Generic POST endpoint
app.post('/api/:type', async (req, res) => {
    try {
        const data = await readData();
        const newItem = {
            ...req.body,
            id: req.body.id || `${req.params.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        data[req.params.type] = data[req.params.type] || [];
        data[req.params.type].push(newItem);

        await writeData(data);
        console.log(`Item toegevoegd aan ${req.params.type}:`, newItem.id);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error in POST /api/:type:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// Generic PUT endpoint
app.put('/api/:type/:id', async (req, res) => {
    try {
        const data = await readData();
        const items = data[req.params.type] || [];
        const index = items.findIndex(i => i.id === req.params.id);

        if (index === -1) {
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

        console.log('Item bijgewerkt:', updatedItem.id);
        res.json(updatedItem);
    } catch (error) {
        console.error('Error in PUT /api/:type/:id:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// Generic DELETE endpoint
app.delete('/api/:type/:id', async (req, res) => {
    try {
        const data = await readData();
        const items = data[req.params.type] || [];
        const filteredItems = items.filter(i => i.id !== req.params.id);

        if (items.length === filteredItems.length) {
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

// ==================== SETTINGS ENDPOINTS ====================

// GET settings
app.get('/api/settings', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.settings || {});
    } catch (error) {
        console.error('Error in GET /api/settings:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// UPDATE settings
app.put('/api/settings', async (req, res) => {
    try {
        const data = await readData();
        data.settings = {
            ...data.settings,
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeData(data);
        
        console.log('Settings bijgewerkt');
        res.json(data.settings);
    } catch (error) {
        console.error('Error in PUT /api/settings:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// ==================== STATISTICS ENDPOINTS ====================

// GET statistics
app.get('/api/stats', async (req, res) => {
    try {
        const data = await readData();
        const files = await fs.readdir(UPLOADS_DIR);
        
        const stats = {
            locations: {
                total: data.locations?.length || 0,
                active: data.locations?.filter(l => l.yearTo === 'Heden').length || 0,
                historical: data.locations?.filter(l => l.yearTo !== 'Heden').length || 0
            },
            equipment: {
                total: data.equipment?.length || 0,
                byCategory: {}
            },
            images: {
                total: files.length,
                totalSize: await calculateDirectorySize(UPLOADS_DIR)
            },
            lastUpdated: new Date().toISOString()
        };

        // Categorieën tellen voor equipment
        if (data.equipment) {
            data.equipment.forEach(item => {
                const category = item.category || 'Onbekend';
                stats.equipment.byCategory[category] = (stats.equipment.byCategory[category] || 0) + 1;
            });
        }

        res.json(stats);
    } catch (error) {
        console.error('Error in GET /api/stats:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
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

// ==================== SEARCH ENDPOINTS ====================

// Zoek in alle data
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const data = await readData();
        
        const results = {
            locations: [],
            equipment: []
        };

        if (query) {
            const searchTerm = query.toLowerCase();
            
            // Zoek in locaties
            if (data.locations) {
                results.locations = data.locations.filter(loc => 
                    loc.name?.toLowerCase().includes(searchTerm) ||
                    loc.city?.toLowerCase().includes(searchTerm) ||
                    loc.type?.toLowerCase().includes(searchTerm) ||
                    loc.description?.toLowerCase().includes(searchTerm)
                );
            }
            
            // Zoek in equipment
            if (data.equipment) {
                results.equipment = data.equipment.filter(eq => 
                    eq.name?.toLowerCase().includes(searchTerm) ||
                    eq.category?.toLowerCase().includes(searchTerm) ||
                    eq.description?.toLowerCase().includes(searchTerm)
                );
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Error in GET /api/search:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// ==================== HEALTH & INFO ENDPOINTS ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: [
            '/api/locations',
            '/api/equipment',
            '/api/upload',
            '/api/settings',
            '/api/stats',
            '/api/search',
            '/api/health',
            '/api/info'
        ]
    });
});

// Server info
app.get('/api/info', async (req, res) => {
    try {
        const data = await readData();
        const files = await fs.readdir(UPLOADS_DIR);
        
        res.json({
            server: {
                uptime: process.uptime(),
                nodeVersion: process.version,
                platform: process.platform,
                environment: process.env.NODE_ENV || 'development',
                port: PORT
            },
            data: {
                locations: data.locations?.length || 0,
                equipment: data.equipment?.length || 0,
                dataFile: DATA_FILE,
                lastModified: fsSync.existsSync(DATA_FILE) ? 
                    fsSync.statSync(DATA_FILE).mtime : null
            },
            uploads: {
                count: files.length,
                directory: UPLOADS_DIR,
                totalSize: await calculateDirectorySize(UPLOADS_DIR)
            },
            api: {
                baseUrl: `http://localhost:${PORT}/api`,
                uploadsUrl: `http://localhost:${PORT}/uploads`
            }
        });
    } catch (error) {
        console.error('Error in GET /api/info:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// ==================== BACKUP & RESTORE ====================

// Maak backup
app.get('/api/backup', async (req, res) => {
    try {
        const data = await readData();
        const backupDir = path.join(__dirname, 'backups');
        
        if (!fsSync.existsSync(backupDir)) {
            fsSync.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
        
        await fs.writeFile(backupFile, JSON.stringify(data, null, 2));
        
        res.json({
            success: true,
            message: 'Backup gemaakt',
            file: backupFile,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in GET /api/backup:', error);
        res.status(500).json({ 
            error: 'Backup mislukt', 
            details: error.message 
        });
    }
});

// Lijst backups
app.get('/api/backups', async (req, res) => {
    try {
        const backupDir = path.join(__dirname, 'backups');
        
        if (!fsSync.existsSync(backupDir)) {
            return res.json([]);
        }
        
        const files = await fs.readdir(backupDir);
        const backups = [];
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(backupDir, file);
                const stats = await fs.stat(filePath);
                backups.push({
                    filename: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                });
            }
        }
        
        res.json(backups);
    } catch (error) {
        console.error('Error in GET /api/backups:', error);
        res.status(500).json({ 
            error: 'Kon backups niet laden', 
            details: error.message 
        });
    }
});

// ==================== ERROR HANDLING ====================

// 404 handler voor API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message
    });
});

// ==================== START SERVER ====================

// Serveer index.html voor root
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
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
                <div class="endpoint">POST <a href="#">/api/upload</a> - Upload afbeelding</div>
                <div class="endpoint">GET <a href="/api/stats">/api/stats</a> - Statistieken</div>
                <div class="endpoint">GET <a href="/api/settings">/api/settings</a> - Instellingen</div>
            </body>
            </html>
        `);
    }
});

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
    console.log(`📊 Belangrijke endpoints:`);
    console.log(`   • GET  ${serverUrl}/api/health     - Server status`);
    console.log(`   • GET  ${serverUrl}/api/info       - Server info`);
    console.log(`   • GET  ${serverUrl}/api/locations  - Locaties (${serverUrl}/api/locations)`);
    console.log(`   • GET  ${serverUrl}/api/equipment  - Materieel (${serverUrl}/api/equipment)`);
    console.log(`   • POST ${serverUrl}/api/upload     - Upload afbeelding`);
    console.log(`   • GET  ${serverUrl}/api/stats      - Statistieken`);
    console.log(`   • GET  ${serverUrl}/api/settings   - Instellingen`);
    console.log(`
💡 Tips:
   • Voeg data toe via ${serverUrl}/dashboard.html
   • Bekijk locaties op ${serverUrl}/locaties.html
   • Bekijk materieel op ${serverUrl}/equipment.html
`);
    console.log(`──────────────────────────────────────────────`);
});