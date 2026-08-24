import { requireUser, AuthError } from "@/lib/auth";
import { error, ok } from "@/lib/errors";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config();

export async function POST(req: Request) {
  try {
    await requireUser("RESIDENT");

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return error("Image is required", 422);
    }

    if (!file.type.startsWith("image/")) {
      return error("Only image files are allowed", 422);
    }

    if (file.size > 5 * 1024 * 1024) {
      return error("Image must be 5MB or smaller", 422);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<any>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: "society-maintenance-tracker",
          resource_type: "image",
        },
        (uploadError, uploadResult) => {
          if (uploadError) {
            reject(uploadError);
          } else {
            resolve(uploadResult);
          }
        }
      );

      upload.end(buffer);
    });

    return ok(
      {
        url: result.secure_url,
      },
      201
    );
  } catch (e) {
    console.error("Cloudinary upload error:", e);

    return error(
      (e as Error).message,
      e instanceof AuthError ? e.status : 500
    );
  }
}