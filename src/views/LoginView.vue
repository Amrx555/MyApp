<template>
  <div class="auth-container">
    <div class="bg-visuals">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="loading-screen" v-if="screen === 'loading'">
      <div class="spinner-lg"></div>
    </div>

    <div class="wrapper" v-if="screen === 'form'">
      <div class="card">
        <div class="brand">
          <span class="brand-icon">⚡</span>
          <h1 class="brand-name">MyApp</h1>
        </div>

        <!-- تابس -->
        <div class="tabs">
          <button
            :class="['tab', mode === 'login' && 'active']"
            @click="
              mode = 'login';
              errorMsg = '';
            "
          >
            تسجيل الدخول
          </button>
          <button
            :class="['tab', mode === 'register' && 'active']"
            @click="
              mode = 'register';
              errorMsg = '';
            "
          >
            إنشاء حساب
          </button>
        </div>

        <!-- الحقول -->
        <div class="fields">
          <div class="field-group" v-if="mode === 'register'">
            <label>الاسم الكامل</label>
            <input
              v-model="form.name"
              type="text"
              class="field-input"
              placeholder="اسمك هنا"
            />
          </div>

          <div class="field-group">
            <label>البريد الإلكتروني</label>
            <input
              v-model="form.email"
              type="email"
              class="field-input"
              placeholder="example@email.com"
              @keyup.enter="submit"
            />
          </div>

          <div class="field-group">
            <label>كلمة المرور</label>
            <div class="pass-wrapper">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                class="field-input"
                placeholder="••••••••"
                @keyup.enter="submit"
              />
              <button
                class="toggle-pass"
                @click="showPass = !showPass"
                type="button"
              >
                {{ showPass ? "🙈" : "👁️" }}
              </button>
            </div>
          </div>

          <div class="field-group" v-if="mode === 'register'">
            <label>رقم الهاتف</label>
            <input
              v-model="form.phone"
              type="tel"
              class="field-input"
              placeholder="01xxxxxxxxx"
            />
          </div>
        </div>

        <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>
        <div class="success-msg" v-if="successMsg">{{ successMsg }}</div>

        <button class="submit-btn" @click="submit" :disabled="isLoading">
          {{
            isLoading
              ? "جاري التحقق..."
              : mode === "login"
              ? "دخول"
              : "إنشاء الحساب"
          }}
        </button>
      </div>
    </div>

    <!-- انتظار موافقة أدمن -->
    <div class="wrapper" v-if="screen === 'pending'">
      <div class="card center-card">
        <div class="big-icon">⏳</div>
        <h2>طلبك قيد المراجعة</h2>
        <p class="sub">انتظر موافقة الأدمن على صلاحياتك</p>
        <button class="logout-btn-sm" @click="doLogout">تسجيل الخروج</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

// ========= بيانات الأدمن الرئيسي =========
const OWNER_EMAIL = "amri69217@gmail.com";
// ==========================================

const router = useRouter();
const screen = ref("loading");
const mode = ref("login");
const isLoading = ref(false);
const showPass = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const form = reactive({ name: "", email: "", password: "", phone: "" });

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    await doRedirect(data.user);
  } else {
    screen.value = "form";
  }
});

const submit = async () => {
  errorMsg.value = "";
  successMsg.value = "";

  if (!form.email || !form.password) {
    errorMsg.value = "من فضلك أدخل الإيميل وكلمة المرور";
    return;
  }

  isLoading.value = true;

  if (mode.value === "login") {
    await doLogin();
  } else {
    await doRegister();
  }

  isLoading.value = false;
};

const doLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: form.email.trim(),
    password: form.password,
  });

  if (error || !data.user) {
    errorMsg.value = "بيانات غير صحيحة";
    return;
  }

  await doRedirect(data.user);
};

const doRegister = async () => {
  if (!form.name.trim()) {
    errorMsg.value = "من فضلك أدخل اسمك";
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: form.email.trim(),
    password: form.password,
  });

  if (error) {
    errorMsg.value = error.message;
    return;
  }

  if (data.user) {
    // حفظ البيانات في profiles
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: form.email.trim(),
      full_name: form.name.trim(),
      phone: form.phone.trim(),
      role: "user",
    });

    // تحديث الميتاداتا
    await supabase.auth.updateUser({
      data: { full_name: form.name.trim(), phone: form.phone.trim() },
    });

    successMsg.value = "تم إنشاء الحساب! يمكنك الدخول الآن.";
    mode.value = "login";
    form.password = "";
    form.name = "";
    form.phone = "";
  }
};

const doRedirect = async (user) => {
  // تحقق من الأدمن الرئيسي
  if (user.email === OWNER_EMAIL) {
    // تأكد إنه أدمن في الداتابيز
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        role: "admin",
      },
      { onConflict: "id", ignoreDuplicates: false }
    );
    router.push("/admin");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (role === "admin") {
    router.push("/admin");
  } else if (role === "pending_admin") {
    screen.value = "pending";
  } else {
    router.push("/home");
  }
};

const doLogout = async () => {
  await supabase.auth.signOut();
  screen.value = "form";
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
  position: relative;
  overflow: hidden;
  direction: rtl;
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
  animation: drift 18s infinite alternate;
}
.blob-1 {
  width: 550px;
  height: 550px;
  background: #48bb78;
  top: -15%;
  left: -10%;
}
.blob-2 {
  width: 450px;
  height: 450px;
  background: #7840dc;
  bottom: -15%;
  right: -10%;
  animation-delay: -5s;
}
@keyframes drift {
  to {
    transform: translate(60px, 60px) scale(1.12);
  }
}

.wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
  padding: 20px;
}
.card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 32px;
  padding: 42px 38px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}
.center-card {
  text-align: center;
}

/* براند */
.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 28px;
}
.brand-icon {
  font-size: 28px;
}
.brand-name {
  color: #48bb78;
  font-size: 26px;
  font-weight: 700;
  margin: 0;
}

/* تابس */
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  padding: 5px;
  margin-bottom: 24px;
}
.tab {
  padding: 10px;
  border: none;
  border-radius: 10px;
  color: #718096;
  font-family: "Cairo", sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  background: transparent;
  transition: 0.25s;
}
.tab.active {
  background: rgba(240, 192, 96, 0.15);
  color: #48bb78;
}

/* حقول */
.fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
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
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  color: white;
  font-family: "Cairo", sans-serif;
  font-size: 14px;
  outline: none;
  transition: 0.25s;
  box-sizing: border-box;
}
.field-input:focus {
  border-color: #48bb78;
  background: rgba(255, 255, 255, 0.09);
}
.field-input::placeholder {
  color: #4a5568;
}
.pass-wrapper {
  position: relative;
}
.pass-wrapper .field-input {
  padding-left: 44px;
}
.toggle-pass {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 17px;
}

/* رسائل */
.error-msg {
  background: rgba(252, 100, 100, 0.1);
  border: 1px solid rgba(252, 100, 100, 0.25);
  color: #fc8181;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 14px;
  text-align: center;
}
.success-msg {
  background: rgba(72, 187, 120, 0.1);
  border: 1px solid rgba(72, 187, 120, 0.25);
  color: #68d391;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 14px;
  text-align: center;
}

/* زر الإرسال */
.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #48bb78, #0dbd56);
  border: none;
  border-radius: 14px;
  color: #1a1000;
  font-family: "Cairo", sans-serif;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(240, 192, 96, 0.4);
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* شاشة انتظار */
.big-icon {
  font-size: 54px;
  margin-bottom: 14px;
}
.card h2 {
  color: white;
  margin: 0 0 8px;
  font-size: 22px;
}
.sub {
  color: #a0aec0;
  font-size: 14px;
  margin: 0 0 24px;
}
.logout-btn-sm {
  padding: 11px 28px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #a0aec0;
  font-family: "Cairo", sans-serif;
  cursor: pointer;
  transition: 0.2s;
}
.logout-btn-sm:hover {
  color: white;
}

/* لودنج */
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  position: relative;
  z-index: 10;
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
