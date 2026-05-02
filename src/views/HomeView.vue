<template>
  <div class="auth-container">
    <div class="bg-visuals">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>
    <main class="wrapper wide">
      <header class="hero-section card">
        <div class="hero-text">
          <h1>
            أهلاً بك
            <span class="highlight">{{ userName || "في منصتنا" }}</span>
          </h1>
          <p>
            أنت الآن في المكان الصحيح لإدارة بياناتك والتحكم في حسابك بأمان
            وسهولة.
          </p>
        </div>
      </header>

      <div class="features-grid">
        <div class="feature-card card">
          <div class="icon">🔒</div>
          <h3>أمان عالي</h3>
          <p>بياناتك مشفرة ومحمية بأحدث تقنيات Supabase.</p>
        </div>
        <div class="feature-card card">
          <div class="icon">⚡</div>
          <h3>سرعة فائقة</h3>
          <p>تجربة مستخدم سلسة بفضل استخدام Vue 3 و Vite.</p>
        </div>
        <div class="feature-card card" v-if="isAdmin">
          <div class="icon">🛠️</div>
          <h3>لوحة الإدارة</h3>
          <p>لديك صلاحيات الأدمن، يمكنك إدارة المستخدمين من هنا.</p>
          <router-link to="/admin" class="small-link"
            >انتقل للوحة الإدارة ←</router-link
          >
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";
const user = ref(null);
const userName = ref("");
const isAdmin = ref(false);

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    user.value = data.user;
    userName.value =
      data.user.user_metadata?.full_name || data.user.email.split("@")[0];

    // التحقق من الصلاحيات
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    isAdmin.value = profile?.role === "admin";
  }
});
</script>

<style scoped>
/* استيراد نفس أساسيات التصميم اللي في صفحة البروفايل لضمان التناسق */
.auth-container {
  font-family: "Cairo", sans-serif;
  min-height: 100vh;
  background: #05050a;
  color: white;
  direction: rtl;
  padding-top: 80px; /* لترك مساحة للـ Navbar الثابت */
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(5, 5, 10, 0.8);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 1000;
  display: flex;
  align-items: center;
}
.nav-content {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
}
.logo span {
  color: #48bb78;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}
.nav-item {
  color: #a0aec0;
  text-decoration: none;
  font-weight: 600;
  transition: 0.3s;
}
.nav-item:hover,
.nav-item.active {
  color: #48bb78;
}
.admin-link {
  color: #b794f4;
}

.nav-btn-logout,
.nav-btn-login {
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
}

/* Hero Section */
.hero-section {
  padding: 60px 40px;
  text-align: center;
  margin-bottom: 30px;
}
.hero-section h1 {
  font-size: 38px;
  margin-bottom: 15px;
}
.highlight {
  color: #48bb78;
}
.hero-section p {
  color: #a0aec0;
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto 30px;
}

.primary-btn {
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(90deg, #48bb78, #17c55f);
  color: #1a1000;
  text-decoration: none;
  border-radius: 15px;
  font-weight: 800;
  transition: 0.3s;
}
.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(72, 187, 120, 0.3);
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
.feature-card {
  padding: 30px;
  text-align: center;
  transition: 0.3s;
}
.feature-card:hover {
  border-color: rgba(72, 187, 120, 0.4);
}
.icon {
  font-size: 40px;
  margin-bottom: 15px;
}
.feature-card h3 {
  margin-bottom: 10px;
}
.feature-card p {
  color: #a0aec0;
  font-size: 14px;
  line-height: 1.6;
}
.small-link {
  color: #b794f4;
  text-decoration: none;
  font-size: 13px;
  display: block;
  margin-top: 15px;
}

/* Reuse styles from your profile page */
.bg-visuals {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
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
}
.card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 32px;
  position: relative;
  z-index: 10;
}
.wrapper {
  width: 90%;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
