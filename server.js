const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const flash = require("connect-flash");

const multer = require("multer");

// destination for file
const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, "public/uploads/images");
  },

  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

// uploads parameter
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

require("./utils/db");
const User = require("./models/user");
const Register = require("./models/register");
const Mahasiswa = require("./models/mahasiswa");
const Artikel = require("./models/artikel");
const Berita = require("./models/berita");
const Gallery = require("./models/gallery");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// setup method override
app.use(methodOverride("_method"));

// set up ejs
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

/* ========= ROUTE HALAMAN HIMAKOM ========
=========================================*/

// Halaman utama
app.get("/", async (req, res) => {
  const artikelUtama = await Artikel.find().sort({ _id: -1 }).limit(1);
  const artikels = await Artikel.find().sort({ _id: -1 }).skip(1).limit(2);
  const berita1 = await Berita.find().sort({ _id: -1 }).limit(1);
  const berita2 = await Berita.find().sort({ _id: -1 }).skip(1).limit(1);
  const galleries = await Gallery.find().skip(1).limit(8);
  const ketua = await Mahasiswa.findOne({ kedudukan: "Ketua Himakom" });
  const wakil = await Mahasiswa.findOne({ kedudukan: "Wakil Ketua Himakom" });

  res.render("index", {
    title: "Halaman Utama",
    layout: "layouts/main-layouts",
    artikels,
    artikelUtama,
    berita1,
    berita2,
    galleries,
    ketua,
    wakil,
  });
});

// halaman pengurus inti
app.get("/inti", (req, res) => {
  res.render("inti", {
    title: "Halaman Pengurus Inti",
    layout: "layouts/main-layouts",
  });
});

// halaman pengurus pmb
app.get("/pmb", (req, res) => {
  res.render("pmb", {
    title: "Halaman Pengurus PMB",
    layout: "layouts/main-layouts",
  });
});

// halaman pengurus humas
app.get("/humas", (req, res) => {
  res.render("humas", {
    title: "Halaman Pengurus Humas",
    layout: "layouts/main-layouts",
  });
});

// halaman pengurus kominfo
app.get("/kominfo", (req, res) => {
  res.render("kominfo", {
    title: "Halaman Pengurus Kominfo",
    layout: "layouts/main-layouts",
  });
});

// halaman artikel
app.get("/articles", async (req, res) => {
  const artikelUtama = await Artikel.find().sort({ _id: -1 }).limit(1);
  const artikels = await Artikel.find().sort({ _id: -1 }).skip(1);

  res.render("artikel", {
    title: "Artikel",
    layout: "layouts/main-layouts",
    artikelUtama,
    artikels,
  });
});

// halaman berita
app.get("/news", async (req, res) => {
  const beritaUtama = await Berita.find().sort({ _id: -1 }).limit(1);
  const berita = await Berita.find().sort({ _id: -1 }).skip(1);

  res.render("berita", {
    title: "Berita",
    layout: "layouts/main-layouts",
    beritaUtama,
    berita,
  });
});

// pratinjau artikel
app.get("/articles/:judul", async (req, res) => {
  const artikel = await Artikel.findOne({ judul: req.params.judul });
  const artikels = await Artikel.find();
  res.render("pratinjau-artikel", {
    title: req.params.judul,
    layout: "layouts/main-layouts",
    artikels,
    artikel,
  });
});

// pratinjau beita
app.get("/news/:judul", async (req, res) => {
  const berita = await Berita.findOne({ judul: req.params.judul });
  const beritas = await Berita.find();
  res.render("pratinjau-berita", {
    title: req.params.judul,
    layout: "layouts/main-layouts",
    berita,
    beritas,
  });
});

app.get("/galeri", async (req, res) => {
  const galleries = await Gallery.find();

  res.render("galeri", {
    title: "Galeri",
    layout: "layouts/main-layouts",
    galleries,
  });
});

/* ========= ROUTE HALAMAN ADMIN HIMAKOM ========
=================================================*/

// login
app.get("/login", (req, res) => {
  res.render("admin/login", {
    title: "Login || Himakom",
    layout: "layouts/auth-layouts",
    message: "",
    messageClass: "",
  });
});

// halaman register
app.get("/register", (req, res) => {
  res.render("admin/register", {
    title: "Register || Himakom",
    layout: "layouts/auth-layouts",
    message: "",
    messageClass: "",
  });
});

const crypto = require("crypto");

const getHashedPassword = (password) => {
  const sha256 = crypto.createHash("sha256");
  const hash = sha256.update(password).digest("base64");
  return hash;
};

app.post("/register", async (req, res) => {
  const { username, namaLengkap, nim, password, confirmPassword } = req.body;

  // Check if the password and confirm password fields match
  if (password === confirmPassword) {
    // Check if user with the same username is also registered
    const akunDuplikat = await User.findOne({ username: username });
    const registerDuplikat = await Register.findOne({
      namaLengkap: namaLengkap,
      status: "sudah daftar",
    });
    const cekRegister =
      (await Register.findOne({ namaLengkap: namaLengkap })) &&
      (await Register.findOne({ nim: nim }));

    if (!cekRegister) {
      res.render("admin/register", {
        title: "Register || Himakom",
        layout: "layouts/auth-layouts",
        message: "Nama dan nim tidak terdaftar.",
        messageClass: "alert-danger",
      });
      return;
    }

    if (registerDuplikat) {
      res.render("admin/register", {
        title: "Register || Himakom",
        layout: "layouts/auth-layouts",
        message: "Akun ini sudah terdaftar",
        messageClass: "alert-danger",
      });
      return;
    }

    if (akunDuplikat) {
      res.render("admin/register", {
        title: "Register || Himakom",
        layout: "layouts/auth-layouts",
        message: "User sudah terdaftar.",
        messageClass: "alert-danger",
      });
      return;
    }

    // Register.updateOne({namaLengkap:namaLengkap, nim:nim}, {$set: {status:"sudah daftar"}})

    const hashedPassword = getHashedPassword(password);

    // Store user into the database if you are using one

    Register.updateOne(
      { namaLengkap: namaLengkap },
      {
        $set: {
          status: "sudah daftar",
        },
      }
    ).then((result) => {
      console.log("berhasil diubah");
    });

    User.insertMany({
      namaLengkap,
      nim,
      username,
      password: hashedPassword,
    }).then((result) => {
      console.log("berhasil ditambah");
    });

    res.render("admin/login", {
      title: "Login || Himakom",
      layout: "layouts/auth-layouts",
      message: "Registrasi berhasil silahkan login",
      messageClass: "alert-success",
    });
  } else {
    res.render("admin/register", {
      title: "Register || Himakom",
      layout: "layouts/auth-layouts",
      message: "Password tidak sama.",
      messageClass: "alert-danger",
    });
  }
});

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString("hex");
};

// This will hold the users and authToken related to users
const authTokens = {};

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = getHashedPassword(password);
  const users = await User.find();
  const user = users.find((u) => {
    return u.username === username && hashedPassword === u.password;
  });

  if (user) {
    const authToken = generateAuthToken();

    // Store authentication token
    authTokens[authToken] = user;

    // Setting the auth token in cookies
    res.cookie("AuthToken", authToken);

    // Redirect user to the protected page
    res.render("admin/dashboard", {
      title: "Dashboard || Himakom",
      layout: "layouts/admin-layouts",
      user,
    });
  } else {
    res.render("admin/login", {
      title: "Login || Himakom",
      layout: "layouts/auth-layouts",
      message: "username atau password salah",
      messageClass: "alert-danger",
    });
  }
});

app.use((req, res, next) => {
  // Get auth token from the cookies
  const authToken = req.cookies["AuthToken"];
  // Inject the user to the request
  req.user = authTokens[authToken];
  next();
});

// halaman dashboard
app.get("/dashboard", (req, res) => {
  if (req.user) {
    const user = req.user;
    res.render("admin/dashboard", {
      title: "Dashboard || Himakom",
      layout: "layouts/admin-layouts",
      user,
    });
  } else {
    res.render("admin/login", {
      title: "Login || Himakom",
      layout: "layouts/auth-layouts",
      message: "Mohon login untuk melanjutkan",
      messageClass: "alert-danger",
    });
  }
});

const requireAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.render("admin/login", {
      title: "Login || Himakom",
      layout: "layouts/auth-layouts",
      message: "Mohon login untuk melanjutkan",
      messageClass: "alert-danger",
    });
  }
};

// Halaman data user
app.get("/dataUser", requireAuth, async (req, res) => {
  const user = req.user;
  const users = await User.find();

  res.render("admin/data-user", {
    title: "Data User || Himakom",
    layout: "layouts/admin-layouts",
    user,
    users,
    msg: req.flash("msg"),
  });
});

// Halaman ubah data
app.get("/dataUser/edit/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });

  res.render("admin/edit-user", {
    title: "Data User || Himakom",
    layout: "layouts/admin-layouts",
    user,
  });
});

// proses ubah data user
//pr-masih-error =====================
app.put(
  "/dataUser",
  [
    body("username").custom(async (value, { req }) => {
      const duplikat = await User.findOne({ username: value });
      if (value !== req.body.oldUsername && duplikat) {
        throw new Error("Username sudah digunakan");
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("dataUser/edit", {
        title: "Data User || Himakom",
        layout: "layouts/admin-layouts",
        errors: errors.array(),
        user: req.body,
      });
    } else {
      User.updateOne(
        { _id: req.body._id },
        {
          $set: {
            username: req.body.username,
            namaLengkap: req.body.namaLengkap,
          },
        }
      ).then((result) => {
        // kirimkan flash message
        req.flash("msg", "Data  Contact berhasil diubah");
        res.redirect("/dataUser");
      });
    }
  }
);

// pr-masih-eror==========================
// halaman data register
app.get("/dataRegister", requireAuth, async (req, res) => {
  const user = req.user;
  const registers = await Register.find();

  res.render("admin/data-Register", {
    title: "Data Register || Himakom",
    layout: "layouts/admin-layouts",
    user,
    registers,
    msg: req.flash("msg"),
  });
});

// proses tambah data contact
app.post(
  "/dataRegister",
  [
    body("nim").custom(async (value) => {
      const duplikat = await Register.findOne({ nim: value });
      if (duplikat) {
        throw new Error("Gagal menambahkan NIM sudah tersedia!");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const user = req.user;
    const registers = await Register.find();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("admin/data-register", {
        title: "Data Register || Himakom",
        layout: "layouts/admin-layouts",
        user,
        registers,
        errors: errors.array(),
        msg: req.flash("msg"),
      });
    } else {
      Register.insertMany(req.body, (error, result) => {
        // kirimkan flash message
        req.flash("msg", "Data  register berhasil ditambahkan");
        res.redirect("/dataRegister");
      });
    }
  }
);

app.get("/dataMahasiswa", requireAuth, async (req, res) => {
  const mahasiswa = await Mahasiswa.find();

  res.render("admin/data-mahasiswa", {
    title: "Data Mahasiswa || Himakom",
    layout: "layouts/admin-layouts",
    mahasiswa,
    msg: req.flash("msg"),
    user: req.user,
  });
});

app.get("/tambahDataMahasiswa", requireAuth, async (req, res) => {
  res.render("admin/tambah-data-mahasiswa", {
    title: "Tambah Data Mahasiswa || Himakom",
    layout: "layouts/admin-layouts",
    msg: req.flash("msg"),
    user: req.user,
  });
});

// detail mahasiswa
app.get("/dataMahasiswa/:nim", async (req, res) => {
  const mahasiswa = await Mahasiswa.findOne({ nim: req.params.nim });

  res.render("admin/detail-mahasiswa", {
    title: "Halaman Detail Mahasiswa",
    layout: "layouts/admin-layouts",
    mahasiswa,
    user: req.user,
  });
});

app.post(
  "/dataMahasiswa",
  upload.single("image"),
  [
    body("nim").custom(async (value) => {
      const duplikat = await Mahasiswa.findOne({ nim: value });
      if (duplikat) {
        throw new Error("Nim sudah digunakan");
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("admin/tambah-data-mahasiswa", {
        title: "Tambah Data Mahasiswa || Himakom",
        layout: "layouts/admin-layouts",
        errors: errors.array(),
        user: req.user,
      });
    } else {
      Mahasiswa.insertMany(
        {
          nama: req.body.nama,
          nim: req.body.nim,
          kedudukan: req.body.kedudukan,
          prodi: req.body.prodi,
          alamat: req.body.alamat,
          tanggalLahir: req.body.tanggalLahir,
          moto: req.body.moto,
          instagram: req.body.instagram,
          twitter: req.body.twitter,
          github: req.body.github,
          line: req.body.line,
          facebook: req.body.facebook,
          image: req.file.filename,
        },
        (error, result) => {
          req.flash("msg", "Data Mahasiswa berhasil ditambahkan");
          res.redirect("/dataMahasiswa");
        }
      );
    }
  }
);

// proses delete data mahasiswa
app.delete("/dataMahasiswa", (req, res) => {
  Mahasiswa.deleteOne({ _id: req.body._id }).then((result) => {
    const dir = `./public/uploads/images/${req.body.image}`;

    fs.unlink(dir, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("file terhapus");
    });
    req.flash("msg", "Data Mahasiswa berhasil dihapus");
    res.redirect("/dataMahasiswa");
  });
});

// Halaman ubah data mahasiswa
app.get("/dataMahasiswa/edit/:nim", async (req, res) => {
  const mahasiswa = await Mahasiswa.findOne({ nim: req.params.nim });

  res.render("admin/edit-mahasiswa", {
    title: "Form ubah data Mahasiswa",
    layout: "layouts/admin-layouts",
    user: req.user,
    mahasiswa,
  });
});

// proses ubah data mahasiswa
app.put("/dataMahasiswa", upload.single("image"), (req, res) => {
  const nama = req.body.nama;
  const nim = req.body.nim;
  const kedudukan = req.body.kedudukan;
  const prodi = req.body.prodi;
  const alamat = req.body.alamat;
  const tanggalLahir = req.body.tanggalLahir;
  const moto = req.body.moto;
  const instagram = req.body.instagram;
  const twitter = req.body.twitter;
  const github = req.body.github;
  const line = req.body.line;
  const facebook = req.body.facebook;

  const updates = {
    nama,
    nim,
    kedudukan,
    prodi,
    alamat,
    tanggalLahir,
    moto,
    instagram,
    twitter,
    github,
    line,
    facebook,
  };

  if (req.file) {
    const image = req.file.filename;
    updates.image = image;
  }

  Mahasiswa.updateOne(
    { _id: req.body._id },
    {
      $set: updates,
    }
  ).then((result) => {
    req.flash("msg", "Data Mahasiswa berhasil diubah");
    res.redirect("/dataMahasiswa");
  });
});

// halaman program kerja
app.get("/programKerja", requireAuth, (req, res) => {
  const user = req.user;

  res.render("admin/program-kerja", {
    title: "Program Kerja || Himakom",
    layout: "layouts/admin-layouts",
    user,
  });
});

// halaman event
app.get("/event", requireAuth, (req, res) => {
  const user = req.user;

  res.render("admin/event", {
    title: "Event || Himakom",
    layout: "layouts/admin-layouts",
    user,
  });
});

// halaman gallery
app.get("/gallery", requireAuth, async (req, res) => {
  const galleries = await Gallery.find();

  res.render("admin/gallery", {
    title: "Gallery || Himakom",
    layout: "layouts/admin-layouts",
    user: req.user,
    galleries,
    msg: req.flash("msg"),
  });
});

// proses tambah gallery
app.post("/tambahGallery", upload.single("foto"), (req, res) => {
  Gallery.insertMany(
    {
      kategori: req.body.kategori,
      ditambahOleh: req.body.ditambahOleh,
      tanggal: req.body.tanggal,
      foto: req.file.filename,
    },
    (error, result) => {
      req.flash("msg", "Foto berhasil ditambah");
      res.redirect("/gallery");
    }
  );
});

// kelola gallery
app.get("/kelolaGallery", async (req, res) => {
  const galleries = await Gallery.find();

  res.render("admin/kelola-gallery", {
    title: "Kelola Gallery",
    layout: "layouts/admin-layouts",
    user: req.user,
    galleries,
    msg: req.flash("msg"),
  });
});

// proses delete gallery
app.delete("/gallery", (req, res) => {
  Gallery.deleteOne({ _id: req.body._id }).then((result) => {
    const dir = `./public/uploads/images/${req.body.foto}`;

    fs.unlink(dir, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("file terhapus");
    });
    req.flash("msg", "Foto berhasil dihapus");
    res.redirect("/kelolaGallery");
  });
});

// Halaman artikel
app.get("/artikel", requireAuth, async (req, res) => {
  const artikels = await Artikel.find();

  res.render("admin/artikel", {
    title: "Artikel || Himakom",
    layout: "layouts/admin-layouts",
    user: req.user,
    artikels,
    msg: req.flash("msg"),
  });
});

// detail artikel
app.get("/artikel/:judul", async (req, res) => {
  const artikels = await Artikel.find();
  const artikel = await Artikel.findOne({ judul: req.params.judul });

  res.render("admin/pratinjau-artikel", {
    title: "Pratinjau Artikel",
    layout: "layouts/admin-layouts",
    artikel,
    artikels,
    user: req.user,
  });
});

// halaman tambah artikel
app.get("/tambahArtikel", requireAuth, async (req, res) => {
  const artikels = await Artikel.find();

  res.render("admin/tambah-artikel", {
    title: "Artikel || Himakom",
    layout: "layouts/admin-layouts",
    user: req.user,
    artikels,
  });
});

// proses tambah artikel
app.post("/tambahArtikel", upload.single("thumbnail"), (req, res) => {
  Artikel.insertMany(
    {
      judul: req.body.judul,
      deskripsi: req.body.deskripsi,
      isiArtikel: req.body.isiArtikel,
      tanggalDibuat: req.body.tanggalDibuat,
      penulis: req.body.penulis,
      thumbnail: req.file.filename,
    },
    (error, result) => {
      req.flash("msg", "Artikel berhasil ditambah");
      res.redirect("/artikel");
    }
  );
});

// proses delete artikel
app.delete("/artikel", (req, res) => {
  Artikel.deleteOne({ _id: req.body._id }).then((result) => {
    const dir = `./public/uploads/images/${req.body.thumbnail}`;

    fs.unlink(dir, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("file terhapus");
    });
    req.flash("msg", "Artikel berhasil dihapus");
    res.redirect("/artikel");
  });
});

// Halaman ubah data artikel
app.get("/artikel/edit/:_id", async (req, res) => {
  const artikel = await Artikel.findOne({ _id: req.params._id });

  res.render("admin/edit-artikel", {
    title: "Halaman ubah Artikel",
    layout: "layouts/admin-layouts",
    user: req.user,
    artikel,
  });
});

// proses ubah data artikel
app.put("/artikel", upload.single("thumbnail"), (req, res) => {
  const judul = req.body.judul;
  const deskripsi = req.body.deskripsi;
  const isiArtikel = req.body.isiArtikel;
  const dieditOleh = req.body.dieditOleh;
  const tanggalDiubah = req.body.tanggalDiubah;
  const updates = { judul, deskripsi, isiArtikel, dieditOleh, tanggalDiubah };
  if (req.file) {
    const thumbnail = req.file.filename;
    updates.thumbnail = thumbnail;
  }
  Artikel.updateOne(
    { _id: req.body._id },
    {
      $set: updates,
    }
  ).then((result) => {
    req.flash("msg", "Artikel berhasil diubah");
    res.redirect("/artikel");
  });
});

// halaman berita
app.get("/berita", requireAuth, async (req, res) => {
  const beritas = await Berita.find();

  res.render("admin/berita", {
    title: "Berita || Himakom",
    layout: "layouts/admin-layouts",
    user: req.user,
    beritas,
    msg: req.flash("msg"),
  });
});

// detail berita
app.get("/berita/:judul", async (req, res) => {
  const beritas = await Berita.find();
  const berita = await Berita.findOne({ judul: req.params.judul });

  res.render("admin/pratinjau-berita", {
    title: "Pratinjau Berita",
    layout: "layouts/admin-layouts",
    beritas,
    berita,
    user: req.user,
  });
});

// halaman tambah berita
app.get("/tambahBerita", requireAuth, async (req, res) => {
  const beritas = await Berita.find();

  res.render("admin/tambah-berita", {
    title: "Berita || Himakom",
    layout: "layouts/admin-layouts",
    user: req.user,
    beritas,
  });
});

// proses tambah artikel
app.post("/tambahBerita", upload.single("thumbnail"), (req, res) => {
  Berita.insertMany(
    {
      judul: req.body.judul,
      deskripsi: req.body.deskripsi,
      isiBerita: req.body.isiBerita,
      tanggalDibuat: req.body.tanggalDibuat,
      penulis: req.body.penulis,
      thumbnail: req.file.filename,
    },
    (error, result) => {
      req.flash("msg", "Berita berhasil ditambah");
      res.redirect("/berita");
    }
  );
});

// proses delete beita
app.delete("/berita", (req, res) => {
  Berita.deleteOne({ _id: req.body._id }).then((result) => {
    const dir = `./public/uploads/images/${req.body.thumbnail}`;

    fs.unlink(dir, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("file terhapus");
    });
    req.flash("msg", "Berita berhasil dihapus");
    res.redirect("/berita");
  });
});

// Halaman ubah data berita
app.get("/berita/edit/:_id", async (req, res) => {
  const berita = await Berita.findOne({ _id: req.params._id });

  res.render("admin/edit-berita", {
    title: "Halaman ubah Berita",
    layout: "layouts/admin-layouts",
    user: req.user,
    berita,
  });
});

// proses ubah data berita
app.put("/berita", upload.single("thumbnail"), (req, res) => {
  const judul = req.body.judul;
  const deskripsi = req.body.deskripsi;
  const isiBerita = req.body.isiBerita;
  const dieditOleh = req.body.dieditOleh;
  const tanggalDiubah = req.body.tanggalDiubah;
  const updates = { judul, deskripsi, isiBerita, dieditOleh, tanggalDiubah };
  if (req.file) {
    const thumbnail = req.file.filename;
    updates.thumbnail = thumbnail;
  }
  Berita.updateOne(
    { _id: req.body._id },
    {
      $set: updates,
    }
  ).then((result) => {
    req.flash("msg", "Berita berhasil diubah");
    res.redirect("/berita");
  });
});

app.get("/logout", function (req, res) {
  cookie = req.cookies;
  for (var prop in cookie) {
    if (!cookie.hasOwnProperty(prop)) {
      continue;
    }
    res.cookie(prop, "", { expires: new Date(0) });
    console.log("user logged out");
    res.render("admin/login", {
      title: "Login || Himakom",
      layout: "layouts/auth-layouts",
      message: "",
      messageClass: "",
    });
  }
});

app.use("/", (req, res) => {
  res.status(404);
  res.render("not-found", {
    title: "404 - Halaman tidak ditemukan",
    layout: "layouts/admin-layouts",
  });
});

app.listen(port, () => {
  console.log(`Himakom || Listening at http://localhost:${port} `);
});
