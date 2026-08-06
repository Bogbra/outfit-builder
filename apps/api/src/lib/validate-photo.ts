// tryOnRequestInputSchema (packages/contracts) only regex-checks that the
// photo string *starts with* a plausible data URL prefix — the payload
// after the comma doesn't have to be valid base64, let alone look like a
// real image at all. That check is cheap and shared with the client on
// purpose (fast structural rejection, and it drives the OpenAPI spec), but
// it isn't a content check. This is: it runs server-side only, right
// before the (costly, third-party) fashn.ai call, and validates the base64
// encoding, decoded size, and file signature (magic bytes) of the actual
// payload — not a full image decode, see validatePhotoDataUrl below for
// what that means in practice.

export class InvalidPhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPhotoError";
  }
}

// Matches the dialog's own MAX_PHOTO_BYTES (try-on-dialog.tsx) — kept in
// sync deliberately, not just coincidentally the same number. Base64
// inflates size by ~4/3, so 5MB of decoded bytes becomes ~6.7MB of base64
// plus the data URL prefix and JSON structure around it; a decoded limit
// set any higher would let the client-accepted file exceed the 8mb
// express.json body limit on /api/try-on, causing a confusing 413 before
// this check even runs.
const MAX_DECODED_PHOTO_BYTES = 5 * 1024 * 1024;

type DeclaredType = "jpeg" | "png" | "webp";

// First few bytes of each format are fixed ("magic bytes") regardless of
// the image's actual content/dimensions — a cheap, well-established way to
// confirm a buffer really is what it claims to be without a full decode.
function matchesMagicBytes(bytes: Buffer, declaredType: DeclaredType): boolean {
  switch (declaredType) {
    case "jpeg":
      return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "png":
      return (
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case "webp":
      return (
        bytes.length >= 12 &&
        bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
        bytes.subarray(8, 12).toString("ascii") === "WEBP"
      );
  }
}

const DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,(.*)$/s;

// Validates the base64 encoding, decoded size, and file signature (magic
// bytes) of `photo` — tryOnRequestInputSchema's regex only checked the
// data URL's prefix. This does not fully decode the image: no dimension
// check, no EXIF stripping, and a truncated or otherwise corrupt file
// that still starts with the right signature will pass. Full validation
// would need an image-processing library (e.g. sharp) this API doesn't
// otherwise depend on; this is the proportionate check for what's
// currently a portfolio project's one paid, user-uploaded input.
export function validatePhotoDataUrl(photo: string): void {
  const match = DATA_URL_PATTERN.exec(photo);
  if (!match) {
    // tryOnRequestInputSchema's own regex should already have caught this,
    // but this function is meant to stand on its own.
    throw new InvalidPhotoError("Photo must be a base64 image data URL");
  }
  const declaredType = match[1] as DeclaredType;
  const base64Payload = match[2]!;

  // Buffer.from(..., "base64") silently ignores invalid characters instead
  // of throwing, so the actual validation is this charset/length check —
  // decoding only happens once the payload is confirmed to be real base64.
  if (base64Payload.length === 0 || base64Payload.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64Payload)) {
    throw new InvalidPhotoError("Photo data is not valid base64");
  }

  const decoded = Buffer.from(base64Payload, "base64");
  if (decoded.length === 0) {
    throw new InvalidPhotoError("Photo data is not valid base64");
  }

  if (decoded.length > MAX_DECODED_PHOTO_BYTES) {
    throw new InvalidPhotoError(`Photo must be under ${Math.floor(MAX_DECODED_PHOTO_BYTES / (1024 * 1024))}MB`);
  }

  if (!matchesMagicBytes(decoded, declaredType)) {
    throw new InvalidPhotoError(`Photo data does not look like a valid ${declaredType.toUpperCase()} image`);
  }
}
