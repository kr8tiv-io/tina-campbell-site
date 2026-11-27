#!/usr/bin/env python3
"""Staging release checks 1-6 against a production site/dist.

Does not modify the build. Writes checks.json and weight-table.md next to itself.
Exit 0 when checks 1-6 pass. Check 6 fails when any route's first view exceeds 2.5 MiB.
"""

from __future__ import annotations

import gzip
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urldefrag, urljoin, urlparse

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "site" / "dist"
PUBLIC = ROOT / "site" / "public"
MANIFEST = PUBLIC / "media" / "scenes" / "manifest.json"
OUT_DIR = Path(__file__).resolve().parent
LIMIT = int(2.5 * 1024 * 1024)
SITE_HOSTS = {
    "lightsteelblue-lark-427091.hostingersite.com",
    "127.0.0.1",
    "localhost",
}
TEXT_SUFFIXES = {
    ".html",
    ".css",
    ".js",
    ".mjs",
    ".txt",
    ".xml",
    ".json",
    ".svg",
    ".map",
    ".htaccess",
}
IMAGE_SUFFIXES = {".avif", ".webp", ".jpg", ".jpeg", ".png", ".gif", ".svg"}
FONT_SUFFIXES = {".woff", ".woff2", ".ttf", ".otf"}
SKIP_SCHEMES = ("mailto:", "tel:", "sms:", "javascript:", "data:", "blob:")
JOURNAL_SLUGS = {
    "bridal-portraits-edmonton",
    "edmonton-photoshoot-locations",
    "engagement-photos-edmonton",
    "model-portfolio-alberta",
    "what-to-wear-photoshoot",
}
SERIES_SLUGS = {
    "the-red-gown",
    "legislature-in-black",
    "red-in-snow",
    "runway-nights",
    "blue-hour",
}


def gz_len(data: bytes) -> int:
    return len(gzip.compress(data, compresslevel=9, mtime=0))


def module_closure(roots: set[Path]) -> set[Path]:
    """Follow static ESM imports so a modulepreload-less entry still counts its chunks."""
    seen: set[Path] = set()
    stack = list(roots)
    while stack:
        path = stack.pop()
        if path in seen or not path.is_file():
            continue
        seen.add(path)
        if path.suffix != ".js":
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for rel in re.findall(r'from"(\./[^"]+\.js)"', text):
            stack.append((path.parent / rel).resolve())
    return seen


def route_for(path: Path) -> str | None:
    rel = path.relative_to(DIST)
    if path.name == "404.html" and path.parent == DIST:
        return "/404.html"
    if path.name == "index.html":
        parent = rel.parent.as_posix()
        return "/" if parent == "." else f"/{parent}/"
    return "/" + rel.as_posix()


def is_internal(raw: str) -> bool:
    if not raw or raw.startswith(SKIP_SCHEMES) or raw.startswith("#"):
        return False
    if raw.startswith("//"):
        host = urlparse("https:" + raw).hostname
        return host in SITE_HOSTS
    if raw.startswith(("http://", "https://")):
        return urlparse(raw).hostname in SITE_HOSTS
    return True


def split_target(page_route: str, raw: str) -> tuple[str, str] | None:
    """Return (absolute path, fragment) for an internal URL, or None if external/skip."""
    raw = raw.strip()
    if not raw or raw.startswith(SKIP_SCHEMES):
        return None
    if raw.startswith("#"):
        base = page_route if page_route.endswith("/") or page_route.endswith(".html") else page_route
        return base, raw[1:]
    if not is_internal(raw):
        return None
    if raw.startswith("//"):
        raw = "https:" + raw
    if raw.startswith(("http://", "https://")):
        parsed = urlparse(raw)
        path = unquote(parsed.path or "/")
        return path, parsed.fragment
    # Root-relative or document-relative. Pages live at trailing-slash routes.
    base = page_route
    if not base.endswith("/") and not base.endswith(".html"):
        base = base + "/"
    joined = urljoin(base, raw)
    path, frag = urldefrag(joined)
    parsed = urlparse(path)
    return unquote(parsed.path or "/"), frag


def file_for(url_path: str) -> Path | None:
    if url_path in ("", "/"):
        candidate = DIST / "index.html"
        return candidate if candidate.is_file() else None
    rel = url_path.lstrip("/")
    direct = DIST / rel
    if direct.is_file():
        return direct
    if direct.is_dir() and (direct / "index.html").is_file():
        return direct / "index.html"
    index = DIST / rel / "index.html"
    if index.is_file():
        return index
    # /404.html is the file; /foo.html without a directory is already direct.
    return None


def media_matches(query: str, viewport: int) -> bool:
    query = query.strip()
    if not query:
        return True
    if "prefers-reduced-motion" in query:
        return False
    parts = re.split(r"\s+and\s+", query, flags=re.I)
    for part in parts:
        part = part.strip().strip("()")
        max_w = re.search(r"max-width:\s*([\d.]+)px", part)
        min_w = re.search(r"min-width:\s*([\d.]+)px", part)
        if max_w and viewport > float(max_w.group(1)):
            return False
        if min_w and viewport < float(min_w.group(1)):
            return False
    return True


def length_px(length: str, viewport: int) -> float:
    length = length.strip()
    if length.endswith("vw"):
        return viewport * float(length[:-2]) / 100
    if length.endswith("px"):
        return float(length[:-2])
    if length.endswith("rem"):
        return float(length[:-3]) * 16
    if length.endswith("em"):
        return float(length[:-2]) * 16
    return float(viewport)


def slot_px(sizes: str | None, viewport: int) -> float:
    if not sizes:
        return float(viewport)
    for part in sizes.split(","):
        part = part.strip()
        if not part:
            continue
        matched = re.match(r"^\((.+)\)\s+(.+)$", part)
        if matched:
            if media_matches(matched.group(1), viewport):
                return length_px(matched.group(2), viewport)
            continue
        return length_px(part, viewport)
    return float(viewport)


def pick_srcset(srcset: str, slot: float) -> str | None:
    cands: list[tuple[float, str]] = []
    for part in srcset.split(","):
        bits = part.strip().split()
        if not bits:
            continue
        url = bits[0]
        desc = bits[1] if len(bits) > 1 else "1x"
        if desc.endswith("w"):
            width = float(desc[:-1])
        elif desc.endswith("x"):
            width = float(desc[:-1]) * slot
        else:
            width = slot
        cands.append((width, url))
    if not cands:
        return None
    cands.sort(key=lambda item: item[0])
    for width, url in cands:
        if width >= slot - 0.5:
            return url
    return cands[-1][1]


def choose_image(sources: list[dict[str, str]], img: dict[str, str], viewport: int = 1440) -> str | None:
    """One URL Chrome would fetch: AVIF, then WebP, then the img, honoring media and sizes."""
    ordered = list(sources)
    # Prefer modern formats when several sources match.
    def rank(source: dict[str, str]) -> int:
        typ = source.get("type", "")
        if "avif" in typ:
            return 0
        if "webp" in typ:
            return 1
        return 2

    matching = []
    for source in ordered:
        media = source.get("media", "")
        if media and not media_matches(media, viewport):
            continue
        if source.get("srcset") or source.get("src"):
            matching.append(source)
    matching.sort(key=rank)
    for source in matching:
        srcset = source.get("srcset") or ""
        if srcset:
            slot = slot_px(source.get("sizes") or img.get("sizes"), viewport)
            picked = pick_srcset(srcset, slot)
            if picked:
                return picked
        if source.get("src"):
            return source["src"]
    if img.get("srcset"):
        slot = slot_px(img.get("sizes"), viewport)
        picked = pick_srcset(img["srcset"], slot)
        if picked:
            return picked
    return img.get("src")


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.in_title = False
        self.description = ""
        self.robots = ""
        self.h1 = 0
        self.ids: set[str] = set()
        self.attrs: list[tuple[str, str]] = []  # (kind, raw url) kind is href|src|srcset|poster
        self.css: list[str] = []
        self.js: list[str] = []
        self.fonts: list[str] = []
        self.preloads: list[str] = []
        self.pictures: list[tuple[list[dict[str, str]], dict[str, str]]] = []
        self.posters: list[str] = []
        self._picture: list[dict[str, str]] | None = None
        self.book = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {key: value or "" for key, value in attrs}
        if attr.get("id"):
            self.ids.add(attr["id"])
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self.in_title = True
        if tag == "meta" and attr.get("name", "").lower() == "description":
            self.description = attr.get("content", "")
        if tag == "meta" and attr.get("name", "").lower() == "robots":
            self.robots = attr.get("content", "")
        if tag == "picture":
            self._picture = []
        if tag == "source" and self._picture is not None:
            self._picture.append(attr)
            if attr.get("srcset"):
                self.attrs.append(("srcset", attr["srcset"]))
            if attr.get("src"):
                self.attrs.append(("src", attr["src"]))
        if tag == "img":
            sources = self._picture or []
            self._picture = None
            loading = attr.get("loading", "").lower()
            if loading != "lazy":
                self.pictures.append((sources, attr))
            if attr.get("src"):
                self.attrs.append(("src", attr["src"]))
            if attr.get("srcset"):
                self.attrs.append(("srcset", attr["srcset"]))
        if tag == "video" and attr.get("poster"):
            self.posters.append(attr["poster"])
            self.attrs.append(("poster", attr["poster"]))
        if tag == "script" and attr.get("src"):
            self.js.append(attr["src"])
            self.attrs.append(("src", attr["src"]))
        if tag == "link":
            rel = set(attr.get("rel", "").lower().split())
            href = attr.get("href", "")
            if href:
                self.attrs.append(("href", href))
            if "stylesheet" in rel and href:
                self.css.append(href)
            if href and ("modulepreload" in rel or ("preload" in rel and attr.get("as") == "script")):
                self.js.append(href)
            if href and "preload" in rel and attr.get("as") == "font":
                self.fonts.append(href)
            if href and "preload" in rel and attr.get("as") == "image":
                self.preloads.append(href)
        if tag == "a":
            href = attr.get("href", "")
            if href:
                self.attrs.append(("href", href))
                target = split_target("/", href)
                if target and target[0].rstrip("/").endswith("/book") or (
                    target and target[0].rstrip("/") == "/book"
                ):
                    self.book = True
        if tag in {"area", "iframe", "embed", "audio", "track", "object"}:
            for key in ("href", "src", "poster", "data"):
                if attr.get(key):
                    self.attrs.append((key, attr[key]))

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        if tag == "picture":
            self._picture = None

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)

    @property
    def title(self) -> str:
        return re.sub(r"\s+", " ", "".join(self.title_parts)).strip()


def parse_page(path: Path) -> PageParser:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    return parser


def iter_srcset(value: str) -> list[str]:
    urls = []
    for part in value.split(","):
        bits = part.strip().split()
        if bits:
            urls.append(bits[0])
    return urls


def css_urls(text: str) -> list[str]:
    found = []
    for match in re.finditer(r"url\(\s*(['\"]?)([^)'\"]+)\1\s*\)", text):
        found.append(match.group(2).strip())
    return found


def check_motion_lab() -> list[str]:
    hits: list[str] = []
    if not DIST.exists():
        return ["dist missing"]
    for path in DIST.rglob("*"):
        rel = path.relative_to(DIST).as_posix()
        if "motion-lab" in rel:
            hits.append(rel)
            continue
        if path.is_file() and (path.suffix.lower() in TEXT_SUFFIXES or path.name == ".htaccess"):
            try:
                data = path.read_bytes()
            except OSError:
                continue
            if b"motion-lab" in data:
                hits.append(rel + " (content)")
    return hits


def expected_routes() -> set[str]:
    routes = {
        "/",
        "/about/",
        "/book/",
        "/fashion-editorial/",
        "/journal/",
        "/portraits-bridal-couples/",
        "/runway/",
        "/services/",
        "/work/",
    }
    routes.update(f"/journal/{slug}/" for slug in JOURNAL_SLUGS)
    routes.update(f"/series/{slug}/" for slug in SERIES_SLUGS)
    return routes


def sitemap_locs() -> tuple[list[str], list[str]]:
    """Return (page locs from urlsets, index locs that must be files in dist)."""
    pages: list[str] = []
    index: list[str] = []
    for path in sorted(DIST.glob("sitemap*.xml")):
        text = path.read_text(encoding="utf-8", errors="replace")
        if "<sitemapindex" in text:
            index.extend(re.findall(r"<loc>\s*([^<]+?)\s*</loc>", text))
        else:
            pages.extend(re.findall(r"<loc>\s*([^<]+?)\s*</loc>", text))
    return pages, index


def loc_path(loc: str) -> str:
    parsed = urlparse(loc.strip())
    path = unquote(parsed.path or "/")
    if path != "/" and not path.endswith("/") and not Path(path).suffix:
        path += "/"
    return path


def rss_item_links() -> list[str]:
    rss = DIST / "rss.xml"
    if not rss.is_file():
        return []
    text = rss.read_text(encoding="utf-8", errors="replace")
    items = re.findall(r"<item>(.*?)</item>", text, flags=re.S)
    links = []
    for item in items:
        match = re.search(r"<link>\s*([^<]+?)\s*</link>", item)
        if match:
            links.append(loc_path(match.group(1)))
    return links


def scene_files() -> tuple[list[str], list[str]]:
    """Return (problems, notes). Listed poster, end still and sources must exist and be non-empty."""
    problems: list[str] = []
    notes: list[str] = []
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    scenes = manifest["scenes"]
    for sid, spec in scenes.items():
        rels: list[str] = []
        for group in ("poster", "end"):
            block = spec.get(group) or {}
            for key in ("webp", "jpg"):
                if key not in block:
                    problems.append(f"{sid} {group}.{key} missing from manifest")
                else:
                    rels.append(block[key])
        for name, rel in (spec.get("sources") or {}).items():
            rels.append(rel)
            if sid == "01A" and name == "h264_720" and rel.endswith("01A-1080.mp4"):
                notes.append(
                    "01A h264_720 is listed as /media/scenes/01A/01A-1080.mp4 (manifest alias, not edited)."
                )
        rels.append("/media/scenes/manifest.json")
        for rel in rels:
            rel_path = rel.lstrip("/")
            for base, label in ((PUBLIC, "public"), (DIST, "dist")):
                path = base / rel_path
                if not path.is_file():
                    problems.append(f"{label} missing {rel}")
                elif path.stat().st_size <= 0:
                    problems.append(f"{label} empty {rel}")
    # de-dupe manifest notes
    notes = list(dict.fromkeys(notes))
    problems = list(dict.fromkeys(problems))
    return problems, notes


def main() -> int:
    if not DIST.is_dir():
        print("dist missing", file=sys.stderr)
        return 1

    html_paths = sorted(DIST.rglob("*.html"))
    pages: dict[str, PageParser] = {}
    ids_by_route: dict[str, set[str]] = {}
    for path in html_paths:
        route = route_for(path)
        if route is None:
            continue
        parser = parse_page(path)
        pages[route] = parser
        ids_by_route[route] = parser.ids

    # --- check 1 ---
    noindex_miss = []
    for path in html_paths:
        text = path.read_text(encoding="utf-8", errors="replace")
        if 'name="robots" content="noindex' not in text:
            noindex_miss.append(path.relative_to(DIST).as_posix())
    robots = (DIST / "robots.txt").read_text(encoding="utf-8") if (DIST / "robots.txt").is_file() else ""
    htaccess = (DIST / ".htaccess").read_text(encoding="utf-8") if (DIST / ".htaccess").is_file() else ""
    check1 = {
        "html_pages": len(html_paths),
        "missing_noindex": noindex_miss,
        "robots_disallow": "Disallow: /" in robots,
        "htaccess_robots_tag": 'X-Robots-Tag "noindex, nofollow"' in htaccess,
    }
    check1_ok = not noindex_miss and check1["robots_disallow"] and check1["htaccess_robots_tag"]

    # --- check 2 ---
    lab_hits = check_motion_lab()
    locs, index_locs = sitemap_locs()
    loc_paths = [loc_path(item) for item in locs]
    index_paths = [loc_path(item) for item in index_locs]
    index_missing = [path for path in index_paths if file_for(path) is None]
    real = expected_routes()
    built_routes = {route for route in pages if route != "/404.html"}
    sitemap_extra = sorted(set(loc_paths) - real)
    sitemap_missing = sorted(real - set(loc_paths))
    sitemap_not_built = sorted(set(loc_paths) - built_routes)
    rss_links = rss_item_links()
    journal_routes = {f"/journal/{slug}/" for slug in JOURNAL_SLUGS}
    rss_extra = sorted(set(rss_links) - journal_routes)
    rss_missing = sorted(journal_routes - set(rss_links))
    check2 = {
        "motion_lab_hits": lab_hits,
        "sitemap_files": [path.name for path in sorted(DIST.glob("sitemap*.xml"))],
        "sitemap_count": len(loc_paths),
        "sitemap_index": index_paths,
        "sitemap_index_missing": index_missing,
        "sitemap_extra": sitemap_extra,
        "sitemap_missing": sitemap_missing,
        "sitemap_not_built": sitemap_not_built,
        "rss_count": len(rss_links),
        "rss_extra": rss_extra,
        "rss_missing": rss_missing,
        "built_routes": sorted(built_routes),
    }
    check2_ok = (
        not lab_hits
        and not sitemap_extra
        and not sitemap_missing
        and not sitemap_not_built
        and not rss_extra
        and not rss_missing
        and not index_missing
        and (DIST / "rss.xml").is_file()
    )

    # --- check 3 ---
    h1_bad = []
    title_missing = []
    desc_missing = []
    titles: dict[str, list[str]] = {}
    descs: dict[str, list[str]] = {}
    for route, parser in pages.items():
        if parser.h1 != 1:
            h1_bad.append({"route": route, "h1": parser.h1})
        title = parser.title
        desc = parser.description.strip()
        if not title:
            title_missing.append(route)
        else:
            titles.setdefault(title, []).append(route)
        if not desc:
            desc_missing.append(route)
        else:
            descs.setdefault(desc, []).append(route)
    dup_titles = {title: routes for title, routes in titles.items() if len(routes) > 1}
    dup_descs = {desc: routes for desc, routes in descs.items() if len(routes) > 1}
    check3 = {
        "h1_bad": h1_bad,
        "title_missing": title_missing,
        "description_missing": desc_missing,
        "duplicate_titles": dup_titles,
        "duplicate_descriptions": dup_descs,
    }
    check3_ok = not h1_bad and not title_missing and not desc_missing and not dup_titles and not dup_descs

    # --- check 4 ---
    broken: list[dict[str, str]] = []
    seen_broken: set[tuple[str, str, str]] = set()
    book_missing = []

    def consider(page: str, raw: str) -> None:
        target = split_target(page if page != "/404.html" else "/404.html", raw)
        if target is None:
            return
        path, frag = target
        # Normalise /book and /book/ and /book/index.html
        resolved = file_for(path)
        key = (page, raw, path)
        if resolved is None:
            if key not in seen_broken:
                seen_broken.add(key)
                broken.append({"page": page, "url": raw, "path": path, "why": "missing"})
            return
        if frag:
            target_route = route_for(resolved) or path
            ids = ids_by_route.get(target_route, set())
            if frag not in ids:
                frag_key = (page, raw, path + "#" + frag)
                if frag_key not in seen_broken:
                    seen_broken.add(frag_key)
                    broken.append(
                        {"page": page, "url": raw, "path": path + "#" + frag, "why": "missing fragment"}
                    )

    for route, parser in pages.items():
        if not parser.book:
            # Re-evaluate with the page's own base. Parser used a dummy base for the book flag
            # only when the href was root-absolute. Catch relative book links here.
            book_missing.append(route)
        for kind, raw in parser.attrs:
            if kind == "srcset":
                for url in iter_srcset(raw):
                    consider(route, url)
            else:
                consider(route, raw)

    # CSS url() from stylesheets linked by pages, plus every css file in dist.
    css_files = [path for path in DIST.rglob("*.css") if path.is_file()]
    for css in css_files:
        text = css.read_text(encoding="utf-8", errors="replace")
        for raw in css_urls(text):
            if raw.startswith(SKIP_SCHEMES) or unquote(raw).startswith("#"):
                continue
            consider("/" + css.relative_to(DIST).as_posix(), raw)

    # Runtime fetches that are not href/src attributes.
    fetch_paths = set()
    for js in DIST.rglob("*.js"):
        text = js.read_text(encoding="utf-8", errors="replace")
        for match in re.finditer(r"""fetch\(\s*['"](/[^'"]+)['"]""", text):
            fetch_paths.add(match.group(1).split("?")[0])
        if "motion-lab" in text:
            pass
    for path in sorted(fetch_paths):
        if file_for(path) is None:
            broken.append({"page": "(js fetch)", "url": path, "path": path, "why": "missing"})

    # Book flag was computed with base "/". Root-absolute /book/ is detected.
    # Recompute properly in case the first pass used a dummy and missed relative links.
    book_missing = []
    for route, parser in pages.items():
        found = False
        for kind, raw in parser.attrs:
            if kind != "href":
                continue
            target = split_target(route, raw)
            if not target:
                continue
            path = target[0]
            if path.rstrip("/") == "/book":
                found = True
                break
        if not found:
            book_missing.append(route)

    check4 = {
        "broken_count": len(broken),
        "broken": broken[:80],
        "book_missing": book_missing,
        "js_fetches": sorted(fetch_paths),
    }
    check4_ok = not broken and not book_missing

    # --- check 5 ---
    scene_problems, scene_notes = scene_files()
    check5 = {"problems": scene_problems, "notes": scene_notes}
    check5_ok = not scene_problems

    # --- check 6 ---
    weights = []
    for route, parser in sorted(pages.items(), key=lambda item: item[0]):
        html_path = file_for("/" if route == "/" else route)
        if html_path is None:
            continue
        html_bytes = html_path.stat().st_size
        html_gzip = gz_len(html_path.read_bytes())
        css_set: set[Path] = set()
        js_set: set[Path] = set()
        font_set: set[Path] = set()
        image_set: dict[str, int] = {}

        def add_asset(raw: str, bucket: set[Path]) -> None:
            target = split_target(route, raw)
            if not target:
                return
            path = file_for(target[0])
            if path and path.is_file() and path.suffix != ".html":
                bucket.add(path)

        for raw in parser.css:
            add_asset(raw, css_set)
        for raw in parser.js:
            add_asset(raw, js_set)
        for raw in parser.fonts:
            add_asset(raw, font_set)
        for raw in parser.preloads:
            target = split_target(route, raw)
            if not target:
                continue
            path = file_for(target[0])
            if path and path.is_file():
                image_set[str(path)] = path.stat().st_size
        for sources, img in parser.pictures:
            chosen = choose_image(sources, img)
            if not chosen:
                continue
            target = split_target(route, chosen)
            if not target:
                continue
            path = file_for(target[0])
            if path and path.is_file():
                image_set[str(path)] = path.stat().st_size
        for raw in parser.posters:
            target = split_target(route, raw)
            if not target:
                continue
            path = file_for(target[0])
            if path and path.is_file():
                image_set[str(path)] = path.stat().st_size
        for css in css_set:
            text = css.read_text(encoding="utf-8", errors="replace")
            for raw in css_urls(text):
                target = split_target("/" + css.relative_to(DIST).as_posix(), raw)
                if not target:
                    continue
                path = file_for(target[0])
                if not path or not path.is_file():
                    continue
                if path.suffix.lower() in FONT_SUFFIXES:
                    font_set.add(path)
                elif path.suffix.lower() in IMAGE_SUFFIXES:
                    image_set[str(path)] = path.stat().st_size
        js_set = module_closure(js_set)
        css_gzip = sum(gz_len(path.read_bytes()) for path in css_set)
        js_gzip = sum(gz_len(path.read_bytes()) for path in js_set)
        font_bytes = sum(path.stat().st_size for path in font_set)
        image_bytes = sum(image_set.values())
        total = html_gzip + css_gzip + js_gzip + font_bytes + image_bytes
        weights.append(
            {
                "route": route,
                "html_bytes": html_bytes,
                "html_gzip": html_gzip,
                "css_gzip": css_gzip,
                "js_gzip": js_gzip,
                "font_bytes": font_bytes,
                "image_bytes": image_bytes,
                "image_count": len(image_set),
                "first_view": total,
                "over": total > LIMIT,
            }
        )
    flagged = [row["route"] for row in weights if row["over"]]
    check6 = {
        "limit_bytes": LIMIT,
        "definition": (
            "First view = gzip-9 HTML + gzip-9 linked CSS + gzip-9 of each linked script "
            "and its static ESM imports + font files (preload and CSS) + one image per "
            "non-lazy picture (AVIF, else WebP, else img; srcset candidate for a 1440px slot) "
            "+ video posters + CSS images. Lazy images and scene video files are excluded. "
            "Dynamic import() chunks (Three.js on runway, work and the home film strip) are "
            "not in this total. Shared CSS/JS counted on every route that links them."
        ),
        "flagged": flagged,
        "rows": weights,
    }
    check6_ok = not flagged

    report = {
        "checks": {
            "1_noindex": {"verdict": "PASS" if check1_ok else "FAIL", **check1},
            "2_routes": {"verdict": "PASS" if check2_ok else "FAIL", **check2},
            "3_headings": {"verdict": "PASS" if check3_ok else "FAIL", **check3},
            "4_links": {"verdict": "PASS" if check4_ok else "FAIL", **check4},
            "5_scene_media": {"verdict": "PASS" if check5_ok else "FAIL", **check5},
            "6_weight": {"verdict": "PASS" if check6_ok else "FAIL", **check6},
        }
    }
    (OUT_DIR / "checks.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    lines = [
        "| Route | HTML gzip | CSS gzip | JS gzip | Fonts | First-view images | First view | Flag |",
        "|---|---:|---:|---:|---:|---:|---:|---|",
    ]
    for row in weights:
        lines.append(
            "| {route} | {html_gzip} | {css_gzip} | {js_gzip} | {font_bytes} | {image_bytes} ({image_count}) | {first_view} | {flag} |".format(
                flag="OVER" if row["over"] else "",
                **row,
            )
        )
    lines.append("")
    lines.append(check6["definition"])
    lines.append("")
    lines.append(f"Limit: {LIMIT} bytes. Flagged: {', '.join(flagged) if flagged else 'none'}.")
    (OUT_DIR / "weight-table.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    for key, block in report["checks"].items():
        print(f"{key}: {block['verdict']}")
    if broken:
        print("broken sample:")
        for item in broken[:30]:
            print(f"  {item['page']} -> {item['url']} ({item['why']})")
    if book_missing:
        print("book missing:", ", ".join(book_missing))
    if h1_bad:
        print("h1:", h1_bad)
    if dup_titles:
        print("dup titles:", dup_titles)
    if dup_descs:
        print("dup desc count:", len(dup_descs))
    if lab_hits:
        print("motion-lab:", lab_hits[:20])
    if scene_problems:
        print("scenes:", scene_problems)
    if flagged:
        print("overweight:", flagged)
    return 0 if all(block["verdict"] == "PASS" for block in report["checks"].values()) else 1


if __name__ == "__main__":
    sys.exit(main())
