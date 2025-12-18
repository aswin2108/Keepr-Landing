import './style.css'
import { initScene } from './scene.js';
import { db, collection, addDoc } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  setupWaitlist();
  setupWishlist();
  initScene();
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function setupWaitlist() {
  const form = document.getElementById('waitlist-form');
  const hero = document.getElementById('hero-view');
  const wishlist = document.getElementById('wishlist-view');
  const emailDisplay = document.getElementById('wishlist-email');
  const emailInput = form ? form.querySelector('input') : null;
  const submitBtn = form ? form.querySelector('button') : null;

  if (!form) return;

  // Clear error on typing
  emailInput.addEventListener('input', () => {
    emailInput.classList.remove('input-error');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;

    // VALIDATION LOGIC
    if (!validateEmail(email)) {
      emailInput.classList.add('input-error');
      setTimeout(() => {
        emailInput.classList.remove('input-error');
      }, 500);
      return;
    }

    // Firebase: Add to 'waitlist' collection
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Securing Spot...</span><div class="btn-bg"></div>';
    }

    try {
      if (db) {
        await addDoc(collection(db, 'waitlist'), {
          email: email,
          timestamp: new Date()
        });
        console.log('Added to Waitlist DB');
      }
    } catch (err) {
      console.error("Error adding to waitlist: ", err);
    }

    // Transition Animation
    hero.classList.add('fade-out');

    setTimeout(() => {
      hero.classList.add('hidden');
      wishlist.classList.remove('hidden');
      emailDisplay.value = email;

      // UX Update: Allow scrolling for the longer Wishlist form
      document.body.style.overflow = 'auto';
    }, 600);
  });
}

function setupWishlist() {
  const form = document.getElementById('wishlist-form');
  const wishlistView = document.getElementById('wishlist-view');
  const successView = document.getElementById('success-view');
  const userDisplayEmail = document.getElementById('user-display-email');
  const emailInput = document.getElementById('wishlist-email');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Parse Purpose Checkboxes into Booleans
    const purposeNormal = formData.getAll('purpose').includes('Normal Storage');
    const purposeVideo = formData.getAll('purpose').includes('Video Server');
    const purposeWeb = formData.getAll('purpose').includes('Web Hosting');

    const data = {
      email: emailInput.value,
      storage: formData.get('storage'),
      battery: formData.get('battery'),
      purpose_normal_storage: purposeNormal,
      purpose_video_server: purposeVideo,
      purpose_web_hosting: purposeWeb,
      timestamp: new Date()
    };

    // Firebase: Add to 'wishlist' collection
    try {
      if (db) {
        await addDoc(collection(db, 'wishlist'), data);
        console.log('Added to Wishlist DB');
      }
    } catch (err) {
      console.error("Error adding to wishlist: ", err);
    }

    // Show Success
    wishlistView.classList.add('fade-out');

    // Scroll to top for success message
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      wishlistView.classList.add('hidden');
      successView.classList.remove('hidden');
      userDisplayEmail.textContent = data.email;

      // Lock scroll again for success screen (it's short)
      document.body.style.overflow = 'hidden';
    }, 600);
  });
}
