#!/usr/bin/env node

import { ServerManager } from './managers/ServerManager.js';

// Start server
const serverManager = ServerManager.getInstance();
serverManager.start();