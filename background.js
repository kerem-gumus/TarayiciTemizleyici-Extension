// ================================================
// TARAYICI TEMİZLEYİCİ PRO - ARKA PLAN SERVİSİ
// Service Worker - Zamanlayıcı ve olay yönetimi
// ================================================

console.log('🧹 Tarayıcı Temizleyici Pro - Background Service başlatıldı!');

// ============================================
// VARSAYILAN AYARLAR
// ============================================

const defaultSettings = {
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
    timeRange: 'all',
    schedule: {
        cleanOnStartup: false,
        cleanOnShutdown: false,
        cleanOnInterval: false,
        intervalValue: 1,
        intervalUnit: 'hours'
    },
    general: {
        showNotification: true,
        soundEnabled: false,
        confirmBeforeClean: false
    },
    stats: {
        totalCleans: 0,
        lastClean: null
    }
};

// ============================================
// EKLENTI KURULUMU VE GÜNCELLEME
// ============================================

// Eklenti ilk kurulduğunda
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('📦 Eklenti kuruldu/güncellendi:', details.reason);
    
    if (details.reason === 'install') {
        // İlk kurulumda varsayılan ayarları kaydet
        await chrome.storage.local.set({ settings: defaultSettings });
        console.log('✅ Varsayılan ayarlar kaydedildi');
        
        // Hoş geldin bildirimi
        showBrowserNotification(
            'Tarayıcı Temizleyici Pro Kuruldu! 🎉',
            'Eklenti simgesine tıklayarak ayarlarınızı yapılandırabilirsiniz.'
        );
    } else if (details.reason === 'update') {
        console.log('🔄 Eklenti güncellendi');
    }
});

// ============================================
// TARAYICI BAŞLANGIÇ OLAYI
// ============================================

// Chrome her başlatıldığında çalışır
chrome.runtime.onStartup.addListener(async () => {
    console.log('🚀 Tarayıcı başlatıldı');
    
    const settings = await getSettings();
    
    // Açılışta temizlik aktifse
    if (settings.schedule.cleanOnStartup) {
        console.log('🧹 Açılışta temizlik başlatılıyor...');
        await performCleaning(settings.cleanData, settings.timeRange);
    }
    
    // Zamanlayıcı aktifse yeniden kur
    if (settings.schedule.cleanOnInterval) {
        await setupAlarm(settings.schedule);
    }
});

// ============================================
// TARAYICI KAPANIŞ OLAYI
// ============================================

// Tarayıcı kapanmadan önce (son pencere kapanırken)
chrome.windows.onRemoved.addListener(async (windowId) => {
    // Açık pencere sayısını kontrol et
    const windows = await chrome.windows.getAll();
    
    // Eğer bu son pencereyse (kapanış)
    if (windows.length === 0) {
        console.log('🔒 Son pencere kapatıldı - tarayıcı kapanıyor');
        
        const settings = await getSettings();
        
        if (settings.schedule.cleanOnShutdown) {
            console.log('🧹 Kapanışta temizlik başlatılıyor...');
            await performCleaning(settings.cleanData, settings.timeRange);
        }
    }
});

// ============================================
// ALARM (ZAMANLI TEMİZLİK) YÖNETİMİ
// ============================================

// Alarm tetiklendiğinde
chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log('⏰ Alarm tetiklendi:', alarm.name);
    
    if (alarm.name === 'cleaningAlarm') {
        const settings = await getSettings();
        
        console.log('🧹 Zamanlı temizlik başlatılıyor...');
        await performCleaning(settings.cleanData, settings.timeRange);
        
        // İstatistikleri güncelle
        settings.stats.totalCleans++;
        settings.stats.lastClean = new Date().toISOString();
        await chrome.storage.local.set({ settings });
    }
});

// Alarm kurulumu
async function setupAlarm(schedule) {
    // Önce mevcut alarmı temizle
    await chrome.alarms.clear('cleaningAlarm');
    
    if (schedule.cleanOnInterval) {
        // Dakikayı hesapla
        let periodInMinutes;
        if (schedule.intervalUnit === 'hours') {
            periodInMinutes = schedule.intervalValue * 60;
        } else {
            periodInMinutes = schedule.intervalValue;
        }
        
        // Minimum 1 dakika olmalı
        periodInMinutes = Math.max(1, periodInMinutes);
        
        // Alarmı kur
        await chrome.alarms.create('cleaningAlarm', {
            periodInMinutes: periodInMinutes,
            delayInMinutes: periodInMinutes // İlk çalışma da aynı süre sonra
        });
        
        console.log(`✅ Zamanlayıcı kuruldu: Her ${periodInMinutes} dakikada bir`);
        return true;
    }
    
    return false;
}

// Tüm alarmları temizle
async function clearAllAlarms() {
    await chrome.alarms.clearAll();
    console.log('🗑️ Tüm alarmlar temizlendi');
}

// ============================================
// TEMİZLİK FONKSİYONLARI
// ============================================

// Ana temizlik fonksiyonu
async function performCleaning(cleanData, timeRange) {
    console.log('🧹 Temizlik başlıyor...', { cleanData, timeRange });
    
    try {
        // Zaman aralığını hesapla
        const since = getTimeSince(timeRange);
        
        // Temizlenecek verileri hazırla
        const removalOptions = {
            since: since
        };
        
        // browsingData API için veri türleri
        const dataToRemove = {};
        
        if (cleanData.history) dataToRemove.history = true;
        if (cleanData.cookies) dataToRemove.cookies = true;
        if (cleanData.cache) dataToRemove.cache = true;
        if (cleanData.downloads) dataToRemove.downloads = true;
        if (cleanData.formData) dataToRemove.formData = true;
        if (cleanData.localStorage) dataToRemove.localStorage = true;
        if (cleanData.indexedDB) dataToRemove.indexedDB = true;
        if (cleanData.passwords) dataToRemove.passwords = true;
        
        // Ek veri türleri (her zaman temizle)
        if (cleanData.cache) {
            dataToRemove.cacheStorage = true;
            dataToRemove.serviceWorkers = true;
        }
        
        // En az bir veri seçili mi kontrol et
        if (Object.keys(dataToRemove).length === 0) {
            console.log('⚠️ Temizlenecek veri seçilmedi');
            return { success: false, message: 'Temizlenecek veri seçilmedi' };
        }
        
        console.log('📋 Temizlenecek veriler:', dataToRemove);
        
        // Temizliği gerçekleştir
        await chrome.browsingData.remove(removalOptions, dataToRemove);
        
        console.log('✅ Temizlik tamamlandı!');
        
        // Bildirim göster
        const settings = await getSettings();
        if (settings.general.showNotification) {
            showBrowserNotification(
                'Temizlik Tamamlandı! ✨',
                'Tarayıcı verileriniz başarıyla temizlendi.'
            );
        }
        
        return { success: true, message: 'Temizlik tamamlandı' };
        
    } catch (error) {
        console.error('❌ Temizlik hatası:', error);
        return { success: false, message: error.message };
    }
}

// Zaman aralığını milisaniyeye çevir
function getTimeSince(range) {
    const now = Date.now();
    switch (range) {
        case 'hour':
            return now - (60 * 60 * 1000);
        case 'day':
            return now - (24 * 60 * 60 * 1000);
        case 'week':
            return now - (7 * 24 * 60 * 60 * 1000);
        case 'month':
            return now - (30 * 24 * 60 * 60 * 1000);
        case 'all':
        default:
            return 0;
    }
}

// ============================================
// MESAJ DİNLEYİCİ (POPUP İLE İLETİŞİM)
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📩 Mesaj alındı:', message);
    
    // Async işlemler için
    handleMessage(message).then(sendResponse);
    
    // Async yanıt için true döndür
    return true;
});

// Mesaj işleyici
async function handleMessage(message) {
    switch (message.action) {
        case 'cleanNow':
            // Manuel temizlik
            const result = await performCleaning(message.data, message.timeRange);
            return result;
            
        case 'updateSchedule':
            // Zamanlama güncelleme
            try {
                const settings = await getSettings();
                settings.schedule = message.schedule;
                await chrome.storage.local.set({ settings });
                
                // Alarmı güncelle
                if (message.schedule.cleanOnInterval) {
                    await setupAlarm(message.schedule);
                } else {
                    await chrome.alarms.clear('cleaningAlarm');
                }
                
                return { success: true };
            } catch (error) {
                console.error('Zamanlama güncelleme hatası:', error);
                return { success: false, message: error.message };
            }
            
        case 'clearAlarms':
            // Tüm alarmları temizle
            await clearAllAlarms();
            return { success: true };
            
        case 'getStatus':
            // Durum bilgisi
            const alarm = await chrome.alarms.get('cleaningAlarm');
            return {
                success: true,
                hasAlarm: !!alarm,
                nextAlarm: alarm ? alarm.scheduledTime : null
            };
            
        default:
            console.log('⚠️ Bilinmeyen mesaj:', message.action);
            return { success: false, message: 'Bilinmeyen işlem' };
    }
}

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

// Ayarları al
async function getSettings() {
    try {
        const result = await chrome.storage.local.get('settings');
        return result.settings || defaultSettings;
    } catch (error) {
        console.error('Ayarlar alınamadı:', error);
        return defaultSettings;
    }
}

// Tarayıcı bildirimi göster
function showBrowserNotification(title, message) {
    // Basit bildirim (notification izni gerekmez, sadece badge kullanırız)
    // Not: Tam bildirim için notifications izni gerekir
    console.log('🔔 Bildirim:', title, '-', message);
    
    // Badge'i güncelle (opsiyonel)
    try {
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
        
        // 3 saniye sonra badge'i temizle
        setTimeout(() => {
            chrome.action.setBadgeText({ text: '' });
        }, 3000);
    } catch (error) {
        console.log('Badge güncellenemedi:', error);
    }
}

// ============================================
// SERVICE WORKER KEEP-ALIVE (OPSIYONEL)
// ============================================

// Service worker'ın uyumaması için periyodik kontrol
// Not: Chrome bunu otomatik yönetir, ama alarmlar varken uyanık kalır

console.log('✅ Background service hazır!');

