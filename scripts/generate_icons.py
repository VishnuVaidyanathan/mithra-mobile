"""
Mithra icon generator
---------------------
Takes the lotus logo (white bg, gold outline) and produces all
Expo / Play Store asset sizes with a dark indigo background.

Usage:
    python scripts/generate_icons.py
"""
from pathlib import Path
from PIL import Image, ImageOps
import sys

# ── Config ────────────────────────────────────────────────────────────
SRC      = Path("C:/Users/vishn/Downloads/45851.png")
ASSETS   = Path(__file__).parent.parent / "assets"
BG_COLOR = (9, 9, 26)        # #09091a  — Mithra dark indigo
PAD      = 0.15               # padding ratio inside icon (logo occupies 70% of canvas)

# Output files: (filename, (width, height))
OUTPUTS = {
    "icon.png":          (1024, 1024),   # Play Store icon + Expo icon
    "adaptive-icon.png": (1024, 1024),   # Android adaptive (foreground, transparent bg)
    "splash-icon.png":   (512,  512),    # Expo splash centre graphic
    "favicon.png":       (64,   64),     # Web favicon
}


def white_to_transparent(img: Image.Image, threshold: int = 230) -> Image.Image:
    """Convert near-white pixels to transparent."""
    img = img.convert("RGBA")
    data = img.getdata()
    new_data = []
    for r, g, b, a in data:
        if r > threshold and g > threshold and b > threshold:
            new_data.append((r, g, b, 0))    # transparent
        else:
            new_data.append((r, g, b, a))    # keep (gold logo)
    img.putdata(new_data)
    return img


def make_icon(src_path: Path, size: tuple[int, int], transparent_bg: bool = False) -> Image.Image:
    src   = Image.open(src_path).convert("RGBA")

    # Remove white background → RGBA with transparent bg
    src = white_to_transparent(src)

    # Canvas
    canvas = Image.new("RGBA", size, (0, 0, 0, 0) if transparent_bg else (*BG_COLOR, 255))

    # Fit logo inside canvas with padding
    padded_w = int(size[0] * (1 - PAD * 2))
    padded_h = int(size[1] * (1 - PAD * 2))
    src_resized = ImageOps.contain(src, (padded_w, padded_h), Image.LANCZOS)

    # Centre on canvas
    x = (size[0] - src_resized.width)  // 2
    y = (size[1] - src_resized.height) // 2
    canvas.paste(src_resized, (x, y), src_resized)

    return canvas


def main():
    if not SRC.exists():
        print(f"ERROR: source not found: {SRC}")
        sys.exit(1)

    ASSETS.mkdir(exist_ok=True)
    print(f"Source  : {SRC}")
    print(f"Output  : {ASSETS}")
    print()

    for filename, size in OUTPUTS.items():
        # adaptive-icon uses transparent bg so Android can apply its own shape
        transparent = filename == "adaptive-icon.png"
        img  = make_icon(SRC, size, transparent_bg=transparent)
        dest = ASSETS / filename
        img.save(dest, "PNG")
        print(f"  OK  {filename}  ({size[0]}x{size[1]})")

    # Also create the Play Store feature graphic (1024×500) for reference
    feat = make_icon(SRC, (1024, 500))
    feat_path = ASSETS / "feature-graphic.png"
    feat.save(feat_path, "PNG")
    print(f"  OK  feature-graphic.png  (1024x500)")

    print("\nDone! All assets written to assets/")


if __name__ == "__main__":
    main()
