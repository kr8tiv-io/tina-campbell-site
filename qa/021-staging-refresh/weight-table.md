| Route | HTML gzip | CSS gzip | JS gzip | Fonts | First-view images | First view | Flag |
|---|---:|---:|---:|---:|---:|---:|---|
| / | 19078 | 20347 | 101952 | 662120 | 379433 (11) | 1182930 |  |
| /404.html | 14761 | 12564 | 101952 | 662120 | 162890 (4) | 954287 |  |
| /about/ | 17234 | 14648 | 101952 | 662120 | 175111 (5) | 971065 |  |
| /book/ | 15993 | 15190 | 101952 | 662120 | 173414 (5) | 968669 |  |
| /fashion-editorial/ | 18247 | 16377 | 101952 | 662120 | 286623 (6) | 1085319 |  |
| /journal/ | 15960 | 15190 | 101952 | 662120 | 277934 (5) | 1073156 |  |
| /journal/bridal-portraits-edmonton/ | 18772 | 15190 | 101952 | 662120 | 206208 (5) | 1004242 |  |
| /journal/edmonton-photoshoot-locations/ | 18820 | 15190 | 101952 | 662120 | 277934 (5) | 1076016 |  |
| /journal/engagement-photos-edmonton/ | 18747 | 15190 | 101952 | 662120 | 199741 (5) | 997750 |  |
| /journal/model-portfolio-alberta/ | 18954 | 15190 | 101952 | 662120 | 217517 (5) | 1015733 |  |
| /journal/what-to-wear-photoshoot/ | 19037 | 15190 | 101952 | 662120 | 361373 (5) | 1159672 |  |
| /portraits-bridal-couples/ | 16987 | 16377 | 101952 | 662120 | 341856 (6) | 1139292 |  |
| /runway/ | 18789 | 12564 | 101952 | 662120 | 436233 (18) | 1231658 |  |
| /series/blue-hour/ | 16566 | 16377 | 101952 | 662120 | 162890 (4) | 959905 |  |
| /series/legislature-in-black/ | 16411 | 16377 | 101952 | 662120 | 162890 (4) | 959750 |  |
| /series/red-in-snow/ | 16319 | 16377 | 101952 | 662120 | 162890 (4) | 959658 |  |
| /series/runway-nights/ | 16359 | 16377 | 101952 | 662120 | 162890 (4) | 959698 |  |
| /series/the-red-gown/ | 16293 | 16377 | 101952 | 662120 | 162890 (4) | 959632 |  |
| /services/ | 17352 | 15190 | 101952 | 662120 | 188909 (5) | 985523 |  |
| /work/ | 29375 | 16842 | 101952 | 662120 | 695647 (9) | 1505936 |  |

First view = gzip-9 HTML + gzip-9 linked CSS + gzip-9 of each linked script and its static ESM imports + font files (preload and CSS) + one image per non-lazy picture (AVIF, else WebP, else img; srcset candidate for a 1440px slot) + video posters + CSS images. Lazy images and scene video files are excluded. Dynamic import() chunks (Three.js on runway, work and the home film strip) are not in this total. Shared CSS/JS counted on every route that links them.

Limit: 2621440 bytes. Flagged: none.
