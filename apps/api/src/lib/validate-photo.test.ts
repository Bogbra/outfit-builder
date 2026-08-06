import { describe, expect, it } from "vitest";

import { InvalidPhotoError, validatePhotoDataUrl } from "./validate-photo.js";

const VALID_JPEG = "data:image/jpeg;base64,/9j/4AAQSkZJRgA=";
const VALID_PNG = "data:image/png;base64,iVBORw0KGgoAAAA=";
const VALID_WEBP = "data:image/webp;base64,UklGRgAAAABXRUJQ";

describe("validatePhotoDataUrl", () => {
  it.each([
    ["jpeg", VALID_JPEG],
    ["png", VALID_PNG],
    ["webp", VALID_WEBP],
  ])("accepts a real %s payload with matching magic bytes", (_type, dataUrl) => {
    expect(() => validatePhotoDataUrl(dataUrl)).not.toThrow();
  });

  it("rejects a non-data-URL string", () => {
    expect(() => validatePhotoDataUrl("https://example.com/photo.jpg")).toThrow(InvalidPhotoError);
  });

  it("rejects a payload that isn't valid base64", () => {
    expect(() => validatePhotoDataUrl("data:image/jpeg;base64,not-valid-base64!!!")).toThrow(InvalidPhotoError);
  });

  it("rejects a payload that decodes but doesn't match the claimed type's magic bytes", () => {
    // Valid base64, decodes fine, but the bytes are plain text — not a JPEG.
    const textAsBase64 = Buffer.from("this is not an image").toString("base64");
    expect(() => validatePhotoDataUrl(`data:image/jpeg;base64,${textAsBase64}`)).toThrow(InvalidPhotoError);
  });

  it("rejects a JPEG payload mislabeled as PNG", () => {
    const jpegBase64 = VALID_JPEG.split(",")[1];
    expect(() => validatePhotoDataUrl(`data:image/png;base64,${jpegBase64}`)).toThrow(InvalidPhotoError);
  });

  it("rejects a decoded payload over the size limit", () => {
    // 7MB of valid JPEG magic bytes followed by padding — decodes fine,
    // matches the magic bytes, but is too large.
    const oversized = Buffer.alloc(7 * 1024 * 1024);
    oversized[0] = 0xff;
    oversized[1] = 0xd8;
    oversized[2] = 0xff;
    const dataUrl = `data:image/jpeg;base64,${oversized.toString("base64")}`;
    expect(() => validatePhotoDataUrl(dataUrl)).toThrow(InvalidPhotoError);
  });

  it("rejects an empty payload", () => {
    expect(() => validatePhotoDataUrl("data:image/jpeg;base64,")).toThrow(InvalidPhotoError);
  });
});
