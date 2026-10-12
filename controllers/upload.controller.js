const cloudinary = require("../config/cloudinary");

exports.uploadImage = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files.length) {
      return res.status(400).json({ message: "No file provided" });
    }

    const results = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: process.env.CLOUDINARY_FOLDER || "propertiesImage",
                resource_type: "image",
              },
              (error, result) => {
                if (error) return reject(error);
                resolve({
                  url: result.secure_url,
                  publicId: result.public_id,
                  width: result.width,
                  height: result.height,
                });
              }
            );
            stream.end(file.buffer);
          })
      )
    );

    if (results.length === 1) {
      return res.status(200).json(results[0]);
    }
    return res.status(200).json({ urls: results.map((r) => r.url), files: results });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};