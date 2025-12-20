import './style.css'
import { initScene } from './scene.js';
import { db, collection, addDoc } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  setupWaitlist();
  setupWishlist();
  initScene();
  setupNavigation();
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Navigation Logic
function setupNavigation() {
  const backBtnWishlist = document.getElementById('back-to-home-wishlist');
  const backBtnSuccess = document.getElementById('back-to-home-success');

  if (backBtnWishlist) {
    backBtnWishlist.addEventListener('click', resetToHome);
  }

  if (backBtnSuccess) {
    backBtnSuccess.addEventListener('click', resetToHome);
  }
}

function resetToHome() {
  const hero = document.getElementById('hero-view');
  const features = document.getElementById('features-view');
  const wishlist = document.getElementById('wishlist-view');
  const success = document.getElementById('success-view');

  // Hide Overlay Views
  wishlist.classList.add('hidden');
  wishlist.classList.remove('fade-out'); // Reset animation class for next time
  success.classList.add('hidden');

  // Show Home Views
  hero.classList.remove('hidden', 'fade-out');
  // Force reflow to restart animations if needed, but simple remove is mostly fine
  hero.style.opacity = '1';
  hero.style.transform = 'scale(1)';

  if (features) {
    features.classList.remove('hidden', 'fade-out');
    features.style.opacity = '1';
  }

  // Reset Scroll
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.style.overflow = 'auto'; // Ensure scroll is unlocked
}

function setupWaitlist() {
  const form = document.getElementById('waitlist-form');
  const hero = document.getElementById('hero-view');
  const features = document.getElementById('features-view'); // New Section
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
      // Optional: Loading state, but reset it quickly if we want to allow back/forth
      // keeping it simple for now
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
    // Fade out both Hero and Features sections
    hero.classList.add('fade-out');
    if (features) features.classList.add('fade-out');

    setTimeout(() => {
      hero.classList.add('hidden');
      if (features) features.classList.add('hidden');

      wishlist.classList.remove('hidden');
      emailDisplay.value = email;

      // UX Update: Allow scrolling for the longer Wishlist form
      document.body.style.overflow = 'auto';

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 600);
  });
}

function setupWishlist() {
  const form = document.getElementById('wishlist-form');
  const wishlistView = document.getElementById('wishlist-view');
  const successView = document.getElementById('success-view');
  const userDisplayEmail = document.getElementById('user-display-email');
  const emailInput = document.getElementById('wishlist-email');
  const submitBtn = form ? form.querySelector('.submit-wishlist') : null;
  const purposeCheckboxes = form ? form.querySelectorAll('input[name="purpose"]') : [];

  if (!form) return;

  // --- VALIDATION: Checkbox Logic ---
  function checkValidation() {
    let anyChecked = false;
    purposeCheckboxes.forEach(cb => {
      if (cb.checked) anyChecked = true;
    });

    if (submitBtn) {
      submitBtn.disabled = !anyChecked;
    }
  }

  // Init State
  checkValidation();

  // Add Listeners
  purposeCheckboxes.forEach(cb => {
    cb.addEventListener('change', checkValidation);
  });
  // ----------------------------------

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check if it's the submit button clicked (form submit event handles this generally)

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
