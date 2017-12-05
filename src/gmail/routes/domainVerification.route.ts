/*Domain Verification -IN google in order to use webhook we should verify domain ownership
by specifing a route that will return an html downloaded from google*/

import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router: express.Router = express.Router();

router.get('/googlebdff09854abfa74b.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'googlebdff09854abfa74b.html'));
})

export default router;