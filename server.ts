import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface ServerInfo {
  name: string;
  ip: string;
  port: number;
}

// In-memory shared state for multi-user sync
let servers: ServerInfo[] = [
  { name: "DZ LEGA", ip: "13.41.225.249", port: 23025 }
];
let hasAddedServer = false; // Tracks if an admin has added any server

let newsContent = "مرحباً بكم في لانشر DZ LEGA V5 الجزائري الرسمي 🇩🇿! ترقبوا افتتاح السيرفر الجديد قريباً.";
let newsReactions: string[] = []; // Array of user IDs/nicknames who reacted with a heart

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // 1. GET current servers
  app.get("/api/servers", (req, res) => {
    res.json({ servers, hasAddedServer });
  });

  // 2. POST add a server (admin only)
  app.post("/api/servers", (req, res) => {
    const { name, ip, port, isAdmin } = req.body;
    if (!isAdmin) {
      return res.status(403).json({ error: "غير مسموح. يجب أن تكون مسؤولاً لإضافة سيرفر." });
    }
    if (!name || !ip || !port) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }
    
    const newServer = { name, ip, port: Number(port) };
    
    if (!hasAddedServer) {
      // First added server - replace the default server
      servers = [newServer];
      hasAddedServer = true;
    } else {
      // Append if we already have other added servers
      servers.push(newServer);
    }
    
    res.json({ success: true, servers, hasAddedServer });
  });

  // 3. POST delete server (admin only)
  app.post("/api/servers/delete", (req, res) => {
    const { index, isAdmin } = req.body;
    if (!isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (typeof index !== "number" || index < 0 || index >= servers.length) {
      return res.status(400).json({ error: "Invalid index" });
    }
    
    servers.splice(index, 1);
    
    // If we delete all added servers, fallback to default server and reset the flag
    if (servers.length === 0) {
      servers = [{ name: "DZ LEGA", ip: "13.41.225.249", port: 23025 }];
      hasAddedServer = false;
    }
    
    res.json({ success: true, servers, hasAddedServer });
  });

  // 4. GET news
  app.get("/api/news", (req, res) => {
    res.json({ content: newsContent, reactions: newsReactions });
  });

  // 5. POST update news (admin only)
  app.post("/api/news", (req, res) => {
    const { content, isAdmin } = req.body;
    if (!isAdmin) {
      return res.status(403).json({ error: "غير مسموح. يجب أن تكون مسؤولاً لكتابة الأخبار." });
    }
    newsContent = content;
    // reset reactions on a new news update
    newsReactions = [];
    res.json({ success: true, content: newsContent, reactions: newsReactions });
  });

  // 6. POST toggle heart reaction on news
  app.post("/api/news/react", (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "معرف اللاعب مطلوب" });
    }
    const idx = newsReactions.indexOf(userId);
    if (idx > -1) {
      // remove reaction
      newsReactions.splice(idx, 1);
    } else {
      // add reaction
      newsReactions.push(userId);
    }
    res.json({ success: true, reactions: newsReactions });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
