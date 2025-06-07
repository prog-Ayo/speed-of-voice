'use strict';
// header menu animation start
  window.addEventListener('DOMContentLoaded', () => {
    const ul = document.querySelector('ul');
    
    // بعد نصف ثانية، نفعل المتغير --active
    setTimeout(() => {
      ul.style.setProperty('--active', 1);
    }, 900);

    // تفعيل اللوب بين العناصر
    const items = document.querySelectorAll('li');
    let index = 1;
    setInterval(() => {
      items.forEach((item, i) => {
        item.style.setProperty('--hovered', i === index ? 1 : 0);
      });
      index = (index + 1) % items.length;
    }, 900); // كل 900 يتغير العنصر
  });

// header menu animation end

// part two (left part) animation start

  const target = document.querySelector(".part1_2_1");
  let animationFrame;
  let isAnimating = false;

  function animateMaxHeight(show) {
    if (isAnimating) return;
    isAnimating = true;

    let startHeight = show ? 0 : target.scrollHeight;
    let endHeight = show ? target.scrollHeight : 0;
    let duration = 7000; 
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      let progress = (timestamp - startTime) / duration;
      if (progress > 1) progress = 1;

      let currentHeight = startHeight + (endHeight - startHeight) * progress;
      target.style.maxHeight = currentHeight + "px";

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        isAnimating = false;
      }
    }

    cancelAnimationFrame(animationFrame);
    requestAnimationFrame(step);
  }

  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= window.innerHeight && rect.bottom >= 0
    );
  }

  let wasInView = false;

  function handleScroll() {
    const inView = isInViewport(target);

    if (inView && !wasInView) {
      animateMaxHeight(true);
      wasInView = true;
    } else if (!inView && wasInView) {
      animateMaxHeight(false);
      wasInView = false;
    }
  }

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("load", handleScroll);

  //part two (right part) type writter animation  
const part1 = document.querySelector(".part1_1");
const textElement = part1.querySelector("p");
const button = part1.querySelector("button");
const originalText = textElement.textContent.trim();
let hasAnimated = false;

function typeWriterEffect(text, element, speed = 20, callback) {
  element.textContent = "";
  let index = 0;
  function type() {
    if (index < text.length) {
      element.textContent += text[index];
      index++;
      setTimeout(type, speed);
    } else {
      if (callback) callback();
    }
  }
  type();
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top <= window.innerHeight && rect.bottom >= 0
  );
}

function handleScrollPart1() {
  if (isInViewport(part1) && !hasAnimated) {
    hasAnimated = true; 
    textElement.style.opacity = 1;
    typeWriterEffect(originalText, textElement, 15, () => {
      button.classList.add("show"); // يظهر الزر بعد انتهاء الكتابة
    });
  } else if (!isInViewport(part1)) {
    hasAnimated = false;
    textElement.textContent = "";
    textElement.style.opacity = 0;
    button.classList.remove("show");
  }
}

window.addEventListener("scroll", handleScrollPart1);
window.addEventListener("load", handleScrollPart1);

// top bottom feature 
window.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".part2_1");

  setInterval(() => {
    const children = Array.from(container.children);

    // نضيف تأثير "يصعد" للعنصر الأول
    children[2].style.transform = "translateY(-15%)";

    // البقية ينزاحون للأسفل
    for (let i = 3; i < children.length; i++) {
      children[i].style.transform = "translateY(-10%)";
    }

    // بعد نهاية الحركة
    setTimeout(() => {
      // نشيل كل التحويلات
      children.forEach(child => {
        child.style.transform = "translateY(0)";
      });

      // نحرك العنصر الأول للنهاية
      container.appendChild(children[0]);
    }, 500); // نفس مدة transition
  }, 2500); // كل 2.5 ثانية
});
// display when scroll to item 
  window.addEventListener("DOMContentLoaded", () => {
    const target = document.querySelector(".part2_2");

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            target.classList.add("visible");
          }, 600); // تأخير ثانية واحدة
          observer.unobserve(target); // نوقف المراقبة بعد أول ظهور
        }
      });
    }, {
      threshold: 1 // يظهر فقط إذا العنصر كامل داخل الشاشة
    });

    observer.observe(target);
  });



// mic and file part
const recordBtn = document.getElementById('recordBtn');
const micImg = document.getElementById('micImg');
const audioPlayback = document.getElementById('audioPlayback');
const durationDisplay = document.getElementById('duration');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');

let isRecording = false;
let mediaRecorder, chunks = [], startTime, endTime;

recordBtn.addEventListener('click', async () => {
  // إذا ما مسجل حالياً – نبدأ التسجيل
  if (!isRecording) {
    durationDisplay.innerHTML = ""; // ← يمسح النص السابق قبل بدء تسجيل جديد

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      chunks = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);

      mediaRecorder.onstop = () => {
        console.log("🛑 التسجيل توقف");
        endTime = new Date();

        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(blob);
        audioPlayback.src = audioURL;
        audioPlayback.style.display = 'block';

        const durationInSeconds = (endTime - startTime) / 1000;
        durationDisplay.innerHTML = ` <p> ⏱️ Registration period : ${durationInSeconds.toFixed(2)} sec </p>`;

        const formData = new FormData();
        formData.append('audio', blob, 'recorded.webm');
        formData.append('duration', durationInSeconds);

        sendToServer(formData);
      };

      mediaRecorder.start();
      startTime = new Date();
      micImg.src = 'img/mic.gif';
      isRecording = true;

    } catch (err) {
      console.error("❌ خطأ في فتح المايك:", err);
      alert("⚠️ تأكد من صلاحيات المايكروفون");
    }
  }
  // إذا كان يسجل حالياً – نوقفه
  else {
    mediaRecorder.stop();
    micImg.src = 'img/micjpg.jpg';
    isRecording = false;
    
  }
});
uploadBtn.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (!file) return alert("📂 الرجاء اختيار ملف صوتي");
  durationDisplay.innerHTML = ""; // ← مسح النتائج السابقة

  const formData = new FormData();
  formData.append('audio', file);
  formData.append('duration', 1); // مؤقتًا تقدير تقريبي
  const icon = uploadBtn.querySelector('i');
  icon.classList.add('bounce');
  setTimeout(() => icon.classList.remove('bounce'), 400); // إزالة الكلاس بعد انتهاء الأنيميشن

  sendToServer(formData);
});
function sendToServer(formData) {
  fetch('/transcribe', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) throw new Error(data.error);
    durationDisplay.innerHTML += `
      <p>📄 Text : ${data.transcript} </p>
      <p>🧮 Number of words : ${data.wordCount} </p>
      <p>⚡ speed : ${data.speed.toFixed(2)} sec/word </p>
      <p>📊 Classification : ${data.category} </p>`;
      showPopup();
  })
  .catch(err => {
    durationDisplay.innerHTML += `<br>❌ خطأ: ${err.message}`;
    showPopup();
  });
}
// الشاشة المنبثقة بالنتائج 

const resultPopup = document.getElementById('resultPopup');
const closePopup = document.getElementById('closePopup');

// تُعرض بعد انتهاء التسجيل
function showPopup() {
  resultPopup.classList.add('active');
}

// تُخفى عند الضغط على الإكس
closePopup.addEventListener('click', () => {
  resultPopup.classList.remove('active');
});

// social media 
const socialSection = document.querySelector('.social_foot');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      socialSection.classList.add('visible');
    }
  });
}, { threshold: 0.5 });
observer.observe(socialSection);