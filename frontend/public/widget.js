(function() {
    // --- 0. CONFIGURATION ---
    // هذا هو رابط الباك-إند الحي الخاص بك على Render
    const BASE_API_URL = "https://leadify-fkt3.onrender.com";

    // --- 1. BOOTSTRAPPING & SETUP ---
    if (window.directWidgetLoaded) return;
    window.directWidgetLoaded = true;

    console.log("Direct Widget: Script has been loaded.");

    const scriptTag = document.currentScript;
    if (!scriptTag) {
        console.error("Direct Widget: Could not find the script tag.");
        return;
    }

    const campaignId = scriptTag.getAttribute('data-campaign-id');
    if (!campaignId) {
        console.error("Direct Widget: The 'data-campaign-id' attribute is missing.");
        return;
    }
    console.log(`Direct Widget: Initializing for Campaign ID: ${campaignId}`);


    // --- 2. API CALL TO FETCH SETTINGS ---
    // تصحيح الرابط هنا لاستخدام السيرفر الحي
    const apiUrl = `${BASE_API_URL}/public/campaigns/${campaignId}/settings?cache_bust=${new Date().getTime()}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load widget settings: ${response.statusText}`);
            }
            return response.json();
        })
        .then(settings => {
            console.log("Direct Widget: Settings received:", settings);
            
            // --- المنطق الجديد: تأخير الظهور ---
            const delayInSeconds = settings.delay_seconds || 0;
            console.log(`Direct Widget: Waiting for ${delayInSeconds} seconds to show.`);
            
            // استدعاء دالة بناء الـ Widget بعد فترة التأخير
            setTimeout(() => {
                createAndShowWidget(settings);
            }, delayInSeconds * 1000); // تحويل الثواني إلى ميلي ثانية
        })
        .catch(error => {
            console.error('Direct Widget: Initialization failed:', error);
        });


    // --- 3. FUNCTION TO CREATE, SHOW, AND MANAGE THE WIDGET ---
    function createAndShowWidget(settings) {
        // --- A. CREATE CSS STYLES ---
        const style = document.createElement('style');
        style.innerHTML = `
            .direct-widget-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex; justify-content: center; align-items: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                direction: rtl;
            }
            .direct-widget-modal {
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.25);
                width: 90%;
                max-width: 400px;
                text-align: center;
                font-family: 'Tajawal', sans-serif;
                transform: scale(0.95) translateY(10px);
                transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
                opacity: 0;
                position: relative;
            }
            .direct-widget-modal.visible {
                transform: scale(1) translateY(0);
                opacity: 1;
            }
            .direct-widget-modal h2 {
                margin-top: 0;
                margin-bottom: 15px;
                color: #333;
                font-size: 24px;
            }
            .direct-widget-modal p {
                margin-top: 0;
                margin-bottom: 20px;
                color: #555;
                font-size: 16px;
            }
            .direct-widget-modal input {
                width: 100%; padding: 12px; margin-bottom: 15px;
                box-sizing: border-box; border: 1px solid #ccc;
                border-radius: 8px; font-size: 16px; font-family: 'Tajawal', sans-serif;
            }
            .direct-widget-modal input:focus {
                border-color: #4263EB; outline: none; box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.2);
            }
                
           .direct-widget-modal button[type="submit"] {
                width: 100%;
                padding: 12px;
                border: none;
                background-color: var(--widget-button-color, #4263EB); 
                color: white;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.2s, filter 0.2s;
            }

            .direct-widget-modal button[type="submit"]:hover {
                filter: brightness(90%);
            }

            .direct-widget-modal button[type="submit"]:disabled {
                background-color: #ccc;
                filter: none;
                cursor: not-allowed;
            }
            .direct-widget-close-btn {
                position: absolute;
                top: 15px;
                right: 15px;
                font-size: 28px; border: none; background: none;
                cursor: pointer; color: #aaa; padding: 0; line-height: 1;
                z-index: 10;
            }
            .direct-widget-close-btn:hover {
                color: #333;
            }
        `;
        document.head.appendChild(style);

        // --- B. CREATE HTML ELEMENTS ---
        const overlay = document.createElement('div');
        overlay.className = 'direct-widget-overlay';

        const modal = document.createElement('div');
        modal.className = 'direct-widget-modal';
        
        modal.innerHTML = `
            <button class="direct-widget-close-btn" title="Close">×</button>
            <div style="padding: 30px 30px 0 30px;">
                <h2>${settings.title}</h2>
            </div>
            <div style="padding: 0 30px 30px 30px;">
                <form id="direct-widget-form">
                    <input type="email" name="email" placeholder="${settings.placeholder_text}" required />
                    <button 
                        type="submit" 
                        style="--widget-button-color: ${settings.button_color || '#4263EB'};"
                    >
                        ${settings.button_text}
                    </button>                    
                </form>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.classList.add('visible');
        }, 10);

        // --- C. ADD EVENT LISTENERS ---
        const form = modal.querySelector('#direct-widget-form');
        const closeButton = modal.querySelector('.direct-widget-close-btn');

        const closeWidget = () => {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.9)';
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 300);
        };

        closeButton.addEventListener('click', closeWidget);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.elements.email.value;
            const submitButton = form.querySelector('button[type="submit"]');

            submitButton.disabled = true;
            submitButton.textContent = 'جاري الإرسال...';

            // تصحيح الرابط هنا أيضاً لاستخدام السيرفر الحي
            fetch(`${BASE_API_URL}/public/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    campaign_id: parseInt(campaignId)
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.detail || 'Something went wrong') });
                }
                return null;
            })
            .then(() => {
                console.log("Direct Widget: Subscription successful!");
                modal.innerHTML = `
                    <button class="direct-widget-close-btn" title="Close">×</button>
                    <div style="padding: 30px;">
                        <h2>شكرًا لك!</h2>
                        <p>تم إرسال المحتوى إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.</p>
                    </div>
                `;
                modal.querySelector('.direct-widget-close-btn').addEventListener('click', closeWidget);
                setTimeout(closeWidget, 4000);
            })
            .catch(error => {
                console.error('Direct Widget: Subscription failed:', error);
                alert(`حدث خطأ: ${error.message}`);
                submitButton.disabled = false;
                submitButton.textContent = settings.button_text;
            });
        });
    }
})();