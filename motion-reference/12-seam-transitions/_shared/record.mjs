import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lookup as mimeLookup } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../.."); // motion-options-2026-11-12
const SEAM = path.resolve(__dirname, "..");
const W = 1440;
const H = 810;

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".woff2": "font/woff2",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
    }[ext] || "application/octet-stream"
  );
}

async function serve(root, port) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith("/")) rel += "index.html";
      const file = path.join(root, rel);
      if (!file.startsWith(root)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const data = await fs.readFile(file);
      res.writeHead(200, { "Content-Type": contentType(file), "Cache-Control": "no-store" });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  await new Promise((r) => server.listen(port, "127.0.0.1", r));
  return server;
}

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(err.slice(-800)))));
  });
}

async function listOptions() {
  const only = process.argv.slice(2);
  const pairs = (await fs.readdir(SEAM)).filter((n) => /^\d{2}[A-C]-\d{2}[A-C]$/.test(n)).sort();
  const out = [];
  for (const pair of pairs) {
    const opts = (await fs.readdir(path.join(SEAM, pair))).sort();
    for (const opt of opts) {
      const dir = path.join(SEAM, pair, opt);
      const html = path.join(dir, "index.html");
      try {
        await fs.access(html);
      } catch {
        continue;
      }
      const id = `${pair}/${opt}`;
      if (only.length && !only.some((s) => id.includes(s))) continue;
      out.push({ pair, opt, dir, url: `/12-seam-transitions/${pair}/${opt}/index.html?record=1` });
    }
  }
  return out;
}

async function main() {
  const jobs = await listOptions();
  if (!jobs.length) {
    console.error("no prototypes found");
    process.exit(1);
  }
  const port = 8765;
  const server = await serve(ROOT, port);
  const browser = await chromium.launch({
    headless: true,
    args: ["--autoplay-policy=no-user-gesture-required", "--disable-dev-shm-usage"],
  });
  const logs = path.join(ROOT, "_video-work/logs");
  await fs.mkdir(logs, { recursive: true });
  const failed = [];
  for (const job of jobs) {
    const tmp = path.join(job.dir, "_rec");
    await fs.rm(tmp, { recursive: true, force: true });
    await fs.mkdir(tmp, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: W, height: H },
      deviceScaleFactor: 1,
      recordVideo: { dir: tmp, size: { width: W, height: H } },
    });
    const page = await context.newPage();
    const dest = path.join(job.dir, "clip.mp4");
    try {
      await page.goto(`http://127.0.0.1:${port}${job.url}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForFunction(() => window.__PROTO_READY__ === true, null, { timeout: 15000 });
      await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        const imgs = [...document.images];
        await Promise.all(
          imgs.map((img) =>
            img.complete && img.naturalWidth
              ? null
              : new Promise((res) => {
                  img.addEventListener("load", res, { once: true });
                  img.addEventListener("error", res, { once: true });
                })
          )
        );
      });
      await page.waitForTimeout(200);
      await page.evaluate(() => window.__START_RECORD__());
      await page.waitForFunction(() => window.__PROTO_DONE__, null, { timeout: 20000 });
      // let the last frame settle into the video
      await page.waitForTimeout(200);
      await context.close();
      const files = (await fs.readdir(tmp)).filter((f) => f.endsWith(".webm"));
      if (!files.length) throw new Error("no webm recorded");
      const webm = path.join(tmp, files[0]);
      const raw = path.join(job.dir, "clip-raw.webm");
      await fs.rename(webm, raw);
      await ffmpeg([
        "-y",
        "-i",
        raw,
        "-an",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-crf",
        "18",
        dest,
      ]);
      await fs.rm(raw, { force: true });
      await fs.rm(tmp, { recursive: true, force: true });
      const st = await fs.stat(dest);
      console.log("OK", job.pair + "/" + job.opt, Math.round(st.size / 1024) + "k");
    } catch (err) {
      failed.push(job.pair + "/" + job.opt + ": " + err.message);
      console.error("FAIL", job.pair + "/" + job.opt, err.message);
      try {
        await context.close();
      } catch {}
    }
  }
  await browser.close();
  server.close();
  if (failed.length) {
    console.error("\nFailed:", failed.length);
    failed.forEach((f) => console.error(" ", f));
    process.exit(2);
  }
  console.log("done", jobs.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
