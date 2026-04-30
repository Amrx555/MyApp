<template>
  <div class="auth-container">
    <div class="bg-visuals">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="wrapper wide" v-if="user">
      <div class="card profile-card">
        <div class="profile-header">
          <div class="avatar-wrapper" @click="isEditing && triggerFileInput()">
            <img
              :src="avatarPreview || defaultAvatar"
              class="avatar"
              alt="avatar"
            />
            <div class="avatar-overlay" v-if="isEditing"><span>📷</span></div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="handleImageUpload"
            />
          </div>
          <h2>لوحة التحكم</h2>
          <p class="user-email">{{ user.email }}</p>
          <span class="reg-date">
            📅 تاريخ التسجيل:
            {{ new Date(user.created_at).toLocaleDateString("ar-EG") }}
          </span>
        </div>

        <div class="content-grid">
          <div class="field-group">
            <label>الاسم الكامل</label>
            <input
              type="text"
              v-model="form.fullName"
              placeholder="أدخل اسمك"
              class="field-input"
              :disabled="!isEditing"
            />
          </div>
          <div class="field-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              :value="user.email"
              class="field-input"
              disabled
            />
          </div>
          <div class="field-group">
            <label>كلمة المرور</label>
            <div class="pass-wrapper">
              <input
                v-if="isEditing"
                :type="showPass ? 'text' : 'password'"
                v-model="form.password"
                placeholder="اتركها فارغة إن لم ترد التغيير"
                class="field-input"
              />
              <input
                v-else
                type="password"
                value="placeholder"
                class="field-input"
                disabled
              />
              <button
                class="toggle-pass"
                @click="showPass = !showPass"
                type="button"
                v-if="isEditing"
              >
                {{ showPass ? "🙈" : "👁️" }}
              </button>
            </div>
          </div>
          <div class="field-group">
            <label>رقم الهاتف</label>
            <input
              type="tel"
              v-model="form.phone"
              placeholder="01xxxxxxxxx"
              class="field-input"
              :disabled="!isEditing"
            />
          </div>
        </div>

        <!-- زر طلب صلاحيات الأدمن -->
        <div class="admin-request-section" v-if="!isAdmin && !isPending">
          <div class="request-card">
            <div class="request-info">
              <span class="request-icon">🛡️</span>
              <div>
                <p class="request-title">طلب صلاحيات الأدمن</p>
                <p class="request-sub">سيتم إرسال طلبك للمراجعة</p>
              </div>
            </div>
            <button
              class="request-admin-btn"
              @click="requestAdmin"
              :disabled="isRequesting"
            >
              {{ isRequesting ? "جاري الإرسال..." : "طلب الصلاحية" }}
            </button>
          </div>
        </div>

        <div class="pending-notice" v-if="isPending">
          ⏳ طلبك قيد المراجعة — انتظر موافقة الأدمن
        </div>

        <div class="footer-actions">
          <button class="logout-btn" @click="handleLogout">تسجيل الخروج</button>
          <button v-if="!isEditing" class="edit-btn" @click="isEditing = true">
            ✏️ تعديل
          </button>
          <button
            v-if="isEditing"
            class="save-btn"
            @click="saveChanges"
            :disabled="isSaving"
          >
            {{ isSaving ? "جاري الحفظ..." : "💾 حفظ البيانات" }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="loading-screen">
      <div class="spinner-lg"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

// رقم صاحب الموقع على واتساب
const OWNER_PHONE = "201554681315";

const router = useRouter();
const user = ref(null);
const isEditing = ref(false);
const isSaving = ref(false);
const isRequesting = ref(false);
const showPass = ref(false);
const fileInput = ref(null);
const avatarPreview = ref(null);
const avatarFile = ref(null);
const isAdmin = ref(false);
const isPending = ref(false);
const form = reactive({ fullName: "", password: "", phone: "" });
const defaultAvatar = computed(() =>
  user.value
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.value.email
      )}&background=f0c060&color=1a1000&size=128`
    : ""
);

onMounted(async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    router.push("/");
    return;
  }
  user.value = data.user;

  const meta = data.user.user_metadata || {};
  form.fullName = meta.full_name || "";
  form.phone = meta.phone || "";
  avatarPreview.value = meta.avatar_url || null;

  // جيب الرول
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  isAdmin.value = profile?.role === "admin";
  isPending.value = profile?.role === "pending_admin";
});

const triggerFileInput = () => fileInput.value?.click();

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

const saveChanges = async () => {
  isSaving.value = true;
  try {
    let avatarUrl = user.value.user_metadata?.avatar_url || null;

    if (avatarFile.value) {
      const ext = avatarFile.value.name.split(".").pop();
      const path = `avatars/${user.value.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(path, avatarFile.value, { upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("profiles")
          .getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }
    }

    const { error: dbError } = await supabase.from("profiles").upsert({
      id: user.value.id,
      email: user.value.email,
      full_name: form.fullName,
      phone: form.phone,
      avatar_url: avatarUrl,
    });

    if (dbError) {
      alert("خطأ: " + dbError.message);
      return;
    }

    const updatePayload = {
      data: {
        full_name: form.fullName,
        phone: form.phone,
        avatar_url: avatarUrl,
      },
    };
    if (form.password.trim()) updatePayload.password = form.password.trim();

    const { error: authError } = await supabase.auth.updateUser(updatePayload);
    if (authError) {
      alert("خطأ: " + authError.message);
      return;
    }

    isEditing.value = false;
    router.push("/home");
  } finally {
    isSaving.value = false;
  }
};

const requestAdmin = async () => {
  isRequesting.value = true;

  // تحديث الرول في قاعدة البيانات
  await supabase
    .from("profiles")
    .update({ role: "pending_admin" })
    .eq("id", user.value.id);

  isPending.value = true;

  // إرسال واتساب لصاحب الموقع ببيانات المستخدم
  const msg =
    `🛡️ طلب صلاحية أدمن جديد!\n\n` +
    `👤 الاسم: ${form.fullName || "غير محدد"}\n` +
    `📧 الإيميل: ${user.value.email}\n` +
    `📞 الهاتف: ${form.phone || "غير محدد"}\n` +
    `📅 تاريخ التسجيل: ${new Date(user.value.created_at).toLocaleDateString(
      "ar-EG"
    )}\n\n` +
    `يرجى مراجعة لوحة الإدارة للموافقة أو الرفض.`;
  window.open(
    `https://api.whatsapp.com/send?phone=${OWNER_PHONE}&text=${encodeURIComponent(
      msg
    )}`,
    "_blank"
  );

  isRequesting.value = false;
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/");
};
</script>

<style scoped>
.auth-container {
  font-family: "Cairo", sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #05050a;
  overflow: hidden;
  position: relative;
  direction: rtl;
  padding: 20px 0;
}
.bg-visuals {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  animation: drift 20s infinite alternate;
}
.blob-1 {
  width: 500px;
  height: 500px;
  background: #48bb78;
  top: -10%;
  left: -10%;
}
.blob-2 {
  width: 400px;
  height: 400px;
  background: #7840dc;
  bottom: -10%;
  right: -10%;
  animation-delay: -5s;
}
@keyframes drift {
  to {
    transform: translate(50px, 50px) scale(1.1);
  }
}

.wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 760px;
  padding: 20px;
}
.card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 32px;
  padding: 38px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.profile-header {
  text-align: center;
  margin-bottom: 28px;
}
.profile-header h2 {
  color: white;
  margin: 12px 0 4px;
  font-size: 22px;
}
.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}
.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 3px solid #f0c060;
  box-shadow: 0 0 22px rgba(240, 192, 96, 0.3);
  object-fit: cover;
  display: block;
}
.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  opacity: 0;
  transition: 0.3s;
  cursor: pointer;
}
.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}
.hidden-input {
  display: none;
}
.user-email {
  color: #a0aec0;
  font-size: 14px;
  margin: 0 0 8px;
}
.reg-date {
  display: inline-block;
  background: rgba(240, 192, 96, 0.1);
  border: 1px solid rgba(240, 192, 96, 0.2);
  color: #48bb78;
  font-size: 13px;
  padding: 4px 14px;
  border-radius: 20px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
@media (max-width: 600px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-group label {
  color: #a0aec0;
  font-size: 13px;
}
.field-input {
  width: 100%;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  color: white;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: 0.25s;
}
.field-input:focus {
  border-color: #48bb78;
}
.field-input:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.field-input::placeholder {
  color: #4a5568;
}
.pass-wrapper {
  position: relative;
}
.pass-wrapper .field-input {
  padding-left: 42px;
}
.toggle-pass {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

/* طلب الأدمن */
.admin-request-section {
  margin-bottom: 20px;
}
.request-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: rgba(120, 64, 220, 0.08);
  border: 1px solid rgba(120, 64, 220, 0.25);
  border-radius: 18px;
  padding: 16px 20px;
}
.request-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.request-icon {
  font-size: 26px;
}
.request-title {
  color: #b794f4;
  font-weight: 700;
  font-size: 15px;
  margin: 0 0 2px;
}
.request-sub {
  color: #718096;
  font-size: 12px;
  margin: 0;
}
.request-admin-btn {
  padding: 10px 20px;
  background: rgba(120, 64, 220, 0.2);
  border: 1px solid rgba(120, 64, 220, 0.4);
  border-radius: 12px;
  color: #b794f4;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.25s;
  white-space: nowrap;
}
.request-admin-btn:hover:not(:disabled) {
  background: rgba(120, 64, 220, 0.35);
}
.request-admin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pending-notice {
  text-align: center;
  padding: 14px;
  background: rgba(240, 192, 96, 0.08);
  border: 1px solid rgba(240, 192, 96, 0.2);
  border-radius: 14px;
  color: #48bb78;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}
.logout-btn,
.edit-btn,
.save-btn {
  flex: 1;
  padding: 13px;
  border: none;
  border-radius: 14px;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: 0.25s;
}
.logout-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #a0aec0;
}
.logout-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.09);
}
.edit-btn {
  background: rgba(120, 64, 220, 0.15);
  border: 1px solid rgba(120, 64, 220, 0.35);
  color: #b794f4;
}
.edit-btn:hover {
  background: rgba(120, 64, 220, 0.28);
}
.save-btn {
  background: linear-gradient(90deg, #48bb78, #17c55f);
  color: #1a1000;
}
.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(240, 192, 96, 0.4);
}
.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}
.spinner-lg {
  width: 46px;
  height: 46px;
  border: 4px solid rgba(240, 192, 96, 0.15);
  border-top-color: #48bb78;
  border-radius: 50%;
  animation: spin 0.85s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
