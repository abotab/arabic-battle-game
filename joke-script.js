// ===============================================
// مولد النكات العشوائية
// ===============================================

let jokeCount = 0;
let jokeHistory = [];
let currentCategory = 'any';
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// تحميل المظهر المحفوظ
if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('themeIcon').textContent = '☀️';
}

// ===============================================
// جلب النكتة من API
// ===============================================

async function getJoke() {
    const btn = document.getElementById('getJokeBtn');
    const jokeContent = document.getElementById('jokeContent');
    
    // تعطيل الزر أثناء التحميل
    btn.disabled = true;
    jokeContent.innerHTML = '<p class="loading">جاري تحميل النكتة...</p>';
    
    try {
        // JokeAPI - API مجانية للنكات
        let url = 'https://v2.jokeapi.dev/joke/';
        
        if (currentCategory === 'any') {
            url += 'Any';
        } else {
            url += currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
        }
        
        // إضافة معاملات إضافية
        url += '?format=json&type=single&safe-mode=true';
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('فشل في جلب النكتة');
        }
        
        const data = await response.json();
        
        // عرض النكتة
        if (data.joke) {
            displayJoke(data.joke);
        } else if (data.setup && data.delivery) {
            displayJoke(`${data.setup}\n\n${data.delivery}`);
        }
        
        jokeCount++;
        document.getElementById('jokeCount').textContent = jokeCount;
        
        // إضافة إلى السجل
        addToHistory(data.joke || `${data.setup} - ${data.delivery}`);
        
    } catch (error) {
        jokeContent.innerHTML = `
            <p style="color: #d63031;">
                😅 عذراً، حدث خطأ في جلب النكتة!
                <br><small>${error.message}</small>
            </p>
        `;
        console.error('Error:', error);
    } finally {
        btn.disabled = false;
    }
}

// ===============================================
// عرض النكتة
// ===============================================

function displayJoke(joke) {
    const jokeContent = document.getElementById('jokeContent');
    jokeContent.innerHTML = `<p class="fade-in">${joke}</p>`;
    
    // تأثير الحركة
    jokeContent.style.animation = 'none';
    setTimeout(() => {
        jokeContent.style.animation = 'slideDown 0.5s ease';
    }, 10);
}

// ===============================================
// مشاركة النكتة
// ===============================================

function shareJoke() {
    const jokeText = document.getElementById('jokeContent').innerText;
    
    if (jokeText === 'جاري تحميل النكتة...') {
        alert('الرجاء تحميل نكتة أولاً!');
        return;
    }
    
    // نسخ إلى الحافظة
    navigator.clipboard.writeText(jokeText).then(() => {
        // إظهار رسالة تأكيد
        const btn = document.getElementById('shareBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="btn-icon">✅</span>تم النسخ!';
        btn.style.background = 'linear-gradient(135deg, #00b894, #00a383)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
        
        // محاولة المشاركة عبر Share API
        if (navigator.share) {
            navigator.share({
                title: 'نكتة مضحكة! 😂',
                text: jokeText
            }).catch(err => console.log('Share failed:', err));
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('فشل نسخ النكتة');
    });
}

// ===============================================
// إدارة السجل
// ===============================================

function addToHistory(joke) {
    const maxHistory = 5;
    
    // تقصير النكتة إذا كانت طويلة جداً
    let shortJoke = joke.length > 50 ? joke.substring(0, 50) + '...' : joke;
    
    jokeHistory.unshift(shortJoke);
    
    if (jokeHistory.length > maxHistory) {
        jokeHistory.pop();
    }
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('jokeHistory');
    historyList.innerHTML = '';
    
    jokeHistory.forEach((joke, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${joke}`;
        li.style.animationDelay = `${index * 0.1}s`;
        historyList.appendChild(li);
    });
}

// ===============================================
// اختيار الفئة
// ===============================================

function setCategory(category) {
    currentCategory = category;
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
}

// ===============================================
// تبديل المظهر (الليل والنهار)
// ===============================================

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
}

// ===============================================
// حفظ البيانات
// ===============================================

function saveData() {
    localStorage.setItem('jokeCount', jokeCount);
    localStorage.setItem('jokeHistory', JSON.stringify(jokeHistory));
}

function loadData() {
    const savedCount = localStorage.getItem('jokeCount');
    const savedHistory = localStorage.getItem('jokeHistory');
    
    if (savedCount) {
        jokeCount = parseInt(savedCount);
        document.getElementById('jokeCount').textContent = jokeCount;
    }
    
    if (savedHistory) {
        jokeHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

// ===============================================
// الأحداث
// ===============================================

window.addEventListener('beforeunload', saveData);
window.addEventListener('load', loadData);

// جلب نكتة افتراضية عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        getJoke();
    }, 500);
});

// ===============================================
// دعم لوحة المفاتيح
// ===============================================

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!document.getElementById('getJokeBtn').disabled) {
            getJoke();
        }
    }
});

// ===============================================
// معلومات API
// ===============================================

const apiInfo = {
    name: 'JokeAPI',
    url: 'https://jokeapi.dev',
    description: 'API مجانية للحصول على نكات عشوائية',
    categories: ['general', 'programming', 'knock-knock', 'any'],
    features: [
        'نكات متعددة اللغات',
        'تصفية حسب الفئة',
        'صيغة JSON',
        'بدون مفتاح API مطلوب'
    ]
};

console.log('🎭 مولد النكات يستخدم:', apiInfo.name);
console.log('📡 موقع API:', apiInfo.url);
console.log('📋 الفئات المتاحة:', apiInfo.categories);