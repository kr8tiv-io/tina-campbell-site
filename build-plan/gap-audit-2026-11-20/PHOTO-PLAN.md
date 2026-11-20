# Photo plan: spread Tina's real library, no repeats on a page (20 Nov 2026)

Source of truth for prompt 024. Real photos only, from her TC Photo Facebook page (`/workspace/tina-campbell/raw/fb_all/`,
185 files, index `raw/fb_all_index.json`, picks made by index number `#n` = position in that index). The site today uses 64
of them plus 6 Instagram frames (70, `site/src/assets/photos/`). Contact sheets of the 121 unused: `pool-unused-0..2.jpg`
(yellow number = short side >= 1000 px, red = below).

## Rules
- No photo twice on the same page (the /work/ archive shows each library photo exactly once).
- A photo appears on at most 3 pages besides /work/ (signature heroes included).
- WCFW runway shots (fb_012, 029, 037, 060, 064, 085, 105, 158 and new runway picks) stay on runway sections: /runway/,
  /series/runway-nights/, the home runway (03B) section, the Runway service card, and the Runway frame of the home film strip.
  Nowhere else.
- No text in media: reject any frame with a script mark, "_TCPHOTO", "@tcphoto", WCFW mark, poster text or collage. Check at
  full size (crop the four corners and the bottom band, 3x zoom) before adding. Do not paint marks out. Cropping is allowed
  only when the crop is a natural photo crop (for example one half of a two-up frame), never just to cut a mark off.
- Minimum short side 1000 px for slots wider than 40vw on desktop; 768 px frames only in slots under 25vw. No AI upscaling
  unless a slot truly needs it; if so, Lanczos only, max 1.25x, and say so in the REPORT.
- Dedupe: only one of each near-identical pair (dHash <= 70/256 or same set and pose): keep #135 over #151, #132 over #175,
  fb_018 over fb_160 on the same page, retire ig_profile_02 (identical to fb_141_signature).
- Keep alt text descriptive and honest. Do not say a photo shows Tina unless Matt confirms it.

## New picks from the unused 121 (23, all to be confirmed clean at full size)
| New id | #n | fbid | px | What it is | Fills |
|---|---|---|---|---|---|
| fb_171_bts | 171 | 477002674212609 | 1080x1127 | B&W, photographer behind the camera beside a glass table | About hero (primary) |
| fb_125_bts | 125 | 253103339935878 | 1080x1080 | B&W, behind the scenes: camera in hand, model on set (crop off the black letterbox) | About hero alt / About BTS |
| fb_054_fashion | 54 | 516065896972953 | 1080x1390 | Low-key, black hat, red curtain | Fashion & Editorial |
| fb_069_fashion | 69 | 528469115732631 | 1440x1586 | Olive set, street railing, warm afternoon | Fashion & Editorial |
| fb_091_fashion | 91 | 300051341907744 | 1068x1068 | Platinum blonde, white crop and mint jacket | Book |
| fb_138_fashion | 138 | 173282654584614 | 1080x1080 | Blue set in snowy pines | Fashion & Editorial, Red in Snow companion |
| fb_177_fashion | 177 | 420909866690659 | 1080x1390 | Lift against a chain-link fence, urban | Fashion & Editorial pull |
| fb_179_fashion | 179 | 451540116758865 | 993x993 | Blonde crouched on a snowy road, cowboy boots | Book |
| fb_148_fashion | 148 | 223314099581469 | 1080x1080 | Two-up athletic frame; use the left half only | Work archive |
| fb_026_portrait | 26 | 407178054528405 | 1080x1182 | Black outfit in a white studio, high-key | Book |
| fb_127_portrait | 127 | 507153447864198 | 1150x1560 | Seated, white blazer, wood and leather cafe | Portraits chapter |
| fb_139_portrait | 139 | 537969198318058 | 1043x1043 | Reading in a red chair by the window | Services or Journal |
| fb_134_portrait | 134 | 256452282934317 | 1080x1080 | B&W high-key fine art study | About BTS row |
| fb_140_portrait | 140 | 500683041844572 | 768x960 | Glam close-up, smoky eye (small slots only) | Home film strip beauty frame alt |
| fb_061_bridal | 61 | 129049819007898 | 1763x1602 | Ring bearer walking toward the ceremony | Bridal chapter |
| fb_135_couples | 135 | 129049965674550 | 900x1350 | Wedding couple, bouquet, autumn trees | Couples chapter |
| fb_132_couples | 132 | 136277961618417 | 1080x1351 | Couple in snow, red sweater | Couples chapter |
| fb_062_runway | 62 | 516062280306648 | 1079x1597 | Pink dress under magenta stage light | /runway/, Runway Nights |
| fb_041_runway | 41 | 516065863639623 | 931x1567 | Purple suit on stage | /runway/ |
| fb_169_runway | 169 | 516065783639631 | 863x1596 | White gown on stage | /runway/ |
| fb_076_runway | 76 | 516452413600968 | 1078x1534 | Backstage line-up | /runway/ backstage |
| fb_097_runway | 97 | 516452560267620 | 1078x1565 | Rehearsal walk through the concourse | /runway/ backstage |
| fb_098_runway | 98 | 516452470267629 | 1080x1262 | Rehearsal line-up | /runway/ backstage |

Seen and rejected: marks or text (#3, 4, 14, 20, 22, 27, 38, 45, 50, 55, 57, 70, 75, 95, 96, 99, 101, 110, 111, 117, 119, 122,
129, 130, 143, 146, 150, 152, 157, 159, 161, 164, 165, 174, 180, 181, 10, 36, 43, 73, 84, 145, 172), duplicates (#151, 167,
175), under 800 px (most of the 6xx stage frames), and client-sensitive swim and lingerie frames (#79, 88, 122) kept off the
site. Gaps the clean pool cannot fill: river valley and golden hour (the only new ones, #20 and #129, carry "_TCPHOTO" marks),
so those keep using fb_000, fb_071, fb_107 landscape and fb_001, fb_066, fb_168 city. Ask Matt whether Tina can send unmarked
originals of #20, #129, #146, #174 and the WCFW frames #152, #159, #180.

## Page and section map (after 024)
| Page / section | Photos (in order) |
|---|---|
| Home 01A hero | fb_013_signature (video poster, unchanged) |
| Home 02A film strip (7 frames) | fb_046_signature, fb_064_runway (Runway frame), fb_048_portrait, fb_059_bridal, fb_031_couples, fb_001_city, fb_000_landscape |
| Home 03B runway | fb_085_runway, fb_029_runway, fb_037_runway, fb_158_runway, fb_105_runway (video scene unchanged) |
| Home teaser | fb_016_signature |
| Home 10A band | fb_577057434409234 (until 017 lands the 10A video) |
| /work/ | all library photos once each (96 after 024), feature tile fb_016_signature, no second copies |
| /fashion-editorial/ split | fb_016_signature, fb_116_signature, fb_114_signature, fb_009_fashion, fb_034_fashion, fb_054_fashion, fb_069_fashion, fb_138_fashion, fb_011_fashion, fb_024_fashion |
| /fashion-editorial/ pull | fb_018_fashion, fb_124_fashion, fb_177_fashion, fb_136_portrait |
| /portraits-bridal-couples/ | Portraits: fb_137_portrait, fb_154_portrait, fb_127_portrait. Bridal: fb_056_bridal, fb_061_bridal, fb_109_bridal. Couples: fb_007_couples, fb_132_couples, fb_135_couples |
| /runway/ catwalk (14 distinct, no loop copies in the DOM) | fb_012, 029, 037, 060, 064, 085, 105, 158, fb_062, 041, 169, 076, 097, 098 (all _runway) |
| /about/ hero (023) | fb_171_bts (alt fb_125_bts) |
| /about/ split | fb_021_portrait |
| /about/ BTS row | fb_125_bts (or fb_171 if 125 is the hero), ig_profile_05, fb_120_portrait, fb_134_portrait |
| /about/ places | fb_066_city, fb_107_landscape, fb_071_landscape, fb_168_city |
| /about/ 09B band (017) | 09B blue hour media (unchanged) |
| /services/ header | fb_156_portrait |
| /services/ cards | fb_106_portrait, fb_008_fashion, fb_049_bridal, fb_065_couples, fb_012_runway (Runway card), fb_139_portrait |
| /book/ | fb_091_fashion, fb_179_fashion, fb_026_portrait, fb_040_portrait |
| /series/the-red-gown/ | cover fb_016_signature; body fb_013_signature, fb_116_signature (no cover repeat, 3 photos is fine) |
| /series/legislature-in-black/ | cover fb_046_signature; body fb_141_signature, ig_profile_03, fb_033_fashion |
| /series/red-in-snow/ | cover fb_034_fashion; body fb_136_portrait, fb_009_fashion, fb_133_fashion, fb_042_fashion |
| /series/runway-nights/ | cover fb_029_runway; body fb_012_runway, fb_158_runway, fb_085_runway, fb_062_runway |
| /series/blue-hour/ | cover fb_168_city; body fb_066_city, fb_001_city, fb_577057434409234 |
| /journal/ index and articles | bridal fb_049_bridal, locations fb_107_landscape, engagement fb_065_couples, model portfolio fb_008_fashion, what to wear fb_114_signature |

Caps after the map (excluding /work/): fb_029 3 pages (home, runway, runway-nights) all runway sections; fb_168 2;
fb_046 2; fb_016 3; fb_065 2; fb_049 2; fb_141 1; fb_066 2; fb_001 2; fb_012 3 (runway, runway-nights, Runway card).
The 02A strip uses watermark-free frames only; replace any frame that fails the corner check with the next clean frame
of the same category.
