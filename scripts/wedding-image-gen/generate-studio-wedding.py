#!/usr/bin/env python3
"""
Generate studio-style wedding preview images from real couple references.

This script intentionally uses the Images edits endpoint rather than plain text
generation, because preserving the couple's actual faces is the main goal.
It has no third-party dependencies.
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request
import uuid


API_URL = "https://api.openai.com/v1/images/edits"
DEFAULT_MODEL = "gpt-image-1.5"
DEFAULT_SIZE = "1024x1536"
DEFAULT_QUALITY = "high"
DEFAULT_INPUT_FIDELITY = "high"
DEFAULT_IMAGE_FIELD = "image[]"


def read_text(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")


def load_dotenv(path: pathlib.Path) -> None:
    if not path.exists():
        return

    for raw_line in read_text(path).splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def load_references(path: pathlib.Path, limit: int) -> list[dict[str, str]]:
    payload = json.loads(read_text(path))
    images = payload.get("images", [])
    if not isinstance(images, list):
        raise ValueError(f"{path} must contain an images array.")

    selected = images[:limit]
    for item in selected:
        image_path = pathlib.Path(item["path"]).expanduser()
        if not image_path.exists():
            raise FileNotFoundError(f"Reference image not found: {image_path}")
        item["path"] = str(image_path)

    return selected


def multipart_body(
    fields: dict[str, str],
    files: list[tuple[str, pathlib.Path]],
) -> tuple[bytes, str]:
    boundary = f"----codex-wedding-{uuid.uuid4().hex}"
    chunks: list[bytes] = []

    def add(value: str) -> None:
        chunks.append(value.encode("utf-8"))

    for key, value in fields.items():
        add(f"--{boundary}\r\n")
        add(f'Content-Disposition: form-data; name="{key}"\r\n\r\n')
        add(f"{value}\r\n")

    for field_name, file_path in files:
        mime_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        add(f"--{boundary}\r\n")
        add(
            "Content-Disposition: form-data; "
            f'name="{field_name}"; filename="{file_path.name}"\r\n'
        )
        add(f"Content-Type: {mime_type}\r\n\r\n")
        chunks.append(file_path.read_bytes())
        add("\r\n")

    add(f"--{boundary}--\r\n")
    return b"".join(chunks), boundary


def call_openai(
    *,
    api_key: str,
    prompt: str,
    references: list[dict[str, str]],
    model: str,
    size: str,
    quality: str,
    input_fidelity: str | None,
    output_format: str,
    n: int,
    image_field: str,
) -> dict:
    fields = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "quality": quality,
        "output_format": output_format,
        "n": str(n),
    }

    # gpt-image-2 always uses high fidelity and rejects explicit input_fidelity.
    if input_fidelity and model != "gpt-image-2":
        fields["input_fidelity"] = input_fidelity

    files = [(image_field, pathlib.Path(item["path"])) for item in references]
    body, boundary = multipart_body(fields, files)

    request = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=600) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI API error {error.code}: {detail}") from error


def save_outputs(response: dict, out_dir: pathlib.Path, basename: str, output_format: str) -> list[pathlib.Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    saved: list[pathlib.Path] = []
    timestamp = time.strftime("%Y%m%d-%H%M%S")

    for index, item in enumerate(response.get("data", []), start=1):
        b64_json = item.get("b64_json")
        if not b64_json:
            continue

        output_path = out_dir / f"{basename}-{timestamp}-{index}.{output_format}"
        output_path.write_bytes(base64.b64decode(b64_json))
        saved.append(output_path)

    return saved


def write_manifest(
    *,
    out_dir: pathlib.Path,
    basename: str,
    prompt: str,
    references: list[dict[str, str]],
    args: argparse.Namespace,
    saved: list[pathlib.Path],
) -> pathlib.Path:
    manifest = {
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "model": args.model,
        "size": args.size,
        "quality": args.quality,
        "inputFidelity": None if args.model == "gpt-image-2" else args.input_fidelity,
        "outputFormat": args.output_format,
        "imageField": args.image_field,
        "prompt": prompt,
        "references": references,
        "outputs": [str(path) for path in saved],
    }
    path = out_dir / f"{basename}-manifest.json"
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--references", default="scripts/wedding-image-gen/reference-images.json")
    parser.add_argument("--prompt", default="scripts/wedding-image-gen/studio-hero.prompt.txt")
    parser.add_argument("--out-dir", default="output/imagegen/studio-wedding")
    parser.add_argument("--basename", default="studio-hero")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--size", default=DEFAULT_SIZE)
    parser.add_argument("--quality", default=DEFAULT_QUALITY)
    parser.add_argument("--input-fidelity", default=DEFAULT_INPUT_FIDELITY)
    parser.add_argument("--output-format", choices=["png", "jpeg", "webp"], default="png")
    parser.add_argument("--n", type=int, default=1)
    parser.add_argument("--limit", type=int, default=8, help="maximum reference images, up to 16")
    parser.add_argument("--image-field", default=DEFAULT_IMAGE_FIELD)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.limit < 1 or args.limit > 16:
        raise ValueError("--limit must be between 1 and 16.")

    references_path = pathlib.Path(args.references)
    prompt_path = pathlib.Path(args.prompt)
    out_dir = pathlib.Path(args.out_dir)
    load_dotenv(pathlib.Path(".env"))
    prompt = read_text(prompt_path)
    references = load_references(references_path, args.limit)

    if args.dry_run:
        print(
            json.dumps(
                {
                    "endpoint": API_URL,
                    "model": args.model,
                    "size": args.size,
                    "quality": args.quality,
                    "inputFidelity": None if args.model == "gpt-image-2" else args.input_fidelity,
                    "outputFormat": args.output_format,
                    "n": args.n,
                    "imageField": args.image_field,
                    "promptPath": str(prompt_path),
                    "referenceCount": len(references),
                    "references": references,
                    "outDir": str(out_dir),
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY is required. Run with --dry-run to inspect the payload.", file=sys.stderr)
        return 2

    try:
        response = call_openai(
            api_key=api_key,
            prompt=prompt,
            references=references,
            model=args.model,
            size=args.size,
            quality=args.quality,
            input_fidelity=args.input_fidelity,
            output_format=args.output_format,
            n=args.n,
            image_field=args.image_field,
        )
    except RuntimeError as error:
        if args.image_field != "image":
            print(f"Retrying with image field name 'image' after error: {error}", file=sys.stderr)
            response = call_openai(
                api_key=api_key,
                prompt=prompt,
                references=references,
                model=args.model,
                size=args.size,
                quality=args.quality,
                input_fidelity=args.input_fidelity,
                output_format=args.output_format,
                n=args.n,
                image_field="image",
            )
        else:
            raise
    saved = save_outputs(response, out_dir, args.basename, args.output_format)
    manifest_path = write_manifest(
        out_dir=out_dir,
        basename=args.basename,
        prompt=prompt,
        references=references,
        args=args,
        saved=saved,
    )

    for path in saved:
        print(path)
    print(f"manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
