const loginBtn = document.getElementById("loginBtn");
const packagesContainer = document.getElementById("packagesContainer");

// تسجيل الدخول بجوجل
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      alert(`مرحبا ${result.user.displayName}`);
      loadPackages();
    })
    .catch((error) => {
      console.error(error);
    });
});

// تحميل الباقات من Firestore
function loadPackages() {
  db.collection("packages").get().then((snapshot) => {
    packagesContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "package" + (data.best ? " best" : "");
      div.innerHTML = `
        <h3>${data.name}</h3>
        <p>UC: ${data.uc} + Bonus: ${data.bonus}</p>
        <p>السعر: ${data.price} ج</p>
        <button onclick="buyPackage('${doc.id}')">اشحن الآن</button>
      `;
      packagesContainer.appendChild(div);
    });
  });
}

// تأكيد شراء الباقة
function buyPackage(id) {
  const user = auth.currentUser;
  if (!user) return alert("سجل الدخول أولاً!");
  
  db.collection("orders").add({
    userId: user.uid,
    pubgId: "أدخل ID هنا",
    packageId: id,
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("تم تسجيل طلبك! سيتم شحنه قريبًا.");
  });
}