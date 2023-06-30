const express = require("express");
const path = require("path");
const multer = require("multer");

const app = express();

const publicDirectoryPath = path.join(__dirname, "public");
const uploadDirectoryPath = path.join(publicDirectoryPath, "uploaded");

const storage = multer.diskStorage({
  destination: uploadDirectoryPath,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use(express.static(publicDirectoryPath));

app.get("/", (req, res) => {
  const indexPath = path.join(publicDirectoryPath, "index.html");
  res.sendFile(indexPath);
});

app.post("/upload", upload.single("vidFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No video file uploaded");
  }

  res.send({ videoUrl: `/uploaded/${req.file.originalname}` });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
