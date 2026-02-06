import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { 
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { 
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIaWncAaVr4Jezf5rzbCwUza3rtIB1gXw",
  authDomain: "fastuc-25614.firebaseapp.com",
  projectId: "fastuc-25614"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ELEMENTS */
const overlay = document.getElementById("loginOverlay");
const googleLogin = document.getElementById("googleLogin");
const phoneLogin = document.getElementById("phoneLogin");
const phoneInput = document.getElementById("phoneNumber");
const logoutBtn = document.getElementById("logoutBtn");
const packagesContainer = document.getElementById("packagesContainer");

const popup = document.getElementById("paymentPopup");
const closePopup = document.querySelector(".close");
const confirmOrder = document.getElementById("confirmOrder");

let selectedPackage = null;

/* GOOGLE LOGIN */
googleLogin.onclick = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

/* PHONE LOGIN */
window.recaptchaVerifier = new RecaptchaVerifier(
  auth,
  "recaptcha-container",
  { size: "normal" }
);

phoneLogin.onclick = async () => {
  const phone = phoneInput.value;
  if (!phone.startsWith("+")) return alert("اكتب الرقم مع كود الدولة");
  const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
  const code = prompt("ادخل كود SMS");
  await confirmation.confirm(code);
};

/* LOGOUT */
logoutBtn.onclick = () => signOut(auth);

/* AUTH STATE */
onAuthStateChanged(auth, user => {
  overlay.style.display = user ? "none" : "flex";
  if (user) loadPackages();
});

/* LOAD PACKAGES */
async function loadPackages() {
  packagesContainer.innerHTML = "";
  const snap = await getDocs(collection(db, "packages"));
  snap.forEach(doc => {
    const d = doc.data();
    const div = document.createElement("div");
    div.className = "package" + (d.best ? " best" : "");
    div.innerHTML = `
      <h3>${d.name}</h3>
      <p>${d.uc} UC + ${d.bonus || 0}</p>
      <p>${d.price} ج</p>
      <button>اشحن</button>
    `;
    div.querySelector("button").onclick = () => {
      selectedPackage = { id: doc.id, ...d };
      document.getElementById("pName").innerText = d.name;
      document.getElementById("pDetails").innerText = `${d.uc} UC`;
      document.getElementById("pPrice").innerText = `${d.price} ج`;
      popup.style.display = "flex";
    };
    packagesContainer.appendChild(div);
  });
}

/* ORDER */
confirmOrder.onclick = async () => {
  const pubgId = document.getElementById("pubgId").value;
  const img = document.getElementById("transferImg").files[0];
  if (!pubgId || !img) return alert("البيانات ناقصة");

  await addDoc(collection(db, "orders"), {
    userId: auth.currentUser.uid,
    pubgId,
    packageId: selectedPackage.id,
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("تم إرسال الطلب بنجاح");
  popup.style.display = "none";
};

closePopup.onclick = () => popup.style.display = "none";