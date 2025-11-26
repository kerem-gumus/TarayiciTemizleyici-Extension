# 🧹 Tarayıcı Temizleyici Pro | Browser Cleaner Pro

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow.svg)
![Platform](https://img.shields.io/badge/platform-Chromium-orange.svg)

**🇹🇷 Türkçe** | [🇬🇧 English](#-english)

</div>

---

## 🇹🇷 Türkçe

### 📖 Açıklama

**Tarayıcı Temizleyici Pro**, Chromium tabanlı tarayıcılar için geliştirilmiş güçlü bir veri temizleme eklentisidir. Tarama geçmişinizi, çerezlerinizi, önbelleğinizi ve diğer verilerinizi otomatik veya manuel olarak temizleyebilirsiniz.

### ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🗑️ **8 Farklı Veri Türü** | Geçmiş, çerezler, önbellek, indirmeler, form verileri, yerel depolama, IndexedDB, şifreler |
| ⏰ **Otomatik Temizlik** | Açılışta, kapanışta veya belirli aralıklarla otomatik temizlik |
| 🕐 **Zaman Aralığı** | Son 1 saat, 24 saat, 1 hafta, 1 ay veya tüm zamanlar |
| 🎨 **Modern Arayüz** | Koyu tema, animasyonlar ve kullanıcı dostu tasarım |
| 📊 **İstatistikler** | Toplam temizlik sayısı ve son temizlik zamanı |
| 🔔 **Bildirimler** | Temizlik sonrası bildirim ve ses efekti seçeneği |

### 🚀 Kurulum

1. Bu repoyu indirin veya klonlayın:
   ```bash
   git clone https://github.com/kerem-gumus/TarayiciTemizleyici-Extension.git
   ```

2. Chrome tarayıcısında `chrome://extensions` adresine gidin

3. Sağ üst köşeden **"Geliştirici modu"** anahtarını açın

4. **"Paketlenmemiş öğe yükle"** butonuna tıklayın

5. İndirdiğiniz `TarayiciTemizleyici-Extension` klasörünü seçin

6. Eklenti yüklendi! 🎉

### 📸 Ekran Görüntüleri

<details>
<summary>Temizlik Sekmesi</summary>

- 8 farklı veri türü seçimi
- Zaman aralığı seçimi
- Hızlı seç/kaldır butonları
- Şimdi Temizle butonu

</details>

<details>
<summary>Zamanlama Sekmesi</summary>

- Tarayıcı açılışında temizlik
- Tarayıcı kapanışında temizlik
- Zamanlayıcı ile periyodik temizlik
- Durum göstergesi

</details>

<details>
<summary>Ayarlar Sekmesi</summary>

- Bildirim ayarları
- Ses efekti
- Onay penceresi
- İstatistikler
- Ayarları sıfırlama

</details>

### ⚙️ Desteklenen Tarayıcılar

- ✅ Google Chrome (v88+)
- ✅ Microsoft Edge (Chromium)
- ✅ Brave Browser
- ✅ Opera (Chromium)
- ✅ Vivaldi
- ✅ Diğer Chromium tabanlı tarayıcılar

### ⚠️ Önemli Uyarılar

> **Çerezler temizlendiğinde:** Tüm sitelerden çıkış yapılır, tekrar giriş yapmanız gerekir.

> **Şifreler temizlendiğinde:** Kaydedilmiş şifreler kalıcı olarak silinir ve geri alınamaz!

---

## 🇬🇧 English

### 📖 Description

**Browser Cleaner Pro** is a powerful data cleaning extension developed for Chromium-based browsers. You can clean your browsing history, cookies, cache, and other data automatically or manually.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🗑️ **8 Different Data Types** | History, cookies, cache, downloads, form data, local storage, IndexedDB, passwords |
| ⏰ **Automatic Cleaning** | Auto-clean on startup, shutdown, or at specific intervals |
| 🕐 **Time Range** | Last 1 hour, 24 hours, 1 week, 1 month, or all time |
| 🎨 **Modern Interface** | Dark theme, animations, and user-friendly design |
| 📊 **Statistics** | Total cleaning count and last cleaning time |
| 🔔 **Notifications** | Post-cleaning notification and sound effect options |

### 🚀 Installation

1. Download or clone this repository:
   ```bash
   git clone https://github.com/kerem-gumus/TarayiciTemizleyici-Extension.git
   ```

2. Go to `chrome://extensions` in Chrome browser

3. Enable **"Developer mode"** toggle in the top right corner

4. Click **"Load unpacked"** button

5. Select the downloaded `TarayiciTemizleyici-Extension` folder

6. Extension installed! 🎉

### ⚙️ Supported Browsers

- ✅ Google Chrome (v88+)
- ✅ Microsoft Edge (Chromium)
- ✅ Brave Browser
- ✅ Opera (Chromium)
- ✅ Vivaldi
- ✅ Other Chromium-based browsers

### ⚠️ Important Warnings

> **When cookies are cleared:** You will be logged out of all websites and need to log in again.

> **When passwords are cleared:** Saved passwords are permanently deleted and cannot be recovered!

---

## 📁 Project Structure

```
TarayiciTemizleyici-Extension/
├── manifest.json       # Extension configuration
├── popup.html          # User interface
├── popup.css           # Styling (dark theme)
├── popup.js            # UI JavaScript
├── background.js       # Background service (scheduler)
├── KULLANIM.txt        # Turkish user guide
├── README.md           # This file
├── LICENSE             # MIT License
└── icons/
    ├── icon16.png      # 16x16 icon
    ├── icon48.png      # 48x48 icon
    └── icon128.png     # 128x128 icon
```

## 🛠️ Technologies Used

- **Manifest V3** - Latest Chrome extension standard
- **Chrome APIs:**
  - `chrome.browsingData` - Data cleaning
  - `chrome.storage` - Settings storage
  - `chrome.alarms` - Scheduler
  - `chrome.windows` - Window events
  - `chrome.runtime` - Extension lifecycle

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Kerem Gümüş**

- GitHub: [@kerem-gumus](https://github.com/kerem-gumus)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⭐ Show Your Support

Give a ⭐ if this project helped you!

---

<div align="center">

Made with ❤️ in Turkey 🇹🇷

</div>

