// Konfigurasi Supabase
const SUPABASE_URL = "MASUKKAN_URL_SUPABASE_KAMU";
const SUPABASE_KEY = "MASUKKAN_ANON_KEY_KAMU";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let accountsData = [];

// Fetch data dari Supabase saat aplikasi dimuat
document.addEventListener("DOMContentLoaded", () => {
  fetchAccounts();
});

async function fetchAccounts() {
  const { data, error } = await supabaseClient
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil data:", error);
    return;
  }

  accountsData = data || [];
  renderCards();
}

function renderCards() {
  const grid = document.getElementById("accountGrid");
  const searchVal = document.getElementById("searchInput").value.toLowerCase();

  const filtered = accountsData.filter((acc) => {
    return (
      (acc.platform_name && acc.platform_name.toLowerCase().includes(searchVal)) ||
      (acc.username && acc.username.toLowerCase().includes(searchVal)) ||
      (acc.email && acc.email.toLowerCase().includes(searchVal))
    );
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 glass-card">
        <p class="text-slate-400">Belum ada data akun yang tersimpan.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((acc) => {
      const icon = acc.icon_name || "globe";
      return `
      <div class="glass-card p-5 relative group transition-all duration-300 flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl text-pink-400">
                <i data-lucide="${icon}" class="w-6 h-6"></i>
              </div>
              <div>
                <h4 class="font-bold text-slate-100">${acc.platform_name || "Tanpa Nama"}</h4>
                <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">${acc.category || "General"}</span>
              </div>
            </div>
            <div class="flex gap-1">
              <button onclick="editAccount('${acc.id}')" class="p-1.5 text-slate-400 hover:text-pink-400"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
              <button onclick="deleteAccount('${acc.id}')" class="p-1.5 text-slate-400 hover:text-red-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
          </div>

          <div class="space-y-2 text-xs text-slate-300">
            ${acc.username ? `<div class="flex justify-between items-center bg-slate-900/40 p-2 rounded"><span>User:</span> <span class="font-mono font-semibold">${acc.username}</span></div>` : ""}
            ${acc.email ? `<div class="flex justify-between items-center bg-slate-900/40 p-2 rounded"><span>Email:</span> <span class="font-mono">${acc.email}</span></div>` : ""}
            ${acc.password ? `
              <div class="flex justify-between items-center bg-slate-900/40 p-2 rounded">
                <span>Pass:</span> 
                <span class="font-mono flex items-center gap-1">
                  <input type="password" value="${acc.password}" readonly class="bg-transparent w-24 text-right focus:outline-none" id="pass-${acc.id}">
                  <button onclick="togglePassword('${acc.id}')" class="text-slate-400 hover:text-slate-100"><i data-lucide="eye" class="w-3.5 h-3.5"></i></button>
                </span>
              </div>` : ""}
            ${acc.notes ? `<p class="text-slate-400 text-[11px] italic mt-1">${acc.notes}</p>` : ""}
          </div>
        </div>

        ${acc.app_url ? `
          <a href="${acc.app_url}" target="_blank" class="mt-3 w-full py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs text-center rounded-lg border border-slate-700/50 flex items-center justify-center gap-1">
            Buka Link <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
        ` : ""}
      </div>
    `;
    })
    .join("");

  lucide.createIcons();
}

// Logika menyimpan (Modal Submit)
async function saveAccount(e) {
  e.preventDefault();

  const id = document.getElementById("accountId").value;
  const payload = {
    platform_name: document.getElementById("platform_name").value.trim(),
    username: document.getElementById("username").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    category: document.getElementById("category").value,
    app_url: document.getElementById("app_url").value.trim(),
    icon_name: document.getElementById("icon_name").value.trim(),
    notes: document.getElementById("notes").value.trim(),
  };

  // Validasi: Aturan minimal 1 data terisi
  const hasData = Object.values(payload).some((val) => val !== "" && val !== null);
  if (!hasData) {
    alert("Harap isi minimal 1 data sebelum menyimpan!");
    return;
  }

  if (id) {
    // Update data lama
    await supabaseClient.from("accounts").update(payload).eq("id", id);
  } else {
    // Tambah data baru
    await supabaseClient.from("accounts").insert([payload]);
  }

  closeModal();
  fetchAccounts();
}

function openModal() {
  document.getElementById("accountForm").reset();
  document.getElementById("accountId").value = "";
  document.getElementById("modalTitle").innerText = "Tambah Akun Baru";
  document.getElementById("accountModal").classList.remove("hidden");
  document.getElementById("accountModal").classList.add("flex");
}

function closeModal() {
  document.getElementById("accountModal").classList.add("hidden");
  document.getElementById("accountModal").classList.remove("flex");
}

function editAccount(id) {
  const acc = accountsData.find((a) => a.id === id);
  if (!acc) return;

  document.getElementById("accountId").value = acc.id;
  document.getElementById("platform_name").value = acc.platform_name || "";
  document.getElementById("username").value = acc.username || "";
  document.getElementById("email").value = acc.email || "";
  document.getElementById("password").value = acc.password || "";
  document.getElementById("category").value = acc.category || "Personal";
  document.getElementById("app_url").value = acc.app_url || "";
  document.getElementById("icon_name").value = acc.icon_name || "";
  document.getElementById("notes").value = acc.notes || "";

  document.getElementById("modalTitle").innerText = "Edit Akun";
  document.getElementById("accountModal").classList.remove("hidden");
  document.getElementById("accountModal").classList.add("flex");
}

async function deleteAccount(id) {
  if (confirm("Apakah kamu yakin ingin menghapus data ini?")) {
    await supabaseClient.from("accounts").delete().eq("id", id);
    fetchAccounts();
  }
}

function togglePassword(id) {
  const input = document.getElementById(`pass-${id}`);
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}