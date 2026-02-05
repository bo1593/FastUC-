const logoutBtn = document.getElementById("logoutBtn");
const ordersTable = document.getElementById("ordersTable").querySelector("tbody");

// التأكد إن الأدمن مسجل دخول
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    alert("سجل الدخول أولاً");
    window.location.href = "index.html";
  } else {
    loadOrders();
  }
});

// تسجيل الخروج
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
});

// تحميل الطلبات
function loadOrders() {
  db.collection("orders").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    ordersTable.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.userId}</td>
        <td>${data.pubgId}</td>
        <td>${data.packageId}</td>
        <td>${data.price}</td>
        <td>${data.status}</td>
        <td>
          <button onclick="updateStatus('${doc.id}','completed')">تم الشحن</button>
          <button onclick="updateStatus('${doc.id}','pending')">قيد الانتظار</button>
        </td>
      `;
      ordersTable.appendChild(tr);
    });
  });
}

// تحديث حالة الطلب
function updateStatus(id, status) {
  db.collection("orders").doc(id).update({status})
    .then(() => alert("تم تحديث الحالة!"));
}