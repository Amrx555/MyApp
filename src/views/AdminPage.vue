<template>
  <div class="admin-container">
    <div class="bg-visuals">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="loading-screen" v-if="screen === 'loading'">
      <div class="spinner-lg"></div>
    </div>

    <div class="dashboard" v-if="screen === 'dashboard'">
      <!-- هيدر -->
      <div class="dash-header">
        <div class="header-left">
          <span>🛡️</span>
          <div>
            <h1>لوحة الإدارة</h1>
            <p>{{ currentAdmin?.email }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="notif-btn" @click="activeTab = 'pending'">
            🔔
            <span class="notif-badge" v-if="pendingAdmins.length">
              {{ pendingAdmins.length }}
            </span>
          </button>
          <button class="logout-btn" @click="handleLogout">خروج</button>
        </div>
      </div>

      <!-- تابس -->
      <div class="tabs">
        <button
          :class="['tab', activeTab === 'users' && 'active']"
          @click="activeTab = 'users'"
        >
          👥 المستخدمون
          <span class="tab-count">{{ normalUsers.length }}</span>
        </button>
        <button
          :class="['tab', activeTab === 'admins' && 'active']"
          @click="activeTab = 'admins'"
        >
          🛡️ الأدمنز
          <span class="tab-count">{{ adminUsers.length }}</span>
        </button>
        <button
          :class="['tab', activeTab === 'pending' && 'active']"
          @click="activeTab = 'pending'"
        >
          ⏳ طلبات الأدمن
          <span class="tab-count urgent" v-if="pendingAdmins.length">
            {{ pendingAdmins.length }}
          </span>
        </button>
      </div>

      <!-- إحصائيات -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <span class="stat-num">{{ normalUsers.length }}</span>
          <span class="stat-label">مستخدمون</span>
        </div>
        <div class="stat-card gold">
          <div class="stat-icon">🛡️</div>
          <span class="stat-num">{{ adminUsers.length }}</span>
          <span class="stat-label">أدمنز</span>
        </div>
        <div class="stat-card red">
          <div class="stat-icon">🚫</div>
          <span class="stat-num">{{ blockedCount }}</span>
          <span class="stat-label">محظورون</span>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">⏳</div>
          <span class="stat-num">{{ pendingAdmins.length }}</span>
          <span class="stat-label">طلبات معلقة</span>
        </div>
      </div>

      <!-- بحث -->
      <div class="search-bar" v-if="activeTab === 'users'">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍  ابحث بالاسم أو الإيميل..."
          class="search-input"
        />
      </div>

      <!-- ===== تاب المستخدمين ===== -->
      <div v-if="activeTab === 'users'">
        <div class="users-grid" v-if="!loading">
          <div
            class="user-card"
            v-for="u in filteredNormalUsers"
            :key="u.id"
            :class="{ blocked: u.is_blocked, expanded: expandedId === u.id }"
          >
            <div class="card-head" @click="toggleExpand(u.id)">
              <div class="user-avatar-wrap">
                <img :src="getAvatar(u)" class="user-avatar" />
                <span
                  class="status-dot"
                  :class="u.is_blocked ? 'red' : 'green'"
                ></span>
              </div>
              <div class="user-brief">
                <span class="user-name">{{ u.full_name || "بدون اسم" }}</span>
                <span class="user-email-sm">{{ u.email }}</span>
              </div>
              <span class="arrow-icon">{{
                expandedId === u.id ? "▲" : "▼"
              }}</span>
            </div>

            <transition name="slide">
              <div class="card-details" v-if="expandedId === u.id">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="d-label">📧 الإيميل</span>
                    <span class="d-value">{{ u.email }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="d-label">👤 الاسم</span>
                    <span class="d-value">{{ u.full_name || "—" }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="d-label">📞 الهاتف</span>
                    <span class="d-value">{{ u.phone || "—" }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="d-label">📅 تسجيل</span>
                    <span class="d-value">{{ formatDate(u.created_at) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="d-label">🚦 الحالة</span>
                    <span
                      class="d-value"
                      :class="u.is_blocked ? 'text-red' : 'text-green'"
                    >
                      {{ u.is_blocked ? "محظور" : "نشط" }}
                    </span>
                  </div>
                </div>

                <div class="action-btns">
                  <button
                    class="action-btn"
                    :class="u.is_blocked ? 'btn-unblock' : 'btn-block'"
                    @click="toggleBlock(u)"
                  >
                    {{ u.is_blocked ? "✅ فك الحظر" : "🚫 حظر" }}
                  </button>
                  <button
                    class="action-btn btn-whatsapp"
                    @click="openMsg(u, 'whatsapp')"
                    :disabled="!u.phone"
                  >
                    💬 واتساب
                  </button>
                  <button
                    class="action-btn btn-email"
                    @click="openMsg(u, 'email')"
                  >
                    ✉️ إيميل
                  </button>
                  <button class="action-btn btn-delete" @click="deleteUser(u)">
                    🗑️ حذف
                  </button>
                </div>

                <div class="msg-box" v-if="msgTarget?.id === u.id">
                  <p class="msg-label">
                    {{
                      msgTarget.type === "whatsapp"
                        ? "💬 رسالة واتساب"
                        : "✉️ رسالة إيميل"
                    }}
                  </p>
                  <textarea
                    v-model="msgText"
                    class="msg-textarea"
                    rows="3"
                    :placeholder="
                      msgTarget.type === 'whatsapp'
                        ? 'اكتب رسالة واتساب...'
                        : 'اكتب رسالة إيميل...'
                    "
                  >
                  </textarea>
                  <div class="msg-actions">
                    <button class="send-btn" @click="sendMessage(u)">
                      إرسال ✈️
                    </button>
                    <button class="cancel-btn" @click="msgTarget = null">
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          <div class="empty-state" v-if="filteredNormalUsers.length === 0">
            <span>🔍</span>
            <p>لا توجد نتائج</p>
          </div>
        </div>
        <div class="loading-screen small" v-else>
          <div class="spinner-lg"></div>
        </div>
      </div>
      <!-- ===== تاب الأدمنز ===== -->
      <div v-if="activeTab === 'admins'">
        <div class="users-grid">
          <div class="user-card admin-card" v-for="u in adminUsers" :key="u.id">
            <div class="card-head">
              <div class="user-avatar-wrap">
                <img :src="getAvatar(u)" class="user-avatar" />
                <span class="status-dot green"></span>
              </div>
              <div class="user-brief">
                <span class="user-name">{{ u.full_name || "بدون اسم" }}</span>
                <span class="user-email-sm">{{ u.email }}</span>
              </div>
              <div class="admin-actions">
                <span class="role-badge">🛡️ أدمن</span>
                <button
                  v-if="u.email !== ownerEmail"
                  class="delete-admin-btn"
                  @click="removeAdmin(u)"
                  title="حذف صلاحيات الأدمن"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          <div class="empty-state" v-if="adminUsers.length === 0">
            <span>🛡️</span>
            <p>لا يوجد أدمنز</p>
          </div>
        </div>
      </div>

      <!-- ===== تاب الطلبات المعلقة ===== -->
      <div v-if="activeTab === 'pending'">
        <div class="users-grid" v-if="pendingAdmins.length">
          <div
            class="user-card pending-card-item"
            v-for="u in pendingAdmins"
            :key="u.id"
          >
            <div class="pending-header">
              <span class="pending-badge">🆕 طلب جديد</span>
              <span class="pending-date">{{ formatDate(u.created_at) }}</span>
            </div>
            <div class="card-head no-cursor">
              <div class="user-avatar-wrap">
                <img :src="getAvatar(u)" class="user-avatar" />
                <span class="status-dot" style="background: #f0c060"></span>
              </div>
              <div class="user-brief">
                <span class="user-name">{{ u.full_name || "بدون اسم" }}</span>
                <span class="user-email-sm">{{ u.email }}</span>
              </div>
            </div>
            <div class="pending-data">
              <div class="pending-info-item">
                <span>📞</span><span>{{ u.phone || "لا يوجد رقم" }}</span>
              </div>
            </div>
            <div class="pending-actions">
              <button class="action-btn btn-unblock" @click="approveAdmin(u)">
                ✅ قبول كأدمن
              </button>
              <button class="action-btn btn-block" @click="rejectAdmin(u)">
                ❌ رفض
              </button>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <span>✅</span>
          <p>لا توجد طلبات معلقة</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const OWNER_EMAIL = "amri69217@gmail.com";

const router = useRouter();
const screen = ref("loading");
const currentAdmin = ref(null);
const ownerEmail = ref(OWNER_EMAIL);
const users = ref([]);
const loading = ref(false);
const expandedId = ref(null);
const searchQuery = ref("");
const msgTarget = ref(null);
const msgText = ref("");
const activeTab = ref("users");

const normalUsers = computed(() =>
  users.value.filter((u) => !u.role || u.role === "user")
);
const adminUsers = computed(() =>
  users.value.filter((u) => u.role === "admin")
);
const pendingAdmins = computed(() =>
  users.value.filter((u) => u.role === "pending_admin")
);
const blockedCount = computed(
  () => users.value.filter((u) => u.is_blocked).length
);
const filteredNormalUsers = computed(() => {
  const q = searchQuery.value.toLowerCase();
  if (!q) return normalUsers.value;
  return normalUsers.value.filter(
    (u) =>
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q)
  );
});

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    router.push("/");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    router.push("/home");
    return;
  }

  currentAdmin.value = data.user;
  await fetchUsers();
  screen.value = "dashboard";
});

const fetchUsers = async () => {
  loading.value = true;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  users.value = data || [];
  loading.value = false;
};

const toggleBlock = async (u) => {
  const newVal = !u.is_blocked;
  await supabase.from("profiles").update({ is_blocked: newVal }).eq("id", u.id);
  u.is_blocked = newVal;
};

const approveAdmin = async (u) => {
  await supabase.from("profiles").update({ role: "admin" }).eq("id", u.id);
  u.role = "admin";
  if (u.phone)
    sendWhatsApp(
      u.phone,
      "✅ تهانينا! تم قبول طلبك كأدمن. يمكنك الآن الدخول للوحة الإدارة."
    );
};

const rejectAdmin = async (u) => {
  await supabase.from("profiles").update({ role: "user" }).eq("id", u.id);
  u.role = "user";
  if (u.phone)
    sendWhatsApp(u.phone, "❌ عذراً، تم رفض طلبك كأدمن. ستستمر كمستخدم عادي.");
};

const removeAdmin = async (u) => {
  if (!confirm(`هل تريد إزالة صلاحيات ${u.full_name || u.email} كأدمن؟`))
    return;
  await supabase.from("profiles").update({ role: "user" }).eq("id", u.id);
  u.role = "user";
};

// ✅ حذف المستخدم كلياً
const deleteUser = async (u) => {
  if (
    !confirm(
      `⚠️ هل أنت متأكد من حذف حساب "${
        u.full_name || u.email
      }"؟\nلا يمكن التراجع عن هذا الإجراء!`
    )
  )
    return;

  // حذف من جدول profiles
  const { error } = await supabase.from("profiles").delete().eq("id", u.id);

  if (error) {
    alert("حدث خطأ أثناء الحذف: " + error.message);
    return;
  }

  // إزالة فورية من الواجهة
  users.value = users.value.filter((x) => x.id !== u.id);
  expandedId.value = null;
};

const sendWhatsApp = (phone, text) => {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "20" + p.slice(1);
  window.open(
    `https://api.whatsapp.com/send?phone=${p}&text=${encodeURIComponent(text)}`,
    "_blank"
  );
};

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
  msgTarget.value = null;
  msgText.value = "";
};

const openMsg = (u, type) => {
  msgTarget.value = { id: u.id, type };
  msgText.value = "";
};

const sendMessage = (u) => {
  if (!msgText.value.trim()) return;
  if (msgTarget.value.type === "whatsapp" && u.phone) {
    sendWhatsApp(u.phone, msgText.value);
  } else {
    window.open(
      `mailto:${u.email}?subject=${encodeURIComponent(
        "رسالة من الإدارة"
      )}&body=${encodeURIComponent(msgText.value)}`,
      "_blank"
    );
  }
  msgTarget.value = null;
  msgText.value = "";
};

const getAvatar = (u) => {
  if (u.avatar_url) return u.avatar_url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    u.full_name || u.email || "U"
  )}&background=f0c060&color=1a1000&size=128`;
};

const formatDate = (d) => new Date(d).toLocaleDateString("ar-EG");

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/");
};
</script>
<style scoped>
* {
  box-sizing: border-box;
}
.admin-container {
  font-family: "Cairo", sans-serif;
  min-height: 100vh;
  background: #05050a;
  position: relative;
  overflow-x: hidden;
  direction: rtl;
}
.bg-visuals {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.12;
  animation: drift 20s infinite alternate;
}
.blob-1 {
  width: 600px;
  height: 600px;
  background: rgba(55, 77, 42, 0);
  top: -15%;
  left: -10%;
}
.blob-2 {
  width: 500px;
  height: 500px;
  background: #7840dc;
  bottom: -15%;
  right: -10%;
  animation-delay: -6s;
}
@keyframes drift {
  to {
    transform: translate(40px, 40px) scale(1.1);
  }
}

.dashboard {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px 60px;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-left > span {
  font-size: 34px;
}
.dash-header h1 {
  color: white;
  margin: 0;
  font-size: 22px;
}
.dash-header p {
  color: #a0aec0;
  font-size: 13px;
  margin: 3px 0 0;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notif-btn {
  position: relative;
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.notif-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.notif-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #fc8181;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-family: "Cairo", sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.logout-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #a0aec0;
  font-family: "Cairo", sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.logout-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 13px;
  color: #a0aec0;
  font-family: "Cairo", sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.25s;
}
.tab.active {
  background: rgba(240, 192, 96, 0.12);
  border-color: rgba(240, 192, 96, 0.35);
  color: #568f30bd;
}
.tab-count {
  background: rgba(255, 255, 255, 0.1);
  color: #718096;
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 12px;
}
.tab.active .tab-count {
  background: rgba(240, 192, 96, 0.2);
  color: #5dcf11ef;
}
.tab-count.urgent {
  background: rgba(252, 100, 100, 0.2);
  color: #fc8181;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}
@media (max-width: 650px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
.stat-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 18px 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.stat-card.gold {
  border-color: rgba(240, 192, 96, 0.2);
  background: rgba(240, 192, 96, 0.04);
}
.stat-card.red {
  border-color: rgba(252, 100, 100, 0.2);
  background: rgba(252, 100, 100, 0.04);
}
.stat-card.purple {
  border-color: rgba(120, 64, 220, 0.2);
  background: rgba(120, 64, 220, 0.04);
}
.stat-icon {
  font-size: 22px;
}
.stat-num {
  font-size: 26px;
  font-weight: 700;
  color: #f0c060;
  line-height: 1;
}
.stat-card.red .stat-num {
  color: #fc8181;
}
.stat-card.purple .stat-num {
  color: #b794f4;
}
.stat-label {
  font-size: 12px;
  color: #718096;
}

.search-bar {
  margin-bottom: 18px;
}
.search-input {
  width: 100%;
  padding: 13px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: white;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  outline: none;
  transition: 0.25s;
}
.search-input:focus {
  border-color: #f0c060;
}
.search-input::placeholder {
  color: #4a5568;
}

.users-grid {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.user-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  overflow: hidden;
  transition: 0.25s;
}
.user-card:hover {
  border-color: rgba(255, 255, 255, 0.14);
}
.user-card.blocked {
  border-color: rgba(252, 100, 100, 0.22);
  background: rgba(252, 100, 100, 0.03);
}
.user-card.expanded {
  border-color: rgba(240, 192, 96, 0.28);
}
.user-card.admin-card {
  border-color: rgba(240, 192, 96, 0.15);
}
.user-card.pending-card-item {
  border-color: rgba(120, 64, 220, 0.25);
  background: rgba(120, 64, 220, 0.04);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 18px;
  cursor: pointer;
  transition: 0.2s;
}
.card-head:hover {
  background: rgba(255, 255, 255, 0.025);
}
.card-head.no-cursor {
  cursor: default;
}
.card-head.no-cursor:hover {
  background: transparent;
}

.user-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(240, 192, 96, 0.35);
  object-fit: cover;
}
.status-dot {
  position: absolute;
  bottom: 1px;
  left: 1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #05050a;
}
.status-dot.green {
  background: #48bb78;
}
.status-dot.red {
  background: #fc8181;
}
.user-brief {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.user-name {
  color: white;
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-email-sm {
  color: #718096;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.arrow-icon {
  color: #4a5568;
  font-size: 11px;
  flex-shrink: 0;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.role-badge {
  background: rgba(240, 192, 96, 0.12);
  border: 1px solid rgba(240, 192, 96, 0.28);
  color: #20aa27;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  white-space: nowrap;
}
.delete-admin-btn {
  width: 30px;
  height: 30px;
  background: rgba(252, 100, 100, 0.12);
  border: 1px solid rgba(252, 100, 100, 0.28);
  border-radius: 8px;
  color: #fc8181;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.delete-admin-btn:hover {
  background: rgba(252, 100, 100, 0.25);
}

.card-details {
  padding: 16px 18px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-bottom: 14px;
}
@media (max-width: 500px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
.detail-item {
  background: rgba(255, 255, 255, 0.035);
  border-radius: 11px;
  padding: 9px 13px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.d-label {
  color: #718096;
  font-size: 12px;
}
.d-value {
  color: white;
  font-size: 14px;
  font-weight: 600;
}
.text-green {
  color: #48bb78 !important;
}
.text-red {
  color: #fc8181 !important;
}

.action-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.pending-actions {
  display: flex;
  gap: 8px;
  padding: 0 18px 16px;
}

.action-btn {
  flex: 1;
  min-width: 80px;
  padding: 10px 12px;
  border: none;
  border-radius: 11px;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: 0.25s;
}
.action-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}
.btn-block {
  background: rgba(252, 100, 100, 0.12);
  border: 1px solid rgba(252, 100, 100, 0.28);
  color: #fc8181;
}
.btn-block:hover:not(:disabled) {
  background: rgba(252, 100, 100, 0.25);
}
.btn-unblock {
  background: rgba(72, 187, 120, 0.12);
  border: 1px solid rgba(72, 187, 120, 0.28);
  color: #48bb78;
}
.btn-unblock:hover {
  background: rgba(72, 187, 120, 0.25);
}
.btn-whatsapp {
  background: rgba(37, 211, 102, 0.12);
  border: 1px solid rgba(37, 211, 102, 0.28);
  color: #25d366;
}
.btn-whatsapp:hover:not(:disabled) {
  background: rgba(37, 211, 102, 0.25);
}
.btn-email {
  background: rgba(99, 179, 237, 0.12);
  border: 1px solid rgba(99, 179, 237, 0.28);
  color: #63b3ed;
}
.btn-email:hover {
  background: rgba(99, 179, 237, 0.25);
}

/* ✅ زر الحذف */
.btn-delete {
  background: rgba(180, 50, 50, 0.12);
  border: 1px solid rgba(180, 50, 50, 0.3);
  color: #f87171;
}
.btn-delete:hover {
  background: rgba(180, 50, 50, 0.28);
}

.msg-box {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 13px;
  padding: 14px;
}
.msg-label {
  color: #a0aec0;
  font-size: 13px;
  margin: 0 0 8px;
}
.msg-textarea {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  resize: none;
  outline: none;
  transition: 0.25s;
}
.msg-textarea:focus {
  border-color: #369636;
}
.msg-textarea::placeholder {
  color: #4a5568;
}
.msg-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  justify-content: flex-end;
}
.send-btn {
  padding: 9px 22px;
  background: linear-gradient(90deg, #369636, #186918);
  border: none;
  border-radius: 10px;
  color: #1a1000;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
  cursor: pointer;
}
.send-btn:hover {
  transform: translateY(-1px);
}
.cancel-btn {
  padding: 9px 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #a0aec0;
  font-family: "Cairo", sans-serif;
  cursor: pointer;
}

.pending-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px 0;
}
.pending-badge {
  background: rgba(120, 64, 220, 0.2);
  border: 1px solid rgba(120, 64, 220, 0.35);
  color: #b794f4;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.pending-date {
  color: #718096;
  font-size: 12px;
}
.pending-data {
  padding: 0 18px 12px;
}
.pending-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a0aec0;
  font-size: 14px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.28s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.empty-state {
  text-align: center;
  padding: 55px;
  color: #4a5568;
}
.empty-state span {
  font-size: 38px;
  display: block;
  margin-bottom: 10px;
}
.empty-state p {
  font-size: 15px;
}

.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  position: relative;
  z-index: 10;
}
.loading-screen.small {
  min-height: 200px;
}
.spinner-lg {
  width: 46px;
  height: 46px;
  border: 4px solid rgba(240, 192, 96, 0.15);
  border-top-color: #369636;
  border-radius: 50%;
  animation: spin 0.85s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
