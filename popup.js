// ================================================
// TARAYICI TEMİZLEYİCİ PRO - ANA JAVASCRIPT
// Popup arayüzü için tüm işlemleri yönetir
// Çoklu dil desteği (i18n) ile
// ================================================

// ============================================
// GLOBAL DEĞİŞKENLER VE VARSAYILAN AYARLAR
// ============================================

// Varsayılan temizlik ayarları
const defaultSettings = {
    // Temizlenecek veriler
    cleanData: {
        history: true,
        cookies: true,
        cache: true,
        downloads: false,
        formData: false,
        localStorage: true,
        indexedDB: false,
        passwords: false
    },
    // Zaman aralığı
    timeRange: 'all',
    // Zamanlama ayarları
    schedule: {
        cleanOnStartup: false,
        cleanOnShutdown: false,
        cleanOnInterval: false,
        intervalValue: 1,
        intervalUnit: 'hours'
    },
    // Genel ayarlar
    general: {
        showNotification: true,
        soundEnabled: false,
        confirmBeforeClean: false
    },
    // İstatistikler
    stats: {
        totalCleans: 0,
        lastClean: null
    }
};

// Mevcut ayarları tutacak değişken
let currentSettings = { ...defaultSettings };

// ============================================
// ÇOKLİ DİL DESTEĞİ (i18n)
// ============================================

// Mesaj al fonksiyonu
function getMessage(key, substitutions = null) {
    try {
        return chrome.i18n.getMessage(key, substitutions) || key;
    } catch (e) {
        return key;
    }
}

// Tüm data-i18n elementlerini güncelle
function localizeUI() {
    // data-i18n attribute'u olan tüm elementleri bul
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const message = getMessage(key);
        if (message && message !== key) {
            element.textContent = message;
        }
    });
    
    // Select option'ları için özel işlem
    document.querySelectorAll('select option[data-i18n]').forEach(option => {
        const key = option.getAttribute('data-i18n');
        const message = getMessage(key);
        if (message && message !== key) {
            option.textContent = message;
        }
    });
    
    // Title attribute'unu güncelle
    document.title = getMessage('extName');
}

// ============================================
// SAYFA YÜKLENDİĞİNDE ÇALIŞACAK KODLAR
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Tarayıcı Temizleyici Pro yüklendi!');
    
    // Önce dili uygula
    localizeUI();
    
    // Kaydedilmiş ayarları yükle
    await loadSettings();
    
    // Arayüzü güncelle
    updateUI();
    
    // Olay dinleyicilerini bağla
    initEventListeners();
    
    // Sonraki temizlik zamanını güncelle
    updateNextCleanTime();
});

// ============================================
// AYARLARI YÜKLEME VE KAYDETME
// ============================================

// Chrome storage'dan ayarları yükle
async function loadSettings() {
    try {
        const result = await chrome.storage.local.get('settings');
        if (result.settings) {
            // Kaydedilmiş ayarları varsayılanlarla birleştir
            currentSettings = mergeDeep(defaultSettings, result.settings);
        }
        console.log('Ayarlar yüklendi:', currentSettings);
    } catch (error) {
        console.error('Ayarlar yüklenirken hata:', error);
    }
}

// Ayarları Chrome storage'a kaydet
async function saveSettings() {
    try {
        await chrome.storage.local.set({ settings: currentSettings });
        console.log('Ayarlar kaydedildi:', currentSettings);
    } catch (error) {
        console.error('Ayarlar kaydedilirken hata:', error);
    }
}

// Derin birleştirme yardımcı fonksiyonu
function mergeDeep(target, source) {
    const output = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            output[key] = mergeDeep(target[key] || {}, source[key]);
        } else {
            output[key] = source[key];
        }
    }
    return output;
}

// ============================================
// ARAYÜZ GÜNCELLEME FONKSİYONLARI
// ============================================

// Tüm arayüzü güncelle
function updateUI() {
    // Temizlik verisi checkbox'larını güncelle
    Object.keys(currentSettings.cleanData).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
            checkbox.checked = currentSettings.cleanData[key];
        }
    });
    
    // Zaman aralığını güncelle
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.value = currentSettings.timeRange;
    }
    
    // Zamanlama ayarlarını güncelle
    const scheduleKeys = ['cleanOnStartup', 'cleanOnShutdown', 'cleanOnInterval'];
    scheduleKeys.forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
            checkbox.checked = currentSettings.schedule[key];
        }
    });
    
    // Interval ayarlarını güncelle
    const intervalValue = document.getElementById('intervalValue');
    const intervalUnit = document.getElementById('intervalUnit');
    if (intervalValue) intervalValue.value = currentSettings.schedule.intervalValue;
    if (intervalUnit) intervalUnit.value = currentSettings.schedule.intervalUnit;
    
    // Interval ayarları panelini göster/gizle
    toggleIntervalSettings();
    
    // Genel ayarları güncelle
    Object.keys(currentSettings.general).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
            checkbox.checked = currentSettings.general[key];
        }
    });
    
    // İstatistikleri güncelle
    updateStats();
    
    // Zamanlama durumunu güncelle
    updateScheduleStatus();
}

// İstatistikleri güncelle
function updateStats() {
    const totalCleans = document.getElementById('totalCleans');
    const lastClean = document.getElementById('lastClean');
    
    if (totalCleans) {
        totalCleans.textContent = currentSettings.stats.totalCleans;
    }
    
    if (lastClean) {
        if (currentSettings.stats.lastClean) {
            const date = new Date(currentSettings.stats.lastClean);
            lastClean.textContent = formatDate(date);
        } else {
            lastClean.textContent = getMessage('statsNever');
        }
    }
}

// Tarih formatlama (i18n destekli)
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    
    // 1 dakikadan az
    if (diff < 60000) return getMessage('timeAgo_justNow');
    // 1 saatten az
    if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return getMessage('timeAgo_minutes', [mins.toString()]);
    }
    // 24 saatten az
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return getMessage('timeAgo_hours', [hours.toString()]);
    }
    // 7 günden az
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return getMessage('timeAgo_days', [days.toString()]);
    }
    
    // Tam tarih
    return date.toLocaleDateString();
}

// Zamanlama durumunu güncelle
function updateScheduleStatus() {
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    
    const { cleanOnStartup, cleanOnShutdown, cleanOnInterval } = currentSettings.schedule;
    
    let statusMessages = [];
    
    if (cleanOnStartup) statusMessages.push(getMessage('scheduleOnStartup').replace('🚀 ', ''));
    if (cleanOnShutdown) statusMessages.push(getMessage('scheduleOnShutdown').replace('🔒 ', ''));
    if (cleanOnInterval) {
        const { intervalValue, intervalUnit } = currentSettings.schedule;
        const unitText = intervalUnit === 'hours' ? getMessage('intervalHours') : getMessage('intervalMinutes');
        statusMessages.push(`${intervalValue} ${unitText}`);
    }
    
    if (statusMessages.length > 0) {
        statusIcon.textContent = '✅';
        statusText.textContent = getMessage('statusActive') + ' ' + statusMessages.join(', ');
    } else {
        statusIcon.textContent = '⏸️';
        statusText.textContent = getMessage('statusOff');
    }
}

// Interval ayarları panelini göster/gizle
function toggleIntervalSettings() {
    const panel = document.getElementById('intervalSettings');
    const checkbox = document.getElementById('cleanOnInterval');
    
    if (panel && checkbox) {
        panel.classList.toggle('hidden', !checkbox.checked);
    }
}

// Sonraki temizlik zamanını güncelle
async function updateNextCleanTime() {
    const nextCleanEl = document.getElementById('nextClean');
    if (!nextCleanEl) return;
    
    try {
        const alarm = await chrome.alarms.get('cleaningAlarm');
        if (alarm) {
            const date = new Date(alarm.scheduledTime);
            nextCleanEl.textContent = `${getMessage('nextClean')} ${date.toLocaleTimeString()}`;
        } else {
            nextCleanEl.textContent = `${getMessage('nextClean')} --`;
        }
    } catch (error) {
        console.error('Alarm bilgisi alınamadı:', error);
    }
}

// ============================================
// OLAY DİNLEYİCİLERİ
// ============================================

function initEventListeners() {
    // Tab geçişleri
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabClick);
    });
    
    // Temizlik verileri checkbox'ları
    Object.keys(currentSettings.cleanData).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                currentSettings.cleanData[key] = checkbox.checked;
                saveSettings();
            });
        }
    });
    
    // Zaman aralığı seçimi
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.addEventListener('change', () => {
            currentSettings.timeRange = timeRange.value;
            saveSettings();
        });
    }
    
    // Hızlı seçim butonları
    const selectAll = document.getElementById('selectAll');
    const selectNone = document.getElementById('selectNone');
    
    if (selectAll) {
        selectAll.addEventListener('click', () => {
            Object.keys(currentSettings.cleanData).forEach(key => {
                currentSettings.cleanData[key] = true;
                const checkbox = document.getElementById(key);
                if (checkbox) checkbox.checked = true;
            });
            saveSettings();
            showNotification(getMessage('msgAllSelected'), 'success');
        });
    }
    
    if (selectNone) {
        selectNone.addEventListener('click', () => {
            Object.keys(currentSettings.cleanData).forEach(key => {
                currentSettings.cleanData[key] = false;
                const checkbox = document.getElementById(key);
                if (checkbox) checkbox.checked = false;
            });
            saveSettings();
            showNotification(getMessage('msgNoneSelected'), 'success');
        });
    }
    
    // Şimdi Temizle butonu
    const cleanNow = document.getElementById('cleanNow');
    if (cleanNow) {
        cleanNow.addEventListener('click', handleCleanNow);
    }
    
    // Zamanlama checkbox'ları
    const scheduleKeys = ['cleanOnStartup', 'cleanOnShutdown', 'cleanOnInterval'];
    scheduleKeys.forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                currentSettings.schedule[key] = checkbox.checked;
                if (key === 'cleanOnInterval') {
                    toggleIntervalSettings();
                }
            });
        }
    });
    
    // Interval ayarları
    const intervalValue = document.getElementById('intervalValue');
    const intervalUnit = document.getElementById('intervalUnit');
    
    if (intervalValue) {
        intervalValue.addEventListener('change', () => {
            currentSettings.schedule.intervalValue = parseInt(intervalValue.value) || 1;
        });
    }
    
    if (intervalUnit) {
        intervalUnit.addEventListener('change', () => {
            currentSettings.schedule.intervalUnit = intervalUnit.value;
        });
    }
    
    // Zamanlamayı Kaydet butonu
    const saveSchedule = document.getElementById('saveSchedule');
    if (saveSchedule) {
        saveSchedule.addEventListener('click', handleSaveSchedule);
    }
    
    // Genel ayarlar checkbox'ları
    Object.keys(currentSettings.general).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                currentSettings.general[key] = checkbox.checked;
                saveSettings();
            });
        }
    });
    
    // Ayarları Sıfırla butonu
    const resetSettings = document.getElementById('resetSettings');
    if (resetSettings) {
        resetSettings.addEventListener('click', handleResetSettings);
    }
}

// ============================================
// OLAY İŞLEYİCİLERİ
// ============================================

// Tab geçişi
function handleTabClick(e) {
    const tabId = e.currentTarget.dataset.tab;
    
    // Tüm tab butonlarından active sınıfını kaldır
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Tıklanan butona active sınıfını ekle
    e.currentTarget.classList.add('active');
    
    // Tüm panelleri gizle
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Seçilen paneli göster
    const panel = document.getElementById(tabId);
    if (panel) {
        panel.classList.add('active');
    }
}

// Şimdi Temizle
async function handleCleanNow() {
    const btn = document.getElementById('cleanNow');
    
    // Onay kontrolü
    if (currentSettings.general.confirmBeforeClean) {
        if (!confirm(getMessage('confirmClean'))) {
            return;
        }
    }
    
    // Butonu devre dışı bırak ve yükleniyor göster
    btn.classList.add('loading');
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-icon">⏳</span><span>${getMessage('btnCleaning')}</span>`;
    
    try {
        // Background script'e temizlik isteği gönder
        const response = await chrome.runtime.sendMessage({
            action: 'cleanNow',
            data: currentSettings.cleanData,
            timeRange: currentSettings.timeRange
        });
        
        if (response && response.success) {
            // İstatistikleri güncelle
            currentSettings.stats.totalCleans++;
            currentSettings.stats.lastClean = new Date().toISOString();
            await saveSettings();
            updateStats();
            
            showNotification(getMessage('msgCleanSuccess'), 'success');
        } else {
            showNotification(getMessage('msgError'), 'error');
        }
    } catch (error) {
        console.error('Temizlik hatası:', error);
        showNotification(getMessage('msgError') + ': ' + error.message, 'error');
    } finally {
        // Butonu normale döndür
        btn.classList.remove('loading');
        btn.disabled = false;
        btn.innerHTML = `<span class="btn-icon">🚀</span><span>${getMessage('btnCleanNow')}</span>`;
    }
}

// Zamanlamayı Kaydet
async function handleSaveSchedule() {
    try {
        // Ayarları kaydet
        await saveSettings();
        
        // Background script'e zamanlama güncellemesi gönder
        const response = await chrome.runtime.sendMessage({
            action: 'updateSchedule',
            schedule: currentSettings.schedule
        });
        
        if (response && response.success) {
            updateScheduleStatus();
            await updateNextCleanTime();
            showNotification(getMessage('msgScheduleSaved'), 'success');
        } else {
            showNotification(getMessage('msgError'), 'error');
        }
    } catch (error) {
        console.error('Zamanlama kaydetme hatası:', error);
        showNotification(getMessage('msgError'), 'error');
    }
}

// Ayarları Sıfırla
async function handleResetSettings() {
    if (!confirm(getMessage('confirmReset'))) {
        return;
    }
    
    try {
        // Varsayılan ayarlara dön
        currentSettings = JSON.parse(JSON.stringify(defaultSettings));
        await saveSettings();
        
        // Alarmları temizle
        await chrome.runtime.sendMessage({ action: 'clearAlarms' });
        
        // Arayüzü güncelle
        updateUI();
        
        showNotification(getMessage('msgSettingsReset'), 'success');
    } catch (error) {
        console.error('Ayarlar sıfırlanırken hata:', error);
        showNotification(getMessage('msgError'), 'error');
    }
}

// ============================================
// BİLDİRİM SİSTEMİ
// ============================================

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const icon = notification.querySelector('.notification-icon');
    const text = notification.querySelector('.notification-text');
    
    // İkon ve mesajı ayarla
    icon.textContent = type === 'success' ? '✅' : '❌';
    text.textContent = message;
    
    // Hata durumunda renk değiştir
    notification.classList.remove('error');
    if (type === 'error') {
        notification.classList.add('error');
    }
    
    // Bildirimi göster
    notification.classList.remove('hidden');
    notification.classList.add('show');
    
    // 3 saniye sonra gizle
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 300);
    }, 3000);
    
    // Ses efekti (eğer açıksa)
    if (currentSettings.general.soundEnabled) {
        playNotificationSound();
    }
}

// Basit ses efekti
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Ses çalınamadı:', error);
    }
}

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

// Zaman aralığını milisaniyeye çevir
function getTimeRangeMs(range) {
    const now = Date.now();
    switch (range) {
        case 'hour': return now - (60 * 60 * 1000);
        case 'day': return now - (24 * 60 * 60 * 1000);
        case 'week': return now - (7 * 24 * 60 * 60 * 1000);
        case 'month': return now - (30 * 24 * 60 * 60 * 1000);
        case 'all': return 0;
        default: return 0;
    }
}

console.log('Popup.js yükleme tamamlandı!');
