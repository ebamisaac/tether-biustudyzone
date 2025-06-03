// Firebase SDK imports (from CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// 🔥 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAyWlf0wExILYFJjX-zBBjdFwVkcj1nPIs",
  authDomain: "tether-biustudyzone.firebaseapp.com",
  projectId: "tether-biustudyzone",
  storageBucket: "tether-biustudyzone.firebasestorage.app",
  messagingSenderId: "998329533976",
  appId: "1:998329533976:web:e8e28ba98553125292e56d",
  measurementId: "G-8MY0LT0S57"
};

// 🔗 Connect Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM references
const feedArea = document.getElementById('feed-area');
const feed = document.getElementById('feed');

// Toggle UI views
window.showLogin = function () {
  document.getElementById("signup-area").style.display = "none";
  document.getElementById("login-area").style.display = "block";
};

window.showSignup = function () {
  document.getElementById("login-area").style.display = "none";
  document.getElementById("signup-area").style.display = "block";
};


// 🔐 Login function
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
  } catch (error) {
    alert("Login Failed: " + error.message);
  }
};

import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

window.signup = async function () {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created! You can now log in.");
    // Optionally, auto-login:
    // await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert("Sign Up Failed: " + error.message);
  }
};


// 👀 Watch auth state
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById('login-area').style.display = "none";
    document.getElementById('signup-area').style.display = "none";
    feedArea.style.display = "block";
    loadFeed();
  }
});


// ✍️ Post message
window.postMessage = async function () {
  const content = document.getElementById('post-input').value;
  if (!content.trim()) return;

  await addDoc(collection(db, "posts"), {
    content,
    user: auth.currentUser.email,
    timestamp: serverTimestamp()
  });

  document.getElementById('post-input').value = "";
};

// 📥 Load feed messages
function loadFeed() {
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    feed.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      feed.innerHTML += `
        <div style="margin-bottom:1rem;">
          <p><strong>${data.user}</strong>: ${data.content}</p>
          <div id="comments-${doc.id}"></div>
          <input type="text" id="commentInput-${doc.id}" placeholder="Add a comment..." />
          <button onclick="postComment('${doc.id}')">Comment</button>
          <hr>
        </div>
      `;
      loadComments(doc.id);
    });
  });
}

// 💬 Post comment
window.postComment = async function (postId) {
  const commentInput = document.getElementById(`commentInput-${postId}`);
  const text = commentInput.value;
  const user = auth.currentUser.email;

  if (!text.trim()) return;

  await addDoc(collection(db, "posts", postId, "comments"), {
    text,
    user,
    timestamp: serverTimestamp()
  });

  commentInput.value = "";
};

// 🧾 Load comments
function loadComments(postId) {
  const q = query(collection(db, "posts", postId, "comments"), orderBy("timestamp", "asc"));
  const commentsDiv = document.getElementById(`comments-${postId}`);

  onSnapshot(q, (snapshot) => {
    commentsDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      commentsDiv.innerHTML += `<p style="margin-left:1rem;"><em>${data.user}</em>: ${data.text}</p>`;
    });
  });
}
