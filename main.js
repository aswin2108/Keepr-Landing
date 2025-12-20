import './style.css'
import { initScene } from './scene.js';
import { db, collection, addDoc } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  setupWaitlist();
  setupWishlist();

  // Only init scene if container exists (Home Page)
  if (document.getElementById('canvas-container')) {
    initScene();
  }

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
    backBtnWishlist.addEventListener('click', resetToContent);
  }

  if (backBtnSuccess) {
    backBtnSuccess.addEventListener('click', resetToContent);
  }
}

// GENERIC RESET FUNCTION
function resetToContent() {
  const pageContent = document.querySelector('.page-content');
  const wishlist = document.getElementById('wishlist-view');
  const success = document.getElementById('success-view');

  // Hide Overlay Views
  if (wishlist) {
    wishlist.classList.add('hidden');
    wishlist.classList.remove('fade-out');
  }
  if (success) success.classList.add('hidden');

  // Show Main Content
  if (pageContent) {
    pageContent.classList.remove('hidden', 'fade-out');
    pageContent.style.opacity = '1';
    pageContent.style.transform = 'scale(1)';
  }

  // Reset Scroll
  // window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: Keep scroll position? User usually wants to go back to where they were.
  // Let's scroll to top of content to be safe/clean
  const signupSection = document.querySelector('.signup-section');
  if (signupSection) {
    signupSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.body.style.overflow = 'auto'; // Ensure scroll is unlocked
}

function setupWaitlist() {
  const form = document.getElementById('waitlist-form');
  const pageContent = document.querySelector('.page-content');
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
    if (pageContent) {
      pageContent.classList.add('fade-out');
    }

    setTimeout(() => {
      if (pageContent) pageContent.classList.add('hidden');

      if (wishlist) {
        wishlist.classList.remove('hidden');
        if (emailDisplay) emailDisplay.value = email;
      }

      document.body.style.overflow = 'auto';
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

    const formData = new FormData(form);

    const purposeNormal = formData.getAll('purpose').includes('Normal Storage');
    const purposeVideo = formData.getAll('purpose').includes('Video Server');
    const purposeWeb = formData.getAll('purpose').includes('Web Hosting');

    const data = {
      email: emailInput ? emailInput.value : 'unknown',
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
    if (wishlistView) wishlistView.classList.add('fade-out');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      if (wishlistView) wishlistView.classList.add('hidden');
      if (successView) {
        successView.classList.remove('hidden');
        if (userDisplayEmail) userDisplayEmail.textContent = data.email;
      }

      document.body.style.overflow = 'hidden';
    }, 600);
  });
}
